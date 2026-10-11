import { useEffect, useRef } from 'react';

/** Tracks currently-pressed keys in a ref (no re-renders). */
export function useKeyboard() {
  const keys = useRef({});
  useEffect(() => {
    const down = e => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const up = e => {
      keys.current[e.key.toLowerCase()] = false;
    };
    const blur = () => (keys.current = {});
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);
  return keys;
}
