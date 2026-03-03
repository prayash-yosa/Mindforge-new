import { Children, type ReactNode, type CSSProperties } from 'react';

/**
 * Wraps an entire screen with a smooth fade entrance animation.
 * Uses opacity-only to avoid breaking position:fixed children (BottomNav).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}

/**
 * Renders children with staggered fade-in animation.
 * Caps delay so lists do not take too long to appear.
 */
export function AnimatedList({
  children,
  baseDelay = 0,
  stagger = 50,
  maxDelay = 400,
}: {
  children: ReactNode;
  baseDelay?: number;
  stagger?: number;
  maxDelay?: number;
}) {
  const items = Children.toArray(children);
  return (
    <>
      {items.map((child, i) => {
        const delay = Math.min(baseDelay + i * stagger, maxDelay);
        return (
          <div
            key={i}
            style={{
              opacity: 0,
              animation: 'staggerFadeIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
              animationDelay: `${delay}ms`,
            }}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}

/**
 * A card that pops in with a scale bounce effect.
 */
export function PopCard({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        opacity: 0,
        animation: 'popIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        animationDelay: `${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
