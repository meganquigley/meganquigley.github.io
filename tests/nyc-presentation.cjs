const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../dist/projects/nyc-on-your-time');
const P=require(path.join(root,'preview-model.js'));
const w={};vm.runInNewContext(fs.readFileSync(path.join(root,'availability-data.js'),'utf8'),{window:w});
const records=w.AVAILABILITY_DATA.records;
for(const acronym of ['NYSOH','SSA','SSI','SNAP','WIC','SCRIE','DRIE','HRA','MTA','NYCHA','HIICAP','EPIC']){
 assert.equal(P.casing(acronym.toLowerCase()),acronym);
 assert.equal(P.casing(acronym),acronym);
}
assert.equal(P.casing('CityFHEPS and MetroPlus'),'CityFHEPS and MetroPlus');
assert.equal(P.casing('1540 FULTON STREET, BROOKLYN, NY 11216'),'1540 Fulton Street, Brooklyn, NY 11216');
assert.equal(P.casing('21ST STREET'),'21st Street');
const ssa=records.filter(r=>r.id.startsWith('ssa-field-'));
assert.equal(ssa.length,26);
for(const r of ssa){assert.equal(P.website(r),'https://www.ssa.gov/locator');assert(P.description(r).includes('Social Security, SSI'));assert(!P.description(r).includes('counseling'));}
for(const r of records.filter(r=>r.sourceUrl==='https://ryanhealth.org/services/wic-2-2'))assert.equal(P.website(r),'https://ryanhealth.org/services/wic-2');
assert(P.description({service:'NYSOH health insurance application and renewal assistance'}).includes('(NYSOH)'));
assert.equal(P.description({service:'SNAP; Fair Fares'}),'Support with SNAP and Fair Fares.');
assert(P.description({service:'SNAP; WIC; Cash Assistance; Fair Fares'}).includes('SNAP, WIC, Cash Assistance, and Fair Fares'));
assert(P.description({service:'Health insurance and SNAP enrollment assistance'}).includes('health insurance and applying for SNAP'));
assert(P.description({service:'Community Food Connection — community kitchen'}).includes('Prepared meals'));
assert(!P.description({service:'Community Food Connection — community kitchen'}).includes('groceries'));
assert.equal(P.website({sourceUrl:'javascript:alert(1)'}),null);
for(const r of records.filter(r=>r.included)){
 assert(P.title(r).trim());assert(P.description(r).endsWith('.'));
 assert(!/\b(?:Nysoh|nysoh|Ssi|sNAP)\b/.test(P.description(r)));
 assert(new URL(P.website(r)).protocol==='https:');
}
console.log('PASS: acronym preservation, all 26 SSA links, updated Ryan links, service descriptions, safe URLs, and 1,270 displayed records.');
