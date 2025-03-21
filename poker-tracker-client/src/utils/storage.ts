/**
 * Helper to safely access localStorage (for SSR compatibility)
 * This prevents errors when code is executed in a non-browser environment
 */
export const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

/**
 * Helper to safely access sessionStorage (for SSR compatibility)
 */
export const getSessionStorage = () => {
  if (typeof window !== 'undefined') {
    return window.sessionStorage;
  }
  return null;
};

/**
 * Safe wrapper for localStorage.getItem
 */
export const getItem = (key: string): string | null => {
  const storage = getLocalStorage();
  return storage?.getItem(key) || null;
};

/**
 * Safe wrapper for localStorage.setItem
 */
export const setItem = (key: string, value: string): void => {
  const storage = getLocalStorage();
  storage?.setItem(key, value);
};

/**
 * Safe wrapper for localStorage.removeItem
 */
export const removeItem = (key: string): void => {
  const storage = getLocalStorage();
  storage?.removeItem(key);
};

/**
 * Safe wrapper for localStorage.clear
 */
export const clearStorage = (): void => {
  const storage = getLocalStorage();
  storage?.clear();
};
