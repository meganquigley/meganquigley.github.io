"""Build source-linked static WIC geography; browser code only enhances it."""
from pathlib import Path
import csv,json,re
from html import escape
R=Path(__file__).resolve().parents[1];D=R/'dist'
rows=sorted(csv.DictReader((D/'data/state-coverage.csv').open()),key=lambda s:-float(s['rate']))
shapes=json.loads((D/'data/state-shapes.json').read_text())['shapes']
marks=[];labels=[];table=[]
for rank,s in enumerate(rows):
 id=s['id'];g=shapes[id];rate=float(s['rate']);col=rank//26;row=rank%26;tx=col*520+185+rate*2.8;ty=47+row*23
 color=f'hsl(197 32% {88-rate*.48:.1f}%)'
 marks.append(f'<g class="geo-state" data-state="{id}" data-cx="{g["cx"]:.2f}" data-cy="{g["cy"]:.2f}" data-tx="{tx}" data-ty="{ty}" role="button" tabindex="0" aria-pressed="false" aria-label="{escape(s["name"])}: {rate}% participating"><path d="{g["path"]}" fill="{color}"/><circle class="geo-dot" cx="{g["cx"]}" cy="{g["cy"]}" r="70"/><title>{escape(s["name"])}: {rate}%</title></g>')
 labels.append(f'<g><text x="{col*520+10}" y="{ty+4}">{escape(s["name"])}</text><line x1="{col*520+185}" x2="{col*520+465}" y1="{ty}" y2="{ty}"/><text x="{col*520+478}" y="{ty+4}">{rate}%</text></g>')
 table.append(f'<tr><th scope="row">{escape(s["name"])}</th><td><span class="rank-track"><i style="width:{rate}%"></i></span>{rate}%</td><td>{s["low"]}–{s["high"]}%</td></tr>')
html='''<!-- geography:start --><div class="geography-story"><div class="geography-pin"><p class="geo-instruction">Scroll from geography to a ranked comparison.</p><div class="geo-comparison"><div><strong>72.4%</strong><span>California</span><small>95% interval: 71.3–73.6%</small></div><div><strong>41.3%</strong><span>Louisiana</span><small>95% interval: 39.9–42.7%</small></div><p>A 31.1 percentage-point difference.<br>These estimates show variation, not its cause.</p></div><svg class="coverage-map" viewBox="0 0 1040 660" aria-label="WIC coverage map transitioning to ranked state estimates"><g class="geo-chart-labels" aria-hidden="true">'''+''.join(labels)+'''<text x="185" y="18">0% — coverage — 100%</text><text x="705" y="18">0% — coverage — 100%</text></g>'''+''.join(marks)+'''<g class="geo-map-labels" aria-hidden="true"><text x="155" y="290">CA</text><text x="650" y="485">LA</text><text x="820" y="540">Puerto Rico inset</text><text x="915" y="262">DC</text><path d="M915 268 893 273" fill="none" stroke="currentColor"/></g></svg><p class="geo-key">Light to dark: lower to higher share participating. Alaska, Hawaii, and Puerto Rico shown as insets. DC is selectable through the menu.</p></div></div><details class="geography-table"><summary>All estimates and uncertainty intervals</summary><table><caption>All WIC groups · average month 2023 · ranked by estimated coverage</caption><thead><tr><th scope="col">Jurisdiction</th><th scope="col">Participating</th><th scope="col">95% interval</th></tr></thead><tbody>'''+''.join(table)+'''</tbody></table></details><p class="context-line">Coverage = participants ÷ estimated eligible people. <a href="/data/state-coverage.csv" download>Download all estimates · CSV</a> · <a href="https://fns-prod.azureedge.us/sites/default/files/resource-files/wic-eer2023-report.pdf">USDA 2023 estimates</a> · <a href="https://github.com/topojson/us-atlas">Map boundaries</a></p><!-- geography:end -->'''
p=D/'case-studies/wic/index.html';s=p.read_text()
if '<!-- geography:start -->' in s:s=re.sub(r'<!-- geography:start -->.*?<!-- geography:end -->',lambda _:html,s,flags=re.S)
else:s=s.replace('<div id="geography-placeholder"></div>',html)
p.write_text(s)
print('Built 52 geographic marks and ranked estimates.')
