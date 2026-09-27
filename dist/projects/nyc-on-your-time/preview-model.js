/* Presentation only: the research records remain untouched. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PlacePreview=api;})(typeof window==='undefined'?globalThis:window,()=>{
 const acronyms=new Set('NY NYC NYS NYSOH NYSDOH NYSDOL NYCHA HRA WIC SNAP HEAP HIV AIDS CIDNY HIICAP VA SSA SSI IRS YMCA YWCA JCC NYU UJA UJC UJO PHS CAMBA BRC LGBT LGBTQ CUNY SUNY IDNYC USA AAFE ACQC AME AMPHS APICHA BCA BVM BVSJ CASC CBN CCBA CCNS CHN CIANA COPO CPC CUCS DBA DHS DOHMH DRIE DSI DVS DWDC DYCD EBT EPIC GMHC HANAC HASA HAUP HES HHC HPD ICL ICNA JASA JASSI JCCGCI JFK KCS LDC LLC MBSCC MCCNY MMCC MSP MTA NADAP NMIC NYFSC NYLAG NYPL OAC OCSS ODA POTS PSS RAICES RAIN SAGE SBS SCRIE SDA SEBCO SHOPP SSI UCA UJCES VAMC VFW WHEDCO YWHA'.split(' '));
 function casing(value){return String(value||'').replace(/\b[A-Za-z][A-Za-z’'\d.-]*\b/g,w=>acronyms.has(w.toUpperCase())?w.toUpperCase():w===w.toUpperCase()?w.toLowerCase().replace(/^[a-z]/,c=>c.toUpperCase()):w).replace(/\b(\d+)(St|Nd|Rd|Th)\b/gi,(_,n,s)=>n+s.toLowerCase()).replace(/\bcityfheps\b/gi,'CityFHEPS').replace(/\bmetroplus\b/gi,'MetroPlus');}
 function title(r){return casing(r.name).replace(/\s*[—–]\s*Benefits Case Assistance\s*$/i,'').replace(/\s*[—–]\s*\d+\s.*$/,'').replace(/\bCtr\b/g,'Center').replace(/\bLife Long\b/gi,'Lifelong');}
 function time(value){const [hh,mm]=value.split(':').map(Number),h=hh%24;return `${h%12||12}${mm?':'+String(mm).padStart(2,'0'):''} ${h>=12?'PM':'AM'}`;}
 const names=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
 function dayLabel(days){if(days.length===7)return 'Every day';const ordered=[6,0,1,2,3,4,5].filter(d=>days.includes(d));const groups=[];for(let i=0;i<ordered.length;){let j=i;while(j+1<ordered.length&&ordered[j+1]===ordered[j]+1)j++;groups.push(j-i>=2?names[ordered[i]]+'–'+names[ordered[j]]:ordered.slice(i,j+1).map(d=>names[d]).join(', '));i=j+1;}return groups.join(', ');}
 function hours(r,estimated){const schedule=estimated?r.listedLocationHours?.schedule:r.schedule;if(!schedule?.length)return r.status==='closed'?'Closed':r.accessMode==='appointment'?'By appointment only':'Contact the provider for hours';const perDay=Array.from({length:7},()=>[]);for(const row of schedule)for(const day of row.days||[]){let label=time(row.start)+'–'+time(row.end);if(row.start===row.end||(row.start==='00:00'&&row.end==='24:00'))label='Open 24 hours';else if(row.end!=='24:00'&&row.end<row.start)label+=' (next day)';perDay[day].push({start:row.start,label});}const groups=new Map();for(const day of [6,0,1,2,3,4,5]){const text=perDay[day].sort((a,b)=>a.start.localeCompare(b.start)).map(x=>x.label).join(' / ');if(text){if(!groups.has(text))groups.set(text,[]);groups.get(text).push(day);}}return [...groups].map(([text,days])=>dayLabel(days)+' · '+text).join('\n');}
 function description(r){
  const service=casing(r.service||'').trim().replace(/[.]+$/,''),s=service.toLowerCase();
  if(/social security|\bssi\b/.test(s))return 'Help with Social Security, SSI, disability, and Medicare benefits.';
  if(/\bva\b/.test(s))return 'Help with VA disability, pension, education, and family benefits.';
  if(/nysoh|ny state of health/.test(s))return 'Help applying for or renewing health coverage through NY State of Health (NYSOH).';
  if(/nyc care/.test(s))return 'Help enrolling in NYC Care and accessing health benefits.';
  if(/;/.test(service)){const items=service.replace(/; More$/i,'').split('; ');return 'Support with '+items.slice(0,-1).join(', ')+(items.length===2?' and ':', and ')+items.at(-1)+'.';}
  if(/\bwic\b/.test(s))return 'WIC enrollment, nutrition support, and food benefits.';
  if(/food pantry/.test(s))return 'Groceries and food assistance through a community food pantry.';
  if(/soup kitchen|community meal|community kitchen|congregate meal/.test(s))return 'Prepared meals through a community meal program.';
  if(/older.adult.*case assistance/.test(s))return 'Help for older adults navigating benefits and support services.';
  if(/health insurance and snap/.test(s))return 'Help enrolling in health insurance and applying for SNAP food benefits.';
  if(/health.*enrollment|insurance.*enrollment|navigator|medicaid.*enrollment/.test(s))return 'Help understanding and enrolling in health coverage.';
  if(/medicare|hiicap/.test(s))return 'Counseling on Medicare and related benefits.';
  if(/financial empowerment/.test(s))return 'Financial counseling and help navigating benefits.';
  if(/snap/.test(s))return 'Help applying for or managing SNAP food benefits.';
  if(/homebase/.test(s))return 'Housing support and help preventing homelessness.';
  if(/workforce1|employment and training/.test(s))return 'Help finding work and connecting with job training.';
  if(/scrie|drie/.test(s))return 'Help applying for or renewing SCRIE and DRIE rent freezes.';
  if(/tax prep/.test(s))return 'Help preparing and filing tax returns.';
  if(/reduced.fare/.test(s))return 'Help with reduced-fare transit benefits.';
  return service?service+'.':'Benefits and support services.';
 }
 const visitorLinks={
  'https://www.ssa.gov/data/FO-Address-Open-Close-Times.csv':'https://www.ssa.gov/locator',
  'https://ryanhealth.org/services/wic-2-2':'https://ryanhealth.org/services/wic-2',
  'https://communityhealthadvocates.org/agencies/united-jewish-organizations-of-williamsburg/':'https://www.cssny.org/programs/entry/community-service-society-navigator-network',
  'https://us.polishslaviccenter.org/uslugi-socialne-dla-serniorow/':'https://polishslaviccenter.org/about-us/mission/',
  'https://copo.org/':'https://www.nyccare.nyc/community-based-organization/'
 };
 function website(r){
  const source=r.website||r.websiteUrl||r.sourceUrl;
  const destination=visitorLinks[source]||(source==='https://data.cityofnewyork.us/resource/cqc8-am9x.json'?(r.additionalSources||[]).find(u=>u.includes('/resultDetail?'))||'https://portal.311.nyc.gov/article/?kanumber=KA-02238':source);
  try{const u=new URL(destination);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}
 }

 return {casing,title,time,hours,description,website};
});
