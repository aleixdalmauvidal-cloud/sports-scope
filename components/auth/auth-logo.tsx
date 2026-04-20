export function AuthLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden className={className}>
      <circle cx="22" cy="22" r="18" stroke="rgba(0, 229, 160, 0.35)" strokeWidth={1.5} />
      <circle cx="22" cy="22" r="10" stroke="rgba(0, 229, 160, 0.55)" strokeWidth={1.5} />
      <circle cx="22" cy="22" r="3" fill="#00E5A0" />
      <line x1="4" y1="22" x2="12" y2="22" stroke="rgba(0, 229, 160, 0.35)" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="32" y1="22" x2="40" y2="22" stroke="rgba(0, 229, 160, 0.35)" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="22" y1="4" x2="22" y2="12" stroke="rgba(0, 229, 160, 0.35)" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="22" y1="32" x2="22" y2="40" stroke="rgba(0, 229, 160, 0.35)" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
