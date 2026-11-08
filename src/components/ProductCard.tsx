import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Plus, X } from 'lucide-react';
import type { Product, SizeOption } from '../types/store';

interface ProductCardProps {
  product: Product;
  wished: boolean;
  onToggleWish: (product: Product) => void;
  onOpenProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size: SizeOption) => void;
  onScrubAngle: (product: Product, angleIdx: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  wished,
  onToggleWish,
  onOpenProduct,
  onQuickAdd,
  onScrubAngle,
}) => {
  const [angleIdx, setAngleIdx] = useState(0);
  const [mobileSizesOpen, setMobileSizesOpen] = useState(false);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  const discountPct = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const stepAngle = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    const total = product.images.length;
    const next = (angleIdx + delta + total) % total;
    setAngleIdx(next);
    onScrubAngle(product, next);
  };

  const handleMobileScroll = () => {
    const el = mobileTrackRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== angleIdx && idx >= 0 && idx < product.images.length) {
      setAngleIdx(idx);
      onScrubAngle(product, idx);
    }
  };

  return (
    <article className="product-card-group flex flex-col">
      {/* 3:4 Portrait Garment Frame */}
      <div
        onMouseEnter={() => {
          if (angleIdx === 0 && product.images.length > 1) {
            setAngleIdx(1);
          }
        }}
        onMouseLeave={() => {
          setAngleIdx(0);
        }}
        className="product-photo-wrap no-callout relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[var(--bg-warm)] select-none"
      >
        {/* Mobile/Touch Native CoreAnimation Swipeable 5-Angle Track */}
        <div
          ref={mobileTrackRef}
          onScroll={handleMobileScroll}
          onClick={() => onOpenProduct(product)}
          className="snap-gallery h-full w-full sm:hidden cursor-pointer"
        >
          {product.images.map((img, idx) => (
            <div key={idx} className="snap-slide h-full w-full">
              <img
                src={img}
                alt={`${product.title} — ${product.angleLabels[idx] ?? `Angle ${idx + 1}`}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top"
              />
            </div>
          ))}
        </div>

        {/* Desktop Single Frame with Smooth Hover Angle Switch */}
        <div
          onClick={() => onOpenProduct(product)}
          className="hidden sm:block h-full w-full cursor-pointer"
        >
          <img
            src={product.images[angleIdx] ?? product.images[0]}
            alt={`${product.title} — ${product.angleLabels[angleIdx] ?? 'Studio view'}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-opacity duration-200"
          />
        </div>

        {/* Quiet Editorial Badge */}
        {product.badge && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 sm:left-3 sm:top-3 rounded-full bg-[#FAF7F2]/92 px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[10.5px] font-medium tracking-wide text-[var(--ink)] shadow-2xs">
            {product.badge}
          </span>
        )}

        {/* Save Heart (Generous touch target) */}
        <button
          type="button"
          aria-label={wished ? 'Remove from saved' : 'Save piece'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWish(product);
          }}
          className="pressable absolute right-2 top-2 sm:right-2.5 sm:top-2.5 flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#FAF7F2]/90 text-[var(--ink)] shadow-2xs"
        >
          <Heart
            className={`h-4 w-4 stroke-[1.6] ${
              wished ? 'fill-[var(--accent)] text-[var(--accent)]' : ''
            }`}
          />
        </button>

        {/* Desktop Left / Right 5-Angle Arrows */}
        <button
          type="button"
          aria-label="Previous model angle"
          onClick={(e) => stepAngle(e, -1)}
          className="quick-size-tray hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 items-center justify-center rounded-full bg-[#FAF7F2]/90 text-[var(--ink)] shadow-xs hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4 stroke-[1.7]" />
        </button>
        <button
          type="button"
          aria-label="Next model angle"
          onClick={(e) => stepAngle(e, 1)}
          className="quick-size-tray hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 items-center justify-center rounded-full bg-[#FAF7F2]/90 text-[var(--ink)] shadow-xs hover:bg-white"
        >
          <ChevronRight className="h-4 w-4 stroke-[1.7]" />
        </button>

        {/* Desktop Hover 1-Click Size Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="quick-size-tray hidden sm:block absolute inset-x-2.5 bottom-2.5 rounded-lg bg-[#FAF7F2]/95 backdrop-blur-md p-2 shadow-sm border border-[var(--line)]"
        >
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--ink-muted)]">
              Quick Add Size
            </span>
            <span className="tabular-nums text-[10px] text-[var(--ink-muted)]">
              View {angleIdx + 1}/5
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => onQuickAdd(product, sz)}
                className="pressable rounded py-1.5 text-[11px] font-semibold text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[#FAF7F2]"
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Thumb-Friendly 3×2 Quick-Add Size Popover */}
        <div onClick={(e) => e.stopPropagation()} className="sm:hidden">
          {!mobileSizesOpen ? (
            <button
              type="button"
              aria-label="Quick add size"
              onClick={() => setMobileSizesOpen(true)}
              className="pressable absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF7F2]/95 text-[var(--ink)] shadow-sm border border-[var(--line)]"
            >
              <Plus className="h-4 w-4 stroke-[1.9]" />
            </button>
          ) : (
            <div className="modal-gentle absolute inset-x-1.5 bottom-1.5 rounded-xl bg-[#FAF7F2]/97 backdrop-blur-md p-2.5 shadow-md border border-[var(--line)]">
              <div className="mb-1.5 flex items-center justify-between px-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                  Tap Size
                </span>
                <button
                  type="button"
                  onClick={() => setMobileSizesOpen(false)}
                  aria-label="Close quick size picker"
                  className="p-0.5 text-[var(--ink-muted)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      onQuickAdd(product, sz);
                      setMobileSizesOpen(false);
                    }}
                    className="pressable h-9 rounded-lg border border-[var(--line-strong)] bg-white text-xs font-semibold text-[var(--ink)] active:bg-[var(--ink)] active:text-[#FAF7F2]"
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live 5-Angle Swipe Indicator Dots on Mobile */}
        {!mobileSizesOpen && (
          <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-[#FAF7F2]/75 backdrop-blur-xs px-2 py-1 sm:hidden">
            {product.images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === angleIdx ? 'w-3 bg-[var(--ink)]' : 'w-1 bg-[var(--ink)]/35'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quiet Editorial Caption */}
      <div className="pt-2.5 sm:pt-3 space-y-1">
        <button
          type="button"
          onClick={() => onOpenProduct(product)}
          className="block text-left text-[13.5px] sm:text-[14.5px] font-medium leading-snug text-[var(--ink)] line-clamp-1"
        >
          {product.title}
        </button>

        <p className="text-[11.5px] sm:text-[12px] text-[var(--ink-muted)] line-clamp-1">
          {product.vibeTag}
        </p>

        <div className="tabular-nums flex flex-wrap items-baseline gap-1.5 sm:gap-2 pt-0.5">
          <span className="text-[14px] sm:text-[14.5px] font-semibold text-[var(--ink)]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span className="text-[11.5px] sm:text-xs text-[var(--ink-muted)] line-through">
            ₹{product.mrp.toLocaleString('en-IN')}
          </span>
          {discountPct > 0 && (
            <span className="text-[11px] sm:text-[11.5px] font-medium text-[var(--accent)]">
              ({discountPct}% off)
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
