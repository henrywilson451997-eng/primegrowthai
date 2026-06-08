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

const TOOLKIT_PDFS_FR = [
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/primegrowth-5-systems-final_c627b5e4.pdf",
    name: "PrimeGrowth-AI-Manuel-Operateur-Sous-Traitant.pdf",
    label: "Le Manuel de l'Opérateur Sous-Traitant",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/friday-night-audit-fr_59e976cf.pdf",
    name: "PrimeGrowth-AI-Audit-Vendredi-Soir.pdf",
    label: "L'Audit du Vendredi Soir",
  },
  {
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/amsbIsNULqByNgxQ.pdf",
    name: "PrimeGrowth-AI-Dispatch-Matin-5-Minutes.pdf",
    label: "Le Dispatch du Matin en 5 Minutes",
  },
  {
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/job-costing-formula-fr_8b956dda.pdf",
    name: "PrimeGrowth-AI-Formule-Cout-Chantier.pdf",
    label: "La Formule de Coût de Chantier",
  },
  {
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/EknLhJcpMsSaPfqc.pdf",
    name: "PrimeGrowth-AI-Trousse-Protection-Extras.pdf",
    label: "La Trousse de Protection des Extras",
  },
  {
    url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/RlnyNuQvHyqAqkrA.pdf",
    name: "PrimeGrowth-AI-Lettre-Portee-Sous-Traitant.pdf",
    label: "La Lettre de Portée pour Sous-Traitant",
  },
];

const UNLOCKED_TOOLS_FR = [
  {
    href: "/fr/outils/calculateur-couts-chantier?toolkit=unlocked",
    label: "Calculateur de Coût de Chantier",
    desc: "Calcule la soumission minimale rentable, les jours de rentabilité, le coût quotidien de main-d'œuvre, les frais fixes et le risque de marge avant de fixer ton prix.",
  },
  {
    href: "/fr/outils/calculateur-croissance-ia?toolkit=unlocked",
    label: "Audit des Fuites d’Automatisation",
    desc: "Fais le diagnostic de 4 minutes sur l’entrée de leads, les réponses lentes, les relances de soumissions et la couverture hors heures.",
  },
  {
    href: "/fr/outils/generateur-extra?toolkit=unlocked",
    label: "Générateur de Message d'Extra",
    desc: "Crée un message client, une version texto, une formule d’approbation et une note interne avant que l’extra devienne gratuit.",
  },
  {
    href: CALENDAR_LINK,
    label: "Réserver le bilan opérationnel",
    desc: "Réserve un appel gratuit pour cartographier la première fuite opérationnelle à corriger.",
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

const DIAGNOSTIC_QUESTIONS_FR: DiagnosticQuestion[] = [
  {
    id: "leak",
    eyebrow: "Question 1 de 3",
    prompt: "Où sens-tu la plus grosse fuite en ce moment?",
    helper:
      "Choisis la réponse la plus proche. Ça ne change pas ton accès — ça indique seulement le meilleur outil à utiliser en premier.",
    options: [
      {
        label: "Appels manqués ou réponse trop lente aux leads",
        value: "lead_response",
        detail: "Les prospects attendent pendant que tu es sur le chantier.",
      },
      {
        label: "Soumissions ou extras qui ne sont pas relancés",
        value: "quote_followup",
        detail: "L'argent se perd après l'estimation ou la demande d'extra.",
      },
      {
        label: "Admin, dispatch ou paperasse qui s'accumule",
        value: "admin_bottleneck",
        detail: "Tes soirs deviennent le quart de bureau.",
      },
      {
        label: "Difficulté à voir la vraie marge des jobs",
        value: "margin_blindspot",
        detail:
          "Tu finis le chantier, mais tu ne vois pas clairement ce qui reste.",
      },
    ],
  },
  {
    id: "busyWeek",
    eyebrow: "Question 2 de 3",
    prompt: "Qu'est-ce qui brise en premier pendant une grosse semaine?",
    helper:
      "C'est le point de pression que ton premier système devrait protéger.",
    options: [
      {
        label: "Les nouveaux leads attendent trop longtemps",
        value: "lead_response",
      },
      {
        label: "Les extras approuvés ne deviennent pas de la paperasse claire",
        value: "quote_followup",
      },
      {
        label: "Les updates d'équipe, reçus et horaires sont éparpillés",
        value: "admin_bottleneck",
      },
      {
        label:
          "Main-d'œuvre, matériaux et changements sont difficiles à réconcilier",
        value: "margin_blindspot",
      },
    ],
  },
  {
    id: "urgency",
    eyebrow: "Question 3 de 3",
    prompt: "À quel point veux-tu reprendre le contrôle de cette fuite?",
    helper:
      "Ton résultat va montrer le premier mouvement le plus rapide, pas un gros projet logiciel.",
    options: [
      {
        label: "Ce mois-ci",
        value: "this_month",
        detail: "J'ai besoin d'un premier correctif maintenant.",
      },
      {
        label: "Ce trimestre",
        value: "this_quarter",
        detail: "Je veux un plan clair avant que ça empire.",
      },
      {
        label: "Je fais juste regarder",
        value: "researching",
        detail: "Montre-moi quoi inspecter en premier.",
      },
    ],
  },
];

const DIAGNOSTIC_RESULTS_FR: Record<DiagnosticResultKey, DiagnosticResult> = {
  lead_response: {
    title: "Ta fuite probable à corriger en premier : Réponse aux Leads",
    headline:
      "Commence par rendre chaque nouvelle opportunité impossible à manquer.",
    body: "Si les leads attendent pendant que tu es sur le chantier, l'entreprise fuit avant même que la soumission existe. Le premier mouvement est de serrer l'entrée des demandes, le prochain message et la visibilité du suivi.",
    recommendedPdfLabels: [
      "Le Dispatch du Matin en 5 Minutes",
      "L'Audit du Vendredi Soir",
    ],
    recommendedToolLabels: [
      "Audit des Fuites d’Automatisation",
      "Réserver le bilan opérationnel",
    ],
    primaryCta: {
      href: "/fr/outils/calculateur-croissance-ia?toolkit=unlocked",
      label: "Faire l'Audit des Fuites",
    },
    nextStep:
      "Si ça arrive chaque semaine, réserve un appel gratuit pour mettre au clair le premier transfert de lead à corriger.",
  },
  quote_followup: {
    title: "Ta fuite probable à corriger en premier : Suivi des Soumissions",
    headline:
      "Commence par protéger l'argent déjà présent dans tes soumissions et extras.",
    body: "Quand les soumissions, approbations et extras vivent dans les textos ou dans ta tête, du bon travail devient du travail gratuit. Le premier mouvement est de standardiser la relance et l'approbation avant que l'équipe bouge.",
    recommendedPdfLabels: [
      "La Trousse de Protection des Extras",
      "La Lettre de Portée pour Sous-Traitant",
      "L'Audit du Vendredi Soir",
    ],
    recommendedToolLabels: [
      "Générateur de Message d'Extra",
      "Réserver le bilan opérationnel",
    ],
    primaryCta: {
      href: "/fr/outils/generateur-extra?toolkit=unlocked",
      label: "Créer un Message d'Extra",
    },
    nextStep:
      "Si les extras impayés ou soumissions mortes reviennent souvent, réserve un appel gratuit pour identifier le premier système de relance ou d’approbation à installer.",
  },
  admin_bottleneck: {
    title: "Ta fuite probable à corriger en premier : Goulot d'Admin",
    headline: "Commence par retirer le quart de bureau récurrent de tes soirs.",
    body: "Quand le dispatch, les reçus, les feuilles de temps, les updates et les questions vivent dans les textos et la mémoire, tu deviens le système. Le premier mouvement est d'identifier le transfert répétitif qui ne devrait plus dépendre de toi.",
    recommendedPdfLabels: [
      "L'Audit du Vendredi Soir",
      "Le Manuel de l'Opérateur Sous-Traitant",
      "Le Dispatch du Matin en 5 Minutes",
    ],
    recommendedToolLabels: [
      "Audit des Fuites d’Automatisation",
      "Réserver le bilan opérationnel",
    ],
    primaryCta: {
      href: "/fr/outils/calculateur-croissance-ia?toolkit=unlocked",
      label: "Trouver la Fuite d'Admin",
    },
    nextStep:
      "Si l'admin mange tes soirs ou tes fins de semaine, réserve un appel gratuit pour identifier le premier workflow à retirer de ton assiette.",
  },
  margin_blindspot: {
    title: "Ta fuite probable à corriger en premier : Angle Mort de Marge",
    headline:
      "Commence par vérifier si le prochain chantier est rentable avant de le gagner.",
    body: "Si la main-d'œuvre, les matériaux, les extras et les frais fixes ne sont pas visibles avant l'envoi du prix, tu peux gagner du travail et perdre de la marge. Le premier mouvement est de tester les chiffres avant que le prochain prix parte de ton téléphone.",
    recommendedPdfLabels: [
      "La Formule de Coût de Chantier",
      "Le Manuel de l'Opérateur Sous-Traitant",
      "L'Audit du Vendredi Soir",
    ],
    recommendedToolLabels: [
      "Calculateur de Coût de Chantier",
      "Réserver le bilan opérationnel",
    ],
    primaryCta: {
      href: "/fr/outils/calculateur-couts-chantier?toolkit=unlocked",
      label: "Ouvrir le Calculateur de Coût",
    },
    nextStep:
      "Si tu ne vois pas rapidement ce que les chantiers gardent vraiment, réserve un appel gratuit pour identifier le premier écart de visibilité à corriger.",
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

export default function ResourceThankYouFR() {
  useSEO({
    title: "Merci — Votre trousse est en téléchargement | PrimeGrowth AI",
    description:
      "Votre Trousse de l'Opérateur Sous-Traitant est en téléchargement. Vérifiez votre dossier de téléchargements.",
    canonical:
      "https://www.primegrowthai.com/fr/ressources/systemes-construction/merci",
    lang: "fr",
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
    ? DIAGNOSTIC_RESULTS_FR[diagnosticResultKey]
    : null;
  const activeDiagnosticQuestion = DIAGNOSTIC_QUESTIONS_FR[diagnosticStep];
  const diagnosticComplete = DIAGNOSTIC_QUESTIONS_FR.every(
    question => diagnosticAnswers[question.id]
  );
  const recommendedPdfs = sortByRecommendedLabels(
    TOOLKIT_PDFS_FR,
    diagnosticResult?.recommendedPdfLabels || []
  );
  const recommendedTools = sortByRecommendedLabels(
    UNLOCKED_TOOLS_FR,
    diagnosticResult?.recommendedToolLabels || []
  );

  const handleDiagnosticAnswer = (
    questionId: DiagnosticQuestionId,
    value: string
  ) => {
    setDiagnosticAnswers(current => ({ ...current, [questionId]: value }));
    const questionIndex = DIAGNOSTIC_QUESTIONS_FR.findIndex(
      question => question.id === questionId
    );
    if (questionIndex < DIAGNOSTIC_QUESTIONS_FR.length - 1) {
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
            language: "fr",
            unlockedAt: new Date().toISOString(),
            source: "construction-resource-thank-you",
          })
        );
      }
    } catch {
      // Le hub débloqué reste utilisable si le stockage local n'est pas disponible.
    }
  }, [email, firstName, hasCapturedContact]);

  useEffect(() => {
    if (!hasCapturedContact || !diagnosticComplete || !diagnosticResultKey) return;

    const submissionKey = JSON.stringify(diagnosticAnswers);
    if (submittedDiagnosticKeyRef.current === submissionKey) return;
    submittedDiagnosticKeyRef.current = submissionKey;

    const selectedLabels = DIAGNOSTIC_QUESTIONS_FR.reduce<Record<string, string>>(
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
        "fr",
        diagnosticResultKey,
      ],
      language: "fr",
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
            <a href="/fr" className="flex items-center gap-3">
              <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-8 w-auto" />
            </a>
          </div>
        </header>
        <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-6 rounded-3xl border border-teal-500/25 bg-teal-500/8 p-8 shadow-2xl shadow-teal-950/20">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-teal-300">
              Trousse verrouillée
            </p>
            <h1 className="mb-4 text-3xl font-black leading-tight text-white md:text-4xl">
              Réclame la trousse gratuite avant d'ouvrir le hub de ressources.
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-slate-400">
              Cette page se débloque seulement après la capture du prénom, du
              courriel et du téléphone. Retourne à la page de ressources et
              soumets le formulaire pour que la trousse se débloque correctement.
            </p>
            <a
              href="/fr/ressources/systemes-construction"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 px-6 py-3 text-sm font-black text-white transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-teal-500/25"
            >
              Réclamer la trousse gratuite →
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
          <a href="/fr" className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-slate-200 hidden sm:block">
              PrimeGrowth AI
            </span>
          </a>
          <a
            href={CALENDAR_LINK}
            onClick={() =>
              trackMetaCustomEvent("BookOperationsSnapshotCall", {
                source: "toolkit-thank-you-fr",
                language: "fr",
              })
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
          >
            Réserver l'appel diagnostic gratuit{" "}
            <ArrowRight className="w-3 h-3" />
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
              Ta trousse est en téléchargement.
            </p>
            <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">
              6 PDF se téléchargent sur ton appareil. Vérifie ton dossier de
              téléchargements. Si quelque chose manque, clique sur les liens
              ci-dessous.
            </p>
          </div>
        </motion.div>

        {/* Diagnostic après accès */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-12 overflow-hidden rounded-3xl border border-teal-500/25 bg-slate-900/70 shadow-2xl shadow-teal-950/10"
        >
          <div className="border-b border-slate-800/80 bg-gradient-to-r from-teal-500/10 via-slate-900 to-sky-500/10 p-5 sm:p-6">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-teal-300">
              Commence ici · Trouve ta première fuite en 45 secondes
            </p>
            <h1 className="text-2xl font-black leading-tight text-white md:text-3xl">
              Avant d'ouvrir tous les fichiers, trouve l'outil à utiliser en
              premier.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Toute la trousse reste débloquée. Ces trois choix transforment
              simplement le hub en chemin recommandé au lieu d'une pile de
              liens.
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
                        ((diagnosticStep + 1) /
                          DIAGNOSTIC_QUESTIONS_FR.length) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-400 transition-all"
                      style={{
                        width: `${((diagnosticStep + 1) / DIAGNOSTIC_QUESTIONS_FR.length) * 100}%`,
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
                        ← Revenir à la question précédente
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
                  Ton chemin recommandé
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
                      href="#bilan-operationnel"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-500/20 px-5 py-3 text-sm font-bold text-teal-300 transition-all hover:bg-teal-500/10"
                    >
                      Réserver l'appel gratuit
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
                  Refaire les 3 questions
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
            Tes 6 PDF — clique pour télécharger manuellement si nécessaire
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

        {/* Outils débloqués */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest mb-3">
            Tes outils débloqués — recommandés en premier quand possible
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
                      source: "toolkit-thank-you-fr",
                      language: "fr",
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
          id="bilan-operationnel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-3xl border border-teal-500/25 bg-teal-500/5 p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-teal-400 tracking-widest uppercase border border-teal-500/20 rounded-full px-3 py-1 bg-teal-500/5">
              Prochaine étape — appel gratuit
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-3 leading-tight">
            Si le guide a exposé une vraie fuite, réserve l'appel gratuit.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-6">
            Utilise l'appel pour cartographier le premier goulot, décider ce qui devrait être automatisé en premier et repartir avec une prochaine étape pratique pour ton opération.
          </p>
          <a
            href={CALENDAR_LINK}
            onClick={() =>
              trackMetaCustomEvent("BookOperationsSnapshotCall", {
                source: "toolkit-thank-you-fr",
                language: "fr",
                cta: "resource_guide_result_booking",
              })
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20"
          >
            Réserver l'appel gratuit <ArrowRight className="w-4 h-4" />
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
            Si ton opération dépend déjà trop de toi, ne laisse pas cette
            trousse devenir un autre document que tu lis et oublies.
          </p>
          <a
            href={CALENDAR_LINK}
            onClick={() =>
              trackMetaCustomEvent("BookOperationsSnapshotCall", {
                source: "toolkit-thank-you-fr",
                language: "fr",
              })
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-teal-500/20 text-teal-400 text-sm font-semibold hover:bg-teal-500/10 transition-all"
          >
            Réserver l'appel diagnostic gratuit{" "}
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </main>
    </div>
  );
}
