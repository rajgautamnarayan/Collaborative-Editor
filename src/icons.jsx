const paths = {
  bold: <path d="M7 5h6.2a3 3 0 0 1 0 6H7V5Zm0 6h6.8a3.5 3.5 0 1 1 0 7H7v-7Z" />,
  italic: <><path d="M10 5h7M7 19h7M14 5 10 19" /></>,
  strike: <><path d="M5 12h14M8 8c.4-2 2-3 4.5-3 2 0 3.6.8 4.5 2M8 16c1 2 2.5 3 5 3 2.2 0 4-1.1 4-3 0-1.5-1-2.3-2.8-2.8" /></>,
  highlight: <><path d="m9 14 7-7 2 2-7 7H9v-2Z" /><path d="M5 19h14" /></>,
  h1: <><path d="M5 6v12M12 6v12M5 12h7" /><path d="M17 10h2v8M17 18h4" /></>,
  h2: <><path d="M4 6v12M11 6v12M4 12h7" /><path d="M15 12c0-1.2 1-2 2.5-2s2.5.8 2.5 2c0 2-5 3.5-5 6h5" /></>,
  quote: <path d="M6 8h5v5H7c0 2 1 3 3 4M14 8h5v5h-4c0 2 1 3 3 4" />,
  bullet: <><path d="M10 7h10M10 12h10M10 17h10" /><circle cx="5" cy="7" r="1" fill="currentColor" /><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="5" cy="17" r="1" fill="currentColor" /></>,
  ordered: <><path d="M10 7h10M10 12h10M10 17h10M4 6h1v3M4 12h2l-2 3h2M4 18h2" /></>,
  code: <><path d="m9 8-4 4 4 4M15 8l4 4-4 4" /></>,
  undo: <><path d="m9 7-4 4 4 4" /><path d="M5 11h8a5 5 0 0 1 5 5" /></>,
  redo: <><path d="m15 7 4 4-4 4" /><path d="M19 11h-8a5 5 0 0 0-5 5" /></>,
  share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></>,
  check: <path d="m5 12 4 4L19 6" />,
}

export function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
