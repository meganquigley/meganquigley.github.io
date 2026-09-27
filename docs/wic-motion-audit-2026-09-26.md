# WIC motion review — September 26, 2026

## References inspected

This is a focused comparison, not an exhaustive audit of The Pudding's archive. I navigated and scrolled the live pages below, compared successive visual states, and inspected rendered sticky positioning on the first two.

| Reference | Observed behavior | Application to WIC |
| --- | --- | --- |
| [30 Minutes with a Stranger](https://pudding.cool/2025/06/hello-stranger/) | The two participants remain a stable reference as explanatory prose passes above them. A conversation clock and changing dialogue provide narrative progression. The rendered visual container uses native sticky positioning. | Keep the illustrated environment still while actual captions move. Reuse identical artwork across successive lines instead of hiding and remounting it. Do not add a generic progress bar. |
| [Sizing Chaos](https://pudding.cool/2026/02/womens-sizing/) | Successive explanatory cards accompany a stable measurement axis and changing population. The shift from one person to a distribution is meaningful; the surrounding scene does not drift simply to indicate scrolling. Several rendered containers use native sticky positioning. | Reserve camera motion for the individual-to-population reveal. Give the crowd the full viewport rather than a small inset chart. |
| [A Journey Through Infertility](https://pudding.cool/2026/03/ivf/) | The illustrated opening leads to a perspective choice and explicit previous/next controls. Scrolling is not its universal pacing mechanism. | Preserve the full-screen illustrated opening, but do not import this story's tap-through interaction into a scroll-driven WIC narrative. |

The Pudding's [sticky positioning tutorial](https://pudding.cool/process/scrollytelling-sticky/) separately recommends letting CSS handle graphic positioning and treating narrative step detection as a different job. Its [storytelling guide](https://pudding.cool/process/how-to-make-dope-shit-part-3/) treats persistent graphics as one option among several, rather than a mandatory template.

## Diagnosis and changes

- The original full-scene crossfade could remain halfway blended for as long as the reader paused. The first attempted repair substituted an accelerated whole-panel slide, which still made the transition itself the focus.
- The revised implementation uses a native sticky illustration inside each scene, with captions in ordinary document flow. Scene entry and exit now follow normal scrolling. Identical pictures persist across text beats; genuinely different pictures use a short time-based dissolve that finishes even when scrolling stops.
- Removed progress-bar styling, arbitrary illustration drift, and idle breathing. The caption is the continuous scroll feedback; maps, shopping routes, the conveyor, and population zoom move when the story calls for it.
- Restored the full-bleed hero image. A responsive cream gradient protects the text without placing the image in a separate card.
- Receipt rows are absent until their item reaches the center scanner. The same crossing threshold controls both totals and row visibility, including reverse scrolling.
- The crowd fills the viewport and reflows its 100 figures to the available aspect ratio. The final zoom preserves all 100 marks. The closing illustration is centered with a narrower caption measure.

## Verification

The renderer tests cover all 63 narrative steps, every scene's forward and reverse jumps, reduced motion, scanner crossing thresholds, receipt row visibility, totals, sources, and CSS syntax. Browser checks include the full-screen opening, scrolling captions, receipt, crowd, and ending; narrow-screen checks verify the hero copy fits with no horizontal overflow. The Pages build also passes.
