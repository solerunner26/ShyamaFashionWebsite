import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { BrandConfig, Product } from '../types/store';
import type { NavFilterGroup } from './Navbar';

interface HeroSectionProps {
  brand: BrandConfig;
  heroProduct?: Product;
  onSelectNav: (group: NavFilterGroup) => void;
  onOpenProduct: (product: Product) => void;
}

const CATEGORY_DOORS: {
  group: NavFilterGroup;
  title: string;
  note: string;
  image: string;
}[] = [
  {
    group: 'Palazzo',
    title: 'Fluid Palazzos',
    note: 'Breathable weaves · Deep pockets',
    image: '/products/p01/angle-1.jpg',
  },
  {
    group: 'Pajama',
    title: 'Silk & Mulmul Lounge',
    note: 'Matte satin & combed cotton sets',
    image: '/products/p06/angle-1.jpg',
  },
  {
    group: 'Pants & Trousers',
    title: 'Pants & Trousers',
    note: 'Cigarette ankle cuts & wide suiting',
    image: '/products/p20/angle-1.jpg',
  },
  {
    group: 'Kurtis & Dresses',
    title: 'Kurtis & Sets',
    note: 'Handcrafted Chikankari & cotton-silk',
    image: '/products/p23/angle-1.jpg',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  brand,
  heroProduct,
  onSelectNav,
  onOpenProduct,
}) => {
  const jumpToCatalog = (group: NavFilterGroup) => {
    onSelectNav(group);
    document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="border-b border-[var(--line)]">
      <div className="mx-auto max-w-[1360px] px-4 py-5 sm:px-8 sm:py-10">
        <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Editorial Column */}
          <div className="order-2 lg:order-1 lg:col-span-5 space-y-5 sm:space-y-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              Collection 01 · Tailored in Surat
            </p>

            <h1 className="font-editorial text-[36px] sm:text-5xl lg:text-[56px] font-normal leading-[1.08] text-[var(--ink)]">
              {brand.heroHeadline}
            </h1>

            <p className="text-[14.5px] sm:text-[15px] leading-[1.68] text-[var(--ink-soft)] max-w-md">
              {brand.heroSubheadline}
            </p>

            {/* Full-width thumb-friendly stack on iPhone, inline on tablet/desktop */}
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <button
                type="button"
                onClick={() => jumpToCatalog('Palazzo')}
                className="pressable btn-atelier inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[14px] font-medium"
              >
                <span>Shop Bottomwear</span>
                <ArrowRight className="h-4 w-4 stroke-[1.7]" />
              </button>

              <button
                type="button"
                onClick={() => jumpToCatalog('All')}
                className="pressable btn-outline-atelier min-h-[48px] rounded-full px-6 py-3.5 text-[14px] font-medium"
              >
                Explore All 25 Pieces
              </button>
            </div>

            {/* Quiet Atelier Guarantees */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 border-t border-[var(--line)] pt-5 sm:pt-6 text-[11.5px] sm:text-xs">
              <div>
                <p className="font-semibold text-[var(--ink)]">Deep Pockets</p>
                <p className="mt-0.5 text-[var(--ink-muted)]">Phone-ready seams</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--ink)]">Natural Drape</p>
                <p className="mt-0.5 text-[var(--ink-muted)]">Linen &amp; mulmul</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--ink)]">7-Day Swap</p>
                <p className="mt-0.5 text-[var(--ink-muted)]">Free pickup</p>
              </div>
            </div>
          </div>

          {/* Right Sunlit Campaign Frame — 4:5 Portrait on iPhone 12 Pro Max, 16:10 on Desktop */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="no-callout relative overflow-hidden rounded-2xl bg-[var(--bg-warm)] aspect-[4/5] sm:aspect-[16/10]">
              <img
                src="/editorial/hero-atelier.jpg"
                alt="Woman wearing Sun-Pleated Terracotta Linen Palazzo in sunlit sandstone courtyard"
                fetchPriority="high"
                className="h-full w-full object-cover object-center"
              />

              {heroProduct && (
                <button
                  type="button"
                  onClick={() => onOpenProduct(heroProduct)}
                  className="pressable group absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-xs flex items-center justify-between gap-3 rounded-xl bg-[#FAF7F2]/94 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 text-left shadow-sm border border-white/60"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                      Pictured Here
                    </p>
                    <p className="truncate text-[13px] font-medium text-[var(--ink)]">
                      {heroProduct.title}
                    </p>
                    <p className="tabular-nums text-xs font-semibold text-[var(--ink-soft)]">
                      ₹{heroProduct.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[#FAF7F2] transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4 Calm Architectural Category Doorways */}
        <div className="mt-12 sm:mt-16">
          <div className="mb-4 sm:mb-5 flex items-baseline justify-between">
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-[var(--ink)]">
              Shop by Silhouette
            </h2>
            <button
              type="button"
              onClick={() => jumpToCatalog('All')}
              className="text-xs font-medium text-[var(--ink-soft)] underline underline-offset-4"
            >
              View full wardrobe
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
            {CATEGORY_DOORS.map((door) => (
              <button
                key={door.group}
                type="button"
                onClick={() => jumpToCatalog(door.group)}
                className="pressable no-callout group text-left"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[var(--bg-warm)]">
                  <img
                    src={door.image}
                    alt={door.title}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-2.5 flex items-baseline justify-between gap-1.5">
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] sm:text-[14.5px] font-semibold text-[var(--ink)]">
                      {door.title}
                    </h3>
                    <p className="mt-0.5 truncate text-[11.5px] sm:text-xs text-[var(--ink-muted)]">
                      {door.note}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--ink-muted)]" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
