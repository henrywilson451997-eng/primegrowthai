#!/usr/bin/env node
/**
 * PrimeGrowth AI — Post-build Prerender Script
 * 
 * Spins up a local static server, visits each route with Puppeteer,
 * and saves the fully-rendered HTML to the dist folder.
 * This gives Google real content to index instead of an empty <div id="root">.
 * 
 * Usage: node scripts/prerender.mjs
 * Runs after `vite build` in the build pipeline.
 */

import { execSync } from "child_process";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "..", "dist", "public");
const PORT = 4173;

// All indexable routes (must match App.tsx routes and sitemap.xml)
const ROUTES = [
  "/",
  "/fr",
  "/resources/construction-systems",
  "/fr/ressources/systemes-construction",
  "/resources/real-estate-systems",
  "/tools/job-costing-calculator",
  "/fr/outils/calculateur-couts-chantier",
  "/tools/ai-growth-score",
  "/fr/outils/calculateur-croissance-ia",
  "/apply",
  "/fr/postuler",
];

// Simple static file server that falls back to index.html (SPA behavior)
function createStaticServer() {
  return http.createServer((req, res) => {
    let filePath = path.join(DIST_DIR, req.url === "/" ? "index.html" : req.url);
    
    // If the file doesn't exist, serve index.html (SPA fallback)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      // Check if there's an index.html in the directory
      const dirIndex = path.join(filePath, "index.html");
      if (fs.existsSync(dirIndex)) {
        filePath = dirIndex;
      } else {
        filePath = path.join(DIST_DIR, "index.html");
      }
    }

    const ext = path.extname(filePath);
    const mimeTypes = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".woff2": "font/woff2",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    } catch (err) {
      res.writeHead(404);
      res.end("Not found");
    }
  });
}

async function prerender() {
  console.log("🔧 PrimeGrowth AI — Prerender Script");
  console.log(`📁 Dist directory: ${DIST_DIR}`);
  console.log(`📄 Routes to prerender: ${ROUTES.length}`);
  console.log("");

  // Verify dist exists
  if (!fs.existsSync(path.join(DIST_DIR, "index.html"))) {
    console.error("❌ dist/public/index.html not found. Run `vite build` first.");
    process.exit(1);
  }

  // Start local server
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`🌐 Static server running on http://localhost:${PORT}`);

  // Dynamically import puppeteer-core (uses system Chromium)
  let puppeteer;
  try {
    puppeteer = await import("puppeteer-core");
  } catch {
    console.error("❌ puppeteer-core not found. Install with: pnpm add -D puppeteer-core");
    server.close();
    process.exit(1);
  }

  // Find system Chromium/Chrome
  const chromePaths = [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ];
  const executablePath = chromePaths.find((p) => fs.existsSync(p));
  if (!executablePath) {
    console.error("❌ No Chromium/Chrome found on system.");
    server.close();
    process.exit(1);
  }
  console.log(`🌐 Using Chrome: ${executablePath}`);

  const browser = await puppeteer.default.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  let successCount = 0;
  let failCount = 0;

  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();
      
      // Set a reasonable viewport
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigate to the route
      const url = `http://localhost:${PORT}${route}`;
      console.log(`  ⏳ Rendering ${route}...`);
      
      await page.goto(url, { 
        waitUntil: "networkidle0",
        timeout: 30000 
      });

      // Wait a bit for any animations/lazy content to settle
      await new Promise((r) => setTimeout(r, 1000));

      // Get the full rendered HTML
      let html = await page.content();

      // Clean up: remove any Vite HMR/dev scripts, manus runtime scripts
      html = html.replace(/<script[^>]*manus[^>]*>[\s\S]*?<\/script>/gi, "");
      html = html.replace(/<script[^>]*__manus__[^>]*>[\s\S]*?<\/script>/gi, "");
      
      // Ensure the prerendered HTML still has the main script tag for hydration
      // The Vite-built JS will take over on the client side
      
      // Create the output directory structure
      const outputDir = route === "/" 
        ? DIST_DIR 
        : path.join(DIST_DIR, route);
      
      fs.mkdirSync(outputDir, { recursive: true });
      
      const outputFile = path.join(outputDir, "index.html");
      fs.writeFileSync(outputFile, html, "utf-8");
      
      const size = (Buffer.byteLength(html) / 1024).toFixed(1);
      console.log(`  ✅ ${route} → ${outputFile.replace(DIST_DIR, "dist/public")} (${size}KB)`);
      successCount++;
      
      await page.close();
    } catch (err) {
      console.error(`  ❌ Failed to prerender ${route}: ${err.message}`);
      failCount++;
    }
  }

  await browser.close();
  server.close();

  console.log("");
  console.log(`✅ Prerendered ${successCount}/${ROUTES.length} routes`);
  if (failCount > 0) {
    console.log(`❌ ${failCount} routes failed`);
  }
  console.log("🏁 Done!");
}

prerender().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
