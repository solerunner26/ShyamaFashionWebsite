import type {
  FrictionDiagnostic,
  TelemetryEvent,
  TelemetryEventType,
} from '../types/store';

const STORAGE_KEY = 'shyama_telemetry_events_v1';
const SESSION_KEY = 'shyama_session_id_v1';

function getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = `sess_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return 'sess_local';
  }
}

function createBaselineEvents(): TelemetryEvent[] {
  const now = Date.now();
  return [
    {
      id: 'seed_1',
      sessionId: 'sess_surat01',
      timestamp: now - 1000 * 60 * 18,
      type: 'pdp_open',
      productId: 'p01',
      productTitle: 'Pleated Satin Wide-Leg Palazzo | Electric Magenta',
      category: 'Palazzo',
      deviceType: 'mobile',
      viewportWidth: 390,
    },
    {
      id: 'seed_2',
      sessionId: 'sess_surat01',
      timestamp: now - 1000 * 60 * 17,
      type: 'angle_scrub',
      productId: 'p01',
      productTitle: 'Pleated Satin Wide-Leg Palazzo | Electric Magenta',
      label: 'Angle 4: Knife-Pleat & Pocket Detail',
      value: 4,
      deviceType: 'mobile',
      viewportWidth: 390,
    },
    {
      id: 'seed_3',
      sessionId: 'sess_surat01',
      timestamp: now - 1000 * 60 * 16,
      type: 'size_hesitation',
      productId: 'p20',
      productTitle: 'Korean-Fit Double-Pleat Slouch Trouser | Sandstone Latte',
      category: 'Trouser',
      label: 'Toggled M -> L -> M before opening Size Chart',
      deviceType: 'mobile',
      viewportWidth: 390,
    },
    {
      id: 'seed_4',
      sessionId: 'sess_ahm02',
      timestamp: now - 1000 * 60 * 12,
      type: 'missing_size_attempt',
      productId: 'p11',
      productTitle: 'Oversized Parachute Utility Cargo Pant | Cyber Olive',
      category: 'Woman Pants',
      label: 'Tapped Add to Bag before choosing waist size',
      deviceType: 'mobile',
      viewportWidth: 412,
    },
    {
      id: 'seed_5',
      sessionId: 'sess_ahm02',
      timestamp: now - 1000 * 60 * 10,
      type: 'search_zero_results',
      label: 'sharara set',
      deviceType: 'mobile',
      viewportWidth: 412,
    },
    {
      id: 'seed_6',
      sessionId: 'sess_mum03',
      timestamp: now - 1000 * 60 * 7,
      type: 'pincode_check',
      productId: 'p01',
      label: '395007 (Surat — Next-Day Studio Dispatch)',
      deviceType: 'desktop',
      viewportWidth: 1440,
    },
    {
      id: 'seed_7',
      sessionId: 'sess_mum03',
      timestamp: now - 1000 * 60 * 6,
      type: 'add_to_bag',
      productId: 'p01',
      productTitle: 'Pleated Satin Wide-Leg Palazzo | Electric Magenta',
      category: 'Palazzo',
      label: 'Size M',
      value: 1299,
      deviceType: 'desktop',
      viewportWidth: 1440,
    },
    {
      id: 'seed_8',
      sessionId: 'sess_mum03',
      timestamp: now - 1000 * 60 * 5,
      type: 'add_to_bag',
      productId: 'p23',
      productTitle: 'Handcrafted Chikankari Mulmul Kurti | Sunlit Ivory',
      category: 'Kurtis',
      label: 'Size M (Paired Look)',
      value: 1299,
      deviceType: 'desktop',
      viewportWidth: 1440,
    },
  ];
}

type Listener = (events: TelemetryEvent[]) => void;
const listeners = new Set<Listener>();

export function loadTelemetryEvents(): TelemetryEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createBaselineEvents();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as TelemetryEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function notify(events: TelemetryEvent[]) {
  listeners.forEach((fn) => fn(events));
}

export function subscribeTelemetry(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function trackEvent(
  type: TelemetryEventType,
  payload: Omit<
    TelemetryEvent,
    'id' | 'sessionId' | 'timestamp' | 'type' | 'deviceType' | 'viewportWidth'
  > = {}
): TelemetryEvent {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const event: TelemetryEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    sessionId: getSessionId(),
    timestamp: Date.now(),
    type,
    deviceType: getDeviceType(width),
    viewportWidth: width,
    ...payload,
  };

  try {
    const current = loadTelemetryEvents();
    const updated = [event, ...current].slice(0, 600);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notify(updated);
  } catch {
    // ignore storage quota errors
  }

  // Non-blocking sync to backend runtime log
  if (typeof fetch !== 'undefined') {
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event }),
    }).catch(() => {});
  }

  return event;
}

export function clearTelemetryEvents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch {
    // ignore
  }
  notify([]);
  if (typeof fetch !== 'undefined') {
    fetch('/api/telemetry', { method: 'DELETE' }).catch(() => {});
  }
}

export function computeDiagnostics(events: TelemetryEvent[]): FrictionDiagnostic[] {
  const diagnostics: FrictionDiagnostic[] = [];

  // 1. Missing-size Add-to-Bag attempts + Size Hesitation
  const sizeFriction = events.filter(
    (e) => e.type === 'missing_size_attempt' || e.type === 'size_hesitation'
  );
  if (sizeFriction.length > 0) {
    const topProduct = sizeFriction[0]?.productTitle ?? 'Bottomwear styles';
    diagnostics.push({
      id: 'diag_size_hesitation',
      severity: 'high',
      title: 'Fit & Waist-Size Hesitation Detected on Bottomwear',
      evidence: `${sizeFriction.length} event(s) where shoppers toggled multiple waist sizes or tapped "Add to Bag" before picking a size (latest: ${topProduct}).`,
      recommendation:
        'Keep the Smart Fit Finder ("Enter Waist/Hip in Inches -> Instant Size") prominent above the fold and highlight "Elasticated Back Comfort Band" on wide trousers & palazzos.',
      affectedProductId: sizeFriction[0]?.productId,
      metricCount: sizeFriction.length,
    });
  }

  // 2. Zero-result search queries / dead filters
  const zeroSearches = events.filter(
    (e) => e.type === 'search_zero_results' || e.type === 'filter_zero_results'
  );
  if (zeroSearches.length > 0) {
    const terms = Array.from(
      new Set(zeroSearches.map((z) => z.label).filter(Boolean))
    ).slice(0, 3);
    diagnostics.push({
      id: 'diag_zero_search',
      severity: 'medium',
      title: 'Unmet Catalog Demand (Zero-Result Searches)',
      evidence: `${zeroSearches.length} search/filter attempt(s) returned 0 items. Requested terms: ${terms.map((t) => `"${t}"`).join(', ') || 'filtered combination'}.`,
      recommendation:
        'Add matching synonyms/tags in Studio Product Manager or introduce this silhouette (e.g., Sharara / Co-ord Bottoms) in your next Studio Drop.',
      metricCount: zeroSearches.length,
    });
  }

  // 3. Rage clicks
  const rageClicks = events.filter((e) => e.type === 'rage_click');
  if (rageClicks.length > 0) {
    diagnostics.push({
      id: 'diag_rage_click',
      severity: 'high',
      title: 'Rapid Repeated Tap (Rage-Click) Alert',
      evidence: `${rageClicks.length} rapid multi-click burst(s) recorded on "${rageClicks[0]?.label ?? 'UI surface'}".`,
      recommendation:
        'Inspect whether users expected that badge or banner to be interactive; ensure immediate tactile feedback within 130ms.',
      metricCount: rageClicks.length,
    });
  }

  // 4. Bag removals / abandon signals
  const removals = events.filter((e) => e.type === 'remove_from_bag');
  if (removals.length > 0) {
    diagnostics.push({
      id: 'diag_bag_removal',
      severity: 'medium',
      title: 'Bag Drop-Off / Price-Threshold Friction',
      evidence: `${removals.length} item(s) removed from My Bag (latest: ${removals[0]?.productTitle ?? 'item'}).`,
      recommendation:
        'Highlight the Auto Buy-2-Get-15% tier and Extra 5% Prepaid UPI savings inside the Bag drawer before shoppers remove second items.',
      affectedProductId: removals[0]?.productId,
      metricCount: removals.length,
    });
  }

  // 5. High-converting 5-Angle Discovery Insight
  const angleScrubs = events.filter(
    (e) => e.type === 'angle_scrub' || e.type === 'angle_compare_drag'
  );
  diagnostics.push({
    id: 'diag_angle_engagement',
    severity: 'opportunity',
    title: '5-Angle Model Gallery Drives Stickiness',
    evidence: `${angleScrubs.length} multi-angle scrubs & drape comparisons recorded. Shoppers who view 3+ angles convert significantly higher.`,
    recommendation:
      'When uploading real cloth shoots later, always include Angle 3 (Waistband/Back Rise) and Angle 4 (Pocket & Fabric Close-Up) for maximum bottomwear trust.',
    metricCount: angleScrubs.length,
  });

  return diagnostics;
}
