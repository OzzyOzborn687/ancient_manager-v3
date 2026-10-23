'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks'),harness=require('./harness22.cjs');
const previous=harness({modelVersion:8,stopBefore:'qualifiers/calendar-v3.js'}),current=harness({modelVersion:8}),samples=100;
previous.run('Qualifiers.ensureScene();S.calendar21.installedDay=100000;S.events=[{id:999,name:"Future legacy event",series:"FISSURE",day:1000,duration:8,pool:1000000}];');
const core=previous.run('JSON.stringify(S)');
function measure(h,snapshot,setup,code){
 const values=[];for(let i=0;i<samples;i++){
  h.run('S=JSON.parse('+JSON.stringify(snapshot)+');'+setup);
  const start=performance.now();h.run(code);values.push(performance.now()-start);
 }
 values.sort((a,b)=>a-b);return {medianMs:values[Math.floor(samples/2)],p95Ms:values[Math.floor(samples*.95)]};
}
const p2Day=measure(previous,core,'','tick()'),p3Day=measure(current,core,'migrate();','tick()');
const fixture='S.events=[{id:0,name:"Dense benchmark",series:"DREAMLEAGUE",season:30,day:30,duration:8,pool:1000000},{id:9,name:"Official",series:"FISSURE",day:2,duration:16,entrants:[S.club]}];clubState13(my()).seasonPoints=100000;Qualifiers.markCareer(S.events[0]);';
const compressedAnnouncement=measure(current,core,'migrate();'+fixture,'Qualifiers.freeze(S.events[0])');
current.run('S=JSON.parse('+JSON.stringify(core)+');migrate();'+fixture+'Qualifiers.freeze(S.events[0]);S.day=26;Qualifiers.backgroundRegionals();');
const registered=current.run('JSON.stringify(S)'),registeredDay=measure(current,registered,'','tick()');
const result={samples,comparisonTeams:JSON.parse(core).teams.length,registeredTeams:JSON.parse(registered).teams.length,p2Day,p3Day,addedOrdinaryMedianMs:p3Day.medianMs-p2Day.medianMs,compressedAnnouncement,registeredDay};
assert(p3Day.medianMs<50,'Ordinary day exceeds the existing interactive budget');assert(registeredDay.medianMs<50,'Registered-roster day exceeds the existing interactive budget');
const dir=process.env.RESULTS_DIR||'/tmp/am-v4-p3';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'qualifiers-calendar-performance.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));console.log('PASS measured phase-2/phase-3 ordinary day, compressed announcement and protected-roster day on identical saved worlds');
