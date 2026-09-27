# Focus and stability revision — September 25, 2026

## Reading layout

Scene artwork has a fixed viewport-based box. Caption text no longer participates in its sizing. Shared narration overlays the paired illustrations after a short scroll-driven reveal; path-specific narration uses a speech bubble by that path. The other path has 50% opacity. Chapter counters, overlines, visible scene headings, speaker tags, and progress ticks are removed. Semantic headings remain for navigation. The first scene uses identical artwork across all three beats. Per-beat illustration translations/rotations are removed, so a new caption cannot reset them. Phones use full-width bubbles whose tails identify the active side.

Source links say “See details” and open a native modal. Escape and Close restore focus without changing scroll position. The correlation scene and its footer note are removed. The national evidence uses the requested geographic state-dot approach, joining the existing Census-derived centroid positions to the newly transcribed coverage data. Diet quality now introduces the overall food pattern and the 100-point scale on a dinner plate before revealing the adjusted 3.6-point association. The ending slows down and returns to one centered family and centered text.

The holding pose has two connected bent arms, replacing the extra floating arm and underlying dangling hands. The first birthday has one candle. A new final month-ending beat explicitly leads into that birthday and the renewal deadline.

## Larger basket

Eleven line items, $64.08 total, $23.97 WIC-covered under the package assumptions, and $40.11 paid by Maya. The alternate path pays $64.08. It is a stock-up for the coming couple of weeks with pantry foods at home, not a claim that these foods form a complete two-week diet. Each line's units, unit cents, extended cents, rule, and public Walmart source URL are in basket.json. New prices were checked September 25; earlier egg, banana, carrot, peanut-butter, and rice prices retain the September 24 evidence. The receipt keeps fixed dimensions and rolls scanned rows through a fixed window. The current item gets emphasis. A second scanner price display and duplicate payment panels are removed.

## Measured drive

Raw OSRM response: driving-route.json. Public endpoint coordinates: Keene Valley (-73.7865,44.1895) to Price Chopper at 1930 Saranac Avenue (-74.0109175,44.2941736). Store coordinates verified in the store's own structured data at https://www.pricechopper.com/stores/ny/lakeplacid/price-chopper-180.html. Chain WIC payment policy: https://www.pricechopper.com/benefit-card/. Routing endpoint: https://routing.openstreetmap.de/routed-car/route/v1/driving/-73.7865,44.1895;-74.0109175,44.2941736?overview=full&geometries=geojson . Retrieved September 25, 2026. Distance 34,558.1 metres / 1,609.344 = 21.4734 miles, rounded to 21.5 one way. The route is a selected rural example, not a claim that this store is the nearest authorized retailer or that Maya is a reported household. The background terrain is decorative; the road trace is routed geometry. The source modal explains the distinction and credits OpenStreetMap contributors. The separate USDA retailer-access finding now visibly defines “without convenient access” as farther than one mile urban or ten miles rural.

## Verification

- Live browser audit reached all 57 beats at 375x667 and 1440x900 CSS viewport sizes; no caption overflow or horizontal overflow found.
- Audit of all 57 beats at native 836x470 found five long-caption cases. Fixed the compact layout and rechecked all beats in the five affected scenes; no remaining overflow.
- Visually checked the holding pose, shared overlay, path bubble, renewal documents, national map, route, conveyor/receipt, diet plate, centered opening, and final centered scene.
- Opening mark center measured within 0.4 CSS pixels of viewport center, with dimensions bounded by viewport height to preserve cue clearance.
- Source modal opened in place; Escape preserved scrollY exactly and restored focus to “See details”.
- Automated tests exercise forward/reverse/fast-jump state, reduced-motion state, individual price multiplication and final receipt sums, route conversion, 150 state dots across three beats, source labels, removed scatter plot, and absent caption-height measurements.
- Existing homepage/housing/health regression checks and Pages build pass. Browser review used the in-app browser; OS reduced-motion preference was simulated in the renderer test rather than changed globally.
