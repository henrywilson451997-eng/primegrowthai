import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Download,
  Calculator,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { GHL_WEBHOOKS, sendGhlWebhookGet } from "@/lib/ghlWebhook";
import { trackMetaCustomEvent } from "@/lib/metaPixel";

const LOGO_URL =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/LKOtbOSSjcLAhkCn.png";

const CALENDAR_LINK =
  "https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO";

const TOOLKIT_PDFS = [
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/primegrowth-5-systems-final_c627b5e4.pdf",
    name: "PrimeGrowth-AI-5-Systems-Operators-Playbook.pdf",
    label: "The Sub-Trade Operator's Playbook",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/friday-night-audit-en_4ce54c49.pdf",
    name: "PrimeGrowth-AI-Friday-Night-Audit.pdf",
    label: "The Friday Night Audit",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/morning-dispatch-en_cedebb3e.pdf",
    name: "PrimeGrowth-AI-Morning-Dispatch-Template.pdf",
    label: "The 5-Minute Morning Dispatch",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/job-costing-formula-en_e5746367.pdf",
    name: "PrimeGrowth-AI-Job-Costing-Formula.pdf",
    label: "The Job Costing Formula",
  },
  {
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/WiHEXrkXCoDFDFsb.pdf",
    name: "PrimeGrowth-AI-Change-Order-Protection-Kit.pdf",
    label: "The Change Order Protection Kit",
  },
  {
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/pOkzvdKrPLjImvyq.pdf",
    name: "PrimeGrowth-AI-Subcontractor-Scope-Letter.pdf",
    label: "The Subcontractor Scope Letter",
  },
];

const UNLOCKED_TOOLS = [
  {
    href: "/tools/job-costing-calculator?toolkit=unlocked",
    label: "Job Costing Calculator",
    desc: "Price the next job with minimum profitable quote, break-even days, daily labour burn, overhead, and margin risk.",
  },
  {
    href: "/tools/ai-growth-score?toolkit=unlocked",
    label: "Automation Leak Audit",
    desc: "Run the 4-minute diagnosis for missed follow-up, slow response, after-hours coverage, and monthly revenue leakage.",
  },
  {
    href: "/tools/change-order-builder?toolkit=unlocked",
    label: "Change Order Message Builder",
    desc: "Generate a client message, SMS version, approval line, and internal scope note before an extra becomes free work.",
  },
  {
    href: CALENDAR_LINK,
    label: "Book an Operations SnapShot Call",
    desc: "Book a free call to map the first operational leak worth fixing.",
    external: true,
  },
];

const TOOLKIT_UNLOCK_KEY = "pg_construction_toolkit_unlocked";

type DiagnosticResultKey =
  | "lead_response"
  | "quote_followup"
  | "admin_bottleneck"
  | "margin_blindspot";
type DiagnosticQuestionId = "leak" | "busyWeek" | "urgency";

type DiagnosticOption = {
  label: string;
  value: string;
  detail?: string;
};

type DiagnosticQuestion = {
  id: DiagnosticQuestionId;
  eyebrow: string;
  prompt: string;
  helper: string;
  options: DiagnosticOption[];
};

type DiagnosticResult = {
  title: string;
  headline: string;
  body: string;
  recommendedPdfLabels: string[];
  recommendedToolLabels: string[];
  primaryCta: { href: string; label: string };
  nextStep: string;
};

const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "leak",
    eyebrow: "Question 1 of 3",
    prompt: "Where do you feel the most leakage right now?",
    helper:
      "Pick the closest answer. This does not change your access — it only points you to the best first tool.",
    options: [
      {
        label: "Missed calls or slow lead response",
        value: "lead_response",
        detail: "Leads wait while you are on site.",
      },
      {
        label: "Quotes or extras not followed up",
        value: "quote_followup",
        detail: "Money gets lost after the estimate or change request.",
      },
      {
        label: "Admin, dispatch, or paperwork pile-up",
        value: "admin_bottleneck",
        detail: "Your nights become the office shift.",
      },
      {
        label: "Not knowing the real margin on jobs",
        value: "margin_blindspot",
        detail: "You finish the job but still cannot see what you kept.",
      },
    ],
  },
  {
    id: "busyWeek",
    eyebrow: "Question 2 of 3",
    prompt: "What usually breaks first during a busy week?",
    helper: "This is the pressure point your first system should protect.",
    options: [
      { label: "New leads wait too long", value: "lead_response" },
      {
        label: "Approved extras do not become clean paperwork",
        value: "quote_followup",
      },
      {
        label: "Crew updates, receipts, and schedules get scattered",
        value: "admin_bottleneck",
      },
      {
        label: "Labour, materials, and changes are hard to reconcile",
        value: "margin_blindspot",
      },
    ],
  },
  {
    id: "urgency",
    eyebrow: "Question 3 of 3",
    prompt: "How soon do you want this leak under control?",
    helper:
      "Your result will show the fastest first move, not a giant software project.",
    options: [
      {
        label: "This month",
        value: "this_month",
        detail: "I need the first fix now.",
      },
      {
        label: "This quarter",
        value: "this_quarter",
        detail: "I want a clean plan before it gets worse.",
      },
      {
        label: "Just researching",
        value: "researching",
        detail: "Show me what to inspect first.",
      },
    ],
  },
];

const DIAGNOSTIC_RESULTS: Record<DiagnosticResultKey, DiagnosticResult> = {
  lead_response: {
    title: "Your likely first leak: Lead Response Leak",
    headline: "Start by making every new opportunity impossible to miss.",
    body: "If leads wait while you are on site, the business is leaking before the quote even exists. Your first move is to tighten intake, dispatch the right next message, and make follow-up visible.",
    recommendedPdfLabels: [
      "The 5-Minute Morning Dispatch",
      "The Friday Night Audit",
    ],
    recommendedToolLabels: [
      "Automation Leak Audit",
      "Book an Operations SnapShot Call",
    ],
    primaryCta: {
      href: "/tools/ai-growth-score?toolkit=unlocked",
      label: "Run the Automation Leak Audit",
    },
    nextStep:
      "If this is happening every week, book a free diagnosis call to map the first lead handoff worth fixing.",
  },
  quote_followup: {
    title: "Your likely first leak: Quote Follow-Up Leak",
    headline:
      "Start by protecting the money already sitting in estimates and extras.",
    body: "When quotes, approvals, and extras live in texts or memory, good work turns into free work. Your first move is to standardize follow-up language and approval capture before the crew moves.",
    recommendedPdfLabels: [
      "The Change Order Protection Kit",
      "The Subcontractor Scope Letter",
      "The Friday Night Audit",
    ],
    recommendedToolLabels: [
      "Change Order Message Builder",
      "Book an Operations SnapShot Call",
    ],
    primaryCta: {
      href: "/tools/change-order-builder?toolkit=unlocked",
      label: "Build a Change Order Message",
    },
    nextStep:
      "If unpaid extras or dead quotes are common, book a free diagnosis call to identify the first approval or follow-up system to install.",
  },
  admin_bottleneck: {
    title: "Your likely first leak: Admin Bottleneck",
    headline: "Start by removing the recurring office shift from your nights.",
    body: "When dispatch, receipts, timesheets, updates, and questions live across texts and memory, you become the system. Your first move is to identify the repeat handoff that should stop depending on you.",
    recommendedPdfLabels: [
      "The Friday Night Audit",
      "The Sub-Trade Operator's Playbook",
      "The 5-Minute Morning Dispatch",
    ],
    recommendedToolLabels: [
      "Automation Leak Audit",
      "Book an Operations SnapShot Call",
    ],
    primaryCta: {
      href: "/tools/ai-growth-score?toolkit=unlocked",
      label: "Find the Admin Leak",
    },
    nextStep:
      "If admin is eating nights or weekends, book a free diagnosis call to identify the first workflow worth removing from your plate.",
  },
  margin_blindspot: {
    title: "Your likely first leak: Margin Blind Spot",
    headline:
      "Start by checking whether the next job is profitable before you win it.",
    body: "If labour, materials, extras, and overhead are not visible before the quote goes out, you can win work and still lose margin. Your first move is to pressure-test the numbers before the next price leaves your phone.",
    recommendedPdfLabels: [
      "The Job Costing Formula",
      "The Sub-Trade Operator's Playbook",
      "The Friday Night Audit",
    ],
    recommendedToolLabels: [
      "Job Costing Calculator",
      "Book an Operations SnapShot Call",
    ],
    primaryCta: {
      href: "/tools/job-costing-calculator?toolkit=unlocked",
      label: "Open the Job Costing Calculator",
    },
    nextStep:
      "If you cannot quickly see what jobs actually keep, book a free diagnosis call to identify the first reporting gap worth fixing.",
  },
};

function getDiagnosticResultKey(
  answers: Partial<Record<DiagnosticQuestionId, string>>
): DiagnosticResultKey | null {
  const first = answers.leak as DiagnosticResultKey | undefined;
  const second = answers.busyWeek as DiagnosticResultKey | undefined;
  return first || second || null;
}

function sortByRecommendedLabels<T extends { label: string }>(
  items: T[],
  labels: string[]
) {
  if (!labels.length) return items;
  return [...items].sort((a, b) => {
    const aIndex = labels.indexOf(a.label);
    const bIndex = labels.indexOf(b.label);
    const aRank = aIndex === -1 ? 999 : aIndex;
    const bRank = bIndex === -1 ? 999 : bIndex;
    return aRank - bRank;
  });
}

export default function ResourceThankYou() {
  useSEO({
    title: "Thank You — Your Toolkit Is Downloading | PrimeGrowth AI",
    description:
      "Your Sub-Trade Operator's Toolkit is downloading. Check your downloads folder.",
    canonical:
      "https://www.primegrowthai.com/resources/construction-systems/thank-you",
    lang: "en",
    noindex: true,
  });

  const [diagnosticStep, setDiagnosticStep] = useState(0);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<
    Partial<Record<DiagnosticQuestionId, string>>
  >({});
  const [email] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("email") || "";
    } catch {
      return "";
    }
  });
  const [firstName] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("name") || "";
    } catch {
      return "";
    }
  });
  const submittedDiagnosticKeyRef = useRef<string | null>(null);
  const hasCapturedContact = Boolean(email.trim() && firstName.trim());
  const diagnosticResultKey = getDiagnosticResultKey(diagnosticAnswers);
  const diagnosticResult = diagnosticResultKey
    ? DIAGNOSTIC_RESULTS[diagnosticResultKey]
    : null;
  const activeDiagnosticQuestion = DIAGNOSTIC_QUESTIONS[diagnosticStep];
  const diagnosticComplete = DIAGNOSTIC_QUESTIONS.every(
    question => diagnosticAnswers[question.id]
  );
  const recommendedPdfs = sortByRecommendedLabels(
    TOOLKIT_PDFS,
    diagnosticResult?.recommendedPdfLabels || []
  );
  const recommendedTools = sortByRecommendedLabels(
    UNLOCKED_TOOLS,
    diagnosticResult?.recommendedToolLabels || []
  );

  const handleDiagnosticAnswer = (
    questionId: DiagnosticQuestionId,
    value: string
  ) => {
    setDiagnosticAnswers(current => ({ ...current, [questionId]: value }));
    const questionIndex = DIAGNOSTIC_QUESTIONS.findIndex(
      question => question.id === questionId
    );
    if (questionIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
      setDiagnosticStep(questionIndex + 1);
    }
  };

  useEffect(() => {
    try {
      if (hasCapturedContact) {
        window.localStorage.setItem(
          TOOLKIT_UNLOCK_KEY,
          JSON.stringify({
            email,
            firstName,
            language: "en",
            unlockedAt: new Date().toISOString(),
            source: "construction-resource-thank-you",
          })
        );
      }
    } catch {
      // The unlocked hub remains usable if local storage is unavailable.
    }
  }, [email, firstName, hasCapturedContact]);

  useEffect(() => {
    if (!hasCapturedContact || !diagnosticComplete || !diagnosticResultKey) return;

    const submissionKey = JSON.stringify(diagnosticAnswers);
    if (submittedDiagnosticKeyRef.current === submissionKey) return;
    submittedDiagnosticKeyRef.current = submissionKey;

    const selectedLabels = DIAGNOSTIC_QUESTIONS.reduce<Record<string, string>>(
      (accumulator, question) => {
        const value = diagnosticAnswers[question.id] || "";
        const option = question.options.find(candidate => candidate.value === value);
        accumulator[question.id] = option?.label || value;
        return accumulator;
      },
      {}
    );

    sendGhlWebhookGet(GHL_WEBHOOKS.websiteResourceForm, {
      firstName: firstName.trim(),
      email: email.trim(),
      source: "resource-thank-you-first-leak-finder",
      tags: [
        "resource_thank_you_diagnostic",
        "first_leak_finder",
        "construction-resource",
        "en",
        diagnosticResultKey,
      ],
      language: "en",
      customFields: {
        diagnosticLeak: diagnosticAnswers.leak || "",
        diagnosticBusyWeek: diagnosticAnswers.busyWeek || "",
        diagnosticUrgency: diagnosticAnswers.urgency || "",
        diagnosticLeakLabel: selectedLabels.leak || "",
        diagnosticBusyWeekLabel: selectedLabels.busyWeek || "",
        diagnosticUrgencyLabel: selectedLabels.urgency || "",
        diagnosticResult: diagnosticResultKey,
        recommendedFirstPath: diagnosticResult?.title || "",
      },
    }).catch(error => {
      console.error("[GHL] Resource diagnostic submission failed:", error);
    });
  }, [
    diagnosticAnswers,
    diagnosticComplete,
    diagnosticResult?.title,
    diagnosticResultKey,
    email,
    firstName,
    hasCapturedContact,
  ]);

  if (!hasCapturedContact) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <a href="/" className="flex items-center gap-3">
              <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-8 w-auto" />
            </a>
          </div>
        </header>
        <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-6 rounded-3xl border border-teal-500/25 bg-teal-500/8 p-8 shadow-2xl shadow-teal-950/20">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-teal-300">
              Toolkit locked
            </p>
            <h1 className="mb-4 text-3xl font-black leading-tight text-white md:text-4xl">
              Claim the free toolkit before opening the resource hub.
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-slate-400">
              This page only unlocks after the form captures your first name,
              email, and phone. Go back to the resource page and submit the form
              so the toolkit can unlock correctly.
            </p>
            <a
              href="/resources/construction-systems"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 px-6 py-3 text-sm font-black text-white transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-teal-500/25"
            >
              Claim the free toolkit →
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-[#0a0f1a]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-slate-200 hidden sm:block">
              PrimeGrowth AI
            </span>
          </a>
          <a
            href={CALENDAR_LINK}
            onClick={() =>
              trackMetaCustomEvent("BookOperationsSnapshotCall", {
                source: "toolkit-thank-you-en",
                language: "en",
              })
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
          >
            Book the free diagnosis call <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Confirmation banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-4 p-5 rounded-2xl bg-teal-500/8 border border-teal-500/20 mb-10"
        >
          <CheckCircle className="w-6 h-6 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-100 text-base">
              Your toolkit is downloading now.
            </p>
            <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">
              6 PDFs are downloading to your device. Check your downloads
              folder. If anything is missing, click the links below.
            </p>
          </div>
        </motion.div>

        {/* Post-gate diagnostic */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-12 overflow-hidden rounded-3xl border border-teal-500/25 bg-slate-900/70 shadow-2xl shadow-teal-950/10"
        >
          <div className="border-b border-slate-800/80 bg-gradient-to-r from-teal-500/10 via-slate-900 to-sky-500/10 p-5 sm:p-6">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-teal-300">
              Start here · 45-second first-leak finder
            </p>
            <h1 className="text-2xl font-black leading-tight text-white md:text-3xl">
              Before you open every file, find the one tool to use first.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Your full toolkit stays unlocked. These three taps simply turn the
              resource hub into a recommended path instead of a pile of links.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {!diagnosticComplete ? (
              <div>
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    <span>{activeDiagnosticQuestion.eyebrow}</span>
                    <span>
                      {Math.round(
                        ((diagnosticStep + 1) / DIAGNOSTIC_QUESTIONS.length) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-400 transition-all"
                      style={{
                        width: `${((diagnosticStep + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDiagnosticQuestion.id}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.22 }}
                  >
                    <h2 className="text-xl font-black leading-tight text-slate-50">
                      {activeDiagnosticQuestion.prompt}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {activeDiagnosticQuestion.helper}
                    </p>
                    <div className="mt-5 grid grid-cols-1 gap-3">
                      {activeDiagnosticQuestion.options.map(option => {
                        const selected =
                          diagnosticAnswers[activeDiagnosticQuestion.id] ===
                          option.value;
                        return (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() =>
                              handleDiagnosticAnswer(
                                activeDiagnosticQuestion.id,
                                option.value
                              )
                            }
                            className={`w-full rounded-2xl border p-4 text-left transition-all ${
                              selected
                                ? "border-teal-400 bg-teal-500/10 shadow-lg shadow-teal-950/20"
                                : "border-slate-700/70 bg-slate-800/45 hover:border-teal-500/35 hover:bg-slate-800/75"
                            }`}
                          >
                            <span className="block text-sm font-bold text-slate-100">
                              {option.label}
                            </span>
                            {option.detail && (
                              <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                                {option.detail}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {diagnosticStep > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setDiagnosticStep(step => Math.max(0, step - 1))
                        }
                        className="mt-4 text-xs font-bold text-slate-500 transition-colors hover:text-teal-300"
                      >
                        ← Back one question
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : diagnosticResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-teal-300">
                  <CheckCircle className="h-4 w-4" />
                  Your recommended first path
                </div>
                <div className="rounded-2xl border border-teal-500/25 bg-teal-500/8 p-5">
                  <p className="text-sm font-black text-teal-300">
                    {diagnosticResult.title}
                  </p>
                  <h2 className="mt-2 text-2xl font-black leading-tight text-white">
                    {diagnosticResult.headline}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {diagnosticResult.body}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    {diagnosticResult.nextStep}
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={diagnosticResult.primaryCta.href}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 px-5 py-3 text-sm font-black text-white transition-all hover:shadow-lg hover:shadow-teal-500/20"
                    >
                      {diagnosticResult.primaryCta.label}{" "}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href="#operations-snapshot"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-500/20 px-5 py-3 text-sm font-bold text-teal-300 transition-all hover:bg-teal-500/10"
                    >
                      Book the Free Diagnosis Call
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDiagnosticAnswers({});
                    setDiagnosticStep(0);
                  }}
                  className="mt-4 text-xs font-bold text-slate-500 transition-colors hover:text-teal-300"
                >
                  Retake the 3 questions
                </button>
              </motion.div>
            ) : null}
          </div>
        </motion.div>

        {/* Manual download links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Your 6 PDFs — click to download manually if needed
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recommendedPdfs.map((pdf, i) => (
              <a
                key={i}
                href={pdf.url}
                download={pdf.name}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-teal-500/30 hover:bg-slate-800 transition-all group"
              >
                <Download className="w-4 h-4 text-teal-400/60 group-hover:text-teal-400 shrink-0 transition-colors" />
                <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors leading-tight">
                  {pdf.label}
                </span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-slate-800/60 mb-12" />

        {/* Unlocked tools */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-3">
            Your unlocked tools — recommended first when available
          </p>
          <div className="grid grid-cols-1 gap-3">
            {recommendedTools.map(tool => (
              <a
                key={tool.label}
                href={tool.href}
                target={(tool as { external?: boolean }).external ? "_blank" : undefined}
                rel={(tool as { external?: boolean }).external ? "noopener noreferrer" : undefined}
                onClick={() => {
                  if ((tool as { external?: boolean }).external) {
                    trackMetaCustomEvent("BookOperationsSnapshotCall", {
                      source: "toolkit-thank-you-en",
                      language: "en",
                      cta: "recommended_tool_card",
                    });
                  }
                }}
                className="flex items-start gap-3 rounded-2xl border border-slate-700/60 bg-slate-800/45 p-4 transition-all hover:border-teal-500/35 hover:bg-slate-800/70"
              >
                <Calculator className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
                <span>
                  <span className="block text-sm font-bold text-slate-100">
                    {tool.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                    {tool.desc}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </motion.div>

        <div className="border-t border-slate-800/60 mb-12" />

        {/* Public booking CTA */}
        <motion.div
          id="operations-snapshot"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-3xl border border-teal-500/25 bg-teal-500/5 p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-teal-400 tracking-widest uppercase border border-teal-500/20 rounded-full px-3 py-1 bg-teal-500/5">
              Next step — free diagnosis call
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-3 leading-tight">
            If the guide exposed a real leak, book the free diagnosis call.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-6">
            Use the call to map the first bottleneck, decide what should be automated first, and leave with a practical next step for your operation.
          </p>
          <a
            href={CALENDAR_LINK}
            onClick={() =>
              trackMetaCustomEvent("BookOperationsSnapshotCall", {
                source: "toolkit-thank-you-en",
                language: "en",
                cta: "resource_guide_result_booking",
              })
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20"
          >
            Book the Free Diagnosis Call <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-10 border-t border-slate-800/60 text-center"
        >
          <p className="text-slate-500 text-sm mb-4">
            If your operation already feels too dependent on you, do not turn
            this into another thing you read and forget.
          </p>
          <a
            href={CALENDAR_LINK}
            onClick={() =>
              trackMetaCustomEvent("BookOperationsSnapshotCall", {
                source: "toolkit-thank-you-en",
                language: "en",
              })
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-teal-500/20 text-teal-400 text-sm font-semibold hover:bg-teal-500/10 transition-all"
          >
            Book the Free Diagnosis Call <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </main>
    </div>
  );
}
