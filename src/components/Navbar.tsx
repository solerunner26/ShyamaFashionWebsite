import React, { useState } from 'react';
import {
  Compass,
  Heart,
  LayoutGrid,
  Menu,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import type { BrandConfig, ProductCategory } from '../types/store';

export type NavFilterGroup =
  | 'All'
  | 'Palazzo'
  | 'Pajama'
  | 'Pants & Trousers'
  | 'Leggings'
  | 'Kurtis & Dresses';

interface NavbarProps {
  brand: BrandConfig;
  activeNav: NavFilterGroup;
  onSelectNav: (group: NavFilterGroup) => void;
  bagCount: number;
  wishlistCount: number;
  onOpenSearch: () => void;
  onOpenBag: () => void;
  onOpenWishlist: () => void;
}

const NAV_ITEMS: { id: NavFilterGroup; label: string }[] = [
  { id: 'All', label: 'Shop All' },
  { id: 'Palazzo', label: 'Palazzos' },
  { id: 'Pajama', label: 'Lounge Pajamas' },
  { id: 'Pants & Trousers', label: 'Pants & Trousers' },
  { id: 'Leggings', label: 'Leggings' },
  { id: 'Kurtis & Dresses', label: 'Kurtis & Sets' },
];

export function matchesNavGroup(category: ProductCategory, group: NavFilterGroup): boolean {
  if (group === 'All') return true;
  if (group === 'Pants & Trousers') return category === 'Woman Pants' || category === 'Trouser';
  if (group === 'Kurtis & Dresses') return category === 'Kurtis' || category === 'Dresses';
  return category === group;
}

export const Navbar: React.FC<NavbarProps> = ({
  brand,
  activeNav,
  onSelectNav,
  bagCount,
  wishlistCount,
  onOpenSearch,
  onOpenBag,
  onOpenWishlist,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'home' | 'wardrobe'>('home');

  const handleNavClick = (group: NavFilterGroup) => {
    onSelectNav(group);
    setMobileTab('wardrobe');
    setMobileMenuOpen(false);
    document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Seamless Warm Stone Promise Bar (Matches iOS light status bar cleanly) */}
      <div className="standalone-safe-top border-b border-[var(--line)] bg-[var(--bg-warm)] text-[var(--ink-soft)] px-4 py-2 text-center text-[11px] sm:text-[11.5px] tracking-wide">
        <p className="sm:hidden font-medium text-[var(--ink)]">
          Free shipping ₹999+ &nbsp;·&nbsp; 10% off 2+ pieces &nbsp;·&nbsp; 7-day free exchange
        </p>
        <p className="hidden sm:block mx-auto max-w-5xl">{brand.marqueePromo}</p>
      </div>

      {/* Main Sticky Minimalist Header */}
      <header className="atelier-header sticky top-0 z-40">
        <div className="mx-auto grid h-[60px] sm:h-[72px] max-w-[1360px] grid-cols-3 items-center px-4 sm:px-8">
          {/* Left: Mobile Menu Button (44px HIG target) + Desktop Navigation */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open collections menu"
              className="pressable -ml-2 flex h-11 w-11 items-center justify-center rounded-full lg:hidden text-[var(--ink)]"
            >
              <Menu className="h-[21px] w-[21px] stroke-[1.6]" />
            </button>

            <nav aria-label="Collections" className="hidden lg:flex items-center gap-6">
              {NAV_ITEMS.slice(0, 5).map((item) => {
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`relative py-1 text-[13px] transition-colors ${
                      active
                        ? 'font-semibold text-[var(--ink)]'
                        : 'font-normal text-[var(--ink-soft)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-0 -bottom-0.5 h-[1.5px] bg-[var(--ink)]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Center: Editorial Wordmark */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                onSelectNav('All');
                setMobileTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="pressable flex flex-col items-center text-center py-1"
            >
              {brand.logoMode === 'image' && brand.logoImageUrl ? (
                <img
                  src={brand.logoImageUrl}
                  alt={brand.studioName}
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              ) : (
                <>
                  <span className="font-editorial text-[23px] sm:text-[29px] font-medium uppercase tracking-[0.24em] sm:tracking-[0.26em] text-[var(--ink)] leading-none pl-[0.24em]">
                    {brand.studioName}
                  </span>
                  <span className="mt-1 hidden sm:block text-[9px] uppercase tracking-[0.28em] text-[var(--ink-muted)] pl-[0.28em]">
                    Surat Atelier
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Right: Kurtis Link (Desktop) + Search, Saved, Bag */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-2.5">
            <button
              type="button"
              onClick={() => handleNavClick('Kurtis & Dresses')}
              className={`hidden xl:inline-block mr-3 text-[13px] transition-colors ${
                activeNav === 'Kurtis & Dresses'
                  ? 'font-semibold text-[var(--ink)] underline underline-offset-8'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              Kurtis &amp; Sets
            </button>

            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search garments"
              className="pressable flex h-11 w-11 items-center justify-center rounded-full text-[var(--ink)] hover:bg-[var(--bg-warm)]"
            >
              <Search className="h-[19px] w-[19px] stroke-[1.6]" />
            </button>

            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label="Saved pieces"
              className="pressable relative hidden sm:flex h-11 w-11 items-center justify-center rounded-full text-[var(--ink)] hover:bg-[var(--bg-warm)]"
            >
              <Heart className="h-[19px] w-[19px] stroke-[1.6]" />
              {wishlistCount > 0 && (
                <span className="tabular-nums absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--bg-stone)] px-1 text-[10px] font-semibold text-[var(--ink)]">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenBag}
              aria-label="Open shopping bag"
              className="pressable flex h-10 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface)] px-3 sm:px-3.5 text-[13px] font-medium text-[var(--ink)]"
            >
              <ShoppingBag className="h-4 w-4 stroke-[1.7]" />
              <span className="hidden sm:inline">Bag</span>
              <span className="tabular-nums font-semibold">({bagCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Native iOS Frosted Bottom Tab Bar (Mobile & iPhone 12 Pro Max Safe-Area Aware) */}
      <nav
        aria-label="Mobile quick navigation"
        className="ios-tab-bar fixed inset-x-0 bottom-0 z-40 lg:hidden"
      >
        <div className="mx-auto grid h-[54px] max-w-md grid-cols-5 items-center px-2">
          <button
            type="button"
            onClick={() => {
              setMobileTab('home');
              onSelectNav('All');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`pressable flex flex-col items-center justify-center gap-0.5 py-1 ${
              mobileTab === 'home' ? 'text-[var(--ink)]' : 'text-[var(--ink-muted)]'
            }`}
          >
            <Compass className="h-[19px] w-[19px] stroke-[1.6]" />
            <span className="text-[10px] font-medium">Atelier</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileTab('wardrobe');
              document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`pressable flex flex-col items-center justify-center gap-0.5 py-1 ${
              mobileTab === 'wardrobe' ? 'text-[var(--ink)]' : 'text-[var(--ink-muted)]'
            }`}
          >
            <LayoutGrid className="h-[19px] w-[19px] stroke-[1.6]" />
            <span className="text-[10px] font-medium">Wardrobe</span>
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            className="pressable flex flex-col items-center justify-center gap-0.5 py-1 text-[var(--ink-muted)] active:text-[var(--ink)]"
          >
            <Search className="h-[19px] w-[19px] stroke-[1.6]" />
            <span className="text-[10px] font-medium">Search</span>
          </button>

          <button
            type="button"
            onClick={onOpenWishlist}
            className="pressable relative flex flex-col items-center justify-center gap-0.5 py-1 text-[var(--ink-muted)] active:text-[var(--ink)]"
          >
            <div className="relative">
              <Heart className="h-[19px] w-[19px] stroke-[1.6]" />
              {wishlistCount > 0 && (
                <span className="tabular-nums absolute -right-2.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Saved</span>
          </button>

          <button
            type="button"
            onClick={onOpenBag}
            className="pressable relative flex flex-col items-center justify-center gap-0.5 py-1 text-[var(--ink-muted)] active:text-[var(--ink)]"
          >
            <div className="relative">
              <ShoppingBag className="h-[19px] w-[19px] stroke-[1.6]" />
              {bagCount > 0 && (
                <span className="tabular-nums absolute -right-2.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--ink)] px-1 text-[9px] font-semibold text-[#FAF7F2]">
                  {bagCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Bag</span>
          </button>
        </div>
      </nav>

      {/* Clean Slide-Over Mobile Collections Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 flex bg-black/35 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="drawer-left sheet-scroll safe-bottom-pad standalone-safe-top flex h-[100dvh] w-[84vw] max-w-xs flex-col justify-between bg-[var(--bg)] p-6 shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <span className="font-editorial text-xl uppercase tracking-[0.22em]">
                  {brand.studioName}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="pressable flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--bg-warm)]"
                >
                  <X className="h-5 w-5 stroke-[1.5]" />
                </button>
              </div>

              <nav className="mt-4 flex flex-col divide-y divide-[var(--line)]">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`py-4 text-left text-[15.5px] ${
                      activeNav === item.id
                        ? 'font-semibold text-[var(--ink)]'
                        : 'text-[var(--ink-soft)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="border-t border-[var(--line)] pt-4 text-xs text-[var(--ink-muted)] space-y-1.5">
              <p className="font-medium text-[var(--ink)]">Complimentary 7-Day Size Exchange</p>
              <p>Dispatched directly from our Surat Atelier</p>
              <p>{brand.phone}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
