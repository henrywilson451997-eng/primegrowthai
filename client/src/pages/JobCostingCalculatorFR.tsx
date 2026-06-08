/*
 * PrimeGrowth AI — Audit Coûts de Chantier + Sauvetage de Soumission (FR)
 * Route: /fr/outils/calculateur-couts-chantier
 * Design: Deep Navy + Teal (matching site design system)
 * Gate: Résultats partiellement floutés → débloqués par email
 * v3: Ajoute presets par métier, simulation de dépassement, alertes d'extra, et sommaire téléchargeable
 */
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { GHL_WEBHOOKS, sendGhlWebhookGet } from "@/lib/ghlWebhook";
import { trackMetaCustomEvent } from "@/lib/metaPixel";
import { useEffect, useState, useRef } from "react";

const LOGO_URL =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/OyhhiQPpFBkvMcYg.png";
const CALENDAR_LINK = "https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO";

const TOOLKIT_UNLOCK_KEY = "pg_construction_toolkit_unlocked";

// ── PROFILS DE FRAIS GÉNÉRAUX ─────────────────────────────────────────────────
const OVERHEAD_PROFILES = [
  {
    id: "solo",
    rate: 0.08,
    label: "Travailleur autonome",
    desc: "Juste toi — pas de bureau, pas d'admin, outils dans ton truck",
    badge: "8%",
  },
  {
    id: "small",
    rate: 0.12,
    label: "Petite équipe (2–5 travailleurs)",
    desc: "Petite équipe, équipement de base, pas de bureau dédié",
    badge: "12%",
  },
  {
    id: "established",
    rate: 0.18,
    label: "Opération établie (5–15 travailleurs)",
    desc: "Bureau ou atelier, véhicules de compagnie, équipement, admin à temps partiel",
    badge: "18%",
  },
  {
    id: "full",
    rate: 0.25,
    label: "Grande opération (15+ travailleurs)",
    desc: "Bureau complet, plusieurs véhicules, équipement lourd, personnel admin à temps plein",
    badge: "25%",
  },
];

const TRADE_PRESETS = [
  {
    id: "renovation",
    label: "Rénovation / GC",
    desc: "Main-d'œuvre mixte, changements client, plusieurs transferts de chantier",
    hourlyRate: "58",
    targetMargin: "24",
    overheadProfileId: "established",
    riskHint: "Surveille les extras et les changements client avant qu'ils deviennent du travail gratuit.",
  },
  {
    id: "ceramic",
    label: "Céramique / Tuile",
    desc: "Chantiers avec risque de matériaux, motif, substrat et préparation du site",
    hourlyRate: "52",
    targetMargin: "22",
    overheadProfileId: "small",
    riskHint: "Confirme le substrat, les changements de motif et les délais de matériaux par écrit.",
  },
  {
    id: "excavation",
    label: "Excavation",
    desc: "Travail avec équipement où une mauvaise journée peut effacer la marge",
    hourlyRate: "85",
    targetMargin: "25",
    overheadProfileId: "established",
    riskHint: "Sépare machinerie, transport, sol inconnu et météo de la portée de base.",
  },
  {
    id: "concrete",
    label: "Béton / Coffrage",
    desc: "Timing d'équipe, fenêtre de coulée, pompe/camion et risque de reprise",
    hourlyRate: "65",
    targetMargin: "23",
    overheadProfileId: "established",
    riskHint: "Verrouille conditions de coulée, accès, changements de coffrage et temps d'attente.",
  },
  {
    id: "roofing",
    label: "Toiture / Extérieur",
    desc: "Production rapide, météo, substrat caché et risque de portée",
    hourlyRate: "60",
    targetMargin: "24",
    overheadProfileId: "small",
    riskHint: "Nomme le substrat caché, la météo, l'accès et les surplus de disposition.",
  },
];

const OVERRUN_SCENARIOS = [0.1, 0.2, 0.3];

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Inputs {
  workers: string;
  hourlyRate: string;
  estimatedHours: string;
  materialCost: string;
  targetMargin: string;
  overheadProfileId: string;
  tradePresetId: string;
}

interface OverrunScenario {
  label: string;
  overrunPct: number;
  totalCost: number;
  profit: number;
  margin: number;
  shortfall: number;
  status: "safe" | "watch" | "danger";
}

interface Results {
  labourCost: number;
  totalDirectCost: number;
  overheadAmount: number;
  overheadRate: number;
  totalProjectCost: number;
  minimumQuote: number;
  profitAtMinimum: number;
  profitMarginActual: number;
  dailyLabourBurn: number;
  breakEvenDays: number;
  riskFlag: string | null;
  changeOrderWarning: string | null;
  quoteSafety: "safe" | "watch" | "danger";
  overrunScenarios: OverrunScenario[];
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function calcResults(inputs: Inputs): Results | null {
  const workers = parseFloat(inputs.workers);
  const hourlyRate = parseFloat(inputs.hourlyRate);
  const estimatedHours = parseFloat(inputs.estimatedHours);
  const materialCost = parseFloat(inputs.materialCost);
  const targetMargin = parseFloat(inputs.targetMargin) / 100;
  const profile = OVERHEAD_PROFILES.find((p) => p.id === inputs.overheadProfileId);
  if (!profile) return null;
  const overhead = profile.rate;

  if (isNaN(workers) || isNaN(hourlyRate) || isNaN(estimatedHours) ||
    isNaN(materialCost) || isNaN(targetMargin)) return null;

  const labourCost = hourlyRate * estimatedHours;
  const totalDirectCost = labourCost + materialCost;
  const overheadAmount = totalDirectCost * overhead;
  const totalProjectCost = totalDirectCost + overheadAmount;
  const minimumQuote = totalProjectCost / (1 - targetMargin);
  const profitAtMinimum = minimumQuote - totalProjectCost;
  const profitMarginActual = (profitAtMinimum / minimumQuote) * 100;
  const dailyLabourBurn = workers * hourlyRate * 8;
  const breakEvenDays = totalProjectCost / dailyLabourBurn;

  const overrunScenarios: OverrunScenario[] = OVERRUN_SCENARIOS.map((pct) => {
    const overrunLabourCost = hourlyRate * estimatedHours * (1 + pct);
    const overrunDirectCost = overrunLabourCost + materialCost;
    const overrunTotalCost = overrunDirectCost + overrunDirectCost * overhead;
    const profit = minimumQuote - overrunTotalCost;
    const margin = (profit / minimumQuote) * 100;
    const shortfall = Math.max(0, overrunTotalCost / (1 - targetMargin) - minimumQuote);
    const status: OverrunScenario["status"] = profit < 0 ? "danger" : margin < targetMargin * 100 * 0.65 ? "watch" : "safe";
    return { label: `+${Math.round(pct * 100)} % heures`, overrunPct: pct, totalCost: overrunTotalCost, profit, margin, shortfall, status };
  });

  const quoteSafety: Results["quoteSafety"] = overrunScenarios.some((s) => s.status === "danger")
    ? "danger"
    : overrunScenarios.some((s) => s.status === "watch")
      ? "watch"
      : "safe";

  let riskFlag: string | null = null;
  if (targetMargin < 0.15)
    riskFlag = "Ta marge cible est sous 15 %. Un seul extra non prévu peut te mettre dans le rouge.";
  else if (materialCost / totalDirectCost > 0.6)
    riskFlag = "Les matériaux représentent plus de 60 % de tes coûts directs. Une hausse de prix chez ton fournisseur peut écraser ta marge rapidement.";
  else if (estimatedHours / (workers * 8) > 30)
    riskFlag = "Ce chantier dure plus de 30 jours ouvrables. Les dépassements de main-d'œuvre deviennent beaucoup plus probables à cette échelle.";

  let changeOrderWarning: string | null = null;
  const twentyPctScenario = overrunScenarios.find((s) => s.overrunPct === 0.2);
  if (twentyPctScenario && twentyPctScenario.status !== "safe")
    changeOrderWarning = "Alerte sauvetage de soumission : si la main-d'œuvre dépasse de 20 %, ta soumission originale ne protège plus la marge cible. Documente les extras, délais de site et changements de portée avant que l'équipe les absorbe gratuitement.";
  else if (targetMargin < 0.2)
    changeOrderWarning = "Alerte extra : cette soumission n'a pas beaucoup de coussin. Tout changement demandé par le client devrait devenir une approbation écrite avant de continuer.";

  return {
    labourCost, totalDirectCost, overheadAmount, overheadRate: overhead,
    totalProjectCost, minimumQuote, profitAtMinimum, profitMarginActual,
    dailyLabourBurn, breakEvenDays, riskFlag, changeOrderWarning, quoteSafety, overrunScenarios,
  };
}

function fmt(n: number) {
  return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

function formatMargin(n: number) {
  return `${n.toFixed(1)} %`;
}

function quoteSafetyLabel(status: Results["quoteSafety"]) {
  if (status === "danger") return "Soumission à risque";
  if (status === "watch") return "À surveiller";
  return "Marge protégée";
}

function buildDiagnosticTags(results: Results | null) {
  return [
    "calculator-lead",
    "ig-funnel",
    "job-costing-calculator",
    "quote-rescue-audit",
    "contractor",
    "fr",
    results ? `quote_safety_${results.quoteSafety}` : null,
    results?.riskFlag ? "risk_margin_warning" : null,
    results?.changeOrderWarning ? "risk_change_order_warning" : null,
  ].filter((tag): tag is string => Boolean(tag));
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ── ANIMATED BACKGROUND ───────────────────────────────────────────────────────
function AnimatedGridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(13,148,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-3xl" />
    </div>
  );
}

// ── INPUT FIELD ───────────────────────────────────────────────────────────────
function InputField({ label, sublabel, value, onChange, prefix, suffix, placeholder, min, max }: {
  label: string; sublabel?: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; placeholder?: string; min?: number; max?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-200">
        {label}
        {sublabel && <span className="ml-2 text-xs font-normal text-slate-500">{sublabel}</span>}
      </label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3.5 text-slate-400 text-sm font-medium pointer-events-none select-none">{prefix}</span>}
        <input
          type="number" value={value} min={min} max={max} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-100 text-sm py-3 pr-4 outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-600 ${prefix ? "pl-8" : "pl-4"} ${suffix ? "pr-12" : ""}`}
        />
        {suffix && <span className="absolute right-3.5 text-slate-400 text-sm font-medium pointer-events-none select-none">{suffix}</span>}
      </div>
    </div>
  );
}

// ── TRADE PRESET SELECTOR ─────────────────────────────────────────────────────
function TradePresetSelector({ value, onSelect }: { value: string; onSelect: (id: string) => void }) {
  return (
    <div className="sm:col-span-2 flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-200">
        Preset par métier
        <span className="ml-2 text-xs font-normal text-slate-500">point de départ plus intelligent; tu peux tout modifier</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {TRADE_PRESETS.map((preset) => {
          const selected = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={`text-left rounded-xl border px-4 py-3 transition-all duration-200 ${
                selected
                  ? "border-sky-500/60 bg-sky-500/10 ring-2 ring-sky-500/20"
                  : "border-slate-700/60 bg-slate-800/40 hover:border-slate-600/60 hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-semibold ${selected ? "text-sky-300" : "text-slate-200"}`}>{preset.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selected ? "bg-sky-500/20 text-sky-300" : "bg-slate-700/60 text-slate-400"}`}>
                  {preset.targetMargin} % cible
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{preset.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── OVERHEAD PROFILE SELECTOR ─────────────────────────────────────────────────
function OverheadSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="sm:col-span-2 flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-200">
        Infrastructure de ton entreprise
        <span className="ml-2 text-xs font-normal text-slate-500">détermine tes frais généraux</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {OVERHEAD_PROFILES.map((profile) => {
          const selected = value === profile.id;
          return (
            <button
              key={profile.id}
              type="button"
              onClick={() => onChange(profile.id)}
              className={`text-left rounded-xl border px-4 py-3 transition-all duration-200 ${
                selected
                  ? "border-teal-500/60 bg-teal-500/10 ring-2 ring-teal-500/20"
                  : "border-slate-700/60 bg-slate-800/40 hover:border-slate-600/60 hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-semibold ${selected ? "text-teal-300" : "text-slate-200"}`}>
                  {profile.label}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  selected ? "bg-teal-500/20 text-teal-400" : "bg-slate-700/60 text-slate-400"
                }`}>
                  {profile.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{profile.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── RESULT ROW ────────────────────────────────────────────────────────────────
function ResultRow({ label, value, highlight, sublabel }: {
  label: string; value: string; highlight?: boolean; sublabel?: string;
}) {
  return (
    <div className={`flex items-center justify-between py-3 px-4 rounded-xl ${
      highlight ? "bg-teal-500/10 border border-teal-500/20" : "bg-slate-800/40 border border-slate-700/30"
    }`}>
      <div>
        <p className={`text-sm font-medium ${highlight ? "text-teal-300" : "text-slate-300"}`}>{label}</p>
        {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
      </div>
      <p className={`text-base font-bold tabular-nums ${highlight ? "text-teal-400" : "text-slate-100"}`}>{value}</p>
    </div>
  );
}

// ── EMAIL GATE OVERLAY ────────────────────────────────────────────────────────
function EmailGate({ onUnlock, isLoading }: {
  onUnlock: (email: string, name: string, phone: string) => void; isLoading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Entrez votre nom."); return; }
    if (!email.includes("@") || !email.includes(".")) { setError("Entrez une adresse courriel valide."); return; }
    setError("");
    onUnlock(email, name, phone);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl"
      style={{ backdropFilter: "blur(12px)", background: "rgba(15,23,42,0.85)" }}
    >
      <div className="w-full max-w-sm mx-4 text-center">
        <div className="w-12 h-12 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-50 mb-1">Tes résultats sont prêts</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Entre tes infos pour débloquer ton analyse complète : coûts, soumission minimale et marge.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Ton nom" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-100 text-sm py-3 px-4 outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-500" />
          <input type="email" placeholder="Courriel professionnel" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-100 text-sm py-3 px-4 outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-500" />
          <input type="tel" placeholder="Téléphone (optionnel)" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-100 text-sm py-3 px-4 outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-500" />
          {error && <p className="text-xs text-red-400 text-left">{error}</p>}
          <button type="submit" disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-teal-500/25 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoading ? "Déverrouillage..." : "Débloquer mes résultats →"}
          </button>
          <p className="text-xs text-slate-600">Pas de spam. On t'envoie aussi l'analyse par courriel.</p>
        </form>
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function JobCostingCalculatorFR() {
  useSEO({
    title: "Audit Coûts de Chantier + Sauvetage de Soumission | PrimeGrowth AI",
    description: "Outil gratuit pour entrepreneurs en construction. Entre ton métier, ton équipe, tes heures et tes matériaux pour obtenir ta soumission minimale sécuritaire, tes scénarios de dépassement et tes alertes d'extra.",
    canonical: "https://www.primegrowthai.com/fr/outils/calculateur-couts-chantier",
    lang: "fr",
    alternateHref: "https://www.primegrowthai.com/tools/job-costing-calculator",
    alternateLang: "en",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Audit Coûts de Chantier + Sauvetage de Soumission",
      "description": "Outil gratuit de sauvetage de soumission avec soumission minimale sécuritaire, simulation de dépassement et alertes d'extra.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CAD" },
      "url": "https://www.primegrowthai.com/fr/outils/calculateur-couts-chantier",
      "provider": { "@type": "Organization", "name": "PrimeGrowth AI" }
    }
  });

  const [inputs, setInputs] = useState<Inputs>({
    workers: "", hourlyRate: "", estimatedHours: "", materialCost: "",
    targetMargin: "20", overheadProfileId: "", tradePresetId: "",
  });

  const [hasCalculated, setHasCalculated] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const toolkitUnlocked = params.get("toolkit") === "unlocked" || Boolean(window.localStorage.getItem(TOOLKIT_UNLOCK_KEY));
      if (toolkitUnlocked) setIsUnlocked(true);
    } catch {
      // Conserver le gate autonome si l'accès trousse ne peut pas être vérifié localement.
    }
  }, []);

  const results = calcResults(inputs);
  const isComplete = inputs.workers && inputs.hourlyRate && inputs.estimatedHours &&
    inputs.materialCost && inputs.overheadProfileId;

  const handleCalculate = () => {
    if (!isComplete || !results) return;
    setHasCalculated(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleUnlock = async (email: string, name: string, phone: string) => {
    setIsSubmitting(true);
    const profile = OVERHEAD_PROFILES.find((p) => p.id === inputs.overheadProfileId);
    const preset = TRADE_PRESETS.find((p) => p.id === inputs.tradePresetId);
    const overrun10 = results?.overrunScenarios.find((s) => s.overrunPct === 0.1);
    const overrun20 = results?.overrunScenarios.find((s) => s.overrunPct === 0.2);
    const overrun30 = results?.overrunScenarios.find((s) => s.overrunPct === 0.3);
    try {
      await sendGhlWebhookGet(GHL_WEBHOOKS.websiteCalculatorForm, {
          firstName: name.split(" ")[0] || name,
          lastName: name.split(" ").slice(1).join(" ") || "",
          email, phone: phone || "",
          source: "calculateur-couts-chantier-fr",
          tags: buildDiagnosticTags(results),
          customFields: {
            workers: inputs.workers,
            allInHourlyCostPerWorker: inputs.hourlyRate,
            estimatedHours: inputs.estimatedHours,
            materialCost: inputs.materialCost,
            targetMargin: inputs.targetMargin,
            tradePreset: preset?.label || "Personnalisé",
            overheadProfile: profile?.label || "",
            overheadRate: profile ? `${(profile.rate * 100).toFixed(0)}%` : "",
            quoteSafety: results ? quoteSafetyLabel(results.quoteSafety) : "",
            quoteSafetyCode: results?.quoteSafety || "",
            labourCost: results ? Math.round(results.labourCost) : "",
            totalProjectCost: results ? Math.round(results.totalProjectCost) : "",
            overheadAmount: results ? Math.round(results.overheadAmount) : "",
            minimumQuote: results ? Math.round(results.minimumQuote) : "",
            profitAtMinimumQuote: results ? Math.round(results.profitAtMinimum) : "",
            profitMargin: results ? results.profitMarginActual.toFixed(1) : "",
            dailyLabourBurn: results ? Math.round(results.dailyLabourBurn) : "",
            breakEvenDays: results ? results.breakEvenDays.toFixed(1) : "",
            overrun10Profit: overrun10 ? Math.round(overrun10.profit) : "",
            overrun10Margin: overrun10 ? overrun10.margin.toFixed(1) : "",
            overrun20Profit: overrun20 ? Math.round(overrun20.profit) : "",
            overrun20Margin: overrun20 ? overrun20.margin.toFixed(1) : "",
            overrun20Shortfall: overrun20 ? Math.round(overrun20.shortfall) : "",
            overrun30Profit: overrun30 ? Math.round(overrun30.profit) : "",
            overrun30Margin: overrun30 ? overrun30.margin.toFixed(1) : "",
            riskWarning: results?.riskFlag || "",
            changeOrderWarning: results?.changeOrderWarning || "",
          },
      });
    } catch { /* fail silently */ }
    finally {
      setIsSubmitting(false);
      setIsUnlocked(true);
    }
  };

  const set = (key: keyof Inputs) => (v: string) => setInputs((p) => ({ ...p, [key]: v }));

  const applyTradePreset = (id: string) => {
    const preset = TRADE_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setInputs((prev) => ({
      ...prev,
      tradePresetId: id,
      hourlyRate: prev.hourlyRate || preset.hourlyRate,
      targetMargin: preset.targetMargin,
      overheadProfileId: prev.overheadProfileId || preset.overheadProfileId,
    }));
  };

  const handleDownloadSummary = () => {
    if (!results) return;
    const profile = OVERHEAD_PROFILES.find((p) => p.id === inputs.overheadProfileId);
    const preset = TRADE_PRESETS.find((p) => p.id === inputs.tradePresetId);
    const overrun20 = results.overrunScenarios.find((s) => s.overrunPct === 0.2);
    const safePresetName = (preset?.label || "personnalise")
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "personnalise";

    const summary = [
      "PrimeGrowth AI — Audit Coûts de Chantier + Sauvetage de Soumission",
      "Sommaire prêt pour suivi commercial entrepreneur",
      "",
      "PROFIL DU PROJET",
      `Preset métier : ${preset?.label || "Personnalisé"}`,
      `Travailleurs : ${inputs.workers}`,
      `Coût horaire complet par travailleur : ${fmt(parseFloat(inputs.hourlyRate))}`,
      `Heures totales estimées : ${inputs.estimatedHours}`,
      `Coût des matériaux : ${fmt(parseFloat(inputs.materialCost))}`,
      `Profil d'infrastructure : ${profile?.label || "Personnalisé"} (${(results.overheadRate * 100).toFixed(0)} %)`,
      `Marge cible : ${inputs.targetMargin} %`,
      "",
      "PLANCHER DE SOUMISSION",
      `Coût total du projet : ${fmt(results.totalProjectCost)}`,
      `Soumission minimale sécuritaire : ${fmt(results.minimumQuote)}`,
      `Profit à la soumission minimale : ${fmt(results.profitAtMinimum)}`,
      `Marge réelle à la soumission minimale : ${formatMargin(results.profitMarginActual)}`,
      `Sécurité de soumission : ${quoteSafetyLabel(results.quoteSafety)}`,
      "",
      "RISQUE MAIN-D'ŒUVRE",
      `Brûlage quotidien de main-d'œuvre : ${fmt(results.dailyLabourBurn)}/jour`,
      `Délai de rentabilité : ${results.breakEvenDays.toFixed(1)} jours`,
      ...(overrun20 ? [`Dépassement de main-d'œuvre de 20 % : ${fmt(overrun20.profit)} de profit restant, ${formatMargin(overrun20.margin)} de marge, ${overrun20.shortfall > 0 ? `${fmt(overrun20.shortfall)} d'écart de soumission` : "aucun écart de soumission"}`] : []),
      "",
      "SIMULATION DE DÉPASSEMENT",
      ...results.overrunScenarios.map((scenario) => `${scenario.label} : ${fmt(scenario.profit)} de profit, ${formatMargin(scenario.margin)} de marge, ${scenario.shortfall > 0 ? `${fmt(scenario.shortfall)} d'écart de soumission` : "aucun écart de soumission"}`),
      "",
      "ALERTES",
      results.riskFlag ? `Risque de marge : ${results.riskFlag}` : "Risque de marge : Aucune alerte majeure déclenchée par ce calculateur.",
      results.changeOrderWarning ? `Alerte extra : ${results.changeOrderWarning}` : "Alerte extra : Aucune alerte urgente déclenchée par ce calculateur.",
      "",
      "PROCHAINES ACTIONS",
      "1. N'envoie pas la soumission sous le minimum sécuritaire sauf si le scope ou les coûts changent.",
      "2. Mets chaque changement de scope, délai, condition de chantier ou substitution de matériau dans un message d'approbation avant de continuer.",
      "3. Si la soumission est à risque ou si le scénario +20 % crée un écart, bâtis un système de relance et d'extras avant d'augmenter le volume.",
      "",
      "PrimeGrowth AI bâtit des systèmes d'automatisation pour entrepreneurs : réponse aux leads, relance de soumission, extras et visibilité sur les marges.",
      "Réserver un appel gratuit : https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO",
      "",
      "Ceci est une aide de planification, pas un conseil comptable. Valide le prix final avec tes vrais coûts, ton contrat, les taxes et les exigences locales.",
    ].join("\n");

    downloadTextFile(`primegrowth-audit-soumission-${safePresetName}-fr.txt`, summary);
    trackMetaCustomEvent("QuoteRescueSummaryDownloaded", {
      tool: "job-costing-quote-rescue-audit",
      language: "fr",
      quoteSafety: results.quoteSafety,
      minimumQuote: Math.round(results.minimumQuote),
      totalProjectCost: Math.round(results.totalProjectCost),
      overrun20Shortfall: Math.round(overrun20?.shortfall || 0),
      tradePreset: preset?.label || "Personnalisé",
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#0F172A]/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <Link href="/fr"><img src={LOGO_URL} alt="PrimeGrowth AI" className="h-6 w-auto object-contain cursor-pointer" /></Link>
          <div className="flex items-center gap-3">
            <Link href="/tools/job-costing-calculator" className="text-xs text-slate-400 hover:text-teal-400 transition-colors hidden sm:block">English</Link>
            <a href={CALENDAR_LINK} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-teal-500 text-white text-sm font-semibold transition-all hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20">
              Réserver un appel gratuit
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <AnimatedGridBackground />
        <div className="container relative z-10 max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-widest uppercase mb-5">
              <span className="w-4 h-px bg-teal-400/60" />Outil gratuit<span className="w-4 h-px bg-teal-400/60" />
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-50 leading-[1.1] tracking-tight mb-4">
              Audit Coûts de Chantier + Sauvetage de Soumission
            </h1>
            <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
              Arrête d'envoyer des soumissions qui fonctionnent seulement si tout va parfaitement. Entre ton métier, ton équipe, tes heures et tes matériaux — obtiens ta soumission minimale sécuritaire, tes scénarios de dépassement et tes alertes d'extra en moins de 60 secondes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="pb-20">
        <div className="container max-w-2xl">
          {/* Inputs Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-slate-700/50 bg-[#0F172A] p-6 md:p-8 mb-6">
            <h2 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-xs font-bold text-teal-400">1</span>
              Entre les détails de ton chantier
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TradePresetSelector value={inputs.tradePresetId} onSelect={applyTradePreset} />
              <InputField label="Nombre de travailleurs" sublabel="sur ce chantier" value={inputs.workers} onChange={set("workers")} placeholder="ex. 4" min={1} />
              <InputField label="Coût horaire complet par travailleur" sublabel="salaire + charges + avantages + véhicule/outils" value={inputs.hourlyRate} onChange={set("hourlyRate")} prefix="$" placeholder="ex. 50" min={1} />
              <InputField label="Heures totales estimées" sublabel="tous les travailleurs combinés" value={inputs.estimatedHours} onChange={set("estimatedHours")} placeholder="ex. 320" min={1} />
              <InputField label="Coût des matériaux" sublabel="total pour le chantier" value={inputs.materialCost} onChange={set("materialCost")} prefix="$" placeholder="ex. 12000" min={0} />
              <InputField label="Marge bénéficiaire cible" sublabel="ce que tu veux garder" value={inputs.targetMargin} onChange={set("targetMargin")} suffix="%" placeholder="20" min={1} max={80} />
              <OverheadSelector value={inputs.overheadProfileId} onChange={(id) => setInputs((p) => ({ ...p, overheadProfileId: id }))} />
            </div>
            <motion.button onClick={handleCalculate} disabled={!isComplete} whileTap={{ scale: 0.98 }}
              className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold text-base transition-all hover:shadow-xl hover:shadow-teal-500/25 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
              Lancer mon audit de soumission →
            </motion.button>
            {!isComplete && <p className="text-xs text-slate-600 text-center mt-3">Remplis tous les champs et sélectionne ton type d'entreprise</p>}
          </motion.div>

          {/* Results Card */}
          <AnimatePresence>
            {hasCalculated && results && (
              <motion.div ref={resultsRef} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-slate-700/50 bg-[#0F172A] p-6 md:p-8 relative overflow-hidden">
                <h2 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-xs font-bold text-teal-400">2</span>
                  Ton audit de sauvetage de soumission
                </h2>

                {/* Always visible partial results */}
                <div className="flex flex-col gap-3 mb-3">
                  <ResultRow label="Coût de main-d'œuvre" value={fmt(results.labourCost)} />
                  <ResultRow label="Coût des matériaux" value={fmt(parseFloat(inputs.materialCost))} />
                  <ResultRow label="Frais généraux" value={fmt(results.overheadAmount)}
                    sublabel={`${(results.overheadRate * 100).toFixed(0)}% — ${OVERHEAD_PROFILES.find(p => p.id === inputs.overheadProfileId)?.label}`} />
                </div>

                {/* Gated results */}
                <div className="relative">
                  <div className={`flex flex-col gap-3 transition-all duration-500 ${!isUnlocked ? "blur-sm select-none pointer-events-none" : ""}`}>
                    <ResultRow label="Coût total du projet" value={fmt(results.totalProjectCost)} />
                    <ResultRow label="Soumission minimale" value={fmt(results.minimumQuote)} highlight sublabel={`Pour atteindre ta marge cible de ${inputs.targetMargin}%`} />
                    <ResultRow label="Profit à la soumission minimale" value={fmt(results.profitAtMinimum)} highlight />
                    <ResultRow label="Marge bénéficiaire réelle" value={`${results.profitMarginActual.toFixed(1)}%`} highlight />
                    <ResultRow label="Brûlage quotidien de main-d'œuvre" value={`${fmt(results.dailyLabourBurn)}/jour`} sublabel="Coût de ton équipe par journée de 8 heures" />
                    <ResultRow label="Délai de rentabilité" value={`${results.breakEvenDays.toFixed(1)} jours`} sublabel="Jours de travail pour couvrir tous les coûts" />

                    <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="text-xs font-semibold text-sky-300 uppercase tracking-wide">Simulation de dépassement</p>
                          <p className="text-xs text-slate-500 mt-1">Ce qui arrive si le chantier dépasse ton estimation d'heures de 10 %, 20 % ou 30 %.</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${results.quoteSafety === "danger" ? "bg-red-500/15 text-red-300" : results.quoteSafety === "watch" ? "bg-amber-500/15 text-amber-300" : "bg-teal-500/15 text-teal-300"}`}>
                          {results.quoteSafety === "danger" ? "Soumission à risque" : results.quoteSafety === "watch" ? "À surveiller" : "Marge protégée"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {results.overrunScenarios.map((scenario) => (
                          <div key={scenario.label} className={`rounded-lg border p-3 ${scenario.status === "danger" ? "border-red-500/20 bg-red-500/5" : scenario.status === "watch" ? "border-amber-500/20 bg-amber-500/5" : "border-slate-700/40 bg-slate-800/40"}`}>
                            <p className="text-xs font-bold text-slate-200 mb-1">{scenario.label}</p>
                            <p className={`text-sm font-bold tabular-nums ${scenario.profit < 0 ? "text-red-300" : scenario.status === "watch" ? "text-amber-300" : "text-teal-300"}`}>{fmt(scenario.profit)}</p>
                            <p className="text-[11px] text-slate-500 mt-1">profit restant · {formatMargin(scenario.margin)} marge</p>
                            {scenario.shortfall > 0 && <p className="text-[11px] text-amber-300 mt-1">Écart: {fmt(scenario.shortfall)}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {!isUnlocked && <EmailGate onUnlock={handleUnlock} isLoading={isSubmitting} />}
                </div>

                {/* Risk flag */}
                {isUnlocked && results.riskFlag && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.95 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">Risque de marge détecté</p>
                      <p className="text-sm text-amber-200/80 leading-relaxed">{results.riskFlag}</p>
                    </div>
                  </motion.div>
                )}

                {isUnlocked && results.changeOrderWarning && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75M12 15.75h.007v.008H12v-.008zM4.5 19.5h15l-7.5-15-7.5 15z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-red-300 uppercase tracking-wide mb-1">Alerte d'extra</p>
                      <p className="text-sm text-red-100/80 leading-relaxed">{results.changeOrderWarning}</p>
                    </div>
                  </motion.div>
                )}

                {isUnlocked && (
                  <motion.button type="button" onClick={handleDownloadSummary} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="mt-4 w-full py-3 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-100 font-bold text-sm transition-all hover:bg-sky-500/15 hover:border-sky-400/50">
                    Télécharger mon sommaire de soumission
                  </motion.button>
                )}

                {/* Post-unlock CTA */}
                {isUnlocked && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="mt-8 p-6 rounded-xl border border-teal-500/20 bg-teal-500/5 text-center">
                    <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-2">Tu veux automatiser ça?</p>
                    <h3 className="text-lg font-bold text-slate-50 mb-2">Imagine ça qui tourne automatiquement sur chaque chantier.</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-5">
                      On construit des systèmes qui suivent tes heures de main-d'œuvre, tes matériaux et tes marges en temps réel — pour que tu saches exactement où tu en es avant la fin du chantier.
                    </p>
                    <a href={CALENDAR_LINK} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-teal-500/25 hover:scale-[1.02]">
                      Réserver une analyse opérationnelle gratuite
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                    <p className="text-xs text-slate-600 mt-3">Appel de 30 minutes. Sans engagement.</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* How it works strip */}
          {!hasCalculated && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: "⚡", title: "60 secondes", desc: "Choisis un preset métier, entre les chiffres du chantier, obtiens l'audit" },
                { icon: "🎯", title: "Soumission sécuritaire", desc: "Connais ton prix plancher avant d'envoyer le prix" },
                { icon: "🚨", title: "Dépassements", desc: "Vois l'impact de 10/20/30 % d'heures en plus sur ta marge" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-4 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-xs font-bold text-slate-200 mb-1">{item.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60 py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/fr"><img src={LOGO_URL} alt="PrimeGrowth AI" className="h-5 w-auto object-contain cursor-pointer" /></Link>
            <p className="text-xs text-slate-600 text-center">© {new Date().getFullYear()} PrimeGrowth AI. Le système opérationnel clé en main pour entrepreneurs spécialisés.</p>
            <a href="mailto:david@primegrowthai.com" className="text-xs text-slate-500 hover:text-teal-400 transition-colors">david@primegrowthai.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
