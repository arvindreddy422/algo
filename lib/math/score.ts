import type { DrillKind } from "@/lib/math/drills";

export const BEST_STORAGE_KEY = "math-drill-best";

export function bestId(kind: DrillKind, table: number | "mix") {
  if (kind === "tables" || kind === "fast") return table === "mix" ? `${kind}:mix` : `${kind}:${table}`;
  return kind;
}

const EMPTY_BESTS: Record<string, number> = {};
let bestsSnapshot: Record<string, number> | null = null;
const bestsListeners = new Set<() => void>();

export function subscribeBests(listener: () => void) {
  bestsListeners.add(listener);
  return () => {
    bestsListeners.delete(listener);
  };
}

export function getBestsSnapshot() {
  if (!bestsSnapshot) bestsSnapshot = loadBests();
  return bestsSnapshot;
}

export function getServerBestsSnapshot() {
  return EMPTY_BESTS;
}

export function now() {
  return Date.now();
}

export function saveBestTime(id: string, ms: number) {
  const current = getBestsSnapshot();
  const previous = current[id];
  if (previous != null && previous <= ms) return false;
  bestsSnapshot = { ...current, [id]: ms };
  storeBests(bestsSnapshot);
  for (const listener of bestsListeners) listener();
  return true;
}

export function loadBests(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BEST_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const bests: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) bests[key] = value;
    }
    return bests;
  } catch {
    return {};
  }
}

export function storeBests(bests: Record<string, number>) {
  window.localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(bests));
}

export function formatDrillTime(ms: number) {
  const total = Math.max(0, ms) / 1000;
  if (total < 60) return `${total.toFixed(1)}s`;
  const minutes = Math.floor(total / 60);
  const seconds = total - minutes * 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`;
}
