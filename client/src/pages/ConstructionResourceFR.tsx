/*
 * PrimeGrowth AI — Page Ressource Construction (FR)
 * Version française complète de la page Construction Resource
 * Design System: Deep Navy + Teal + Professional Blue (matching Home.tsx v3.0)
 * Typography: Plus Jakarta Sans
 * Route: /fr/ressources/systemes-construction
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { GHL_WEBHOOKS, sendGhlWebhookGet } from "@/lib/ghlWebhook";
import { trackMetaCustomEvent, trackMetaLead } from "@/lib/metaPixel";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/OyhhiQPpFBkvMcYg.png";
const NICHE_CONST = "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/M9xU3P5LAzDrJZG3DHAnMY/niche_construction_ae9ba0ae.png";
const FOUNDER_VIDEO_FR_URL = "/videos/founder/founder-video-fr-540p-h264.mp4";
const FOUNDER_VIDEO_FR_POSTER = "/thumbnails/founder/founder-video-fr-poster.jpg";
const CALENDAR_LINK = "https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO";

// ── TROUSSE PDF (FR) ──────────────────────────────────────────────────────────
const PDF_5SYSTEMS_FR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/primegrowth-5-systems-final_c627b5e4.pdf";
const PDF_FRIDAY_AUDIT_FR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/friday-night-audit-fr_59e976cf.pdf";
const PDF_DISPATCH_FR = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/amsbIsNULqByNgxQ.pdf";
const PDF_JOB_COSTING_FR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/PuWvxj32H2GpWkZrPHc6xa/job-costing-formula-fr_8b956dda.pdf";
const PDF_CHANGE_ORDER_FR = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/EknLhJcpMsSaPfqc.pdf";
const PDF_SCOPE_LETTER_FR = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/RlnyNuQvHyqAqkrA.pdf";
const PDF_MARKUP_RECOVERY_FR = "/resources/primegrowth-ai-calculateur-recuperation-marge-fr.pdf";

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
    // Le stockage local n'est qu'un accès pratique; le formulaire principal fonctionne sans lui.
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
  { value: "1 journée gaspillée", label: "= 800 $ à 1 500 $ en main-d'œuvre perdue", sub: "chaque fois qu'une équipe arrive sur un chantier qui n'est pas prêt" },
  { value: "1 sous-traitant sur 3", label: "fixe ses prix au feeling", sub: "parce qu'il ne voit pas ses vraies marges en temps réel" },
  { value: "10+ heures/semaine", label: "perdues en admin manuel", sub: "à compiler des feuilles de temps, courir après les reçus et ressaisir des données" },
];

const MESSAGE_MATCH_POINTS_FR = [
  {
    label: "Appels manqués",
    text: "Un nouveau lead arrive pendant que tu es sur chantier. Personne ne répond assez vite, et le contrat va à l'entrepreneur qui a répondu en premier.",
  },
  {
    label: "Extras non payés",
    text: "Le client dit oui par texto. L'équipe fait le travail. L'approbation ne devient jamais un extra clair avant la facture.",
  },
  {
    label: "Admin du vendredi",
    text: "Heures, reçus, questions d'équipe et suivis de chantier s'empilent jusqu'à ce que ta soirée devienne le bureau.",
  },
  {
    label: "Marges floues",
    text: "Tu gagnes le contrat, tu finis les travaux, puis tu ne vois toujours pas ce que la main-d'œuvre, les matériaux et les extras t'ont vraiment laissé.",
  },
];

const PROBLEMS = [
  {
    title: "La journée d'équipe gaspillée",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.95 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    desc: "Le GC dit que le chantier est prêt. Ton équipe se déplace. Il ne l'est pas. Tu perds une journée complète de main-d'œuvre — 800 $ à 1 500 $ — et il n'y a aucun système pour éviter que ça se reproduise la semaine prochaine.",
  },
  {
    title: "L'angle mort des marges",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    desc: "Tu termines un contrat et tu penses avoir fait de l'argent. Mais entre les matériaux, la main-d'œuvre et les extras que tu as oublié de facturer, tu ne sais pas ce que tu as vraiment gardé. Les décisions se prennent à l'instinct.",
  },
  {
    title: "Le grind du vendredi soir",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    desc: "Tes gars te textent leurs heures. Tu les compiles manuellement. Tu les envoies à ton comptable. Chaque vendredi soir. Un système qui fait ça automatiquement n'est pas un luxe — c'est une exigence opérationnelle de base.",
  },
];

const STEPS = [
  { step: "01", title: "Revue des opérations", desc: "On apprend comment tu gères tes chantiers — comment tu soumissionnes, planifies ton équipe, suis les matériaux et factures. On identifie exactement où le temps et l'argent se perdent." },
  { step: "02", title: "Construction et configuration", desc: "On construit ton espace de gestion de projets, on configure les feuilles de temps vérifiées par GPS, on met en place les canaux de communication d'équipe et on connecte tout via des automatisations. Clé en main." },
  { step: "03", title: "Mise en ligne et transfert", desc: "On te guide à travers le système, on forme ton équipe sur son utilisation et on te remet les clés. Tu es en ligne en 14 jours. On reste disponible pour le support continu." },
];

// ── FOND ANIMÉ ─────────────────────────────────────────────────────────────────
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

/// ── TROUSSE GATE (FR) ──────────────────────────────────────────────────────────
type GateState = "idle" | "submitting" | "success" | "error";

const TOOLKIT_ASSETS_FR = [
  { icon: "📋", title: "Le Manuel de l'Opérateur Sous-Traitant", desc: "5 Systèmes qui Récupèrent 40 000 $/An en Main-d'Œuvre Perdue", detail: "PDF 7 pages", value: "97 $" },
  { icon: "✅", title: "L'Audit du Vendredi Soir", desc: "12 Questions qui Révèlent Où Ton Entreprise Perd de l'Argent Cette Semaine", detail: "Liste de vérification 1 page", value: "47 $" },
  { icon: "📱", title: "Le Dispatch du Matin en 5 Minutes", desc: "Le Format de Message Exact qui Élimine la Confusion d'Équipe Avant 7h", detail: "Modèle copier-coller", value: "27 $" },
  { icon: "📊", title: "La Formule de Coût de Chantier", desc: "Connaître Ta Vraie Marge Avant de Facturer — avec un exemple concret à 35 000 $", detail: "Fiche de référence", value: "47 $" },
  { icon: "🛡️", title: "La Trousse de Protection des Extras", desc: "Langage exact, approbation écrite et exemples pour arrêter les extras non payés avant qu'ils commencent", detail: "PDF 8 pages", value: "147 $" },
  { icon: "📝", title: "La Lettre de Portée pour Sous-Traitant", desc: "Un modèle de portée qui évite les disputes de soumission avant le départ du chantier", detail: "PDF 2 pages", value: "97 $" },
  { icon: "📈", title: "Le Calculateur de Récupération de Marge", desc: "Trouve le multiplicateur exact qui protège ta marge avant la prochaine soumission", detail: "Feuille de calcul 2 pages", value: "97 $" },
  { icon: "✍️", title: "Le Générateur de Message d'Extra", desc: "Crée le message client, la version texto, la formule d'approbation et la note interne avant que l'extra devienne gratuit", detail: "Outil interactif", value: "297 $" },
  { icon: "📐", title: "Le Calculateur de Coût de Chantier", desc: "Calcule la soumission minimale rentable avant de fixer ton prochain prix", detail: "Outil interactif", value: "197 $" },
  { icon: "🧮", title: "L’Audit des Fuites d’Automatisation", desc: "Cartographie où l’entrée de leads, les relances de soumissions, le hors heures et les transferts manuels font fuir l’argent", detail: "Outil interactif", value: "397 $" },
];

function ToolkitGateFR() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gateState, setGateState] = useState<GateState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !phone.trim()) return;
    setGateState("submitting");
    setErrorMsg("");
    try {
      await sendGhlWebhookGet(GHL_WEBHOOKS.websiteToolkitForm, {
        firstName: firstName.trim(),
        lastName: "",
        email: email.trim(),
        phone: phone.trim(),
        source: "toolkit-download-fr",
        tags: ["toolkit_download", "ig-funnel", "construction-resource", "fr"],
        language: "fr",
        ...getAttributionPayload(),
      });

      trackMetaLead({
        content_name: "Construction Systems Toolkit",
        content_category: "resource_download",
        source: "toolkit-download-fr",
        language: "fr",
      });
      trackMetaCustomEvent("ConstructionToolkitDownload", {
        source: "toolkit-download-fr",
        language: "fr",
      });

      rememberToolkitUnlock({
        firstName: firstName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        language: "fr",
      });
      const pdfs = [
        { url: PDF_5SYSTEMS_FR, name: "PrimeGrowth-AI-5-Systemes-Entrepreneurs.pdf" },
        { url: PDF_FRIDAY_AUDIT_FR, name: "PrimeGrowth-AI-Audit-Vendredi-Soir.pdf" },
        { url: PDF_DISPATCH_FR, name: "PrimeGrowth-AI-Dispatch-Matin.pdf" },
        { url: PDF_JOB_COSTING_FR, name: "PrimeGrowth-AI-Formule-Cout-Chantier.pdf" },
        { url: PDF_CHANGE_ORDER_FR, name: "PrimeGrowth-AI-Trousse-Protection-Extras.pdf" },
        { url: PDF_SCOPE_LETTER_FR, name: "PrimeGrowth-AI-Lettre-Portee-Sous-Traitant.pdf" },
        { url: PDF_MARKUP_RECOVERY_FR, name: "PrimeGrowth-AI-Calculateur-Recuperation-Marge.pdf" },
      ];
      pdfs.forEach(({ url, name }, i) => {
        setTimeout(() => {
          const link = document.createElement("a");
          link.href = url; link.download = name; link.target = "_blank";
          document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }, i * 600);
      });
      // Rediriger vers la page de remerciement après le début des téléchargements
      setTimeout(() => {
        const params = new URLSearchParams({ email: email.trim(), name: firstName.trim() });
        window.location.href = `/fr/ressources/systemes-construction/merci?${params.toString()}`;
      }, 2400);
      setGateState("success");
    } catch {
      setGateState("error");
      setErrorMsg("Une erreur s'est produite. Veuillez réessayer.");
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
              Téléchargement instantané
            </span>
            <h3 className="mt-3 text-2xl font-black leading-[1.02] tracking-tight text-slate-50">
              Obtiens la trousse complète de 1 594 $+.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Sept PDF, trois outils interactifs et le formulaire du Bilan opérationnel en 3 questions — tout débloqué avec un seul formulaire.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-teal-300/35 bg-teal-400/10 px-4 py-3 text-center shadow-lg shadow-teal-950/30 sm:w-auto sm:shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200/80">Valeur</p>
            <p className="text-3xl font-black tracking-tight text-white">1 594 $+</p>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">Inclus aujourd'hui</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2.5 text-center">
            <p className="text-xl font-black text-teal-300">7</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">PDF</p>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2.5 text-center">
            <p className="text-xl font-black text-teal-300">4m</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Outils</p>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2.5 text-center">
            <p className="text-xl font-black text-teal-300">24h</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Bilan</p>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-teal-400/30 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-teal-950/50 p-4 sm:p-5 shadow-xl shadow-teal-950/20">
          <AnimatePresence mode="wait">
            {gateState === "success" ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                  <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-slate-100 font-bold text-lg mb-1">Ta trousse est en téléchargement.</p>
                  <p className="text-slate-400 text-sm mb-4">6 PDF se téléchargent maintenant. Vérifie ton dossier de téléchargements.</p>
                  <p className="text-slate-400 text-sm">Surveille aussi tes courriels — ton Bilan opérationnel personnalisé arrivera dans les 24 h.</p>
                </div>
                <a href="/fr/outils/calculateur-croissance-ia" className="w-full text-center px-4 py-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold hover:bg-teal-500/20 transition-all">Lancer l’Audit des Fuites →</a>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-black leading-tight text-white">Recevoir la trousse maintenant.</p>
                    <p className="mt-1 text-xs text-slate-400">Aucun compte. Aucun paiement. Les téléchargements commencent tout de suite.</p>
                  </div>
                  <div className="w-fit rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-extrabold text-teal-300">
                    60 secondes
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-300">Ce qui arrive ensuite</p>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs leading-relaxed text-slate-400 sm:grid-cols-2">
                    <p><span className="font-bold text-slate-200">1.</span> Tes PDF se téléchargent immédiatement.</p>
                    <p><span className="font-bold text-slate-200">2.</span> Le calculateur et l'audit se débloquent sur la page suivante.</p>
                    <p><span className="font-bold text-slate-200">3.</span> Utilise les outils pour trouver la plus grosse fuite.</p>
                    <p><span className="font-bold text-slate-200">4.</span> Si la fuite vaut la peine d'être corrigée, réserve l'appel diagnostic gratuit.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Prénom</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" required className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 placeholder-slate-600 text-base sm:text-sm focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Adresse courriel</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean@tonentreprise.com" required className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 placeholder-slate-600 text-base sm:text-sm focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Téléphone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (514) 555-0100" required className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 placeholder-slate-600 text-base sm:text-sm focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition-all" />
                    <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">Requis pour que la trousse, l'accès SMS et le suivi du Bilan te rejoignent pendant que tu es sur chantier — pas enterrés dans ta boîte courriel. Aucun spam.</p>
                  </div>
                </div>

                {gateState === "error" && <p className="text-red-400 text-xs">{errorMsg}</p>}
                <button type="submit" disabled={gateState === "submitting" || !firstName.trim() || !email.trim() || !phone.trim()} className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-white font-black text-sm transition-all hover:shadow-lg hover:shadow-teal-500/25 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                  {gateState === "submitting" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    <>Débloquer la trousse de 1 497 $+ <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></>
                  )}
                </button>
                <div className="flex flex-col gap-2 text-center">
                  <p className="text-[11px] text-slate-600">Aucun spam. Désabonnement en tout temps.</p>
                  <a
                    href={CALENDAR_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackMetaCustomEvent("DiscoveryCallBookingClick", { source: "construction-resource-form-escape-hatch", language: "fr" })}
                    className="text-[11px] font-semibold text-teal-400 transition-colors hover:text-teal-300"
                  >
                    Tu sais déjà que tes suivis, soumissions ou marges sont brisés? Réserve l'appel diagnostic gratuit →
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


function ToolkitValueStackFR() {
  return (
    <div className="h-full rounded-[1.75rem] border border-slate-700/55 bg-slate-950/65 p-4 sm:p-5 shadow-xl shadow-slate-950/20">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-teal-300">Dans la pile de 1 497 $+</p>
          <p className="mt-2 text-lg font-black leading-tight text-slate-50">Tout est inclus avant de réserver un appel ou d'acheter quoi que ce soit.</p>
        </div>
        <div className="w-fit rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-black text-teal-300">
          9 actifs débloqués
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TOOLKIT_ASSETS_FR.map((asset, i) => (
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

const DIAGNOSTIC_TOOLS_FR = [
  {
    label: "01 · Fuite de marge",
    title: "Calculateur de Coût de Chantier",
    desc: "Calcule la soumission minimale rentable, les frais fixes, les jours de rentabilité, le coût quotidien de main-d'œuvre et le risque de marge avant de fixer ton prix.",
    metric: "Soumissionne avant de deviner",
    cta: "Débloquer avec la trousse",
  },
  {
    label: "02 · Fuite d’automatisation",
    title: "Audit des Fuites d’Automatisation",
    desc: "Cartographie comment l’entrée de leads, les réponses lentes, les relances de soumissions et la couverture hors heures créent des fuites avant même la livraison des chantiers.",
    metric: "Trouve la fuite prioritaire",
    cta: "Débloquer avec la trousse",
  },
  {
    label: "03 · Contrôle des extras",
    title: "Générateur de Message d'Extra",
    desc: "Transforme les changements de portée en message client, texto, formule d'approbation et note interne avant que les extras deviennent du travail gratuit.",
    metric: "Protège la marge avant de commencer",
    cta: "Débloquer avec la trousse",
  },
];

function DiagnosticToolsSectionFR() {
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
              Outils gratuits qui exposent la fuite
            </span>
            <h2 className="text-3xl md:text-4xl font-black leading-tight text-slate-50">
              Pas juste des modèles. Des outils concrets pour trouver où tu perds de l'argent.
            </h2>
            <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-400">
              Les PDF montrent quoi corriger. Les outils appliquent ça à tes chiffres, tes fuites et tes risques d'extras. Un seul formulaire débloque tout le hub de ressources — pas trois formulaires séparés.
            </p>
          </div>
          <a
            href="#toolkit"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-teal-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20"
          >
            Débloquer toutes les ressources
          </a>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {DIAGNOSTIC_TOOLS_FR.map((tool, i) => (
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
      </div>
    </section>
  );
}

function ToolkitFounderVideoFR() {
  return (
    <div className="mx-auto mt-8 max-w-3xl rounded-[1.75rem] border border-slate-700/55 bg-slate-950/60 p-5 sm:p-6 text-center shadow-xl shadow-slate-950/20">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-teal-300">Vidéo fondateur</p>
      <h3 className="mt-2 text-xl sm:text-2xl font-black leading-tight text-slate-50">
        Pourquoi j'ai bâti cette trousse pour les entrepreneurs québécois.
      </h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
        David Knot explique pourquoi cette ressource part des vraies fuites terrain : appels manqués, admin du vendredi soir, confusion d'équipe, extras non payés et marges floues.
      </p>
      <div className="mx-auto mt-5 max-w-[320px] overflow-hidden rounded-[1.35rem] border border-teal-400/25 bg-slate-950 shadow-2xl shadow-slate-950/40">
        <video
          className="aspect-[9/16] w-full bg-slate-950 object-cover"
          controls
          playsInline
          preload="metadata"
          poster={FOUNDER_VIDEO_FR_POSTER}
          aria-label="David Knot explique la trousse PrimeGrowth AI pour les systèmes de construction"
        >
          <source src={FOUNDER_VIDEO_FR_URL} type="video/mp4" />
          Ton navigateur ne supporte pas la balise vidéo.
        </video>
      </div>
    </div>
  );
}

export default function ConstructionResourceFR() {
  useSEO({
    title: "Pourquoi les sous-traitants spécialisés perdent des heures et des marges | PrimeGrowth AI",
    description: "Obtiens la trousse gratuite PrimeGrowth pour sous-traitants québécois : 6 PDF et trois outils interactifs pour trouver la première fuite.",
    canonical: "https://www.primegrowthai.com/fr/ressources/systemes-construction",
    lang: "fr",
    alternateHref: "https://www.primegrowthai.com/resources/construction-systems",
    alternateLang: "en",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Pourquoi les sous-traitants spécialisés perdent des heures et des marges",
      "description": "Trousse gratuite pour sous-traitants québécois : 6 PDF et trois outils interactifs pour trouver la première fuite.",
      "author": { "@type": "Organization", "name": "PrimeGrowth AI" },
      "publisher": { "@type": "Organization", "name": "PrimeGrowth AI", "url": "https://www.primegrowthai.com" },
      "url": "https://www.primegrowthai.com/fr/ressources/systemes-construction",
      "inLanguage": "fr"
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
              href="/resources/construction-systems"
              className="px-2.5 py-1.5 rounded-full border border-slate-700/60 text-slate-400 text-[11px] font-semibold hover:border-teal-500/40 hover:text-teal-400 transition-all sm:px-3 sm:text-xs"
            >
              <span className="sm:hidden">EN</span><span className="hidden sm:inline">🇬🇧 English version</span>
            </a>
            <a
              href="#trousse"
              className="px-3 py-2 rounded-full bg-teal-500 text-white text-xs font-semibold transition-all hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20 sm:px-4 sm:text-sm"
            >
              <span className="sm:hidden">Obtenir</span><span className="hidden sm:inline">Obtenir la trousse gratuite</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO + OPT-IN TROUSSE ── */}
      <section id="trousse" className="relative py-8 sm:py-10 md:py-14 overflow-hidden">
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
              Trousse gratuite · Entrepreneurs québécois qui travaillent 60+ heures
            </span>
            <h1 className="mx-auto max-w-4xl text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-[1.02] md:leading-[0.98] tracking-tight mb-5 sm:mb-6 text-slate-50">
              Récupère les fuites d'admin qui grugent{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-400">
                40 000 $/an
              </span>
              {" "}sur les contrats déjà gagnés.
            </h1>
            <p className="mx-auto max-w-3xl text-base sm:text-lg md:text-xl text-slate-400 leading-relaxed">
              Si chaque appel manqué, soumission, question d'équipe et suivi client passe encore par toi après les heures de chantier, le problème n'est pas ta motivation. C'est ta façon de gérer l'opération.
            </p>
            <div className="mx-auto mt-5 grid max-w-5xl grid-cols-2 gap-2 text-left sm:mt-6 sm:gap-3 lg:grid-cols-4">
              {MESSAGE_MATCH_POINTS_FR.map((point) => (
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
              <ToolkitValueStackFR />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <ToolkitGateFR />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <ToolkitFounderVideoFR />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <DiagnosticToolsSectionFR />


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

      {/* ── LES TROIS PROBLÈMES ── */}
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
              Le problème
              <span className="w-4 h-px bg-teal-400/60" />
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">Où ton entreprise perd du temps et de l'argent</h2>
            <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
              Trois problèmes opérationnels que chaque sous-traitant spécialisé rencontre — qu'il ait des logiciels ou non. L'écart entre eux, c'est là que le profit disparaît.
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

      {/* ── POSITIONNEMENT DE LA TROUSSE ── */}
      <section className="py-16 bg-slate-800/10 border-y border-slate-800/60">
        <div className="container max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-widest uppercase mb-4">
            <span className="w-4 h-px bg-teal-400/60" />
            Pourquoi cette trousse existe
            <span className="w-4 h-px bg-teal-400/60" />
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">
            Tu n'as pas besoin de plus de motivation. Tu dois trouver la première fuite.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed mb-8">
            La trousse te donne les checklists, modèles, calculateur et le formulaire du Bilan pour voir où les leads, la main-d'œuvre, l'admin et les marges glissent avant de réserver un appel ou d'acheter quoi que ce soit.
          </p>
          <a href="#trousse" className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-teal-500 text-white font-bold text-sm transition-all hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20">
            Obtenir la trousse gratuite
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </section>

      {/* ── LA SOLUTION ── */}
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
              La solution
              <span className="w-4 h-px bg-teal-400/60" />
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50">Comment les meilleurs opérateurs règlent ça</h2>
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
              Commence par la trousse
              <span className="w-4 h-px bg-teal-400/60" />
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">
              Tu veux que l'entreprise arrête de dépendre de toi?
            </h2>
            <p className="text-slate-400 mb-10 leading-relaxed">
              Commence par prendre la trousse. Elle te donne les checklists de terrain et le formulaire du Bilan pour trouver la première fuite avant de réserver un appel ou d'acheter quoi que ce soit.
            </p>
            <a
              href="#trousse"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold text-base transition-all hover:shadow-xl hover:shadow-teal-500/25 hover:scale-[1.02] group"
            >
              Obtenir la trousse gratuite
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <p className="text-xs text-slate-600 mt-4">6 PDF, trois outils et chemin vers le Bilan. Aucun spam. Aucun engagement.</p>
          </motion.div>
        </div>
      </section>

      {/* ── PIED DE PAGE ── */}
      <footer className="border-t border-slate-800/60 py-12">
        <div className="container">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-5 md:h-7 w-auto object-contain cursor-pointer" />
                </Link>
                <span className="text-xs text-slate-600 font-medium">Le système opérationnel pour sous-traitants</span>
              </div>
              <a href="mailto:david@primegrowthai.com" className="text-sm text-slate-500 hover:text-teal-400 transition-colors">
                david@primegrowthai.com
              </a>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
              <p className="text-xs text-slate-600 max-w-md text-center md:text-left leading-relaxed">
                Le système opérationnel clé en main pour sous-traitants spécialisés.
                Planification de chantier, suivi des marges, dispatch d'équipe et facturation automatisée.
                Construit pour toi. En ligne en 14 jours.
              </p>
              <span className="text-xs text-slate-700">
                © {new Date().getFullYear()} PrimeGrowth AI. Tous droits réservés.
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
