"""Original resolution-independent story drawings and immersive environments."""
from pathlib import Path
import json, math
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/case-studies/wic'

def svg(body,box='0 0 320 320',cls=''):
 return f'<svg class="{cls}" viewBox="{box}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">{body}</svg>'
def use(name,x=0,y=0,w=320,h=320):return f'<use href="#v-{name}" x="{x}" y="{y}" width="{w}" height="{h}"/>'
def rect(x,y,w,h,fill,rx=3):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"/>'
INK='#293833';CREAM='#f9f5e9';BLUE='#658695';CLAY='#c79b7e';SKIN='#f4cdb6';HAIR='#4a3b33';GREEN='#819578'

def build_art():
 defs=[]
 def symbol(name,body,view='0 0 320 320'):
  defs.append(f'<symbol id="v-{name}" viewBox="{view}"><g stroke="{INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">{body}</g></symbol>')
 symbol('baby','<path d="M112 168Q81 259 159 285Q230 269 211 181Z" fill="'+CREAM+'"/><path d="M105 205L198 249M113 238L179 275" fill="none"/><ellipse cx="158" cy="158" rx="45" ry="47" fill="'+SKIN+'"/><path d="M119 144Q124 101 162 111Q186 101 200 137Q176 119 148 136Z" fill="'+HAIR+'"/><path d="M134 158q7 7 13 0m22 0q7 7 13 0m-33 21q10 6 19-1" fill="none"/><ellipse cx="132" cy="174" rx="8" ry="4" fill="#e5a593" stroke="none"/>')
 symbol('child','<path d="M120 247l-7 58h32l13-56m22-2 10 58h31l-12-66" fill="'+CLAY+'"/><path d="M106 169Q157 140 210 169l18 74-25 8-6-48v70h-78v-65l-10 45-25-10Z" fill="'+CREAM+'"/><path d="M127 178v44h68v-44m-68 23v63h68v-63" fill="'+CLAY+'"/><circle cx="160" cy="117" r="53" fill="'+SKIN+'"/><path d="M109 112Q91 72 115 62Q126 38 148 52Q170 33 187 52Q214 44 216 75Q229 88 208 119l-6-31-21 2-12-16-23 17-25-6Z" fill="'+HAIR+'"/><path d="M139 123v5m40-5v5m-31 19q12 12 25-2" fill="none"/><path d="M109 305h37m42 0h36" stroke-width="7"/>')
 symbol('maya','<path d="M113 211l-7 89h42l12-74 13 74h42l-12-90" fill="'+CLAY+'"/><path d="M111 301h39m22 0h45" stroke-width="10"/><path d="M98 121Q126 101 157 106Q199 98 223 128l14 99-28 5-17-71 9 70h-98l7-69-15 69-27-9Z" fill="'+BLUE+'"/><path d="M71 219q-7 33 10 33 12 0 15-23m113-2q3 30 18 25 16-5 9-29" fill="'+SKIN+'"/><path d="M139 92v25q19 18 39-1V86" fill="'+SKIN+'"/><circle cx="151" cy="23" r="21" fill="'+HAIR+'"/><path d="M108 55Q98 29 128 20Q165 8 191 34l9 33-88 25Z" fill="'+HAIR+'"/><path d="M116 51q-7 63 41 63 45-4 42-52l-12-22-16 11-15-15-16 20Z" fill="'+SKIN+'"/><path d="M129 67l10 1m28-2 11-3m-44 13v3m38-5v3m-22 10 6 2m-14 9q12 8 24-3" fill="none"/><path d="M111 47q-2 24 5 34l11-30 12 3 6-16 21 9 14-16 19 23q-1-23-27-30l-35 3Z" fill="'+HAIR+'"/><ellipse cx="130" cy="89" rx="7" ry="4" fill="#dfa895" stroke="none"/>')
 symbol('mother-baby',use('maya',25,5,270,310)+f'<path d="M89 159q36 45 100 41l21 22q-84 7-135-43Z" fill="{SKIN}"/>'+use('baby',114,69,144,168))
 symbol('family',use('maya',-5,0,240,310)+use('child',173,133,134,175))
 symbol('room',rect(10,13,300,285,'#e5dcc6',0)+rect(175,37,99,137,'#a8c4ca',2)+'<path d="M224 38v135m-48-68h98" stroke="'+CREAM+'" stroke-width="8"/>'+rect(20,220,270,71,'#b08c6e')+'<path d="M20 246h270m-245 0v44m85-44v44m105-44v44" stroke="#987256"/>'+rect(42,163,113,92,BLUE,25)+rect(29,188,24,71,BLUE,10)+rect(143,189,23,71,BLUE,10)+'<path d="M196 194h69l-17-73h-34Z" fill="'+CREAM+'"/><path d="M230 193v62m-18 0h37"/><path d="M31 123q-21-30 4-37 27 9 1 45m0-12q30-21 30 3-4 27-29 13" fill="'+GREEN+'"/>'+rect(20,139,34,42,CLAY,4))
 symbol('phone',rect(79,8,164,299,INK,24)+rect(89,22,144,269,CREAM,17)+rect(136,23,51,10,INK,5)+'<circle cx="161" cy="301" r="3" fill="'+CREAM+'"/>')
 symbol('documents',rect(45,28,213,263,CREAM,5)+rect(60,15,211,259,'#fffaf0',4)+'<path d="M87 70h140m-140 22h140m-140 22h110m-110 32h140m-140 22h140m-140 22h93" stroke="#9caa9e"/>'+rect(107,204,186,99,BLUE,9)+'<circle cx="148" cy="239" r="17" fill="'+SKIN+'"/><path d="M124 277q0-34 24-30 27-5 28 30Z" fill="'+CREAM+'"/><path d="M192 232h73m-73 16h58m-58 17h69" stroke="'+CREAM+'"/>')
 symbol('calendar',rect(31,34,257,256,CREAM,10)+rect(31,34,257,57,BLUE,10)+'<path d="M80 20v33m53-33v33m53-33v33m53-33v33" stroke-width="10"/>'+''.join(f'<path d="M{x} 111v147" stroke="#c4cbbb"/>' for x in [79,127,175,223])+''.join(f'<path d="M49 {y}h220" stroke="#c4cbbb"/>' for y in [111,160,209,258])+'<circle cx="198" cy="185" r="29" fill="none" stroke="#a45f48" stroke-width="5"/>')
 symbol('eggs',rect(20,124,282,139,'#c4bea5',12)+''.join(f'<ellipse cx="{x}" cy="{y}" rx="22" ry="28" fill="#f9eed3"/>' for y in [160,220] for x in [51,94,137,180,223,266])+'<path d="M22 185h278" stroke="#a29f8b"/>')
 symbol('bananas','<path d="M77 59q6 161 186 158-103 86-175-1-59-70-20-139Z" fill="#e6c761"/><path d="M85 61q38 142 195 100-65 99-153 45-66-48-54-129Z" fill="#ecd576"/><path d="M86 69q89 100 205 30-27 99-119 81-80-23-96-95Z" fill="#e9cf6b"/><path d="M70 78l-4-26 22-4 6 22Z" fill="'+HAIR+'"/>')
 symbol('carrots','<path d="M70 49l-29 226q52 41 241-3L261 49Z" fill="#d6e2cd"/>'+''.join(f'<g transform="translate({x} {y}) rotate({r})"><path d="M0 0q35-12 29 11L5 108Q-8 92 0 0Z" fill="#d88a50"/><path d="M6 1L-8-24m19 26 6-32m1 34 23-22" stroke="#687e50" stroke-width="6"/></g>' for x,y,r in [(90,110,-12),(145,98,8),(202,100,17)])+rect(73,42,190,36,BLUE,0))
 symbol('peanut',rect(72,67,180,224,'#aa7950',23)+rect(68,35,188,52,BLUE,7)+rect(74,124,176,111,CREAM,0)+'<path d="M140 151q-30 3-29 25 1 14 22 17-5 26 17 28 33-3 27-31 31-9 17-30-20-25-42-8Z" fill="'+CLAY+'"/>')
 symbol('rice','<path d="M68 35h183l-5 48 20 204H49L73 83Z" fill="'+CREAM+'"/>'+rect(69,35,181,27,BLUE,0)+rect(62,114,191,106,BLUE,0)+''.join(f'<ellipse cx="{x}" cy="{y}" rx="3" ry="8" transform="rotate(25 {x} {y})" fill="#d8c7a3" stroke="none"/>' for x,y in [(100,241),(131,260),(181,244),(224,265),(170,275),(91,271)])+'<path d="M97 149h119m-96 25h72" stroke="'+CREAM+'" stroke-width="7"/>')
 symbol('milk','<path d="M95 57l30-30h86l20 38v226H72V78Z" fill="'+CREAM+'"/>'+rect(98,43,40,17,BLUE,3)+rect(73,148,157,106,BLUE,0)+'<path d="M187 43h28v67h-28Z" fill="none"/><path d="M92 179q33-26 65 0 34 25 56 0" fill="none" stroke="'+CREAM+'" stroke-width="10"/>')
 symbol('groceries',use('carrots',-18,-12,190,230)+use('bananas',126,10,170,220)+'<path d="M44 151h232l-16 156H62Z" fill="'+CLAY+'"/><path d="M90 154q-2-58 31-60h78q29 3 26 60" fill="none" stroke-width="8"/>')
 symbol('cart','<path d="M74 77h190l-22 126H103Z" fill="#ecede5"/>'+''.join(f'<path d="M{x} 90l8 99" stroke="#81908d"/>' for x in [104,135,166,197,228])+'<path d="M78 115h178m-171 35h164m-157 31h152M69 77L54 44H21m81 160-8 30h153" fill="none"/><circle cx="121" cy="257" r="18" fill="'+INK+'"/><circle cx="226" cy="257" r="18" fill="'+INK+'"/>'+use('baby',106,43,104,120))
 symbol('storefront',rect(19,54,282,244,CLAY,3)+rect(41,131,84,143,'#c8dcd8',0)+rect(193,131,85,143,'#c8dcd8',0)+rect(131,129,57,168,CREAM,0)+''.join(f'<path d="M{x} 70h35l13 62h-39Z" fill="{BLUE if i%2==0 else CREAM}"/>' for i,x in enumerate(range(20,287,35)))+'<path d="M155 150v110m21-44v20"/>'+rect(13,56,293,26,INK,2))
 symbol('receipt',rect(71,22,179,277,CREAM,0)+''.join(f'<path d="M91 {y}h139" stroke="#94a099"/>' for y in range(58,260,24)))
 symbol('kitchen',rect(15,20,288,269,'#e4dbc4',0)+rect(28,36,113,102,GREEN,4)+rect(162,36,122,102,GREEN,4)+rect(17,196,286,101,BLUE,0)+'<path d="M20 189h279m-201 21v85m131-85v85m-168-68h18m133 0h16M84 37v100m143-100v100"/><path d="M166 174q-5-47 30-43 21 4 17 31" fill="none"/>'+use('bananas',208,131,80,70))
 symbol('birthday',rect(24,226,276,70,CLAY,12)+'<path d="M53 213q92-43 210 0v47H53Z" fill="'+CREAM+'"/><path d="M53 227q17 27 33 0 16 25 33 0 16 24 33 0 17 23 35 0 16 25 32 0 21 23 44 0" fill="none"/>'+''.join(f'<path d="M{x} 210v-34" stroke="{BLUE}" stroke-width="6"/><ellipse cx="{x}" cy="166" rx="4" ry="9" fill="#e4b562" stroke="none"/>' for x in [110,137,164,191,218])+'<ellipse cx="53" cy="72" rx="29" ry="37" fill="'+BLUE+'"/><path d="M53 111l15 104" fill="none"/><ellipse cx="269" cy="48" rx="26" ry="34" fill="'+CLAY+'"/><path d="M269 82l-20 134" fill="none"/>')
 # Legacy indices refer only to these newly drawn SVG scenes.
 names=['mother-baby','mother-baby','family','family','room','storefront','storefront','kitchen','cart','groceries','phone','documents','calendar','milk','receipt','child']
 for i,name in enumerate(names):symbol(str(i),use(name))
 for i in range(16):
  backdrop='room' if i in [0,1,2,3,10] else 'kitchen' if i in [8,9,12,13] else 'storefront' if i in [4,5,6,7,14] else 'birthday'
  body=f'<g opacity=".5">{use(backdrop)}</g>'
  body+=use('mother-baby' if i<8 else 'family',30,20,260,280)
  if i in [1,10]:body+=use('phone',183,87,70,90)
  if i==2:body+=rect(13,238,284,60,CLAY)+use('documents',128,167,135,128)
  if i in [5,6]:body+=use('cart',157,137,161,173)
  if i==7:body+=use('receipt',190,120,106,150)
  if i==8:body+=use('groceries',5,193,112,126)
  if i==9:body+=use('calendar',210,23,100,120)
  if i in [11,15]:body+=use('birthday',30,118,270,190)
  symbol('s'+str(i),body)
 (OUT/'art/story-vectors.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"><defs>'+''.join(defs)+'</defs></svg>')

def external(name,cls='',label=''):
 return f'<svg class="vector {cls}" viewBox="0 0 320 320" aria-hidden="true"><use href="art/story-vectors.svg#v-{name}"/></svg>'

def store_environment():
 # A single persistent store floor. Two travelers occupy the same geographical space.
 shelves=''
 colors=['#c9ac78','#a3b48e','#bd8266','#e3cf97','#8da4a8']
 for col,(x,name) in enumerate([(170,'DAIRY'),(405,'GRAINS'),(640,'PANTRY'),(875,'PRODUCE')]):
  shelves+=f'<g class="aisle aisle-{col}"><rect x="{x}" y="105" width="120" height="390" rx="7" fill="#a49982" stroke="#38473d" stroke-width="3"/>'
  for row in range(12):
   for k in range(3):
    shelves+=rect(x+8+k*35,116+row*30,28,22,colors[(row+k+col)%5],2)
  for row in range(5):
   food=['milk','rice','peanut','carrots'][col]
   shelves+=f'<use href="art/story-vectors.svg#v-{food}" x="{x+25}" y="{116+row*72}" width="72" height="65"/>'
  shelves+=f'<text x="{x+60}" y="84" text-anchor="middle">{name}</text></g>'
 body='<svg viewBox="0 0 1200 620" class="store-floor" preserveAspectRatio="none" role="img" aria-label="Overhead grocery store with two shopping routes"><defs><pattern id="tile" width="45" height="45" patternUnits="userSpaceOnUse"><path d="M45 0H0V45" fill="none" stroke="#c8c4ad"/></pattern></defs><rect width="1200" height="620" fill="#e4dfc7"/><rect width="1200" height="620" fill="url(#tile)"/>'+shelves
 body+='<path class="shopping-path left-route" d="M550 570 L340 570 L340 40 L1070 40 L1070 550 L630 550"/><path class="shopping-path right-route" d="M550 570 L110 570 L110 50 L335 50 L335 525 L575 525 L575 50 L820 50 L820 535 L335 535 L335 50 L1070 50 L1070 570 L630 570"/>'
 for x in [465,610,755]:body+=rect(x,547,70,44,'#69837b',3)+rect(x+36,547,20,17,INK,2)
 body+='<text x="580" y="608" text-anchor="middle">CHECKOUT</text></svg>'
 return '<div class="immersive-stage store-environment"><div class="store-camera">'+body+'<div class="shopper shopper-left">'+external('mother-baby','shopper-person')+external('cart')+'<b>Without WIC</b></div><div class="shopper shopper-right">'+external('mother-baby','shopper-person')+external('cart')+'<b>With WIC</b></div></div><div class="shelf-callout"><span>CHECK THE SIZE</span><strong>18 eggs?</strong><p>My benefit is for a dozen.</p></div><div class="environment-legend"><span>Without WIC</span><span>With WIC</span></div><div class="shopping-list"><span>MY WIC LIST</span><p>Eggs <b>1 dozen</b></p><p>Peanut butter <b>16 oz</b></p><p>Produce <b>$52.00</b></p></div></div>'

def checkout_environment(items):
 products=''.join(f'<div class="belt-item" data-item="{j}">{external(i["icon"])}<span>{i["label"]}</span><b>${i["cents"]/100:.2f}</b></div>' for j,i in enumerate(items))
 rows=''.join(f'<div class="receipt-row" data-row="{j}"><span>{i["label"]}<small>{i["quantity"]}</small></span><b>${i["cents"]/100:.2f}</b><em>{"WIC" if i["covered"] else "MY MONEY"}</em></div>' for j,i in enumerate(items))
 return '<div class="immersive-stage checkout-environment"><div class="checkout-machine"><div class="scanner-display"><span>READY TO SCAN</span><strong>$0.00</strong><small>Scroll to move the belt</small></div><div class="scanner-window"><i></i></div></div><div class="conveyor"><div class="belt-texture"></div>'+products+'</div><div class="live-receipt"><h3>THE GROCERY BILL</h3><p class="receipt-subtitle">One basket. Two ways to pay.</p>'+rows+'<div class="receipt-total"><span>Food total</span><b data-total>$7.74</b></div><div class="payment-comparison"><div><span>Without WIC<br>My money</span><strong data-without>$7.74</strong></div><div><span>With WIC<br>My money</span><strong data-own>$1.77</strong></div></div><p class="covered-total">WIC covers <b data-covered>$5.97</b></p></div><p class="price-credit">Walmart online prices · September 2026</p></div>'

if __name__=='__main__':build_art()

def map_environment():
 import heapq
 features=[]
 for file in ['albany-roads.geojson','albany-main-roads.geojson']:
  features+=json.loads((ROOT/'research/wic-rebuild/immersive'/file).read_text())['features']
 def point(c):return ((c[0]+73.807)/.057*1200,(42.679-c[1])/.038*760)
 def line(coords):return 'M'+' L'.join(f'{point(c)[0]:.2f},{point(c)[1]:.2f}' for c in coords)
 roads=[];graph={}
 for f in features:
  coords=f['geometry']['coordinates']
  parts=coords if f['geometry']['type']=='MultiLineString' else [coords]
  for part in parts:
   roads.append('<path d="'+line(part)+'"/>')
   for a,b in zip(part,part[1:]):
    a,b=tuple(round(n,6) for n in a),tuple(round(n,6) for n in b)
    w=math.hypot((a[0]-b[0])*.74,a[1]-b[1]);graph.setdefault(a,[]).append((b,w));graph.setdefault(b,[]).append((a,w))
 def nearest(c):return min(graph,key=lambda p:math.hypot(p[0]-c[0],p[1]-c[1]))
 start=nearest((-73.771,42.6538));end=nearest((-73.795,42.6661))
 todo=[(0,start)];dist={start:0};prev={}
 while todo:
  d,a=heapq.heappop(todo)
  if a==end:break
  if d>dist[a]:continue
  for b,w in graph[a]:
   if d+w<dist.get(b,999):dist[b]=d+w;prev[b]=a;heapq.heappush(todo,(d+w,b))
 route=[end]
 while route[-1]!=start:route.append(prev[route[-1]])
 route.reverse();short=route[:max(2,len(route)//6)]
 (OUT/'map-routes.json').write_text(json.dumps({'source':'US Census TIGERweb Transportation, layers 8 and 6','retrieved':'2026-09-24','with_wic':route,'without_wic':short,'method':'Shortest path on extracted road vertices; narrative origin and store endpoints, not a reported household trip.'},indent=2))
 markers=''
 for label,c,cls in [('Home',start,'home-pin'),('Nearby store',short[-1],'near-pin'),('WIC store',end,'wic-pin')]:
  x,y=point(c);markers+=f'<g class="map-pin {cls}" transform="translate({x} {y})"><circle r="11"/><rect x="15" y="-18" width="145" height="35" rx="6"/><text x="26" y="6">{label}</text></g>'
 return '<div class="immersive-stage map-environment"><div class="map-title"><span>ALBANY, NEW YORK</span><strong>Same neighborhood.<br>A different trip.</strong></div><svg class="real-map" viewBox="0 0 1200 760" role="img" aria-label="Albany street map showing a short nearby trip and a longer trip to use WIC"><rect width="1200" height="760" fill="#e4e8dd"/><g class="street-casing">'+''.join(roads)+'</g><g class="street-lines">'+''.join(roads)+'</g><path class="map-route map-route-left" d="'+line(short)+'"/><path class="map-route map-route-right" d="'+line(route)+'"/>'+markers+'<g class="map-traveler-left"><circle r="14"/><text y="5" text-anchor="middle">M</text></g><g class="map-traveler-right"><circle r="14"/><text y="5" text-anchor="middle">M</text></g></svg><div class="environment-legend"><span>Without WIC</span><span>With WIC</span></div><p class="map-attribution">Street geometry: U.S. Census Bureau · TIGERweb</p></div>'
