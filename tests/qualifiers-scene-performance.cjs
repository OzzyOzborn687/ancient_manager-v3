'use strict';
const {performance}=require('node:perf_hooks'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {run}=require('./harness22.cjs')({modelVersion:8});
run('addField6();Qualifiers.initFame();S.events=[];S.seed=1234;');
const core=run('JSON.stringify(S)'),samples=100;
function measure(snapshot,before,code){
 const values=[];
 for(let n=0;n<samples;n++){
  run('S=JSON.parse('+JSON.stringify(snapshot)+');'+before);
  const start=performance.now();run(code);values.push(performance.now()-start);
 }
 values.sort((a,b)=>a-b);return {medianMs:values[Math.floor(samples/2)],p95Ms:values[Math.floor(samples*.95)]};
}
const baseline=measure(core,'','QualifierSceneLegacy.tick()');
run('S=JSON.parse('+JSON.stringify(core)+');Qualifiers.ensureScene();');const expanded=run('JSON.stringify(S)');
const ordinary=measure(expanded,'','tick()');
const fixture='S.calendar21.installedDay=100000;S.events=[{id:0,name:"Scene benchmark",series:"DREAMLEAGUE",season:30,day:36,duration:8,pool:1000000}];clubState13(my()).seasonPoints=100000;Qualifiers.markCareer(S.events[0]);';
const snapshot=measure(core,fixture,'tick()');
run('S=JSON.parse('+JSON.stringify(core)+');'+fixture+'Qualifiers.freeze(S.events[0]);');const regional=run('JSON.stringify(S)');
const regionalDay=measure(regional,'S.day=S.events.find(e=>Qualifiers.isRegional(e)).day;','Qualifiers.backgroundRegionals()');
const allRegions=measure(regional,'S.day=35;','Qualifiers.backgroundRegionals()');
const result={samples,coreTeams:JSON.parse(core).teams.length,expandedTeams:JSON.parse(expanded).teams.length,regionalTeams:JSON.parse(regional).teams.length,baseline,ordinary,snapshot,regionalDay,allRegions,addedOrdinaryMedianMs:ordinary.medianMs-baseline.medianMs};
assert(ordinary.medianMs<50,'Daily scene work exceeds an interactive frame budget on this runner');
assert(allRegions.medianMs<500,'Background region batch exceeds half a second on this runner');
assert(run('S.events.filter(e=>Qualifiers.isRegional(e)).every(e=>e.done)'));
const dir=process.env.RESULTS_DIR||'/tmp/am-v4-scene';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'qualifiers-scene-performance.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));console.log('PASS measured permanent scene, invitation-day population and complete background regions');
