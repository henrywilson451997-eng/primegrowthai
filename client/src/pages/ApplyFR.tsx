import { useState } from "react";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { GHL_WEBHOOKS, sendGhlWebhookGet } from "@/lib/ghlWebhook";
import { trackMetaCustomEvent, trackMetaLead } from "@/lib/metaPixel";

const PAIN_POINTS = [
  "Feuilles de temps / Suivi des heures",
  "Calcul des coûts de chantier",
  "Suivi des prospects / Opportunités manquées",
  "Planification / Coordination d'équipe",
  "Facturation / Délais de paiement",
  "Marges inconnues / Pas de visibilité en temps réel",
  "Coordination des sous-traitants",
  "Délai entre soumission et facture finale",
];

const SOFTWARE_OPTIONS = [
  "CRM (ex. HubSpot, Salesforce, GHL)",
  "Gestion de projet (ex. Buildertrend, CoConstruct, Monday)",
  "Comptabilité (ex. QuickBooks, Sage, Acomba)",
  "Autre",
  "Aucun",
];

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  trade: string;
  crewSize: string;
  annualRevenue: string;
  painPoints: string[];
  softwareUsed: string[];
  softwareOther: string;
  sixMonthGoal: string;
  leadSource: string;
};

const initial: FormState = {
  firstName: "", lastName: "", email: "", phone: "",
  trade: "", crewSize: "", annualRevenue: "",
  painPoints: [], softwareUsed: [], softwareOther: "",
  sixMonthGoal: "", leadSource: "",
};

export default function ApplyFR() {
  useSEO({
    title: "Demander un bilan opérationnel gratuit | PrimeGrowth AI",
    description: "Demandez un bilan opérationnel gratuit pour votre entreprise de construction. Dites-nous où l'administration, les coûts de chantier, la planification ou les suivis bloquent l'entreprise.",
    canonical: "https://www.primegrowthai.com/fr/postuler",
    lang: "fr",
    alternateHref: "https://www.primegrowthai.com/apply",
    alternateLang: "en",
  });

  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const toggle = (field: "painPoints" | "softwareUsed", value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await sendGhlWebhookGet(GHL_WEBHOOKS.applyForm, {
        ...form,
        painPoints: form.painPoints.join(", "),
        softwareUsed: form.softwareUsed.join(", "),
        lang: "fr",
        source: "operations-review-application-fr",
      });
      trackMetaLead({
        content_name: "PrimeGrowth Operations Review Application",
        content_category: "application",
        source: "apply-fr",
        language: "fr",
      });
      trackMetaCustomEvent("OperationsReviewApplication", {
        source: "apply-fr",
        language: "fr",
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Une erreur s'est produite. Veuillez réessayer ou nous écrire directement.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Demande reçue</h1>
          <p className="text-gray-400 mb-6">
            Nous avons bien reçu vos informations. David va analyser votre situation et vous contacter dans les 24 heures s'il y a une bonne correspondance.
          </p>
          <p className="text-gray-300 mb-8">
            Vous voulez choisir un moment tout de suite? Réservez votre appel découverte ici :
          </p>
          <a href="https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO" target="_blank" rel="noopener noreferrer" onClick={() => trackMetaCustomEvent("DiscoveryCallBookingClick", { source: "apply-success-fr", language: "fr" })} className="inline-block bg-teal-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-teal-400 transition-colors mb-4">
            Réserver mon appel découverte
          </a>
          <br />
          <Link href="/fr" className="inline-block text-gray-500 hover:text-teal-400 text-sm mt-4 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <Link href="/fr" className="text-teal-400 hover:text-teal-300 text-sm font-medium">
          ← Retour à PrimeGrowth AI
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-block bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Demande de bilan opérationnel
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Demandez votre bilan<br />opérationnel gratuit
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Dites-nous où l'administration, les coûts de chantier, la planification ou les suivis ralentissent l'entreprise. David analyse chaque demande personnellement et vous répond dans les 24 heures si un bilan opérationnel est la bonne prochaine étape.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Coordonnées</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
                <input required value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Jean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
                <input required value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Tremblay" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Courriel *</label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="jean@monentreprise.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone *</label>
                <input required type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="+1 (514) 000-0000" />
              </div>
            </div>
          </section>

          {/* Business */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Votre entreprise</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Métier / Spécialité *</label>
                <select required value={form.trade} onChange={e => setForm(p => ({...p, trade: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none">
                  <option value="" disabled className="bg-[#0F172A]">Choisissez votre métier...</option>
                  {["Carrelage / Tiling","Coffrage / Formwork","Électricité / Electrical","Plomberie / Plumbing","Peinture / Painting","Entrepreneur général / General Contractor","Toiture / Roofing","Excavation / Aménagement paysager","Autre"].map(o => (
                    <option key={o} value={o} className="bg-[#0F172A]">{o}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Taille de l'équipe *</label>
                  <select required value={form.crewSize} onChange={e => setForm(p => ({...p, crewSize: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none">
                    <option value="" disabled className="bg-[#0F172A]">Choisissez...</option>
                    {["Solo (juste moi)","2–5 employés","6–15 employés","15+ employés"].map(o => (
                      <option key={o} value={o} className="bg-[#0F172A]">{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Chiffre d'affaires annuel *</label>
                  <select required value={form.annualRevenue} onChange={e => setForm(p => ({...p, annualRevenue: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none">
                    <option value="" disabled className="bg-[#0F172A]">Choisissez...</option>
                    {["Moins de 200 000 $","200 000 $ – 500 000 $","500 000 $ – 1 M$","1 M$ – 3 M$","3 M$+"].map(o => (
                      <option key={o} value={o} className="bg-[#0F172A]">{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Pain Points */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Principaux problèmes administratifs *</h2>
            <p className="text-gray-500 text-sm mb-4">Cochez tout ce qui s'applique</p>
            <div className="grid grid-cols-1 gap-2">
              {PAIN_POINTS.map(p => (
                <label key={p} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.painPoints.includes(p) ? "border-teal-500 bg-teal-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${form.painPoints.includes(p) ? "bg-teal-500 border-teal-500" : "border-white/30"}`}>
                    {form.painPoints.includes(p) && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-300" onClick={() => toggle("painPoints", p)}>{p}</span>
                  <input type="checkbox" className="hidden" checked={form.painPoints.includes(p)} onChange={() => toggle("painPoints", p)} />
                </label>
              ))}
            </div>
          </section>

          {/* Software */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Logiciels actuellement utilisés</h2>
            <p className="text-gray-500 text-sm mb-4">Cochez tout ce qui s'applique</p>
            <div className="grid grid-cols-1 gap-2">
              {SOFTWARE_OPTIONS.map(s => (
                <label key={s} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.softwareUsed.includes(s) ? "border-teal-500 bg-teal-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${form.softwareUsed.includes(s) ? "bg-teal-500 border-teal-500" : "border-white/30"}`}>
                    {form.softwareUsed.includes(s) && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-300" onClick={() => toggle("softwareUsed", s)}>{s}</span>
                  <input type="checkbox" className="hidden" checked={form.softwareUsed.includes(s)} onChange={() => toggle("softwareUsed", s)} />
                </label>
              ))}
            </div>
            {form.softwareUsed.includes("Autre") && (
              <div className="mt-3">
                <input value={form.softwareOther} onChange={e => setForm(p => ({...p, softwareOther: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="ex. Excel, WhatsApp, papier..." />
              </div>
            )}
          </section>

          {/* Goal */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Votre objectif</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quel est votre objectif principal pour les 6 prochains mois? *</label>
                <textarea required value={form.sixMonthGoal} onChange={e => setForm(p => ({...p, sixMonthGoal: e.target.value}))}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                  placeholder="ex. Arrêter de perdre de l'argent sur des chantiers que je ne peux pas suivre. Récupérer mes fins de semaine. Connaître mes marges avant de soumissionner..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Comment avez-vous entendu parler de PrimeGrowth AI ?</label>
                <select value={form.leadSource} onChange={e => setForm(p => ({...p, leadSource: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none">
                  <option value="" disabled className="bg-[#0F172A]">Choisissez...</option>
                  {["Instagram","Calculateur de coûts de chantier","Référence","Google","LinkedIn","Autre"].map(o => (
                    <option key={o} value={o} className="bg-[#0F172A]">{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Submit */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={status === "submitting"}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg text-lg transition-colors">
              {status === "submitting" ? "Envoi en cours..." : "Demander mon bilan opérationnel →"}
            </button>
            <p className="text-center text-gray-600 text-sm mt-3">
              Chaque demande est examinée manuellement. S'il y a une bonne correspondance, David vous répond dans les 24 heures.
            </p>
          </div>

          {/* Lang toggle */}
          <div className="text-center pt-4 border-t border-white/10">
            <Link href="/apply" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              View this page in English →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
