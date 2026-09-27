(function (root) {
  'use strict';
  const DAY = 1440, WEEK = 7 * DAY;
  const PRESETS = {
    daytime: { days: [0,1,2,3,4], start: '09:00', end: '17:00' },
    before: { days: [0,1,2,3,4], start: '00:00', end: '09:00' },
    after: { days: [0,1,2,3,4], start: '17:00', end: '24:00' },
    weekend: { days: [5,6], start: '00:00', end: '24:00' }
  };
  function minute(value) {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) && value !== '24:00') return NaN;
    const [h,m] = value.split(':').map(Number); return h * 60 + m;
  }
  function validate(window) {
    if (!window.days?.length || window.days.some(d => !Number.isInteger(d) || d < 0 || d > 6)) return 'Choose at least one day.';
    const a = minute(window.start), b = minute(window.end);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a === DAY) return 'Enter a valid start and end time.';
    if (a === b) return 'Choose different start and end times. For all day, use midnight to midnight next day.';
    return '';
  }
  function merge(intervals) {
    const result = [];
    for (const [a,b] of intervals.sort((x,y) => x[0]-y[0])) {
      const last = result[result.length-1];
      if (last && a <= last[1]) last[1] = Math.max(last[1],b);
      else result.push([a,b]);
    }
    return result;
  }
  function intervals(schedule) {
    const values = [];
    for (const s of schedule || []) {
      const start = minute(s.start), end = minute(s.end);
      if (!Number.isFinite(start) || !Number.isFinite(end) || start === DAY || !s.days?.length || s.days.some(d=>!Number.isInteger(d)||d<0||d>6)) return null;
      for (const d of s.days) {
        const a = d*DAY+start, b = d*DAY+end+(end<=start?DAY:0);
        for (const offset of [-WEEK,0,WEEK]) {
          const lo = Math.max(0,a+offset), hi = Math.min(WEEK,b+offset);
          if (lo < hi) values.push([lo,hi]);
        }
      }
    }
    return merge(values);
  }
  function intersection(a,b) {
    const result=[]; let i=0,j=0;
    while(i<a.length && j<b.length) {
      const lo=Math.max(a[i][0],b[j][0]),hi=Math.min(a[i][1],b[j][1]);
      if(lo<hi) result.push([lo,hi]);
      if(a[i][1]<b[j][1]) i++; else j++;
    }
    return result;
  }
  function classify(record, selected, today) {
    if (record.status === 'closed') return {state:'closed',matches:[],reason:'Listed as closed in the source.'};
    if(record.validFrom || record.validThrough) {
      today ||= new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
      if((record.validFrom && today<record.validFrom)||(record.validThrough && today>record.validThrough)) return {state:'unknown',matches:[],reason:'The published seasonal schedule does not cover the current date. Check the source for updated hours.'};
    }
    const open = intervals(record.schedule);
    if (!open || (!open.length && !record.scheduleComplete)) return {state:'unknown',matches:[],reason:'Regular hours are missing or conflicting.'};
    const matches = intersection(open,selected);
    if(matches.length) return {state:'open',matches,reason:'Regular published hours overlap this window.'};
    const exceptions = record.scheduleExceptions || [];
    const possibleExtra = exceptions.some(e => {
      const times=intervals([{days:e.days || (Number.isInteger(e.day)?[e.day]:[0,1,2,3,4,5,6]),start:e.start,end:e.end}]);
      return !times || intersection(times,selected).length;
    });
    if (possibleExtra || record.extraHours || record.availabilityUncertain) return {state:'unknown',matches:[],reason:'Special sessions may overlap. Check the source for dates and services.'};
    return {state:'closed',matches:[],reason:'No regular published hours overlap this window.'};
  }
  const api={PRESETS,minute,validate,intervals,intersection,classify};
  root.AvailabilityModel=api;
  if(typeof module!=='undefined') module.exports=api;
})(typeof window==='undefined'?globalThis:window);
