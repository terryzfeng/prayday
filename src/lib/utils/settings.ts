export enum Theme {
  Light = "light",
  Dark = "dark",
  System = "system",
}

export interface UserSettings {
  theme: Theme;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: Theme.System,
};

/**
 * Validate and parse raw settings data from Firestore.
 * Falls back to defaults for missing or invalid values.
 * @param raw Unknown data from Firestore
 * @returns Validated UserSettings
 */
export function parseUserSettings(raw: unknown): UserSettings {
  if (raw && typeof raw === "object" && "theme" in raw) {
    const { theme } = raw as { theme: string };
    if (Object.values(Theme).includes(theme as Theme)) {
      return { theme: theme as Theme };
    }
  }
  return { ...DEFAULT_USER_SETTINGS };
}

//------------------------------------------------------------------------------
// Theme Application
//------------------------------------------------------------------------------

// Track the current system media query listener for cleanup
let systemThemeCleanup: (() => void) | null = null;

/**
 * Apply the theme to the document. Adds/removes Tailwind's "dark" class on
 * <html>. When theme is "system", registers a matchMedia listener so OS-level
 * changes are picked up live. Any previous listener is torn down first.
 * @param theme Theme to apply
 */
export function applyTheme(theme: Theme) {
  // Always tear down previous system listener
  if (systemThemeCleanup) {
    systemThemeCleanup();
    systemThemeCleanup = null;
  }

  if (theme === Theme.System) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    // Apply immediately
    setDarkClass(mql.matches);
    // Listen for future OS-level changes
    const handler = (e: MediaQueryListEvent) => setDarkClass(e.matches);
    mql.addEventListener("change", handler);
    systemThemeCleanup = () => mql.removeEventListener("change", handler);
  } else {
    setDarkClass(theme === Theme.Dark);
  }
}

function setDarkClass(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
