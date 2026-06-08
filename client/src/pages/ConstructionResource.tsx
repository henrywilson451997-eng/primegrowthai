/*
 * PrimeGrowth AI — Construction Resource Page
 * REDESIGN v4.0 — April 2026
 * Changes:
 *   - Conversion deep pass: hero-first toolkit opt-in for cold paid traffic
 *   - Removed long cinematic video from primary conversion path until founder video is ready
 * Design System: Deep Navy + Teal + Professional Blue (matching Home.tsx v3.0)
 * Typography: Plus Jakarta Sans
 * Route: /resources/construction-systems
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { GHL_WEBHOOKS, sendGhlWebhookGet } from "@/lib/ghlWebhook";
import { trackMetaCustomEvent, trackMetaLead } from "@/lib/metaPixel";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/OyhhiQPpFBkvMcYg.png";
const NICHE_CONST = "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/M9xU3P5LAzDrJZG3DHAnMY/niche_construction_ae9ba0ae.png";
const FOUNDER_VIDEO_EN_URL = "/videos/founder/founder-video-en-540p-h264.mp4";
const FOUNDER_VIDEO_EN_POSTER = "/thumbnails/founder/founder-video-en-poster.jpg";
const CALENDAR_LINK = "https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO";


// ── PDF TOOLKIT URLS (EN) ──────────────────────────────────────────────────────
const PDF_5SYSTEMS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/primegrowth-5-systems-final_c627b5e4.pdf";
const PDF_FRIDAY_AUDIT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/friday-night-audit-en_4ce54c49.pdf";
const PDF_DISPATCH = "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/morning-dispatch-en_cedebb3e.pdf";
const PDF_JOB_COSTING = "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/job-costing-formula-en_e5746367.pdf";
const PDF_CHANGE_ORDER = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/WiHEXrkXCoDFDFsb.pdf";
const PDF_SCOPE_LETTER = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/pOkzvdKrPLjImvyq.pdf";
const PDF_MARKUP_RECOVERY = "/resources/primegrowth-ai-markup-recovery-calculator-en.pdf";

const TOOLKIT_UNLOCK_KEY = "pg_construction_toolkit_unlocked";

function rememberToolkitUnlock(payload: { firstName: string; email: string; phone?: string; language: "en" | "fr" }) {
  try {
    window.localStorage.setItem(
      TOOLKIT_UNLOCK_KEY,
      JSON.stringify({
        ...payload,
        unlockedAt: new Date().toISOString(),
        source: "construction-resource-toolkit",
      })
    );
  } catch {
    // Local storage is a convenience pass-through only; the primary gate still succeeds without it.
  }
}

function getAttributionPayload() {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      utm_adset: params.get("utm_adset") || params.get("adset") || "",
      utm_ad: params.get("utm_ad") || params.get("ad") || "",
      ad_angle: params.get("ad_angle") || params.get("angle") || "",
    };
  } catch {
    return {};
  }
}

const STATS = [
  { value: "1 wasted day", label: "= $800–$1,500 in lost labour", sub: "every time a crew shows up to a site that isn't ready" },
  { value: "1 in 3", label: "specialty contractors", sub: "price jobs on gut feel because they can't see their real margins" },
  { value: "10+ hrs/week", label: "lost to manual admin", sub: "compiling timesheets, chasing receipts, and re-entering data" },
];

const MESSAGE_MATCH_POINTS = [
  {
    label: "Missed calls",
    text: "New lead comes in while you are on site. Nobody follows up fast enough, so the job goes to the contractor who answered first.",
  },
  {
    label: "Unpaid extras",
    text: "Client says yes by text. Crew does the work. The approval never becomes a clean change order before invoice time.",
  },
  {
    label: "Friday admin",
    text: "Hours, receipts, crew questions, and job updates pile up until your night becomes the office shift.",
  },
  {
    label: "Margin fog",
    text: "You win the job, finish the work, then still cannot see what labour, materials, and changes actually left you.",
  },
];

const PROBLEMS = [
  {
    title: "The Wasted Crew Day",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.95 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    desc: "The GC says the site is ready. Your crew drives out. It isn't. You lose a full day of labour — $800 to $1,500 — and there's no system to prevent it from happening again next week.",
  },
  {
    title: "The Margin Blindspot",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    desc: "You finish a job and you think you made money. But between materials, labour, and change orders you forgot to track, you have no idea what you actually kept. Decisions get made on gut feel.",
  },
  {
    title: "The Friday Night Grind",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    desc: "Your guys text you their hours. You compile them manually. You forward them to your accountant. Every Friday night. A system that does this automatically isn't a luxury — it's a basic operational requirement.",
  },
];

const STEPS = [
  { step: "01", title: "Operations Review", desc: "We learn how you run your jobs — how you quote, schedule your crew, track materials, and invoice. We identify exactly where time and money are being lost." },
  { step: "02", title: "Build & Configure", desc: "We build your project management workspace, set up GPS-verified timesheets, configure crew communication channels, and connect everything via automations. Done-For-You." },
  { step: "03", title: "Go Live & Hand Off", desc: "We walk you through the system, train your crew on how to use it, and hand you the keys. You're live in 14 days. We stay on for ongoing support." },
];

// ── ANIMATED BACKGROUND ───────────────────────────────────────────────────────
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
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-3xl" />
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-teal-400/10 blur-2xl"
      />
    </div>
  );
}

// ── TOOLKIT GATE ──────────────────────────────────────────────────────────────
type GateState = "idle" | "submitting" | "success" | "error";

const TOOLKIT_ASSETS = [
  {
    icon: "📋",
    title: "The Sub-Trade Operator's Playbook",
    desc: "5 Systems That Recover $40K/Year in Lost Labour",
    detail: "7-page PDF",
    value: "$97",
    url: PDF_5SYSTEMS,
    filename: "PrimeGrowth-AI-5-Systems-Contractors.pdf",
  },
  {
    icon: "✅",
    title: "The Friday Night Audit",
    desc: "12 Questions That Tell You Where Your Business Is Leaking Money This Week",
    detail: "1-page checklist",
    value: "$47",
    url: PDF_FRIDAY_AUDIT,
    filename: "PrimeGrowth-AI-Friday-Night-Audit.pdf",
  },
  {
    icon: "📱",
    title: "The 5-Minute Morning Dispatch",
    desc: "The Exact Message Format That Eliminates Crew Confusion Before 7AM",
    detail: "Copy-paste template",
    value: "$27",
    url: PDF_DISPATCH,
    filename: "PrimeGrowth-AI-Morning-Dispatch.pdf",
  },
  {
    icon: "📊",
    title: "The Back-of-Envelope Job Costing Formula",
    desc: "Know Your Real Margin Before You Invoice — with a worked $35K example",
    detail: "Reference sheet",
    value: "$47",
    url: PDF_JOB_COSTING,
    filename: "PrimeGrowth-AI-Job-Costing-Formula.pdf",
  },
  {
    icon: "🛡️",
    title: "The Change Order Protection Kit",
    desc: "Exact language, approval wording, and examples to stop unpaid extras before they start",
    detail: "8-page PDF",
    value: "$147",
    url: PDF_CHANGE_ORDER,
    filename: "PrimeGrowth-AI-Change-Order-Protection-Kit.pdf",
  },
  {
    icon: "📝",
    title: "The Subcontractor Scope Letter",
    desc: "A one-page scope template that prevents ‘that wasn’t included’ disputes before the job starts",
    detail: "2-page PDF",
    value: "$97",
    url: PDF_SCOPE_LETTER,
    filename: "PrimeGrowth-AI-Subcontractor-Scope-Letter.pdf",
  },
  {
    icon: "📈",
    title: "The Markup Recovery Calculator",
    desc: "Find the exact multiplier that protects your margin before you quote the next job",
    detail: "2-page worksheet",
    value: "$97",
    url: PDF_MARKUP_RECOVERY,
    filename: "PrimeGrowth-AI-Markup-Recovery-Calculator.pdf",
  },
  {
    icon: "✍️",
    title: "The Change Order Message Builder",
    desc: "Generate the client message, SMS version, approval line, and internal scope note before an extra becomes free work",
    detail: "Interactive tool",
    value: "$297",
    url: "/tools/change-order-builder",
    filename: null,
  },
  {
    icon: "📐",
    title: "The Job Costing Calculator",
    desc: "Calculate the minimum profitable quote before you price the next job",
    detail: "Interactive tool",
    value: "$197",
    url: "/tools/job-costing-calculator",
    filename: null,
  },
  {
    icon: "🧮",
    title: "The Automation Leak Audit",
    desc: "Map where lead intake, quote follow-up, after-hours capture, and admin handoffs are leaking money",
    detail: "Interactive tool",
    value: "$397",
    url: "/tools/ai-growth-score",
    filename: null,
  },
];

function ToolkitGate() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gateState, setGateState] = useState<GateState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    setGateState("submitting");
    setErrorMsg("");

    try {
      await sendGhlWebhookGet(GHL_WEBHOOKS.websiteToolkitForm, {
        firstName: firstName.trim(),
        lastName: "",
        email: email.trim(),
        phone: phone.trim(),
        source: "toolkit-download-en",
        tags: ["toolkit_download", "ig-funnel", "construction-resource", "en"],
        language: "en",
        ...getAttributionPayload(),
      });

      trackMetaLead({
        content_name: "Construction Systems Toolkit",
        content_category: "resource_download",
        source: "toolkit-download-en",
        language: "en",
      });
      trackMetaCustomEvent("ConstructionToolkitDownload", {
        source: "toolkit-download-en",
        language: "en",
      });

      rememberToolkitUnlock({
        firstName: firstName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        language: "en",
      });

      // Trigger all PDF downloads
      const pdfs = [
        { url: PDF_5SYSTEMS, name: "PrimeGrowth-AI-5-Systems-Contractors.pdf" },
        { url: PDF_FRIDAY_AUDIT, name: "PrimeGrowth-AI-Friday-Night-Audit.pdf" },
        { url: PDF_DISPATCH, name: "PrimeGrowth-AI-Morning-Dispatch.pdf" },
        { url: PDF_JOB_COSTING, name: "PrimeGrowth-AI-Job-Costing-Formula.pdf" },
        { url: PDF_CHANGE_ORDER, name: "PrimeGrowth-AI-Change-Order-Protection-Kit.pdf" },
        { url: PDF_SCOPE_LETTER, name: "PrimeGrowth-AI-Subcontractor-Scope-Letter.pdf" },
        { url: PDF_MARKUP_RECOVERY, name: "PrimeGrowth-AI-Markup-Recovery-Calculator.pdf" },
      ];
      pdfs.forEach(({ url, name }, i) => {
        setTimeout(() => {
          const link = document.createElement("a");
          link.href = url;
          link.download = name;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, i * 600);
      });

      // Redirect to thank-you page after downloads start
      setTimeout(() => {
        const params = new URLSearchParams({ email: email.trim(), name: firstName.trim() });
        window.location.href = `/resources/construction-systems/thank-you?${params.toString()}`;
      }, 2400);
      setGateState("success");
    } catch {
      setGateState("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-teal-400/35 bg-slate-950/90 shadow-2xl shadow-teal-950/25">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.2),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_38%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/80 to-transparent" />

      <div className="relative p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-teal-300">
              Instant Download
            </span>
            <h3 className="mt-3 text-2xl font-black leading-[1.02] tracking-tight text-slate-50">
              Claim the full $1,594+ contractor toolkit.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Seven PDFs, three premium interactive tools, and David's 3-question Snapshot path — included today from one form.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-teal-300/35 bg-teal-400/10 px-4 py-3 text-center shadow-lg shadow-teal-950/30 sm:w-auto sm:shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200/80">Value</p>
            <p className="text-3xl font-black tracking-tight text-white">$1,594+</p>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">Included Today</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2.5 text-center">
            <p className="text-xl font-black text-teal-300">7</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">PDFs</p>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2.5 text-center">
            <p className="text-xl font-black text-teal-300">4m</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Calculator</p>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2.5 text-center">
            <p className="text-xl font-black text-teal-300">24h</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Snapshot</p>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-teal-400/30 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-teal-950/50 p-4 sm:p-5 shadow-xl shadow-teal-950/20">
          <AnimatePresence mode="wait">
            {gateState === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center gap-4 py-4"
              >
                <div className="w-14 h-14 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                  <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-100 font-bold text-lg mb-1">Your toolkit is downloading.</p>
                  <p className="text-slate-400 text-sm mb-4">7 PDFs are downloading now. Check your downloads folder.</p>
                  <p className="text-slate-400 text-sm">Watch for an email from David — your personalized Operations Snapshot will arrive within 24hrs.</p>
                </div>
                <a
                  href="/tools/ai-growth-score"
                  className="w-full text-center px-4 py-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold hover:bg-teal-500/20 transition-all"
                >
                  Run the Automation Leak Audit →
                </a>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-3.5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-black leading-tight text-white">Send the toolkit now.</p>
                    <p className="mt-1 text-xs text-slate-400">No account. No payment. Downloads start immediately.</p>
                  </div>
                  <div className="w-fit rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-extrabold text-teal-300">
                    60-second claim
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-300">What happens next</p>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs leading-relaxed text-slate-400 sm:grid-cols-2">
                    <p><span className="font-bold text-slate-200">1.</span> Your PDFs download immediately.</p>
                    <p><span className="font-bold text-slate-200">2.</span> The calculator and audit unlock on the next page.</p>
                    <p><span className="font-bold text-slate-200">3.</span> Use the tools to expose the biggest leak.</p>
                    <p><span className="font-bold text-slate-200">4.</span> If the leak is worth fixing, book the free diagnosis call.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="David"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (514) 555-0100"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all"
                    />
                    <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">Required so the toolkit, SMS access, and Snapshot follow-up can reach you while you are on site — not buried in your inbox. No spam.</p>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-red-400 text-xs">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={gateState === "submitting" || !firstName.trim() || !email.trim() || !phone.trim()}
                  className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-white font-black text-sm transition-all hover:shadow-lg hover:shadow-teal-500/25 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {gateState === "submitting" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Unlock the $1,497+ Toolkit
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
                <div className="flex flex-col gap-2 text-center">
                  <p className="text-[11px] text-slate-600">No spam. Unsubscribe anytime.</p>
                  <a
                    href={CALENDAR_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackMetaCustomEvent("DiscoveryCallBookingClick", { source: "construction-resource-form-escape-hatch", language: "en" })}
                    className="text-[11px] font-semibold text-teal-400 transition-colors hover:text-teal-300"
                  >
                    Already know your follow-up, quoting, or margin tracking is broken? Book the free diagnosis call instead →
                  </a>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


function ToolkitValueStack() {
  return (
    <div className="h-full rounded-[1.75rem] border border-slate-700/55 bg-slate-950/65 p-4 sm:p-5 shadow-xl shadow-slate-950/20">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-teal-300">Inside the $1,497+ stack</p>
          <p className="mt-2 text-lg font-black leading-tight text-slate-50">Premium assets included before you book a call or buy anything.</p>
        </div>
        <div className="w-fit rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-black text-teal-300">
          9 assets unlocked
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TOOLKIT_ASSETS.map((asset, i) => (
          <div key={i} className="rounded-2xl border border-slate-700/55 bg-slate-900/60 p-3 transition-all hover:border-teal-400/35 hover:bg-slate-900/80">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-950/80 text-sm">
                {asset.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-extrabold leading-snug text-slate-100">{asset.title}</p>
                  <span className="shrink-0 rounded-full bg-teal-400/10 px-2 py-0.5 text-[10px] font-black text-teal-300">{asset.value}</span>
                </div>
                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">{asset.detail} · {asset.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SAMPLE_OUTPUTS = [
  { label: "Lead response leak", score: "High", detail: "Missed-call and after-hours capture need to be fixed before more ad spend." },
  { label: "Quote follow-up leak", score: "Medium", detail: "Open estimates need automated reminders before the owner chases them manually." },
  { label: "Margin visibility", score: "Low", detail: "Job costing needs daily labour burn and change-order warnings before final invoice." },
];

const DIAGNOSTIC_TOOLS = [
  {
    label: "01 · Margin leak",
    title: "Job Costing Calculator",
    desc: "Calculate the minimum profitable quote, overhead burden, break-even days, daily labour burn, and margin risk before you price the next job.",
    metric: "Quote before you guess",
    cta: "Unlock with the toolkit",
  },
  {
    label: "02 · Automation leak",
    title: "Automation Leak Audit",
    desc: "Map how lead intake, slow response, quote follow-up, and after-hours coverage are creating operational leakage before job delivery even starts.",
    metric: "Find the highest-priority leak",
    cta: "Unlock with the toolkit",
  },
  {
    label: "03 · Scope control",
    title: "Change Order Message Builder",
    desc: "Turn scope changes into a clean client message, SMS, approval line, and internal note before extras become free work.",
    metric: "Protect the margin before work starts",
    cta: "Unlock with the toolkit",
  },
];

function DiagnosticToolsSection() {
  return (
    <section className="relative py-16 border-y border-slate-800/60 bg-slate-950/30">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold text-teal-300 tracking-widest uppercase mb-4 border border-teal-500/25 rounded-full px-4 py-1.5 bg-teal-500/10">
              Free tools that expose the leak
            </span>
            <h2 className="text-3xl md:text-4xl font-black leading-tight text-slate-50">
              Not another folder of templates. A diagnostic stack that shows where the money is escaping.
            </h2>
            <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-400">
              The PDFs give you the operating system. The tools turn your numbers, leaks, and change-order risks into clearer decisions. One access form unlocks the full resource hub — no scattered mini-funnels.
            </p>
          </div>
          <a
            href="#toolkit"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-teal-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20"
          >
            Unlock all free resources
          </a>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {DIAGNOSTIC_TOOLS.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="group relative overflow-hidden rounded-[1.5rem] border border-slate-700/55 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 transition-all hover:border-teal-400/35 hover:bg-slate-900"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-teal-300">{tool.label}</p>
              <h3 className="mt-3 text-xl font-black leading-tight text-slate-50">{tool.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{tool.desc}</p>
              <div className="mt-5 rounded-2xl border border-teal-400/20 bg-teal-400/10 p-3">
                <p className="text-xs font-black uppercase tracking-wider text-teal-200">{tool.metric}</p>
              </div>
              <a href="#toolkit" className="mt-5 inline-flex text-sm font-bold text-teal-300 hover:text-teal-200">
                {tool.cta} →
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.5rem] border border-teal-400/25 bg-slate-900/80 p-5 shadow-xl shadow-teal-950/15">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-teal-300">Sample output preview</p>
            <h3 className="mt-3 text-2xl font-black leading-tight text-slate-50">This is the kind of leak map the tools are built to surface.</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              The goal is not to give you another PDF graveyard. It is to expose the first operational leak worth fixing before you spend money on a system.
            </p>
            <div className="mt-5 space-y-3">
              {SAMPLE_OUTPUTS.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-100">{item.label}</p>
                    <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-200">{item.score}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-700/55 bg-slate-950/70 p-5 shadow-xl shadow-slate-950/20">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-teal-300">Anonymized contractor leak example</p>
            <h3 className="mt-3 text-2xl font-black leading-tight text-slate-50">One extra unpaid crew day can erase the profit from the job you thought you won.</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              A Quebec sub-trade with two crews does not need a massive failure to bleed cash. Two site-readiness mistakes, one missed estimate follow-up, and one unapproved extra can quietly turn a strong month into a break-even month.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3 text-center">
                <p className="text-2xl font-black text-teal-300">$1.2K</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Wasted crew day</p>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3 text-center">
                <p className="text-2xl font-black text-teal-300">$2.8K</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Unapproved extra</p>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3 text-center">
                <p className="text-2xl font-black text-teal-300">$4K+</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Monthly leak</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <a href="#toolkit" className="inline-flex text-sm font-bold text-teal-300 hover:text-teal-200">
                Run the free tools before the next job leaks again →
              </a>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                <p className="text-xs leading-relaxed text-slate-400">
                  If this looks like your company and you already know the leak is real, skip the toolkit and book the free diagnosis call. We will map the first operational leak and show what to fix first.
                </p>
                <a
                  href={CALENDAR_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackMetaCustomEvent("DiscoveryCallBookingClick", { source: "construction-resource-leak-example-escape-hatch", language: "en" })}
                  className="mt-3 inline-flex text-sm font-bold text-teal-300 hover:text-teal-200"
                >
                  Skip to the free diagnosis call →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolkitFounderVideo() {
  return (
    <div className="mx-auto mt-8 max-w-3xl rounded-[1.75rem] border border-slate-700/55 bg-slate-950/60 p-5 sm:p-6 text-center shadow-xl shadow-slate-950/20">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-teal-300">Founder video</p>
      <h3 className="mt-2 text-xl sm:text-2xl font-black leading-tight text-slate-50">
        Why I built this toolkit for Quebec contractors.
      </h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
        David Knot explains why this resource starts with real field leaks: missed calls, Friday-night admin, crew confusion, unpaid extras, and margin blind spots.
      </p>
      <div className="mx-auto mt-5 max-w-[320px] overflow-hidden rounded-[1.35rem] border border-teal-400/25 bg-slate-950 shadow-2xl shadow-slate-950/40">
        <video
          className="aspect-[9/16] w-full bg-slate-950 object-cover"
          controls
          playsInline
          preload="metadata"
          poster={FOUNDER_VIDEO_EN_POSTER}
          aria-label="David Knot explains the PrimeGrowth AI construction systems toolkit"
        >
          <source src={FOUNDER_VIDEO_EN_URL} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

export default function ConstructionResource() {
  useSEO({
    title: "Why Specialty Contractors Lose Hours and Margin to Broken Operations | PrimeGrowth AI",
    description: "Get the free PrimeGrowth toolkit for Quebec specialty contractors: 6 PDFs and three interactive tools to find the first leak stealing your nights.",
    canonical: "https://www.primegrowthai.com/resources/construction-systems",
    lang: "en",
    alternateHref: "https://www.primegrowthai.com/fr/ressources/systemes-construction",
    alternateLang: "fr",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Why Specialty Contractors Lose Hours and Margin to Broken Operations",
      "description": "Free toolkit for Quebec specialty contractors: 6 PDFs and three interactive tools to find the first operational leak.",
      "author": { "@type": "Organization", "name": "PrimeGrowth AI" },
      "publisher": { "@type": "Organization", "name": "PrimeGrowth AI", "url": "https://www.primegrowthai.com" },
      "url": "https://www.primegrowthai.com/resources/construction-systems",
      "inLanguage": "en"
    }
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#0F172A]/90 backdrop-blur-md">
        <div className="container flex min-h-16 items-center justify-between gap-3 py-3">
          <Link href="/" className="shrink-0">
            <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-5 w-auto object-contain cursor-pointer sm:h-6" />
          </Link>
          <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
            <a
              href="/fr/ressources/systemes-construction"
              className="px-2.5 py-1.5 rounded-full border border-slate-700/60 text-slate-400 text-[11px] font-semibold hover:border-teal-500/40 hover:text-teal-400 transition-all sm:px-3 sm:text-xs"
            >
              <span className="sm:hidden">FR</span><span className="hidden sm:inline">🇫🇷 Version française</span>
            </a>
            <a
              href="#toolkit"
              className="px-3 py-2 rounded-full bg-teal-500 text-white text-xs font-semibold transition-all hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20 sm:px-4 sm:text-sm"
            >
              <span className="sm:hidden">Get Toolkit</span><span className="hidden sm:inline">Get the Toolkit Free Today</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO + TOOLKIT OPT-IN ── */}
      <section id="toolkit" className="relative py-8 sm:py-10 md:py-14 overflow-hidden">
        <AnimatedGridBackground />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <img src={NICHE_CONST} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-transparent to-[#0F172A]" />
        </div>
        <div className="container relative z-10 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-5xl text-center"
          >
            <span className="inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-teal-300 sm:px-4 sm:text-xs sm:tracking-widest mb-5">
              $1,497+ Toolkit · Free Today for Quebec Contractors Working 60+ Hours
            </span>
            <h1 className="mx-auto max-w-4xl text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-[1.02] md:leading-[0.98] tracking-tight mb-5 sm:mb-6 text-slate-50">
              Recover the admin leaks stealing{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-400">
                $40K/year
              </span>
              {" "}from jobs you already won.
            </h1>
            <p className="mx-auto max-w-3xl text-base sm:text-lg md:text-xl text-slate-400 leading-relaxed">
              If every missed call, quote, crew question, unpaid extra, and client follow-up still runs through you after site hours, the leak is not motivation. It is your operating system.
            </p>
            <div className="mx-auto mt-5 grid max-w-5xl grid-cols-2 gap-2 text-left sm:mt-6 sm:gap-3 lg:grid-cols-4">
              {MESSAGE_MATCH_POINTS.map((point) => (
                <div key={point.label} className="rounded-2xl border border-slate-700/55 bg-slate-950/55 p-3 sm:p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-300">{point.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{point.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <ToolkitValueStack />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <ToolkitGate />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <ToolkitFounderVideo />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <DiagnosticToolsSection />


      <section className="py-16 border-y border-slate-800/60">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-center group"
              >
                <p className="text-4xl font-bold text-teal-400 tabular-nums tracking-tight mb-2">{s.value}</p>
                <p className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE THREE PROBLEMS ── */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-widest uppercase mb-4">
              <span className="w-4 h-px bg-teal-400/60" />
              The Problem
              <span className="w-4 h-px bg-teal-400/60" />
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">Where Your Business Is Leaking Time and Money</h2>
            <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
              Three operational problems that every specialty contractor faces — whether they have software or not. The gap between them is where profit disappears.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROBLEMS.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 hover:border-teal-500/30 hover:bg-slate-800/60 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="font-semibold text-slate-100 text-base mb-2">{p.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOLKIT POSITIONING ── */}
      <section className="py-16 bg-slate-800/10 border-y border-slate-800/60">
        <div className="container max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-widest uppercase mb-4">
            <span className="w-4 h-px bg-teal-400/60" />
            Why This Toolkit Exists
            <span className="w-4 h-px bg-teal-400/60" />
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">
            You do not need more motivation. You need to find the first leak and the first fix.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed mb-8">
            The toolkit gives you the checklists, templates, calculator, and Snapshot path to identify where leads, labour, admin, and margin are slipping. If the tools show a real leak, the next step is simple: book the free diagnosis call and map the fix before you buy anything.
          </p>
          <a href="#toolkit" className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-teal-500 text-white font-bold text-sm transition-all hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20">
            Get the Toolkit Free Today
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </section>

      {/* ── THE SOLUTION ── */}
      <section className="py-20 bg-slate-800/20 border-b border-slate-800/60">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-widest uppercase mb-4">
              <span className="w-4 h-px bg-teal-400/60" />
              The Fix
              <span className="w-4 h-px bg-teal-400/60" />
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50">How the Best Operators Fix It</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-2xl border border-slate-700/50 bg-[#0F172A] p-7 hover:border-teal-500/30 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute -top-4 -right-2 text-8xl font-black text-slate-700/20 select-none leading-none group-hover:text-teal-500/10 transition-colors duration-300">
                  {item.step}
                </span>
                <div className="relative z-10">
                  <p className="text-xs font-mono font-semibold text-teal-400/70 tracking-widest uppercase mb-3">{item.step}</p>
                  <h3 className="font-bold text-slate-100 text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(13,148,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-sky-500/5 pointer-events-none" />
        <div className="container max-w-2xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-widest uppercase mb-6">
              <span className="w-4 h-px bg-teal-400/60" />
              Start With the Toolkit
              <span className="w-4 h-px bg-teal-400/60" />
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">
              Find the Leak First. Then Decide If It Is Worth a Call.
            </h2>
            <p className="text-slate-400 mb-10 leading-relaxed">
              Claim the toolkit, run the calculator or Automation Leak Audit, and use the Snapshot path to see the first fix. If the result shows money or time worth recovering, book the free diagnosis call from the unlocked hub.
            </p>
            <a
              href="#toolkit"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold text-base transition-all hover:shadow-xl hover:shadow-teal-500/25 hover:scale-[1.02] group"
            >
              Get the Toolkit Free Today
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <p className="text-xs text-slate-600 mt-4">6 PDFs, three tools, and Snapshot path. No spam. No commitment.</p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800/60 py-12">
        <div className="container">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-5 md:h-7 w-auto object-contain cursor-pointer" />
                </Link>
                <span className="text-xs text-slate-600 font-medium">The Sub-Trade OS</span>
              </div>
              <a href="mailto:david@primegrowthai.com" className="text-sm text-slate-500 hover:text-teal-400 transition-colors">
                david@primegrowthai.com
              </a>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
              <p className="text-xs text-slate-600 max-w-md text-center md:text-left leading-relaxed">
                The Done-For-You Operations System for Specialty Contractors.
                Project scheduling, margin tracking, crew dispatch, and automated invoicing.
                Built for you. Live in 14 days.
              </p>
              <span className="text-xs text-slate-700">
                © {new Date().getFullYear()} PrimeGrowth AI. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
