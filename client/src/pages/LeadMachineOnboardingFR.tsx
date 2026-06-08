import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileCheck2,
  FileText,
  Lock,
  MapPinned,
  Paperclip,
  PlayCircle,
  Send,
  ShieldCheck,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const LOGO_URL =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663102693803/OyhhiQPpFBkvMcYg.png";

const CHECKLIST_ROUTE = "/fr/clients/lead-machine/checklist";
const WELCOME_VIDEO_POSTER = "/thumbnails/founder/founder-video-fr-poster.jpg";

const roadmapSteps = [
  {
    number: "01",
    title: "Départ et accès",
    desc: "Vous complétez la checklist de départ, transmettez les accès nécessaires et confirmez les contacts responsables. Sans ces éléments, le build ne part pas proprement.",
    deliverable: "Accès, sources de leads, calendrier, zones et contacts verrouillés.",
  },
  {
    number: "02",
    title: "Architecture Lead Machine",
    desc: "On mappe le chemin complet du nouveau lead : capture, qualification, tri, réservation, notifications et structure CRM commerciale.",
    deliverable: "Architecture commerciale PrimeGrowth confirmée avant configuration.",
  },
  {
    number: "03",
    title: "Estimate Builder",
    desc: "On structure la création de soumissions selon vos services, règles, options, taxes, conditions et méthode actuelle. Si vous avez déjà un outil, on construit autour de lui.",
    deliverable: "Chemin de soumission connecté au CRM commercial, sans changement de prix ni rabais lié à l’outil existant.",
  },
  {
    number: "04",
    title: "Suivi standardisé et visibilité gagné/perdu",
    desc: "On configure la logique de suivi PrimeGrowth pour que les opportunités ne meurent pas dans les textos, les courriels ou la mémoire du propriétaire.",
    deliverable: "Statuts CRM, suivi standardisé et visibilité commerciale jusqu’à gagné/perdu.",
  },
  {
    number: "05",
    title: "Tests, correction et mise en ligne",
    desc: "On teste les scénarios critiques, vous validez le comportement réel, puis on met le système en ligne quand les entrées client sont complètes.",
    deliverable: "Lead Machine prête à recevoir, qualifier, réserver, soumettre et relancer.",
  },
];

const includedItems = [
  "Capture des leads depuis les sources approuvées",
  "Qualification IA et logique de tri",
  "Routage calendrier et prise de rendez-vous",
  "CRM commercial inclus pour le flux lead-to-estimate",
  "Relance standardisée des leads non prêts",
  "Suivi des soumissions jusqu’à gagné/perdu",
];

const excludedItems = [
  "Gestion de publicités payantes",
  "Refonte complète de site web",
  "QuickBooks, comptabilité complète ou facturation",
  "Planification chantier, dispatch d’équipe ou gestion terrain",
  "Job costing réel, paie, achats ou opérations complètes",
  "Automatisations spéciales hors flux lead-to-estimate",
];

const clientInputs = [
  "Accès aux sources de leads approuvées",
  "Calendrier, disponibilités et règles de réservation",
  "Zones de service, métiers, types de projets et exclusions",
  "Critères de qualification et de rejet",
  "Services, prix, options, taxes et conditions de soumission",
  "CRM existant, modèle de soumission ou outil de soumission existant, s’il y en a un",
];

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 tracking-widest uppercase mb-4">
      <span className="w-4 h-px bg-teal-400/60" />
      {children}
      <span className="w-4 h-px bg-teal-400/60" />
    </span>
  );
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400 tracking-widest uppercase">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
      </span>
      {children}
    </span>
  );
}

function RoadmapCard({ number, title, desc, deliverable, delay = 0 }: { number: string; title: string; desc: string; deliverable: string; delay?: number }) {
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
          Étape {number}
        </span>
        <h3 className="text-xl font-bold text-slate-100 mb-3">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-5">{desc}</p>
        <div className="pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sortie attendue</p>
          <p className="text-sm text-teal-400/80 font-medium">{deliverable}</p>
        </div>
      </div>
    </motion.div>
  );
}

function InfoCard({ icon, title, children, accent = false }: { icon: React.ReactNode; title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`relative rounded-2xl border p-6 overflow-hidden ${accent ? "bg-teal-500/10 border-teal-500/30" : "bg-slate-800/40 border-slate-700/50"}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
      <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent ? "bg-teal-500/20 text-teal-300" : "bg-slate-700/60 text-slate-300"}`}>
        {icon}
      </div>
      <h3 className="relative z-10 text-lg font-bold text-slate-100 mb-3">{title}</h3>
      <div className="relative z-10 text-sm text-slate-400 leading-relaxed">{children}</div>
    </div>
  );
}

function CheckList({ items, positive = true }: { items: string[]; positive?: boolean }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="flex items-start gap-3">
          {positive ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-400" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
          )}
          <p className="text-sm leading-relaxed text-slate-300">{item}</p>
        </div>
      ))}
    </div>
  );
}

function ClientNav({ compact = false }: { compact?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
        <Link href="/fr" className="flex items-center gap-3">
          <img src={LOGO_URL} alt="PrimeGrowth AI" className="h-10 md:h-12 w-auto object-contain" />
        </Link>
        <div className="hidden md:flex items-center gap-7">
          {!compact && (
            <>
              <a href="#roadmap" className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors">Roadmap</a>
              <a href="#attentes" className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors">Attentes</a>
              <a href="#scope" className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors">Scope</a>
            </>
          )}
          <Link href={CHECKLIST_ROUTE} className="relative px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-95">
            Checklist de départ
          </Link>
        </div>
        <Link href={CHECKLIST_ROUTE} className="md:hidden px-4 py-2 bg-teal-500 text-slate-900 font-bold text-xs rounded-xl">
          Checklist
        </Link>
      </div>
    </nav>
  );
}

export default function LeadMachineOnboardingFR() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], ["0%", "12%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.78]);

  useSEO({
    title: "Centre de départ client — Lead Machine | PrimeGrowth AI",
    description: "Page de départ post-vente pour les clients Lead Machine de PrimeGrowth AI : vidéo, roadmap, attentes, checklist et scope.",
    canonical: "https://www.primegrowthai.com/fr/clients/lead-machine/bienvenue",
    lang: "fr",
    noindex: true,
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .font-mono { font-family: 'Space Mono', monospace; }
      `}</style>

      <ClientNav />

      <section className="relative min-h-screen flex items-center overflow-hidden">
        <AnimatedGridBackground />
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
              <div className="max-w-3xl">
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-8">
                  <StatusPill>Projet officiellement lancé</StatusPill>
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6 text-slate-50">
                  Centre de départ client — {" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">Lead Machine</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="text-lg sm:text-xl font-semibold text-teal-400 mb-4 max-w-2xl">
                  Bienvenue dans le départ officiel de votre Lead Machine.
                </motion.p>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="text-base sm:text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
                  À partir d’ici, on transforme votre flux de leads en un système clair : capture, qualification, rendez-vous, soumissions et suivi commercial. La checklist sert à nous donner les bons matériaux pour construire vite et proprement.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link href={CHECKLIST_ROUTE} className="group relative px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-base rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_0_40px_rgba(20,184,166,0.35)] active:scale-95 inline-flex items-center gap-2">
                    Compléter la checklist aujourd’hui
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a href="#video" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors group">
                    <PlayCircle className="h-4 w-4 text-teal-400" />
                    Voir la vidéo de départ
                  </a>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.75, ease: [0.22, 1, 0.36, 1] }} className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-teal-500/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-[1.75rem] border border-teal-400/35 bg-slate-950/90 shadow-2xl shadow-teal-950/25">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.2),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_38%)]" />
                  <div className="relative p-5 sm:p-6">
                    <div className="mb-4 inline-flex items-center rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-teal-300">
                      À faire en premier
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-slate-50 mb-3">
                      Plus les bons matériaux arrivent vite, plus votre système devient concret rapidement.
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                      Les accès, prix, services et règles de qualification nous permettent de bâtir une Lead Machine utilisable, pas seulement une belle structure vide. Quand c’est clair, on peut avancer avec vitesse et confiance.
                    </p>
                    <CheckList items={clientInputs} />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <Section id="video" className="border-y border-slate-800/60 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
            <div>
              <SectionLabel>Vidéo de bienvenue</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-50 mb-5">Regardez David avant de lancer la checklist.</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                La vidéo vous donne la vue d’ensemble : ce qu’on construit, comment le projet démarre, ce que PrimeGrowth prend en charge et ce dont nous avons besoin pour transformer rapidement vos leads en opportunités suivies.
              </p>
              <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-5">
                <div className="flex gap-3">
                  <Clock3 className="h-5 w-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-100/90 leading-relaxed">
                    Regardez la vidéo, puis complétez la checklist pendant que tout est frais. C’est le moyen le plus rapide de donner à l’équipe les matériaux nécessaires pour démarrer fort.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-700/60 bg-slate-950 shadow-2xl shadow-black/30 aspect-video">
              <img src={WELCOME_VIDEO_POSTER} alt="Vidéo de bienvenue de David" className="absolute inset-0 h-full w-full object-cover opacity-35" />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/70 to-teal-950/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-teal-300/40 bg-teal-400/15 text-teal-300 shadow-[0_0_40px_rgba(20,184,166,0.22)]">
                  <PlayCircle className="h-10 w-10" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300 mb-3">Emplacement vidéo</p>
                <h3 className="text-2xl font-black text-slate-50 mb-2">Vidéo de départ de David</h3>
                <p className="max-w-md text-sm text-slate-400">Remplacer ce bloc par l’intégration vidéo finale lorsque l’enregistrement est prêt.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="roadmap" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <SectionLabel>Roadmap visuelle</SectionLabel>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-50 mb-5">Voici comment votre Lead Machine prend forme.</h2>
            <p className="text-slate-400 leading-relaxed">
              Chaque étape rapproche votre entreprise d’un flux commercial plus visible, plus standardisé et plus facile à suivre. Les délais réels dépendent des accès reçus, des prix fournis, des règles validées et de votre vitesse de réponse.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roadmapSteps.map((step, index) => (
              <RoadmapCard key={step.number} {...step} delay={index * 0.06} />
            ))}
          </div>
        </div>
      </Section>

      <Section id="attentes" className="py-24 bg-slate-900/35 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <SectionLabel>Attentes mutuelles</SectionLabel>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-50 mb-5">On garde ça clair des deux côtés.</h2>
            <p className="text-slate-400 leading-relaxed">
              PrimeGrowth construit. Vous fournissez les décisions, accès et validations. Si une dépendance reste bloquée, le projet attend. C’est direct, mais c’est comme ça qu’on évite le chaos.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Ce que vous pouvez attendre de PrimeGrowth" accent>
              <CheckList items={[
                "Un cadrage clair du flux lead-to-estimate avant la configuration.",
                "Une exécution structurée dans les outils approuvés.",
                "Des tests des scénarios critiques avant mise en ligne.",
                "Une communication directe sur ce qui avance, ce qui bloque et ce qui doit être décidé.",
                "Un transfert clair quand la Lead Machine est prête à utiliser.",
              ]} />
            </InfoCard>
            <InfoCard icon={<ClipboardList className="h-5 w-5" />} title="Ce qu’on attend de vous">
              <CheckList items={[
                "Compléter la checklist de départ aujourd’hui ou le plus rapidement possible.",
                "Fournir les accès nécessaires sans détour ni capture incomplète.",
                "Valider les critères de qualification, disponibilités et zones de service.",
                "Transmettre vos services, prix, options, taxes, conditions et modèles de soumission.",
                "Répondre vite quand une décision bloque le build.",
              ]} />
            </InfoCard>
          </div>
        </div>
      </Section>

      <Section id="scope" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <div>
              <SectionLabel>Frontière de scope</SectionLabel>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-50 mb-5">On concentre d’abord le build sur le moteur commercial qui transforme les leads en soumissions suivies.</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Cette phase est volontairement concentrée : capter les leads, les qualifier, les amener à réserver, structurer la création de soumissions, suivre les soumissions jusqu’à gagné/perdu et livrer le CRM commercial nécessaire à ce flux. Ce focus protège la vitesse du projet et permet de mettre en ligne un système utile avant d’ouvrir d’autres chantiers.
              </p>
              <div className="rounded-2xl border border-teal-400/25 bg-teal-400/10 p-5">
                <p className="text-sm font-semibold text-teal-100 leading-relaxed">
                  Si une demande sort de ce cadre, elle sera notée proprement et évaluée comme phase séparée si elle vaut la peine. L’objectif est de garder cette première mise en ligne claire, rapide et directement reliée aux revenus.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <InfoCard icon={<CheckCircle2 className="h-5 w-5" />} title="Inclus dans cette phase" accent>
                <CheckList items={includedItems} />
              </InfoCard>
              <InfoCard icon={<AlertTriangle className="h-5 w-5" />} title="Non inclus par défaut">
                <CheckList items={excludedItems} positive={false} />
              </InfoCard>
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-24 bg-slate-900/35 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <InfoCard icon={<Wrench className="h-5 w-5" />} title="CRM et Estimate Builder inclus" accent>
              <p>
                La Lead Machine inclut le CRM commercial et l’Estimate Builder. Si vous utilisez déjà un CRM ou un outil de soumission, on évalue le chemin d’implantation. L’outil existant change l’exécution, pas le prix, pas la valeur et pas le scope.
              </p>
            </InfoCard>
            <InfoCard icon={<CalendarDays className="h-5 w-5" />} title="Appel de calibration conditionnel">
              <p>
                Si votre liste de prix est claire, on configure à partir de celle-ci. Si vos prix sont flous, variables ou dans la tête du propriétaire, un appel de calibration de 30 à 45 minutes avec David sera ajouté avant le build.
              </p>
            </InfoCard>
            <InfoCard icon={<MapPinned className="h-5 w-5" />} title="La vraie valeur">
              <p>
                La valeur n’est pas seulement de produire une soumission. C’est de contrôler le suivi après soumission, voir gagné/perdu, et empêcher les opportunités chaudes de mourir sans relance.
              </p>
            </InfoCard>
          </div>
        </div>
      </Section>

      <Section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-teal-400/35 bg-slate-950/90 p-8 sm:p-10 shadow-2xl shadow-teal-950/25 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_44%)]" />
            <div className="relative z-10">
              <SectionLabel>Prochaine action</SectionLabel>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-50 mb-5">Gardez les documents au même endroit. Puis remplissez la checklist.</h2>
              <p className="max-w-2xl mx-auto text-slate-400 leading-relaxed mb-8">
                Cette page est le centre de départ opérationnel. Votre prochaine action est simple : transmettre les informations et documents nécessaires pour construire vite, proprement et sans aller-retour inutile.
              </p>
              <div className="flex justify-center">
                <Link href={CHECKLIST_ROUTE} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all duration-200 hover:shadow-[0_0_40px_rgba(20,184,166,0.35)] active:scale-95">
                  Compléter la checklist de départ
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <footer className="border-t border-slate-800/70 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-200">PrimeGrowth AI</p>
            <p className="text-xs text-slate-500 mt-1">Centre de départ client — Lead Machine</p>
          </div>
          <p className="text-xs text-slate-500 max-w-xl md:text-right">
            Page client privée. Conservez le lien dans votre courriel de départ et complétez la checklist avant toute attente de build.
          </p>
        </div>
      </footer>
    </div>
  );
}

type ChecklistFormState = {
  contact: string;
  company: string;
  email: string;
  phone: string;
  leadSources: string;
  bookingRules: string;
  serviceAreas: string;
  qualificationRules: string;
  services: string;
  pricingClarity: string;
  pricingNotes: string;
  estimateTool: string;
  currentCrm: string;
  communicationConstraints: string;
  pricingDocumentStatus: string;
  pricingDocumentDetails: string;
  estimateDocumentStatus: string;
  estimateDocumentDetails: string;
  crmDocumentStatus: string;
  crmDocumentDetails: string;
  exampleDocumentStatus: string;
  exampleDocumentDetails: string;
  otherDocumentStatus: string;
  otherDocumentDetails: string;
  blockers: string;
};

const initialChecklistForm: ChecklistFormState = {
  contact: "",
  company: "",
  email: "",
  phone: "",
  leadSources: "",
  bookingRules: "",
  serviceAreas: "",
  qualificationRules: "",
  services: "",
  pricingClarity: "",
  pricingNotes: "",
  estimateTool: "",
  currentCrm: "",
  communicationConstraints: "",
  pricingDocumentStatus: "",
  pricingDocumentDetails: "",
  estimateDocumentStatus: "",
  estimateDocumentDetails: "",
  crmDocumentStatus: "",
  crmDocumentDetails: "",
  exampleDocumentStatus: "",
  exampleDocumentDetails: "",
  otherDocumentStatus: "",
  otherDocumentDetails: "",
  blockers: "",
};

type DocUploadKey = "pricing" | "estimate" | "crm" | "example" | "other";
type DocFiles = Record<DocUploadKey, File[]>;

type DocumentRow = {
  label: string;
  need: string;
  statusKey: keyof ChecklistFormState;
  detailsKey: keyof ChecklistFormState;
  placeholder: string;
  uploadKey: DocUploadKey;
  fileField: string;
};

const initialDocFiles: DocFiles = {
  pricing: [],
  estimate: [],
  crm: [],
  example: [],
  other: [],
};

const acceptedDocumentTypes = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png";
const maxFileSizeBytes = 20 * 1024 * 1024;

const documentRows: DocumentRow[] = [
  {
    label: "Listes de prix et conditions",
    need: "Prix, taxes, dépôts, validité, exclusions, options et exceptions importantes.",
    statusKey: "pricingDocumentStatus",
    detailsKey: "pricingDocumentDetails",
    placeholder: "Ex. lien Drive disponible, fichier Excel à envoyer par courriel, prix à clarifier avec David...",
    uploadKey: "pricing",
    fileField: "pricing_files[]",
  },
  {
    label: "Modèles ou outils de soumission",
    need: "PDF, Excel, modèle maison, outil existant, exemples de soumissions envoyées.",
    statusKey: "estimateDocumentStatus",
    detailsKey: "estimateDocumentDetails",
    placeholder: "Ex. modèle PDF joint par courriel, accès à préparer, exemples anonymisés disponibles...",
    uploadKey: "estimate",
    fileField: "estimate_files[]",
  },
  {
    label: "CRM ou historique commercial existant",
    need: "Export, colonnes importantes, statuts actuels, champs à conserver, limites d’accès.",
    statusKey: "crmDocumentStatus",
    detailsKey: "crmDocumentDetails",
    placeholder: "Ex. export CSV à préparer, accès lecture seulement, ancien CRM à garder comme référence...",
    uploadKey: "crm",
    fileField: "crm_files[]",
  },
  {
    label: "Exemples de leads ou projets typiques",
    need: "Exemples de demandes idéales, mauvaises demandes, projets rentables et projets à éviter.",
    statusKey: "exampleDocumentStatus",
    detailsKey: "exampleDocumentDetails",
    placeholder: "Ex. captures anonymisées envoyées par courriel, exemples discutés pendant l’appel...",
    uploadKey: "example",
    fileField: "example_files[]",
  },
  {
    label: "Autres documents utiles",
    need: "Brochures, zones de service, garanties, formulaires existants ou documents internes pertinents.",
    statusKey: "otherDocumentStatus",
    detailsKey: "otherDocumentDetails",
    placeholder: "Ex. rien d’autre pour l’instant, dossier à partager plus tard, document papier seulement...",
    uploadKey: "other",
    fileField: "other_files[]",
  },
];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-2">{label}</label>
      {children}
      {hint && <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p>}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-slate-100 placeholder-slate-600 outline-none transition-colors focus:border-teal-400/70";
const textareaClass = `${inputClass} min-h-[118px] resize-y`;

export function LeadMachineChecklistFR() {
  const [form, setForm] = useState<ChecklistFormState>(initialChecklistForm);
  const [docFiles, setDocFiles] = useState<DocFiles>(initialDocFiles);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useSEO({
    title: "Checklist de départ — Lead Machine | PrimeGrowth AI",
    description: "Checklist d’accès et de calibration pour démarrer la Lead Machine PrimeGrowth AI.",
    canonical: "https://www.primegrowthai.com/fr/clients/lead-machine/checklist",
    lang: "fr",
    noindex: true,
  });

  const update = (field: keyof ChecklistFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addFiles = (uploadKey: DocUploadKey, fileList: FileList | null) => {
    if (!fileList?.length) return;

    const validFiles = Array.from(fileList).filter((file) => file.size <= maxFileSizeBytes);
    setDocFiles((current) => ({
      ...current,
      [uploadKey]: [...current[uploadKey], ...validFiles],
    }));
  };

  const removeFile = (uploadKey: DocUploadKey, index: number) => {
    setDocFiles((current) => ({
      ...current,
      [uploadKey]: current[uploadKey].filter((_, fileIndex) => fileIndex !== index),
    }));
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>, uploadKey: DocUploadKey) => {
    event.preventDefault();
    addFiles(uploadKey, event.dataTransfer.files);
  };

  const totalAttachedFiles = Object.values(docFiles).reduce((total, files) => total + files.length, 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    payload.append("source", "lead_machine_checklist_fr");
    payload.append("submittedAt", new Date().toISOString());

    documentRows.forEach((row) => {
      docFiles[row.uploadKey].forEach((file) => payload.append(row.fileField, file));
    });

    try {
      const response = await fetch("/api/lead-machine/checklist-submit", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("La checklist n’a pas pu être envoyée.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (_error) {
      setSubmitError("L’envoi automatique n’a pas été confirmé. Vos réponses et fichiers restent dans la page; réessayez ou envoyez-les directement à David.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex items-center justify-center px-6" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <div className="max-w-2xl text-center">
          <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">Checklist prête à envoyer</h1>
          <p className="text-slate-400 leading-relaxed mb-8">
            Vos réponses et fichiers attachés ont été transmis au point de capture de la checklist. PrimeGrowth pourra maintenant valider les informations, demander les accès par les canaux approuvés et préparer l’architecture de départ.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => setSubmitted(false)} className="px-7 py-3 rounded-xl border border-slate-700/70 bg-slate-800/50 text-slate-200 font-bold hover:border-slate-600 hover:bg-slate-800 transition-colors">
              Revenir aux réponses
            </button>
            <Link href="/fr/clients/lead-machine/bienvenue" className="px-7 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold transition-colors">
              Retour au centre de départ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        * { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      `}</style>

      <ClientNav compact />

      <main className="relative pt-32 pb-20">
        <AnimatedGridBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="mb-10">
            <StatusPill>Checklist d’accès et de pricing</StatusPill>
            <h1 className="mt-8 text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-slate-50">
              Donnez-nous ce qui permet de construire. Pas des morceaux éparpillés.
            </h1>
            <p className="mt-5 text-lg text-slate-400 leading-relaxed max-w-3xl">
              Remplissez cette checklist avec des réponses utilisables. Si une réponse est inconnue, écrivez-le clairement. Une réponse honnête vaut mieux qu’une supposition qui casse le système plus tard.
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-teal-400/25 bg-teal-400/10 p-5">
            <div className="flex gap-3">
              <Lock className="h-5 w-5 text-teal-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-teal-50/90 leading-relaxed">
                Ne collez pas vos mots de passe dans ce formulaire. Donnez les accès via invitation officielle, gestionnaire d’accès ou méthode approuvée avec David. Cette checklist sert à cadrer ce qui existe et ce qui doit être reçu.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 rounded-[1.75rem] border border-slate-700/60 bg-slate-950/70 p-6 sm:p-8 shadow-2xl shadow-black/25">
            <section>
              <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest mb-4">1. Coordonnées responsables</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Nom du responsable principal *">
                  <input required value={form.contact} onChange={(event) => update("contact", event.target.value)} className={inputClass} placeholder="Nom complet" />
                </Field>
                <Field label="Entreprise *">
                  <input required value={form.company} onChange={(event) => update("company", event.target.value)} className={inputClass} placeholder="Nom légal ou nom d’usage" />
                </Field>
                <Field label="Courriel *">
                  <input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className={inputClass} placeholder="responsable@entreprise.com" />
                </Field>
                <Field label="Téléphone *">
                  <input required type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} className={inputClass} placeholder="+1 (514) 000-0000" />
                </Field>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest mb-4">2. Sources de leads et réservation</h2>
              <div className="space-y-5">
                <Field label="D’où arrivent vos leads aujourd’hui? *" hint="Exemples : formulaire de site, Meta, appels, courriels, références, marketplace, autre CRM.">
                  <textarea required value={form.leadSources} onChange={(event) => update("leadSources", event.target.value)} className={textareaClass} />
                </Field>
                <Field label="Quelles sont vos règles de réservation? *" hint="Disponibilités, durée d’appel, délai minimal, types de rendez-vous, personne assignée, limites par semaine.">
                  <textarea required value={form.bookingRules} onChange={(event) => update("bookingRules", event.target.value)} className={textareaClass} />
                </Field>
                <Field label="Zones de service, types de projets acceptés et exclusions *">
                  <textarea required value={form.serviceAreas} onChange={(event) => update("serviceAreas", event.target.value)} className={textareaClass} />
                </Field>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest mb-4">3. Qualification</h2>
              <Field label="Comment décidez-vous qu’un lead est bon, moyen ou à rejeter? *" hint="Inclure budget minimal, secteur, urgence, type de client, taille de projet, décisionnaire, signaux rouges et exclusions claires.">
                <textarea required value={form.qualificationRules} onChange={(event) => update("qualificationRules", event.target.value)} className={textareaClass} />
              </Field>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest mb-4">4. Services, prix et soumissions</h2>
              <div className="space-y-5">
                <Field label="Liste de services, forfaits, options et conditions *">
                  <textarea required value={form.services} onChange={(event) => update("services", event.target.value)} className={textareaClass} />
                </Field>
                <Field label="Votre structure de prix est-elle claire et utilisable? *">
                  <select required value={form.pricingClarity} onChange={(event) => update("pricingClarity", event.target.value)} className={inputClass}>
                    <option value="" className="bg-[#0F172A]">Choisissez...</option>
                    <option value="claire" className="bg-[#0F172A]">Oui — liste de prix claire disponible</option>
                    <option value="partielle" className="bg-[#0F172A]">Partiellement — règles connues, mais plusieurs exceptions</option>
                    <option value="floue" className="bg-[#0F172A]">Non — beaucoup de prix sont encore dans la tête du propriétaire</option>
                  </select>
                </Field>
                <Field label="Notes de prix, taxes, validité, dépôts, exclusions et conditions *" hint="Si la structure est floue, un appel de calibration de 30 à 45 minutes avec David pourra être ajouté. Ce n’est pas automatique si la liste est déjà claire.">
                  <textarea required value={form.pricingNotes} onChange={(event) => update("pricingNotes", event.target.value)} className={textareaClass} />
                </Field>
                <Field label="Utilisez-vous déjà un outil ou modèle de soumission? *" hint="Avoir un outil existant ne réduit pas le prix de la Lead Machine. Ça change seulement le chemin d’implantation.">
                  <textarea required value={form.estimateTool} onChange={(event) => update("estimateTool", event.target.value)} className={textareaClass} placeholder="Ex. Joist, QuickBooks, Excel, PDF maison, autre, aucun..." />
                </Field>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest mb-4">5. CRM, contraintes et blocages</h2>
              <div className="space-y-5">
                <Field label="Utilisez-vous déjà un CRM? *" hint="Nom du CRM, usage actuel, information importante à conserver, et ce qui est déjà connecté. La Lead Machine inclut une couche CRM; l’ancien CRM ne dicte pas l’architecture et ne réduit pas le prix.">
                  <textarea required value={form.currentCrm} onChange={(event) => update("currentCrm", event.target.value)} className={textareaClass} placeholder="Ex. aucun CRM, CRM peu utilisé, CRM actif avec historique clients, CRM utilisé aussi pour opérations..." />
                </Field>
                <Field label="Contraintes à respecter pour les communications et relances *" hint="Indiquez seulement les contraintes réelles : canaux disponibles, heures à éviter, mots à ne pas utiliser, obligations internes, exceptions importantes. PrimeGrowth fixe la logique de suivi standard.">
                  <textarea required value={form.communicationConstraints} onChange={(event) => update("communicationConstraints", event.target.value)} className={textareaClass} />
                </Field>
                <div>
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Table de partage des documents</label>
                    <p className="text-xs leading-relaxed text-slate-500">
                      Tous les documents ne sont pas partageables par lien. Pour chaque ligne, indiquez la méthode réelle et joignez les fichiers disponibles au besoin. Formats acceptés : PDF, Word, Excel, CSV, JPG et PNG. Ne collez jamais de mots de passe.
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/45">
                    <div className="hidden md:grid grid-cols-[1fr_1fr_0.85fr_1.15fr_1.25fr] gap-0 border-b border-slate-700/70 bg-slate-900/80 text-xs font-bold uppercase tracking-widest text-slate-400">
                      <div className="p-4">Document</div>
                      <div className="p-4 border-l border-slate-700/70">Ce qu’on cherche</div>
                      <div className="p-4 border-l border-slate-700/70">Méthode / statut</div>
                      <div className="p-4 border-l border-slate-700/70">Détails pratiques</div>
                      <div className="p-4 border-l border-slate-700/70">Fichiers</div>
                    </div>

                    {documentRows.map((row) => (
                      <div key={row.label} className="grid md:grid-cols-[1fr_1fr_0.85fr_1.15fr_1.25fr] border-b border-slate-800/80 last:border-b-0">
                        <div className="p-4">
                          <p className="text-sm font-bold text-slate-100">{row.label}</p>
                        </div>
                        <div className="p-4 md:border-l md:border-slate-800/80">
                          <p className="md:hidden text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Ce qu’on cherche</p>
                          <p className="text-sm leading-relaxed text-slate-400">{row.need}</p>
                        </div>
                        <div className="p-4 md:border-l md:border-slate-800/80">
                          <p className="md:hidden text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Méthode / statut</p>
                          <select value={form[row.statusKey]} onChange={(event) => update(row.statusKey, event.target.value)} className={inputClass}>
                            <option value="" className="bg-[#0F172A]">Choisir...</option>
                            <option value="lien" className="bg-[#0F172A]">Lien partagé</option>
                            <option value="fichier-joint" className="bg-[#0F172A]">Fichier joint ici</option>
                            <option value="courriel" className="bg-[#0F172A]">À envoyer par courriel</option>
                            <option value="appel" className="bg-[#0F172A]">À remettre pendant l’appel</option>
                            <option value="export" className="bg-[#0F172A]">Export à préparer</option>
                            <option value="non-disponible" className="bg-[#0F172A]">Non disponible</option>
                          </select>
                        </div>
                        <div className="p-4 md:border-l md:border-slate-800/80">
                          <p className="md:hidden text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Détails pratiques</p>
                          <textarea value={form[row.detailsKey]} onChange={(event) => update(row.detailsKey, event.target.value)} className={`${inputClass} min-h-[92px] resize-y`} placeholder={row.placeholder} />
                        </div>
                        <div className="p-4 md:border-l md:border-slate-800/80">
                          <p className="md:hidden text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Fichiers</p>
                          <label
                            htmlFor={`lead-machine-upload-${row.uploadKey}`}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => handleDrop(event, row.uploadKey)}
                            className="group flex min-h-[118px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-3 py-4 text-center transition-colors hover:border-teal-400/70 hover:bg-teal-500/10"
                          >
                            <Upload className="mb-2 h-5 w-5 text-teal-400" />
                            <span className="text-xs font-bold text-slate-200">Glisser-déposer</span>
                            <span className="mt-1 text-[11px] leading-relaxed text-slate-500">ou cliquer pour joindre un fichier</span>
                            <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-teal-400/20 bg-teal-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-300">
                              <Paperclip className="h-3 w-3" /> {docFiles[row.uploadKey].length} fichier{docFiles[row.uploadKey].length > 1 ? "s" : ""}
                            </span>
                          </label>
                          <input
                            id={`lead-machine-upload-${row.uploadKey}`}
                            type="file"
                            multiple
                            accept={acceptedDocumentTypes}
                            className="sr-only"
                            onChange={(event) => {
                              addFiles(row.uploadKey, event.currentTarget.files);
                              event.currentTarget.value = "";
                            }}
                          />
                          {docFiles[row.uploadKey].length > 0 && (
                            <div className="mt-3 space-y-2">
                              {docFiles[row.uploadKey].map((file, fileIndex) => (
                                <div key={`${file.name}-${file.lastModified}-${fileIndex}`} className="flex items-center justify-between gap-2 rounded-lg border border-slate-700/70 bg-slate-900/80 px-3 py-2">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <FileCheck2 className="h-4 w-4 flex-shrink-0 text-teal-400" />
                                    <span className="truncate text-xs text-slate-300">{file.name}</span>
                                  </div>
                                  <button type="button" onClick={() => removeFile(row.uploadKey, fileIndex)} className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-rose-300" aria-label={`Retirer ${file.name}`}>
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Field label="Qu’est-ce qui pourrait bloquer le lancement?">
                  <textarea value={form.blockers} onChange={(event) => update("blockers", event.target.value)} className={textareaClass} placeholder="Accès Meta, calendrier, prix, ancien CRM complexe, responsable absent, fichiers incomplets..." />
                </Field>
              </div>
            </section>

            <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-50/90 leading-relaxed">
                  Cette checklist ne couvre pas les publicités, refontes de site, QuickBooks complet, facturation, planification chantier, gestion d’équipe, job costing ou opérations complètes. Ces demandes seront notées séparément si elles apparaissent.
                </p>
              </div>
            </div>

            {submitError && (
              <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 p-5">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-300" />
                  <p className="text-sm leading-relaxed text-rose-50/90">{submitError}</p>
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-8 py-4 font-extrabold text-slate-900 transition-all duration-200 hover:bg-teal-400 hover:shadow-[0_0_40px_rgba(20,184,166,0.28)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none">
              <Send className="h-4 w-4" />
              {submitting ? "Envoi en cours..." : `Envoyer la checklist${totalAttachedFiles > 0 ? ` avec ${totalAttachedFiles} fichier${totalAttachedFiles > 1 ? "s" : ""}` : ""}`}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
            <FileText className="h-4 w-4 text-slate-600" />
            <p>Utilisez la table de partage pour préciser comment chaque document sera transmis et joignez les fichiers disponibles directement dans la bonne ligne. Les accès sensibles doivent toujours passer par une invitation ou une méthode approuvée, jamais par mot de passe collé dans le formulaire.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
