# Verification record — 24 September 2026

## Passed

- Rebuilt 12 scenes and 52 complete states; all first-person captions have speaker/path labels. All narrative scenes retain two paths; research states retain two character anchors.
- Original 32-drawing artwork, updated per the user's requested appearance. Checked CSS drawing bounds and corrected adjacent-cell bleed.
- Actual browser layouts reviewed at CSS widths 1440, 768, 390, and 375. Viewport overrides were compensated for the host browser's 1.53 display scale and checked against `innerWidth`.
- Every scene inspected at desktop and tablet sizes; all scenes and key internal beats inspected on phones. Additional DOM geometry checks covered every frame's chart/caption boundaries and horizontal overflow.
- Fixed phone caption spacing and benefit-chart collisions found during this review; repeated bounds checks after fixes.
- Keyboard PageDown and PageUp advance and reverse the story. A reload at the second grocery beat preserved both active beat and caption. Direct jumps among early and late scenes render complete states.
- Scroll-driven logo reveal visually checked; no top links, linked logo, navigation, or reading-mode switch.
- Absolute-position state and actual DOM renderer tested with normal and reduced-motion media mocks. Reduced mode places route travelers and monthly-benefit illustrations at their complete state without continuous movement.
- A 720×450 CSS viewport tested the layout equivalent of 200% zoom on a 1440×900 viewport. All frames remain readable in normal flow at this height, without horizontal overflow or hidden/inert story frames.
- No browser console errors observed.
- Fresh state join reproduces Pearson r = −0.47440143; produce arithmetic ends at $1,872; redemption calculation reproduces 30.4% of certification periods, not dollars.
- `tests/wic-story.cjs`: arithmetic, absolute state, forwards/backwards/jumps, actual DOM renderer with reduced-motion mocks, 50-state join, semantic captions, source targets, noindex, scoped entry points, CSS syntax.
- `tests/scrollytelling.cjs`: existing homepage, housing, and health regression checks pass. Obsolete WIC implementation assertions replaced by new WIC-specific checks.
- Existing Pages build passes. Other project pages and publishing workflow unchanged. Only `new-direction` is the delivery target.

## Scope of device checks

Browser verification used viewport emulation, not physical phones/tablets. OS-level reduced-motion was not toggled; its rendering logic and CSS rule were checked through controlled tests. Native browser zoom shortcuts did not alter the embedded browser zoom, so the equivalent CSS viewport was used for the 200% layout check. These checks are not a claim of assistive-technology certification.
