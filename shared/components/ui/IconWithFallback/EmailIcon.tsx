'use client';

export interface EmailIconProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Email icon component with Material Symbols fallback.
 * Uses inline SVG if needed for reliable rendering on slow connections.
 */
export function EmailIcon({ className = '', style }: EmailIconProps) {
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={style}
    >
      email
    </span>
  );
}

/**
 * SVG fallback version if Material Symbols fails to load
 */
export function EmailIconSVG({ className = '', style }: EmailIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block ${className}`}
      style={style}
      fill="currentColor"
    >
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}
