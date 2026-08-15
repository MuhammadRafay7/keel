export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M14 7V41" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M14 15H33" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M14 24H41" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M14 33H27" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  );
}
