/**
 * App logo — inline SVG (not `<img>`): Next's `next/image` can't serve SVG
 * without `dangerouslyAllowSVG`, and this is a 30-line static asset, so an
 * inline component is simpler and faster.
 *
 * Same mark as `app/icon.svg` (the favicon): the app's signature visual from
 * the homepage demo — a letter grid with a diagonal "found word" stroke and
 * the ring-dot where it lands.
 */
export function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      role="img"
      aria-label="Word Search"
      className={className ?? 'h-8 w-8 shrink-0 rounded-lg'}
    >
      <rect width="96" height="96" rx="22" fill="#4f46e5" />
      <g stroke="#a5b4fc" strokeWidth="1.25" opacity="0.55">
        <line x1="2" y1="24" x2="94" y2="24" />
        <line x1="2" y1="48" x2="94" y2="48" />
        <line x1="2" y1="72" x2="94" y2="72" />
      </g>
      <g fill="#a5b4fc" opacity="0.55">
        <rect x="5" y="5" width="17" height="17" rx="3.5" />
        <rect x="74" y="5" width="17" height="17" rx="3.5" />
        <rect x="5" y="74" width="17" height="17" rx="3.5" />
      </g>
      <text
        x="13.5"
        y="78.5"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="30"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#a5b4fc"
        opacity="0.6"
      >
        D
      </text>
      <path
        d="M 13.5 13.5 L 82.5 82.5"
        stroke="#fff"
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.95"
      />
      <circle cx="86" cy="86" r="7.5" fill="#fff" />
    </svg>
  )
}
