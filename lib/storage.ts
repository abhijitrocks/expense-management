
// A simple localStorage wrapper to handle JSON serialization and parsing.

export const storage = {
  getItem: <T,>(key: string): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return null;
    }
  },

  setItem: <T,>(key: string, value: T): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing to localStorage for key "${key}":`, error);
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        alert('Storage quota exceeded. Please clear some space or remove large receipts.');
      }
    }
  },

  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
    }
  },
};
