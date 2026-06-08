/*
 * InsightCard — Displays a single personalized insight with impact amount.
 */

import { motion } from 'framer-motion';
import { Clock, Moon, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/calculator';
import type { Insight } from '@/lib/calculator';

interface InsightCardProps {
  insight: Insight;
  index: number;
  lang?: 'en' | 'fr';
}

const iconMap = {
  response: Clock,
  coverage: Moon,
  conversion: TrendingUp,
};

export default function InsightCard({ insight, index, lang = 'en' }: InsightCardProps) {
  const Icon = iconMap[insight.type];
  const title = lang === 'fr' ? insight.titleFR : insight.title;
  const description = lang === 'fr' ? insight.descriptionFR : insight.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
      className="bg-navy border border-border rounded-xl p-6 hover:border-signal/30 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-coral-dim flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-5 h-5 text-coral" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h4 className="text-base font-semibold text-foreground">{title}</h4>
            <span className="font-mono text-coral font-bold text-sm whitespace-nowrap">
              -{formatCurrency(insight.impact)}/mo
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
