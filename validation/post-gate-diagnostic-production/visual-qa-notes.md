# Production Post-Gate Diagnostic QA Notes

## Scope

This production validation confirms that the front-end-only Perspective-style diagnostic is live on the English and French construction resource thank-you pages. The change does not modify the original lead gate, GHL, n8n, SMS, email, webhook routing, or SyncJourney responsibilities.

## English production page

The English production thank-you page at `/resources/construction-systems/thank-you` renders the 45-second first-leak finder above the manual PDF/tool sections. The tested quote-follow-up path completes all three tap-based questions, displays the personalized result “Quote Follow-Up Leak,” promotes the Change Order Message Builder as the first recommended action, and keeps the existing PDF downloads, unlocked tools, Operations Snapshot form, and booking CTA accessible.

## French production page

The French production thank-you page at `/fr/ressources/systemes-construction/merci` renders the bilingual diagnostic with parity. The tested quote-follow-up path completes all three tap-based questions, displays the personalized result “Suivi des Soumissions,” promotes the French change-order generator as the first recommended action, and keeps the existing PDF downloads, unlocked tools, French Operations Snapshot form, and booking CTA accessible.

## Validation result

Both production flows passed mobile headless validation with JavaScript enabled. Screenshots and `validation-results.json` are stored in this directory as deployment evidence.
