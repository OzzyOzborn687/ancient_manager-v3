'use strict';
const assert=require('node:assert/strict'),harness=require('./harness22.cjs');
const {run}=harness({modelVersion:8}),plain=code=>JSON.parse(run('JSON.stringify('+code+')'));
function setup(series='PGL WALLACHIA',season=30,seed=12345){
 run('fresh();S.seed='+seed+';S.calendar21.installedDay=100000;S.events=[{id:0,name:"P2 fixture",series:'+JSON.stringify(series)+',season:'+season+',day:50,duration:8,pool:1000000}];Qualifiers.markCareer(S.events[0]);');
}
setup();run('const beforeScene=JSON.stringify(S);Qualifiers.ensureScene();');
assert.equal(run('S.teams.length'),64);assert.equal(run('S.teams.filter(t=>t.sceneClub&&t.tier===2).length'),20);assert.equal(run('S.teams.filter(t=>t.sceneClub&&t.tier===3).length'),20);
assert(run('S.teams.every(t=>QUALIFIERS.regions.includes(t.homeRegion))'));
assert(run('S.teams.filter(t=>t.sceneClub).every(t=>roster(t).length===5&&roster(t).every(p=>p.fiction&&p.skill>=QUALIFIERS.scene.skill[t.tier][0]&&p.skill<=QUALIFIERS.scene.skill[t.tier][1]))'));
assert(run('validSave(S)'));
const first=plain('S.teams.filter(t=>t.sceneClub).map(t=>({id:t.id,name:t.name,homeRegion:t.homeRegion,tier:t.tier,players:roster(t).map(p=>[p.name,p.skill])}))');
const initialSeed=run('S.seed');run('Qualifiers.ensureScene();');assert.equal(run('S.seed'),initialSeed);assert.equal(run('S.teams.length'),64);
run('S=JSON.parse(beforeScene);Qualifiers.ensureScene();');assert.deepEqual(plain('S.teams.filter(t=>t.sceneClub).map(t=>({id:t.id,name:t.name,homeRegion:t.homeRegion,tier:t.tier,players:roster(t).map(p=>[p.name,p.skill])}))'),first);
run('const savedScene=JSON.stringify(S.qualifiers.scene);S=JSON.parse(JSON.stringify(S));migrate();');assert.equal(run('JSON.stringify(S.qualifiers.scene)'),run('savedScene'));assert(run('validSave(S)'));
console.log('PASS persistent deterministic 20 Tier 2 + 20 Tier 3, skill bounds, unique names, home regions and JSON migration');
for(const [series,season,n] of [['PGL WALLACHIA',30,16],['BLAST SLAM',30,16],['ESL ONE',30,16],['DREAMLEAGUE',30,24],['DREAMLEAGUE',31,16]]){
 for(let seed=1;seed<=5;seed++){
  setup(series,season,seed);run('Qualifiers.freeze(S.events[0]);');
  const q=plain('S.events.find(e=>e.id===0).qualification'),events=plain('S.events.filter(e=>Qualifiers.isRegional(e))');
  assert.equal(q.status,'frozen');assert.equal(events.length,5);assert.equal(q.invited.length,6);
  assert.equal(Object.values(q.quotas).reduce((a,b)=>a+b,0),n-6);
  for(const e of events){assert.equal(e.entrants.length,e.quota>=4?16:8);assert.equal(new Set(e.entrants).size,e.entrants.length);assert(e.entrants.every(id=>!q.invited.some(v=>v.team===id)));assert(e.schedule6.every(m=>m.bo===3));}
  assert(run('validSave(S)'));
  // Resolve complete retained brackets. The helper represents manager play too;
  // production background processing deliberately excludes the manager's region.
  run('for(const e of [...S.events].filter(e=>Qualifiers.isRegional(e))){const a=Qualifiers.regionalState(e);while(true){if(a.cursor>=a.schedule.length){if(phaseNext6(a))continue;break;}const n=a.schedule[a.cursor];S.day=Math.max(S.day,n.day13);recordNode6(a,n,Qualifiers.fastRegionalSeries(a,n));a.cursor++;}Qualifiers.finishRegional(a);}');
  run('S.day=43;Qualifiers.complete(S.events.find(e=>e.id===0));');
  assert.equal(run('S.events.find(e=>e.id===0).qualification.status'),'complete');
  assert.equal(run('new Set(S.events.find(e=>e.id===0).qualified13).size'),n);assert(run('validSave(S)'));
  const complete=run('JSON.stringify(S.events)'),seedAfter=run('S.seed');run('Qualifiers.complete(S.events.find(e=>e.id===0));');assert.equal(run('JSON.stringify(S.events)'),complete);assert.equal(run('S.seed'),seedAfter);
 }
}
console.log('PASS 25 complete regional tournament sets, DE8 and GSL16→DE8 BO3, exact N, quotas, unique invite winners and no rerolls');
setup();run('Qualifiers.ensureScene();const base10=Qualifiers.seasonQuotas(10),base18=Qualifiers.seasonQuotas(18);S.day+=365;for(const t of S.teams)clubState13(t).elo=Qualifiers.region(t)==="NA"?6000:1000;const shifted10=Qualifiers.seasonQuotas(10),shifted18=Qualifiers.seasonQuotas(18);');
for(const [before,after,total] of [['base10','shifted10',10],['base18','shifted18',18]]){
 const a=plain(before+'.quotas'),b=plain(after+'.quotas');assert.equal(Object.values(b).reduce((a,b)=>a+b,0),total);
 for(const r of Object.keys(a))assert(Math.abs(a[r]-b[r])<=1);assert(b.NA>a.NA);
}
const frozen=run('JSON.stringify(shifted10)');run('for(const t of S.teams)clubState13(t).elo=3000;');assert.equal(run('JSON.stringify(Qualifiers.seasonQuotas(10))'),frozen);
run('const candidate=S.teams.find(t=>t.sceneClub&&t.tier===2);clubState13(candidate).elo=1500;for(let i=0;i<3;i++)Qualifiers.sceneResult({id:900+i,done:true,qualifierFor:0,inviteWinners:[candidate.id],placements6:{[candidate.id]:1}});');assert.equal(run('candidate.tier'),1);
run('Qualifiers.sceneSeason();Qualifiers.sceneInactivity();S.day+=365;clubState13(candidate).elo=1000;clubState13(candidate).seasonPoints=100;Qualifiers.sceneSeason();Qualifiers.sceneInactivity();');assert.equal(run('candidate.tier'),2);assert.equal(run('clubState13(candidate).seasonPoints'),80);
console.log('PASS frozen annual quota indexes, ±1 bounds, exact sums, earned promotion and inactive-club relegation/points decay');
setup();run('const old=JSON.parse(JSON.stringify(S));delete old.qualifiers;for(const e of old.events)delete e.qualification;S=old;migrate();');assert.equal(run('S.qualifiers.scene'),undefined);assert.equal(run('S.events[0].qualification'),undefined);assert(run('validSave(S)'));
setup();run('Qualifiers.ensureScene();const untouched=JSON.stringify(S);');
for(const change of ['x.club=9999','x.teams[30].id=0','x.players[200].team=9999','x.players[200].active=false','x.teams[30].career13.elo=NaN','x.teams[30].career13.development21={base:99,staff:1,preparation:0}','x.teams[30].homeRegion="INVALID"','x.qualifiers.scene.generated.push(30)','x.players[200].attributes13.lane=NaN','x.patchV1.bonuses[1].team=x.patchV1.bonuses[0].team']){
 run('{const x=JSON.parse(untouched);'+change+';globalThis.invalidScene=x;}');assert.equal(run('validSave(invalidScene)'),false,change);run('delete globalThis.invalidScene;');
}
console.log('PASS lazy legacy migration and validation of extended clubs, players, bounds and retained development/attribute rules');
