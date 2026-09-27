/* Access policy is independent of opening-hour overlap. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AccessModel=api;})(typeof window!=='undefined'?window:globalThis,()=>{
 function classify(record){
  if(['appointment','walkin','booking','unknown'].includes(record.accessMode))return record.accessMode;
  const text=(record.appointment||'').toLowerCase().replace(/[–—-]/g,' ');
  if(/no appointment only restriction|not appointment only/.test(text))return 'unknown';
  if(/walk ins? (?:during|sessions? published|monday|tuesday|wednesday|thursday|friday)|stop in or call/.test(text))return 'walkin';
  if(/(?:^|[;.])\s*walk ins?\s*(?:[;.]|$)/.test(text))return 'walkin';
  if(/(?:no appointments? (?:is |are )?(?:required|necessary|needed)|appointments? (?:is |are )?not (?:required|necessary|needed)|walk ins? (?:are )?(?:welcome|accepted|available)|walk up assistance|walk in intake)/.test(text))return 'walkin';
  if(/(?:by appointment(?: only)?\b|appointments? (?:is |are )?required|appointment only|closed to walk ins|schedule a service appointment online before visiting)/.test(text))return 'appointment';
  if(/(?:policy (?:is )?not published|requirements? (?:are )?(?:unknown|not published)|may apply|confirm appointment, eligibility)/.test(text))return 'unknown';
  if(/(?:book|schedule|arrange|make|call).{0,90}appointment|appointments? (?:available|recommended|preferred)|for (?:a |an )?(?:wic )?appointment/.test(text))return 'booking';
  return 'unknown';
 }
 function present(record,hours){return {...hours,hoursState:hours.state,state:record.status!=='closed'&&classify(record)==='appointment'?'appointment':hours.state};}
 return {classify,present,labels:{appointment:'By appointment only',walkin:'Walk-ins available',booking:'Booking available — requirement unconfirmed',unknown:'Access policy unconfirmed'}};
});
