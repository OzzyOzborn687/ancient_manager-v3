'use strict';
const {performance}=require('node:perf_hooks'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),harness=require('./harness22.cjs');
const h=harness({modelVersion:8}),run=h.run;
run('addField6();Qualifiers.initFame();S.events=[];S.seed=1234;');
const initial=run('JSON.stringify(S)'),samples=100;
function measure(before,fn){
 const values=[];
 for(let i=0;i<samples;i++){
  run('S=JSON.parse('+JSON.stringify(initial)+');'+before);
  const start=performance.now();run(fn);values.push(performance.now()-start);
 }
 values.sort((a,b)=>a-b);
 return {medianMs:values[Math.floor(values.length/2)],p95Ms:values[Math.floor(values.length*.95)]};
}
const baseline=measure('','QualifiersLegacy.tick()'),ordinary=measure('','tick()');
const fixture='S.events=[{id:0,name:"PGL benchmark",series:"PGL WALLACHIA",day:36,pool:1000000}];Qualifiers.mark(S.events[0]);';
const snapshot=measure(fixture,'tick()');
const allRegions=measure(fixture+'Qualifiers.freeze(S.events[0]);','Qualifiers.complete(S.events[0])');
const result={samples,teams:run('S.teams.length'),players:run('S.players.length'),baseline,ordinary,snapshot,allRegions,addedOrdinaryMedianMs:ordinary.medianMs-baseline.medianMs};
assert(run('S.events[0].qualification.status==="complete"'));
const dir=process.env.RESULTS_DIR||'/tmp/ancient-manager-qualifiers';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'qualifiers-performance.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
console.log('PASS measured phase-1 daily tick, invitation snapshot and all regions; no unmeasured Tier 2/3 claims');
