/*
 * PrimeGrowth AI — The Sub-Trade OS
 * REDESIGN v3.0 — April 2026
 * Design System: Deep Navy + Teal + Professional Blue (UI UX Pro Max / 21st.dev)
 * Typography: Plus Jakarta Sans (headings/body) — modern B2B SaaS authority
 * IVP: Specialty sub-trade contractors who are still running their business from memory
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

// ── DESIGN TOKENS ────────────────────────────────────────────────────────────
// Primary: #0F172A (Deep Slate/Navy)
// Secondary: #1E293B (Lighter Slate)
// Accent: #0D9488 (Teal)
// CTA: #0EA5E9 (Sky Blue)
// Text: #F8FAFC / #94A3B8

// ── ANIMATED BACKGROUND PATHS (21st.dev inspired) ────────────────────────────
function AnimatedGridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle grid */}
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
      {/* Radial glow top-left */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-3xl" />
      {/* Radial glow bottom-right */}
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-3xl" />
      {/* Animated floating orbs */}
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
  title,
  desc,
  icon,
  accent = false,
  className = "",
  delay = 0,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent?: boolean;
  className?: string;
  delay?: number;
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
      {/* Hover glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl
        ${accent ? "bg-gradient-to-br from-teal-500/5 to-transparent" : "bg-gradient-to-br from-slate-700/20 to-transparent"}`}
      />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 relative z-10
        ${accent ? "bg-teal-500/20 text-teal-400" : "bg-slate-700/60 text-slate-300"}`}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-2 relative z-10">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed relative z-10">{desc}</p>
    </motion.div>
  );
}

// ── PHASE CARD ────────────────────────────────────────────────────────────────
function PhaseCard({
  number,
  title,
  desc,
  deliverable,
  delay = 0,
}: {
  number: string;
  title: string;
  desc: string;
  deliverable: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-7 hover:border-teal-500/30 hover:bg-slate-800/60 transition-all duration-300 overflow-hidden"
    >
      {/* Number watermark */}
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
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Deliverable</p>
          <p className="text-sm text-teal-400/80 font-medium">{deliverable}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── TESTIMONIAL CARD ──────────────────────────────────────────────────────────
function TestimonialCard({
  quote,
  name,
  title,
  company,
  industry,
  logo,
  delay = 0,
}: {
  quote: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  logo: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col bg-slate-800/40 border border-slate-700/40 rounded-2xl p-7 hover:border-teal-500/20 hover:bg-slate-800/60 transition-all duration-300 backdrop-blur-sm"
    >
      {/* Stars */}
      <div className="flex gap-1 mb-5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm text-slate-300 leading-relaxed flex-1 mb-6">
        "{quote}"
      </p>

      {/* Attribution */}
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
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useSEO({
    title: "PrimeGrowth AI — The Sub-Trade OS for Specialty Contractors",
    description: "Done-for-you operations system for specialty sub-trade contractors in Quebec. Project scheduling, margin tracking, crew dispatch, and automated invoicing. Live in 14 days. Free operations review.",
    canonical: "https://www.primegrowthai.com",
    lang: "en",
    alternateHref: "https://www.primegrowthai.com/fr",
    alternateLang: "fr",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "PrimeGrowth AI",
        "description": "Done-for-you operations system for specialty sub-trade contractors. Project scheduling, margin tracking, crew dispatch, and automated invoicing. Live in 14 days.",
        "url": "https://www.primegrowthai.com",
        "telephone": "+15144518001",
        "email": "david@primegrowthai.com",
        "address": { "@type": "PostalAddress", "addressLocality": "Montreal", "addressRegion": "QC", "addressCountry": "CA" },
        "geo": { "@type": "GeoCoordinates", "latitude": 45.5017, "longitude": -73.5673 },
        "areaServed": [{ "@type": "State", "name": "Quebec" }, { "@type": "Country", "name": "Canada" }],
        "serviceType": ["Operations System Implementation", "Workflow Automation", "Project Management Setup", "Business Systems Consulting", "Contractor CRM Setup", "Construction Automation"],
        "priceRange": "$$",
        "sameAs": ["https://www.linkedin.com/company/primegrowth-ai", "https://www.instagram.com/primegrowth.ai"]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "My crew won't use a new app.", "acceptedAnswer": { "@type": "Answer", "text": "They don't have to. Your crew uses the tools they already use to communicate. We connect those tools to your project management and accounting so they get their dispatch info and submit receipts without ever opening a new platform." } },
          { "@type": "Question", "name": "I already have accounting software. Do I need to change it?", "acceptedAnswer": { "@type": "Answer", "text": "No. Your accounting software stays. We build around it. We connect your project management and crew timesheets to your accounting so your job costs update automatically and you can see your real margin on every project without touching a spreadsheet." } },
          { "@type": "Question", "name": "I don't have time to set this up.", "acceptedAnswer": { "@type": "Answer", "text": "You don't set it up. We do. That's the entire point. You give us one onboarding call, we build the system, and you go live in 14 days. You don't need to learn anything new." } },
          { "@type": "Question", "name": "I don't have any formal systems yet.", "acceptedAnswer": { "@type": "Answer", "text": "That's actually the right time to start. We build the complete Sub-Trade OS from scratch — project scheduling, crew dispatch, margin tracking, and automated invoicing — configured around how your trade actually works. In 14 days you have a system that runs without depending on your memory." } },
          { "@type": "Question", "name": "How long does the process take?", "acceptedAnswer": { "@type": "Answer", "text": "14 days from your onboarding call to go-live. We do the build. You review and approve. Your crew starts using it the same week." } },
          { "@type": "Question", "name": "What does it cost?", "acceptedAnswer": { "@type": "Answer", "text": "It depends on your current setup and what needs to be built. We start with a free Operations Review to understand your operation. You'll get a clear, transparent proposal before any commitment." } }
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

      {/* ── GOOGLE FONT IMPORT ── */}
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
              { href: "#how-it-works", label: "How It Works" },
              { href: "#who-we-serve", label: "Who We Serve" },
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
              href="/resources/construction-systems"
              className="hidden md:block text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors duration-200"
            >
              Free Resources
            </Link>
            <Link
              href="/tools/ai-growth-score"
              className="hidden md:block text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors duration-200"
            >
              Free Assessment
            </Link>

            <Link
              href="/fr"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors border border-slate-700/60 hover:border-slate-600 rounded-lg px-3 py-1.5"
            >
              <span className="text-teal-400">EN</span>
              <span className="text-slate-600">|</span>
              <span>FR</span>
            </Link>

            <a
              href={CALENDAR_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-95"
            >
              Book a Call
            </a>

            <button
              className="md:hidden text-slate-400 hover:text-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-[#0F172A]/98 backdrop-blur-xl border-t border-slate-800/80"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
              {[
                { href: "#how-it-works", label: "How It Works" },
                { href: "#who-we-serve", label: "Who We Serve" },
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
              <Link href="/tools/ai-growth-score" className="text-sm font-medium text-teal-400 hover:text-teal-300 py-2 transition-colors">
                Free Audit (60 sec)
              </Link>
              <Link href="/resources/construction-systems" className="text-sm font-medium text-slate-400 hover:text-slate-100 py-2 transition-colors">
                Free Resources
              </Link>
              <Link href="/apply" className="text-sm font-medium text-slate-400 hover:text-slate-100 py-2 transition-colors">
                Apply to Work With Us
              </Link>
              <Link href="/fr" className="text-sm text-slate-500 hover:text-slate-300 py-2 transition-colors">
                Voir en français (FR)
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        <AnimatedGridBackground />

        {/* Parallax content */}
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
                  The Sub-Trade OS
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-5 text-slate-50"
              >
                Stop Running Your{" "}
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                    Business From Memory
                  </span>
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg sm:text-xl font-semibold text-teal-400 mb-4 max-w-2xl"
              >
                The Done-For-You Operations System for Sub-Trade Contractors.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-lg text-slate-400 max-w-xl mb-10 leading-relaxed"
              >
                Know your margin on every job. Dispatch your crew without a single phone call.
                Stop showing up to sites that aren't ready. We build the system — you just run your trade.
                Done-for-you. Live in 14 days.
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
                  Book Your Free Operations Review
                </a>
                <Link
                  href="/tools/ai-growth-score"
                  className="group flex items-center gap-2 px-6 py-4 border border-teal-500/30 hover:border-teal-400/60 text-teal-400 hover:text-teal-300 font-semibold text-sm rounded-xl transition-all duration-200 hover:bg-teal-500/5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Run the Automation Leak Audit
                </Link>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors group"
                >
                  <span>See How It Works</span>
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
                  Trusted by <span className="text-slate-300 font-semibold">sub-trade contractors</span> across Canada
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
            <StatBlock value={1} suffix=" crew day" label="Lost Per Wasted Site Visit" sub="$800–$1,500 in labour gone when the GC isn't ready" delay={0} />
            <StatBlock value={10} suffix="+ hrs/week" label="Lost to Admin" sub="Quotes, timesheets, invoices — done manually every week" delay={0.15} />
            <StatBlock value={30} suffix="%" label="Don't Know Their Margins" sub="1 in 3 sub-trade owners prices jobs on gut feel" delay={0.3} />
          </div>
        </div>
      </Section>

      {/* ── THE PROBLEM (BENTO GRID) ── */}
      <Section className="py-24" id="the-problem">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <SectionLabel>The Root Cause</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-slate-50 leading-tight">
              Three Different Problems.{" "}
              <span className="text-slate-500">The Same Result.</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Whether you're running on memory and WhatsApp, drowning in software your crew ignores,
              or stuck with tools that work fine on their own but never talk to each other —
              the result is the same. You're the bottleneck. Decisions get made on gut feel.
              You don't know your real margins. And you're doing paperwork at 9 PM.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card — No Systems */}
            <BentoCard
              className="md:col-span-2 md:row-span-1"
              title="No Systems At All"
              desc="Running on WhatsApp, memory, and a notebook. You are the system. If you get sick, the business stops. You're doing quotes at 9 PM, chasing timesheets on Friday, and you have no idea what your real margin was on that last job."
              accent
              delay={0}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.915-3.173a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 0 1 6.364 6.364l-1.757 1.757" />
                </svg>
              }
            />

            {/* Small card — Tools That Work in Isolation */}
            <BentoCard
              title="Tools That Work in Isolation"
              desc="You have an accounting tool, maybe a project management app. Each one works fine on its own. But nothing talks to anything else. You still move data manually between them and still can't see your real margins."
              delay={0.1}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              }
            />

            {/* Small card — Owner Dependency */}
            <BentoCard
              title="Owner Dependency"
              desc="The business only runs because you're holding it together. That's not a business — it's a job with employees."
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
                alt="Disconnected systems visualization"
                className="w-full h-full object-cover min-h-[200px] group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/20 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-xs font-semibold text-teal-400 tracking-widest uppercase mb-1">The Result</p>
                <p className="text-sm font-semibold text-slate-200">Stalled growth. Missed leads. Owner burnout.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── HOW IT WORKS — THREE PHASES ── */}
      <Section className="py-24 bg-slate-900/40" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>Our Approach</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-slate-50">
              How We Build Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                Sub-Trade OS in 14 Days
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              We meet you where you are. Whether you're starting from zero or connecting tools you already have,
              the result is the same: a system that runs without you being the bottleneck.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            <PhaseCard
              number="01"
              title="Operations Review"
              desc="We learn how you run jobs — how you quote, schedule crew, track materials, and invoice. We identify exactly where time and money are being lost."
              deliverable="Custom Build Plan Document"
              delay={0}
            />
            <PhaseCard
              number="02"
              title="Build & Configure"
              desc="We build your project management workspace, configure GPS-verified timesheets, set up your crew communication channels, and connect everything with automations. Done-for-you."
              deliverable="Fully Configured Sub-Trade OS"
              delay={0.1}
            />
            <PhaseCard
              number="03"
              title="Go Live & Hand Off"
              desc="We walk you through the system, train your crew on how to use it, and hand you the keys. You're live in 14 days. We stay on for support."
              deliverable="Live System + Ongoing Support"
              delay={0.2}
            />
          </div>
        </div>
      </Section>

      {/* ── WHO WE SERVE ── */}
      <Section className="py-24" id="who-we-serve">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>Who We Serve</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-slate-50">
              Built for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                Specialty Contractors
              </span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Tile, epoxy, flooring, plumbing, electrical — if you run a specialty trade and you're still the bottleneck in your own business,
              this system was built for you. We meet you where you are.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Avatar 1 — No Systems */}
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
                  alt="Sub-trade contractor on site"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/30 to-[#0F172A]" />
              </div>
              <div className="relative p-8 -mt-6">
                <span className="inline-block px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-semibold rounded-full mb-4 border border-teal-500/20">
                  Starting From Scratch
                </span>
                <h3 className="text-2xl font-bold mb-3 text-slate-50">Running on Memory & WhatsApp</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  No formal systems. You are the bottleneck. We build the complete Sub-Trade OS from the ground up —
                  project scheduling, margin tracking, crew dispatch, and automated invoicing. Done-for-you in 14 days.
                </p>
                <ul className="space-y-2">
                  {[
                    "Project scheduling and crew dispatch",
                    "GPS-verified timesheets synced to payroll",
                    "Automated site readiness checklist",
                    "Real-time margin dashboard",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <span className="text-teal-400 text-xs mt-1 flex-shrink-0">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Avatar 2 — Broken Systems */}
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
                  alt="Sub-trade contractor with tools and systems"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/30 to-[#0F172A]" />
              </div>
              <div className="relative p-8 -mt-6">
                <span className="inline-block px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-semibold rounded-full mb-4 border border-teal-500/20">
                  Already Have Some Tools
                </span>
                <h3 className="text-2xl font-bold mb-3 text-slate-50">Tools That Only Talk to Each Other</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  You have an accounting tool. Maybe a project management app. Each one works fine on its own.
                  But you're still manually moving data between them and still can't see your real margins.
                  We don't replace what's working — we connect it and fill the gaps.
                </p>
                <ul className="space-y-2">
                  {[
                    "Keep what works, connect what should be connected",
                    "Your crew communicates, your numbers update automatically",
                    "GPS-verified timesheets synced to your accountant",
                    "Live margin dashboard per project",
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

          {/* ── LEAD MACHINE ── */}
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
                      Add-On Offer
                    </span>
                    <h3 className="text-2xl font-bold mb-3 text-slate-50">The Lead Machine</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-5">
                      Losing jobs because you didn't reply fast enough? The Lead Machine is a standalone automated pipeline that manages the leads you already get. It captures inquiries instantly, qualifies them automatically, and runs follow-up sequences so no prospect falls through the cracks while you're on the job site.
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Instant, automated response to new inquiries",
                        "AI qualification to filter out tire-kickers",
                        "Follow-up sequences that run without you",
                        "Can be added to any tier or run standalone",
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
                      <span className="text-slate-300 text-sm font-semibold">Standalone</span>
                      <span className="text-slate-500 text-xs mt-1">or add to any plan</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ── THE ENGAGEMENT PROCESS ── */}
      <Section className="py-24 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>The Engagement</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-slate-50">
              From Discovery to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                Live in 14 Days
              </span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {[
              {
                step: "01",
                title: "Discovery Call",
                desc: "We learn about your operation, pain points, and business goals. No pitch — just a conversation to see if there's a fit.",
              },
              {
                step: "02",
                title: "Operations Review",
                desc: "We map your current workflow — how you quote, schedule crew, track materials, and invoice. We identify exactly where time and money are being lost and what the system needs to solve.",
              },
              {
                step: "03",
                title: "Your Custom Build Plan",
                desc: "We present a clear plan: what to build, what to connect, what to automate — and what your operation will look like when it's done.",
              },
              {
                step: "04",
                title: "Build & Deploy",
                desc: "We implement the plan — configuring platforms, building custom automations, and connecting your systems into one unified workflow.",
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
                {/* Timeline */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-teal-400 border-2 border-teal-400/30 mt-1.5 relative z-10 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                  {i < 3 && <div className="w-px flex-1 bg-gradient-to-b from-teal-400/40 to-teal-400/10 min-h-[40px]" />}
                </div>

                <div className="pb-10">
                  <span className="text-xs font-mono font-semibold text-teal-400/70 tracking-widest uppercase">
                    Step {step.step}
                  </span>
                  <h3 className="text-xl font-semibold mt-1 mb-2 text-slate-100">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-lg">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <SectionLabel>Client Results</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-slate-50">
              What Our Clients Say{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                After Going Live
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Real results from business owners who were running their operations from memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            <TestimonialCard
              quote="Before PrimeGrowth, our pipeline was feast or famine — we'd finish a big project and have nothing lined up. Their team built us an automated system that consistently puts us in front of property managers and homeowners looking for high-end renovations. Within the first 90 days, we had more qualified conversations than in the previous six months."
              name="David"
              title="President"
              company="GCK Construction"
              industry="General Contractor — Montreal"
              logo={CLIENT_LOGOS[0].url}
              delay={0}
            />
            <TestimonialCard
              quote="We knew there were investors looking for multi-residential properties in Montreal, but reaching them at scale was the challenge. PrimeGrowth automated our entire acquisition process — from identifying potential buyers to nurturing them through our CRM. The system runs in the background while we focus on closing deals."
              name="Marc-André"
              title="President"
              company="Immeubles Gloria"
              industry="Real Estate — Montreal"
              logo={CLIENT_LOGOS[1].url}
              delay={0.1}
            />
            <TestimonialCard
              quote="As a family business, we'd always grown through relationships and repeat customers. But we needed a way to reach new dealerships and commercial clients across Canada. PrimeGrowth set up an automated system that introduced us to buyers we never would have found on our own — and keeps every conversation organized."
              name="Philippe"
              title=""
              company="Gama.ca"
              industry="B2B Distribution — Quebec"
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
              <SectionLabel>Common Questions</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-50">
                Before You Ask
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: "My crew won't use a new app.",
                  a: "They don't have to. Your crew uses the tools they already use to communicate. We connect those tools to your project management and accounting so they get their dispatch info and submit receipts without ever opening a new platform.",
                },
                {
                  q: "I already have accounting software. Do I need to change it?",
                  a: "No. Your accounting software stays. We build around it. We connect your project management and crew timesheets to your accounting so your job costs update automatically and you can see your real margin on every project without touching a spreadsheet.",
                },
                {
                  q: "I don't have time to set this up.",
                  a: "You don't set it up. We do. That's the entire point. You give us one onboarding call, we build the system, and you go live in 14 days. You don't need to learn anything new.",
                },
                {
                  q: "I don't have any formal systems yet.",
                  a: "That's actually the right time to start. We build the complete Sub-Trade OS from scratch — project scheduling, crew dispatch, margin tracking, and automated invoicing — configured around how your trade actually works. In 14 days you have a system that runs without depending on your memory.",
                },
                {
                  q: "How long does the process take?",
                  a: "14 days from your onboarding call to go-live. We do the build. You review and approve. Your crew starts using it the same week.",
                },
                {
                  q: "What does it cost?",
                  a: "It depends on your current setup and what needs to be built. We start with a free Operations Review to understand your operation. You'll get a clear, transparent proposal before any commitment.",
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
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/40 via-[#0F172A] to-sky-950/30" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(13,148,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/8 blur-3xl rounded-full" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <SectionLabel>Get Started</SectionLabel>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 text-slate-50 leading-tight">
              Stop Running Your Business{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                From Memory
              </span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Book a free Operations Review and find out exactly where you're losing time and money —
              and what your operation looks like once the system is live.
            </p>

            <a
              href={CALENDAR_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-10 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-lg rounded-xl transition-all duration-200 hover:shadow-[0_0_50px_rgba(20,184,166,0.4)] active:scale-95"
            >
              Book Your Free Operations Review
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>

            <p className="text-xs text-slate-600 mt-5">
              30-minute call. No commitment. Immediate value.
            </p>
            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 pt-8 border-t border-slate-800/60">
              <p className="text-xs text-slate-600 uppercase tracking-widest">Or start here:</p>
              <Link
                href="/tools/ai-growth-score"
                className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors underline underline-offset-4 decoration-teal-500/30 hover:decoration-teal-400/60"
              >
                Run the Automation Leak Audit (free, 60 sec)
              </Link>
              <span className="hidden sm:block text-slate-700">·</span>
              <Link
                href="/resources/construction-systems"
                className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-4 decoration-slate-700 hover:decoration-slate-500"
              >
                Free Resources
              </Link>
              <span className="hidden sm:block text-slate-700">·</span>
              <Link
                href="/apply"
                className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-4 decoration-slate-700 hover:decoration-slate-500"
              >
                Apply to Work With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800/60 py-12 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-8">
            {/* Top row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-6 md:h-8 w-auto object-contain" />
                <span className="text-xs text-slate-600 font-medium">The Sub-Trade OS</span>
              </div>
              <div className="flex items-center gap-6 flex-wrap justify-center md:justify-end">
                <Link href="/tools/ai-growth-score" className="text-sm text-slate-500 hover:text-teal-400 transition-colors">
                  Automation Leak Audit
                </Link>
                <Link href="/tools/job-costing-calculator" className="text-sm text-slate-500 hover:text-teal-400 transition-colors">
                  Job Costing Calculator
                </Link>
                <Link href="/resources/construction-systems" className="text-sm text-slate-500 hover:text-teal-400 transition-colors">
                  Free Resources
                </Link>
                <Link href="/apply" className="text-sm text-slate-500 hover:text-teal-400 transition-colors">
                  Apply
                </Link>
                <a
                  href="mailto:david@primegrowthai.com"
                  className="text-sm text-slate-500 hover:text-teal-400 transition-colors"
                >
                  david@primegrowthai.com
                </a>
              </div>
            </div>

            {/* Client logos */}
            <div className="flex items-center justify-center gap-8 py-4 opacity-30 hover:opacity-50 transition-opacity">
              {CLIENT_LOGOS.map((logo, i) => (
                <img key={i} src={logo.url} alt={logo.name} className="h-8 w-auto object-contain grayscale" />
              ))}
            </div>

            {/* Bottom row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
              <p className="text-xs text-slate-600 max-w-md text-center md:text-left leading-relaxed">
                The Done-For-You Operations System for Sub-Trade Contractors.
                Know your margin. Dispatch your crew. Stop showing up to sites that aren't ready.
                Live in 14 days.
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
