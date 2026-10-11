const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12.5h3.4l2.5-7 4 13 2.6-6 1.6 3h5.4"
        stroke="url(#lg)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="lg" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c7cff" />
          <stop offset="0.5" stopColor="#36d6ff" />
          <stop offset="1" stopColor="#ff6ad5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Glyph({ name }) {
  switch (name) {
    case 'heart':
      return (
        <svg {...base} aria-hidden="true">
          <path d="M12 20s-7-4.4-9.3-8.1C1 9 2.2 5.5 5.5 5.5c2 0 3.2 1.2 3.5 2 .3-.8 1.5-2 3.5-2 3.3 0 4.5 3.5 2.8 6.4C19 15.6 12 20 12 20Z" />
        </svg>
      );
    case 'code':
      return (
        <svg {...base} aria-hidden="true">
          <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />
        </svg>
      );
    case 'infinity':
      return (
        <svg {...base} aria-hidden="true">
          <path d="M6.5 9C4.6 9 3 10.3 3 12s1.6 3 3.5 3c3 0 4-6 7-6 1.9 0 3.5 1.3 3.5 3s-1.6 3-3.5 3c-3 0-4-6-7-6Z" />
        </svg>
      );
    case 'people':
      return (
        <svg {...base} aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M16.5 6.2A3 3 0 0 1 18 12M17 14.3c2.3.5 4 2.1 4 4.7" />
        </svg>
      );
    default:
      return null;
  }
}
