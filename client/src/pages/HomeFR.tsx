/*
 * PrimeGrowth AI — Page d'accueil (Français)
 * REDESIGN v3.0 — Avril 2026
 * Design System: Deep Navy + Teal + Professional Blue (UI UX Pro Max / 21st.dev)
 * Typography: Plus Jakarta Sans — B2B SaaS authority (UI UX Pro Max #1 recommendation)
 * IVP: Sous-traitants spécialisés qui gèrent encore leur entreprise de mémoire
 */

import { useEffect, useRef, useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { NumberTicker } from "@/components/magicui/number-ticker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// ── ASSETS ──────────────────────────────────────────────────────────────────
const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/OyhhiQPpFBkvMcYg.png";
const PROBLEM_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/fxIpdXirdOGVPDZU.jpg";
const NICHE_RE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/snNgSMJeonkCoJoT.jpg";
const NICHE_CONST = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/EDKPnpRmOALbTuga.jpg";
const CALENDAR_LINK = "https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO";

const CLIENT_LOGOS = [
  { name: "GCK Construction", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/eCNTNjcZDULPMgAL.png" },
  { name: "Immeubles Gloria", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/bQlLaceEHsxwTnwY.png" },
  { name: "Gama.ca", url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/klCxZMnGNHLfoEzU.png" },
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
      <motion.div
        animate={{ y: [0, 15, 0], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full bg-sky-400/8 blur-3xl"
      />
    </div>
  );
}

// ── SECTION WRAPPER ───────────────────────────────────────────────────────────
function Section({ children, className = "", id = "" }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
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

// ── STAT BLOCK ────────────────────────────────────────────────────────────────
function StatBlock({ value, suffix, label, sub, delay = 0 }: { value: number; suffix: string; label: string; sub: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center group"
    >
      <p className="text-4xl sm:text-5xl font-bold text-teal-400 mb-2 tabular-nums tracking-tight">
        <NumberTicker value={value} className="text-teal-400" />{suffix}
      </p>
      <p className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </motion.div>
  );
}

// ── BENTO CARD ────────────────────────────────────────────────────────────────
function BentoCard({
  title, desc, icon, accent = false, className = "", delay = 0,
}: {
  title: string; desc: string; icon: React.ReactNode; accent?: boolean; className?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-2xl border p-6 overflow-hidden transition-all duration-300 cursor-default
        ${accent
          ? "bg-teal-500/10 border-teal-500/30 hover:border-teal-400/50 hover:bg-teal-500/15"
          : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600/60 hover:bg-slate-800/60"
        } ${className}`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl
        ${accent ? "bg-gradient-to-br from-teal-500/5 to-transparent" : "bg-gradient-to-br from-slate-700/20 to-transparent"}`}
      />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 relative z-10
        ${accent ? "bg-teal-500/20 text-teal-400" : "bg-slate-700/60 text-slate-300"}`}>
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-2 relative z-10">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed relative z-10">{desc}</p>
    </motion.div>
  );
}

// ── PHASE CARD ────────────────────────────────────────────────────────────────
function PhaseCard({ number, title, desc, deliverable, delay = 0 }: {
  number: string; title: string; desc: string; deliverable: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-7 hover:border-teal-500/30 hover:bg-slate-800/60 transition-all duration-300 overflow-hidden"
    >
      <span className="absolute -top-4 -right-2 text-8xl font-black text-slate-700/20 select-none leading-none group-hover:text-teal-500/10 transition-colors duration-300">
        {number}
      </span>
      <div className="relative z-10">
        <span className="text-xs font-mono font-semibold text-teal-400/70 tracking-widest uppercase mb-3 block">
          Phase {number}
        </span>
        <h3 className="text-xl font-bold text-slate-100 mb-3">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-5">{desc}</p>
        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Livrable</p>
          <p className="text-sm text-teal-400/80 font-medium">{deliverable}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── TESTIMONIAL CARD ──────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, title, company, industry, logo, delay = 0 }: {
  quote: string; name: string; title: string; company: string; industry: string; logo: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col bg-slate-800/40 border border-slate-700/40 rounded-2xl p-7 hover:border-teal-500/20 hover:bg-slate-800/60 transition-all duration-300 backdrop-blur-sm"
    >
      <div className="flex gap-1 mb-5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed flex-1 mb-6">"{quote}"</p>
      <div className="flex items-center gap-4 pt-5 border-t border-slate-700/40">
        <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src={logo} alt={company} className="w-8 h-8 object-contain" />
        </div>
        <div>
          <p className="font-semibold text-slate-100 text-sm">
            {name}
            {title && <span className="text-slate-400 font-normal">, {title}</span>}
          </p>
          <p className="text-xs text-teal-400/80 mt-0.5">{company}</p>
          <p className="text-xs text-slate-500 mt-0.5">{industry}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function HomeFR() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useSEO({
    title: "PrimeGrowth AI — Le Sub-Trade OS pour sous-traitants spécialisés au Québec",
    description: "Système opérationnel clé en main pour les sous-traitants spécialisés au Québec. Planification des chantiers, suivi des marges, dispatch des équipes et facturation automatisée. En ligne en 14 jours. Bilan opérationnel gratuit.",
    canonical: "https://www.primegrowthai.com/fr",
    lang: "fr",
    alternateHref: "https://www.primegrowthai.com",
    alternateLang: "en",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "PrimeGrowth AI",
        "description": "Système opérationnel clé en main pour les sous-traitants spécialisés. Planification des chantiers, suivi des marges, dispatch des équipes et facturation automatisée. En ligne en 14 jours.",
        "url": "https://www.primegrowthai.com/fr",
        "telephone": "+15144518001",
        "email": "david@primegrowthai.com",
        "address": { "@type": "PostalAddress", "addressLocality": "Montréal", "addressRegion": "QC", "addressCountry": "CA" },
        "geo": { "@type": "GeoCoordinates", "latitude": 45.5017, "longitude": -73.5673 },
        "areaServed": [{ "@type": "State", "name": "Québec" }, { "@type": "Country", "name": "Canada" }],
        "serviceType": ["Implantation de système opérationnel", "Automatisation des flux de travail", "Configuration de gestion de projets", "Consultation en systèmes d'affaires", "CRM pour entrepreneurs", "Automatisation construction"],
        "priceRange": "$$",
        "sameAs": ["https://www.linkedin.com/company/primegrowth-ai", "https://www.instagram.com/primegrowth.ai"]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Mon équipe ne voudra pas utiliser une nouvelle app.", "acceptedAnswer": { "@type": "Answer", "text": "Ils n'ont pas à le faire. Votre équipe utilise les outils qu'elle utilise déjà. On connecte ces outils à votre gestion de projets et comptabilité pour qu'ils reçoivent leurs infos de dispatch et soumettent leurs reçus sans jamais ouvrir une nouvelle plateforme." } },
          { "@type": "Question", "name": "J'ai déjà un logiciel de comptabilité. Est-ce que je dois le changer?", "acceptedAnswer": { "@type": "Answer", "text": "Non. Votre logiciel de comptabilité reste. On construit autour. On connecte votre gestion de projets et feuilles de temps à votre comptabilité pour que vos coûts de chantier se mettent à jour automatiquement." } },
          { "@type": "Question", "name": "Je n'ai pas le temps de mettre ça en place.", "acceptedAnswer": { "@type": "Answer", "text": "Vous ne le mettez pas en place. C'est nous qui le faisons. C'est tout le point. Vous nous donnez un appel d'intégration, on construit le système, et vous êtes en ligne en 14 jours." } },
          { "@type": "Question", "name": "Combien de temps ça prend?", "acceptedAnswer": { "@type": "Answer", "text": "14 jours de votre appel d'intégration à la mise en ligne. On fait la construction. Vous révisez et approuvez. Votre équipe commence à l'utiliser la même semaine." } },
          { "@type": "Question", "name": "Combien ça coûte?", "acceptedAnswer": { "@type": "Answer", "text": "Ça dépend de votre configuration actuelle et de ce qui doit être construit. On commence par un Bilan Opérationnel gratuit pour comprendre votre opération. Vous recevrez une proposition claire et transparente avant tout engagement." } }
        ]
      }
    ]
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .font-mono { font-family: 'Space Mono', monospace; }
      `}</style>

      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
          <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-10 md:h-12 w-auto object-contain" />

          <div className="flex items-center gap-7">
            {[
              { href: "#comment-ca-marche", label: "Comment ça marche" },
              { href: "#qui-on-aide", label: "Qui on aide" },
              { href: "#faq", label: "FAQ" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hidden md:block text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}

            <Link
              href="/fr/ressources/systemes-construction"
              className="hidden md:block text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors duration-200"
            >
              Ressources gratuites
            </Link>
            <Link
              href="/"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors border border-slate-700/60 hover:border-slate-600 rounded-lg px-3 py-1.5"
            >
              <span>EN</span>
              <span className="text-slate-600">|</span>
              <span className="text-teal-400">FR</span>
            </Link>

            <a
              href={CALENDAR_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-95"
            >
              Réserver un appel
            </a>

            <button
              className="md:hidden text-slate-400 hover:text-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Basculer le menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-[#0F172A]/98 backdrop-blur-xl border-t border-slate-800/80"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
              {[
                { href: "#comment-ca-marche", label: "Comment ça marche" },
                { href: "#qui-on-aide", label: "Qui on aide" },
                { href: "#faq", label: "FAQ" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-400 hover:text-slate-100 py-2 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <Link href="/fr/ressources/systemes-construction" className="text-sm font-medium text-slate-400 hover:text-slate-100 py-2 transition-colors">
                Ressources gratuites
              </Link>
              <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 py-2 transition-colors">
                Voir en anglais (EN)
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── HERO ── */}
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
                  Le Sub-Trade OS
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-5 text-slate-50"
              >
                Votre entreprise est{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                  plus difficile à gérer
                </span>
                {" "}depuis la mémoire
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg sm:text-xl font-semibold text-teal-400 mb-4 max-w-2xl"
              >
                Le système opérationnel clé en main pour les sous-traitants spécialisés.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-lg text-slate-400 max-w-xl mb-10 leading-relaxed"
              >
                Connaissez votre marge sur chaque chantier. Envoyez vos équipes sans passer une seule heure au téléphone.
                Arrêtez de vous déplacer sur des chantiers qui ne sont pas prêts. On construit le système — vous gérez votre métier.
                Clé en main. En ligne en 14 jours.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <a
                  href={CALENDAR_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-base rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_0_40px_rgba(20,184,166,0.35)] active:scale-95"
                >
                  Réserver votre bilan opérationnel gratuit
                </a>
                <a
                  href="#comment-ca-marche"
                  className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors group"
                >
                  <span>Voir comment ça marche</span>
                  <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  </svg>
                </a>
              </motion.div>

              {/* Trust signal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="flex items-center gap-4 mt-10"
              >
                <div className="flex -space-x-2">
                  {CLIENT_LOGOS.map((logo, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#0F172A] overflow-hidden flex items-center justify-center">
                      <img src={logo.url} alt={logo.name} className="w-6 h-6 object-contain" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  La confiance de <span className="text-slate-300 font-semibold">sous-traitants spécialisés</span> partout au Canada
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-5 h-8 border border-slate-700 rounded-full flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-1 bg-teal-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <Section className="border-y border-slate-800/60 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/60">
            <StatBlock value={1} suffix=" journée" label="Perdue par visite inutile" sub="800–1 500 $ de main-d'œuvre gaspillée quand le GC n'est pas prêt" delay={0} />
            <StatBlock value={10} suffix="+ h/sem" label="Perdues en administration" sub="Soumissions, feuilles de temps, factures — tout fait manuellement" delay={0.15} />
            <StatBlock value={30} suffix="%" label="Ne connaissent pas leurs marges" sub="1 sous-traitant sur 3 fixe ses prix à l'instinct" delay={0.3} />
          </div>
        </div>
      </Section>

      {/* ── LE PROBLÈME (BENTO GRID) ── */}
      <Section className="py-24" id="le-probleme">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <SectionLabel>La cause profonde</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-slate-50 leading-tight">
              Trois problèmes différents.{" "}
              <span className="text-slate-500">Le même résultat.</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Que vous fonctionniez sur la mémoire et WhatsApp, que vous vous noyiez dans des logiciels que votre équipe ignore,
              ou que vous ayez des outils qui fonctionnent bien séparément mais ne se parlent jamais —
              le résultat est le même. Vous êtes le goulot d'étranglement. Les décisions se prennent à l'instinct.
              Vous ne connaissez pas vos vraies marges. Et vous faites de la paperasse à 21h.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BentoCard
              className="md:col-span-2"
              title="Aucun système du tout"
              desc="Vous fonctionnez sur WhatsApp, la mémoire et un carnet. Vous êtes le système. Si vous tombez malade, l'entreprise s'arrête. Vous faites des soumissions à 21h, vous courez après les feuilles de temps le vendredi, et vous ne savez pas quelle marge vous avez réellement faite sur le dernier chantier."
              accent
              delay={0}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.915-3.173a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 0 1 6.364 6.364l-1.757 1.757" />
                </svg>
              }
            />

            <BentoCard
              title="Des outils qui ne se parlent pas"
              desc="Vous avez un outil comptable, peut-être un outil de gestion de projets. Chacun fonctionne bien seul. Mais vous déplacez encore les données manuellement entre eux et vous ne voyez toujours pas vos vraies marges."
              delay={0.1}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              }
            />

            <BentoCard
              title="Dépendance au propriétaire"
              desc="L'entreprise fonctionne uniquement parce que vous la tenez à bout de bras. Ce n'est pas une entreprise — c'est un emploi avec des employés."
              delay={0.2}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              }
            />

            {/* Image card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-2 rounded-2xl overflow-hidden border border-slate-700/50 relative group"
            >
              <img
                src={PROBLEM_IMG}
                alt="Visualisation de systèmes déconnectés"
                className="w-full h-full object-cover min-h-[200px] group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/20 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-xs font-semibold text-teal-400 tracking-widest uppercase mb-1">Le résultat</p>
                <p className="text-sm font-semibold text-slate-200">Croissance bloquée. Leads perdus. Épuisement du propriétaire.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── COMMENT ÇA MARCHE — TROIS PHASES ── */}
      <Section className="py-24 bg-slate-900/40" id="comment-ca-marche">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>Notre approche</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-slate-50">
              Comment on construit votre{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                Sub-Trade OS en 14 jours
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              On part de là où vous en êtes. Que vous partiez de zéro ou que vous connectiez des outils existants,
              le résultat est le même : un système qui tourne sans que vous soyez le goulot d'étranglement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            <PhaseCard
              number="01"
              title="Bilan opérationnel"
              desc="On apprend comment vous gérez vos chantiers — comment vous soumissionnez, planifiez vos équipes, suivez les matériaux et facturez. On identifie exactement où le temps et l'argent se perdent."
              deliverable="Document de plan de construction personnalisé"
              delay={0}
            />
            <PhaseCard
              number="02"
              title="Construire & Configurer"
              desc="On construit votre espace de gestion de projets, on configure les feuilles de temps GPS vérifiées, on met en place les canaux de communication pour vos équipes, et on connecte tout via des automatisations. Clé en main."
              deliverable="Sub-Trade OS entièrement configuré"
              delay={0.1}
            />
            <PhaseCard
              number="03"
              title="Mise en ligne & Passation"
              desc="On vous présente le système, on forme vos équipes sur son utilisation, et on vous remet les clés. Vous êtes en ligne en 14 jours. On reste disponible pour le support."
              deliverable="Système en ligne + support continu"
              delay={0.2}
            />
          </div>
        </div>
      </Section>

      {/* ── QUI ON AIDE ── */}
      <Section className="py-24" id="qui-on-aide">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>Qui on aide</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-slate-50">
              Conçu pour{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                Entrepreneurs spécialisés
              </span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Carrelage, époxy, plancher, plomberie, électricité — si vous dirigez un métier spécialisé et que vous êtes encore le goulot d'étranglement de votre propre entreprise,
              ce système a été conçu pour vous. On part de là où vous en êtes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Avatar 1 — Aucun système */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-slate-700/50 hover:border-teal-500/30 transition-all duration-300 bg-slate-800/30"
            >
              <div className="h-52 overflow-hidden relative">
                <img
                  src={NICHE_CONST}
                  alt="Sous-traitant sur chantier"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/30 to-[#0F172A]" />
              </div>
              <div className="relative p-8 -mt-6">
                <span className="inline-block px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-semibold rounded-full mb-4 border border-teal-500/20">
                  Partir de zéro
                </span>
                <h3 className="text-2xl font-bold mb-3 text-slate-50">Vous fonctionnez sur la mémoire et WhatsApp</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  Aucun système formel. Vous êtes le goulot d'étranglement. On construit le Sub-Trade OS complet de zéro —
                  planification des chantiers, suivi des marges, envoi des équipes et facturation automatisée. Clé en main en 14 jours.
                </p>
                <ul className="space-y-2">
                  {[
                    "Planification des chantiers et dispatch des équipes",
                    "Feuilles de temps GPS vérifiées syncées à la paie",
                    "Liste de vérification de préparation du chantier automatisée",
                    "Tableau de bord de marge en temps réel",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <span className="text-teal-400 text-xs mt-1 flex-shrink-0">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Avatar 2 — Outils qui ne se parlent pas */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-slate-700/50 hover:border-teal-500/30 transition-all duration-300 bg-slate-800/30"
            >
              <div className="h-52 overflow-hidden relative">
                <img
                  src={NICHE_RE}
                  alt="Entrepreneur qui révise ses données de projet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/30 to-[#0F172A]" />
              </div>
              <div className="relative p-8 -mt-6">
                <span className="inline-block px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-semibold rounded-full mb-4 border border-teal-500/20">
                  Vous avez déjà des outils
                </span>
                <h3 className="text-2xl font-bold mb-3 text-slate-50">Des outils qui ne se parlent pas</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  Vous avez un outil comptable. Peut-être un outil de gestion de projets. Chacun fonctionne bien seul.
                  Mais vous déplacez encore les données manuellement et vous ne voyez toujours pas vos vraies marges.
                  On ne remplace pas ce qui fonctionne — on le connecte et on comble les lacunes.
                </p>
                <ul className="space-y-2">
                  {[
                    "Garder ce qui fonctionne, connecter ce qui devrait l'être",
                        "Vos équipes communiquent, vos chiffres se mettent à jour automatiquement",
                    "Feuilles de temps GPS vérifiées syncées à votre comptable",
                    "Tableau de bord de marge en direct par projet",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <span className="text-teal-400 text-xs mt-1 flex-shrink-0">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* ── LA MACHINE À LEADS ── */}
          <div className="max-w-5xl mx-auto mt-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-sky-500/30 hover:border-sky-400/50 transition-all duration-300 bg-gradient-to-r from-slate-800/50 to-sky-900/20"
            >
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-sky-500/10 text-sky-400 text-xs font-semibold rounded-full mb-4 border border-sky-500/20">
                      Offre complémentaire
                    </span>
                    <h3 className="text-2xl font-bold mb-3 text-slate-50">La Machine à Leads</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-5">
                      Vous perdez des contrats parce que vous n'avez pas répondu assez vite ? La Machine à Leads est un pipeline automatisé autonome qui gère les demandes que vous recevez déjà. Elle capture les requêtes instantanément, les qualifie automatiquement, et exécute des séquences de suivi pour qu'aucun prospect ne passe entre les mailles du filet pendant que vous êtes sur le chantier.
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Réponse instantanée et automatisée aux nouvelles demandes",
                        "Qualification par IA pour filtrer les curieux",
                        "Séquences de suivi qui tournent sans vous",
                        "Peut s'ajouter à n'importe quel forfait ou fonctionner seul",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                          <span className="text-sky-400 text-xs mt-1 flex-shrink-0">▸</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-shrink-0 text-center">
                    <div className="inline-flex flex-col items-center justify-center w-40 h-40 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                      <span className="text-sky-400 text-4xl mb-2">⚡</span>
                      <span className="text-slate-300 text-sm font-semibold">Autonome</span>
                      <span className="text-slate-500 text-xs mt-1">ou ajouté à tout forfait</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── LE PROCESSUS ── */}
      <Section className="py-24 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>Le processus</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-slate-50">
              De la découverte à{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                en ligne en 14 jours
              </span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {[
              {
                step: "01",
                title: "Appel de découverte",
                desc: "On apprend à connaître votre opération, vos points de douleur et vos objectifs d'affaires. Pas de pitch — juste une conversation pour voir s'il y a un fit.",
              },
              {
                step: "02",
                title: "Bilan opérationnel",
                desc: "On cartographie votre flux de travail actuel — comment vous soumissionnez, planifiez vos équipes, suivez les matériaux et facturez. On identifie exactement où le temps et l'argent se perdent et ce que le système doit résoudre.",
              },
              {
                step: "03",
                title: "Votre plan de construction personnalisé",
                desc: "On vous présente un plan clair : quoi construire, quoi connecter, quoi automatiser — et à quoi ressemblera votre opération une fois terminée.",
              },
              {
                step: "04",
                title: "Construction & déploiement",
                desc: "On met en œuvre le plan — configuration des plateformes, construction d'automatisations sur mesure, et connexion de vos systèmes en un flux de travail unifié.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-6 relative"
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-teal-400 border-2 border-teal-400/30 mt-1.5 relative z-10 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                  {i < 3 && <div className="w-px flex-1 bg-gradient-to-b from-teal-400/40 to-teal-400/10 min-h-[40px]" />}
                </div>
                <div className="pb-10">
                  <span className="text-xs font-mono font-semibold text-teal-400/70 tracking-widest uppercase">
                    Étape {step.step}
                  </span>
                  <h3 className="text-xl font-semibold mt-1 mb-2 text-slate-100">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-lg">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── TÉMOIGNAGES ── */}
      <Section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>Résultats clients</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-slate-50">
              Ce que disent nos clients{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                après la mise en ligne
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Des résultats concrets de propriétaires d'entreprise qui géraient encore leurs opérations de mémoire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            <TestimonialCard
              quote="Avant PrimeGrowth, notre pipeline était en dents de scie — on finissait un gros projet et on n'avait rien en vue. Leur équipe nous a construit un système automatisé qui nous met constamment devant des gestionnaires immobiliers et des propriétaires cherchant des rénovations haut de gamme. Dans les 90 premiers jours, on avait plus de conversations qualifiées que dans les six mois précédents."
              name="David"
              title="Président"
              company="GCK Construction"
              industry="Entrepreneur général — Montréal"
              logo={CLIENT_LOGOS[0].url}
              delay={0}
            />
            <TestimonialCard
              quote="On savait qu'il y avait des investisseurs qui cherchaient des immeubles multi-résidentiels à Montréal, mais les rejoindre à grande échelle était le défi. PrimeGrowth a automatisé tout notre processus d'acquisition — de l'identification des acheteurs potentiels à leur nurturing dans notre CRM. Le système tourne en arrière-plan pendant qu'on se concentre sur la conclusion des transactions."
              name="Marc-André"
              title="Président"
              company="Immeubles Gloria"
              industry="Immobilier commercial — Montréal"
              logo={CLIENT_LOGOS[1].url}
              delay={0.1}
            />
            <TestimonialCard
              quote="En tant qu'entreprise familiale, on avait toujours grandi par les relations et les clients récurrents. Mais on avait besoin d'un moyen d'atteindre de nouveaux concessionnaires et clients commerciaux partout au Canada. PrimeGrowth a mis en place un système automatisé qui nous a présentés à des acheteurs qu'on n'aurait jamais trouvés seuls — et qui garde chaque conversation organisée."
              name="Philippe"
              title=""
              company="Gama.ca"
              industry="Distribution B2B — Québec"
              logo={CLIENT_LOGOS[2].url}
              delay={0.2}
            />
          </div>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section className="py-24 bg-slate-900/40" id="faq">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <SectionLabel>Questions fréquentes</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-50">
                Avant que vous demandiez
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: "Mes gars ne vont pas utiliser une nouvelle application.",
                  a: "Ils n'ont pas à le faire. Vos équipes utilisent les outils qu'ils utilisent déjà pour communiquer. On connecte ces outils à votre gestion de projets et votre comptabilité pour qu'ils reçoivent leurs informations de dispatch et soumettent leurs reçus sans jamais ouvrir une nouvelle plateforme.",
                },
                {
                  q: "J'ai déjà un logiciel comptable. Est-ce que je dois le changer ?",
                  a: "Non. Votre logiciel comptable reste. On construit autour. On connecte votre gestion de projets et les feuilles de temps de vos équipes à votre comptabilité pour que vos coûts de chantier se mettent à jour automatiquement et que vous voyiez votre vraie marge sur chaque projet sans toucher à un tableur.",
                },
                {
                  q: "Je n'ai pas le temps de mettre ça en place.",
                  a: "Vous ne le mettez pas en place. On le fait. C'est tout le principe. Vous nous donnez un appel d'intégration, on construit le système, et vous êtes en ligne en 14 jours. Vous n'avez rien de nouveau à apprendre.",
                },
                {
                  q: "Je n'ai aucun système formel pour l'instant.",
                  a: "C'est exactement le bon moment pour commencer. On construit le Sub-Trade OS complet de zéro — planification des chantiers, dispatch des équipes, suivi des marges et facturation automatisée — configuré autour de la façon dont votre métier fonctionne réellement. En 14 jours, vous avez un système qui tourne sans dépendre de votre mémoire.",
                },
                {
                  q: "Combien de temps ça prend ?",
                  a: "14 jours de votre appel d'intégration à la mise en ligne. On fait la construction. Vous révisez et approuvez. Vos équipes commencent à l'utiliser la même semaine.",
                },
                {
                  q: "Combien ça coûte ?",
                  a: "Ça dépend de votre configuration actuelle et de ce qui doit être construit. On commence par un bilan opérationnel gratuit pour comprendre votre opération. Vous recevrez une proposition claire et transparente avant tout engagement.",
                },
              ].map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border border-slate-700/50 rounded-xl px-6 bg-slate-800/30 data-[state=open]:border-teal-500/30 data-[state=open]:bg-slate-800/50 transition-colors"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline text-slate-200 py-5 hover:text-slate-50">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-slate-400 leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/40 via-[#0F172A] to-sky-950/30" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(13,148,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/8 blur-3xl rounded-full" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <SectionLabel>Commencer</SectionLabel>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 text-slate-50 leading-tight">
              Arrêtez de gérer votre entreprise{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                depuis votre mémoire
              </span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Réservez un bilan opérationnel gratuit et découvrez exactement
              où vous perdez du temps et de l'argent — et à quoi ressemble votre opération
              une fois le système en place.
            </p>

            <a
              href={CALENDAR_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-10 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-lg rounded-xl transition-all duration-200 hover:shadow-[0_0_50px_rgba(20,184,166,0.4)] active:scale-95"
            >
              Réserver votre bilan opérationnel gratuit
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>

            <p className="text-xs text-slate-600 mt-5">
              Appel de 30 minutes. Aucun engagement. Valeur immédiate.
            </p>
          </div>
        </div>
      </section>

      {/* ── PIED DE PAGE ── */}
      <footer className="border-t border-slate-800/60 py-12 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-6 md:h-8 w-auto object-contain" />
                <span className="text-xs text-slate-600 font-medium">Le Sub-Trade OS</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="mailto:david@primegrowthai.com" className="text-sm text-slate-500 hover:text-teal-400 transition-colors">
                  david@primegrowthai.com
                </a>

              </div>
            </div>

            <div className="flex items-center justify-center gap-8 py-4 opacity-30 hover:opacity-50 transition-opacity">
              {CLIENT_LOGOS.map((logo, i) => (
                <img key={i} src={logo.url} alt={logo.name} className="h-8 w-auto object-contain grayscale" />
              ))}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
              <p className="text-xs text-slate-600 max-w-md text-center md:text-left leading-relaxed">
                Le système opérationnel clé en main pour les sous-traitants spécialisés.
                Planification des chantiers, suivi des marges, dispatch des équipes et facturation automatisée.
                Construit pour vous. En ligne en 14 jours.
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
