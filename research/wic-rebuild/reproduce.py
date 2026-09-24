"""Fresh transcription of published rounded table values; stdlib-only reproduction."""
import csv, json, math
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
access = '''Texas:48;Florida:53;California:27;Ohio:50;Georgia:52;North Carolina:42;Arizona:49;Indiana:52;Tennessee:49;Pennsylvania:34;New York:19;Louisiana:56;Missouri:49;Illinois:27;Virginia:47;Michigan:29;Washington:45;South Carolina:49;Alabama:43;Oklahoma:45;Colorado:49;Kentucky:36;Maryland:45;New Jersey:29;Mississippi:45;Arkansas:43;Utah:49;Wisconsin:32;Minnesota:35;Kansas:49;New Mexico:55;Nevada:46;Oregon:35;Massachusetts:26;Iowa:32;Idaho:41;Nebraska:37;West Virginia:39;Connecticut:25;Hawaii:44;South Dakota:41;Alaska:54;Delaware:50;Montana:34;Wyoming:56;New Hampshire:42;North Dakota:35;Maine:21;Rhode Island:21;Vermont:30'''
coverage = '''Alabama:51.4;Alaska:50.3;Arizona:59.5;Arkansas:45.7;California:72.4;Colorado:54.2;Connecticut:48.1;Delaware:61.5;Florida:52.9;Georgia:47.7;Hawaii:57.3;Idaho:44.9;Illinois:44.3;Indiana:58.3;Iowa:54.3;Kansas:50.6;Kentucky:62.1;Louisiana:41.3;Maine:55.2;Maryland:61.2;Massachusetts:68.7;Michigan:62.6;Minnesota:66.2;Mississippi:45.6;Missouri:43.0;Montana:42.9;Nebraska:59.6;Nevada:47.7;New Hampshire:49.5;New Jersey:58.3;New Mexico:43.9;New York:62.4;North Carolina:61.8;North Dakota:51.6;Ohio:45.5;Oklahoma:54.2;Oregon:63.1;Pennsylvania:43.7;Rhode Island:60.6;South Carolina:44.3;South Dakota:57.5;Tennessee:47.4;Texas:56.7;Utah:44.5;Vermont:79.6;Virginia:47.2;Washington:54.8;West Virginia:59.2;Wisconsin:56.0;Wyoming:43.4'''
def parse(s): return {k:float(v) for k,v in (x.split(':') for x in s.split(';'))}
x,y=parse(access),parse(coverage)
assert x.keys()==y.keys() and len(x)==50
rows=[{'state':s,'without_convenient_access_pct':x[s],'eligible_covered_pct':y[s]} for s in sorted(x)]
a=sum(x.values())/50;b=sum(y.values())/50
r=sum((x[s]-a)*(y[s]-b) for s in x)/math.sqrt(sum((v-a)**2 for v in x.values())*sum((v-b)**2 for v in y.values()))
with (Path(__file__).parent/'state-comparison.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
data={'states':rows,'pearson_r':r,'n_states':50,'national_coverage_2023':56.1,'age_coverage_2023':[82.3,67.4,52.5,45.2,26.9],'historical_consistent_participation_pct':43.5,'redemption_under_70_pct':30.4,'produce':{'breastfeeding_monthly':52,'child_monthly':26,'months_breastfeeding':12,'months_child':48,'total':12*52+48*26},'diet_quality_adjusted_difference':3.6}
(ROOT/'dist/case-studies/wic/evidence.json').write_text(json.dumps(data,indent=2)+'\n')
print(f'50 states; Pearson r = {r:.8f}; constant-rate produce availability = ${data["produce"]["total"]:,}')
