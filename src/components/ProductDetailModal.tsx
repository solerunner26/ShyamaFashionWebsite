import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Star,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react';
import type { Product, SizeOption } from '../types/store';
import { trackEvent } from '../lib/telemetry';

interface ProductDetailModalProps {
  product: Product | null;
  allProducts: Product[];
  wished: boolean;
  onClose: () => void;
  onToggleWish: (product: Product) => void;
  onAddToBag: (product: Product, size: SizeOption) => void;
  onSwitchProduct: (product: Product) => void;
}

const SIZE_TABLE_INCHES: Record<
  SizeOption,
  { waist: string; hip: string; inseam: string }
> = {
  XS: { waist: '25 – 26"', hip: '35 – 36"', inseam: '27.5"' },
  S: { waist: '27 – 28"', hip: '37 – 38"', inseam: '28.0"' },
  M: { waist: '29 – 30"', hip: '39 – 40"', inseam: '28.5"' },
  L: { waist: '31 – 33"', hip: '41 – 43"', inseam: '28.5"' },
  XL: { waist: '34 – 36"', hip: '44 – 46"', inseam: '29.0"' },
  XXL: { waist: '37 – 39"', hip: '47 – 49"', inseam: '29.0"' },
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts,
  wished,
  onClose,
  onToggleWish,
  onAddToBag,
  onSwitchProduct,
}) => {
  const [angleIdx, setAngleIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [sizePrompt, setSizePrompt] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);

  const openedAtRef = useRef<number>(Date.now());
  const sizeSwitchCountRef = useRef<number>(0);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);
  const sizeSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product) return;
    openedAtRef.current = Date.now();
    sizeSwitchCountRef.current = 0;
    setAngleIdx(0);
    setSelectedSize(null);
    setSizePrompt(false);
    setSizeGuideOpen(false);
    setZoomed(false);
    setPincodeResult(null);
    if (mobileGalleryRef.current) {
      mobileGalleryRef.current.scrollLeft = 0;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setAngleIdx((prev) => (prev + 1) % product.images.length);
      }
      if (e.key === 'ArrowLeft') {
        setAngleIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      const dwellSec = Math.round((Date.now() - openedAtRef.current) / 1000);
      if (dwellSec >= 2) {
        trackEvent('pdp_dwell', {
          productId: product.id,
          productTitle: product.title,
          category: product.category,
          value: dwellSec,
          label: `Inspected ${dwellSec}s`,
        });
      }
    };
  }, [product, onClose]);

  if (!product) return null;

  const discountPct = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const pairedProducts = product.pairWithIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const jumpToMobileAngle = (idx: number) => {
    setAngleIdx(idx);
    setZoomed(false);
    const track = mobileGalleryRef.current;
    if (track && track.clientWidth > 0) {
      track.scrollTo({ left: idx * track.clientWidth, behavior: 'smooth' });
    }
    trackEvent('angle_scrub', {
      productId: product.id,
      productTitle: product.title,
      value: idx + 1,
      label: product.angleLabels[idx] ?? `Angle ${idx + 1}`,
    });
  };

  const handleMobileGalleryScroll = () => {
    const track = mobileGalleryRef.current;
    if (!track || track.clientWidth === 0) return;
    const idx = Math.round(track.scrollLeft / track.clientWidth);
    if (idx !== angleIdx && idx >= 0 && idx < product.images.length) {
      setAngleIdx(idx);
      trackEvent('angle_scrub', {
        productId: product.id,
        productTitle: product.title,
        value: idx + 1,
      });
    }
  };

  const handleSizePick = (sz: SizeOption) => {
    setSelectedSize(sz);
    setSizePrompt(false);
    sizeSwitchCountRef.current += 1;
    trackEvent('size_select', {
      productId: product.id,
      productTitle: product.title,
      category: product.category,
      label: sz,
    });
    if (sizeSwitchCountRef.current >= 3) {
      trackEvent('size_hesitation', {
        productId: product.id,
        productTitle: product.title,
        value: sizeSwitchCountRef.current,
      });
    }
  };

  const handlePrimaryAdd = () => {
    if (!selectedSize) {
      setSizePrompt(true);
      sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      trackEvent('missing_size_attempt', {
        productId: product.id,
        productTitle: product.title,
        category: product.category,
      });
      return;
    }
    onAddToBag(product, selectedSize);
    onClose();
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setPincodeResult('Please enter a valid 6-digit Indian pincode.');
      return;
    }
    const prefix = pincode.trim().slice(0, 2);
    const fast = ['38', '39', '40', '41', '11', '56', '50', '60'].includes(prefix);
    const msg = fast
      ? 'Express dispatch from Surat — arrives in 2–3 days. UPI & COD available.'
      : 'Standard insured delivery in 4–5 days. Free doorstep size exchange.';
    setPincodeResult(msg);
    trackEvent('pincode_check', {
      productId: product.id,
      productTitle: product.title,
      label: pincode.trim(),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 p-0 sm:p-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ios-sheet-modal relative flex h-[93dvh] sm:h-auto sm:max-h-[93dvh] w-full max-w-[1140px] flex-col overflow-hidden rounded-t-[26px] sm:rounded-2xl bg-[var(--bg)] shadow-2xl border border-[var(--line)]"
      >
        {/* iOS Sheet Grabber Handle (Mobile) + Sticky Top Bar */}
        <div className="shrink-0 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-md px-5 pt-2.5 pb-3 sm:py-3.5">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[var(--line-strong)] sm:hidden" />
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-xs text-[var(--ink-muted)]">
              {product.category} <span className="mx-1.5">/</span>
              <span className="text-[var(--ink)] font-medium">{product.title}</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close product view"
              className="pressable flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
            >
              <X className="h-4 w-4 stroke-[1.7]" />
            </button>
          </div>
        </div>

        {/* Scrollable Sheet Content */}
        <div className="sheet-scroll flex-1">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 p-4 sm:p-8 lg:grid-cols-12">
            {/* LEFT: 5-Angle Human Model Gallery (7 cols) */}
            <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3">
              {/* 5 Angle Thumbnails */}
              <div className="flex sm:flex-col gap-2 overflow-x-auto no-scrollbar sm:w-20 shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => jumpToMobileAngle(idx)}
                    className={`pressable relative aspect-[3/4] w-[58px] sm:w-full shrink-0 overflow-hidden rounded-lg border transition-all ${
                      angleIdx === idx
                        ? 'border-[var(--ink)] ring-1 ring-[var(--ink)]'
                        : 'border-[var(--line)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={product.angleLabels[idx] ?? `View ${idx + 1}`}
                      className="h-full w-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>

              {/* Mobile Native Swipe Carousel + Desktop Zoomable Portrait */}
              <div className="no-callout relative flex-1 aspect-[3/4] overflow-hidden rounded-xl bg-[var(--bg-warm)]">
                {/* Mobile Touch Swipe Track */}
                <div
                  ref={mobileGalleryRef}
                  onScroll={handleMobileGalleryScroll}
                  className="snap-gallery h-full w-full sm:hidden"
                >
                  {product.images.map((img, idx) => (
                    <div key={idx} className="snap-slide h-full w-full">
                      <img
                        src={img}
                        alt={`${product.title} — ${product.angleLabels[idx] ?? ''}`}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  ))}
                </div>

                {/* Desktop Zoomable Single Frame */}
                <img
                  src={product.images[angleIdx]}
                  alt={`${product.title} — ${product.angleLabels[angleIdx] ?? ''}`}
                  onClick={() => setZoomed((z) => !z)}
                  className={`hidden sm:block h-full w-full object-cover object-top transition-transform duration-300 ${
                    zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                />

                <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#FAF7F2]/92 px-3 py-1 text-[11px] font-medium text-[var(--ink)] shadow-2xs">
                  {angleIdx + 1} / 5 · {product.angleLabels[angleIdx]}
                </div>

                <button
                  type="button"
                  onClick={() => setZoomed((z) => !z)}
                  aria-label="Zoom fabric detail"
                  className="pressable hidden sm:flex absolute right-3.5 top-3.5 h-8 w-8 items-center justify-center rounded-full bg-[#FAF7F2]/90 text-[var(--ink)] shadow-2xs"
                >
                  <ZoomIn className="h-4 w-4 stroke-[1.6]" />
                </button>

                <button
                  type="button"
                  aria-label="Previous angle"
                  onClick={() =>
                    jumpToMobileAngle(
                      (angleIdx - 1 + product.images.length) % product.images.length
                    )
                  }
                  className="pressable hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-[#FAF7F2]/90 text-[var(--ink)] shadow-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  aria-label="Next angle"
                  onClick={() => jumpToMobileAngle((angleIdx + 1) % product.images.length)}
                  className="pressable hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-[#FAF7F2]/90 text-[var(--ink)] shadow-xs"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* RIGHT: Purchase Details & Fit Guidance (5 cols) */}
            <div className="lg:col-span-5 space-y-6 pb-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    {product.highlights.fabric}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ink-soft)]">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {product.rating} ({product.reviewsCount})
                  </span>
                </div>

                <h2 className="font-editorial mt-1.5 text-[28px] sm:text-[34px] font-normal leading-tight text-[var(--ink)]">
                  {product.title}
                </h2>
                <p className="mt-1.5 text-[13.5px] text-[var(--ink-soft)]">{product.subtitle}</p>

                <div className="tabular-nums mt-4 flex items-baseline gap-2.5">
                  <span className="text-2xl font-semibold text-[var(--ink)]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-[var(--ink-muted)] line-through">
                    MRP ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  {discountPct > 0 && (
                    <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                      Save {discountPct}%
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11.5px] text-[var(--ink-muted)]">
                  Inclusive of all taxes · Automatic 10% off when you pick any 2 pieces
                </p>
              </div>

              {/* Size Picker + Waist Guide */}
              <div
                ref={sizeSectionRef}
                className="space-y-2.5 border-t border-[var(--line)] pt-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[var(--ink)]">
                    Select Size {selectedSize ? `— ${selectedSize}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSizeGuideOpen((o) => !o);
                      trackEvent('size_guide_open', {
                        productId: product.id,
                        productTitle: product.title,
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] underline underline-offset-4 py-1"
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    {sizeGuideOpen ? 'Hide Size Chart' : 'Size & Waist Guide'}
                  </button>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((sz) => {
                    const active = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSizePick(sz)}
                        className={`pressable h-11 rounded-lg border text-[13px] font-semibold transition-colors ${
                          active
                            ? 'border-[var(--ink)] bg-[var(--ink)] text-[#FAF7F2]'
                            : sizePrompt
                            ? 'border-[var(--danger)] bg-[var(--surface)] text-[var(--ink)]'
                            : 'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>

                {selectedSize && (
                  <p className="text-xs text-[var(--ink-soft)]">
                    Fits waist <strong>{SIZE_TABLE_INCHES[selectedSize].waist}</strong> · Hip{' '}
                    <strong>{SIZE_TABLE_INCHES[selectedSize].hip}</strong> · Soft back-elastic give
                  </p>
                )}

                {sizePrompt && (
                  <p className="text-xs font-medium text-[var(--danger)]">
                    Tap your size above to add this piece to your bag.
                  </p>
                )}

                {sizeGuideOpen && (
                  <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5 text-xs space-y-2">
                    <p className="font-medium text-[var(--ink)]">
                      Tap your usual waist in inches to select your size:
                    </p>
                    <table className="w-full text-left tabular-nums">
                      <thead>
                        <tr className="border-b border-[var(--line)] text-[var(--ink-muted)]">
                          <th className="py-1.5">Size</th>
                          <th className="py-1.5">Natural Waist</th>
                          <th className="py-1.5">Hip</th>
                          <th className="py-1.5">Inseam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)]">
                        {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as SizeOption[]).map((sz) => (
                          <tr
                            key={sz}
                            onClick={() => handleSizePick(sz)}
                            className={`cursor-pointer ${
                              selectedSize === sz ? 'bg-[var(--bg-warm)] font-semibold' : ''
                            }`}
                          >
                            <td className="py-2">{sz}</td>
                            <td className="py-2">{SIZE_TABLE_INCHES[sz].waist}</td>
                            <td className="py-2">{SIZE_TABLE_INCHES[sz].hip}</td>
                            <td className="py-2">{SIZE_TABLE_INCHES[sz].inseam}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Desktop Inline Add to Bag (Mobile has sticky thumb bar below!) */}
              <div className="hidden sm:flex gap-2.5">
                <button
                  type="button"
                  onClick={handlePrimaryAdd}
                  className="pressable btn-atelier flex-1 rounded-full py-4 text-[14px] font-medium"
                >
                  Add to Shopping Bag · ₹{product.price.toLocaleString('en-IN')}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleWish(product)}
                  aria-label="Save piece"
                  className="pressable flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)]"
                >
                  <Heart
                    className={`h-5 w-5 stroke-[1.6] ${
                      wished ? 'fill-[var(--accent)] text-[var(--accent)]' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Quiet Trust & Delivery Box */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-[var(--forest)] font-medium">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>In stock · Dispatches within 24h from our Surat studio</span>
                </div>

                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ink-muted)]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      enterKeyHint="done"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit pincode"
                      className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--bg)] py-2.5 pl-8 pr-3 text-sm text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="pressable rounded-lg border border-[var(--ink)] px-4 py-2 text-xs font-semibold text-[var(--ink)]"
                  >
                    Check
                  </button>
                </form>

                {pincodeResult && (
                  <p className="text-xs text-[var(--ink-soft)]">{pincodeResult}</p>
                )}

                <div className="grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-3 text-[11px] text-[var(--ink-soft)]">
                  <span className="inline-flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-[var(--ink)] shrink-0" /> Free ₹999+
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5 text-[var(--ink)] shrink-0" /> 7-Day Swap
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-[var(--ink)] shrink-0" /> UPI &amp; COD
                  </span>
                </div>
              </div>

              {/* Garment Details & Tailoring Notes */}
              <div className="border-t border-[var(--line)] pt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setSpecsOpen((s) => !s)}
                  className="flex w-full items-center justify-between text-[13px] font-semibold text-[var(--ink)] py-1"
                >
                  <span>Fabric, Fit &amp; Care Details</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${specsOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {specsOpen && (
                  <div className="space-y-3 text-[13px] leading-relaxed text-[var(--ink-soft)]">
                    <p>{product.description}</p>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-[var(--bg-warm)] p-3.5 text-xs">
                      <div>
                        <dt className="text-[var(--ink-muted)]">Fabric</dt>
                        <dd className="font-medium text-[var(--ink)]">
                          {product.highlights.fabric}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[var(--ink-muted)]">Pockets</dt>
                        <dd className="font-medium text-[var(--ink)]">
                          {product.highlights.pocket}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[var(--ink-muted)]">Waist &amp; Rise</dt>
                        <dd className="font-medium text-[var(--ink)]">{product.highlights.rise}</dd>
                      </div>
                      <div>
                        <dt className="text-[var(--ink-muted)]">Outseam Length</dt>
                        <dd className="font-medium text-[var(--ink)]">
                          {product.highlights.length}
                        </dd>
                      </div>
                    </dl>
                    <p className="text-xs text-[var(--ink-muted)]">
                      Care: {product.washCare.join(' · ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Complete the Look Cross-Sells */}
              {pairedProducts.length > 0 && (
                <div className="border-t border-[var(--line)] pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                    Pairs Effortlessly With
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {pairedProducts.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSwitchProduct(item)}
                        className="group text-left"
                      >
                        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-[var(--bg-warm)]">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                        <p className="mt-1.5 truncate text-[11.5px] font-medium text-[var(--ink)]">
                          {item.title}
                        </p>
                        <p className="tabular-nums text-[11px] text-[var(--ink-muted)]">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky iPhone Thumb-Zone Purchase Bar (Safe-Area Padded Above 34px Home Indicator) */}
        <div className="safe-bottom-pad flex sm:hidden items-center gap-2.5 border-t border-[var(--line)] bg-[var(--surface)]/96 backdrop-blur-md px-4 pt-3">
          <button
            type="button"
            onClick={() => onToggleWish(product)}
            aria-label="Save piece"
            className="pressable flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--ink)]"
          >
            <Heart
              className={`h-5 w-5 stroke-[1.6] ${
                wished ? 'fill-[var(--accent)] text-[var(--accent)]' : ''
              }`}
            />
          </button>
          <button
            type="button"
            onClick={handlePrimaryAdd}
            className="pressable btn-atelier flex-1 h-12 rounded-full text-[14px] font-medium tabular-nums"
          >
            {selectedSize
              ? `Add Size ${selectedSize} · ₹${product.price.toLocaleString('en-IN')}`
              : `Select Size · ₹${product.price.toLocaleString('en-IN')}`}
          </button>
        </div>
      </div>
    </div>
  );
};
