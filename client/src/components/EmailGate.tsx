/*
 * EmailGate — Lead capture form between teaser results and full report.
 * Collects name and email to unlock the detailed breakdown.
 * Adapts placeholder text based on the selected vertical.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailGateProps {
  onSubmit: (data: { firstName: string; email: string; practiceName: string }) => void;
  placeholders?: { name: string; email: string; business: string };
  businessLabel?: string; // "Practice Name" vs "Company Name"
}

export default function EmailGate({ onSubmit, placeholders, businessLabel }: EmailGateProps) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ph = placeholders ?? { name: 'Sarah', email: 'sarah@yourspa.com', business: 'Glow Aesthetics' };
  const bLabel = businessLabel ?? 'Practice Name';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmit({ firstName: firstName.trim(), email: email.trim(), practiceName: practiceName.trim() });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-navy border border-border rounded-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-signal-dim flex items-center justify-center">
            <Lock className="w-5 h-5 text-signal" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Unlock Your Full Report</h3>
            <p className="text-sm text-muted-foreground">See your detailed breakdown and action plan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label htmlFor="firstName" className="block text-sm text-muted-foreground mb-1.5">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={ph.name}
              className="w-full px-4 py-3 bg-navy-deep border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-muted-foreground mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ph.email}
              className="w-full px-4 py-3 bg-navy-deep border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal transition-all"
            />
          </div>

          <div>
            <label htmlFor="practiceName" className="block text-sm text-muted-foreground mb-1.5">
              {bLabel} <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              id="practiceName"
              type="text"
              value={practiceName}
              onChange={(e) => setPracticeName(e.target.value)}
              placeholder={ph.business}
              className="w-full px-4 py-3 bg-navy-deep border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !firstName.trim() || !email.trim()}
            className="w-full h-12 bg-signal text-navy-deep font-semibold text-base hover:bg-signal-bright transition-all mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-navy-deep/30 border-t-navy-deep rounded-full animate-spin" />
                Unlocking...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Get My Full Report
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

          <p className="text-xs text-muted-foreground/60 text-center mt-3">
            No spam. We'll send your report and one follow-up. That's it.
          </p>
        </form>
      </div>
    </motion.div>
  );
}
