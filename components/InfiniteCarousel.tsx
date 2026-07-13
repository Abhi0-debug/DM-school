"use client";

import {
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";

interface InfiniteCarouselProps extends PropsWithChildren {
  speed?: number;
  gap?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export function InfiniteCarousel({
  children,
  speed = 0.5,
  gap = 24,
  pauseOnHover = true,
  className = "",
}: InfiniteCarouselProps) {
  const x = useMotionValue(0);

  const paused = useRef(false);

  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);

  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (!trackRef.current) return;

      setTrackWidth(trackRef.current.scrollWidth / 2);
    };

    updateWidth();

    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, [children]);

  useAnimationFrame(() => {
    if (paused.current) return;

    if (!trackWidth) return;

    const next = x.get() - speed;

    if (next <= -trackWidth) {
     x.set(next + trackWidth);
    } else {
     x.set(next);
    }
  });

  const pause = () => {
    paused.current = true;

    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
    }
  };

  const resume = () => {
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
    }

    resumeTimer.current = setTimeout(() => {
      paused.current = false;
    }, 3000);
  };

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <motion.div
  ref={trackRef}
  style={{ x }}
  className="flex w-max cursor-grab active:cursor-grabbing"
  drag="x"
  dragMomentum={false}
  dragElastic={0.03}
  onDragStart={pause}
  onDragEnd={resume}
  onHoverStart={() => pauseOnHover && pause()}
  onHoverEnd={() => pauseOnHover && resume()}
>
  <div className="flex gap-6">
    {children}
    {children}
  </div>
</motion.div>
    </div>
  );
}