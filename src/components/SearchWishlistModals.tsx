import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Search, Trash2, X } from 'lucide-react';
import type { Product, SizeOption } from '../types/store';
import { trackEvent } from '../lib/telemetry';

interface SearchModalProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

const SUGGESTED_TERMS = [
  'Linen Palazzo',
  'Mulmul Pajama',
  'Cigarette Pant',
  'Chikankari Kurti',
  'Pockets',
];

export const SearchModal: React.FC<SearchModalProps> = ({
  open,
  products,
  onClose,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 6);
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.highlights.fabric.toLowerCase().includes(q) ||
        p.highlights.color.toLowerCase().includes(q) ||
        p.highlights.pocket.toLowerCase().includes(q)
    );
  }, [query, products]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) return;
    const t = setTimeout(() => {
      if (results.length === 0) {
        trackEvent('search_zero_results', { label: q });
      } else {
        trackEvent('search_query', { label: q, value: results.length });
      }
    }, 450);
    return () => clearTimeout(t);
  }, [query, results.length]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search collection"
      className="fixed inset-0 z-50 flex items-end sm:items-start justify-center bg-black/40 p-0 sm:p-4 sm:pt-16 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ios-sheet-modal flex h-[86dvh] sm:h-auto sm:max-h-[78dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[26px] sm:rounded-2xl border border-[var(--line)] bg-[var(--bg)] shadow-2xl"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-[var(--line-strong)] sm:hidden" />

        <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3.5 mt-2 sm:mt-0">
          <Search className="h-4 w-4 text-[var(--ink-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            autoCorrect="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search palazzos, mulmul pajamas, trousers..."
            className="flex-1 bg-transparent text-base sm:text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="pressable flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--bg-warm)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="sheet-scroll safe-bottom-pad flex-1 p-5 space-y-5">
          {!query.trim() && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--ink-muted)]">Popular:</span>
              {SUGGESTED_TERMS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="pressable rounded-full border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-1.5 text-xs text-[var(--ink)]"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {results.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--ink-muted)]">
              No pieces matched “{query}”. Try searching for linen, mulmul, palazzo, or trouser.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {results.slice(0, 9).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectProduct(item);
                    onClose();
                  }}
                  className="no-callout group text-left"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[var(--bg-warm)]">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <p className="mt-2 truncate text-xs font-medium text-[var(--ink)]">
                    {item.title}
                  </p>
                  <p className="tabular-nums text-xs font-semibold text-[var(--ink-soft)]">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface WishlistDrawerProps {
  open: boolean;
  wishlistIds: string[];
  products: Product[];
  onClose: () => void;
  onRemoveWish: (product: Product) => void;
  onMoveToBag: (product: Product, size: SizeOption) => void;
  onOpenProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  open,
  wishlistIds,
  products,
  onClose,
  onRemoveWish,
  onMoveToBag,
  onOpenProduct,
}) => {
  if (!open) return null;

  const saved = wishlistIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Saved Pieces"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="drawer-right flex h-[100dvh] w-full sm:max-w-md flex-col bg-[var(--bg)] sm:border-l border-[var(--line)] shadow-2xl"
      >
        <div className="standalone-safe-top flex items-center justify-between border-b border-[var(--line)] px-5 sm:px-6 py-4">
          <h2 className="font-editorial text-2xl text-[var(--ink)]">
            Saved Pieces ({saved.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close saved pieces"
            className="pressable flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--bg-warm)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="sheet-scroll safe-bottom-pad flex-1 px-5 sm:px-6 py-5">
          {saved.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Heart className="mx-auto h-7 w-7 stroke-[1.4] text-[var(--ink-muted)]" />
              <p className="font-editorial text-2xl text-[var(--ink)]">Nothing saved yet</p>
              <p className="text-xs text-[var(--ink-muted)]">
                Tap the heart icon on any piece to keep a shortlist here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {saved.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenProduct(item);
                      onClose();
                    }}
                    className="shrink-0"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-24 w-[72px] rounded-lg object-cover object-top bg-[var(--bg-warm)]"
                    />
                  </button>
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenProduct(item);
                          onClose();
                        }}
                        className="truncate text-left text-[13.5px] font-medium text-[var(--ink)]"
                      >
                        {item.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveWish(item)}
                        aria-label="Remove from saved"
                        className="text-[var(--ink-muted)] hover:text-[var(--danger)] p-1.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="tabular-nums text-[13.5px] font-semibold text-[var(--ink)]">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      {(['S', 'M', 'L', 'XL'] as SizeOption[]).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => onMoveToBag(item, sz)}
                          className="pressable rounded-md border border-[var(--line-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--ink)] active:bg-[var(--ink)] active:text-[#FAF7F2]"
                        >
                          + {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
