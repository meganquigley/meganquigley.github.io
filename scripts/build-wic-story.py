"""Build the independently authored WIC narrative. No legacy story imports."""
from pathlib import Path
import json, html
from wic_motion import split_stage, phone, crowd
from wic_focus import state_map, driving_map, diet_plate
from wic_vectors import build_art, external, map_environment, store_environment, checkout_environment
build_art()
R=Path(__file__).resolve().parents[1]; OUT=R/'dist/case-studies/wic'
E=json.loads((OUT/'evidence.json').read_text())
def esc(x): return html.escape(str(x))
def art(i,cls='',atlas='maya'):
 return external(('s' if atlas=='situations' else '')+str(i),'art '+cls)
def situation(i,cls=''): return art(i,'situation '+cls,'situations')
def badge(t): return f'<span class="object-label">{t}</span>'
def pair(left,right,focus='both',labels=('Without WIC','With WIC')):
 return f'<div class="pair"><div class="path left"><span class="path-label"><span aria-hidden="true">✓</span> With WIC</span><div class="world">{right}</div></div><div class="path right"><span class="path-label"><span aria-hidden="true">○</span> Without WIC</span><div class="world">{left}</div></div></div>'
def home(i=0,extra=''): return '<div class="room">'+art(4,'room-bg')+art(i,'person')+extra+'</div>'
def anchors(): return '<div class="anchors"><span>'+art(1)+'Without WIC</span><span>'+art(1)+'With WIC</span></div>'
def research(content):return '<div class="research">'+anchors()+content+'</div>'
def bars(rows,label,unit='%'):
 s=f'<div class="chart" role="img" aria-label="{esc(label + chr(59) + chr(32).join(f"{n}: {v:g}{unit};" for n,v in rows))}"><p class="chart-label">{label}</p><svg viewBox="0 0 660 {len(rows)*57+30}" aria-hidden="true">'
 for j,(n,v) in enumerate(rows):
  y=j*57+22;s+=f'<text x="0" y="{y+17}" class="bar-name">{n}</text><rect class="bar-track" x="167" y="{y}" width="398" height="25" rx="8"/><rect class="bar-fill" x="167" y="{y}" width="{v*3.98}" height="25" rx="8"/><text class="bar-value" x="583" y="{y+19}">{v:g}{unit}</text>'
 return s+'</svg><p class="axis-note">Common scale: 0–100%</p></div>'
def mapview(far=False):
 path='M55 225 L55 130 L150 130 L150 50 L270 50' if far else 'M55 225 L55 170 L120 170'
 return '<div class="map"><svg viewBox="0 0 330 270" role="img" aria-label="Illustrative neighborhood route; no mileage assigned"><path class="streets" d="M0 50H330 M0 130H330 M0 225H330 M55 0V270 M150 0V270 M270 0V270"/><path class="route" d="'+path+'"/><circle cx="55" cy="225" r="8"/><rect class="map-store" x="105" y="155" width="32" height="29"/><rect class="map-store" x="250" y="30" width="38" height="31"/><text x="15" y="257">Home</text><text x="70" y="207">Nearby store</text><text x="178" y="20">WIC store</text></svg>'+art(8,'map-traveler '+('far' if far else 'near'))+'</div>'
def shop(loop=False,step=0):
 return '<div class="shop">'+art(5,'floor')+f'<svg viewBox="0 0 320 320" aria-hidden="true"><path class="cart-route" d="'+('M155 284 L155 70 L200 70 L200 223 L105 223 L105 63 L245 63 L245 263 L158 263' if loop else 'M155 284 L155 70 L245 70 L245 263 L158 263')+'"/></svg>'+art(8,f'cart cart-{step}')+'</div>'
def receipt(wic=False):
 lines=[('Eligible food','WIC'),('Produce allowance','WIC'),('Rejected item','My money'),('Other purchases','My money')] if wic else [('Groceries','My money'),('Produce','My money'),('Other purchases','My money')]
 return '<div class="receipt"><span class="receipt-title">'+('Two ways to pay' if wic else 'One grocery bill')+'</span>'+''.join(f'<p><span>{a}</span><b>{b}</b></p>' for a,b in lines)+'<small>Schematic receipt · no invented prices</small></div>'
def produce(n):
 total=min(n,12)*52+max(n-12,0)*26
 return research(f'<div class="produce" data-months="{n}"><p class="chart-label">Available produce benefits · constant FY2026 rates</p><div class="money"><span>Without WIC<strong>$0</strong></span><span>With WIC<strong>$'+f'{total:,}'+'</strong></span></div><div class="month-grid">'+''.join(f'<i class="month {"filled" if j<n else ""} {"maternal" if j<12 else "child"}" title="Month {j+1}"></i>' for j in range(60))+'</div><div class="legend"><span>12 months × $52 for Maya</span><span>48 months × $26 for her child</span></div><p class="axis-note">Each square is one month. This is availability, not redemption.</p></div>')
scenes=[]
def scene(title,time,beats):scenes.append({'title':title,'time':time,'beats':beats})
def beat(visual,caption,who='Maya · both paths',note='',source=None):return dict(visual=visual,caption=caption,who=who,note=note,source=source)
BASKET=json.loads((OUT/'basket.json').read_text())
total=sum(x['cents'] for x in BASKET['items']);covered=sum(x['cents'] for x in BASKET['items'] if x['covered']);own=total-covered
scene('One text. Two paths.','Finding out',[
 beat('', 'My baby is here. I’m exhausted. And now I have to figure out how to feed us both.'),
 beat('', 'I’d never even heard of it.',source='ny'),
 beat(research(crowd()),'And hearing about WIC is only the first hurdle. Across the country, WIC reaches about 56 of every 100 eligible people.','A wider view',source='coverage'),
 beat(research(crowd()),'The others qualify for help they aren’t receiving.','A wider view',source='coverage'),
 beat(research(state_map(E)),'Finding out, applying, reaching a store, and staying enrolled can all take work. How many people receive help also varies widely by state.','A wider view',source='coverage'),
 beat(research(state_map(E)),'In 2023, WIC reached 79.6% of eligible people in Vermont, 62.4% in New York, and 41.3% in Louisiana.','A wider view',source='coverage'),
 beat('', 'So, let’s follow two versions of my life: one where that text arrives, and one where it never does—same baby, same income, same need for food.')])
scene('Getting through the door','Applying',[
 beat('<div class="single-family">'+situation(2)+'</div>','First, I need to apply. I call the number. Before my appointment, I gather my ID, address, and Medicaid information. Medicaid helps show I meet the income rules. It doesn’t enroll me in WIC.',source='ny'),
 beat('<div class="single-family">'+situation(3)+'</div>','The appointment is by phone. That saves a trip, but I still need a stretch of time when I can talk.',source='ny'),
 beat(pair(home(),home()),'I’m approved. While I’m fully breastfeeding, WIC includes $52 a month for produce, plus other foods. In my other life, I’m still paying for food without that help.',source='rates')])
scene('A place to use the card','The grocery trip',[
 beat('', 'Back in my kitchen, the list is getting longer. Being approved is one thing. Now I need a store where I can use the card.','With WIC · Maya',source='map'),
 beat('', 'This run from Keene Valley to Lake Placid is 21.5 miles each way. Now add the baby, the bags, and getting home again.','With WIC · Maya',source='map'),
 beat('', 'I can shop wherever works for me. But at the register, I’ll have to cover the whole bill.','Without WIC · Maya'),
 beat(research(bars([('Louisiana',56),('United States',40),('Vermont',30),('New York',19)],'Families beyond convenient WIC store access')),'This isn’t just one long drive. Nationally, 40% of low-income families with young children live beyond convenient access to a WIC store.','A wider view',source='access'),
 beat(research(bars([('Louisiana',56),('United States',40),('Vermont',30),('New York',19)],'Families beyond convenient WIC store access')),'For a family in a city, that means going more than a mile. In the countryside, more than ten. Having a card doesn’t make the trip disappear.','A wider view',source='access')])
scene('Inside the store','Shopping',[
 beat('', 'At last, the store. I start with the foods on my WIC list: eggs, milk, peanut butter, fruit, and vegetables.','With WIC · Maya',source='ny'),
 beat('', 'Eggs—but the carton has eighteen. I need dozen-size cartons. Back down the aisle to swap them.','With WIC · Maya'),
 beat('', 'I don’t have that list to follow. I’m checking prices instead, putting things back when the total gets too high.','Without WIC · Maya'),
 beat('', 'Fresh fruit for now. Frozen vegetables for later. Those use my produce dollars; the milk and eggs use separate quantities.','With WIC · Maya',source='ny'),
 beat('', 'The card will help pay for this food. Getting the right things into the cart is still work. Finally, I head to checkout.','With WIC · Maya')])
scene('What the card pays for','Checkout',[
 beat('', 'I’m stocking up on the foods WIC helps me buy. Two dozen eggs, bananas, and carrots go down the belt first.','With WIC · Maya',source='shopping'),
 beat('', 'Then peanut butter and three gallons of milk. The sizes match my benefits this time.','With WIC · Maya'),
 beat('', 'Apples and grapes. I’m buying enough to keep fruit in the kitchen for a while.','With WIC · Maya'),
 beat('', 'Broccoli and spinach for the freezer. Fresh and frozen produce together use $32.62 of my $52 allowance.','With WIC · Maya',source='shopping'),
 beat('', 'The pasta sauce and white rice aren’t covered. I decide to pay for those myself.','With WIC · Maya'),
 beat('', f'For this ${total/100:.2f} shop, WIC pays ${covered/100:.2f}. I pay ${own/100:.2f}. That leaves more of my own money for everything else.','With WIC · Maya',source='shopping'),
 beat('', f'The very same food would cost me ${total/100:.2f} out of pocket. Without WIC, I have to decide what stays in the cart.','Without WIC · Maya')])
scene('The months between trips','Using the help',[
 beat(pair(situation(8),situation(8)),'At home, the groceries are the part that matters. Some months I make the trip and use the help.','With WIC · Maya'),
 beat(pair(situation(8),situation(8)),'My groceries run out, too. But there’s no benefit balance to check—just what’s left in my bank account.','Without WIC · Maya'),
 beat(pair(situation(8),'<div class="expiry">'+art(12)+'<span class="expiry-stamp">MONTH ENDS</span>'+art(9,'fading-food')+'</div>'),'Other months, I still have benefits when they expire. I meant to go back. Then something else happened.','With WIC · Maya',source='ny'),
 beat(research('<div class="redemption"><p class="chart-label">A Southern California study</p><strong class="big-number">30.4%</strong><div class="portion"><span style="width:30.4%"></span></div><p>of certification periods used less than<br>70% of the produce benefit</p></div>'),'The gap between the card and the kitchen shows up in research, too. In this study, substantial produce benefits went unused in about three out of ten certification periods.','A wider view',source='redemption'),
 beat(pair(situation(9),situation(9)),'Another month ends. Then another. In both lives, the next big date on the calendar is his first birthday.')])
scene('A birthday. Another deadline.','Renewing',[
 beat(pair(situation(11),situation(11)),'One candle. A whole year of feeding him. In the life with WIC, another deadline arrives with the birthday.'),
 beat(pair(situation(11),situation(9)),'It’s time to renew. The appointment conflicts with work. I put the reminder aside.','With WIC · Maya'),
 beat(pair(situation(11),'<div class="renewal-desk">'+art(12)+art(11)+'</div>'),'Tomorrow, I remember after the office closes. Then I have to check which documents need updating.','With WIC · Maya'),
 beat(pair(situation(11),situation(9)),'I’m not deciding we don’t need the food. I’m deciding whether I can deal with one more thing today.','With WIC · Maya'),
 beat(pair(situation(11),situation(10)),'This time, I call before the deadline. I find an appointment I can manage. We stay enrolled.')])
scene('Keeping the help','Growing up',[
 beat(pair(situation(12),situation(12)),'He’s two. His appetite is growing. So are the grocery lists.'),
 beat(pair(situation(13),situation(13)),'He’s three. I know which foods work for us. But keeping WIC still means keeping up with appointments.','With WIC · Maya'),
 beat(pair(situation(14),situation(14)),'He’s four. His need for food hasn’t expired with the paperwork.'),
 beat(research('<div class="cohort"><p class="chart-label">Children enrolled in 2013 · followed through 54 months</p><strong class="big-number">43.5%</strong><div class="portion"><span style="width:43.5%"></span></div><p>participated consistently</p></div>'),'I’ve kept coming back. How many families manage that? Researchers followed children who enrolled in 2013: fewer than half participated consistently through four and a half years.','A wider view',source='cohort'),
 beat(research(bars(list(zip(['Infants','Age 1','Age 2','Age 3','Age 4'],E['age_coverage_2023'])),'Eligible people reached · 2023')),'A newer national snapshot looks at separate age groups. WIC reaches 82.3% of eligible infants, but just 26.9% of eligible four-year-olds.','A wider view',source='coverage')])
scene('What staying can add up to','Five years',[
 beat(produce(1),'So what is there to keep? Start with just the produce: up to $52 a month while I’m fully breastfeeding.','With WIC · Maya',source='rates'),
 beat(produce(12),'A full year at that rate makes up to $624 for fruit and vegetables.','With WIC · Maya',source='rates'),
 beat(produce(24),'From his first birthday, the child’s allowance is $26 a month. One year adds $312.','With WIC · Maya',source='rates'),
 beat(produce(36),'Another year. Another $312 in produce benefits available to use.','With WIC · Maya',source='rates'),
 beat(produce(48),'And another. Small monthly amounts are becoming years of help.','With WIC · Maya',source='rates'),
 beat(produce(60),'At the same rates all the way through, that’s up to $1,872 in produce benefits by his fifth birthday. Using them is what turns that number into food.','With WIC · Maya',source='rates')])
scene('What all that work is for','Looking back',[
 beat(research(diet_plate(0)),'Those groceries add up. But do they change what children eat? Researchers looked beyond the bill, scoring the whole diet on a 100-point scale.','A wider view',source='diet'),
 beat(research(diet_plate(1)),'At age three, children who stayed in WIC into their third year scored 3.6 points higher than children who only received it in year one.','A wider view',source='diet'),
 beat(research(diet_plate(1)),'That’s a modest difference in overall diet quality, associated with staying connected to WIC. The years after infancy matter, too.','A wider view',source='diet'),
 beat(pair(situation(15),situation(15)),'Back to Maya. The same fifth birthday in both lives. Five years of needing food—and two different experiences of paying for it.','A wider view'),
 beat('<div class="ending-art">'+situation(15)+'</div>','Look back at everything it took. WIC made nutritious food more affordable. But the help depended on hearing about it, enrolling, reaching a store, finding the right foods, and managing to renew.'),
 beat('<div class="ending-art">'+situation(15)+'</div>','More families could benefit if getting started came with a direct referral, staying enrolled fit around work and caregiving, and shopping meant nearby stores, clear labels, and checkout support. Each is a place to remove some of the work.'),
 beat('<div class="ending-art final-art">'+situation(15)+'</div>','Getting help should take less work.')])
ENVIRONMENTS={0:split_stage(),2:driving_map(),3:store_environment(),4:checkout_environment(BASKET['items'])}
SOURCES={
'ny':('New York WIC: applying and using benefits','https://www.health.ny.gov/prevention/nutrition/wic/how_to_apply.htm','Income eligibility is only one component of WIC certification. See also <a href="https://www.health.ny.gov/prevention/nutrition/wic/faqs.htm">New York WIC FAQs</a>, <a href="https://www.mhhc.org/our-services/mhhc-wic-program/">MHHC’s current phone appointment options</a>, and <a href="https://www.ccf.ny.gov/application/files/2617/1294/8575/WICSNAPSummerMeals04112024.pdf">New York’s benefit-expiration guidance</a>. Product illustrations are schematic.'),
'referral':('Qualitative referral study · 2026','https://www.frontiersin.org/journals/health-services/articles/10.3389/frhs.2026.1707744/full','Ten participant interviewees recruited through a New Hampshire WIC agency; the broader study includes New Hampshire and Vermont staff. Interviews February–April 2024; 8 of 10 learned of WIC from family/friends. Not nationally representative.'),
'coverage':('USDA · 2023 eligibility and coverage','https://fns-prod.azureedge.us/sites/default/files/resource-files/wic-eer2023-report.pdf','Tables 3.1, 3.5 and 3.7. Coverage = average-month participants divided by eligible people. 95% intervals: Vermont 65.1–94.2%, New York 61.0–63.8%, Louisiana 39.9–42.7%, national 54.5–57.6%. Age values are cross-sectional.'),
'access':('USDA · WIC retailer access, Table A.20','https://fns-prod.azureedge.us/sites/default/files/resource-files/wic-accessPart1-finalReport.pdf','FY2022 retailers; 2015–2019 ACS low-income families with children under 5 are a proxy for WIC-eligible families. Convenient access is within 1 mile in urban areas or 10 miles in rural areas. Rounded table percentages used.'),
'correlation':('Reproduced 50-state comparison','evidence.json','Pearson r = '+str(round(E['pearson_r'],8))+'. Join by state; exclude DC and Puerto Rico. Equal weight for each state; rounded access percentages from Table A.20 and 2023 coverage from Table 3.5. Ecological, cross-year association; no causal interpretation. Source transcription and Python reproduction are saved with this branch.'),
'rates':('USDA · FY2026 produce allowance','https://www.usda.gov/sites/default/files/guidance-documents/fna.wic-2026-2-cvvb-amounts.pdf','October 1, 2025–September 30, 2026: $52/month fully breastfeeding; $26/month child. Illustration assumes 12 fully breastfeeding months plus 48 child months, continuous eligibility and constant FY2026 rates. Excludes other foods and the optional juice substitution. Not actual redemption, total WIC value, guaranteed savings, or forecast.'),
'redemption':('JAMA Network Open · benefit redemption','https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2842211','Southern California, November 2019–June 2023 records; children aged 0–3 at certification in November 2019–June 2022. 188,368 participants. Table 2: 254,506 of 365,738 fruit-and-vegetable certification periods redeemed at least 70% (69.6%); the complement is 30.4%. Unit is certification periods, not people or lost dollars.'),
'cohort':('USDA · Infant and Toddler Feeding Practices Study, Year 5','https://fns-prod.azureedge.us/sites/default/files/resource-files/WIC-ITFPS2-Year5Report.pdf','2013 enrollment cohort. Consistent participation refers to mother or child receipt during years 1 and 2 and subsequent observed months through 54 months. Weighted 43.5% consistent, 56.5% not consistent. Not a current national count or a renewal dropout estimate.'),
'diet':('Borger et al. · WIC participation and diet quality','https://pubmed.ncbi.nlm.nih.gov/35277313/','Adjusted observational comparison at age 3: participation in only the first year was associated with a 3.6-point lower Healthy Eating Index–2015 score than participation into the third year. Scale is 0–100. Does not establish causation.')}
SOURCES['shopping']=('The checkout basket · prices and food rules','basket.json','Walmart online prices accessed September 24, 2026: 12 Great Value large white eggs $1.67; bananas 2 lb at $0.50/lb, $1.00; 1 lb baby carrots $1.32; Great Value creamy peanut butter 16 oz $1.98; Great Value white rice 32 oz $1.77. Total $7.74; four covered items $5.97; white rice $1.77 paid separately. Public listings are a price snapshot, not an Albany-store quote. Assumes an authorized store and sufficient matching food benefits. Individual product URLs, sizes, quantities, and NY food-rule sources are in the linked data file.')
SOURCES['map']=('Albany street map · U.S. Census Bureau','https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Transportation/MapServer','Street geometry downloaded September 24, 2026 from TIGERweb local and secondary road layers. Routes follow connected street vertices. The story’s home and generic shop endpoints are narrative locations; no household address, reported trip, retailer status, or travel-time estimate is asserted. Raw geometry and route calculations are saved with the project.')
SOURCES.pop('correlation',None)
SOURCES['shopping']=('The stock-up basket · prices and WIC rules','basket.json',f'Walmart online listing snapshots accessed September 24–25, 2026. Total ${total/100:.2f}; eligible foods ${covered/100:.2f}; own payment ${own/100:.2f}. Quantities are for a larger stock-up with pantry food already at home, not a nutritionally complete meal plan. Prices are not a local store quote. The linked ledger contains every item, quantity, unit price, product source, and food rule. This is a WIC-focused basket rather than a full food budget: $32.62 produce (below the $52 breastfeeding allowance), two dozen eggs, three gallons of 1% milk and one 16 oz peanut butter jar. Covered amounts assume sufficient corresponding benefits and an authorized store. Frozen vegetable prices verified on Walmart product listings September 25, 2026; approved categories cross-checked against the NY March 2026 frozen-food list.')
SOURCES['map']=('A measured rural driving route','https://www.pricechopper.com/stores/ny/lakeplacid/price-chopper-180.html','Keene Valley town-center coordinates (-73.7865, 44.1895) to the store’s published coordinates (-74.0109175, 44.2941736), 1930 Saranac Avenue. OpenStreetMap/OSRM driving route retrieved September 25, 2026: 34,558.1 metres / 1,609.344 = 21.47 miles, shown as 21.5 one way. This is a selected real road trip, not a claim that this is the nearest authorized store or a measured household trip. <a href="https://www.pricechopper.com/benefit-card/">Price Chopper’s benefit-card policy includes WIC</a>. <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>; routing by OSRM. Travel time and the road-distance metric are separate from USDA’s retailer-access definition.')
SOURCES['map']=(SOURCES['map'][0],SOURCES['map'][1],SOURCES['map'][2]+' Basemap: U.S. Census TIGERweb Transportation layers 6 and 8, secondary and local roads, downloaded September 25, 2026; 893 road features. Uniform map scale corrects longitude for latitude. The nearby-store comparison remains unverified and is not asserted.')
PLAIN={
'ny':('How WIC works in New York','WIC helps eligible pregnant people, new parents, and young children buy food. You apply through a local WIC office. Medicaid can help show that you meet the income rules, but you still need a WIC appointment. Food rules and appointment options can vary.'),
'referral':('How people heard about WIC','In one small study, 8 of 10 people interviewed said family or friends told them about WIC. They were recruited through one New Hampshire agency, so this does not tell us how everyone hears about the program.'),
'coverage':('How many people receive WIC?','USDA estimates that WIC reached 56.1% of eligible people in an average month in 2023. The state and age comparisons come from the same report. These are estimates, and the numbers do not explain why someone did not receive help.'),
'access':('How far away is a WIC store?','USDA found that 40% of low-income families with young children lived more than a mile from a WIC store in cities, or more than ten miles away in rural areas. The study used these families as a stand-in for families eligible for WIC. It did not measure each family’s actual trip.'),
'rates':('Where the produce amounts come from','From October 2025 through September 2026, the monthly produce amount is $52 for a fully breastfeeding parent and $26 for a child. Our five-year example keeps those amounts unchanged and assumes the family stays eligible and enrolled. It shows help available, not money the family necessarily used.'),
'redemption':('Some produce benefits go unused','A Southern California study found that about 3 in 10 enrollment periods used less than 70% of the available fruit and vegetable benefits. It counted periods of enrollment, not individual people. That does not mean 30% of people used no benefits.'),
'cohort':('How many families stayed enrolled?','Researchers followed children who enrolled in WIC in 2013. About 44% received WIC consistently through age four and a half. This describes that group of children; it is not today’s national dropout rate, and it does not tell us why families stopped receiving WIC.'),
'diet':('Did children’s diets differ?','At age three, children who stayed in WIC into their third year scored 3.6 points higher on a 100-point diet-quality scale than children who received WIC only in year one. Researchers accounted for other differences they could measure, but the study cannot prove WIC caused the difference.'),
'shopping':('What this grocery bill includes','This basket costs $49.84. WIC covers $46.10, leaving $3.74 to pay yourself—assuming the store accepts WIC and you have enough of the right benefits left. Prices were checked online in September 2026 and may differ at your store. This is a stock-up basket, not a complete meal plan.'),
'map':('Where the 21.5-mile trip comes from','This is a real driving route from central Keene Valley to a Price Chopper in Lake Placid: 21.5 miles each way. It shows one possible shopping trip, not a particular family’s journey. We have not established that this is the nearest WIC store.')}
citation_order=list(dict.fromkeys(b['source'] for scene in scenes for b in scene['beats'] if b['source']))
parts=[]
for i,s in enumerate(scenes):
 scene_id=[1,3,5,6,7,8,9,10,11,12][i]
 frames=[]
 for j,b in enumerate(s['beats']):
  source=f'<a href="#source-{b["source"]}" class="source-link" aria-label="Source {citation_order.index(b["source"])+1}">{citation_order.index(b["source"])+1}</a>' if b['source'] else ''
  focus='research' if 'class="research"' in b['visual'] else 'ending' if 'ending-art' in b['visual'] else 'right' if b['who'].startswith('Without WIC') else 'left' if b['who'].startswith('With WIC') else 'both'
  visual=b['visual']
  copy=esc(b['caption'])
  if source:
   lead,space,tail=copy.rpartition(' ')
   copy=lead+space+'<span class="citation-tail">'+tail+source+'</span>'
  caption='<p class="line">'+copy+'</p>'
  if i==0 and j==1:
   caption='<div class="opening-exchange"><p class="message-sender">A friend texts me</p><p class="friend-message">“Have you tried WIC? It helps with food for you and the baby.”</p><p class="maya-reply">'+copy+'</p></div>'
  if 'phone-conversation' in visual and source:
   at=visual.rfind('</p>');visual=visual[:at]+source+visual[at:];source=''
  frames.append(f'<div class="frame focus-{focus} {"phone-frame" if "phone-conversation" in b["visual"] else ""}" data-focus="{focus}" data-beat="{j}"><div class="visual">{visual}</div><div class="caption">{caption}</div></div>')
 parts.append(f'<section class="scene {"immersive" if i in ENVIRONMENTS else ""}" id="scene-{scene_id}" data-count="{len(frames)}" data-hold="{2 if i==11 else 0}" style="--beats:{len(frames)};--hold:{2 if i==11 else 0}" aria-labelledby="title-{i+1}"><div class="sticky"><header class="scene-heading"><h2 id="title-{i+1}">{s["title"]}</h2></header>{ENVIRONMENTS.get(i, "")}<div class="frames">'+''.join(frames)+f'</div><div class="beat-progress" aria-hidden="true">'+''.join('<i></i>' for _ in frames)+'</div></div></section>')
end='<section class="sources" id="sources"><p class="eyebrow">Behind the story</p><h2>Sources & methodology</h2><p>Narrative and dialogue written for this project. Research, calculations, prices, and map data are documented below.</p>'+''.join(f'<article id="source-{k}"><h3>{PLAIN[k][0]}</h3><p>{PLAIN[k][1]}</p><p><a href="{v[1]}">Read the original source ↗</a></p><details><summary>More detail and calculations</summary><p>{v[2]}</p></details></article>' for k,v in SOURCES.items())+'<article><h3>Artwork & approach</h3><p>Original SVG character, environment, food, and chart drawings; AI-generated home illustration; OpenStreetMap road geometry; scroll-driven movement and receipt calculations. Inspired by character continuity in The Pudding’s <a href="https://pudding.cool/2024/03/teenagers/">Teenagers</a>, conversational pacing in <a href="https://pudding.cool/2025/02/middle-school/">Middle School</a>, and transaction-to-population storytelling in <a href="https://pudding.cool/2022/12/yard-sale/">Yard Sale</a>.</p></article><p class="end-credit">A visual story by Megan Quigley</p></section>'
end=end.replace('<a href=', '<a target="_blank" rel="noopener noreferrer" href=')
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow, noarchive"><meta name="googlebot" content="noindex, nofollow, noarchive"><meta name="theme-color" content="#f8f6f0"><title>The work of getting help — WIC</title><meta name="description" content="Follow one mother down two paths to see what WIC changes—and how much work it takes to keep getting it."><link rel="stylesheet" href="story.css?v=20260927-families3"><script type="module" src="story.js?v=20260927-families3"></script></head><body><main><div class="landing-track"><section class="introduction"><img class="hero-home" src="art/home-hero.jpg" width="1672" height="941" alt="Maya rests in a chair at home, cradling her newborn."><div class="hero-copy"><p class="eyebrow">A WIC story</p><h1>The work<br>of getting help</h1><p class="dek">Food assistance can change a life.<br>Getting it is another story.</p><p class="byline">By Megan Quigley</p></div><p class="scroll-cue">Scroll to begin <span aria-hidden="true">↓</span></p></section></div>'''+''.join(parts)+end+'<dialog id="source-dialog" aria-labelledby="detail-title"><button class="close-details" aria-label="Close details">Close ×</button><div class="detail-content"></div></dialog><script id="basket-data" type="application/json">'+json.dumps(BASKET['items'])+'</script></main></body></html>'
(OUT/'index.html').write_text(page)
(OUT/'evidence-metadata.json').write_text(json.dumps({k:{'title':v[0],'url':v[1],'method':v[2]} for k,v in SOURCES.items()},indent=2)+'\n')
(OUT/'scene-manifest.json').write_text(json.dumps([{'title':s['title'],'beats':[{'caption':b['caption'],'speaker':b['who'],'source':b['source']} for b in s['beats']]} for s in scenes],indent=2)+'\n')
print(f'Built {len(scenes)} scenes, {sum(len(s["beats"]) for s in scenes)} deterministic beats')
