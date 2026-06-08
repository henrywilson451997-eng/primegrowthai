/*
 * ScoreGauge — Animated circular gauge for the AI Growth Score
 * Uses SVG with animated stroke-dashoffset for the fill effect.
 */

import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number; // 0-100
  color: string; // 'signal' | 'coral' | 'amber'
  size?: number;
  animated?: boolean;
}

export default function ScoreGauge({ score, color, size = 240, animated = true }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) {
      setAnimatedScore(score);
      return;
    }

    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, animated]);

  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270 degrees
  const offset = arcLength - (arcLength * animatedScore) / 100;

  const colorMap: Record<string, { stroke: string; glow: string; text: string }> = {
    signal: {
      stroke: 'oklch(0.72 0.2 140)',
      glow: 'oklch(0.72 0.2 140 / 40%)',
      text: 'text-signal',
    },
    coral: {
      stroke: 'oklch(0.65 0.2 25)',
      glow: 'oklch(0.65 0.2 25 / 40%)',
      text: 'text-coral',
    },
    amber: {
      stroke: 'oklch(0.75 0.15 70)',
      glow: 'oklch(0.75 0.15 70 / 40%)',
      text: 'text-amber',
    },
  };

  const colors = colorMap[color] || colorMap.signal;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform rotate-[135deg]"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.25 0.03 260)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.glow}
          strokeWidth={strokeWidth + 6}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: 'blur(8px)' }}
        />
        {/* Active fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: animated ? 'none' : 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-mono text-6xl font-bold tracking-tight ${colors.text}`}
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {animatedScore}
        </span>
        <span className="text-muted-foreground text-sm mt-1 tracking-widest uppercase">
          out of 100
        </span>
      </div>
    </div>
  );
}
