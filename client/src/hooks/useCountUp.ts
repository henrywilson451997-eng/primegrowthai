import { useState, useEffect, useRef } from 'react';

/**
 * Animated count-up hook.
 * Counts from 0 to `end` over `duration` ms with an easing curve
 * that slows dramatically near the end for dramatic effect.
 * 
 * Properly handles the case where `end` changes from 0 to a real value
 * (e.g., when results are calculated asynchronously).
 */
export function useCountUp(
  end: number,
  duration: number = 1500,
  enabled: boolean = true
): { value: number; start: () => void; isComplete: boolean } {
  const [value, setValue] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const rafRef = useRef<number>(0);
  const hasAnimatedRef = useRef<number>(0); // tracks which end value we last animated to

  const start = () => {
    hasAnimatedRef.current = 0;
    setValue(0);
    setIsComplete(false);
  };

  useEffect(() => {
    // Don't animate if not enabled, or if end is 0, or if we already animated this value
    if (!enabled || end === 0 || hasAnimatedRef.current === end) {
      if (end === 0) {
        setValue(0);
        setIsComplete(true);
      }
      return;
    }

    // Mark that we're animating to this end value
    hasAnimatedRef.current = end;
    setValue(0);
    setIsComplete(false);

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic — slows dramatically at the end
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(eased * end));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(end);
        setIsComplete(true);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration, enabled]);

  return { value, start, isComplete };
}
