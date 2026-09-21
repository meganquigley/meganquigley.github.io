"""Build the static website for a GitHub Pages project URL."""
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
repo = os.environ.get('GITHUB_REPOSITORY', 'meganquigley/meganquigley.github.io').split('/')[-1]
base = os.environ.get('PAGES_BASE_PATH', '' if repo.endswith('.github.io') else '/' + repo).rstrip('/')
out = ROOT / '_site'
if out.exists():
    shutil.rmtree(out)
shutil.copytree(ROOT / 'dist', out)
# Only quoted root-relative references; leave https URLs and protocol-relative URLs intact.
pattern = re.compile(r'''(["'`(])/((?!/)[A-Za-z0-9_][^\s"'`<>)]*|(?=["'`]))''')
for path in out.rglob('*'):
    if path.suffix in {'.html', '.css', '.js', '.json'}:
        text = path.read_text()
        text = pattern.sub(lambda m: m[1] + base + '/' + m[2], text)
        path.write_text(text)
(out / '.nojekyll').touch()
print(f'Built {len(list(out.rglob("*")))} entries for {base or "/"}')
