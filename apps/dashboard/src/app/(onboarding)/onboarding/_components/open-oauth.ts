import { POPUP_NAME } from "./model";

export function openOAuth(url: string): Window | null {
  if (typeof window === "undefined") return null;
  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  if (!desktop) {
    return window.open(url, "_blank", "noopener=no") ?? null;
  }
  const features = "width=720,height=820,menubar=no,toolbar=no,location=no";
  const win = window.open(url, POPUP_NAME, features);
  if (!win) {
    window.location.href = url;
    return null;
  }
  win.focus();
  return win;
}
