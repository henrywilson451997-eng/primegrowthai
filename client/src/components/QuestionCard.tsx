/*
 * QuestionCard — Displays a single question with selectable options.
 * Editorial design: generous spacing, clear hierarchy, subtle interactions.
 */

import { motion } from 'framer-motion';
import type { Question } from '@/lib/calculator';

interface QuestionCardProps {
  question: Question;
  selectedValue: number | null;
  onSelect: (value: number) => void;
  direction: number; // 1 = forward, -1 = backward
}

export default function QuestionCard({ question, selectedValue, onSelect, direction }: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: direction > 0 ? 40 : -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: direction > 0 ? -40 : 40 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Question number */}
      <div className="mb-6">
        <span className="text-signal font-mono text-sm tracking-widest uppercase">
          0{question.number}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight mb-3">
        {question.title}
      </h2>
      <p className="text-muted-foreground text-base mb-10">
        {question.subtitle}
      </p>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`
                w-full text-left px-6 py-4 rounded-lg border transition-all duration-200
                ${isSelected
                  ? 'border-signal bg-signal-dim text-foreground'
                  : 'border-border bg-navy/50 text-foreground hover:border-signal/40 hover:bg-navy-light/30'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-muted-foreground text-sm ml-3">
                      — {option.description}
                    </span>
                  )}
                </div>
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${isSelected ? 'border-signal bg-signal' : 'border-muted-foreground/40'}
                  `}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-navy-deep"
                    />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
