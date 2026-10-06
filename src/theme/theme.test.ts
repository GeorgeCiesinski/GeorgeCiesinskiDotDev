/**
 * Unit tests for theme preference storage and resolution helpers.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  getStoredPreference,
  getSystemTheme,
  resolveTheme,
} from "./theme";

type MatchMediaMock = {
  matches: boolean;
  media: string;
  onchange: null;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
};

/**
 * Builds a minimal `window.matchMedia` mock for theme tests.
 *
 * @param matches - Whether the queried media query currently matches.
 * @returns A `MediaQueryList`-like object.
 */
function createMatchMedia(matches: boolean): MatchMediaMock {
  return {
    matches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

describe("theme helpers", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();

    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    });

    const documentElement = {
      dataset: {} as Record<string, string>,
      style: { colorScheme: "" },
    };
    vi.stubGlobal("document", { documentElement });
    vi.stubGlobal("window", {
      matchMedia: vi.fn(() => createMatchMedia(false)),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reads system theme from matchMedia", () => {
    vi.mocked(window.matchMedia).mockReturnValue(
      createMatchMedia(true) as unknown as MediaQueryList,
    );
    expect(getSystemTheme()).toBe("dark");

    vi.mocked(window.matchMedia).mockReturnValue(
      createMatchMedia(false) as unknown as MediaQueryList,
    );
    expect(getSystemTheme()).toBe("light");
  });

  it("resolves explicit preferences without consulting the system", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("resolves system preference via getSystemTheme", () => {
    vi.mocked(window.matchMedia).mockReturnValue(
      createMatchMedia(true) as unknown as MediaQueryList,
    );
    expect(resolveTheme("system")).toBe("dark");
  });

  it("reads a valid stored preference and defaults to system", () => {
    expect(getStoredPreference()).toBe("system");

    store.set(THEME_STORAGE_KEY, "dark");
    expect(getStoredPreference()).toBe("dark");

    store.set(THEME_STORAGE_KEY, "not-a-theme");
    expect(getStoredPreference()).toBe("system");
  });

  it("applies resolved theme to the document root", () => {
    applyTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");

    applyTheme("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});
