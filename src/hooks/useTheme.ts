import { useEffect, useState } from "react";
import { getDB } from "@/database/db";

export type Theme = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");

  useEffect(() => {
    const db = getDB();
    if (!db) return;
    (async () => {
      const t = await db.settings.get("theme");
      const f = await db.settings.get("fontSize");
      if (t) setThemeState(t.value as Theme);
      if (f) setFontSizeState(f.value as FontSize);
    })();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => {
      const isDark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const size = fontSize === "small" ? "14px" : fontSize === "large" ? "18px" : "16px";
    document.documentElement.style.setProperty("--fs-base", size);
  }, [fontSize]);

  const setTheme = async (t: Theme) => {
    setThemeState(t);
    const db = getDB();
    if (db) await db.settings.put({ key: "theme", value: t });
  };
  const setFontSize = async (s: FontSize) => {
    setFontSizeState(s);
    const db = getDB();
    if (db) await db.settings.put({ key: "fontSize", value: s });
  };

  return { theme, setTheme, fontSize, setFontSize };
}
