/*
 * PrimeGrowth AI — Real Estate Resource Page
 * REDESIGN v2.0 — April 2026
 * Design System: Deep Navy + Teal + Professional Blue (matching Home.tsx v2.0)
 * Typography: Plus Jakarta Sans
 * Route: /resources/real-estate-systems
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/OyhhiQPpFBkvMcYg.png";
const CALENDAR_LINK = "https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO";
const VIDEO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663102693803/9bUS5DtvvLeD2SDjEQc9Rq/The_Connected_Brokerage_clean_12b54e81.mp4";

const STATS = [
  { value: "21×", label: "lower conversion", sub: "leads not followed up within 5 minutes are 21× less likely to convert" },
  { value: "50 hrs", label: "lost per week", sub: "for a 10-agent brokerage where agents spend 5 hrs/week on manual admin" },
  { value: "1 in 3", label: "brokerages", sub: "have no formal lead follow-up system — just memory and manual effort" },
];

const PROBLEMS = [
  {
    title: "Lead Sources → CRM",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    desc: "Leads arrive from different places — or get written on a sticky note. Without a system, agents copy-paste manually and leads fall through the cracks.",
  },
  {
    title: "CRM → Transaction Management",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    desc: "When a lead converts, the data doesn't transfer. Agents re-enter names, addresses, and deal details. Every manual step is a chance for error — or a dropped ball.",
  },
  {
    title: "Transactions → Post-Close",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    desc: "Reviews, referral requests, anniversary messages — they rarely happen consistently because they require manual effort. Referral revenue never materializes.",
  },
];

const STEPS = [
  { step: "01", title: "Audit & Identify", desc: "Map every tool the brokerage is paying for. Find what's actually being used, what's redundant, and where data is falling through." },
  { step: "02", title: "Cut, Optimize & Implement", desc: "Eliminate tools that aren't delivering value. Configure what stays. Build a full system from scratch if needed." },
  { step: "03", title: "Integrate & Automate", desc: "Connect lead sources to CRM, CRM to transactions, and build the post-close sequence that handles reviews and referrals automatically." },
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

export default function RealEstateResource() {
  useSEO({
    title: "Why Real Estate Brokerages Lose Leads and Revenue to Broken Operations | PrimeGrowth AI",
    description: "Learn how real estate brokerages automate lead follow-up, eliminate manual admin, and build systems that convert more deals. Book a free operations review.",
    canonical: "https://www.primegrowthai.com/resources/real-estate-systems",
    lang: "en",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Why Real Estate Brokerages Lose Leads and Revenue to Broken Operations",
      "description": "Learn how real estate brokerages automate lead follow-up, eliminate manual admin, and build systems that convert more deals.",
      "author": { "@type": "Organization", "name": "PrimeGrowth AI" },
      "publisher": { "@type": "Organization", "name": "PrimeGrowth AI", "url": "https://www.primegrowthai.com" },
      "url": "https://www.primegrowthai.com/resources/real-estate-systems",
      "inLanguage": "en"
    }
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#0F172A]/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-6 w-auto object-contain cursor-pointer" />
          </Link>
          <a
            href={CALENDAR_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-teal-500 text-white text-sm font-semibold transition-all hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20"
          >
            Book a Free Operations Review
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <AnimatedGridBackground />
        <div className="container relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-widest uppercase mb-6 border border-teal-500/20 rounded-full px-4 py-1.5 bg-teal-500/5">
              Free Resource · Real Estate
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.05] tracking-tight mb-6 text-slate-50">
              Why Real Estate Brokerages Are Losing Deals to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                Broken Operations
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              Whether your brokerage is paying for tools nobody uses, or tracking everything manually — leads are slipping through. Here's where it happens, and how the best operators fix it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── VIDEO ── */}
      <section className="py-8 md:py-12">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-800/40 shadow-2xl shadow-black/40"
          >
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <video
                src={VIDEO_URL}
                className="absolute inset-0 w-full h-full"
                controls
                playsInline
                preload="metadata"
                poster="/thumbnails/thumb-realestate.jpg"
                title="The Hidden Cost of Disconnected Systems in Real Estate Brokerages"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 border-y border-slate-800/60">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
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

      {/* ── THE THREE GAPS ── */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
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
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">Where Your Brokerage Is Leaking Time and Revenue</h2>
            <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
              In most brokerages with 2–50 agents, these three areas exist in isolation — whether you have software for each one or not. The gap between them is where deals die.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROBLEMS.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
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

      {/* ── THE SOLUTION ── */}
      <section className="py-20 bg-slate-800/20 border-y border-slate-800/60">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
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
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50">How the Best Brokerages Fix It</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-widest uppercase mb-6">
              <span className="w-4 h-px bg-teal-400/60" />
              Free Operations Review
              <span className="w-4 h-px bg-teal-400/60" />
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-4">
              Want to See What This Looks Like for Your Brokerage?
            </h2>
            <p className="text-slate-400 mb-10 leading-relaxed">
              30-minute call. Whether you have a tech stack to audit or need to build from scratch — we'll map your operation, identify the biggest gaps, and tell you exactly what we'd fix first. No commitment.
            </p>
            <a
              href={CALENDAR_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold text-base transition-all hover:shadow-xl hover:shadow-teal-500/25 hover:scale-[1.02] group"
            >
              Book Your Free Operations Review
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <p className="text-xs text-slate-600 mt-4">30-minute call. No commitment. Immediate value.</p>
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
                Done-For-You operations systems for specialty contractors and real estate brokerages.
                We build the system. You run the business.
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
