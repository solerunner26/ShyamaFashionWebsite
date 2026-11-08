import React, { useState } from 'react';
import { Check, Download, Plus, RotateCcw, Upload, X } from 'lucide-react';
import type {
  BrandConfig,
  Product,
  ProductCategory,
  ThemePresetId,
} from '../types/store';

interface StudioManagerModalProps {
  open: boolean;
  brand: BrandConfig;
  products: Product[];
  onSaveBrand: (next: BrandConfig) => void;
  onSaveProduct: (updated: Product) => void;
  onAddProduct: (created: Product) => void;
  onBulkReplaceProducts: (items: Product[]) => void;
  onResetDefaults: () => void;
  onClose: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Palazzo',
  'Pajama',
  'Woman Pants',
  'Leggings',
  'Trouser',
  'Kurtis',
  'Dresses',
];

export const StudioManagerModal: React.FC<StudioManagerModalProps> = ({
  open,
  brand,
  products,
  onSaveBrand,
  onSaveProduct,
  onAddProduct,
  onBulkReplaceProducts,
  onResetDefaults,
  onClose,
}) => {
  const [tab, setTab] = useState<'brand' | 'address' | 'products' | 'sync'>('brand');
  const [draftBrand, setDraftBrand] = useState<BrandConfig>(brand);
  const [selectedPid, setSelectedPid] = useState<string>(products[0]?.id ?? 'p01');
  const [syncUrl, setSyncUrl] = useState('/catalog/products.json');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  if (!open) return null;

  const activeProduct = products.find((p) => p.id === selectedPid) ?? products[0];

  const flashSaved = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 2400);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const next = { ...draftBrand, logoMode: 'image' as const, logoImageUrl: reader.result };
        setDraftBrand(next);
        onSaveBrand(next);
        flashSaved('Custom logo uploaded & applied live.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAngleFileUpload = (angleIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProduct) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const nextImages = [...activeProduct.images];
        nextImages[angleIdx] = reader.result;
        onSaveProduct({ ...activeProduct, images: nextImages });
        flashSaved(`Updated view ${angleIdx + 1} for ${activeProduct.title}.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateNewProduct = () => {
    const nextNum = products.length + 1;
    const id = `p${String(nextNum).padStart(2, '0')}`;
    const created: Product = {
      id,
      slug: `atelier-piece-${nextNum}`,
      title: `New Atelier Piece #${nextNum}`,
      subtitle: 'Breathable natural weave · Deep side pockets',
      category: 'Palazzo',
      isBottomwear: true,
      price: 1299,
      mrp: 2299,
      badge: 'New Arrival',
      vibeTag: 'Viscose-Linen · 2 Pockets',
      rating: 4.9,
      reviewsCount: 1,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      images: [
        '/products/p01/angle-1.jpg',
        '/products/p01/angle-2.jpg',
        '/products/p01/angle-3.jpg',
        '/products/p01/angle-4.jpg',
        '/products/p01/angle-5.jpg',
      ],
      angleLabels: [
        'Front Full Drape',
        'Walking Stride',
        'Back Waistband Fit',
        'Waist & Pocket Detail',
        'Hem & Movement',
      ],
      description: 'Tailored in our Surat studio for all-day breathable ease.',
      highlights: {
        styleId: `SHY-NEW-${100 + nextNum}`,
        color: 'Natural Shade',
        pattern: 'Solid',
        fabric: 'Spun Viscose-Linen',
        fit: 'Relaxed Wide Fit',
        rise: 'High Rise Soft Back Elastic',
        length: '39 in',
        occasion: 'Everyday & Work',
        pocket: '2 Deep Side Pockets',
      },
      washCare: ['Gentle cold wash', 'Dry in shade'],
      pairWithIds: ['p23', 'p22'],
    };
    onAddProduct(created);
    setSelectedPid(id);
    flashSaved(`Added ${created.title}.`);
  };

  const handleRemoteJsonSync = async () => {
    setSyncStatus('Loading catalog feed...');
    try {
      const res = await fetch(syncUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.products;
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error('JSON must contain a products array');
      }
      onBulkReplaceProducts(list as Product[]);
      setSyncStatus(`Synced ${list.length} pieces successfully.`);
      flashSaved(`Catalog updated (${list.length} pieces).`);
    } catch (err) {
      setSyncStatus(`Sync failed: ${err instanceof Error ? err.message : 'Invalid URL'}`);
    }
  };

  const exportCatalogJson = () => {
    const blob = new Blob([JSON.stringify({ brand: draftBrand, products }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shyama-catalog-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Owner Studio Settings"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-gentle flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg)] shadow-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-6 py-4">
          <div>
            <h2 className="font-editorial text-2xl text-[var(--ink)]">Owner Studio Backstage</h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Update brand name, logo, Surat address, pricing, or 5-angle product photos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCatalogJson}
              className="pressable inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-3.5 py-1.5 text-xs font-medium text-[var(--ink)]"
            >
              <Download className="h-3.5 w-3.5" /> Export JSON
            </button>
            <button
              type="button"
              onClick={onResetDefaults}
              title="Restore defaults"
              className="pressable flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--danger)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="pressable flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-[var(--line)] bg-[var(--bg-warm)] px-6 py-2.5 text-xs">
          {(
            [
              ['brand', 'Brand & Warmth'],
              ['address', 'Studio Address & WhatsApp'],
              ['products', `Products & 5-Angle Photos (${products.length})`],
              ['sync', 'JSON Link Sync'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`pressable whitespace-nowrap rounded-full px-4 py-1.5 font-medium ${
                tab === id
                  ? 'bg-[var(--ink)] text-[#FAF7F2]'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {savedBanner && (
          <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--forest-soft)] px-6 py-2 text-xs font-medium text-[var(--forest)]">
            <Check className="h-4 w-4" /> {savedBanner}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {tab === 'brand' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium mb-1">Brand Wordmark</label>
                <input
                  type="text"
                  value={draftBrand.studioName}
                  onChange={(e) => setDraftBrand({ ...draftBrand, studioName: e.target.value })}
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Top Promise Bar</label>
                <input
                  type="text"
                  value={draftBrand.marqueePromo}
                  onChange={(e) => setDraftBrand({ ...draftBrand, marqueePromo: e.target.value })}
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Hero Editorial Headline</label>
                <input
                  type="text"
                  value={draftBrand.heroHeadline}
                  onChange={(e) => setDraftBrand({ ...draftBrand, heroHeadline: e.target.value })}
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">
                  Optional Logo Image URL or Upload (leave empty for Editorial Serif Wordmark)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draftBrand.logoImageUrl}
                    onChange={(e) =>
                      setDraftBrand({
                        ...draftBrand,
                        logoMode: e.target.value ? 'image' : 'monogram',
                        logoImageUrl: e.target.value,
                      })
                    }
                    placeholder="https://.../logo.png"
                    className="flex-1 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm"
                  />
                  <label className="pressable inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-xs font-medium">
                    <Upload className="h-3.5 w-3.5" /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-2">Atelier Paper Tone</label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(
                    [
                      ['alabaster', 'Sunlit Alabaster', '#FAF7F2', '#8C4A32'],
                      ['sandstone', 'Warm Sandstone', '#F7F3EC', '#7C4D34'],
                      ['sage-linen', 'Botanical Linen', '#F8F9F6', '#355846'],
                      ['rose-clay', 'Soft Rose Clay', '#FBF7F6', '#8B434B'],
                    ] as [ThemePresetId, string, string, string][]
                  ).map(([id, label, bgHex, accHex]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setDraftBrand({ ...draftBrand, themePreset: id })}
                      className={`rounded-xl border p-3 text-left text-xs ${
                        draftBrand.themePreset === id
                          ? 'border-[var(--ink)] ring-1 ring-[var(--ink)]'
                          : 'border-[var(--line)]'
                      }`}
                      style={{ backgroundColor: bgHex }}
                    >
                      <span
                        className="mb-2 block h-3 w-8 rounded-full"
                        style={{ backgroundColor: accHex }}
                      />
                      <span className="font-medium text-[var(--ink)]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onSaveBrand(draftBrand);
                    flashSaved('Brand & paper tone saved.');
                  }}
                  className="pressable btn-atelier rounded-full px-6 py-2.5 text-xs font-medium"
                >
                  Save Brand Settings
                </button>
              </div>
            </div>
          )}

          {tab === 'address' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={draftBrand.addressLine1}
                  onChange={(e) => setDraftBrand({ ...draftBrand, addressLine1: e.target.value })}
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={draftBrand.addressLine2}
                  onChange={(e) => setDraftBrand({ ...draftBrand, addressLine2: e.target.value })}
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">City, State &amp; Pincode</label>
                <input
                  type="text"
                  value={draftBrand.cityStatePin}
                  onChange={(e) => setDraftBrand({ ...draftBrand, cityStatePin: e.target.value })}
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  WhatsApp Concierge Number (with 91)
                </label>
                <input
                  type="text"
                  value={draftBrand.whatsapp}
                  onChange={(e) => setDraftBrand({ ...draftBrand, whatsapp: e.target.value })}
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={draftBrand.phone}
                  onChange={(e) => setDraftBrand({ ...draftBrand, phone: e.target.value })}
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Support Email</label>
                <input
                  type="email"
                  value={draftBrand.supportEmail}
                  onChange={(e) => setDraftBrand({ ...draftBrand, supportEmail: e.target.value })}
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onSaveBrand(draftBrand);
                    flashSaved('Studio address & contact info saved.');
                  }}
                  className="pressable btn-atelier rounded-full px-6 py-2.5 text-xs font-medium"
                >
                  Save Studio Contact Details
                </button>
              </div>
            </div>
          )}

          {tab === 'products' && activeProduct && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedPid}
                  onChange={(e) => setSelectedPid(e.target.value)}
                  className="flex-1 min-w-60 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id.toUpperCase()} — {p.title} (₹{p.price})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleCreateNewProduct}
                  className="pressable btn-atelier inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium"
                >
                  <Plus className="h-3.5 w-3.5" /> New Piece
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={activeProduct.title}
                    onChange={(e) => onSaveProduct({ ...activeProduct, title: e.target.value })}
                    className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Category</label>
                  <select
                    value={activeProduct.category}
                    onChange={(e) => {
                      const cat = e.target.value as ProductCategory;
                      onSaveProduct({
                        ...activeProduct,
                        category: cat,
                        isBottomwear: !['Kurtis', 'Dresses'].includes(cat),
                      });
                    }}
                    className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={activeProduct.price}
                    onChange={(e) =>
                      onSaveProduct({
                        ...activeProduct,
                        price: Math.max(99, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 space-y-2"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-[var(--bg-warm)]">
                      <img
                        src={activeProduct.images[idx]}
                        alt=""
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    <input
                      type="text"
                      value={activeProduct.images[idx] ?? ''}
                      onChange={(e) => {
                        const next = [...activeProduct.images];
                        next[idx] = e.target.value;
                        onSaveProduct({ ...activeProduct, images: next });
                      }}
                      className="w-full rounded border border-[var(--line)] px-2 py-1 text-[11px]"
                    />
                    <label className="pressable flex cursor-pointer items-center justify-center gap-1 rounded border border-[var(--line-strong)] py-1 text-[11px] font-medium">
                      <Upload className="h-3 w-3" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAngleFileUpload(idx, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'sync' && (
            <div className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <h3 className="text-sm font-semibold text-[var(--ink)]">
                Sync Products &amp; 5-Angle Photos from Hosted JSON Feed
              </h3>
              <p className="text-xs text-[var(--ink-muted)]">
                Paste any hosted JSON URL (or test with <code>/catalog/products.json</code>) to
                update your entire catalog at once.
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={syncUrl}
                  onChange={(e) => setSyncUrl(e.target.value)}
                  className="flex-1 min-w-60 rounded-lg border border-[var(--line-strong)] bg-[var(--bg)] px-3.5 py-2 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={handleRemoteJsonSync}
                  className="pressable btn-atelier rounded-full px-5 py-2 text-xs font-medium"
                >
                  Sync Catalog
                </button>
              </div>
              {syncStatus && <p className="text-xs font-medium text-[var(--forest)]">{syncStatus}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
