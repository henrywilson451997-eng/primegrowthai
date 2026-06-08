# PrimeGrowth live website webhook QA — 2026-06-05

Author: **Manus AI**

## Scope

This document records the live production QA pass for PrimeGrowth website lead-capture routes after the production deployment of commit `2f93726` (`Fix GHL webhook submissions with POST JSON`). The pass used the test identity explicitly provided by David and focused on whether the public website accepted the submissions, sent browser-originated webhook requests, and unlocked the correct frontend success states.

> **Important caveat:** This pass verifies website and browser-network behavior only. It does **not** prove that GoHighLevel created or updated the contact, assigned tags, added notes, or executed downstream workflows. CRM-side verification was blocked by GoHighLevel authentication, and David confirmed that SyncJourney can validate the downstream GHL result.

## Test identity

| Field | Value |
|---|---|
| Name | David Knot |
| Email | Davidknot@hotmail.fr |
| Phone | 5144518001 |
| Company | Construction jo blo |

## Production deployment context

| Field | Observation |
|---|---|
| Website domain tested | `https://www.primegrowthai.com` |
| Website repository commit tested | `2f93726` |
| Commit message | `Fix GHL webhook submissions with POST JSON` |
| Vercel production status observed | Ready |
| Vercel production deployment ID observed | `8raigS16K` |
| Production domain shown in Vercel | `www.primegrowthai.com` |

The earlier production deployment at commit `4cd5653` was superseded by `2f93726`. Based on the observed Vercel deployment page, the POST JSON webhook fix was live in production before this QA pass.

## Results

| Time/context | Form family | Route | Website-side result | Evidence and notes |
|---|---|---|---|---|
| 2026-06-05 browser test | Apply Form | `https://www.primegrowthai.com/apply` | Success page rendered: `Request Received`. | Submitted with a QA marker in the goal field. Selected General Contractor, 2–5 employees, $500K–$1M, job costing and lead follow-up pain points, source Other. Needs GHL-side verification in contact/workflow logs. |
| 2026-06-05 browser test | Website Toolkit Form | `https://www.primegrowthai.com/resources/construction-systems` | Success state rendered: `Your toolkit is downloading.` | Submitted David / Davidknot@hotmail.fr / 5144518001 through the production site. Browser console showed no errors after submission. Needs GHL-side verification in contact/workflow logs. |
| 2026-06-05 ~20:38 EDT browser retest | Website Calculator Form | `https://www.primegrowthai.com/tools/job-costing-calculator` | Full results unlocked after approximately 12 seconds; `Download My Quote Safety Summary` appeared. | Submitted David / Davidknot@hotmail.fr / 5144518001 using Renovation / GC scenario: 4 workers, $58/hr, 320 hours, $12,000 materials, 24% target margin, Established operation. Browser console showed no JavaScript errors. Resource timing showed the Calculator LeadConnector POST completed as `fetch` after approximately 12,224 ms with response body size 43 bytes. A separate same-page browser-console POST probe returned HTTP 200 and `{"status":"Success: test request received"}` with CORS response type `cors`. Conclusion: browser POST is not CORS-blocked; the perceived stuck state was endpoint latency. Needs GHL-side verification in contact/workflow logs. |
| 2026-06-05 ~20:42 EDT browser test | Website Resource Form | `https://www.primegrowthai.com/resources/construction-systems/thank-you?email=Davidknot%40hotmail.fr&name=David` | Three-question diagnostic completed and rendered recommended first path: `Margin Blind Spot`; CTA `Open the Job Costing Calculator` appeared. | Answers selected: `Not knowing the real margin on jobs`, `Labour, materials, and changes are hard to reconcile`, `This month`. Browser console showed no JavaScript errors. Resource timing showed the Resource LeadConnector POST completed as `fetch` after approximately 15,231 ms with response body size 43 bytes. Needs GHL-side verification in contact/workflow logs. |

## Interpretation

The production website is no longer showing the previously suspected browser-origin POST failure. The calculator-specific evidence is the strongest because it includes both the normal UI path and an independent browser-origin POST probe from the same page context. That probe returned HTTP 200 with a LeadConnector success payload, which means the browser request was not blocked by CORS and the webhook endpoint accepted at least a test request.

The only material weakness in the current proof package is downstream CRM confirmation. Since GoHighLevel access required login and David opted to let SyncJourney confirm downstream results, this QA pass should be treated as **website-route passed, CRM-route pending external confirmation**.

## Required SyncJourney/GHL confirmation

| Item to confirm in GHL | Why it matters |
|---|---|
| Contact exists or was updated for `Davidknot@hotmail.fr`. | Proves LeadConnector/GHL received and resolved the submitted identity. |
| Correct tags were applied for each route. | Proves route segmentation is working, not merely generic contact capture. |
| Notes/custom fields contain route-specific answers and calculator data. | Proves payload mapping survived beyond the HTTP accept response. |
| Workflow history shows the expected website route trigger. | Proves downstream automation executed, not only webhook ingestion. |
| No duplicate or malformed contact records were created. | Protects CRM hygiene before paid traffic or public launch expansion. |

## Verdict

Based on available website and browser-network evidence, the production website webhook routes passed the frontend QA pass after commit `2f93726`. Do **not** mark the full lead intake route as end-to-end complete until SyncJourney or direct GHL access verifies the CRM-side records and workflow history.
