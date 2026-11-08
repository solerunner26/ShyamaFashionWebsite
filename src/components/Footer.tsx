import React from 'react';
import type { BrandConfig } from '../types/store';
import type { NavFilterGroup } from './Navbar';

interface FooterProps {
  brand: BrandConfig;
  onSelectNav: (group: NavFilterGroup) => void;
  onOpenStudio: () => void;
  onOpenTelemetry: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  brand,
  onSelectNav,
  onOpenStudio,
  onOpenTelemetry,
}) => {
  const jump = (group: NavFilterGroup) => {
    onSelectNav(group);
    document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg-warm)] text-[var(--ink)] pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <div className="mx-auto max-w-[1360px] px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid grid-cols-1 gap-9 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-3">
            <span className="font-editorial text-2xl uppercase tracking-[0.24em] text-[var(--ink)]">
              {brand.studioName}
            </span>
            <p className="text-[13px] leading-relaxed text-[var(--ink-soft)] max-w-sm">
              Small-batch women’s bottomwear and everyday kurtis cut in Surat from breathable
              linens, pure combed mulmul cottons, and matte satins.
            </p>
            <p className="text-xs text-[var(--ink-muted)] pt-1">
              WhatsApp Concierge: +{brand.whatsapp} · {brand.storeHours}
            </p>
          </div>

          {/* Collections */}
          <div className="lg:col-span-2 space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
              Silhouettes
            </h3>
            <ul className="space-y-2.5 text-[13px] text-[var(--ink-soft)]">
              <li>
                <button
                  type="button"
                  onClick={() => jump('Palazzo')}
                  className="hover:text-[var(--ink)]"
                >
                  Fluid Palazzos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jump('Pajama')}
                  className="hover:text-[var(--ink)]"
                >
                  Lounge Pajamas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jump('Pants & Trousers')}
                  className="hover:text-[var(--ink)]"
                >
                  Pants &amp; Trousers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jump('Leggings')}
                  className="hover:text-[var(--ink)]"
                >
                  Everyday Leggings
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jump('Kurtis & Dresses')}
                  className="hover:text-[var(--ink)]"
                >
                  Kurtis &amp; Sets
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="lg:col-span-3 space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
              Atelier Promises
            </h3>
            <ul className="space-y-2 text-[13px] text-[var(--ink-soft)]">
              <li>Complimentary shipping above ₹999</li>
              <li>Free 7-day doorstep size exchange</li>
              <li>Automatic 10% privilege on 2+ pieces</li>
              <li>UPI, Cards, NetBanking &amp; Cash on Delivery</li>
            </ul>
          </div>

          {/* Surat Atelier Address */}
          <div className="lg:col-span-3 space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
              Surat Atelier
            </h3>
            <address className="not-italic text-[13px] leading-relaxed text-[var(--ink-soft)]">
              {brand.addressLine1}
              <br />
              {brand.addressLine2}
              <br />
              {brand.cityStatePin}
            </address>
            <p className="text-xs text-[var(--ink-muted)]">
              {brand.phone} · {brand.supportEmail}
            </p>
          </div>
        </div>

        {/* Bottom Legal + Discreet Owner Backstage Links */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6 text-xs text-[var(--ink-muted)]">
          <p>
            © {new Date().getFullYear()} {brand.studioName} Atelier · GSTIN {brand.gstin}
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenStudio}
              className="py-1 hover:text-[var(--ink)] underline underline-offset-4"
            >
              Owner Studio Settings
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenTelemetry}
              className="py-1 hover:text-[var(--ink)] underline underline-offset-4"
            >
              Store Analytics
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
