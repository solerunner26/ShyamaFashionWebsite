import React from 'react';
import type { BrandConfig } from '../types/store';

interface AtelierStorySectionProps {
  brand: BrandConfig;
}

export const AtelierStorySection: React.FC<AtelierStorySectionProps> = ({ brand }) => {
  return (
    <section className="mx-auto max-w-[1360px] px-4 py-16 sm:px-8 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[var(--bg-warm)]">
            <img
              src="/editorial/atelier-craft.jpg"
              alt="Breathable natural mulmul cotton loungewear crafted in Surat"
              loading="lazy"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            Our Craft Philosophy · Surat, Gujarat
          </p>

          <h2 className="font-editorial text-3xl sm:text-5xl font-normal leading-[1.12] text-[var(--ink)]">
            Why our bottomwear becomes the pair you reach for every morning.
          </h2>

          <p className="text-[15px] leading-[1.75] text-[var(--ink-soft)] max-w-2xl">
            At {brand.studioName}, we started with a simple frustration: women’s bottomwear was
            either stiff and unforgiving by noon, or flimsy without functional pockets. Working
            directly in Surat with small-batch weavers, we cut every palazzo, pajama, and trouser
            for real Indian weather and real 12-hour days.
          </p>

          <div className="grid grid-cols-1 gap-6 border-t border-[var(--line)] pt-7 sm:grid-cols-3">
            <div className="space-y-1.5">
              <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                01. Flat Front, Soft Back
              </h3>
              <p className="text-[13px] leading-relaxed text-[var(--ink-muted)]">
                Tailored flat front waistbands look crisp when tucked in, while concealed back
                elastic adapts gently through the day.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                02. Deep Everyday Pockets
              </h3>
              <p className="text-[13px] leading-relaxed text-[var(--ink-muted)]">
                Anchored into the waist seam so your phone and keys sit flat without pulling the
                silhouette down.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                03. Honest Atelier Pricing
              </h3>
              <p className="text-[13px] leading-relaxed text-[var(--ink-muted)]">
                Cut, finished, and shipped directly from our Surat studio — luxury-grade linens and
                mulmuls without retail middlemen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
