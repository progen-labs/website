// Light / dark theme shared by the landing page and Spectra. Follows the OS
// until the visitor picks one, then remembers the choice.
import { useEffect, useState } from 'react';

const THEME_KEY = 'pl_theme';
const QUERY = '(prefers-color-scheme: light)';

export function useTheme() {
  const [chosen, setChosen] = useState(() => {
    try {
      const v = window.localStorage.getItem(THEME_KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch {
      return null;
    }
  });
  const [system, setSystem] = useState(() => (typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches ? 'light' : 'dark'));
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return undefined;
    const on = () => setSystem(mq.matches ? 'light' : 'dark');
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  const theme = chosen || system;
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setChosen(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage blocked: the choice lasts for this visit */
    }
  };
  return [theme, toggle];
}

// shows the theme you would switch to
function ThemeIcon({ theme }) {
  return theme === 'dark' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8Z" />
    </svg>
  );
}

export function ThemeToggle({ theme, onToggle, className }) {
  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
    >
      <ThemeIcon theme={theme} />
    </button>
  );
}
