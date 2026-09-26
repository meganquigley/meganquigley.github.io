"""Focused story graphics: national context, measured drive, and diet score."""
from pathlib import Path
import json,csv,math
R=Path(__file__).resolve().parents[1]
def state_map(evidence,focus='NY'):
 shapes=json.loads((R/'dist/data/state-shapes.json').read_text())['shapes']
 ids={x['name']:x['id'] for x in csv.DictReader((R/'dist/data/state-coverage.csv').open())}
 tiles=''
 import re
 for row in evidence['states']:
  ab=ids[row['state']];p=shapes[ab];v=row['eligible_covered_pct']
  nums=list(map(float,re.findall(r'-?\d+(?:\.\d+)?',p['path'])))
  xs=nums[::2];ys=nums[1::2];x=min(xs);y=min(ys);w=max(xs)-x;h=max(ys)-y
  tiles+=f'<button class="state-tile" aria-label="{row["state"]}: {v}% of eligible people participating"><svg viewBox="{x-3} {y-3} {w+6} {h+6}" aria-hidden="true"><path d="{p["path"]}" fill="hsl(195 25% {92-v*.65}%)"/></svg><span>{ab}</span><span class="state-tip">{row["state"]}: {v}%</span></button>'
 return '<div class="national-map"><p class="zoom-label">Across the United States</p><div class="state-grid">'+tiles+'</div><p class="map-key">Eligible people participating · 2023<br>Darker means greater reach · explore a state</p></div>'
def driving_map():
 route=json.loads((R/'research/wic-rebuild/focus-revision/driving-route.json').read_text())['routes'][0]
 coords=route['geometry']['coordinates'];xs=[p[0] for p in coords];ys=[p[1] for p in coords]
 scale=min(650/((max(xs)-min(xs))*.717),440/(max(ys)-min(ys)))
 def point(p):return 170+(p[0]-min(xs))*.717*scale,570-(p[1]-min(ys))*scale
 pts=[point(p) for p in coords];d='M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in pts)
 roads=''
 for feature in json.loads((R/'research/wic-rebuild/focus-revision/rural-roads.json').read_text())['features']:
  geom=feature['geometry'];lines=geom['coordinates'] if geom['type']=='MultiLineString' else [geom['coordinates']]
  for line in lines:
   path='M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in map(point,line))
   roads+=f'<path d="{path}" fill="none" stroke="#fdfaf1" stroke-width="4"/>'
 a,z=pts[0],pts[-1]
 marks=''.join(f'<g transform="translate({x:.1f} {y:.1f})"><circle r="11" fill="#263b38"/><text x="{22 if i==0 else 0}" y="{5 if i==0 else -24}" text-anchor="{ "start" if i==0 else "middle"}">{name}</text></g>' for i,((x,y),name) in enumerate([(a,'Keene Valley'),(z,'Price Chopper · Lake Placid')]))
 return '<div class="immersive-stage map-environment rural-map"><p class="route-kicker">A rural New York grocery trip</p><svg class="real-map" viewBox="0 0 1000 700" role="img" aria-label="Actual road route from Keene Valley to Price Chopper in Lake Placid, 21.5 miles one way"><rect width="1000" height="700" fill="#dee4d3"/><path d="M0 420Q180 170 370 330T760 150T1000 300V700H0Z" fill="#c8d3ba" opacity=".5"/>'+roads+'<path d="'+d+'" fill="none" stroke="#fffaf0" stroke-width="19"/><path class="map-route map-route-right" d="'+d+'"/>'+marks+'<g class="map-traveler-right"><circle r="13"/><text y="5" text-anchor="middle">M</text></g></svg><div class="drive-distance"><strong>21.5 miles</strong><span>one way · by road</span></div></div>'
def diet_plate(step):
 ticks=''
 for i in range(100):
  a=(i*3.6-90)*math.pi/180;x=160+124*math.cos(a);y=160+124*math.sin(a)
  ticks+=f'<circle cx="{x:.2f}" cy="{y:.2f}" r="3.2" fill="#b7c1b0"/>'
 arc='<circle cx="160" cy="160" r="124" fill="none" stroke="#aa6047" stroke-width="9" pathLength="100" stroke-dasharray="3.6 96.4" transform="rotate(-90 160 160)"/>' if step>0 else ''
 middle='<text x="160" y="152" text-anchor="middle" class="plate-number">'+('100' if step==0 else '+3.6')+'</text><text x="160" y="185" text-anchor="middle">'+('possible points' if step==0 else 'points out of 100')+'</text>'
 if step==0: middle=''.join(f'<use href="art/story-vectors.svg?v=focus2#v-{name}" x="{x}" y="{y}" width="85" height="85"/>' for name,x,y in [('apples',75,68),('carrots',162,68),('rice',75,160),('milk',162,160)])
 return '<div class="diet-plate"><p class="chart-label">The Healthy Eating Index</p><svg viewBox="0 0 320 320" role="img" aria-label="'+('Diet quality is scored on a 100-point scale' if step==0 else 'The adjusted diet-quality difference was 3.6 points on a 100-point scale')+'"><circle cx="160" cy="160" r="145" fill="#fbf8ed" stroke="#6e8779" stroke-width="2"/><circle cx="160" cy="160" r="107" fill="none" stroke="#d3dcc9"/>'+ticks+arc+middle+'</svg><p class="plate-label">'+('100 possible points for the whole pattern of eating.' if step==0 else 'Continued into year 3<br>compared with WIC in year 1 only')+'</p></div>'
