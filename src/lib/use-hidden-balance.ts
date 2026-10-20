import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "granabank:hide-balance";
const listeners = new Set<() => void>();

function read(): boolean {
  // Storage can throw (private mode, blocked site data); default to showing the balance.
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener); // keep other open tabs in sync
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Whether the balance is hidden, remembered per device like most banking apps. */
export function useHiddenBalance() {
  const hidden = useSyncExternalStore(subscribe, read, () => false);

  const toggle = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, read() ? "0" : "1");
    } catch {
      // Without storage the toggle can't persist; nothing else to do.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [hidden, toggle] as const;
}
