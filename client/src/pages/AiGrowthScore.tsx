/*
 * Automation Leak Audit — primegrowthai.com/tools/ai-growth-score
 *
 * Design: Matches main primegrowthai.com design system
 *   - bg-[#0F172A] slate background
 *   - Teal/sky gradient accents
 *   - Left-aligned hero layout
 *   - Plus Jakarta Sans font
 *   - Animated grid background
 *   - Main website nav header
 *
 * Vertical: Sub-Trades & General Contractors only.
 * States: Hero → Quiz → Results (Teaser → Gated → Full Report)
 *
 * GHL Integration: Direct webhook (same pattern as Job Costing Calculator)
 * Route: /tools/ai-growth-score
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowLeft, RotateCcw, Calendar, ChevronDown, Lock, Download } from 'lucide-react';
import { Link } from 'wouter';
import { verticals, getQuestions, calculateScore, formatCurrency } from '@/lib/calculator';
import type { CalculatorAnswers, ScoreResult } from '@/lib/calculator';
import { useCountUp } from '@/hooks/useCountUp';
import { useSEO } from '@/hooks/useSEO';
import { GHL_WEBHOOKS, sendGhlWebhookGet } from '@/lib/ghlWebhook';
import { trackMetaCustomEvent } from '@/lib/metaPixel';

// CDN Assets
const LOGO_URL = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/OyhhiQPpFBkvMcYg.png';
const CALENDAR_LINK = 'https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO';

const TOOLKIT_UNLOCK_KEY = 'pg_construction_toolkit_unlocked';

// Contractor vertical config
const VERTICAL = 'contractor';
const config = verticals[VERTICAL];
const questions = getQuestions(VERTICAL);

type AppState = 'hero' | 'quiz' | 'results-teaser' | 'results-full';

// ── ANIMATED GRID BACKGROUND ──────────────────────────────────────────────────
function AnimatedGridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(13,148,136,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-3xl" />
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-teal-400/10 blur-2xl"
      />
      <motion.div
        animate={{ y: [0, 15, 0], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full bg-sky-400/8 blur-3xl"
      />
    </div>
  );
}

// ── SECTION LABEL ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-widest uppercase mb-4">
      <span className="w-4 h-px bg-teal-400/60" />
      {children}
      <span className="w-4 h-px bg-teal-400/60" />
    </span>
  );
}

// ── SCORE RING ────────────────────────────────────────────────────────────────
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const strokeColor = color === 'signal' ? '#14b8a6' : color === 'amber' ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <motion.circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-4xl font-black text-slate-50 tabular-nums"
        >
          {score}
        </motion.div>
        <div className="text-xs font-semibold text-slate-400 mt-0.5">/100</div>
        <div
          className="text-xs font-bold mt-1"
          style={{ color: strokeColor }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-teal-400 tracking-widest uppercase">
          Question {current + 1} of {total}
        </span>
        <span className="text-xs text-slate-500">{Math.round(((current) / total) * 100)}% complete</span>
      </div>
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-500 to-sky-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((current) / total) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ── QUESTION CARD ─────────────────────────────────────────────────────────────
function QuestionCard({
  question,
  selectedValue,
  onSelect,
  direction,
  lang,
}: {
  question: ReturnType<typeof getQuestions>[0];
  selectedValue: number | null;
  onSelect: (value: number) => void;
  direction: number;
  lang: 'en' | 'fr';
}) {
  const title = lang === 'fr' ? question.titleFR : question.title;
  const subtitle = lang === 'fr' ? question.subtitleFR : question.subtitle;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: direction * 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction * -40 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <span className="text-xs font-mono font-semibold text-teal-400/70 tracking-widest uppercase mb-3 block">
          {lang === 'fr' ? `Question ${question.number}` : `Question ${question.number}`}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-50 leading-tight mb-3">{title}</h2>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedValue === option.value;
          const label = lang === 'fr' && option.labelFR ? option.labelFR : option.label;
          const description = lang === 'fr' && option.descriptionFR ? option.descriptionFR : option.description;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`w-full text-left rounded-xl border p-4 transition-all duration-200 group ${
                isSelected
                  ? 'border-teal-500/60 bg-teal-500/10 text-slate-50'
                  : 'border-slate-700/50 bg-slate-800/40 text-slate-300 hover:border-teal-500/30 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'border-teal-500 bg-teal-500' : 'border-slate-600 group-hover:border-teal-500/50'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm">{label}</span>
                  {description && (
                    <span className={`text-xs ml-2 ${isSelected ? 'text-teal-400/80' : 'text-slate-500'}`}>
                      — {description}
                    </span>
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

// ── INSIGHT CARD ──────────────────────────────────────────────────────────────
function InsightCard({ insight, index, lang }: {
  insight: ReturnType<typeof calculateScore>['insights'][0];
  index: number;
  lang: 'en' | 'fr';
}) {
  const typeColors = {
    response: 'border-red-500/30 bg-red-500/5',
    coverage: 'border-amber-500/30 bg-amber-500/5',
    conversion: 'border-sky-500/30 bg-sky-500/5',
  };
  const typeIconColors = {
    response: 'text-red-400',
    coverage: 'text-amber-400',
    conversion: 'text-sky-400',
  };

  const title = lang === 'fr' ? insight.titleFR : insight.title;
  const description = lang === 'fr' ? insight.descriptionFR : insight.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-xl border p-5 ${typeColors[insight.type]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className={`text-sm font-bold mb-1.5 ${typeIconColors[insight.type]}`}>{title}</h4>
          <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-lg font-black tabular-nums ${typeIconColors[insight.type]}`}>
            +{formatCurrency(insight.impact, lang)}/mo
          </div>
          <div className="text-xs text-slate-500">{lang === 'fr' ? 'potentiel' : 'potential'}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ── EMAIL GATE ────────────────────────────────────────────────────────────────
function EmailGate({
  onSubmit,
  lang,
  businessLabel,
}: {
  onSubmit: (data: { firstName: string; email: string; practiceName: string }) => void;
  lang: 'en' | 'fr';
  businessLabel: string;
}) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ph = config.emailPlaceholder;

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
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-50">
              {lang === 'fr' ? 'Débloquez votre carte complète' : 'Unlock Your Automation Leak Map'}
            </h3>
            <p className="text-sm text-slate-400">
              {lang === 'fr' ? 'Voir le détail et votre plan d\'action' : 'See the priority leaks and fix plan'}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {lang === 'fr' ? 'Prénom' : 'First Name'}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={ph.name}
              required
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {lang === 'fr' ? 'Courriel' : 'Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ph.email}
              required
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {businessLabel} ({lang === 'fr' ? 'optionnel' : 'optional'})
            </label>
            <input
              type="text"
              value={practiceName}
              onChange={(e) => setPracticeName(e.target.value)}
              placeholder={ph.business}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !firstName.trim() || !email.trim()}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
                {lang === 'fr' ? 'Chargement...' : 'Loading...'}
              </span>
            ) : (
              <>
                {lang === 'fr' ? 'Voir ma carte complète' : 'See My Leak Map'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-xs text-slate-500 text-center">
            {lang === 'fr'
              ? 'Aucune carte de crédit. Résultats instantanés.'
              : 'No credit card. Instant results.'}
          </p>
        </form>
      </div>
    </motion.div>
  );
}

// ── REVENUE BAR ───────────────────────────────────────────────────────────────
function RevenueBar({ current, potential, lang }: { current: number; potential: number; lang: 'en' | 'fr' }) {
  const max = Math.max(current, potential);
  const currentPct = max > 0 ? (current / max) * 100 : 0;
  const potentialPct = max > 0 ? (potential / max) * 100 : 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {lang === 'fr' ? 'Revenus suivis/mois' : 'Current Tracked Revenue/mo'}
          </span>
          <span className="text-sm font-bold text-slate-300">{formatCurrency(current, lang)}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-slate-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${currentPct}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
            {lang === 'fr' ? 'Potentiel avec suivi automatisé/mois' : 'Potential with Automated Follow-Up/mo'}
          </span>
          <span className="text-sm font-bold text-teal-400">{formatCurrency(potential, lang)}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-500 to-sky-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${potentialPct}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
}


// ── SUMMARY EXPORT HELPERS ────────────────────────────────────────────────────
type AuditLeadData = { firstName: string; email: string; practiceName: string };

type PrimaryLeak = {
  key: 'lead_intake' | 'quote_followup' | 'after_hours_capture';
  title: string;
  score: number;
  max: number;
  recommendation: string;
};

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getPrimaryLeak(result: ScoreResult, lang: 'en' | 'fr'): PrimaryLeak {
  const isFR = lang === 'fr';
  const leaks: PrimaryLeak[] = [
    {
      key: 'lead_intake',
      title: isFR ? 'Entrée des leads' : 'Lead Intake',
      score: result.responseScore,
      max: 30,
      recommendation: isFR
        ? 'Installer une réponse immédiate, une création automatique de contact et une prochaine action claire pour chaque demande.'
        : 'Install immediate response, automatic contact creation, and a clear next action for every new request.',
    },
    {
      key: 'quote_followup',
      title: isFR ? 'Relance des soumissions' : 'Quote Follow-Up',
      score: result.conversionScore,
      max: 30,
      recommendation: isFR
        ? 'Créer une séquence de relance structurée pour les soumissions envoyées, objections, dates de décision et dossiers inactifs.'
        : 'Create a structured follow-up sequence for sent quotes, objections, decision dates, and stalled opportunities.',
    },
    {
      key: 'after_hours_capture',
      title: isFR ? 'Capture hors heures' : 'After-Hours Capture',
      score: result.coverageScore,
      max: 20,
      recommendation: isFR
        ? 'Ajouter un filet de sécurité soir et fin de semaine qui accuse réception, classe la demande et prépare la prochaine action.'
        : 'Add an evening and weekend safety net that acknowledges, categorizes, and queues the next action.',
    },
  ];

  return leaks.sort((a, b) => (a.score / a.max) - (b.score / b.max))[0];
}

function answerLine(label: string, value: number | undefined, formatter?: (value: number) => string) {
  if (value === undefined || value === null) return `${label}: n/a`;
  return `${label}: ${formatter ? formatter(value) : value}`;
}

function buildAuditSummary({
  result,
  answers,
  leadData,
  lang,
}: {
  result: ScoreResult;
  answers: Record<string, number>;
  leadData: AuditLeadData;
  lang: 'en' | 'fr';
}) {
  const isFR = lang === 'fr';
  const primaryLeak = getPrimaryLeak(result, lang);
  const insights = result.insights.length
    ? result.insights
        .map((insight, index) => {
          const title = isFR ? insight.titleFR : insight.title;
          const description = isFR ? insight.descriptionFR : insight.description;
          return `${index + 1}. ${title} — ${description} (${formatCurrency(insight.impact, lang)}/mo ${isFR ? 'potentiel' : 'potential'})`;
        })
        .join('\n')
    : isFR
      ? 'Aucune fuite prioritaire détectée. Le prochain gain vient probablement de la standardisation.'
      : 'No priority leak detected. The next gain likely comes from standardizing the system.';

  if (isFR) {
    return `AUDIT DES FUITES D’AUTOMATISATION — PRIMEGROWTH AI\n\nContact: ${leadData.firstName}\nEntreprise: ${leadData.practiceName || 'Non fournie'}\nCourriel: ${leadData.email}\n\nRÉSULTAT\nScore de contrôle: ${result.aiGrowthScore}/100 (${result.scoreLabelFR})\nFuite opérationnelle estimée: ${formatCurrency(result.monthlyRevenueLeak, lang)}/mois\nFuite annuelle estimée: ${formatCurrency(result.annualRevenueLeak, lang)}/année\nRevenus suivis/mois: ${formatCurrency(result.currentMonthlyRevenue, lang)}\nPotentiel avec suivi automatisé/mois: ${formatCurrency(result.potentialMonthlyRevenue, lang)}\n\nENTRÉES\n${answerLine('Demandes/mois', answers.monthlyLeads)}\n${answerLine('Valeur moyenne à protéger', answers.avgServiceValue, (value) => formatCurrency(value, lang))}\n${answerLine('Temps de réponse moyen (minutes)', answers.responseTime)}\n${answerLine('Taux de passage vers soumission/chantier', answers.bookingRate, (value) => `${Math.round(value * 100)}%`)}\n${answerLine('Couverture hors heures', answers.afterHoursCoverage, (value) => `${Math.round(value * 100)}%`)}\n\nCONTRÔLE PAR ZONE\nEntrée des leads: ${result.responseScore}/30\nRelance soumissions: ${result.conversionScore}/30\nCapture hors heures: ${result.coverageScore}/20\nPression volume: ${result.volumeScore}/20\n\nFUITE PRIORITAIRE\n${primaryLeak.title} (${primaryLeak.score}/${primaryLeak.max})\n${primaryLeak.recommendation}\n\nFUITE(S) À CORRIGER\n${insights}\n\nPROCHAINE ÉTAPE\nRéserver un appel découverte gratuit: ${CALENDAR_LINK}\n\nNote: ceci est un audit opérationnel indicatif, pas une garantie de revenus. Les résultats dépendent du volume de demandes, de la qualité des leads, de la discipline de suivi et de l’exécution.`;
  }

  return `AUTOMATION LEAK AUDIT — PRIMEGROWTH AI\n\nContact: ${leadData.firstName}\nCompany: ${leadData.practiceName || 'Not provided'}\nEmail: ${leadData.email}\n\nRESULT\nControl score: ${result.aiGrowthScore}/100 (${result.scoreLabel})\nEstimated operational leak: ${formatCurrency(result.monthlyRevenueLeak, lang)}/mo\nEstimated annual leak: ${formatCurrency(result.annualRevenueLeak, lang)}/year\nCurrent tracked revenue/mo: ${formatCurrency(result.currentMonthlyRevenue, lang)}\nPotential with automated follow-up/mo: ${formatCurrency(result.potentialMonthlyRevenue, lang)}\n\nINPUTS\n${answerLine('Requests/month', answers.monthlyLeads)}\n${answerLine('Average job value to protect', answers.avgServiceValue, (value) => formatCurrency(value, lang))}\n${answerLine('Average response time (minutes)', answers.responseTime)}\n${answerLine('Estimate/job conversion rate', answers.bookingRate, (value) => `${Math.round(value * 100)}%`)}\n${answerLine('After-hours coverage', answers.afterHoursCoverage, (value) => `${Math.round(value * 100)}%`)}\n\nCONTROL BY AREA\nLead intake: ${result.responseScore}/30\nQuote follow-up: ${result.conversionScore}/30\nAfter-hours capture: ${result.coverageScore}/20\nLead volume pressure: ${result.volumeScore}/20\n\nPRIMARY LEAK\n${primaryLeak.title} (${primaryLeak.score}/${primaryLeak.max})\n${primaryLeak.recommendation}\n\nPRIORITY LEAK(S) TO FIX\n${insights}\n\nNEXT STEP\nBook a free discovery call: ${CALENDAR_LINK}\n\nNote: this is an indicative operational audit, not a revenue guarantee. Results depend on request volume, lead quality, follow-up discipline, and execution.`;
}


// ── AUTOMATION BLUEPRINT ──────────────────────────────────────────────────────
function AutomationBlueprint({ result, lang }: { result: ScoreResult; lang: 'en' | 'fr' }) {
  const isFR = lang === 'fr';
  const cards = [
    {
      label: isFR ? '01 · Entrée des leads' : '01 · Lead intake',
      title: result.responseScore < 22
        ? (isFR ? 'Installer une réponse immédiate et un routage clair' : 'Install immediate response and clear routing')
        : (isFR ? 'Standardiser la capture avant d’ajouter du volume' : 'Standardize capture before adding more volume'),
      body: isFR
        ? 'Chaque appel, texto, formulaire, référence et invitation d’EG doit créer une trace, une réponse, une qualification minimale et une prochaine action.'
        : 'Every call, text, form, referral, and GC invite should create a record, reply, light qualification, and next action.',
    },
    {
      label: isFR ? '02 · Relance soumissions' : '02 · Quote follow-up',
      title: result.conversionScore < 24
        ? (isFR ? 'Créer une séquence de relance automatique' : 'Create an automatic quote follow-up lane')
        : (isFR ? 'Protéger le pipeline existant avec des rappels' : 'Protect the existing pipeline with reminders'),
      body: isFR
        ? 'Les estimations, soumissions envoyées, objections, réponses client et dates de décision ne devraient pas vivre dans votre tête ou dans un fil texto perdu.'
        : 'Estimates, sent quotes, objections, client replies, and decision dates should not live in your head or inside a lost text thread.',
    },
    {
      label: isFR ? '03 · Hors heures' : '03 · After-hours capture',
      title: result.coverageScore < 20
        ? (isFR ? 'Ajouter un filet de sécurité soir et fin de semaine' : 'Add an evening and weekend safety net')
        : (isFR ? 'Maintenir la couverture et automatiser le triage' : 'Maintain coverage and automate triage'),
      body: isFR
        ? 'Le but n’est pas de travailler 24/7. Le but est que chaque demande soit accusée réception, classée et prête pour la prochaine action ouvrable.'
        : 'The goal is not to work 24/7. The goal is for every request to be acknowledged, categorized, and ready for the next business-hour action.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mb-8"
    >
      <h3 className="text-lg font-bold text-slate-100 mb-4">
        {isFR ? 'Plan d’automatisation prioritaire' : 'Priority Automation Blueprint'}
      </h3>
      <div className="grid gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-slate-900/60 border border-teal-500/20 rounded-xl p-5">
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2">{card.label}</p>
            <h4 className="text-sm font-bold text-slate-100 mb-2">{card.title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AiGrowthScore({ lang = 'en' }: { lang?: 'en' | 'fr' }) {
  const isFR = lang === 'fr';

  useSEO({
    title: isFR
      ? 'Audit des fuites d’automatisation — Trouvez où les leads, soumissions et suivis fuient | PrimeGrowth AI'
      : 'Contractor Automation Leak Audit — Find Where Leads, Quotes, and Admin Are Leaking | PrimeGrowth AI',
    description: isFR
      ? 'Répondez à 5 questions rapides. Obtenez une carte instantanée des fuites d’automatisation dans l’entrée de leads, les relances de soumissions et la capture hors heures.'
      : 'Answer 5 quick questions about your contracting business. Get an instant Automation Leak Map showing where lead intake, quote follow-up, and after-hours capture are costing you.',
    canonical: isFR
      ? 'https://www.primegrowthai.com/fr/outils/calculateur-croissance-ia'
      : 'https://www.primegrowthai.com/tools/ai-growth-score',
    lang,
    alternateHref: isFR
      ? 'https://www.primegrowthai.com/tools/ai-growth-score'
      : 'https://www.primegrowthai.com/fr/outils/calculateur-croissance-ia',
    alternateLang: isFR ? 'en' : 'fr',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": isFR ? "Audit des Fuites d’Automatisation" : "Contractor Automation Leak Audit",
      "description": isFR
        ? "Répondez à 5 questions rapides et obtenez une carte des fuites d’automatisation."
        : "Answer 5 quick questions and get a contractor automation leak map.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CAD" },
      "url": isFR
        ? "https://www.primegrowthai.com/fr/outils/calculateur-croissance-ia"
        : "https://www.primegrowthai.com/tools/ai-growth-score",
      "provider": { "@type": "Organization", "name": "PrimeGrowth AI" }
    }
  });

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appState, setAppState] = useState<AppState>('hero');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [direction, setDirection] = useState(1);
  const [leadData, setLeadData] = useState<{ firstName: string; email: string; practiceName: string } | null>(null);

  const [hasToolkitAccess, setHasToolkitAccess] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const stored = window.localStorage.getItem(TOOLKIT_UNLOCK_KEY);
      if (params.get('toolkit') === 'unlocked' || stored) {
        setHasToolkitAccess(true);
        if (stored) {
          const parsed = JSON.parse(stored);
          setLeadData({
            firstName: parsed.firstName || parsed.name || '',
            email: parsed.email || '',
            practiceName: '',
          });
        }
      }
    } catch {
      // Keep the standalone calculator gate if prior toolkit access cannot be verified locally.
    }
  }, []);

  // Scroll listener for nav
  useState(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const revenueLeak = useCountUp(
    result?.monthlyRevenueLeak ?? 0,
    2000,
    appState === 'results-teaser' || appState === 'results-full'
  ).value;

  const businessLabel = isFR ? 'Nom de l\'entreprise' : 'Company Name';

  const startQuiz = useCallback(() => setAppState('quiz'), []);

  const handleOptionSelect = useCallback((value: number) => {
    const question = questions[currentQuestion];
    if (!question) return;
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setDirection(1);
        setCurrentQuestion((prev) => prev + 1);
      } else {
        const calculatorAnswers: CalculatorAnswers = {
          monthlyLeads: newAnswers.monthlyLeads,
          avgServiceValue: newAnswers.avgServiceValue,
          responseTime: newAnswers.responseTime,
          bookingRate: newAnswers.bookingRate,
          afterHoursCoverage: newAnswers.afterHoursCoverage,
        };
        const scoreResult = calculateScore(calculatorAnswers, VERTICAL);
        setResult(scoreResult);
        setAppState(hasToolkitAccess ? 'results-full' : 'results-teaser');
      }
    }, 400);
  }, [currentQuestion, answers, hasToolkitAccess]);

  const goBack = useCallback(() => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion((prev) => prev - 1);
    } else {
      setAppState('hero');
    }
  }, [currentQuestion]);

  const handleEmailSubmit = useCallback(async (data: { firstName: string; email: string; practiceName: string }) => {
    setLeadData(data);
    setAppState('results-full');

    if (result) {
      try {
        await sendGhlWebhookGet(GHL_WEBHOOKS.websiteCalculatorForm, {
          firstName: data.firstName.split(' ')[0] || data.firstName,
          lastName: data.firstName.split(' ').slice(1).join(' ') || '',
          email: data.email,
          source: 'automation-leak-audit',
          tags: ['automation-leak-audit', 'ai-growth-score-legacy', 'calculator-lead', 'ig-funnel', 'contractor', 'sub-trade'],
          customFields: {
            businessName: data.practiceName || '',
            aiGrowthScore: result.aiGrowthScore,
            scoreLabel: result.scoreLabel,
            monthlyRevenueLeak: result.monthlyRevenueLeak,
            annualRevenueLeak: result.annualRevenueLeak,
            currentMonthlyRevenue: result.currentMonthlyRevenue,
            potentialMonthlyRevenue: result.potentialMonthlyRevenue,
            monthlyLeads: answers.monthlyLeads,
            avgServiceValue: answers.avgServiceValue,
            responseTime: answers.responseTime,
            bookingRate: answers.bookingRate,
            afterHoursCoverage: answers.afterHoursCoverage,
            calculatorLang: lang,
          },
        });
      } catch (err) {
        console.error('[GHL] Lead submission failed:', err);
      }
    }
  }, [result, answers, lang]);

  const resetQuiz = useCallback(() => {
    setAppState('hero');
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setLeadData(null);
  }, []);

  const handleDownloadSummary = useCallback(() => {
    if (!result || !leadData) return;
    const primaryLeak = getPrimaryLeak(result, lang);
    const summary = buildAuditSummary({ result, answers, leadData, lang });
    const filenameBase = leadData.practiceName || leadData.firstName || 'contractor';
    const safeName = filenameBase
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'contractor';

    downloadTextFile(
      `primegrowth-automation-leak-audit-${safeName}-${lang}.txt`,
      summary
    );

    trackMetaCustomEvent('AutomationLeakAuditSummaryDownloaded', {
      tool: 'automation-leak-audit',
      language: lang,
      score: result.aiGrowthScore,
      monthlyRevenueLeak: Math.round(result.monthlyRevenueLeak),
      primaryLeakType: primaryLeak.key,
    });
  }, [result, leadData, answers, lang]);

  const handleOperationsSnapshotCallClick = useCallback(() => {
    trackMetaCustomEvent('BookOperationsSnapshotCall', {
      source: isFR ? 'automation_leak_audit_fr' : 'automation_leak_audit',
      cta: 'book_your_operations_snapshot_call',
      score: result?.aiGrowthScore,
      estimatedMonthlyLeak: result?.monthlyRevenueLeak ? Math.round(result.monthlyRevenueLeak) : undefined,
    });
  }, [isFR, result]);

  const altHref = isFR ? '/tools/ai-growth-score' : '/fr/outils/calculateur-croissance-ia';
  const altLabel = isFR ? 'EN' : 'FR';

  return (
    <div
      className="min-h-screen bg-[#0F172A] text-slate-100 overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .font-mono { font-family: 'Space Mono', monospace; }
      `}</style>

      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
          <Link href={isFR ? '/fr' : '/'}>
            <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-10 md:h-12 w-auto object-contain cursor-pointer" />
          </Link>
          <div className="flex items-center gap-4">
            {appState !== 'hero' && (
              <button
                onClick={resetQuiz}
                className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isFR ? 'Recommencer' : 'Start Over'}
              </button>
            )}
            <Link
              href={altHref}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors border border-slate-700/60 hover:border-slate-600 rounded-lg px-3 py-1.5"
            >
              <span className={isFR ? 'text-slate-400' : 'text-teal-400'}>EN</span>
              <span className="text-slate-600">|</span>
              <span className={isFR ? 'text-teal-400' : 'text-slate-400'}>FR</span>
            </Link>
            <a
              href={CALENDAR_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-95"
            >
              {isFR ? 'Réserver un appel' : 'Book a Call'}
            </a>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main>
        <AnimatePresence mode="wait">

          {/* ============ HERO ============ */}
          {appState === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
                <AnimatedGridBackground />
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full">
                  <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                    <div className="max-w-3xl">
                      {/* Status pill */}
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-8"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                        </span>
                        <span className="text-xs font-semibold text-teal-400 tracking-widest uppercase">
                          {isFR ? 'Audit entrepreneur gratuit — 60 secondes' : 'Free 60-Second Contractor Audit'}
                        </span>
                      </motion.div>

                      {/* Headline */}
                      <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-5 text-slate-50"
                      >
                        {isFR ? (
                          <>
                            Où votre entreprise{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                              perd-elle du contrôle
                            </span>{' '}
                            entre les leads, soumissions et suivis ?
                          </>
                        ) : (
                          <>
                            Where is your contractor{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                              business leaking
                            </span>{' '}
                            admin time and money?
                          </>
                        )}
                      </motion.h1>

                      {/* Subheadline */}
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="text-lg sm:text-xl font-semibold text-teal-400 mb-4 max-w-2xl"
                      >
                        {isFR
                          ? 'L’audit des fuites d’automatisation pour sous-traitants et entrepreneurs généraux.'
                          : 'The Contractor Automation Leak Audit for Sub-Trades & General Contractors.'}
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.75, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="text-base sm:text-lg text-slate-400 max-w-xl mb-10 leading-relaxed"
                      >
                        {isFR
                          ? 'Répondez à 5 questions rapides sur votre entreprise. Nous générons une carte des fuites qui montre où les leads, soumissions et suivis dépendent encore de votre mémoire.'
                          : 'Answer 5 quick questions about your business. We generate a leak map showing where leads, quotes, and follow-up still depend on owner memory.'}
                      </motion.p>

                      {/* CTAs */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
                      >
                        <button
                          onClick={startQuiz}
                          className="group relative px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-base rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_0_40px_rgba(20,184,166,0.35)] active:scale-95 flex items-center gap-2"
                        >
                          {isFR ? 'Trouver mes fuites' : 'Find My Automation Leaks'}
                          <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-5 text-sm text-slate-500">
                          <span>{isFR ? '60 secondes' : '60 seconds'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span>{isFR ? 'Aucune carte de crédit' : 'No credit card'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span>{isFR ? 'Résultats instantanés' : 'Instant results'}</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                >
                  <ChevronDown className="w-5 h-5 text-slate-600 animate-bounce" />
                </motion.div>
              </section>
            </motion.div>
          )}

          {/* ============ QUIZ ============ */}
          {appState === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen flex flex-col"
            >
              <div className="relative flex-1 flex flex-col pt-24 pb-12">
                <AnimatedGridBackground />
                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                  {/* Progress */}
                  <div className="max-w-2xl mx-auto mb-10">
                    <ProgressBar current={currentQuestion} total={questions.length} />
                  </div>

                  {/* Question */}
                  <div className="flex-1 flex items-center py-8">
                    <div className="w-full">
                      <AnimatePresence mode="wait">
                        {currentQuestion < questions.length && (
                          <QuestionCard
                            key={questions[currentQuestion].id}
                            question={questions[currentQuestion]}
                            selectedValue={answers[questions[currentQuestion].id] ?? null}
                            onSelect={handleOptionSelect}
                            direction={direction}
                            lang={lang}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Back button */}
                  <div className="max-w-2xl mx-auto mt-8">
                    <button
                      onClick={goBack}
                      className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {isFR ? 'Retour' : 'Back'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============ RESULTS TEASER ============ */}
          {appState === 'results-teaser' && result && (
            <motion.div
              key="results-teaser"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <section className="relative min-h-screen pt-24 pb-20">
                <AnimatedGridBackground />
                <div className="relative z-10 max-w-7xl mx-auto px-6">
                  <div className="max-w-2xl mx-auto">
                    {/* Section label */}
                    <div className="mb-8">
                      <SectionLabel>{isFR ? 'Votre carte de fuites' : 'Your Leak Map'}</SectionLabel>
                    </div>

                    {/* Score + revenue leak */}
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 mb-6"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-8">
                        <ScoreRing
                          score={result.aiGrowthScore}
                          label={isFR ? result.scoreLabelFR : result.scoreLabel}
                          color={result.scoreColor}
                        />
                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            {isFR ? 'Fuite opérationnelle estimée' : 'Estimated Operational Leak'}
                          </p>
                          <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 tabular-nums mb-2">
                            {formatCurrency(revenueLeak, lang)}/mo
                          </div>
                          <p className="text-slate-400 text-sm">
                            {isFR
                              ? `${formatCurrency(result.annualRevenueLeak, lang)} par année en opportunités à risque`
                              : `${formatCurrency(result.annualRevenueLeak, lang)} per year in at-risk opportunities`}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Blurred teaser of insights */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="relative mb-8"
                    >
                      <div className="space-y-3 blur-sm pointer-events-none select-none opacity-60">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 h-20" />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-slate-900/90 border border-teal-500/30 rounded-xl px-6 py-3 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-teal-400" />
                          <span className="text-sm font-semibold text-teal-400">
                            {isFR ? 'Débloquez votre carte détaillée' : 'Unlock your detailed leak map'}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Email gate */}
                    <EmailGate
                      onSubmit={handleEmailSubmit}
                      lang={lang}
                      businessLabel={businessLabel}
                    />
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* ============ RESULTS FULL ============ */}
          {appState === 'results-full' && result && leadData && (
            <motion.div
              key="results-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <section className="relative min-h-screen pt-24 pb-20">
                <AnimatedGridBackground />
                <div className="relative z-10 max-w-7xl mx-auto px-6">
                  <div className="max-w-2xl mx-auto">
                    {/* Greeting */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mb-8"
                    >
                      <SectionLabel>{isFR ? 'Votre audit complet' : 'Your Full Audit'}</SectionLabel>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-50 mb-2">
                        {isFR
                          ? `Voici votre carte de fuites, ${leadData.firstName}.`
                          : `Here's your leak map, ${leadData.firstName}.`}
                      </h2>
                      <p className="text-slate-400">
                        {isFR
                          ? 'Voici où votre entreprise dépend encore trop de suivis manuels — et quel système automatiser en premier.'
                          : "Here's where your business still depends on manual follow-up — and which system to automate first."}
                      </p>
                    </motion.div>

                    {/* Score + revenue */}
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 mb-6"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                        <ScoreRing
                          score={result.aiGrowthScore}
                          label={isFR ? result.scoreLabelFR : result.scoreLabel}
                          color={result.scoreColor}
                        />
                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            {isFR ? 'Fuite opérationnelle estimée' : 'Estimated Operational Leak'}
                          </p>
                          <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 tabular-nums mb-2">
                            {formatCurrency(result.monthlyRevenueLeak, lang)}/mo
                          </div>
                          <p className="text-slate-400 text-sm">
                            {isFR
                              ? `${formatCurrency(result.annualRevenueLeak, lang)} par année`
                              : `${formatCurrency(result.annualRevenueLeak, lang)} per year`}
                          </p>
                        </div>
                      </div>

                      {/* Revenue bar */}
                      <RevenueBar
                        current={result.currentMonthlyRevenue}
                        potential={result.potentialMonthlyRevenue}
                        lang={lang}
                      />
                    </motion.div>

                    {/* Score breakdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mb-6"
                    >
                      <h3 className="text-lg font-bold text-slate-100 mb-4">
                        {isFR ? 'Contrôle par zone' : 'Control by Area'}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: isFR ? 'Entrée des leads' : 'Lead Intake', score: result.responseScore, max: 30 },
                          { label: isFR ? 'Relance soumissions' : 'Quote Follow-Up', score: result.conversionScore, max: 30 },
                          { label: isFR ? 'Capture hors heures' : 'After-Hours Capture', score: result.coverageScore, max: 20 },
                          { label: isFR ? 'Pression volume' : 'Lead Volume Pressure', score: result.volumeScore, max: 20 },
                        ].map((item) => (
                          <div key={item.label} className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4">
                            <p className="text-xs text-slate-500 mb-2 leading-tight">{item.label}</p>
                            <div className="flex items-baseline gap-1 mb-2">
                              <span className="font-mono text-xl font-black text-slate-100">{item.score}</span>
                              <span className="font-mono text-sm text-slate-500">/{item.max}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${
                                  item.score / item.max > 0.7
                                    ? 'bg-teal-500'
                                    : item.score / item.max > 0.4
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.score / item.max) * 100}%` }}
                                transition={{ duration: 1, delay: 0.5 + Math.random() * 0.3 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Insights */}
                    {result.insights.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-8"
                      >
                        <h3 className="text-lg font-bold text-slate-100 mb-4">
                          {isFR ? 'Fuites prioritaires à corriger' : 'Priority Leaks to Fix'}
                        </h3>
                        <div className="space-y-3">
                          {result.insights.map((insight, i) => (
                            <InsightCard key={insight.type} insight={insight} index={i} lang={lang} />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <AutomationBlueprint result={result} lang={lang} />

                    {/* CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-8 sm:p-10 text-center"
                    >
                      <div className="w-14 h-14 rounded-xl bg-teal-500/20 flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-7 h-7 text-teal-400" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-50 mb-3">
                        {isFR ? 'Prêt à combler l\'écart ?' : 'Ready to get your memory out of the system?'}
                      </h3>
                      <p className="text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
                        {isFR ? (
                          <>
                            Réservez un appel découverte gratuit de 30 minutes. On passe en revue votre carte de fuites et on vous montre quel système pourrait protéger les{' '}
                            <span className="text-teal-400 font-bold">{formatCurrency(result.monthlyRevenueLeak, lang)}/mois</span>{' '}
                            à risque dans vos suivis actuels.
                          </>
                        ) : (
                          <>
                            Book a free 30-minute Discovery Call. We'll walk through your leak map and show which system could protect the{' '}
                            <span className="text-teal-400 font-bold">{formatCurrency(result.monthlyRevenueLeak, lang)}/mo</span>{' '}
                            currently at risk in your follow-up process.
                          </>
                        )}
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={handleDownloadSummary}
                          className="inline-flex items-center gap-2 px-6 py-4 border border-teal-400/40 hover:border-teal-300/70 text-teal-300 hover:text-teal-200 font-bold text-base rounded-xl transition-all duration-200 bg-slate-900/40 hover:bg-slate-900/70 active:scale-95"
                        >
                          <Download className="w-5 h-5" />
                          {isFR ? 'Télécharger mon résumé' : 'Download My Audit Summary'}
                        </button>
                        <a
                          href={CALENDAR_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleOperationsSnapshotCallClick}
                          className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-base rounded-xl transition-all duration-200 hover:shadow-[0_0_40px_rgba(20,184,166,0.35)] active:scale-95"
                        >
                          {isFR ? 'Réserver votre appel Operations SnapShot' : 'Book Your Operations SnapShot Call'}
                          <ArrowRight className="w-5 h-5" />
                        </a>
                      </div>
                      <p className="text-xs text-slate-500 mt-4">
                        {isFR
                          ? '30 minutes. Sans pression. Juste de la clarté sur les fuites à automatiser en premier.'
                          : '30 minutes. No pressure. Just clarity on which leaks to automate first.'}
                      </p>
                    </motion.div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-slate-800/60 text-center">
                      <Link href={isFR ? '/fr' : '/'}>
                        <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-6 w-auto mx-auto mb-3 opacity-40 cursor-pointer hover:opacity-70 transition-opacity" />
                      </Link>
                      <p className="text-xs text-slate-600">
                        {isFR ? config.reportSubtitleFR : config.reportSubtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
