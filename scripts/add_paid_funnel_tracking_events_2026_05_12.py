from pathlib import Path

ROOT = Path('/home/ubuntu/primegrowth-website')

def replace_once(path: str, old: str, new: str) -> None:
    p = ROOT / path
    text = p.read_text()
    if old not in text:
        raise SystemExit(f'Missing expected text in {path}: {old[:120]!r}')
    p.write_text(text.replace(old, new, 1))

# Apply pages: import Pixel helper, track application submit, track calendar click from success screen.
for path, lang, source, label in [
    ('client/src/pages/Apply.tsx', 'en', 'apply-en', 'apply_success_booking_click_en'),
    ('client/src/pages/ApplyFR.tsx', 'fr', 'apply-fr', 'apply_success_booking_click_fr'),
]:
    replace_once(
        path,
        'import { useSEO } from "@/hooks/useSEO";\n',
        'import { useSEO } from "@/hooks/useSEO";\nimport { trackMetaCustomEvent, trackMetaLead } from "@/lib/metaPixel";\n'
    )
    replace_once(
        path,
        '      if (!res.ok) throw new Error("Submission failed");\n      setStatus("success");\n',
        f'      if (!res.ok) throw new Error("Submission failed");\n      trackMetaLead({{\n        content_name: "PrimeGrowth Operations Review Application",\n        content_category: "application",\n        source: "{source}",\n        language: "{lang}",\n      }});\n      trackMetaCustomEvent("OperationsReviewApplication", {{\n        source: "{source}",\n        language: "{lang}",\n      }});\n      setStatus("success");\n'
    )

replace_once(
    'client/src/pages/Apply.tsx',
    '<a href="https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO" target="_blank" rel="noopener noreferrer" className="inline-block bg-teal-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-teal-400 transition-colors mb-4">\n            Book Your Discovery Call\n          </a>',
    '<a href="https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO" target="_blank" rel="noopener noreferrer" onClick={() => trackMetaCustomEvent("DiscoveryCallBookingClick", { source: "apply-success-en", language: "en" })} className="inline-block bg-teal-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-teal-400 transition-colors mb-4">\n            Book Your Discovery Call\n          </a>'
)
replace_once(
    'client/src/pages/ApplyFR.tsx',
    '<a href="https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO" target="_blank" rel="noopener noreferrer" className="inline-block bg-teal-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-teal-400 transition-colors mb-4">\n            Réserver mon appel découverte\n          </a>',
    '<a href="https://api.leadconnectorhq.com/widget/booking/tna24x8ZRjYp8JGdYWoO" target="_blank" rel="noopener noreferrer" onClick={() => trackMetaCustomEvent("DiscoveryCallBookingClick", { source: "apply-success-fr", language: "fr" })} className="inline-block bg-teal-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-teal-400 transition-colors mb-4">\n            Réserver mon appel découverte\n          </a>'
)

# Thank-you pages: import custom event helper, track snapshot submit, and track calendar-link clicks.
for path, lang, source in [
    ('client/src/pages/ResourceThankYou.tsx', 'en', 'operations-snapshot-en'),
    ('client/src/pages/ResourceThankYouFR.tsx', 'fr', 'operations-snapshot-fr'),
]:
    replace_once(
        path,
        'import { useSEO } from "@/hooks/useSEO";\n',
        'import { useSEO } from "@/hooks/useSEO";\nimport { trackMetaCustomEvent } from "@/lib/metaPixel";\n'
    )
    replace_once(
        path,
        '      setSnapshotState("done");\n',
        f'      trackMetaCustomEvent("OperationsSnapshotSubmit", {{\n        source: "{source}",\n        language: "{lang}",\n      }});\n      setSnapshotState("done");\n'
    )
    text_path = ROOT / path
    text = text_path.read_text()
    old = 'href={CALENDAR_LINK}\n'
    new = f'href={{CALENDAR_LINK}}\n            onClick={{() => trackMetaCustomEvent("DiscoveryCallBookingClick", {{ source: "toolkit-thank-you-{lang}", language: "{lang}" }})}}\n'
    count = text.count(old)
    if count == 0:
        raise SystemExit(f'No CALENDAR_LINK href blocks found in {path}')
    text_path.write_text(text.replace(old, new))

print('Added paid-funnel Meta tracking events to apply and resource thank-you routes.')
