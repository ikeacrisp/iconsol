"use client";

import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useInView,
  type UseInViewOptions,
} from "motion/react";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: UseInViewOptions["margin"];
}

// Blur is animated on an inner wrapper and then explicitly cleared back to
// `filter: none`. Leaving behind `filter: blur(0px)` creates a compositor
// layer that silently breaks descendant `backdrop-filter`. We also clear the
// outer transform once the entrance settles so descendants can sample the page
// backdrop normally.
export function BlurFade({
  children,
  className,
  style,
  delay = 0,
  duration = 0.4,
  yOffset = 6,
  inView = false,
  inViewMargin = "-50px",
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const prefersReducedMotion = useReducedMotion();
  const isInView = !inView || inViewResult;
  const [settled, setSettled] = useState(false);

  const hiddenState = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: yOffset, scale: 0.985 };
  const visibleState = prefersReducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1 };
  const settledStyle: React.CSSProperties = settled
    ? { transform: "none", willChange: "auto" }
    : { willChange: "transform, opacity" };

  return (
    <motion.div
      ref={ref}
      initial={hiddenState}
      animate={isInView ? visibleState : hiddenState}
      transition={{
        delay,
        duration,
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={() => {
        if (isInView) setSettled(true);
      }}
      className={className}
      style={{ ...style, ...settledStyle }}
    >
      {children}
    </motion.div>
  );
}
