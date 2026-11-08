import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type {
  BagItem,
  BrandConfig,
  Product,
  ProductCategory,
  SizeOption,
  TelemetryEvent,
} from './types/store';
import { DEFAULT_BRAND_CONFIG } from './data/defaultBrand';
import { DEFAULT_PRODUCTS } from './data/defaultProducts';
import {
  loadTelemetryEvents,
  subscribeTelemetry,
  trackEvent,
} from './lib/telemetry';
import { matchesNavGroup, Navbar, type NavFilterGroup } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { ShopTheLookSection } from './components/ShopTheLookSection';
import { AtelierStorySection } from './components/AtelierStorySection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BagDrawer } from './components/BagDrawer';
import { SearchModal, WishlistDrawer } from './components/SearchWishlistModals';
import { TelemetryModal } from './components/TelemetryModal';
import { StudioManagerModal } from './components/StudioManagerModal';
import { Footer } from './components/Footer';

// Clean v2 storage keys so the fresh sunlit editorial catalog & brand config load cleanly
const BRAND_STORAGE_KEY = 'shyama_atelier_brand_v2';
const PRODUCTS_STORAGE_KEY = 'shyama_atelier_products_v2';
const BAG_STORAGE_KEY = 'shyama_atelier_bag_v2';
const WISH_STORAGE_KEY = 'shyama_atelier_wish_v2';

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const FILTER_TABS: { id: 'All' | ProductCategory; label: string }[] = [
  { id: 'All', label: 'All Pieces' },
  { id: 'Palazzo', label: 'Palazzos' },
  { id: 'Pajama', label: 'Lounge Pajamas' },
  { id: 'Woman Pants', label: 'Everyday Pants' },
  { id: 'Trouser', label: 'Tailored Trousers' },
  { id: 'Leggings', label: 'Leggings' },
  { id: 'Kurtis', label: 'Kurtis & Sets' },
  { id: 'Dresses', label: 'Dresses' },
];

export function App() {
  const [brand, setBrand] = useState<BrandConfig>(() =>
    readLocal(BRAND_STORAGE_KEY, DEFAULT_BRAND_CONFIG)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    readLocal(PRODUCTS_STORAGE_KEY, DEFAULT_PRODUCTS)
  );
  const [bag, setBag] = useState<BagItem[]>(() => readLocal(BAG_STORAGE_KEY, []));
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    readLocal(WISH_STORAGE_KEY, [])
  );

  const [activeNav, setActiveNav] = useState<NavFilterGroup>('All');
  const [subCategory, setSubCategory] = useState<'All' | ProductCategory>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'priceAsc' | 'priceDesc'>('featured');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>(() =>
    loadTelemetryEvents()
  );

  const scrollMilestonesRef = useRef<Set<number>>(new Set());

  // Lock background page scroll cleanly on iOS Safari when any sheet or drawer is open
  const anyOverlayOpen =
    Boolean(selectedProduct) ||
    bagOpen ||
    wishlistOpen ||
    searchOpen ||
    telemetryOpen ||
    studioOpen;

  useEffect(() => {
    if (!anyOverlayOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [anyOverlayOpen]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 2400);
  };

  // Apply subtle studio paper tone
  useEffect(() => {
    const root = document.documentElement;
    if (!brand.themePreset || brand.themePreset === 'alabaster') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', brand.themePreset);
    }
  }, [brand.themePreset]);

  useEffect(() => {
    localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bag));
  }, [bag]);

  useEffect(() => {
    localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Background shopper telemetry & Cmd+K search shortcut
  useEffect(() => {
    const unsub = subscribeTelemetry(setTelemetryEvents);
    trackEvent('session_start', { label: 'Storefront visit' });

    const onScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((window.scrollY / docHeight) * 100);
      for (const milestone of [25, 50, 75, 100]) {
        if (pct >= milestone && !scrollMilestonesRef.current.has(milestone)) {
          scrollMilestonesRef.current.add(milestone);
          trackEvent('scroll_depth', { value: milestone });
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      unsub();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleSelectNav = (group: NavFilterGroup) => {
    setActiveNav(group);
    if (group === 'All') setSubCategory('All');
    else if (group === 'Palazzo') setSubCategory('Palazzo');
    else if (group === 'Pajama') setSubCategory('Pajama');
    else if (group === 'Leggings') setSubCategory('Leggings');
    else setSubCategory('All');
    trackEvent('category_select', { category: group, label: group });
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      if (subCategory !== 'All') return p.category === subCategory;
      return matchesNavGroup(p.category, activeNav);
    });

    if (sortBy === 'priceAsc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'priceDesc') list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [products, activeNav, subCategory, sortBy]);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    trackEvent('pdp_open', {
      productId: product.id,
      productTitle: product.title,
      category: product.category,
    });
  };

  const handleAddToBag = (product: Product, size: SizeOption) => {
    setBag((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id && i.size === size);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [...prev, { productId: product.id, size, quantity: 1, addedAt: Date.now() }];
    });

    trackEvent('add_to_bag', {
      productId: product.id,
      productTitle: product.title,
      category: product.category,
      label: `Size ${size}`,
      value: product.price,
    });
    setBagOpen(true);
  };

  const handleAddPairToBag = (items: Product[], size: SizeOption) => {
    items.forEach((product) => {
      setBag((prev) => {
        const idx = prev.findIndex((i) => i.productId === product.id && i.size === size);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
          return copy;
        }
        return [...prev, { productId: product.id, size, quantity: 1, addedAt: Date.now() }];
      });
      trackEvent('add_to_bag', {
        productId: product.id,
        productTitle: product.title,
        category: product.category,
        label: `Set Size ${size}`,
        value: product.price,
      });
    });
    setBagOpen(true);
  };

  const handleToggleWish = (product: Product) => {
    const exists = wishlistIds.includes(product.id);
    setWishlistIds((prev) =>
      exists ? prev.filter((id) => id !== product.id) : [product.id, ...prev]
    );
    trackEvent('wishlist_toggle', {
      productId: product.id,
      productTitle: product.title,
      label: exists ? 'Removed' : 'Saved',
    });
    showToast(exists ? 'Removed from saved pieces' : 'Saved to your shortlist');
  };

  const handleSaveBrand = (next: BrandConfig) => {
    setBrand(next);
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(next));
    fetch('/api/studio-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand: next }),
    }).catch(() => {});
  };

  const handleSaveProduct = (updated: Product) => {
    const next = products.map((p) => (p.id === updated.id ? updated : p));
    setProducts(next);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(next));
  };

  const handleAddProduct = (created: Product) => {
    const next = [created, ...products];
    setProducts(next);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(next));
  };

  const handleBulkReplaceProducts = (items: Product[]) => {
    setProducts(items);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(items));
  };

  const handleResetDefaults = () => {
    setBrand(DEFAULT_BRAND_CONFIG);
    setProducts(DEFAULT_PRODUCTS);
    localStorage.removeItem(BRAND_STORAGE_KEY);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    showToast('Restored default atelier catalog.');
  };

  const bagCount = bag.reduce((s, b) => s + b.quantity, 0);

  return (
    <div className="min-h-[100svh] bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--ink)] selection:text-[#FAF7F2]">
      <Navbar
        brand={brand}
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        bagCount={bagCount}
        wishlistCount={wishlistIds.length}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenBag={() => setBagOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
      />

      <main>
        {/* Editorial Hero + 4 Silhouette Doorways */}
        <HeroSection
          brand={brand}
          heroProduct={products[0]}
          onSelectNav={handleSelectNav}
          onOpenProduct={handleOpenProduct}
        />

        {/* Primary Wardrobe Collection Grid */}
        <section
          id="collection-anchor"
          className="mx-auto max-w-[1360px] px-4 py-14 sm:px-8 sm:py-20 scroll-mt-20"
        >
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                5 Human-Model Angles Per Piece
              </p>
              <h2 className="font-editorial mt-1 text-3xl sm:text-4xl font-normal text-[var(--ink)]">
                {subCategory !== 'All'
                  ? subCategory
                  : activeNav === 'All'
                  ? 'The Everyday Wardrobe'
                  : activeNav}{' '}
                <span className="tabular-nums text-lg text-[var(--ink-muted)]">
                  ({filteredProducts.length})
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="sort-select" className="text-xs text-[var(--ink-muted)]">
                Sort by
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-full border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
              >
                <option value="featured">Atelier Featured</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Clean Category Filter Strip */}
          <div className="mb-8 flex gap-2 overflow-x-auto no-scrollbar border-b border-[var(--line)] pb-4">
            {FILTER_TABS.map((tab) => {
              const isSelected =
                tab.id === 'All'
                  ? activeNav === 'All' && subCategory === 'All'
                  : subCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveNav('All');
                    setSubCategory(tab.id);
                    trackEvent('category_select', { category: tab.id, label: tab.label });
                  }}
                  className={`pressable whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-[var(--ink)] text-[#FAF7F2]'
                      : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Airy 4-Column Product Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wished={wishlistIds.includes(product.id)}
                onToggleWish={handleToggleWish}
                onOpenProduct={handleOpenProduct}
                onQuickAdd={handleAddToBag}
                onScrubAngle={(p, idx) =>
                  trackEvent('angle_scrub', {
                    productId: p.id,
                    productTitle: p.title,
                    value: idx + 1,
                  })
                }
              />
            ))}
          </div>
        </section>

        {/* Two-Piece Curated Outfit Pairings */}
        <ShopTheLookSection
          products={products}
          onOpenProduct={handleOpenProduct}
          onAddPairToBag={handleAddPairToBag}
        />

        {/* Surat Atelier Craft & Fit Philosophy */}
        <AtelierStorySection brand={brand} />
      </main>

      <Footer
        brand={brand}
        onSelectNav={handleSelectNav}
        onOpenStudio={() => setStudioOpen(true)}
        onOpenTelemetry={() => setTelemetryOpen(true)}
      />

      {/* Sheets & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        allProducts={products}
        wished={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onToggleWish={handleToggleWish}
        onAddToBag={handleAddToBag}
        onSwitchProduct={handleOpenProduct}
      />

      <BagDrawer
        open={bagOpen}
        brand={brand}
        bag={bag}
        products={products}
        onUpdateQty={(pid, size, delta) => {
          setBag((prev) =>
            prev
              .map((item) =>
                item.productId === pid && item.size === size
                  ? { ...item, quantity: item.quantity + delta }
                  : item
              )
              .filter((item) => item.quantity > 0)
          );
        }}
        onRemoveItem={(pid, size) => {
          const prod = products.find((p) => p.id === pid);
          setBag((prev) => prev.filter((i) => !(i.productId === pid && i.size === size)));
          trackEvent('remove_from_bag', {
            productId: pid,
            productTitle: prod?.title,
            label: `Size ${size}`,
          });
        }}
        onQuickAddCrossSell={handleAddToBag}
        onCompleteOrder={(details) => {
          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...details, items: bag, createdAt: new Date().toISOString() }),
          }).catch(() => {});
          trackEvent('order_complete', {
            value: details.finalAmount,
            label: `${details.paymentMode.toUpperCase()} ₹${details.finalAmount}`,
          });
          setBag([]);
        }}
        onClose={() => setBagOpen(false)}
      />

      <SearchModal
        open={searchOpen}
        products={products}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={handleOpenProduct}
      />

      <WishlistDrawer
        open={wishlistOpen}
        wishlistIds={wishlistIds}
        products={products}
        onClose={() => setWishlistOpen(false)}
        onRemoveWish={handleToggleWish}
        onMoveToBag={(p, sz) => {
          handleAddToBag(p, sz);
          setWishlistIds((prev) => prev.filter((id) => id !== p.id));
        }}
        onOpenProduct={handleOpenProduct}
      />

      <TelemetryModal
        open={telemetryOpen}
        events={telemetryEvents}
        onClose={() => setTelemetryOpen(false)}
      />

      <StudioManagerModal
        open={studioOpen}
        brand={brand}
        products={products}
        onSaveBrand={handleSaveBrand}
        onSaveProduct={handleSaveProduct}
        onAddProduct={handleAddProduct}
        onBulkReplaceProducts={handleBulkReplaceProducts}
        onResetDefaults={handleResetDefaults}
        onClose={() => setStudioOpen(false)}
      />

      {/* Quiet Confirmation Pill (Clears iOS Bottom Tab Bar & Home Indicator) */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="modal-gentle fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-xs font-medium text-[#FAF7F2] shadow-lg"
        >
          <Check className="h-3.5 w-3.5" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default App;
