'use strict';
const assert=require('node:assert/strict'),harness=require('./harness22.cjs');
const h=harness({modelVersion:8}),run=h.run,plain=code=>JSON.parse(run('JSON.stringify('+code+')'));
run('eventQ=()=>S.events.find(e=>e.id===0)');
function setup(series='PGL WALLACHIA',season){
 run('fresh();S.seed=123456;addField6();Qualifiers.initFame();S.events=[];S.active=null;');
 run('S.events=[{id:0,name:"Qualification fixture",series:'+JSON.stringify(series)+',season:'+JSON.stringify(season??30)+',day:40,duration:10,pool:1000000}];Qualifiers.mark(eventQ());');
}
for(const [series,season,n] of [['PGL WALLACHIA',30,16],['BLAST SLAM',30,16],['ESL ONE',30,16],['DREAMLEAGUE',30,24],['DREAMLEAGUE',31,16]]){
 for(let seed=1;seed<=20;seed++){
  setup(series,season);run('S.seed='+seed+';Qualifiers.complete(eventQ());');
  const q=plain('eventQ().qualification');
  assert.equal(q.status,'complete');assert.equal(q.fieldSize,n);assert.equal(q.qualified.length,n);
  assert.equal(new Set(q.qualified).size,n);assert.equal(q.invited.length,6);
  assert.equal(q.invited.filter(i=>i.reason==='wildcard').length,1);
  const ids=q.invited.map(v=>v.team);
  assert.equal(Object.values(q.quotas).reduce((a,b)=>a+b,0),n-6);
  for(const r of ['EEU','EU','CN','SEA','NA']){
   assert(q.quotas[r]>=1&&q.quotas[r]<=4);assert(q.invited.filter(i=>i.region===r).length<=2);
   assert.equal(q.regions[r].qualified.length,q.quotas[r]);
   assert(!q.regions[r].candidates.some(id=>ids.includes(id)));
   assert(!q.regions[r].matches.some(m=>m.pair.some(id=>ids.includes(id))));
  }
  assert(run('validSave(S)'));
 }
}
console.log('PASS all five operator formats × 20 seeds: N, uniqueness, 6 invitations, caps, quotas and invite exclusion');
assert.deepEqual(plain('Qualifiers.quotas(10)'),{EEU:3,EU:2,CN:2,SEA:2,NA:1});
assert.deepEqual(plain('Qualifiers.quotas(18)'),{EEU:4,EU:4,CN:4,SEA:4,NA:2});
assert.deepEqual(plain('Qualifiers.normalize([4,4,4])'),[.5,.5,.5]);
assert.deepEqual(plain('Qualifiers.normalize([0,5,10])'),[0,.5,1]);
run('fresh();S.seed=123456;S.events=[{id:0,name:"PGL",series:"PGL WALLACHIA",day:40,pool:1000000},{id:99,series:"PGL WALLACHIA",day:-60,done:true,champion:12}];Qualifiers.mark(eventQ());Qualifiers.freeze(eventQ());');
assert(run('S.teams.length===24&&eventQ().qualification.invited.some(v=>v.team===12&&v.reason==="champion")'),'The existing 24-club fallback makes a sole-region champion feasible');
run('tieRows=Array.from({length:30},(_,team)=>({team,region:QUALIFIERS.regions[team%5],elo:1500,form:80,index:.5,wildcard:.25,busy:null,components:{season:.5,eloForm:.5,history:.5,fame:.5}}));');
assert.deepEqual(plain('Qualifiers.invitations(eventQ(),16,tieRows,null).invited.map(r=>r.team)'),[0,1,2,3,4,5]);
for(const operator of ['BLAST SLAM','PGL WALLACHIA','ESL ONE','DREAMLEAGUE'])assert.equal(Object.values(plain('QUALIFIERS.weights['+JSON.stringify(operator)+']')).reduce((a,b)=>a+b,0),100);
setup();run('S.events.push({id:99,name:"Past PGL",series:"PGL WALLACHIA",day:-60,done:true,champion:12,placements6:{12:1}});Qualifiers.freeze(eventQ());');
assert(run('eventQ().qualification.invited.some(v=>v.team===12&&v.reason==="champion")'));
assert.equal(run('eventQ().qualification.invited.length'),6);
assert(run('eventQ().qualification.rows.find(r=>r.team===12).components.history===1'));
setup();run('S.teams[0].career13.seasonPoints=10000;S.teams[0].career13.elo=4000;S.teams[0].fame=100;S.events.push({id:90,name:"Busy",series:"FISSURE",day:41,duration:10,qualified13:[0]});Qualifiers.freeze(eventQ());');
assert(run('eventQ().qualification.rows.find(v=>v.team===0).busy===90'));
assert(run('!eventQ().qualification.invited.some(v=>v.team===0)&&eventQ().qualification.invited.length===6'));
assert.equal(run('eventQ().qualification.player.reason'),'schedule-conflict');
setup();run('Qualifiers.freeze(eventQ());held=eventQ().qualification.invited[0].team;S.events.push({id:90,name:"Late booking",series:"FISSURE",day:40,duration:10,qualified13:[held]});Qualifiers.complete(eventQ());');
assert(run('eventQ().qualification.status==="complete"&&!eventQ().qualification.invited.some(v=>v.team===held)'));
setup();run('S.events.push({id:99,series:"PGL WALLACHIA",day:-60,done:true,champion:0});S.events.push({id:90,series:"FISSURE",day:40,duration:10,qualified13:[0]});Qualifiers.freeze(eventQ());');
assert(run('eventQ().qualification.championUnavailable&&!eventQ().qualification.invited.some(v=>v.team===0)'));
console.log('PASS normalization, exact default quotas, deterministic ties, operator history, champion guarantee and both conflict timings');
setup();run('Qualifiers.freeze(eventQ());frozen=JSON.stringify(eventQ().qualification);seedAtFreeze=S.seed;S.teams[0].career13.elo+=10000;S.teams[0].fame=0;Qualifiers.freeze(eventQ());');
assert(run('frozen===JSON.stringify(eventQ().qualification)&&S.seed===seedAtFreeze'));
run('saved=JSON.stringify(S);Qualifiers.complete(eventQ());result=JSON.stringify(eventQ().qualification);endSeed=S.seed;S=JSON.parse(saved);migrate();Qualifiers.complete(eventQ());');
assert(run('result===JSON.stringify(eventQ().qualification)&&endSeed===S.seed'));
run('before=JSON.stringify(S);Qualifiers.complete(eventQ());');
assert(run('before===JSON.stringify(S)'));
run('stored=JSON.stringify(S);corrupt=JSON.parse(stored);corrupt.events.find(e=>e.id===0).qualification.qualified[0]=corrupt.events.find(e=>e.id===0).qualification.qualified[1];');
assert(!run('validSave(corrupt)'));
run('corrupt=JSON.parse(stored);corrupt.events.find(e=>e.id===0).qualification.rows[0].components.history=NaN;');assert(!run('validSave(corrupt)'));
run('corrupt=JSON.parse(stored);corrupt.teams[0].fame=-1;');assert(!run('validSave(corrupt)'));
run('corrupt=JSON.parse(stored);badRegion=Object.values(corrupt.events.find(e=>e.id===0).qualification.regions).find(r=>r.matches.length);badRegion.matches[0].maps[0].difficulty.multipliers[0]=999;');assert(!run('validSave(corrupt)'));
run('S=JSON.parse(stored);');assert(run('validSave(S)&&S.v===1&&S.gameVersion==="2.6"'));
console.log('PASS frozen snapshot, JSON continuation, no rerolls, invalid fields and unchanged v:1/gameVersion');
setup();run('S.difficulty="impossible";fatigueBefore=JSON.stringify(S.players.map(p=>p.fatigue));fundsBefore=S.budget;Qualifiers.complete(eventQ());');
assert(run('fatigueBefore===JSON.stringify(S.players.map(p=>p.fatigue))&&fundsBefore===S.budget'));
assert(run('Object.values(eventQ().qualification.regions).flatMap(r=>r.matches).flatMap(m=>m.maps.map(p=>({p,m}))).every(({p,m})=>JSON.stringify(p.difficulty.multipliers)===JSON.stringify(Difficulty.multipliers(p.difficulty.level,S.club,m.pair)))'));
run('qBefore=JSON.stringify(eventQ().qualification);S.difficulty="easy";Qualifiers.complete(eventQ());');
assert(run('qBefore===JSON.stringify(eventQ().qualification)'));
setup();run('Qualifiers.freeze(eventQ());rulesBefore=JSON.stringify(eventQ().qualification.rules);QUALIFIERS.weights["PGL WALLACHIA"].season=90;Qualifiers.complete(eventQ());');
assert(run('rulesBefore===JSON.stringify(eventQ().qualification.rules)&&eventQ().qualification.weights.season===40'));
run('QUALIFIERS.weights["PGL WALLACHIA"].season=40;');
console.log('PASS same difficulty policy, frozen map coefficients, no provisional fatigue/prizes and preserved snapshot weights');
setup();run('delete eventQ().qualification;delete S.qualifiers;S.active=null;migrate();legacyReady=JSON.stringify(S);baseResult=QualifiersLegacy.qualify(eventQ(),format6(eventQ()));baseSeed=S.seed;baseFatigue=JSON.stringify(S.players.map(p=>p.fatigue));S=JSON.parse(legacyReady);wrappedResult=qualify13(eventQ(),format6(eventQ()));');
assert(run('JSON.stringify(baseResult)===JSON.stringify(wrappedResult)&&S.seed===baseSeed&&JSON.stringify(S.players.map(p=>p.fatigue))===baseFatigue'));
assert(run('eventQ().qualification===undefined&&S.qualifiers.legacyEvents.includes(0)'));
run('migrate();');assert(run('eventQ().qualification===undefined'));
for(const series of ['THE INTERNATIONAL','FISSURE']){
 setup(series);assert(run('eventQ().qualification===undefined'));
 run('legacyCalls=0;originalQualifier=QualifiersLegacy.qualify;QualifiersLegacy.qualify=()=>{legacyCalls++;return [0,1]};qualify13(eventQ(),format6(eventQ()));QualifiersLegacy.qualify=originalQualifier;');
 assert.equal(run('legacyCalls'),1);
}
setup();run('delete S.qualifiers;delete eventQ().qualification;migrate();newEvent={id:9999,name:"PGL future",series:"PGL WALLACHIA",day:400};Qualifiers.mark(newEvent);S.events.push(newEvent);');assert(run('newEvent.qualification.qualVersion===1'));
console.log('PASS genuine legacy results/RNG/fatigue, idempotent migration and unchanged TI/FISSURE routing');
setup();run('S.day=0;eventQ().day=36;tick();');assert.equal(run('eventQ().qualification.snapshotDay'),1);
run('while(S.day<29)tick();');assert.equal(run('eventQ().qualification.completedDay'),29);
setup();run('initial=S.teams[0].fame;Qualifiers.initFame();S.day++;Qualifiers.decay();');assert(run('S.teams[0].fame<initial'));
run('fameBefore=S.teams[0].fame;m=makeLive4({opponent:1},autoDraft([0,1]),[0,1]);m.finishedSide=0;recordResult6(m);afterOne=S.teams[0].fame;recordResult6(m);');
assert(run('afterOne>fameBefore&&S.teams[0].fame===afterOne'));
run('scrim=makeLive4({opponent:1},autoDraft([0,1]),[0,1]);scrim.finishedSide=0;scrim.scope13="scrim";recordResult6(scrim);');assert(run('S.teams[0].fame===afterOne'));
setup('DREAMLEAGUE',30);run('S.events.push({id:90,name:"Busy",series:"FISSURE",day:40,duration:10,qualified13:S.teams.slice(0,10).map(t=>t.id)});Qualifiers.freeze(eventQ());');
assert.equal(run('eventQ().qualification.status'),'blocked');assert(run('validSave(S)&&!eventQ().qualified13'));
console.log('PASS -35/-7 cadence, fame decay/idempotent official wins, scrim exclusion and explicit blocked capacity');
setup();run('S.day=50;eventQ().day=80;Qualifiers.complete(eventQ());S.day=10;seedBeforeRewind=S.seed;ensureTournamentCalendar();');
assert(run('eventQ().qualification.status==="pending"&&!eventQ().qualified13&&S.seed===seedBeforeRewind'));
console.log('PASS later qualification caches are invalidated when the TI chapter rewinds the career clock');
console.log('PASS qualifiers phase 1');
