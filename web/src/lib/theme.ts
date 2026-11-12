export type Theme = "light" | "dark" | "system";
export const THEME_COOKIE = "yt_theme";

/** Runs before first paint (inline in <head>) so there is no flash of the wrong theme. */
export const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark|system)/);document.documentElement.dataset.theme=m?m[1]:"system";}catch(e){}})();`;

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function currentTheme(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}
