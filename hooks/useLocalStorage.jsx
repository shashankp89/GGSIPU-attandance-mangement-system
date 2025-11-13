
import { useState, useEffect } from 'react';

function getStorageValue(key, defaultValue) {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    try {
      const initial = saved ? JSON.parse(saved) : defaultValue;
      return initial;
    } catch (e) {
      console.error("Failed to parse localStorage value, using default.", e);
      return defaultValue;
    }
  }
  return defaultValue;
}

const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to set localStorage value.", e);
    }
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
