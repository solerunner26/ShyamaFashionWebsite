import React, { useMemo } from 'react';
import { Download, Trash2, X } from 'lucide-react';
import type { TelemetryEvent } from '../types/store';
import { clearTelemetryEvents, computeDiagnostics } from '../lib/telemetry';

interface TelemetryModalProps {
  open: boolean;
  events: TelemetryEvent[];
  onClose: () => void;
}

export const TelemetryModal: React.FC<TelemetryModalProps> = ({ open, events, onClose }) => {
  const diagnostics = useMemo(() => computeDiagnostics(events), [events]);

  const funnel = useMemo(() => {
    const pdpViews = events.filter((e) => e.type === 'pdp_open').length;
    const angleScrubs = events.filter((e) => e.type === 'angle_scrub').length;
    const bagAdds = events.filter((e) => e.type === 'add_to_bag').length;
    const orders = events.filter(
      (e) => e.type === 'order_complete' || e.type === 'whatsapp_order_click'
    ).length;
    return { pdpViews, angleScrubs, bagAdds, orders };
  }, [events]);

  if (!open) return null;

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), diagnostics, events }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shyama-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Store Analytics"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-gentle flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-6 py-4">
          <div>
            <h2 className="font-editorial text-2xl text-[var(--ink)]">
              Owner Conversion &amp; Customer Insights
            </h2>
            <p className="text-xs text-[var(--ink-muted)]">
              Quietly recorded in the background so you can see what sells and fix friction
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportJson}
              className="pressable inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-3.5 py-1.5 text-xs font-medium"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              type="button"
              onClick={clearTelemetryEvents}
              title="Clear log"
              className="pressable flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--danger)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="tabular-nums grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Pieces Inspected', funnel.pdpViews],
              ['5-Angle Views', funnel.angleScrubs],
              ['Added to Bag', funnel.bagAdds],
              ['Orders / WhatsApp', funnel.orders],
            ].map(([label, count]) => (
              <div
                key={label as string}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"
              >
                <p className="text-xs text-[var(--ink-muted)]">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--ink)]">{count}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Actionable Storefront Recommendations
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {diagnostics.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[var(--ink)]">{d.title}</p>
                    <span className="tabular-nums text-[11px] text-[var(--ink-muted)]">
                      {d.metricCount} signal(s)
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ink-soft)]">{d.evidence}</p>
                  <p className="text-xs font-medium text-[var(--forest)]">{d.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Recent Shopper Activity ({events.length})
            </h3>
            <div className="max-h-60 overflow-y-auto divide-y divide-[var(--line)] rounded-xl border border-[var(--line)] bg-[var(--surface)]">
              {events.slice(0, 50).map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs"
                >
                  <span className="truncate text-[var(--ink)]">
                    <strong className="font-medium">{ev.type}</strong>
                    {ev.productTitle ? ` · ${ev.productTitle}` : ''}
                    {ev.label ? ` (${ev.label})` : ''}
                  </span>
                  <span className="tabular-nums shrink-0 text-[11px] text-[var(--ink-muted)]">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
