import puppeteer from "puppeteer-core";
import fs from "node:fs/promises";
import path from "node:path";

const outDir =
  "/home/ubuntu/primegrowth-website/validation/post-gate-diagnostic-production";
await fs.mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const cases = [
  {
    lang: "en",
    url: "https://www.primegrowthai.com/resources/construction-systems/thank-you?email=test@example.com&name=David",
    expectedStart: "Before you open every file",
    answers: [
      "Quotes or extras not followed up",
      "Approved extras do not become clean paperwork",
      "This month",
    ],
    expectedResult: "Quote Follow-Up Leak",
    expectedTool: "Build a Change Order Message",
  },
  {
    lang: "fr",
    url: "https://www.primegrowthai.com/fr/ressources/systemes-construction/merci?email=test@example.com&name=David",
    expectedStart: "Avant d'ouvrir tous les fichiers",
    answers: [
      "Soumissions ou extras qui ne sont pas relancés",
      "Les extras approuvés ne deviennent pas de la paperasse claire",
      "Ce mois-ci",
    ],
    expectedResult: "Suivi des Soumissions",
    expectedTool: "Créer un Message d'Extra",
  },
];

const results = [];

for (const testCase of cases) {
  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
  });
  await page.goto(testCase.url, { waitUntil: "networkidle0", timeout: 45000 });
  await page.screenshot({
    path: path.join(outDir, `${testCase.lang}-01-start.png`),
    fullPage: true,
  });

  const startText = await page.evaluate(() => document.body.innerText);
  if (!startText.includes(testCase.expectedStart)) {
    throw new Error(
      `${testCase.lang}: missing diagnostic start copy on production`
    );
  }

  for (const answer of testCase.answers) {
    await page.evaluate(label => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const target = buttons.find(button =>
        button.textContent?.includes(label)
      );
      if (!target) throw new Error(`Button not found: ${label}`);
      target.click();
    }, answer);
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  await page.screenshot({
    path: path.join(outDir, `${testCase.lang}-02-result.png`),
    fullPage: true,
  });
  const resultText = await page.evaluate(() => document.body.innerText);
  if (!resultText.includes(testCase.expectedResult)) {
    throw new Error(`${testCase.lang}: expected result missing on production`);
  }
  if (!resultText.includes(testCase.expectedTool)) {
    throw new Error(
      `${testCase.lang}: expected recommendation CTA missing on production`
    );
  }

  results.push({
    lang: testCase.lang,
    url: testCase.url,
    startVisible: true,
    resultVisible: true,
    recommendedCtaVisible: true,
    screenshots: [
      `${testCase.lang}-01-start.png`,
      `${testCase.lang}-02-result.png`,
    ],
  });
  await page.close();
}

await browser.close();
await fs.writeFile(
  path.join(outDir, "validation-results.json"),
  JSON.stringify(results, null, 2)
);
console.log(JSON.stringify(results, null, 2));
