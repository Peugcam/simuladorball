// Bandeira SVG via flag-icons (mesmo visual em Android/iOS/Windows).
// `cc` é o código ISO (ex.: "br", "gb-sct"). Cai no emoji se faltar código.
export default function Flag({ cc, emoji, className = "" }) {
  if (!cc) return <span className={`flag ${className}`}>{emoji}</span>;
  return <span className={`flag fi fi-${cc} ${className}`} role="img" aria-hidden="true" />;
}
