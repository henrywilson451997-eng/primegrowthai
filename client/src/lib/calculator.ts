/*
 * Automation Leak Audit — Scoring Engine
 *
 * Vertical: Sub-Trades & General Contractors (Quebec / Canada)
 * Calculates an operational leak estimate and automation control score based on 5 business inputs.
 *
 * Math derived from:
 * - Lead Response Management Study (InsideSales.com / Harvard Business Review)
 * - Industry benchmarks for sub-trades and GCs in Canada
 * - PrimeGrowth AI field data from Quebec contractor market
 *
 * Key assumptions for sub-trades/GCs:
 * - Optimal conversion rate: 40% (realistic for well-run sub-trade)
 * - After-hours lead rate: 30% (mix of homeowner + GC referrals)
 * - First responder wins bid: 78% of the time (InsideSales.com)
 */

// --- Types ---

export type Vertical = 'contractor';

export interface VerticalConfig {
  id: Vertical;
  label: string;
  icon: string;
  tagline: string;
  businessTerm: string;   // "company"
  clientTerm: string;     // "customer" / "client"
  bookingTerm: string;    // "estimate" / "bid"
  questions: Question[];
  afterHoursPercent: number;
  optimalConversionRate: number;
  emailPlaceholder: { name: string; email: string; business: string };
  reportSubtitle: string;
  reportSubtitleFR: string;
}

export interface Question {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  titleFR: string;
  subtitleFR: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  label: string;
  value: number;
  description?: string;
  labelFR?: string;
  descriptionFR?: string;
}

export interface CalculatorAnswers {
  monthlyLeads: number;
  avgServiceValue: number;
  responseTime: number;     // in minutes
  bookingRate: number;      // as decimal (0–1)
  afterHoursCoverage: number; // 1.0, 0.7, or 0.4
}

export interface ScoreResult {
  aiGrowthScore: number;
  scoreLabel: string;
  scoreLabelFR: string;
  scoreColor: string;
  monthlyRevenueLeak: number;
  annualRevenueLeak: number;
  currentMonthlyRevenue: number;
  potentialMonthlyRevenue: number;
  responseScore: number;
  conversionScore: number;
  coverageScore: number;
  volumeScore: number;
  insights: Insight[];
}

export interface Insight {
  title: string;
  titleFR: string;
  description: string;
  descriptionFR: string;
  impact: number;
  type: 'response' | 'coverage' | 'conversion';
}

// --- Vertical Configuration ---

export const verticals: Record<Vertical, VerticalConfig> = {
  contractor: {
    id: 'contractor',
    label: 'Contractor Automation Leak Audit',
    icon: '⚡',
    tagline: 'Lead intake, quote follow-up, after-hours capture, and admin handoffs',
    businessTerm: 'company',
    clientTerm: 'client',
    bookingTerm: 'estimate',
    // 30% of leads arrive outside business hours (mix of homeowners + GC referrals)
    afterHoursPercent: 0.30,
    // Well-run sub-trade converts 35–40% of qualified leads
    optimalConversionRate: 0.40,
    emailPlaceholder: {
      name: 'Marc',
      email: 'marc@eliteelectrique.com',
      business: 'Élite Électrique',
    },
    reportSubtitle: 'Automation Leak Audit for Sub-Trades & General Contractors',
    reportSubtitleFR: 'Audit des fuites d’automatisation pour sous-traitants et entrepreneurs généraux',
    questions: [
      {
        id: 'monthlyLeads',
        number: 1,
        title: 'How many new leads or quote requests hit your business each month?',
        subtitle: 'Include calls, texts, emails, referrals, website forms, Facebook leads, and GC bid invites',
        titleFR: 'Combien de nouvelles demandes ou invitations à soumission recevez-vous par mois ?',
        subtitleFR: 'Incluez appels, textos, courriels, références, formulaires web, leads Facebook et invitations d’EG',
        options: [
          { label: 'Under 10', value: 6, description: 'Low volume', labelFR: 'Moins de 10', descriptionFR: 'Faible volume' },
          { label: '10–25', value: 17, description: 'Manageable by owner memory', labelFR: '10–25', descriptionFR: 'Encore gérable de mémoire' },
          { label: '25–50', value: 37, description: 'Leaks start hiding', labelFR: '25–50', descriptionFR: 'Les fuites commencent à se cacher' },
          { label: '50–100', value: 75, description: 'Needs a real intake system', labelFR: '50–100', descriptionFR: 'Nécessite un vrai système d’entrée' },
          { label: '100+', value: 130, description: 'Owner memory will break', labelFR: '100+', descriptionFR: 'La mémoire du propriétaire va casser' },
        ],
      },
      {
        id: 'avgServiceValue',
        number: 2,
        title: 'What is the average value of a job that slips if nobody follows up properly?',
        subtitle: 'Use the common job size you actually care about protecting — not your biggest outlier',
        titleFR: 'Quelle est la valeur moyenne d’un chantier qui peut glisser sans bon suivi ?',
        subtitleFR: 'Utilisez le chantier typique que vous voulez protéger — pas votre plus gros cas exceptionnel',
        options: [
          { label: 'Under $2,000', value: 1200, labelFR: 'Moins de 2 000 $' },
          { label: '$2,000–$8,000', value: 5000, labelFR: '2 000 $–8 000 $' },
          { label: '$8,000–$25,000', value: 15000, labelFR: '8 000 $–25 000 $' },
          { label: '$25,000–$75,000', value: 45000, labelFR: '25 000 $–75 000 $' },
          { label: '$75,000+', value: 110000, labelFR: '75 000 $+' },
        ],
      },
      {
        id: 'responseTime',
        number: 3,
        title: 'How long before a new lead gets a real first response?',
        subtitle: 'This is the first automation leak: call, text, form, referral, or GC invite arrives — what happens next?',
        titleFR: 'Combien de temps avant qu’une nouvelle demande reçoive une vraie première réponse ?',
        subtitleFR: 'C’est la première fuite d’automatisation : appel, texto, formulaire, référence ou invitation d’EG — que se passe-t-il ensuite ?',
        options: [
          { label: 'Under 5 minutes', value: 3, description: 'Systemized intake', labelFR: 'Moins de 5 minutes', descriptionFR: 'Entrée de leads systémisée' },
          { label: '5–30 minutes', value: 15, description: 'Mostly controlled', labelFR: '5–30 minutes', descriptionFR: 'Assez contrôlé' },
          { label: '30 min – 2 hours', value: 60, description: 'Depends on availability', labelFR: '30 min – 2 heures', descriptionFR: 'Dépend de la disponibilité' },
          { label: '2–8 hours', value: 300, description: 'Owner is the bottleneck', labelFR: '2–8 heures', descriptionFR: 'Le propriétaire est le goulot' },
          { label: 'Next business day+', value: 960, description: 'Critical intake leak', labelFR: 'Prochain jour ouvrable+', descriptionFR: 'Fuite critique à l’entrée' },
        ],
      },
      {
        id: 'bookingRate',
        number: 4,
        title: 'What percentage of leads move cleanly to estimate booked, quote sent, or job won?',
        subtitle: 'This exposes the follow-up leak between first contact, estimate, quote, reminder, and decision',
        titleFR: 'Quel pourcentage des demandes passent proprement à la soumission ou au chantier gagné ?',
        subtitleFR: 'Cela expose la fuite entre premier contact, visite, soumission, relance et décision',
        options: [
          { label: 'Under 10%', value: 0.07, description: 'Follow-up is leaking badly', labelFR: 'Moins de 10 %', descriptionFR: 'Le suivi fuit fortement' },
          { label: '10–20%', value: 0.15, description: 'Many jobs need chasing', labelFR: '10–20 %', descriptionFR: 'Beaucoup de dossiers doivent être relancés' },
          { label: '20–35%', value: 0.275, description: 'Decent, but manual', labelFR: '20–35 %', descriptionFR: 'Correct, mais manuel' },
          { label: '35–50%', value: 0.425, description: 'Healthy control', labelFR: '35–50 %', descriptionFR: 'Bon contrôle' },
          { label: 'Over 50%', value: 0.55, description: 'Strong pipeline discipline', labelFR: 'Plus de 50 %', descriptionFR: 'Discipline de pipeline forte' },
        ],
      },
      {
        id: 'afterHoursCoverage',
        number: 5,
        title: 'What happens to leads, callbacks, and quote questions after 5 PM or on weekends?',
        subtitle: 'Most contractors do not need to work 24/7 — they need a system that acknowledges and routes the request',
        titleFR: 'Que se passe-t-il avec les demandes, rappels et questions de soumission après 17 h ou la fin de semaine ?',
        subtitleFR: 'Un entrepreneur n’a pas besoin de travailler 24/7 — il a besoin d’un système qui accuse réception et route la demande',
        options: [
          { label: 'Auto-acknowledged and routed', value: 1.0, description: 'Always captured', labelFR: 'Réponse automatique et routage', descriptionFR: 'Toujours capté' },
          { label: 'Sometimes handled next morning', value: 0.7, description: 'Partial safety net', labelFR: 'Parfois traité le lendemain', descriptionFR: 'Filet de sécurité partiel' },
          { label: 'Nothing until business hours', value: 0.4, description: 'After-hours leak', labelFR: 'Rien avant les heures ouvrables', descriptionFR: 'Fuite hors heures' },
        ],
      },
    ],
  },
};

// Helper to get questions for a vertical
export function getQuestions(vertical: Vertical): Question[] {
  return verticals[vertical].questions;
}

// --- Response time penalty factors ---
// Based on InsideSales.com / HBR speed-to-lead research
function getResponseTimePenalty(minutes: number): number {
  if (minutes <= 5) return 1.0;
  if (minutes <= 30) return 0.60;
  if (minutes <= 120) return 0.32;
  if (minutes <= 480) return 0.14;
  return 0.06;
}

// --- Score component calculations (max 100 total) ---
// Response speed: 30 pts (biggest lever for sub-trades)
// Conversion rate: 30 pts
// After-hours coverage: 20 pts
// Lead volume: 20 pts

function getResponseScore(minutes: number): number {
  if (minutes <= 5) return 30;
  if (minutes <= 30) return 22;
  if (minutes <= 120) return 13;
  if (minutes <= 480) return 5;
  return 0;
}

function getConversionScore(rate: number): number {
  if (rate >= 0.50) return 30;
  if (rate >= 0.35) return 24;
  if (rate >= 0.20) return 16;
  if (rate >= 0.10) return 8;
  return 0;
}

function getCoverageScore(factor: number): number {
  if (factor >= 1.0) return 20;
  if (factor >= 0.7) return 12;
  return 0;
}

function getVolumeScore(leads: number): number {
  if (leads >= 100) return 20;
  if (leads >= 50) return 16;
  if (leads >= 25) return 12;
  if (leads >= 10) return 8;
  return 4;
}

function getScoreLabel(score: number): { label: string; labelFR: string; color: string } {
  if (score >= 86) return { label: 'Controlled', labelFR: 'Contrôlé', color: 'signal' };
  if (score >= 71) return { label: 'Mostly Controlled', labelFR: 'Assez contrôlé', color: 'signal' };
  if (score >= 51) return { label: 'Leaky', labelFR: 'Fuites présentes', color: 'amber' };
  if (score >= 31) return { label: 'High Leakage', labelFR: 'Fuites élevées', color: 'coral' };
  return { label: 'Critical Leakage', labelFR: 'Fuites critiques', color: 'coral' };
}

// --- Main calculation ---
export function calculateScore(answers: CalculatorAnswers, vertical: Vertical): ScoreResult {
  const { monthlyLeads, avgServiceValue, responseTime, bookingRate, afterHoursCoverage } = answers;
  const config = verticals[vertical];

  const optimalConversionRate = config.optimalConversionRate;
  const afterHoursPercent = config.afterHoursPercent;

  // Response time penalty
  const responseTimePenalty = getResponseTimePenalty(responseTime);

  // After-hours missed leads
  const afterHoursMissedLeads = monthlyLeads * afterHoursPercent * (1 - afterHoursCoverage);

  // Current revenue from leads
  const currentMonthlyRevenue = monthlyLeads * bookingRate * avgServiceValue;

  // Systemized follow-up conversion rate
  // Cap improvement at 2.5x current rate to keep numbers credible
  const aiConversion = Math.min(optimalConversionRate, bookingRate * 2.5);

  // Potential revenue with automated intake and follow-up coverage
  const totalPotentialLeads = monthlyLeads + afterHoursMissedLeads;
  const potentialMonthlyRevenue = totalPotentialLeads * aiConversion * avgServiceValue;

  // Revenue gap
  const monthlyRevenueLeak = Math.max(0, potentialMonthlyRevenue - currentMonthlyRevenue);
  const annualRevenueLeak = monthlyRevenueLeak * 12;

  // Score components
  const responseScoreVal = getResponseScore(responseTime);
  const conversionScoreVal = getConversionScore(bookingRate);
  const coverageScoreVal = getCoverageScore(afterHoursCoverage);
  const volumeScoreVal = getVolumeScore(monthlyLeads);

  const totalScore = responseScoreVal + conversionScoreVal + coverageScoreVal + volumeScoreVal;
  const { label, labelFR, color } = getScoreLabel(totalScore);

  // Generate personalized insights
  const insights: Insight[] = [];

  // Response time insight
  if (responseTime > 5) {
    const fastResponseRevenue = monthlyLeads * aiConversion * avgServiceValue;
    const responseImpact = fastResponseRevenue - currentMonthlyRevenue;
    if (responseImpact > 0) {
      const delayDesc =
        responseTime >= 960
          ? `Waiting until the next business day means you lose ~94% of potential conversions. The GC or homeowner has already called your competitor. A lead-intake automation can acknowledge, qualify, and route the request immediately.`
          : responseTime >= 300
          ? `A ${Math.round(responseTime / 60)}-hour delay drops your bid win rate by ${Math.round((1 - responseTimePenalty) * 100)}%. Sub-trades who respond first win 78% of the time.`
          : `Even a ${responseTime}-minute delay reduces your conversion rate by ${Math.round((1 - responseTimePenalty) * 100)}%. Lead intake is the first system to automate because every later step depends on it.`;

      const delayDescFR =
        responseTime >= 960
          ? `Attendre le prochain jour ouvrable signifie perdre ~94 % de vos conversions potentielles. L'EG ou le propriétaire a déjà appelé votre concurrent. Une automatisation d’entrée de leads peut accuser réception, qualifier et router la demande immédiatement.`
          : responseTime >= 300
          ? `Un délai de ${Math.round(responseTime / 60)} heures réduit votre taux de conversion de ${Math.round((1 - responseTimePenalty) * 100)} %. Les sous-traitants qui répondent en premier remportent 78 % des contrats.`
          : `Même un délai de ${responseTime} minutes réduit votre taux de conversion de ${Math.round((1 - responseTimePenalty) * 100)} %. L’entrée de leads est le premier système à automatiser, parce que chaque étape suivante en dépend.`;

      insights.push({
        title: 'Lead Intake Leak',
        titleFR: 'Fuite à l’entrée des leads',
        description: delayDesc,
        descriptionFR: delayDescFR,
        impact: Math.round(responseImpact),
        type: 'response',
      });
    }
  }

  // After-hours insight
  if (afterHoursCoverage < 1.0) {
    const missedRevenue = afterHoursMissedLeads * aiConversion * avgServiceValue;
    if (missedRevenue > 0) {
      const coverageDesc =
        afterHoursCoverage <= 0.4
          ? `You're missing ~${Math.round(afterHoursMissedLeads)} leads per month that come in after hours — including GC referrals sent at 7 PM. Those bids go to whoever picks up first.`
          : `Partial coverage still means ~${Math.round(afterHoursMissedLeads)} leads per month slip through. A GC who sends a referral at 8 PM expects a response before morning.`;

      const coverageDescFR =
        afterHoursCoverage <= 0.4
          ? `Vous ratez ~${Math.round(afterHoursMissedLeads)} demandes par mois reçues hors heures ouvrables — y compris les références d'EG envoyées à 19 h. Ces soumissions vont à celui qui répond en premier.`
          : `Une couverture partielle signifie encore ~${Math.round(afterHoursMissedLeads)} demandes manquées par mois. Un EG qui envoie une référence à 20 h s'attend à une réponse avant le matin.`;

      insights.push({
        title: 'After-Hours Capture Leak',
        titleFR: 'Fuite de capture hors heures',
        description: coverageDesc,
        descriptionFR: coverageDescFR,
        impact: Math.round(missedRevenue),
        type: 'coverage',
      });
    }
  }

  // Conversion rate insight
  if (bookingRate < 0.35) {
    const improvedRate = Math.min(0.40, bookingRate * 1.8);
    const conversionImpact = monthlyLeads * (improvedRate - bookingRate) * avgServiceValue;
    if (conversionImpact > 0) {
      insights.push({
        title: 'Quote Follow-Up Leak',
        titleFR: 'Fuite de relance des soumissions',
        description: `At ${Math.round(bookingRate * 100)}%, you're leaving bids on the table. Automated follow-up, faster estimate handoffs, and quote reminders can push this toward ${Math.round(improvedRate * 100)}%+ without adding headcount.`,
        descriptionFR: `À ${Math.round(bookingRate * 100)} %, vous laissez des soumissions sur la table. Le suivi automatisé, des transferts de soumission plus rapides et des rappels peuvent faire avancer ce taux vers ${Math.round(improvedRate * 100)} %+ sans embaucher.`,
        impact: Math.round(conversionImpact),
        type: 'conversion',
      });
    }
  }

  // Sort by impact descending
  insights.sort((a, b) => b.impact - a.impact);

  return {
    aiGrowthScore: totalScore,
    scoreLabel: label,
    scoreLabelFR: labelFR,
    scoreColor: color,
    monthlyRevenueLeak: Math.round(monthlyRevenueLeak),
    annualRevenueLeak: Math.round(annualRevenueLeak),
    currentMonthlyRevenue: Math.round(currentMonthlyRevenue),
    potentialMonthlyRevenue: Math.round(potentialMonthlyRevenue),
    responseScore: responseScoreVal,
    conversionScore: conversionScoreVal,
    coverageScore: coverageScoreVal,
    volumeScore: volumeScoreVal,
    insights,
  };
}

// Format currency (CAD)
export function formatCurrency(amount: number, lang: 'en' | 'fr' = 'en'): string {
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
