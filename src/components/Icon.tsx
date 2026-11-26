import type { CSSProperties } from 'react'

const paths: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  chat: 'M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8Z',
  calendar: 'M4 7h16v13H4zM4 11h16M8 3v4M16 3v4',
  flame: 'M12 3c3 4 5 5.6 5 9a5 5 0 0 1-10 0c0-2 .8-3.2 2-4.5.6-.9 1-1.9 1-3.2 0 1.3.8 2.2 2 3.7Z',
  doc: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h6M10 16h6',
  folder: 'M3 7h6l2 2h10v10H3z',
  book: 'M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2zM12 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5',
  sparkles: 'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  plus: 'M12 5v14M5 12h14',
  chevronRight: 'M9 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 6l-6 6 6 6',
  x: 'M6 6l12 12M18 6 6 18',
  play: 'M8 5l11 7-11 7z',
  image: 'M4 5h16v14H4zM4 15l4.5-4.5 4 4L16 11l4 4M15 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  video: 'M3 6h12v12H3zM15 10l6-3v10l-6-3',
  music: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM19 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  text: 'M5 6h14M5 11h14M5 16h9',
  arrowUpRight: 'M7 17 17 7M9 7h8v8',
  check: 'M4 12.5 9 17.5 20 6.5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5.5l3.5 2',
  alert: 'M12 3l9 17H3zM12 9v5M12 17.5v.5',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  send: 'M4 12 20 4l-6.5 16-2.5-6.5z',
  wand: 'M15 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM4 20l8-8',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  download: 'M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14',
  copy: 'M9 9h11v11H9zM4 15V4h11',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z',
  bell: 'M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9ZM10 19a2 2 0 0 0 4 0',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-3.9 3.6-6.5 8-6.5s8 2.6 8 6.5',
  zap: 'M13 3 5 14h5l-1 7 8-11h-5z',
  filter: 'M3 5h18l-7 8v6l-4 2v-8z',
  refresh: 'M20 11a8 8 0 1 0-2.3 6.3M20 5v6h-6',
  link: 'M9.5 14.5 14.5 9.5M8 12l-2 2a3.5 3.5 0 0 0 5 5l2-2M16 12l2-2a3.5 3.5 0 0 0-5-5l-2 2',
  cpu: 'M8 8h8v8H8zM4 10h2M4 14h2M18 10h2M18 14h2M10 4v2M14 4v2M10 18v2M14 18v2',
  panel: 'M4 5h16v14H4zM14 5v14',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  pin: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  chart: 'M4 20V6M10 20V10M16 20v-7M22 20H2',
  bolt: 'M13 3 5 14h5l-1 7 8-11h-5z',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 3.5 5.6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.6-3.5-9s1-6.5 3.5-9Z',
}

export type IconName = keyof typeof paths

export function Icon({
  name,
  size = 16,
  className = '',
  style,
  strokeWidth = 1.6,
}: {
  name: IconName
  size?: number
  className?: string
  style?: CSSProperties
  strokeWidth?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="MZ">
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#mzg)" />
      <rect x="1" y="1" width="38" height="38" rx="11" stroke="rgba(255,255,255,0.18)" />
      <path
        d="M10.5 27.5V13.2c0-.5.6-.8 1-.4l5.5 5.2c.3.3.8.3 1.1 0l5.5-5.2c.4-.4 1-.1 1 .4v14.3"
        stroke="#1a1207"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M27.5 13.5h4.2L26.4 27h5.6" stroke="#1a1207" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <defs>
        <linearGradient id="mzg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0B36A" />
          <stop offset="0.55" stopColor="#D9822B" />
          <stop offset="1" stopColor="#B85F22" />
        </linearGradient>
      </defs>
    </svg>
  )
}
