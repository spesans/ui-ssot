import { UI_NAVIGATION_STATE_KEY } from "@/lib/storage-keys";

const UI_NAVIGATION_STATE_TTL_MS = 10_000;

export type UiNavigationState = {
  sidebarOpen: boolean;
  scrollX: number;
  scrollY: number;
  createdAt: number;
};

export const readUiNavigationState = (): UiNavigationState | null => {
  if (typeof window === "undefined") return null;

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

  try {
    const raw = window.sessionStorage.getItem(UI_NAVIGATION_STATE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (typeof parsed.createdAt !== "number") return null;

    if (Date.now() - parsed.createdAt > UI_NAVIGATION_STATE_TTL_MS) {
      window.sessionStorage.removeItem(UI_NAVIGATION_STATE_KEY);
      return null;
    }

    if (
      typeof parsed.sidebarOpen !== "boolean" ||
      typeof parsed.scrollX !== "number" ||
      typeof parsed.scrollY !== "number"
    ) {
      window.sessionStorage.removeItem(UI_NAVIGATION_STATE_KEY);
      return null;
    }

    return {
      sidebarOpen: parsed.sidebarOpen,
      scrollX: parsed.scrollX,
      scrollY: parsed.scrollY,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
};

export const writeUiNavigationState = (state: Omit<UiNavigationState, "createdAt">) => {
  if (typeof window === "undefined") return;
  try {
    const payload: UiNavigationState = { ...state, createdAt: Date.now() };
    window.sessionStorage.setItem(UI_NAVIGATION_STATE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
};

export const clearUiNavigationState = () => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(UI_NAVIGATION_STATE_KEY);
  } catch {
    // ignore
  }
};
