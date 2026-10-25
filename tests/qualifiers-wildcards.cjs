'use strict';
const assert=require('node:assert/strict'),harness=require('./harness22.cjs'),fixture=require('./helpers/wildcards.cjs');
const {run}=harness({modelVersion:8}),plain=code=>JSON.parse(run('JSON.stringify('+code+')'));
function same(a,b,message){assert(a===b,message||'Exact saved state changed');}
function sameAfterMigration(a,b){
 // The retained engine-v4 migration emits its old notice on each load. Check
 // the entire saved world apart from that unrelated existing news behavior.
 const left=JSON.parse(a),right=JSON.parse(b);delete left.news;delete right.news;same(JSON.stringify(left),JSON.stringify(right));
}
function setup(series='PGL WALLACHIA',season=30,seed=1){run(fixture.setup(series,season,seed));}
for(const [series,season,field] of [['PGL WALLACHIA',30,8],['BLAST SLAM',30,8],['ESL ONE',30,8],['DREAMLEAGUE',30,16],['DREAMLEAGUE',31,8]]){
 setup(series,season);
 assert(run('validSave(S)'));
 assert(run('Qualifiers.wildcardStatus3b(S.events.find(e=>e.id===0)).available'));
 run('beforeRequest=JSON.stringify(S);seedAtRequest=S.seed;for(let i=0;i<100;i++)Qualifiers.wildcardStatus3b(S.events.find(e=>e.id===0));');
 same(run('JSON.stringify(S)'),run('beforeRequest'),'Availability must not change the world or RNG');
 run('oldInvites=JSON.stringify(S.events.find(e=>e.id===0).qualification.invited);oldQuotas=JSON.stringify(S.events.find(e=>e.id===0).qualification.quotas);beforeChild=structuredClone(Qualifiers.wildcardStatus3b(S.events.find(e=>e.id===0)).child);playersAtRequest=JSON.stringify(S.players);fundsAtRequest=S.budget;req=Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0));child=S.events.find(e=>e.id===req.qualifier);');
 assert(run('req.accepted'));assert.equal(run('req.pWin'),.36);assert.equal(run('req.relationshipBefore'),40);assert.equal(run('req.relationshipAfter'),38);
 assert.equal(run('S.seed'),run('req.seedAfter'));assert.equal(run('req.seedAfter'),1015568748);
 assert.equal(run('child.entrants.length'),field);assert.equal(run('new Set(child.entrants).size'),field);
 assert(run('child.entrants.includes(S.club)&&!child.entrants.includes(req.replaced)'));
 assert(run('beforeChild.entrants.filter(id=>id!==req.replaced).every(id=>child.entrants.includes(id))'));
 same(run('JSON.stringify(S.events.find(e=>e.id===0).qualification.invited)'),run('oldInvites'));
 same(run('JSON.stringify(S.events.find(e=>e.id===0).qualification.quotas)'),run('oldQuotas'));
 same(run('JSON.stringify(S.players)'),run('playersAtRequest'));assert.equal(run('S.budget'),run('fundsAtRequest'));
 assert(run('child.regionalState.schedule.every(n=>!n.score&&n.bo===3&&n.pair.every(v=>typeof v!=="number"||child.entrants.includes(v)))'));
 if(field===16)assert.equal(run('child.regionalState.gsl.filter(g=>g.ids.includes(S.club)).length'),1);
 assert(run('validSave(S)'));
 run('acceptedSaved=JSON.stringify(S);afterRequest=JSON.stringify(S);Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0));');same(run('JSON.stringify(S)'),run('afterRequest'));
 run('S=JSON.parse(acceptedSaved);migrate();');sameAfterMigration(run('JSON.stringify(S)'),run('acceptedSaved'));
 run('beforeReplay=JSON.stringify(S);Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0));');same(run('JSON.stringify(S)'),run('beforeReplay'));
}
console.log('PASS five formats: exactly one seeded draw, one entrant replacement in DE8/GSL16, unchanged invites/quotas/players/budget and exact reload/replay');
setup('PGL WALLACHIA',30,1000);run('rejectedBracket=JSON.stringify(S.events.filter(e=>Qualifiers.isRegional(e)));req=Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0));rejectedState=JSON.stringify(S);');
assert(!run('req.accepted'));assert.equal(run('req.replaced'),null);same(run('JSON.stringify(S.events.filter(e=>Qualifiers.isRegional(e)))'),run('rejectedBracket'));
assert.equal(run('S.qualifiers.operators3b.requests[2026].length'),1);assert.equal(run('S.qualifiers.operators3b.relations["PGL WALLACHIA"]'),38);
run('S=JSON.parse(rejectedState);migrate();Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0));');sameAfterMigration(run('JSON.stringify(S)'),run('rejectedState'));
run('S.events.push({id:999,name:"Other operator",series:"ESL ONE",day:80,season:30,duration:8,pool:1000000});Qualifiers.markCareer(S.events.find(e=>e.id===999));Qualifiers.freeze(S.events.find(e=>e.id===999));globalBudgetState=JSON.stringify(S);');
assert.equal(run('Qualifiers.requestWildcard3b(S.events.find(e=>e.id===999))'),null);same(run('JSON.stringify(S)'),run('globalBudgetState'));
assert(run('validSave(S)'));
run('S.day=80;S.events=[{id:1000,name:"Next season",series:"ESL ONE",day:130,season:30,duration:8,pool:1000000}];Qualifiers.markCareer(S.events[0]);Qualifiers.freeze(S.events[0]);S.seed=1;nextYear=Qualifiers.requestWildcard3b(S.events.find(e=>e.id===1000));');
assert.equal(run('nextYear.year'),2027);assert.equal(run('S.qualifiers.operators3b.requests[2026].length'),1);assert.equal(run('S.qualifiers.operators3b.requests[2027].length'),1);assert(run('validSave(S)'));
console.log('PASS refusal persists, seasonal budget is global across operators, and the next career year opens a new attempt');
setup();run('savedForGuards=JSON.stringify(S);');
for(const change of [
 'S.events.find(e=>e.id===0).qualification.status="blocked";',
 'S.day=Qualifiers.wildcardStatus3b(S.events.find(e=>e.id===0)).child.day;',
 'S.events.push({id:999,name:"Busy qualifier",series:"FISSURE",day:22,duration:8,qualified13:[S.club]});',
 'S.events.push({id:999,name:"Busy main",series:"FISSURE",day:50,duration:8,qualified13:[S.club]});'
]){
 run('S=JSON.parse(savedForGuards);'+change+'guardBefore=JSON.stringify(S);');
 assert.equal(run('Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0))'),null);same(run('JSON.stringify(S)'),run('guardBefore'));
}
run(fixture.setup('PGL WALLACHIA',30,1,false));assert(!run('Qualifiers.wildcardStatus3b(S.events[0]).available'));
setup();run('const oldRequestRules=structuredClone(QUALIFIERS.wildcardRequest);Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0));frozenRequest=JSON.stringify(S.qualifiers.operators3b.requests);QUALIFIERS.wildcardRequest.minProbability=.8;QUALIFIERS.wildcardRequest.maxProbability=.9;QUALIFIERS.wildcardRequest.relationshipCost=5;S=JSON.parse(JSON.stringify(S));migrate();');
assert(run('validSave(S)'));same(run('JSON.stringify(S.qualifiers.operators3b.requests)'),run('frozenRequest'));
run('Object.assign(QUALIFIERS.wildcardRequest,oldRequestRules);corrupt=JSON.parse(JSON.stringify(S));corrupt.qualifiers.operators3b.requests[2026][0].accepted=false;');assert(!run('validSave(corrupt)'));
run('corrupt=JSON.parse(JSON.stringify(S));corrupt.qualifiers.operators3b.requests[2026].push(structuredClone(corrupt.qualifiers.operators3b.requests[2026][0]));');assert(!run('validSave(corrupt)'));
run('corrupt=JSON.parse(JSON.stringify(S));corrupt.events.find(e=>e.id===0).qualification.wildcard3b.replaced=S.club;');assert(!run('validSave(corrupt)'));
console.log('PASS timing/registration/conflict guards consume nothing; frozen odds survive config changes; inconsistent outcomes, budgets and receipts are rejected');
run(fixture.setup('PGL WALLACHIA',30,1,false));run('S.day=15;Qualifiers.freeze(S.events.find(e=>e.id===0));S.seed=1;Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0));wildcardJournal=JSON.stringify(S.qualifiers.operators3b);S.day=0;ensureTournamentCalendar();rngAfterReset=S.seed;Qualifiers.freeze(S.events.find(e=>e.id===0));');
same(run('JSON.stringify(S.qualifiers.operators3b)'),run('wildcardJournal'));assert.equal(run('S.seed'),run('rngAfterReset'));
assert(run('S.events.some(e=>e.qualifierFor===0&&e.entrants.includes(S.club)&&e.wildcard3b.restored)'));assert(run('validSave(S)'));
console.log('PASS accepted request reapplies after future-family reset without a new draw, relationship fee or season attempt');
run(fixture.setup('PGL WALLACHIA',30,1,false));run('S.day=15;Qualifiers.freeze(S.events.find(e=>e.id===0));S.seed=1;Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0));pendingApprovalJournal=JSON.stringify(S.qualifiers.operators3b);S.day=0;ensureTournamentCalendar();S.events.push({id:999,name:"Reconstructed booking",series:"FISSURE",day:50,duration:8,qualified13:[S.club]});Qualifiers.freeze(S.events.find(e=>e.id===0));pendingApprovalSeed=S.seed;');
assert(run('!!S.events.find(e=>e.id===0).qualification.wildcardRestorePending3b'));assert(!run('S.events.some(e=>e.qualifierFor===0&&e.entrants.includes(S.club))'));
run('S.events.find(e=>e.id===999).done=true;Qualifiers.update();');
assert(run('S.events.some(e=>e.qualifierFor===0&&e.entrants.includes(S.club)&&e.wildcard3b.restored)'));assert.equal(run('S.seed'),run('pendingApprovalSeed'));
same(run('JSON.stringify(S.qualifiers.operators3b)'),run('pendingApprovalJournal'));assert(run('validSave(S)'));
console.log('PASS a saved accepted request waits for calendar availability and reapplies automatically without reload or a second charge');
// A configurable second attempt can target another operator, never reroll an old target.
setup('PGL WALLACHIA',30,1000);run('QUALIFIERS.wildcardRequest.perSeason=2;Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0));S.events.push({id:999,name:"Second operator",series:"ESL ONE",day:100,season:30,duration:8,pool:1000000});Qualifiers.markCareer(S.events.find(e=>e.id===999));Qualifiers.freeze(S.events.find(e=>e.id===999));S.seed=1;secondConfigured=Qualifiers.requestWildcard3b(S.events.find(e=>e.id===999));');
assert(run('secondConfigured.accepted&&secondConfigured.number===2'));assert(run('validSave(S)'));
run('configuredSnapshot=JSON.stringify(S);Qualifiers.requestWildcard3b(S.events.find(e=>e.id===999));');same(run('JSON.stringify(S)'),run('configuredSnapshot'));
run('QUALIFIERS.wildcardRequest.perSeason=1;');assert(run('validSave(S)'));
for(const [points,fame,code] of [[0,0,'entered'],[100000,100,'invited']]){
 run(fixture.setup('PGL WALLACHIA',30,1,false));run('my().tier=1;clubState13(my()).elo=2000;clubState13(my()).seasonPoints='+points+';my().fame='+fame+';Qualifiers.freeze(S.events.find(e=>e.id===0));');
 assert.equal(run('Qualifiers.wildcardStatus3b(S.events.find(e=>e.id===0)).code'),code);
 run('eligibleGuardSnapshot=JSON.stringify(S);');assert.equal(run('Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0))'),null);same(run('JSON.stringify(S)'),run('eligibleGuardSnapshot'));
}
const p2=harness({modelVersion:8,stopBefore:'qualifiers/calendar-v3.js'});
p2.run('S.calendar21.installedDay=100000;S.events=[{id:0,name:"Frozen P2 field",series:"PGL WALLACHIA",day:50,duration:8,pool:1000000}];Qualifiers.markCareer(S.events[0]);Qualifiers.freeze(S.events[0]);');
const p2Save=p2.run('JSON.stringify(S)'),p2Events=p2.run('JSON.stringify(S.events)');run('S=JSON.parse('+JSON.stringify(p2Save)+');migrate();');
assert.equal(run('Qualifiers.wildcardStatus3b(S.events.find(e=>e.id===0)).code'),'legacy');same(run('JSON.stringify(S.events)'),p2Events);assert(run('validSave(S)'));
console.log('PASS configurable season limit, no requests for invited/entered clubs, and immutable genuine frozen P2 fields');
(async()=>{
 setup();run('Qualifiers.requestWildcard3b(S.events.find(e=>e.id===0));S.day=nextEvent().day;startEvent();');
 assert(run('S.active?.entrants.includes(S.club)&&S.active.bo===3'));
 let maps=0;while(!run('S.active.seriesDone')){
  run('{S.active.live=makeLive4(S.active,autoDraft([S.club,S.active.opponent]),[S.club,S.active.opponent]);let guard=0;while(S.active.live.finishedSide==null&&guard++<7200)simulateTick4(S.active.live,10);if(S.active.live.finishedSide==null)throw Error("Unfinished wildcard map");finishMap();}');maps++;
 }
 assert(maps>=2&&maps<=3);assert(run('Object.values(S.active.fatigue26.charged).some(r=>r.teams.every(t=>t.base===16))'));assert(run('validSave(S)'));
 console.log('PASS wildcard entrant plays real model-8 BO3 maps with retained difficulty, registered lineup and once-per-series fatigue');
})().catch(error=>{console.error(error);process.exitCode=1;});
