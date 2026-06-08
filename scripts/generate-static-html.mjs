#!/usr/bin/env node
/**
 * PrimeGrowth AI — Static HTML Generator for SEO
 * 
 * Generates route-specific index.html files with real content for each page.
 * This runs AFTER `vite build` and creates HTML files that Google can index
 * without needing to execute JavaScript.
 * 
 * Unlike the Puppeteer-based prerender.mjs, this script doesn't need a browser.
 * It reads the built index.html template and injects route-specific content,
 * meta tags, and structured data.
 * 
 * Usage: node scripts/generate-static-html.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "..", "dist", "public");

// ─── Route definitions with SEO content ──────────────────────────────────────
// Each route has the meta tags and static content that Google needs to see.
// This mirrors what useSEO() sets client-side, but baked into static HTML.

const ROUTES = [
  {
    path: "/",
    lang: "en",
    title: "PrimeGrowth AI — Automation Systems for Contractors | Quebec",
    description: "Done-for-you automation systems for specialty sub-trade contractors in Quebec. CRM, scheduling, margin tracking, and invoicing — live in 14 days. Free operations review.",
    canonical: "https://www.primegrowthai.com/",
    alternate: { href: "https://www.primegrowthai.com/fr", lang: "fr" },
    content: `
      <h1>PrimeGrowth AI — The Sub-Trade OS for Specialty Contractors</h1>
      <p>Done-for-you operations system for specialty sub-trade contractors. We help contractors in Quebec fix their operations — whether you have too many tools, none at all, or tools that don't talk to each other.</p>
      <h2>What We Build</h2>
      <p>Project scheduling, crew dispatch with GPS-verified timesheets, real-time margin tracking, and automated invoicing. Your complete Sub-Trade OS, live in 14 days.</p>
      <h2>Who We Serve</h2>
      <p>Specialty sub-trade contractors: tile, epoxy, flooring, plumbing, electrical, and more. If you run a specialty trade and you're still the bottleneck in your own business, this system was built for you.</p>
      <h2>Free Tools</h2>
      <ul>
        <li><a href="/tools/ai-growth-score">Automation Leak Audit</a></li>
        <li><a href="/tools/job-costing-calculator">Job Costing + Quote Rescue Audit</a></li>
        <li><a href="/tools/change-order-builder">Change Order Message Builder</a></li>
        <li><a href="/resources/construction-systems">Free Construction Operations Toolkit</a></li>
      </ul>
      <p>Email: david@primegrowthai.com | Phone: +1 514-451-8001</p>
      <p><a href="https://calendar.app.google/YuPwSZypVWRW7YjEA">Book a Free Operations Review</a></p>
      <p><a href="/fr">Voir le site en français</a></p>
    `,
  },
  {
    path: "/fr",
    lang: "fr",
    title: "PrimeGrowth AI — Systèmes d'automatisation pour entrepreneurs | Québec",
    description: "Systèmes d'automatisation clé en main pour sous-traitants spécialisés au Québec. CRM, planification, suivi des marges et facturation — opérationnel en 14 jours.",
    canonical: "https://www.primegrowthai.com/fr",
    alternate: { href: "https://www.primegrowthai.com/", lang: "en" },
    content: `
      <h1>PrimeGrowth AI — Le système d'opérations pour sous-traitants spécialisés</h1>
      <p>Système d'opérations clé en main pour sous-traitants spécialisés. Nous aidons les entrepreneurs du Québec à corriger leurs opérations — que vous ayez trop d'outils, aucun outil, ou des outils qui ne communiquent pas entre eux.</p>
      <h2>Ce que nous construisons</h2>
      <p>Planification de projets, répartition des équipes avec feuilles de temps vérifiées par GPS, suivi des marges en temps réel et facturation automatisée. Votre système d'opérations complet, opérationnel en 14 jours.</p>
      <h2>Qui nous servons</h2>
      <p>Sous-traitants spécialisés : carrelage, époxy, revêtement de sol, plomberie, électricité et plus. Si vous dirigez un métier spécialisé et que vous êtes encore le goulot d'étranglement de votre propre entreprise, ce système a été conçu pour vous.</p>
      <h2>Outils gratuits</h2>
      <ul>
        <li><a href="/fr/outils/calculateur-croissance-ia">Audit des Fuites d’Automatisation</a></li>
        <li><a href="/fr/outils/calculateur-couts-chantier">Calculateur de Coût de Chantier + Sauvetage de Soumission</a></li>
        <li><a href="/fr/outils/generateur-extra">Générateur de Message d'Extra</a></li>
        <li><a href="/fr/ressources/systemes-construction">Trousse gratuite des opérations de construction</a></li>
      </ul>
      <p>Courriel : david@primegrowthai.com | Téléphone : +1 514-451-8001</p>
      <p><a href="https://calendar.app.google/YuPwSZypVWRW7YjEA">Réserver une revue d'opérations gratuite</a></p>
      <p><a href="/">View site in English</a></p>
    `,
  },
  {
    path: "/resources/construction-systems",
    lang: "en",
    title: "The Sub-Trade Operator's Toolkit — Free Construction Operations Guide | PrimeGrowth AI",
    description: "Free guide for sub-trade contractors: scheduling templates, margin calculators, crew management systems. Download the complete operator's toolkit.",
    canonical: "https://www.primegrowthai.com/resources/construction-systems",
    alternate: { href: "https://www.primegrowthai.com/fr/ressources/systemes-construction", lang: "fr" },
    content: `
      <h1>The Sub-Trade Operator's Toolkit</h1>
      <p>A free, comprehensive operations guide built specifically for specialty sub-trade contractors. Includes scheduling templates, margin calculators, crew management systems, and invoicing workflows.</p>
      <h2>What's Inside</h2>
      <p>Project scheduling frameworks, real-time margin tracking templates, crew dispatch systems with GPS verification, automated invoicing workflows, and client communication templates.</p>
      <h2>Who It's For</h2>
      <p>Sub-trade contractors running 2-15 person crews who want to stop being the bottleneck in their own business. Tile, epoxy, flooring, plumbing, electrical, and all specialty trades.</p>
      <p><a href="/fr/ressources/systemes-construction">Version française disponible</a></p>
    `,
  },
  {
    path: "/fr/ressources/systemes-construction",
    lang: "fr",
    title: "La Trousse de l'Opérateur Sous-Traitant — Guide gratuit | PrimeGrowth AI",
    description: "Guide gratuit pour sous-traitants : modèles de planification, calculateurs de marge, systèmes de gestion d'équipe. Téléchargez la trousse complète.",
    canonical: "https://www.primegrowthai.com/fr/ressources/systemes-construction",
    alternate: { href: "https://www.primegrowthai.com/resources/construction-systems", lang: "en" },
    content: `
      <h1>La Trousse de l'Opérateur Sous-Traitant</h1>
      <p>Un guide d'opérations complet et gratuit conçu spécifiquement pour les sous-traitants spécialisés. Comprend des modèles de planification, des calculateurs de marge, des systèmes de gestion d'équipe et des flux de facturation.</p>
      <h2>Ce qui est inclus</h2>
      <p>Cadres de planification de projets, modèles de suivi des marges en temps réel, systèmes de répartition des équipes avec vérification GPS, flux de facturation automatisée et modèles de communication client.</p>
      <p><a href="/resources/construction-systems">English version available</a></p>
    `,
  },
  {
    path: "/resources/construction-systems/thank-you",
    lang: "en",
    title: "Thank You — Your Toolkit Is Downloading | PrimeGrowth AI",
    description: "Your Sub-Trade Operator's Toolkit is downloading. Check your downloads folder for the PDFs and unlocked interactive tools.",
    canonical: "https://www.primegrowthai.com/resources/construction-systems/thank-you",
    noindex: true,
    content: `
      <h1>Your toolkit is downloading now.</h1>
      <p>The PDFs are downloading to your device. Your unlocked interactive tools are available from the resource hub.</p>
      <p><a href="/resources/construction-systems">Back to the resource page</a></p>
    `,
  },
  {
    path: "/fr/ressources/systemes-construction/merci",
    lang: "fr",
    title: "Merci — Votre trousse est en téléchargement | PrimeGrowth AI",
    description: "Votre trousse de l'opérateur sous-traitant est en téléchargement. Vérifiez votre dossier de téléchargements.",
    canonical: "https://www.primegrowthai.com/fr/ressources/systemes-construction/merci",
    noindex: true,
    content: `
      <h1>Votre trousse est en téléchargement.</h1>
      <p>Les PDF sont en cours de téléchargement sur votre appareil. Les outils interactifs débloqués sont disponibles dans le hub de ressources.</p>
      <p><a href="/fr/ressources/systemes-construction">Retour à la page ressource</a></p>
    `,
  },
  {
    path: "/resources/real-estate-systems",
    lang: "en",
    title: "Why Real Estate Brokerages Lose Leads and Revenue to Broken Operations | PrimeGrowth AI",
    description: "Learn how real estate brokerages automate lead follow-up, eliminate manual admin, and build systems that convert more deals. Book a free operations review.",
    canonical: "https://www.primegrowthai.com/resources/real-estate-systems",
    content: `
      <h1>Why Real Estate Brokerages Lose Leads and Revenue to Broken Operations</h1>
      <p>Most real estate brokerages lose 20-40% of their leads to slow follow-up, manual processes, and disconnected tools. Learn how the best brokerages automate lead follow-up, eliminate manual admin, and build systems that convert more deals.</p>
      <h2>Where Your Brokerage Is Leaking Time and Revenue</h2>
      <p>Lead Sources to CRM, CRM to Transaction Management, Transactions to Post-Close — every handoff is a potential leak point where leads fall through the cracks.</p>
      <h2>How the Best Brokerages Fix It</h2>
      <p>Automated lead routing, instant follow-up sequences, transaction management workflows, and post-close nurture campaigns. All connected, all automated.</p>
      <p><a href="/apply">Book a Free Operations Review</a></p>
    `,
  },
  {
    path: "/tools/job-costing-calculator",
    lang: "en",
    title: "Job Costing Calculator for Contractors — Free Tool | PrimeGrowth AI",
    description: "Free job costing calculator for contractors. Enter your labor, hours, and materials — get your minimum bid price, margin analysis, and risk alerts in under 60 seconds.",
    canonical: "https://www.primegrowthai.com/tools/job-costing-calculator",
    alternate: { href: "https://www.primegrowthai.com/fr/outils/calculateur-couts-chantier", lang: "fr" },
    content: `
      <h1>Job Costing Calculator for Contractors</h1>
      <p>Free job costing tool built for sub-trade contractors. Enter your labor costs, hours, and materials — get your minimum bid price, margin analysis, and risk alerts in under 60 seconds.</p>
      <h2>How It Works</h2>
      <p>Enter your crew size, hourly rates, estimated hours, and material costs. The calculator computes your total job cost, recommended bid price at your target margin, break-even price, and flags any margin risks.</p>
      <h2>Why Contractors Use This</h2>
      <p>Stop guessing on bids. Know your exact costs, set your margins with confidence, and never underbid a job again. Built by a contractor, for contractors.</p>
      <p><a href="/fr/outils/calculateur-couts-chantier">Version française disponible</a></p>
    `,
  },
  {
    path: "/fr/outils/calculateur-couts-chantier",
    lang: "fr",
    title: "Calculateur de Coûts de Chantier pour Entrepreneurs — Outil gratuit | PrimeGrowth AI",
    description: "Outil gratuit pour entrepreneurs en construction. Entrez votre main-d'œuvre, vos heures et vos matériaux — obtenez votre soumission minimale, analyse de marge et alertes de risque.",
    canonical: "https://www.primegrowthai.com/fr/outils/calculateur-couts-chantier",
    alternate: { href: "https://www.primegrowthai.com/tools/job-costing-calculator", lang: "en" },
    content: `
      <h1>Calculateur de Coûts de Chantier pour Entrepreneurs</h1>
      <p>Outil gratuit de calcul des coûts de chantier conçu pour les sous-traitants spécialisés. Entrez vos coûts de main-d'œuvre, heures et matériaux — obtenez votre prix de soumission minimum, analyse de marge et alertes de risque en moins de 60 secondes.</p>
      <h2>Comment ça fonctionne</h2>
      <p>Entrez la taille de votre équipe, les taux horaires, les heures estimées et les coûts des matériaux. Le calculateur calcule votre coût total, le prix de soumission recommandé à votre marge cible, le prix d'équilibre et signale tout risque de marge.</p>
      <p><a href="/tools/job-costing-calculator">English version available</a></p>
    `,
  },
  {
    path: "/tools/ai-growth-score",
    lang: "en",
    title: "Automation Leak Audit — Free Contractor Revenue Leak Tool | PrimeGrowth AI",
    description: "Free contractor diagnostic for lead intake, quote follow-up, after-hours capture, and admin handoff leaks. Find the automation leak costing you the most revenue.",
    canonical: "https://www.primegrowthai.com/tools/ai-growth-score",
    alternate: { href: "https://www.primegrowthai.com/fr/outils/calculateur-croissance-ia", lang: "fr" },
    content: `
      <h1>Automation Leak Audit for Contractors</h1>
      <p>Run the 4-minute contractor diagnostic for lead intake, quote follow-up, after-hours capture, and admin handoff leaks. See the leak that is most likely costing you jobs or margin.</p>
      <h2>What You'll Learn</h2>
      <p>Your dominant automation leak, the operational risk behind it, where revenue is likely disappearing, and the first system to fix before you buy more software.</p>
      <h2>Built for Contractors</h2>
      <p>This isn't a generic business quiz. Every question and recommendation is tailored to the specific challenges of running a sub-trade contracting business in Quebec.</p>
      <p><a href="/fr/outils/calculateur-croissance-ia">Version française disponible</a></p>
    `,
  },
  {
    path: "/fr/outils/calculateur-croissance-ia",
    lang: "fr",
    title: "Audit des Fuites d’Automatisation — Outil gratuit pour entrepreneurs | PrimeGrowth AI",
    description: "Diagnostic gratuit pour entrepreneurs : entrée de leads, relances de soumissions, hors heures et transferts administratifs. Trouve la fuite d’automatisation la plus coûteuse.",
    canonical: "https://www.primegrowthai.com/fr/outils/calculateur-croissance-ia",
    alternate: { href: "https://www.primegrowthai.com/tools/ai-growth-score", lang: "en" },
    content: `
      <h1>Audit des Fuites d’Automatisation pour entrepreneurs</h1>
      <p>Fais le diagnostic de 4 minutes pour l’entrée de leads, les relances de soumissions, la couverture hors heures et les transferts administratifs. Trouve la fuite la plus susceptible de coûter des contrats ou de la marge.</p>
      <h2>Ce que tu apprendras</h2>
      <p>Ta fuite d’automatisation dominante, le risque opérationnel derrière, où l’argent disparaît probablement, et le premier système à corriger avant d’acheter plus de logiciels.</p>
      <p><a href="/tools/ai-growth-score">English version available</a></p>
    `,
  },
  {
    path: "/tools/change-order-builder",
    lang: "en",
    title: "Change Order Message Builder for Contractors — Free Tool | PrimeGrowth AI",
    description: "Free contractor change order message builder. Generate a client message, SMS version, approval wording, and internal scope note before extra work becomes unpaid work.",
    canonical: "https://www.primegrowthai.com/tools/change-order-builder",
    alternate: { href: "https://www.primegrowthai.com/fr/outils/generateur-extra", lang: "fr" },
    content: `
      <h1>Change Order Message Builder for Contractors</h1>
      <p>Generate the exact client message, SMS version, approval line, and internal scope note for extra work before the scope change becomes free labour.</p>
      <h2>Why It Matters</h2>
      <p>Most unpaid extras are communication failures, not technical failures. This tool turns vague requests into written approval, margin protection, and a clean record for the job file.</p>
      <p><a href="/fr/outils/generateur-extra">Version française disponible</a></p>
    `,
  },
  {
    path: "/fr/outils/generateur-extra",
    lang: "fr",
    title: "Générateur de Message d'Extra pour Entrepreneurs — Outil gratuit | PrimeGrowth AI",
    description: "Outil gratuit pour entrepreneurs : crée un message client, une version texto, une formule d’approbation et une note interne avant qu’un extra devienne du travail gratuit.",
    canonical: "https://www.primegrowthai.com/fr/outils/generateur-extra",
    alternate: { href: "https://www.primegrowthai.com/tools/change-order-builder", lang: "en" },
    content: `
      <h1>Générateur de Message d'Extra pour Entrepreneurs</h1>
      <p>Crée le message client, la version texto, la formule d’approbation et la note interne pour un extra avant que le changement devienne de la main-d’œuvre gratuite.</p>
      <h2>Pourquoi c’est important</h2>
      <p>La plupart des extras non payés sont des problèmes de communication, pas des problèmes techniques. Cet outil transforme une demande vague en approbation écrite, protection de marge et trace claire au dossier.</p>
      <p><a href="/tools/change-order-builder">English version available</a></p>
    `,
  },
  {
    path: "/apply",
    lang: "en",
    title: "Apply for a Free Operations Review — PrimeGrowth AI",
    description: "Book a free operations review for your contracting business. We'll analyze your current systems and show you exactly where you're losing time and money.",
    canonical: "https://www.primegrowthai.com/apply",
    alternate: { href: "https://www.primegrowthai.com/fr/postuler", lang: "fr" },
    content: `
      <h1>Apply for a Free Operations Review</h1>
      <p>Tell us about your contracting business and we'll show you exactly where you're losing time and money to manual processes. No obligation, no sales pitch — just a clear picture of your operations.</p>
      <h2>What Happens Next</h2>
      <p>After you submit this form, we'll review your information and schedule a 30-minute operations review call. We'll analyze your current systems and give you a specific action plan — whether you work with us or not.</p>
      <p><a href="/fr/postuler">Postuler en français</a></p>
    `,
  },
  {
    path: "/fr/postuler",
    lang: "fr",
    title: "Postuler pour une revue d'opérations gratuite — PrimeGrowth AI",
    description: "Réservez une revue d'opérations gratuite pour votre entreprise de construction. Nous analyserons vos systèmes actuels et vous montrerons exactement où vous perdez du temps et de l'argent.",
    canonical: "https://www.primegrowthai.com/fr/postuler",
    alternate: { href: "https://www.primegrowthai.com/apply", lang: "en" },
    content: `
      <h1>Postuler pour une revue d'opérations gratuite</h1>
      <p>Parlez-nous de votre entreprise de construction et nous vous montrerons exactement où vous perdez du temps et de l'argent à cause de processus manuels. Sans obligation, sans argumentaire de vente — juste une image claire de vos opérations.</p>
      <h2>Ce qui se passe ensuite</h2>
      <p>Après avoir soumis ce formulaire, nous examinerons vos informations et planifierons un appel de revue d'opérations de 30 minutes.</p>
      <p><a href="/apply">Apply in English</a></p>
    `,
  },
  {
    path: "/fr/clients/lead-machine/bienvenue",
    lang: "fr",
    title: "Centre de départ client — Lead Machine | PrimeGrowth AI",
    description: "Page de départ post-vente pour les clients Lead Machine de PrimeGrowth AI : vidéo, roadmap, contrat, attentes, checklist et scope.",
    canonical: "https://www.primegrowthai.com/fr/clients/lead-machine/bienvenue",
    noindex: true,
    content: `
      <h1>Centre de départ client — Lead Machine</h1>
      <p>Bienvenue. À partir d’ici, on passe de la vente à l’exécution.</p>
      <h2>Roadmap</h2>
      <p>Départ et accès, architecture Lead Machine, Estimate Builder, relances et visibilité gagné/perdu, tests et mise en ligne.</p>
      <h2>Scope</h2>
      <p>Cette phase couvre le chemin lead-to-estimate : capter les leads, les qualifier, les amener à réserver, structurer la création de soumissions et suivre les soumissions jusqu’à gagné/perdu.</p>
      <p><a href="/fr/clients/lead-machine/checklist">Compléter la checklist de départ</a></p>
    `,
  },
  {
    path: "/fr/clients/lead-machine/checklist",
    lang: "fr",
    title: "Checklist de départ — Lead Machine | PrimeGrowth AI",
    description: "Checklist d’accès et de calibration pour démarrer la Lead Machine PrimeGrowth AI.",
    canonical: "https://www.primegrowthai.com/fr/clients/lead-machine/checklist",
    noindex: true,
    content: `
      <h1>Checklist de départ — Lead Machine</h1>
      <p>Remplissez cette checklist avec les sources de leads, règles de réservation, zones de service, critères de qualification, services, prix, conditions, modèle de soumission et règles de relance.</p>
      <h2>Frontière de scope</h2>
      <p>Ne collez pas vos mots de passe dans ce formulaire. Les publicités, refontes de site, QuickBooks complet, facturation, planification chantier, job costing et opérations complètes sont hors scope par défaut.</p>
      <p><a href="/fr/clients/lead-machine/bienvenue">Retour au centre de départ</a></p>
    `,
  },
];

// ─── HTML Generation ─────────────────────────────────────────────────────────

function generateHTML(route, templateHTML) {
  let html = templateHTML;

  // Replace the <title> tag
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${route.title}</title>`
  );

  // Replace the meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${route.description}"`
  );

  // Replace the canonical URL
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${route.canonical}"`
  );

  // Replace the html lang attribute
  html = html.replace(
    /<html lang="[^"]*"/,
    `<html lang="${route.lang}"`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${route.title}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${route.description}"`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${route.canonical}"`
  );
  html = html.replace(
    /<meta property="og:locale" content="[^"]*"/,
    `<meta property="og:locale" content="${route.lang === "fr" ? "fr_CA" : "en_CA"}"`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${route.title}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${route.description}"`
  );

  // Update hreflang tags
  if (route.alternate) {
    const selfLang = route.lang;
    const altLang = route.alternate.lang;
    const selfHref = route.canonical;
    const altHref = route.alternate.href;
    const xDefault = selfLang === "en" ? selfHref : altHref;

    // Replace existing hreflang tags
    html = html.replace(
      /<link rel="alternate" hreflang="en" href="[^"]*"/,
      `<link rel="alternate" hreflang="en" href="${selfLang === "en" ? selfHref : altHref}"`
    );
    html = html.replace(
      /<link rel="alternate" hreflang="fr" href="[^"]*"/,
      `<link rel="alternate" hreflang="fr" href="${selfLang === "fr" ? selfHref : altHref}"`
    );
    html = html.replace(
      /<link rel="alternate" hreflang="x-default" href="[^"]*"/,
      `<link rel="alternate" hreflang="x-default" href="${xDefault}"`
    );
  }

  // Replace the noscript content with route-specific content
  // Match the noscript block in the body (after <div id="root">)
  html = html.replace(
    /<!-- Noscript content for search engines[^>]*-->\s*<noscript>[\s\S]*?<\/noscript>/,
    `<!-- Noscript content for search engines that don't execute JS -->\n    <noscript>${route.content}\n    </noscript>`
  );

  return html;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log("🔧 PrimeGrowth AI — Static HTML Generator");
  console.log(`📁 Dist directory: ${DIST_DIR}`);
  console.log(`📄 Routes to generate: ${ROUTES.length}`);
  console.log("");

  // Read the template (root index.html built by Vite)
  const templatePath = path.join(DIST_DIR, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("❌ dist/public/index.html not found. Run `vite build` first.");
    process.exit(1);
  }
  const templateHTML = fs.readFileSync(templatePath, "utf-8");

  let successCount = 0;

  for (const route of ROUTES) {
    try {
      const html = generateHTML(route, templateHTML);

      // Create the output directory
      const outputDir = route.path === "/"
        ? DIST_DIR
        : path.join(DIST_DIR, route.path);

      fs.mkdirSync(outputDir, { recursive: true });

      const outputFile = path.join(outputDir, "index.html");
      fs.writeFileSync(outputFile, html, "utf-8");

      const size = (Buffer.byteLength(html) / 1024).toFixed(1);
      console.log(`  ✅ ${route.path} → ${outputFile.replace(DIST_DIR, "dist/public")} (${size}KB)`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Failed to generate ${route.path}: ${err.message}`);
    }
  }

  console.log("");
  console.log(`✅ Generated ${successCount}/${ROUTES.length} route HTML files`);
  console.log("🏁 Done!");
}

main();
