/*
 * RevenueBar — Horizontal bar comparison showing current vs potential revenue.
 * The gap between the two bars IS the sale.
 */

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/calculator';

interface RevenueBarProps {
  current: number;
  potential: number;
  animated?: boolean;
}

export default function RevenueBar({ current, potential, animated = true }: RevenueBarProps) {
  const [animProgress, setAnimProgress] = useState(animated ? 0 : 1);

  useEffect(() => {
    if (!animated) return;

    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // Delay start slightly so it follows the score animation
    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 800);

    return () => clearTimeout(timeout);
  }, [animated]);

  const maxValue = potential * 1.15;
  const currentWidth = (current / maxValue) * 100 * animProgress;
  const potentialWidth = (potential / maxValue) * 100 * animProgress;

  return (
    <div className="space-y-6">
      {/* Current revenue bar */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-muted-foreground uppercase tracking-wider">Current Monthly Revenue</span>
          <span className="font-mono text-lg text-foreground">
            {formatCurrency(Math.round(current * animProgress))}
          </span>
        </div>
        <div className="w-full h-3 bg-navy-light rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-muted-foreground/40 transition-none"
            style={{ width: `${currentWidth}%` }}
          />
        </div>
      </div>

      {/* Potential revenue bar */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-signal uppercase tracking-wider">Potential with AI</span>
          <span className="font-mono text-lg text-signal font-bold">
            {formatCurrency(Math.round(potential * animProgress))}
          </span>
        </div>
        <div className="w-full h-3 bg-navy-light rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-signal transition-none"
            style={{ width: `${potentialWidth}%` }}
          />
        </div>
      </div>

      {/* Gap indicator */}
      <div className="flex items-center justify-center pt-2">
        <div className="h-px flex-1 bg-border" />
        <span className="px-4 text-coral font-mono font-bold text-base">
          {formatCurrency(Math.round((potential - current) * animProgress))}/mo gap
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
