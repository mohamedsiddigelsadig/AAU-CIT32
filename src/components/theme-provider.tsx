"use client";

import { createContext, useContext, useState } from "react";

interface ThemeCtx {
  dark: boolean;
  setDark: (v: boolean | ((prev: boolean) => boolean)) => void;
}

const ThemeContext = createContext<ThemeCtx>({ dark: false, setDark: () => {} });
export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always starts in light mode — no system-preference detection — so
  // every visitor sees the same default regardless of their device's
  // dark-mode setting. They can still switch manually from the menu.
  const [dark, setDark] = useState(false);

  return <ThemeContext.Provider value={{ dark, setDark }}>{children}</ThemeContext.Provider>;
}
