"""Render a cool-blue NYC social card from the project's borough geometry."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'dist/projects/nyc-on-your-time'
SCALE=2
image=Image.new('RGB',(1200*SCALE,630*SCALE),'#d6e9fb')
draw=ImageDraw.Draw(image)
def box(values):return tuple(round(v*SCALE) for v in values)
def font(size):
 f=ImageFont.truetype(str(SITE/'assets/fonts/Inter.ttf'),size*SCALE)
 try:f.set_variation_by_name('Bold')
 except (ValueError,OSError):pass
 return f
# Preserve the site's tilted NYC stamp, clock, and italic serif wordmark.
stamp=Image.new('RGBA',(330*SCALE,132*SCALE));sd=ImageDraw.Draw(stamp)
sd.rounded_rectangle(box((4,4,321,122)),radius=20*SCALE,fill='#244754')
sd.text(box((35,12)),'NYC',font=font(76),fill='#f4fbff')
sd.ellipse(box((240,36,292,88)),outline='#f4fbff',width=4*SCALE)
sd.line([box((266,46)),box((266,63)),box((278,70))],fill='#f4fbff',width=4*SCALE)
stamp=stamp.rotate(2,resample=Image.Resampling.BICUBIC,expand=True)
image.paste(stamp,box((50,51)),stamp)
draw.text(box((408,71)),'on',font=ImageFont.truetype(str(SITE/'assets/fonts/Inter.ttf'),68*SCALE),fill='#1d4353')
serif=ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold Italic.ttf',84*SCALE)
draw.text(box((515,61)),'Your Time',font=serif,fill='#1d4353')
# Keep the same five-borough silhouette and illustrative location dots.
data=json.loads((SITE/'boroughs.js').read_text().removeprefix('window.BOROUGHS=').rstrip(';'))
polygons=[]
for feature in data['features']:
 geom=feature['geometry'];polygons.extend(geom['coordinates'] if geom['type']=='MultiPolygon' else [geom['coordinates']])
coords=[p for poly in polygons for ring in poly for p in ring]
x0=min(p[0] for p in coords);x1=max(p[0] for p in coords);y0=min(p[1] for p in coords);y1=max(p[1] for p in coords)
scale=min(780/((x1-x0)*.76),415/(y1-y0))
def point(p):return ((335+(p[0]-x0)*.76*scale)*SCALE,(606-(p[1]-y0)*scale)*SCALE)
draw.ellipse(box((160,164,1280,1100)),fill='#bed9f0')
for poly in polygons:
 for i,ring in enumerate(poly):
  points=[point(p) for p in ring]
  draw.polygon(points,fill='#f6fbff' if i==0 else '#bed9f0')
  draw.line(points,fill='#83aac4',width=SCALE)
for i,p in enumerate([(-74.13,40.60),(-74.09,40.63),(-73.98,40.67),(-73.94,40.69),(-73.88,40.72),(-73.96,40.73),(-73.98,40.77),(-73.94,40.80),(-73.90,40.85),(-73.86,40.87),(-73.83,40.83),(-73.78,40.71),(-73.85,40.75),(-73.91,40.76)]):
 x,y=point(p);r=10*SCALE;draw.ellipse((x-r,y-r,x+r,y+r),fill=['#259b78','#8173b2','#d27570'][i%3],outline='#f6fbff',width=2*SCALE)
image.resize((1200,630),Image.Resampling.LANCZOS).save(SITE/'og-image-cool-20260927.png')
print('Rendered NYC social card: 1200 × 630')
