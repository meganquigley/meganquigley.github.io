# Portfolio site

An illustrated collection about getting and using public benefits. WIC is the first complete case study.

## Website files

Edit `dist/`. The website is static: no backend or personal-data collection.

Run `python3 scripts/build-pages.py` to create `_site/` with links adapted to a GitHub Pages project URL. Set `PAGES_BASE_PATH` to override the default root path. Serve the output at that prefix when previewing locally.

## Publishing and version history

The GitHub Actions workflow publishes `main` to GitHub Pages. Every completed website edit should be committed and pushed automatically, following AGENTS.md. Previous versions remain in Git history; restore an earlier version with a new revert commit, never by rewriting shared history.

Repository: https://github.com/meganquigley/meganquigley.github.io

Website: https://meganquigley.github.io/

Search indexing is disabled through noindex metadata on every page. The public GitHub repository itself can still be discovered; noindex is a search-engine instruction, not access control.
