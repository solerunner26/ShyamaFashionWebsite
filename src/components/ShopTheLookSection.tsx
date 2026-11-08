import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { Product, SizeOption } from '../types/store';

interface ShopTheLookSectionProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onAddPairToBag: (items: Product[], size: SizeOption) => void;
}

export const ShopTheLookSection: React.FC<ShopTheLookSectionProps> = ({
  products,
  onOpenProduct,
  onAddPairToBag,
}) => {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, SizeOption>>({
    pair1: 'M',
    pair2: 'M',
  });

  const find = (id: string) => products.find((p) => p.id === id);

  const pairings = [
    {
      id: 'pair1',
      eyebrow: 'Pairing 01 · Morning to Festive',
      title: 'Ivory Chikankari & Terracotta Linen',
      note: 'Hand-embroidered pure mulmul kurta balanced with sunbaked pleated wide palazzos.',
      first: find('p23') ?? products[22],
      second: find('p01') ?? products[0],
    },
    {
      id: 'pair2',
      eyebrow: 'Pairing 02 · Workday Ease',
      title: 'Powder Blue Slub & Almond Cigarette Pant',
      note: 'Breathable slub cotton resham kurta paired with our bestselling ankle-graze pant.',
      first: find('p22') ?? products[21],
      second: find('p14') ?? products[13],
    },
  ].filter((p) => p.first && p.second);

  return (
    <section className="bg-[var(--bg-warm)] border-y border-[var(--line)] py-12 sm:py-20">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8">
        <div className="mb-8 sm:mb-10 max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            Curated Sets · Automatic 10% Wardrobe Privilege
          </p>
          <h2 className="font-editorial mt-2 text-3xl sm:text-4xl font-normal text-[var(--ink)]">
            Thoughtfully Paired Together
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            Skip the guesswork. Choose any two pieces across our collection and 10% comes off
            automatically in your shopping bag.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          {pairings.map((pair) => {
            const total = pair.first.price + pair.second.price;
            const privilegeTotal = Math.round(total * 0.9);
            const activeSize = selectedSizes[pair.id] ?? 'M';

            return (
              <div
                key={pair.id}
                className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-7"
              >
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                    {pair.eyebrow}
                  </p>
                  <h3 className="font-editorial mt-1 text-2xl sm:text-[28px] text-[var(--ink)]">
                    {pair.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] text-[var(--ink-soft)]">{pair.note}</p>

                  {/* Side-by-Side 2 Garment Cards */}
                  <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                    {[pair.first, pair.second].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onOpenProduct(item)}
                        className="no-callout group text-left"
                      >
                        <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-[var(--bg-warm)]">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            loading="lazy"
                            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                        <p className="mt-2 truncate text-[13px] font-medium text-[var(--ink)]">
                          {item.title}
                        </p>
                        <p className="tabular-nums text-xs text-[var(--ink-muted)]">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thumb-Friendly Size Selector + 1-Click Add Set */}
                <div className="mt-5 border-t border-[var(--line)] pt-4 space-y-3.5">
                  <div>
                    <span className="block text-xs font-medium text-[var(--ink-soft)] mb-2">
                      Select Set Size:
                    </span>
                    <div className="grid grid-cols-6 gap-1.5 sm:max-w-xs">
                      {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as SizeOption[]).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() =>
                            setSelectedSizes((prev) => ({ ...prev, [pair.id]: sz }))
                          }
                          className={`pressable h-10 rounded-lg border text-xs font-semibold ${
                            activeSize === sz
                              ? 'border-[var(--ink)] bg-[var(--ink)] text-[#FAF7F2]'
                              : 'border-[var(--line-strong)] bg-transparent text-[var(--ink)]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="tabular-nums">
                      <p className="text-[11px] text-[var(--forest)] font-medium inline-flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Includes 10% Set Privilege
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-[var(--ink)]">
                          ₹{privilegeTotal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-[var(--ink-muted)] line-through">
                          ₹{total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddPairToBag([pair.first, pair.second], activeSize)}
                      className="pressable btn-atelier min-h-[46px] w-full sm:w-auto rounded-full px-6 py-3 text-[13.5px] font-medium"
                    >
                      Add Complete Set ({activeSize})
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
