export interface SavedAnalysis {
  id: string;
  date: string;          // ISO date
  year: number;
  month: number;
  day: number;
  name?: string;
  convergenceRate: number;
  archetype: string;
  elementHarmony: string;
}

const STORAGE_KEY = "destino_history";
const MAX_HISTORY = 10;

export function saveAnalysis(analysis: SavedAnalysis): void {
  const history = getHistory();
  // Remove duplicate if same birth date exists
  const filtered = history.filter(
    (h) => !(h.year === analysis.year && h.month === analysis.month && h.day === analysis.day)
  );
  // Add newest first, cap at MAX_HISTORY
  const updated = [analysis, ...filtered].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function getHistory(): SavedAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedAnalysis[];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
