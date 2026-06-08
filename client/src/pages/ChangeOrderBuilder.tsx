/*
 * PrimeGrowth AI — Change Order Message & Approval Builder
 * Routes: /tools/change-order-builder and /fr/outils/generateur-extra
 * Purpose: Turn the static Change Order Protection Kit into a usable same-day artifact.
 */
import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle, Clipboard, Download, FileText, ShieldCheck } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { trackMetaCustomEvent } from "@/lib/metaPixel";

const LOGO_URL =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/OyhhiQPpFBkvMcYg.png";
const CALENDAR_LINK = "https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO";

type Language = "en" | "fr";
type Tone = "firm" | "collaborative" | "premium";
type WorkStarted = "not_started" | "needs_approval" | "started_at_risk";

type BuilderInputs = {
  trade: string;
  clientType: string;
  stage: string;
  changeType: string;
  workStarted: WorkStarted;
  urgency: string;
  tone: Tone;
  description: string;
  priceImpact: string;
  timeImpact: string;
};

type GeneratedArtifact = {
  clientMessage: string;
  sms: string;
  internalNote: string;
  approvalLine: string;
};

type ScopeDiagnostic = {
  scopeRiskLevel: "low" | "medium" | "high";
  approvalUrgency: string;
  scopeControlGap: string;
  recommendedFollowUp: string;
};

const DEFAULT_INPUTS: BuilderInputs = {
  trade: "renovation",
  clientType: "homeowner",
  stage: "during_work",
  changeType: "scope_added",
  workStarted: "needs_approval",
  urgency: "before_next_step",
  tone: "firm",
  description: "",
  priceImpact: "",
  timeImpact: "",
};

const COPY = {
  en: {
    seoTitle: "Change Order Message & Approval Builder for Contractors | PrimeGrowth AI",
    seoDescription:
      "Free change order builder for contractors. Generate a client-ready approval message, SMS version, internal margin warning, and written approval line before unpaid extras start.",
    canonical: "https://www.primegrowthai.com/tools/change-order-builder",
    alternateHref: "https://www.primegrowthai.com/fr/outils/generateur-extra",
    alternateLang: "fr",
    navBack: "Free Resources",
    pill: "Free tool · Change order protection",
    h1: "Build the message before the extra becomes free work.",
    subhead:
      "Answer a few job-specific questions and get a clean change-order message, short SMS, approval line, and internal scope warning you can use before work continues.",
    howItWorks: [
      ["1", "Describe the change", "Enter what changed, who requested it, and when it affects the job."],
      ["2", "Add cost and time impact", "Make the money and schedule impact explicit before approval."],
      ["3", "Copy the wording", "Send the message and keep written approval in the job file."],
    ],
    builderTitle: "Change-order inputs",
    resultTitle: "Client-ready approval wording",
    generateCta: "Build my change-order message",
    incomplete: "Add the change description and at least one cost or time impact to generate the wording.",
    fields: {
      trade: "Trade / business type",
      clientType: "Client type",
      stage: "Job stage",
      changeType: "Change type",
      workStarted: "Work status",
      urgency: "Approval timing",
      tone: "Tone",
      description: "What changed?",
      descriptionPlaceholder:
        "Example: Client asked to add backsplash installation behind the range after tile layout was already approved.",
      priceImpact: "Price impact",
      pricePlaceholder: "Example: $850 plus taxes",
      timeImpact: "Schedule impact",
      timePlaceholder: "Example: adds 1 working day",
    },
    sections: {
      clientMessage: "Client message",
      sms: "Short SMS version",
      internalNote: "Internal scope note",
      approvalLine: "Approval line",
    },
    copy: "Copy",
    copied: "Copied",
    download: "Download summary",
    diagnostic: {
      title: "Scope-control diagnostic",
      riskLevel: "Scope risk level",
      approvalUrgency: "Approval urgency",
      scopeGap: "Scope-control gap",
      recommendedFollowUp: "Recommended follow-up",
      low: "Low",
      medium: "Medium",
      high: "High",
    },
    emptyResult:
      "Your message will appear here. This tool is intentionally strict: if the cost or schedule impact is unclear, your approval wording will be weak too.",
    ctaTitle: "If change orders keep slipping, this is not a wording problem.",
    ctaBody:
      "It usually means your intake, scope approval, job costing, and follow-up system are disconnected. PrimeGrowth builds the operational system so extras get captured before they become arguments.",
    ctaPrimary: "Book the Operations Review",
    ctaSecondary: "Run the Quote Rescue Audit",
    disclaimer:
      "This is practical business wording, not legal advice. Validate contract language, taxes, permits, and local requirements with the right professional when needed.",
  },
  fr: {
    seoTitle: "Générateur de message d'extra pour entrepreneurs | PrimeGrowth AI",
    seoDescription:
      "Générateur gratuit d'extras pour entrepreneurs. Crée un message client, une version texto, une note interne et une formule d'approbation écrite avant de faire du travail gratuit.",
    canonical: "https://www.primegrowthai.com/fr/outils/generateur-extra",
    alternateHref: "https://www.primegrowthai.com/tools/change-order-builder",
    alternateLang: "en",
    navBack: "Ressources gratuites",
    pill: "Outil gratuit · Protection des extras",
    h1: "Prépare le message avant que l'extra devienne du travail gratuit.",
    subhead:
      "Réponds à quelques questions sur le chantier et obtiens un message d'approbation, une version texto, une formule d'accord écrit et une note interne sur la portée.",
    howItWorks: [
      ["1", "Décris le changement", "Indique ce qui a changé, qui l'a demandé et quand ça affecte le chantier."],
      ["2", "Ajoute l'impact", "Rends l'impact sur le prix et l'échéancier explicite avant l'approbation."],
      ["3", "Copie le message", "Envoie le texte et garde l'approbation écrite dans le dossier."],
    ],
    builderTitle: "Informations sur l'extra",
    resultTitle: "Message prêt à envoyer",
    generateCta: "Créer mon message d'extra",
    incomplete: "Ajoute la description du changement et au moins un impact sur le prix ou l'échéancier.",
    fields: {
      trade: "Métier / type d'entreprise",
      clientType: "Type de client",
      stage: "Étape du chantier",
      changeType: "Type de changement",
      workStarted: "Statut du travail",
      urgency: "Moment d'approbation",
      tone: "Ton",
      description: "Qu'est-ce qui a changé?",
      descriptionPlaceholder:
        "Exemple : Le client demande d'ajouter le dosseret derrière la cuisinière après l'approbation du plan de pose.",
      priceImpact: "Impact sur le prix",
      pricePlaceholder: "Exemple : 850 $ plus taxes",
      timeImpact: "Impact sur l'échéancier",
      timePlaceholder: "Exemple : ajoute 1 journée ouvrable",
    },
    sections: {
      clientMessage: "Message client",
      sms: "Version texto courte",
      internalNote: "Note interne de portée",
      approvalLine: "Formule d'approbation",
    },
    copy: "Copier",
    copied: "Copié",
    download: "Télécharger le résumé",
    diagnostic: {
      title: "Diagnostic de contrôle de portée",
      riskLevel: "Niveau de risque",
      approvalUrgency: "Urgence d'approbation",
      scopeGap: "Faille de contrôle",
      recommendedFollowUp: "Suivi recommandé",
      low: "Faible",
      medium: "Moyen",
      high: "Élevé",
    },
    emptyResult:
      "Ton message apparaîtra ici. Cet outil est volontairement strict : si l'impact sur le prix ou l'échéancier est flou, ton approbation sera faible aussi.",
    ctaTitle: "Si les extras passent encore entre les mailles, ce n'est pas seulement un problème de mots.",
    ctaBody:
      "En général, ton intake, ton approbation de portée, ton coût de chantier et tes suivis ne sont pas connectés. PrimeGrowth construit le système opérationnel pour capturer les extras avant les disputes.",
    ctaPrimary: "Réserver le bilan opérationnel",
    ctaSecondary: "Faire l'audit de soumission",
    disclaimer:
      "Ceci est une aide de rédaction pratique, pas un conseil juridique. Valide les clauses contractuelles, taxes, permis et exigences locales avec le bon professionnel au besoin.",
  },
} as const;

const OPTIONS = {
  en: {
    trade: [
      ["renovation", "Renovation / GC"],
      ["tile", "Ceramic / tile"],
      ["concrete", "Concrete / formwork"],
      ["excavation", "Excavation"],
      ["roofing", "Roofing / exterior"],
      ["other", "Other trade"],
    ],
    clientType: [
      ["homeowner", "Homeowner"],
      ["gc", "General contractor"],
      ["property_manager", "Property manager"],
      ["commercial", "Commercial client"],
    ],
    stage: [
      ["before_start", "Before work starts"],
      ["during_work", "During active work"],
      ["near_completion", "Near completion"],
      ["after_completion", "After completion"],
    ],
    changeType: [
      ["scope_added", "Added scope"],
      ["hidden_condition", "Hidden condition"],
      ["client_change", "Client preference change"],
      ["site_not_ready", "Site not ready"],
      ["material_change", "Material/product change"],
    ],
    workStarted: [
      ["not_started", "Not started yet"],
      ["needs_approval", "Ready, but waiting for approval"],
      ["started_at_risk", "Some work already started"],
    ],
    urgency: [
      ["before_next_step", "Need approval before next step"],
      ["today", "Need approval today"],
      ["within_48h", "Need approval within 48 hours"],
      ["for_schedule", "Needed to protect schedule"],
    ],
    tone: [
      ["firm", "Firm and clear"],
      ["collaborative", "Collaborative"],
      ["premium", "Premium / polished"],
    ],
  },
  fr: {
    trade: [
      ["renovation", "Rénovation / entrepreneur général"],
      ["tile", "Céramique / tuile"],
      ["concrete", "Béton / coffrage"],
      ["excavation", "Excavation"],
      ["roofing", "Toiture / extérieur"],
      ["other", "Autre métier"],
    ],
    clientType: [
      ["homeowner", "Propriétaire résidentiel"],
      ["gc", "Entrepreneur général"],
      ["property_manager", "Gestionnaire immobilier"],
      ["commercial", "Client commercial"],
    ],
    stage: [
      ["before_start", "Avant le début des travaux"],
      ["during_work", "Pendant les travaux"],
      ["near_completion", "Près de la fin"],
      ["after_completion", "Après la fin"],
    ],
    changeType: [
      ["scope_added", "Portée ajoutée"],
      ["hidden_condition", "Condition cachée"],
      ["client_change", "Changement demandé par le client"],
      ["site_not_ready", "Chantier pas prêt"],
      ["material_change", "Changement de matériau / produit"],
    ],
    workStarted: [
      ["not_started", "Pas encore commencé"],
      ["needs_approval", "Prêt, mais en attente d'approbation"],
      ["started_at_risk", "Une partie est déjà commencée"],
    ],
    urgency: [
      ["before_next_step", "Approbation requise avant la prochaine étape"],
      ["today", "Approbation requise aujourd'hui"],
      ["within_48h", "Approbation requise dans les 48 h"],
      ["for_schedule", "Nécessaire pour protéger l'échéancier"],
    ],
    tone: [
      ["firm", "Ferme et clair"],
      ["collaborative", "Collaboratif"],
      ["premium", "Premium / professionnel"],
    ],
  },
} as const;

function optionLabel(lang: Language, group: keyof typeof OPTIONS.en, value: string) {
  const match = OPTIONS[lang][group].find(([id]) => id === value);
  return match?.[1] || value;
}

function selectClass() {
  return "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20";
}

function inputClass() {
  return "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20";
}

function generateArtifact(lang: Language, inputs: BuilderInputs): GeneratedArtifact | null {
  const description = inputs.description.trim();
  const priceImpact = inputs.priceImpact.trim();
  const timeImpact = inputs.timeImpact.trim();

  if (!description || (!priceImpact && !timeImpact)) return null;

  const trade = optionLabel(lang, "trade", inputs.trade);
  const clientType = optionLabel(lang, "clientType", inputs.clientType);
  const stage = optionLabel(lang, "stage", inputs.stage);
  const changeType = optionLabel(lang, "changeType", inputs.changeType);
  const urgency = optionLabel(lang, "urgency", inputs.urgency);

  if (lang === "fr") {
    const intro =
      inputs.tone === "premium"
        ? "Bonjour, pour garder le chantier clair et bien documenté, voici l'extra à approuver avant de continuer."
        : inputs.tone === "collaborative"
          ? "Bonjour, je veux te confirmer clairement l'impact du changement demandé pour éviter toute confusion."
          : "Bonjour, voici l'extra à approuver par écrit avant que le travail soit exécuté.";

    const approvalTiming =
      inputs.workStarted === "started_at_risk"
        ? "Comme une partie du travail a déjà commencé pour éviter un blocage, il faut confirmer l'approbation immédiatement avant d'aller plus loin."
        : inputs.workStarted === "not_started"
          ? "Le travail lié à cet extra ne commencera pas tant que l'approbation écrite n'est pas reçue."
          : "L'équipe est prête, mais l'approbation écrite est requise avant la prochaine étape.";

    const impactLine = [
      priceImpact ? `Impact sur le prix : ${priceImpact}.` : null,
      timeImpact ? `Impact sur l'échéancier : ${timeImpact}.` : null,
    ].filter(Boolean).join(" ");

    return {
      clientMessage: [
        intro,
        "",
        `Contexte : ${stage}. Type de changement : ${changeType}.`,
        `Changement à approuver : ${description}`,
        impactLine,
        approvalTiming,
        "",
        "Si tu veux qu'on procède, réponds simplement : \"J'approuve l'extra décrit ci-dessus, incluant l'impact sur le prix et l'échéancier.\"",
        "",
        "Merci. Ça nous permet de garder le chantier propre, transparent et bien documenté.",
      ].filter(Boolean).join("\n"),
      sms: `Bonjour, pour l'extra suivant : ${description}. ${impactLine} Pour procéder, réponds : "J'approuve l'extra."`,
      internalNote: `Note interne : ${trade}, client ${clientType}. Ne pas absorber cet extra dans la portée originale. ${urgency}. Garder capture d'écran / courriel d'approbation dans le dossier du chantier avant de planifier la main-d'œuvre ou commander les matériaux.`,
      approvalLine: `J'approuve l'extra décrit ci-dessus, incluant l'impact sur le prix (${priceImpact || "à confirmer"}) et l'échéancier (${timeImpact || "à confirmer"}).`,
    };
  }

  const intro =
    inputs.tone === "premium"
      ? "Hi, to keep the job clean and properly documented, here is the change order that needs approval before we continue."
      : inputs.tone === "collaborative"
        ? "Hi, I want to confirm the impact of the requested change clearly so there is no confusion later."
        : "Hi, here is the change order that needs written approval before the work is completed.";

  const approvalTiming =
    inputs.workStarted === "started_at_risk"
      ? "Because part of the work has already started to avoid holding up the site, we need written approval immediately before going further."
      : inputs.workStarted === "not_started"
        ? "The work tied to this change will not begin until written approval is received."
        : "The crew is ready, but written approval is required before the next step.";

  const impactLine = [
    priceImpact ? `Price impact: ${priceImpact}.` : null,
    timeImpact ? `Schedule impact: ${timeImpact}.` : null,
  ].filter(Boolean).join(" ");

  return {
    clientMessage: [
      intro,
      "",
      `Context: ${stage}. Change type: ${changeType}.`,
      `Change to approve: ${description}`,
      impactLine,
      approvalTiming,
      "",
      "If you want us to proceed, please reply: \"I approve the change described above, including the price and schedule impact.\"",
      "",
      "Thank you. This keeps the job clear, transparent, and properly documented.",
    ].filter(Boolean).join("\n"),
    sms: `Hi, for the following change: ${description}. ${impactLine} To proceed, please reply: "I approve this change."`,
    internalNote: `Internal note: ${trade}, ${clientType}. Do not absorb this into original scope. ${urgency}. Save screenshot/email approval in the job file before scheduling labour or ordering materials.`,
    approvalLine: `I approve the change described above, including the price impact (${priceImpact || "to be confirmed"}) and schedule impact (${timeImpact || "to be confirmed"}).`,
  };
}


function analyzeScopeDiagnostic(lang: Language, inputs: BuilderInputs): ScopeDiagnostic {
  const missingPrice = !inputs.priceImpact.trim();
  const missingTime = !inputs.timeImpact.trim();
  const startedAtRisk = inputs.workStarted === "started_at_risk";
  const urgent = inputs.urgency === "today" || inputs.urgency === "before_next_step";

  const scopeRiskLevel: ScopeDiagnostic["scopeRiskLevel"] = startedAtRisk
    ? "high"
    : missingPrice || missingTime || urgent
      ? "medium"
      : "low";

  if (lang === "fr") {
    const scopeControlGap = startedAtRisk
      ? "Travail déjà commencé avant approbation complète"
      : missingPrice
        ? "Impact prix incomplet ou flou"
        : missingTime
          ? "Impact échéancier incomplet ou flou"
          : urgent
            ? "Approbation urgente à sécuriser avant la prochaine étape"
            : "Discipline d'approbation normale à maintenir";

    const recommendedFollowUp = scopeRiskLevel === "high"
      ? "Prioriser un système d'approbation des extras avant exécution, avec preuve écrite obligatoire et alerte interne."
      : scopeRiskLevel === "medium"
        ? "Standardiser l'estimation des impacts prix/temps et les confirmations écrites avant de planifier l'équipe."
        : "Maintenir le processus et connecter les extras au suivi de coûts pour protéger la marge.";

    return {
      scopeRiskLevel,
      approvalUrgency: optionLabel(lang, "urgency", inputs.urgency),
      scopeControlGap,
      recommendedFollowUp,
    };
  }

  const scopeControlGap = startedAtRisk
    ? "Work started before full approval"
    : missingPrice
      ? "Price impact incomplete or unclear"
      : missingTime
        ? "Schedule impact incomplete or unclear"
        : urgent
          ? "Urgent approval needs to be secured before the next step"
          : "Normal approval discipline to maintain";

  const recommendedFollowUp = scopeRiskLevel === "high"
    ? "Prioritize a change-order approval system before execution, with required written proof and an internal alert."
    : scopeRiskLevel === "medium"
      ? "Standardize price/time impact estimates and written confirmations before scheduling the crew."
      : "Maintain the process and connect extras to job-cost tracking so margin stays protected.";

  return {
    scopeRiskLevel,
    approvalUrgency: optionLabel(lang, "urgency", inputs.urgency),
    scopeControlGap,
    recommendedFollowUp,
  };
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">{children}</label>;
}

function OutputCard({
  title,
  value,
  copyLabel,
  copiedLabel,
}: {
  title: string;
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">{title}</h3>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-teal-400 hover:text-teal-300"
        >
          <Clipboard className="h-3.5 w-3.5" />
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">{value}</pre>
    </div>
  );
}

export default function ChangeOrderBuilder({ lang = "en" }: { lang?: Language }) {
  const isFR = lang === "fr";
  const copy = COPY[lang];
  const [inputs, setInputs] = useState<BuilderInputs>(DEFAULT_INPUTS);
  const [hasGenerated, setHasGenerated] = useState(false);

  useSEO({
    title: copy.seoTitle,
    description: copy.seoDescription,
    canonical: copy.canonical,
    lang,
    alternateHref: copy.alternateHref,
    alternateLang: copy.alternateLang,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: isFR ? "Générateur de message d'extra" : "Change Order Message & Approval Builder",
      description: copy.seoDescription,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
      provider: { "@type": "Organization", name: "PrimeGrowth AI", url: "https://www.primegrowthai.com" },
    },
  });

  const artifact = useMemo(() => generateArtifact(lang, inputs), [lang, inputs]);
  const diagnostic = useMemo(() => analyzeScopeDiagnostic(lang, inputs), [lang, inputs]);
  const isComplete = Boolean(artifact);

  const setField = (field: keyof BuilderInputs, value: string) => {
    setInputs((current) => ({ ...current, [field]: value }));
  };

  const handleGenerate = () => {
    setHasGenerated(true);
    if (!artifact) return;
    trackMetaCustomEvent("ChangeOrderBuilderGenerate", {
      language: lang,
      source: isFR ? "change-order-builder-fr" : "change-order-builder-en",
      trade: inputs.trade,
      client_type: inputs.clientType,
      job_stage: inputs.stage,
      change_type: inputs.changeType,
      work_started: inputs.workStarted,
      approval_urgency: inputs.urgency,
      scope_risk_level: diagnostic.scopeRiskLevel,
      scope_control_gap: diagnostic.scopeControlGap,
      has_price_impact: Boolean(inputs.priceImpact.trim()),
      has_time_impact: Boolean(inputs.timeImpact.trim()),
    });
  };

  const handleDownload = () => {
    if (!artifact) return;
    const summary = [
      isFR ? "PrimeGrowth AI — Message d'extra" : "PrimeGrowth AI — Change Order Message",
      "",
      copy.diagnostic.title,
      `${copy.diagnostic.riskLevel}: ${copy.diagnostic[diagnostic.scopeRiskLevel]}`,
      `${copy.diagnostic.approvalUrgency}: ${diagnostic.approvalUrgency}`,
      `${copy.diagnostic.scopeGap}: ${diagnostic.scopeControlGap}`,
      `${copy.diagnostic.recommendedFollowUp}: ${diagnostic.recommendedFollowUp}`,
      "",
      copy.sections.clientMessage,
      artifact.clientMessage,
      "",
      copy.sections.sms,
      artifact.sms,
      "",
      copy.sections.internalNote,
      artifact.internalNote,
      "",
      copy.sections.approvalLine,
      artifact.approvalLine,
      "",
      copy.disclaimer,
    ].join("\n");

    downloadTextFile(isFR ? "primegrowth-message-extra.txt" : "primegrowth-change-order-message.txt", summary);
    trackMetaCustomEvent("ChangeOrderBuilderDownload", {
      language: lang,
      source: isFR ? "change-order-builder-fr" : "change-order-builder-en",
      trade: inputs.trade,
      client_type: inputs.clientType,
      job_stage: inputs.stage,
      change_type: inputs.changeType,
      work_started: inputs.workStarted,
      approval_urgency: inputs.urgency,
      scope_risk_level: diagnostic.scopeRiskLevel,
      scope_control_gap: diagnostic.scopeControlGap,
    });
  };

  const backHref = isFR ? "/fr/ressources/systemes-construction" : "/resources/construction-systems";
  const quoteAuditHref = isFR ? "/fr/outils/calculateur-couts-chantier" : "/tools/job-costing-calculator";
  const homeHref = isFR ? "/fr" : "/";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href={homeHref} className="flex items-center gap-3">
            <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href={backHref} className="hidden text-sm font-semibold text-slate-400 transition hover:text-slate-100 sm:block">
              {copy.navBack}
            </Link>
            <a
              href={CALENDAR_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-teal-500 px-4 py-2 text-sm font-black text-white transition hover:bg-teal-400"
            >
              {copy.ctaPrimary}
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(20,184,166,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <p className="mb-5 inline-flex rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-teal-300">
                {copy.pill}
              </p>
              <h1 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
                {copy.h1}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">{copy.subhead}</p>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {copy.howItWorks.map(([step, title, desc]) => (
                  <div key={step} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/15 text-sm font-black text-teal-300">
                      {step}
                    </div>
                    <p className="font-black text-slate-100">{title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30"
            >
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-50">{copy.builderTitle}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{copy.disclaimer}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {(["trade", "clientType", "stage", "changeType", "workStarted", "urgency", "tone"] as const).map((field) => (
                  <div key={field}>
                    <FieldLabel>{copy.fields[field]}</FieldLabel>
                    <select
                      value={inputs[field]}
                      onChange={(e) => setField(field, e.target.value)}
                      className={selectClass()}
                    >
                      {OPTIONS[lang][field].map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <FieldLabel>{copy.fields.description}</FieldLabel>
                <textarea
                  value={inputs.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder={copy.fields.descriptionPlaceholder}
                  rows={4}
                  className={`${inputClass()} resize-none`}
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>{copy.fields.priceImpact}</FieldLabel>
                  <input
                    value={inputs.priceImpact}
                    onChange={(e) => setField("priceImpact", e.target.value)}
                    placeholder={copy.fields.pricePlaceholder}
                    className={inputClass()}
                  />
                </div>
                <div>
                  <FieldLabel>{copy.fields.timeImpact}</FieldLabel>
                  <input
                    value={inputs.timeImpact}
                    onChange={(e) => setField("timeImpact", e.target.value)}
                    placeholder={copy.fields.timePlaceholder}
                    className={inputClass()}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 px-5 py-4 text-sm font-black text-white transition hover:scale-[1.01] hover:shadow-xl hover:shadow-teal-500/20"
              >
                <FileText className="h-5 w-5" />
                {copy.generateCta}
              </button>
              {hasGenerated && !isComplete && <p className="mt-3 text-center text-xs text-amber-300">{copy.incomplete}</p>}
            </motion.div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 lg:sticky lg:top-28 lg:self-start">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-teal-300">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-50">{copy.resultTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {artifact ? copy.disclaimer : copy.emptyResult}
            </p>
            {artifact && (
              <>
                <div className="mt-6 rounded-2xl border border-teal-500/20 bg-teal-500/10 p-4 text-left">
                  <h3 className="text-xs font-black uppercase tracking-widest text-teal-200">{copy.diagnostic.title}</h3>
                  <dl className="mt-3 space-y-2 text-xs leading-relaxed text-slate-300">
                    <div>
                      <dt className="font-bold text-slate-500">{copy.diagnostic.riskLevel}</dt>
                      <dd>{copy.diagnostic[diagnostic.scopeRiskLevel]}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-slate-500">{copy.diagnostic.scopeGap}</dt>
                      <dd>{diagnostic.scopeControlGap}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-slate-500">{copy.diagnostic.recommendedFollowUp}</dt>
                      <dd>{diagnostic.recommendedFollowUp}</dd>
                    </div>
                  </dl>
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/40 bg-teal-500/10 px-5 py-3 text-sm font-black text-teal-200 transition hover:bg-teal-500/20"
                >
                  <Download className="h-4 w-4" />
                  {copy.download}
                </button>
              </>
            )}
          </div>

          <div className="space-y-5">
            {artifact ? (
              <>
                <OutputCard title={copy.sections.clientMessage} value={artifact.clientMessage} copyLabel={copy.copy} copiedLabel={copy.copied} />
                <OutputCard title={copy.sections.sms} value={artifact.sms} copyLabel={copy.copy} copiedLabel={copy.copied} />
                <OutputCard title={copy.sections.internalNote} value={artifact.internalNote} copyLabel={copy.copy} copiedLabel={copy.copied} />
                <OutputCard title={copy.sections.approvalLine} value={artifact.approvalLine} copyLabel={copy.copy} copiedLabel={copy.copied} />
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/35 p-10 text-center text-slate-500">
                {copy.emptyResult}
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-slate-800 bg-slate-900/50">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-50">{copy.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-400">{copy.ctaBody}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={CALENDAR_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-teal-500 px-6 py-3 text-sm font-black text-white transition hover:bg-teal-400"
              >
                {copy.ctaPrimary}
              </a>
              <Link
                href={quoteAuditHref}
                className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-black text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              >
                {copy.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
