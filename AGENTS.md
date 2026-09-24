# Portfolio site

This is the website checkout for the Career project. Public website files are in `dist/`.

## Automatic version saving — user preference

Whenever the user requests changes to this website, complete the change, run appropriate checks, then save a descriptive Git commit and push it to the configured GitHub repository. This is standing authorization; do not ask again or announce routine version saving. Report a failure if the version could not be saved remotely. Never claim a remote save without verifying its commit.

Use the configured GitHub remote and its main branch. If Git authentication is unavailable, use the connected GitHub tools, taking care to preserve the latest remote tree and concurrent changes. Do not force-push, overwrite unrelated edits, or expose credentials. Do not upload the parent Career project, synced sources, personal reference files, or hosting credentials.

GitHub Pages publishes each successful push to main through `.github/workflows/pages.yml`. Run `python3 scripts/build-pages.py` to check project-relative URLs before publishing. Keep generated `_site/` out of commits. Preserve all secondary routes, data downloads, legacy fragments, accessibility modes, and source notes.

The user has requested GitHub hosting. Do not republish to the old Sites host unless explicitly asked. The initial migration is not complete until repository and Pages URLs have been verified and recorded in README.md.

## Search visibility

Keep every HTML page marked `noindex, nofollow, noarchive` for robots and Googlebot until the user explicitly asks to allow indexing. Keep robots.txt crawlable so search engines can see these directives. Public access is authorized; search indexing is not. Do not add a sitemap or remove noindex during edits.

Repository: `meganquigley/meganquigley.github.io`, branch `main`. Live site: https://meganquigley.github.io/. Use the connected GitHub tools for writes if local Git has no credentials.

## WIC narrative voice

Keep production and methodology disclaimers out of the story's dialogue and captions. They interrupt the scene, explain the authoring process, and make the reader feel outside the experience. Do not label scenes or dialogue “illustrative,” or repeatedly explain what an image or statistic does not represent. Write each claim accurately on its own; put necessary assumptions, study limitations, fictional-character context, and price provenance in compact sources and methodology at the end. Preserve a clear distinction between Maya's story and research findings through wording and visual structure.
