/* Publication policy. Source schedules and estimated host hours remain separate. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./availability-model.js'):root.AvailabilityModel,typeof module==='object'&&module.exports?require('./access-model.js'):root.AccessModel);if(typeof module==='object'&&module.exports)module.exports=api;else root.PublicAvailability=api;})(typeof window==='undefined'?globalThis:window,(M,A)=>{
 function current(r,today){return (!r.validFrom||today>=r.validFrom)&&(!r.validThrough||today<=r.validThrough);}
 function usable(r,today){
  if(!current(r,today)||r.scheduleComplete===false||r.availabilityUncertain||r.extraHours)return false;
  const schedule=M.intervals(r.schedule);if(!schedule||(!schedule.length&&!r.scheduleComplete))return false;
  for(const e of r.scheduleExceptions||[]){const extra=M.intervals([{...e,days:e.days||(Number.isInteger(e.day)?[e.day]:[0,1,2,3,4,5,6])}]);if(!extra||M.intersection(schedule,extra).reduce((n,[a,b])=>n+b-a,0)!==extra.reduce((n,[a,b])=>n+b-a,0))return false;}
  return true;
 }
 function disposition(r,today){
  if(r.serviceClosed===true)return {included:false,hoursBasis:'unresolved',exclusionReason:'service_closed'};
  if(r.serviceScopeUnconfirmed===true)return {included:false,hoursBasis:'unresolved',exclusionReason:'on_site_service_unconfirmed'};
  if(r.status==='closed')return {included:true,hoursBasis:'published_closure',exclusionReason:null};
  if(A.classify(r)==='appointment'&&current(r,today))return {included:true,hoursBasis:'appointment_only',exclusionReason:null};
  if(usable(r,today))return {included:true,hoursBasis:'service_hours',exclusionReason:null};
  const h=r.listedLocationHours;
  if(r.estimateApproved===true&&h&&usable(h,today)&&h.sourceUrl&&h.checkedDate)return {included:true,hoursBasis:'location_estimate',exclusionReason:null};
  const partial=(r.schedule?.length&&r.scheduleComplete===false)||r.scheduleExceptions?.length||r.extraHours||r.monthlySchedule;
  const reason=r.estimateApproved===true&&h&&!current(h,today)?'expired_or_future_location_hours':!current(r,today)?'expired_or_future_schedule':r.availabilityUncertain?'conflicting_or_uncertain_schedule':partial?'partial_or_date_specific_schedule':'no_usable_hours_or_confirmed_appointment_only';
  return {included:false,hoursBasis:'unresolved',exclusionReason:reason};
 }
 function classify(r,selected,today){
  const d=disposition(r,today);const effective=d.hoursBasis==='location_estimate'?{...r,schedule:r.listedLocationHours.schedule,scheduleComplete:r.listedLocationHours.scheduleComplete,validFrom:r.listedLocationHours.validFrom,validThrough:r.listedLocationHours.validThrough,scheduleExceptions:[],extraHours:null,availabilityUncertain:false}:r;
  return {...A.present(r,M.classify(effective,selected,today)),hoursBasis:d.hoursBasis,estimated:d.hoursBasis==='location_estimate'};
 }
 return {disposition,classify,usable};
});
