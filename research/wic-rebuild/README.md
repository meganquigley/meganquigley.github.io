# The work of getting help

Independently rebuilt on `new-direction`, 24 September 2026. Source narrative: https://docs.google.com/document/d/1qbnDNbZYsaCQ0P1T-3yzU7r7J_mp7RX6J2M6SU87smk/edit . No previous story code, art, or generated data is imported. The existing Pages build and other pages are preserved.

## Reproduction

1. `python3 research/wic-rebuild/reproduce.py` writes a fresh 50-state CSV and `dist/case-studies/wic/evidence.json`.
2. `python3 scripts/build-wic-story.py` writes semantic HTML plus the scene manifest.
3. `python3 scripts/build-pages.py` builds `_site/` using the existing Pages infrastructure.
4. `NODE_PATH=/private/tmp/access-gap-validation/node_modules node tests/wic-story.cjs` and `node tests/scrollytelling.cjs` (jsdom and css-tree required).

The narrative is authored in `scripts/build-wic-story.py`; the CSS, state module, and DOM renderer are independently authored files in the WIC route. No API requests, backend, analytics, storage, automatic progression, or mandatory clicks. Web fonts have system fallbacks. If the JS module fails, the complete story remains in document order. Small-height/zoomed viewports render the same frames in normal flow to protect readability.

## Numerical ledger

| Measure | Value | Population / unit / period | Primary source |
|---|---:|---|---|
| Coverage | US 56.1%; NY 62.4%; VT 79.6%; LA 41.3% | Average-month eligible women, infants and children, 2023; participants / eligible people | USDA 2023 Eligibility and Coverage, Table 3.5 |
| Age coverage | 82.3, 67.4, 52.5, 45.2, 26.9% | Separate infant/age 1/2/3/4 populations, 2023; not a longitudinal cohort | Same report, Tables 3.1 and 3.7 |
| Retailer access | US 40%; NY 19%; VT 30%; LA 56% without convenient access | Low-income families with children under 5, ACS 2015–19 proxy; FY2022 retailers; urban >1 mile / rural >10 miles | USDA Access Part 1, Table A.20, printed A.60–A.61 |
| State correlation | −0.47440143 | Pearson correlation of 50 state rounded access percentages vs 2023 coverage percentages, equal state weights; DC/PR excluded | Independently transcribed tables, `state-comparison.csv` |
| Redemption threshold | 30.4% below 70% redemption | 365,738 fruit/vegetable certification periods, Southern California. Records Nov 2019–June 2023; certifications Nov 2019–June 2022; children age 0–3 at certification | Chaparro et al., JAMA Network Open 2025, Table 2. Calculation: 100 × (1 − 254506 / 365738) = 30.413% |
| Consistent participation | 43.5%; complement 56.5% | Weighted mother–child pairs from 2013 enrollment cohort through 54 months; includes intermittent participation; not a single renewal dropout estimate | USDA WIC ITFPS-2 Year 5 |
| Produce allowance | $52/month fully breastfeeding; $26/month child | FY2026 (Oct 1 2025–Sep 30 2026), cash-value produce allowance | USDA FY2026 CVV/B memorandum |
| Illustrative maximum | $624 + $1,248 = $1,872 | 12 × $52 + 48 × $26. Continuous eligibility, fixed FY2026 rates. Available produce benefits, not actual redeemed food, total WIC value, guaranteed savings, or forecast | Calculated; no invented redemption percentage |
| Diet-quality difference | 3.6 points | Adjusted observational association at age 3 on HEI–2015 100-point scale; first-year-only vs continued into third year | Borger et al., PubMed 35277313 |
| Referrals | 8 of 10 interviewees | Small participant sample recruited in NH; broader study includes NH/VT staff, interviews Feb–Apr 2024, publication Jan 2026 | Frontiers Health Services 1707744 |

Primary URLs and qualifications are also directly linked in the page's ending source section. Approximate figures and assumptions are disclosed next to each finding. No fictional receipts contain prices. Maya has no assigned actual redemption percentage or measured health outcome.

## Reference analysis carried into implementation

- **Teenagers:** followed character continuity through time and the switch from individual to population evidence; returned to Maya at the end. Reviewed by scrolling and opening individual detail.
- **Middle School:** one conversational reveal at a time, selective emphasis, a human-scale ending. Reviewed through its closing section.
- **Yard Sale:** show the concrete transaction before accumulation and population effects; predictable captions. Reviewed with its coin-flip and redistribution controls.
- Live GitHub opener: large centered ≠, scroll-driven change of scale and revelation of the words. Recreated in new CSS and an absolute-position function; no homepage links or header imported.

## Artwork provenance

Two new AI-assisted sprite atlases, 32 drawings in total. CSS uses the actual drawing bounds rather than assuming a perfect generated grid. Text labels and dialogue are HTML, never generated lettering. Per the user's correction, Maya and her child are white in all drawings; the same designs appear in both paths.

Image generation outputs:
- Original character atlas: `exec-735eec3a-4b0a-49d0-9d87-fe6107b34188.png`; superseded before use.
- Updated character atlas: `exec-7aaa3c69-8ef9-4c4b-9f8a-91390aaa9400.png` → `art/maya-atlas.png`.
- New situation atlas: `exec-29c7f2c3-a21d-4a56-92b1-3873ae221067.png` → `art/situations-atlas.png`.

All generated originals are retained under the Codex generated_images task folder. The two public atlases are copies. No historical story illustrations were used as image references.

Character art direction: four-by-four transparent sprite atlas; cream #f8f6f0, charcoal #26312f, slate #557589, clay #c99d86; hand-inked outlines; consistent Maya, dark curly bun, blue shirt, clay trousers; child with curly dark hair. Sixteen poses/objects: mother and newborn seated, mother holding baby, mother with age-one child, mother with age-five child, living room, overhead supermarket, grocery storefront, kitchen, overhead cart with mother and baby, produce bag, phone, documents, calendar, milk/eggs/bread, receipt/card, young child. Follow-up edit explicitly made mother and child white with fair skin in every relevant cell.

Situation prompt: create a companion 4×4 transparent atlas matching the revised cast, with 16 entirely new scenes: crying baby and laundry; mother on phone; paperwork with bassinet; clinic waiting room; stroller walk; comparing cereal boxes; checkout; worried receipt; unpacking groceries; work apron and calendar; calling with toddler playing; first birthday; age-two windowsill gardening; age-three cooking; age-four store trip; fifth birthday. Preserve matching character appearance, no text, numbers, labels or speech bubbles.
