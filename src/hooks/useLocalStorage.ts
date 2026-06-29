"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item));
    } catch {
      // keep initial value
    }
  }, [key]);

  function setValue(value: T | ((val: T) => T)) {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      // ignore
    }
  }

  function removeValue() {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }

  return [storedValue, setValue, removeValue] as const;
}
