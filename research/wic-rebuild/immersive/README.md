# Immersive revision — September 24, 2026

Three persistent environments replace the map/store/checkout panel sequence. The map draws actual Albany streets; the camera follows a grocery-store route; the checkout scans five products and derives receipt totals from integer cents. Every position is derived from absolute scroll progress, including reverse movement. Short viewports retain sticky scenes. The previous max-height:560px fallback had made the story static in the in-app browser.

## Geography

U.S. Census TIGERweb Transportation MapServer layers 8 (Local Roads) and 6 (Secondary Roads), retrieved September 24, 2026. Query envelope: -73.82,42.64,-73.75,42.68, EPSG:4326. GeoJSON includes 858 local-road and 40 secondary-road features. Endpoint proximity and shortest paths through connected rounded-six-decimal street vertices are calculated in scripts/wic_vectors.py. Generated route coordinates are in dist/case-studies/wic/map-routes.json. Home and generic stores are narrative endpoints, not a reported household or verified retailer; no mileage, travel time, or retailer identity is asserted. This distinction is in the footer instead of interrupting the scene.

## Checkout

Product source URLs, quantities, prices, retrieval date, and NY food rules are in dist/case-studies/wic/basket.json. Walmart public online listing snapshots: standard Great Value eggs (12) $1.67; bananas 2 lb at $0.50/lb $1.00; baby carrots (1 lb) $1.32; Great Value creamy peanut butter (16 oz) $1.98; Great Value white rice (32 oz) $1.77. Total 774 cents; WIC category-eligible foods 597 cents; white rice paid separately 177 cents. The scene assumes sufficient matching benefits and an authorized retailer. These are not a quoted Albany-store order or independent SKU scanner approval. The narrative explains the white-rice/whole-grain distinction. Footer links document price and eligibility basis.

## Artwork and editorial treatment

Original SVG symbols replace raster sprite-sheet rendering. All character, room, food, map, and store marks remain sharp at different sizes. AGENTS.md records the requested rule: keep production disclaimers out of dialogue and captions, make the claims accurate in their own wording, and retain necessary methods in small endnotes. Other project pages, production branch, and publishing infrastructure are unchanged.

## Verification

- Browser: all 12 scene starts checked at 1440x900, 375x667, and 836x470 CSS viewports: captions inside viewport and no horizontal overflow.
- Additional visual review: 390x844 map and checkout; 768x1024 shopping and checkout; full-width desktop characters and checkout.
- Live scrolling: forward and reverse store movement; checkout total rose to $7.74/$5.97/$1.77 and unwound to $3.99; keyboard PageDown; mid-scene reload; large resize; direct scene jumps. No browser console errors observed.
- Short desktop receipt initially exceeded its stage; fixed and verified receipt 265px inside a 314px stage.
- DOM simulation: actual renderer with normal and reduced-motion states, reverse/fast jumps, receipt scan count and integer-cent sums, monthly produce arithmetic, all 55 beats, no raster image elements, 898 road features, narrative disclaimer removal, noindex, source anchors, CSS parse.
- Pages build and existing homepage/housing/health regression checks pass.
- Reduced-motion preference tested through renderer simulation, not an OS preference change. A separate actual browser 200% zoom run was not performed in this revision; compact viewport coverage is recorded above rather than claiming it.
