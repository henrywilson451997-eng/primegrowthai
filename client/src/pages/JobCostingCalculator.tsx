/*
 * PrimeGrowth AI — Job Costing + Quote Rescue Audit (EN)
 * Route: /tools/job-costing-calculator
 * Design: Deep Navy + Teal (matching site design system)
 * Gate: Results shown partially blurred → email unlock
 * v3: Adds trade presets, labour-overrun simulation, change-order warnings, and downloadable quote safety summary
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

// ── OVERHEAD PROFILES ─────────────────────────────────────────────────────────
const OVERHEAD_PROFILES = [
  {
    id: "solo",
    rate: 0.08,
    label: "Solo operator",
    desc: "Just you — no office, no admin, tools in your truck",
    badge: "8%",
  },
  {
    id: "small",
    rate: 0.12,
    label: "Small crew (2–5 workers)",
    desc: "Small team, basic tools & equipment, no dedicated office",
    badge: "12%",
  },
  {
    id: "established",
    rate: 0.18,
    label: "Established operation (5–15 workers)",
    desc: "Office or shop, company vehicles, equipment, part-time admin",
    badge: "18%",
  },
  {
    id: "full",
    rate: 0.25,
    label: "Full operation (15+ workers)",
    desc: "Full office, multiple vehicles, heavy equipment, full-time admin staff",
    badge: "25%",
  },
];

const TRADE_PRESETS = [
  {
    id: "renovation",
    label: "Renovation / GC",
    desc: "Mixed labour, client changes, multiple site handoffs",
    hourlyRate: "58",
    targetMargin: "24",
    overheadProfileId: "established",
    riskHint: "Watch scope creep and client-driven extras before they become free work.",
  },
  {
    id: "ceramic",
    label: "Ceramic / Tile",
    desc: "Material-driven jobs with layout, substrate, and site-readiness risk",
    hourlyRate: "52",
    targetMargin: "22",
    overheadProfileId: "small",
    riskHint: "Confirm substrate prep, pattern changes, and material delays in writing.",
  },
  {
    id: "excavation",
    label: "Excavation",
    desc: "Equipment-heavy work where one bad day can erase margin",
    hourlyRate: "85",
    targetMargin: "25",
    overheadProfileId: "established",
    riskHint: "Separate machine time, trucking, unknown soil, and weather delays from base scope.",
  },
  {
    id: "concrete",
    label: "Concrete / Formwork",
    desc: "Crew timing, pour windows, pump/truck coordination, rework risk",
    hourlyRate: "65",
    targetMargin: "23",
    overheadProfileId: "established",
    riskHint: "Lock pour conditions, access, forming changes, and standby time before the job starts.",
  },
  {
    id: "roofing",
    label: "Roofing / Exterior",
    desc: "Fast production, weather exposure, hidden decking/scope risk",
    hourlyRate: "60",
    targetMargin: "24",
    overheadProfileId: "small",
    riskHint: "Call out hidden substrate, weather delays, access, and disposal overages.",
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

  if (
    isNaN(workers) || isNaN(hourlyRate) || isNaN(estimatedHours) ||
    isNaN(materialCost) || isNaN(targetMargin)
  ) return null;

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
    return { label: `+${Math.round(pct * 100)}% hours`, overrunPct: pct, totalCost: overrunTotalCost, profit, margin, shortfall, status };
  });

  const quoteSafety: Results["quoteSafety"] = overrunScenarios.some((s) => s.status === "danger")
    ? "danger"
    : overrunScenarios.some((s) => s.status === "watch")
      ? "watch"
      : "safe";

  let riskFlag: string | null = null;
  if (targetMargin < 0.15)
    riskFlag = "Your target margin is below 15%. One surprise change order could put you in the red.";
  else if (materialCost / totalDirectCost > 0.6)
    riskFlag = "Materials are over 60% of your direct cost. A supplier price increase can crush your margin fast.";
  else if (estimatedHours / (workers * 8) > 30)
    riskFlag = "This project spans 30+ working days. Labour cost overruns become much more likely at this scale.";

  let changeOrderWarning: string | null = null;
  const twentyPctScenario = overrunScenarios.find((s) => s.overrunPct === 0.2);
  if (twentyPctScenario && twentyPctScenario.status !== "safe")
    changeOrderWarning = "Quote rescue warning: if labour runs 20% over, your original quote no longer protects the target margin. Document extras, site delays, and scope changes before the crew absorbs them for free.";
  else if (targetMargin < 0.2)
    changeOrderWarning = "Change-order warning: this quote does not have much cushion. Any client-requested scope change should become a written approval before work continues.";

  return {
    labourCost, totalDirectCost, overheadAmount, overheadRate: overhead,
    totalProjectCost, minimumQuote, profitAtMinimum, profitMarginActual,
    dailyLabourBurn, breakEvenDays, riskFlag, changeOrderWarning, quoteSafety, overrunScenarios,
  };
}

function fmt(n: number) {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

function formatMargin(n: number) {
  return `${n.toFixed(1)}%`;
}

function quoteSafetyLabel(status: Results["quoteSafety"]) {
  if (status === "danger") return "Quote at risk";
  if (status === "watch") return "Watch closely";
  return "Margin holds";
}

function buildDiagnosticTags(results: Results | null) {
  return [
    "calculator-lead",
    "ig-funnel",
    "job-costing-calculator",
    "quote-rescue-audit",
    "contractor",
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
        Trade Preset
        <span className="ml-2 text-xs font-normal text-slate-500">sets a smarter starting point; override anything</span>
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
                  {preset.targetMargin}% target
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
        Company Infrastructure
        <span className="ml-2 text-xs font-normal text-slate-500">determines your overhead rate</span>
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
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.includes("@") || !email.includes(".")) { setError("Please enter a valid email."); return; }
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
        <h3 className="text-lg font-bold text-slate-50 mb-1">Your results are ready</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Enter your info to unlock your full cost breakdown, minimum quote, and margin analysis.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-100 text-sm py-3 px-4 outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-500" />
          <input type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-100 text-sm py-3 px-4 outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-500" />
          <input type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-100 text-sm py-3 px-4 outline-none focus:border-teal-500/60 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-slate-500" />
          {error && <p className="text-xs text-red-400 text-left">{error}</p>}
          <button type="submit" disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-teal-500/25 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoading ? "Unlocking..." : "Unlock My Full Results →"}
          </button>
          <p className="text-xs text-slate-600">No spam. We'll send you the breakdown by email too.</p>
        </form>
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function JobCostingCalculator() {
  useSEO({
    title: "Job Costing + Quote Rescue Audit for Contractors | PrimeGrowth AI",
    description: "Free quote rescue and job costing audit for contractors. Enter your crew, hours, materials, trade, and margin target to see your minimum safe quote, labour-overrun risk, and change-order warnings.",
    canonical: "https://www.primegrowthai.com/tools/job-costing-calculator",
    lang: "en",
    alternateHref: "https://www.primegrowthai.com/fr/outils/calculateur-couts-chantier",
    alternateLang: "fr",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Job Costing + Quote Rescue Audit for Contractors",
      "description": "Free quote rescue and job costing audit for contractors with minimum safe quote, labour-overrun simulation, and change-order warnings.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CAD" },
      "url": "https://www.primegrowthai.com/tools/job-costing-calculator",
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
      // Keep the standalone calculator gate if prior toolkit access cannot be verified locally.
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
          source: "job-costing-calculator",
          tags: buildDiagnosticTags(results),
          customFields: {
            workers: inputs.workers,
            allInHourlyCostPerWorker: inputs.hourlyRate,
            estimatedHours: inputs.estimatedHours,
            materialCost: inputs.materialCost,
            targetMargin: inputs.targetMargin,
            tradePreset: preset?.label || "Custom",
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
    const safePresetName = (preset?.label || "custom")
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "custom";

    const summary = [
      "PrimeGrowth AI — Job Costing + Quote Rescue Audit",
      "Sales-ready summary for contractor follow-up",
      "",
      "PROJECT PROFILE",
      `Trade preset: ${preset?.label || "Custom"}`,
      `Workers: ${inputs.workers}`,
      `All-in hourly cost per worker: ${fmt(parseFloat(inputs.hourlyRate))}`,
      `Estimated total hours: ${inputs.estimatedHours}`,
      `Material cost: ${fmt(parseFloat(inputs.materialCost))}`,
      `Infrastructure profile: ${profile?.label || "Custom"} (${(results.overheadRate * 100).toFixed(0)}%)`,
      `Target margin: ${inputs.targetMargin}%`,
      "",
      "QUOTE FLOOR",
      `Total project cost: ${fmt(results.totalProjectCost)}`,
      `Minimum safe quote: ${fmt(results.minimumQuote)}`,
      `Profit at minimum quote: ${fmt(results.profitAtMinimum)}`,
      `Actual margin at minimum quote: ${formatMargin(results.profitMarginActual)}`,
      `Quote safety: ${quoteSafetyLabel(results.quoteSafety)}`,
      "",
      "LABOUR RISK",
      `Daily labour burn: ${fmt(results.dailyLabourBurn)}/day`,
      `Break-even timeline: ${results.breakEvenDays.toFixed(1)} days`,
      ...(overrun20 ? [`20% labour overrun: ${fmt(overrun20.profit)} profit left, ${formatMargin(overrun20.margin)} margin, ${overrun20.shortfall > 0 ? `${fmt(overrun20.shortfall)} quote gap` : "no quote gap"}`] : []),
      "",
      "OVERRUN SIMULATION",
      ...results.overrunScenarios.map((scenario) => `${scenario.label}: ${fmt(scenario.profit)} profit, ${formatMargin(scenario.margin)} margin, ${scenario.shortfall > 0 ? `${fmt(scenario.shortfall)} quote gap` : "no quote gap"}`),
      "",
      "WARNINGS",
      results.riskFlag ? `Margin risk: ${results.riskFlag}` : "Margin risk: No major warning triggered by this calculator.",
      results.changeOrderWarning ? `Change-order warning: ${results.changeOrderWarning}` : "Change-order warning: No urgent warning triggered by this calculator.",
      "",
      "NEXT ACTIONS",
      "1. Do not send the quote below the minimum safe quote unless scope or costs change.",
      "2. Write every client-driven scope change, delay, site condition, and material substitution into an approval message before work continues.",
      "3. If the quote is at risk or the 20% overrun scenario creates a gap, build a follow-up and change-order system before scaling volume.",
      "",
      "PrimeGrowth AI builds contractor automation systems for lead response, quote follow-up, change orders, and margin visibility.",
      "Book a free call: https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO",
      "",
      "This is a planning aid, not accounting advice. Validate final pricing with your real job costs, contract terms, taxes, and local requirements.",
    ].join("\n");

    downloadTextFile(`primegrowth-quote-rescue-audit-${safePresetName}-en.txt`, summary);
    trackMetaCustomEvent("QuoteRescueSummaryDownloaded", {
      tool: "job-costing-quote-rescue-audit",
      language: "en",
      quoteSafety: results.quoteSafety,
      minimumQuote: Math.round(results.minimumQuote),
      totalProjectCost: Math.round(results.totalProjectCost),
      overrun20Shortfall: Math.round(overrun20?.shortfall || 0),
      tradePreset: preset?.label || "Custom",
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#0F172A]/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <Link href="/"><img src={LOGO_URL} alt="PrimeGrowth AI" className="h-6 w-auto object-contain cursor-pointer" /></Link>
          <div className="flex items-center gap-3">
            <Link href="/fr/outils/calculateur-couts-chantier" className="text-xs text-slate-400 hover:text-teal-400 transition-colors hidden sm:block">Français</Link>
            <a href={CALENDAR_LINK} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-teal-500 text-white text-sm font-semibold transition-all hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20">
              Book a Free Call
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
              <span className="w-4 h-px bg-teal-400/60" />Free Tool<span className="w-4 h-px bg-teal-400/60" />
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-50 leading-[1.1] tracking-tight mb-4">
              Job Costing + Quote Rescue Audit
            </h1>
            <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
              Stop sending quotes that only work if everything goes perfectly. Enter your trade, crew, hours, and materials — get your minimum safe quote, labour-overrun scenarios, and change-order warnings in under 60 seconds.
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
              Enter Your Project Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TradePresetSelector value={inputs.tradePresetId} onSelect={applyTradePreset} />
              <InputField label="Number of Workers" sublabel="on this job" value={inputs.workers} onChange={set("workers")} placeholder="e.g. 4" min={1} />
              <InputField label="All-in hourly cost per worker" sublabel="wage + burden + benefits + vehicle/tools" value={inputs.hourlyRate} onChange={set("hourlyRate")} prefix="$" placeholder="e.g. 50" min={1} />
              <InputField label="Estimated Total Hours" sublabel="all workers combined" value={inputs.estimatedHours} onChange={set("estimatedHours")} placeholder="e.g. 320" min={1} />
              <InputField label="Material Cost" sublabel="total for the job" value={inputs.materialCost} onChange={set("materialCost")} prefix="$" placeholder="e.g. 12000" min={0} />
              <InputField label="Target Profit Margin" sublabel="what you want to keep" value={inputs.targetMargin} onChange={set("targetMargin")} suffix="%" placeholder="20" min={1} max={80} />
              <OverheadSelector value={inputs.overheadProfileId} onChange={(id) => setInputs((p) => ({ ...p, overheadProfileId: id }))} />
            </div>
            <motion.button onClick={handleCalculate} disabled={!isComplete} whileTap={{ scale: 0.98 }}
              className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold text-base transition-all hover:shadow-xl hover:shadow-teal-500/25 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
              Run My Quote Rescue Audit →
            </motion.button>
            {!isComplete && <p className="text-xs text-slate-600 text-center mt-3">Fill in all fields and select your company type above</p>}
          </motion.div>

          {/* Results Card */}
          <AnimatePresence>
            {hasCalculated && results && (
              <motion.div ref={resultsRef} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-slate-700/50 bg-[#0F172A] p-6 md:p-8 relative overflow-hidden">
                <h2 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-xs font-bold text-teal-400">2</span>
                  Your Quote Rescue Audit
                </h2>

                {/* Always visible partial results */}
                <div className="flex flex-col gap-3 mb-3">
                  <ResultRow label="Labour Cost" value={fmt(results.labourCost)} />
                  <ResultRow label="Material Cost" value={fmt(parseFloat(inputs.materialCost))} />
                  <ResultRow label="Overhead" value={fmt(results.overheadAmount)}
                    sublabel={`${(results.overheadRate * 100).toFixed(0)}% — ${OVERHEAD_PROFILES.find(p => p.id === inputs.overheadProfileId)?.label}`} />
                </div>

                {/* Gated results */}
                <div className="relative">
                  <div className={`flex flex-col gap-3 transition-all duration-500 ${!isUnlocked ? "blur-sm select-none pointer-events-none" : ""}`}>
                    <ResultRow label="Total Project Cost" value={fmt(results.totalProjectCost)} />
                    <ResultRow label="Minimum Quote" value={fmt(results.minimumQuote)} highlight sublabel={`To hit your ${inputs.targetMargin}% margin target`} />
                    <ResultRow label="Profit at Minimum Quote" value={fmt(results.profitAtMinimum)} highlight />
                    <ResultRow label="Actual Profit Margin" value={`${results.profitMarginActual.toFixed(1)}%`} highlight />
                    <ResultRow label="Daily Labour Burn" value={`${fmt(results.dailyLabourBurn)}/day`} sublabel="Cost of your crew per 8-hour day" />
                    <ResultRow label="Break-Even Timeline" value={`${results.breakEvenDays.toFixed(1)} days`} sublabel="Days of work to cover all costs" />

                    <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="text-xs font-semibold text-sky-300 uppercase tracking-wide">Labour Overrun Simulator</p>
                          <p className="text-xs text-slate-500 mt-1">What happens if the job runs 10%, 20%, or 30% over your hour estimate.</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${results.quoteSafety === "danger" ? "bg-red-500/15 text-red-300" : results.quoteSafety === "watch" ? "bg-amber-500/15 text-amber-300" : "bg-teal-500/15 text-teal-300"}`}>
                          {results.quoteSafety === "danger" ? "Quote at risk" : results.quoteSafety === "watch" ? "Watch closely" : "Margin holds"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {results.overrunScenarios.map((scenario) => (
                          <div key={scenario.label} className={`rounded-lg border p-3 ${scenario.status === "danger" ? "border-red-500/20 bg-red-500/5" : scenario.status === "watch" ? "border-amber-500/20 bg-amber-500/5" : "border-slate-700/40 bg-slate-800/40"}`}>
                            <p className="text-xs font-bold text-slate-200 mb-1">{scenario.label}</p>
                            <p className={`text-sm font-bold tabular-nums ${scenario.profit < 0 ? "text-red-300" : scenario.status === "watch" ? "text-amber-300" : "text-teal-300"}`}>{fmt(scenario.profit)}</p>
                            <p className="text-[11px] text-slate-500 mt-1">profit left · {formatMargin(scenario.margin)} margin</p>
                            {scenario.shortfall > 0 && <p className="text-[11px] text-amber-300 mt-1">Quote gap: {fmt(scenario.shortfall)}</p>}
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
                      <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">Margin Risk Detected</p>
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
                      <p className="text-xs font-semibold text-red-300 uppercase tracking-wide mb-1">Change-Order Warning</p>
                      <p className="text-sm text-red-100/80 leading-relaxed">{results.changeOrderWarning}</p>
                    </div>
                  </motion.div>
                )}

                {isUnlocked && (
                  <motion.button type="button" onClick={handleDownloadSummary} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    className="mt-4 w-full py-3 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-100 font-bold text-sm transition-all hover:bg-sky-500/15 hover:border-sky-400/50">
                    Download My Quote Safety Summary
                  </motion.button>
                )}

                {/* Post-unlock CTA */}
                {isUnlocked && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="mt-8 p-6 rounded-xl border border-teal-500/20 bg-teal-500/5 text-center">
                    <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-2">Want This Automated?</p>
                    <h3 className="text-lg font-bold text-slate-50 mb-2">Imagine this running automatically on every job.</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-5">
                      We build systems that track your labour hours, materials, and margins in real time — so you always know exactly where you stand before the job is done.
                    </p>
                    <a href={CALENDAR_LINK} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-teal-500/25 hover:scale-[1.02]">
                      Book a Free Operations Review
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                    <p className="text-xs text-slate-600 mt-3">30-minute call. No commitment.</p>
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
                { icon: "⚡", title: "60 seconds", desc: "Pick a trade preset, enter the job numbers, get the audit instantly" },
                { icon: "🎯", title: "Minimum safe quote", desc: "Know the floor price before you send the quote" },
                { icon: "🚨", title: "Overrun warnings", desc: "See what 10/20/30% labour overruns do to your margin" },
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
            <Link href="/"><img src={LOGO_URL} alt="PrimeGrowth AI" className="h-5 w-auto object-contain cursor-pointer" /></Link>
            <p className="text-xs text-slate-600 text-center">© {new Date().getFullYear()} PrimeGrowth AI. The Done-For-You Operations System for Specialty Contractors.</p>
            <a href="mailto:david@primegrowthai.com" className="text-xs text-slate-500 hover:text-teal-400 transition-colors">david@primegrowthai.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
