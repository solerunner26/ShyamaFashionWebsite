import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import type { BagItem, BrandConfig, Product, SizeOption } from '../types/store';
import { trackEvent } from '../lib/telemetry';

interface BagDrawerProps {
  open: boolean;
  brand: BrandConfig;
  bag: BagItem[];
  products: Product[];
  onUpdateQty: (productId: string, size: SizeOption, delta: number) => void;
  onRemoveItem: (productId: string, size: SizeOption) => void;
  onQuickAddCrossSell: (product: Product, size: SizeOption) => void;
  onCompleteOrder: (details: {
    customerName: string;
    phone: string;
    address: string;
    paymentMode: 'upi' | 'cod';
    finalAmount: number;
  }) => void;
  onClose: () => void;
}

export const BagDrawer: React.FC<BagDrawerProps> = ({
  open,
  brand,
  bag,
  products,
  onUpdateQty,
  onRemoveItem,
  onQuickAddCrossSell,
  onCompleteOrder,
  onClose,
}) => {
  const [step, setStep] = useState<'bag' | 'checkout' | 'done'>('bag');
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cod'>('upi');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderRef, setOrderRef] = useState('');

  const enriched = useMemo(() => {
    return bag
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean) as (BagItem & { product: Product })[];
  }, [bag, products]);

  if (!open) return null;

  const totalUnits = enriched.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = enriched.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const bundleDiscount = totalUnits >= 2 ? Math.round(subtotal * 0.1) : 0;
  const afterBundle = subtotal - bundleDiscount;
  const prepaidPrivilege = paymentMode === 'upi' && afterBundle >= 799 ? 75 : 0;
  const shipping = afterBundle >= brand.freeShippingThreshold || afterBundle === 0 ? 0 : 69;
  const finalAmount = Math.max(0, afterBundle - prepaidPrivilege + shipping);

  const crossSells = products
    .filter((p) => !bag.some((b) => b.productId === p.id))
    .slice(0, 3);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || phone.trim().length < 10 || !address.trim()) return;
    const ref = `SHY-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderRef(ref);
    onCompleteOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMode,
      finalAmount,
    });
    setStep('done');
  };

  const handleWhatsAppOrder = () => {
    const lines = enriched.map(
      (i) =>
        `• ${i.product.title} (Size ${i.size}) × ${i.quantity} — ₹${
          i.product.price * i.quantity
        }`
    );
    const text = encodeURIComponent(
      `Hello ${brand.studioName} Atelier,\nI would like to place an order:\n\n${lines.join(
        '\n'
      )}\n\nOrder Total: ₹${finalAmount.toLocaleString('en-IN')}\nPlease share payment / confirmation link.`
    );
    trackEvent('whatsapp_order_click', {
      value: finalAmount,
      label: `WhatsApp Concierge (${totalUnits} items)`,
    });
    window.open(`https://wa.me/${brand.whatsapp}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="drawer-right flex h-[100dvh] w-full sm:max-w-md flex-col bg-[var(--bg)] sm:border-l border-[var(--line)] shadow-2xl"
      >
        {/* Header (Respects iOS Standalone Notch) */}
        <div className="standalone-safe-top flex items-center justify-between border-b border-[var(--line)] px-5 sm:px-6 py-4">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('bag')}
                aria-label="Back to bag"
                className="pressable -ml-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--bg-warm)]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="font-editorial text-2xl font-normal text-[var(--ink)]">
              {step === 'checkout'
                ? 'Express Delivery Details'
                : step === 'done'
                ? 'Order Confirmed'
                : `Shopping Bag (${totalUnits})`}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setStep('bag');
              onClose();
            }}
            aria-label="Close bag"
            className="pressable flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--bg-warm)]"
          >
            <X className="h-4 w-4 stroke-[1.7]" />
          </button>
        </div>

        {/* Reward Tier Bar */}
        {enriched.length > 0 && step !== 'done' && (
          <div className="border-b border-[var(--line)] bg-[var(--bg-warm)] px-5 sm:px-6 py-2.5 text-xs">
            {totalUnits >= 2 ? (
              <p className="flex items-center gap-1.5 font-medium text-[var(--forest)]">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Complimentary shipping + 10% Wardrobe Privilege applied (Saved ₹
                  {bundleDiscount.toLocaleString('en-IN')})
                </span>
              </p>
            ) : afterBundle >= brand.freeShippingThreshold ? (
              <p className="text-[var(--ink-soft)]">
                <strong className="text-[var(--forest)]">Free shipping unlocked.</strong> Add 1
                more piece for an automatic 10% Wardrobe Privilege.
              </p>
            ) : (
              <p className="text-[var(--ink-soft)]">
                Add ₹{(brand.freeShippingThreshold - afterBundle).toLocaleString('en-IN')} more for
                complimentary shipping across India.
              </p>
            )}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="sheet-scroll flex-1 px-5 sm:px-6 py-5">
          {step === 'done' ? (
            <div className="py-10 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--forest-soft)] text-[var(--forest)]">
                <CheckCircle2 className="h-7 w-7 stroke-[1.7]" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Reference · {orderRef}
              </p>
              <h3 className="font-editorial text-3xl text-[var(--ink)]">
                Thank you, {customerName.split(' ')[0]}.
              </h3>
              <p className="text-sm leading-relaxed text-[var(--ink-soft)] max-w-xs mx-auto">
                Your pieces are being prepared at our Surat studio. We have registered your
                dispatch updates for <strong>{phone}</strong>.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('bag');
                    onClose();
                  }}
                  className="pressable btn-atelier min-h-[48px] rounded-full px-7 py-3 text-[13.5px] font-medium"
                >
                  Continue Exploring
                </button>
              </div>
            </div>
          ) : enriched.length === 0 ? (
            <div className="space-y-8 py-6">
              <div className="text-center space-y-2.5">
                <ShoppingBag className="mx-auto h-8 w-8 stroke-[1.3] text-[var(--ink-muted)]" />
                <h3 className="font-editorial text-2xl text-[var(--ink)]">
                  Your shopping bag is empty
                </h3>
                <p className="text-xs text-[var(--ink-muted)] max-w-xs mx-auto">
                  Explore our breathable palazzos, pure mulmul lounge pajamas, and everyday
                  trousers.
                </p>
              </div>

              <div className="space-y-3 border-t border-[var(--line)] pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                  Most Re-Ordered Essentials
                </p>
                {crossSells.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2.5"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-20 w-16 rounded-lg object-cover object-top shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[var(--ink)]">{p.title}</p>
                      <p className="text-[11.5px] text-[var(--ink-muted)]">{p.vibeTag}</p>
                      <p className="tabular-nums mt-1 text-[13px] font-semibold text-[var(--ink)]">
                        ₹{p.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onQuickAddCrossSell(p, 'M')}
                      className="pressable shrink-0 rounded-full border border-[var(--ink)] px-3.5 py-2 text-xs font-medium text-[var(--ink)] active:bg-[var(--ink)] active:text-[#FAF7F2]"
                    >
                      + Add (M)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : step === 'bag' ? (
            <div className="space-y-5">
              <div className="divide-y divide-[var(--line)]">
                {enriched.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-4 py-4 first:pt-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="h-24 w-[72px] shrink-0 rounded-lg object-cover object-top bg-[var(--bg-warm)]"
                    />
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="truncate text-[13.5px] font-medium text-[var(--ink)]">
                            {item.product.title}
                          </h4>
                          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">Size: {item.size}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.productId, item.size)}
                          aria-label="Remove item"
                          className="text-[var(--ink-muted)] hover:text-[var(--danger)] p-1.5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="inline-flex items-center rounded-full border border-[var(--line-strong)] bg-[var(--surface)]">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.productId, item.size, -1)}
                            aria-label="Decrease quantity"
                            className="px-3 py-1.5 text-[var(--ink)]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="tabular-nums px-2 text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.productId, item.size, 1)}
                            aria-label="Increase quantity"
                            className="px-3 py-1.5 text-[var(--ink)]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="tabular-nums text-[14px] font-semibold text-[var(--ink)]">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Mode Choice */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5 space-y-2">
                <p className="text-xs font-semibold text-[var(--ink)]">Payment Preference</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('upi')}
                    className={`pressable rounded-lg border p-2.5 text-left text-xs transition-colors ${
                      paymentMode === 'upi'
                        ? 'border-[var(--ink)] bg-[var(--bg-warm)] font-semibold'
                        : 'border-[var(--line)] text-[var(--ink-soft)]'
                    }`}
                  >
                    <div>UPI / Card</div>
                    <div className="text-[11px] text-[var(--forest)] font-medium">
                      ₹75 instant off
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('cod')}
                    className={`pressable rounded-lg border p-2.5 text-left text-xs transition-colors ${
                      paymentMode === 'cod'
                        ? 'border-[var(--ink)] bg-[var(--bg-warm)] font-semibold'
                        : 'border-[var(--line)] text-[var(--ink-soft)]'
                    }`}
                  >
                    <div>Cash on Delivery</div>
                    <div className="text-[11px] text-[var(--ink-muted)]">Pay at doorstep</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form id="atelier-checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  enterKeyHint="next"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ananya Desai"
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm focus:border-[var(--ink)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                  10-Digit Mobile / WhatsApp Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  enterKeyHint="next"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm focus:border-[var(--ink)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                  Complete Delivery Address &amp; Pincode
                </label>
                <textarea
                  rows={3}
                  required
                  autoComplete="street-address"
                  enterKeyHint="done"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Flat No., Street, Landmark, City & 6-digit Pincode"
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm focus:border-[var(--ink)] focus:outline-none"
                />
              </div>

              <p className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
                <ShieldCheck className="h-4 w-4 text-[var(--forest)] shrink-0" />
                Covered by our complimentary 7-day doorstep size exchange.
              </p>
            </form>
          )}
        </div>

        {/* Sticky Checkout Summary Footer (Clears 34px iPhone 12 Pro Max Home Indicator) */}
        {enriched.length > 0 && step !== 'done' && (
          <div className="safe-bottom-pad border-t border-[var(--line)] bg-[var(--surface)] px-5 sm:px-6 pt-4 space-y-3">
            <div className="tabular-nums space-y-1 text-xs text-[var(--ink-soft)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-[var(--forest)] font-medium">
                  <span>10% Wardrobe Privilege (2+ pieces)</span>
                  <span>−₹{bundleDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {prepaidPrivilege > 0 && (
                <div className="flex justify-between text-[var(--forest)] font-medium">
                  <span>UPI Prepaid Privilege</span>
                  <span>−₹{prepaidPrivilege}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Complimentary' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--line)] pt-2 text-[15px] font-semibold text-[var(--ink)]">
                <span>Total</span>
                <span>₹{finalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {step === 'bag' ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('checkout');
                    trackEvent('checkout_start', { value: finalAmount });
                  }}
                  className="pressable btn-atelier min-h-[48px] w-full rounded-full py-3.5 text-[14px] font-medium"
                >
                  Proceed to Checkout · ₹{finalAmount.toLocaleString('en-IN')}
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="pressable btn-outline-atelier flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-medium"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-[var(--forest)]" />
                  Order via WhatsApp Concierge
                </button>
              </div>
            ) : (
              <button
                type="submit"
                form="atelier-checkout-form"
                className="pressable btn-atelier min-h-[48px] w-full rounded-full py-3.5 text-[14px] font-medium"
              >
                {paymentMode === 'upi'
                  ? `Confirm UPI Order · ₹${finalAmount.toLocaleString('en-IN')}`
                  : `Place Cash on Delivery Order · ₹${finalAmount.toLocaleString('en-IN')}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
