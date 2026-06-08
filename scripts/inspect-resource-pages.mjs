import puppeteer from 'puppeteer-core';
import fs from 'fs/promises';

const executableCandidates = [
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/snap/bin/chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable'
];

async function exists(path) {
  try { await fs.access(path); return true; } catch { return false; }
}

const executablePath = (await Promise.all(executableCandidates.map(async p => (await exists(p)) ? p : null))).find(Boolean);
if (!executablePath) throw new Error('No Chromium executable found');

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
});

const pages = [
  { name: 'en', url: 'http://127.0.0.1:3000/resources/construction-systems' },
  { name: 'fr', url: 'http://127.0.0.1:3000/fr/ressources/systemes-construction' },
  { name: 'thank_you_en', url: 'http://127.0.0.1:3000/resources/construction-systems/thank-you?name=David&email=test@example.com' },
  { name: 'thank_you_fr', url: 'http://127.0.0.1:3000/fr/ressources/systemes-construction/merci?name=David&email=test@example.com' }
];

const results = [];
for (const spec of pages) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
  await page.goto(spec.url, { waitUntil: 'networkidle2', timeout: 45000 });
  await page.screenshot({ path: `/home/ubuntu/${spec.name}_resource_audit_screenshot.png`, fullPage: true });
  const data = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, header, nav, main, footer')).map((el, i) => ({
      index: i,
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1000),
      top: Math.round(el.getBoundingClientRect().top + window.scrollY),
      height: Math.round(el.getBoundingClientRect().height)
    }));
    const ctas = Array.from(document.querySelectorAll('a, button')).map((el, i) => ({
      index: i,
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
      href: el.getAttribute('href') || '',
      top: Math.round(el.getBoundingClientRect().top + window.scrollY),
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
    })).filter(x => x.visible && x.text);
    const aboveFold = document.elementFromPoint(720, 580)?.closest('section, main, header, nav')?.innerText?.replace(/\s+/g, ' ').trim().slice(0, 1200) || document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 1200);
    return { title: document.title, bodyText: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 5000), aboveFold, sections, ctas };
  });
  results.push({ ...spec, screenshot: `/home/ubuntu/${spec.name}_resource_audit_screenshot.png`, ...data });
  await page.close();
}
await browser.close();
await fs.writeFile('/home/ubuntu/primegrowth_resource_page_render_audit.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.map(r => ({ name: r.name, title: r.title, screenshot: r.screenshot, sections: r.sections.length, ctas: r.ctas.length })), null, 2));
