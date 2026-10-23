'use strict';
const assert=require('node:assert/strict'),harness=require('./harness22.cjs');
const {run}=harness({modelVersion:8}),plain=code=>JSON.parse(run('JSON.stringify('+code+')'));
run('S.calendar21.installedDay=100000;S.events=[{id:0,name:"Manager qualifier",series:"PGL WALLACHIA",day:50,duration:8,pool:1000000}];Qualifiers.markCareer(S.events[0]);clubState13(my()).elo=200;my().fame=0;Qualifiers.freeze(S.events[0]);');
assert(run('S.events.some(e=>Qualifiers.isRegional(e)&&e.entrants.includes(S.club))'));
assert(run('home().includes("Ваш путь — региональная квалификация")'));
assert(run('calendar().includes("Награда:")'));
assert(run('qualifiersView().includes("Приглашения")&&qualifiersView().includes("Мой путь")'));
run('const ownEvent=nextEvent();S.day=ownEvent.day;startEvent();const a0=S.active;');
assert.equal(run('S.active.qualifierFor'),0);assert.equal(run('S.active.bo'),3);assert.equal(run('S.active.format6'),true);
assert.equal(run('Match22.seriesFatiguePreview(S.active,S.club).base'),16);assert(run('validSave(S)'));
run('const firstNode=S.active.schedule[S.active.cursor],initialFatigue=roster().map(p=>p.fatigue),chargedBefore=Object.keys(Match22.fatigueState(S.active).charged).length;');
// Finish real model-8 maps through the retained map/series handlers.
let maps=0;
while(!run('S.active.seriesDone')){
 run('{S.active.live=makeLive4(S.active,autoDraft([S.club,S.active.opponent]),[S.club,S.active.opponent]);let steps=0;while(S.active.live.finishedSide==null&&steps++<7200)simulateTick4(S.active.live,10);if(S.active.live.finishedSide==null)throw Error("Unfinished qualification map");finishMap();}');
 maps++;
 if(!run('S.active.seriesDone'))assert.deepEqual(plain('roster().map(p=>p.fatigue)'),plain('initialFatigue'));
}
assert(maps>=2&&maps<=3);
assert.equal(run('Object.keys(S.active.fatigue26.charged).length'),run('chargedBefore+1'));
assert.deepEqual(plain('S.active.fatigue26.charged[Match22.seriesKey(S.active,[S.club,S.active.opponent],firstNode)].teams.map(t=>t.base)'),[16,16]);
const afterFatigue=plain('roster().map(p=>p.fatigue)');
run('S=JSON.parse(JSON.stringify(S));migrate();const nodeReload=S.active.schedule[S.active.cursor];recordNode6(S.active,nodeReload,(nodeReload.pair.map(v=>resolve6(S.active,v))[0]===S.club?S.active.score:[...S.active.score].reverse()).join(":"));');
assert.deepEqual(plain('roster().map(p=>p.fatigue)'),afterFatigue);assert.equal(run('Object.keys(S.active.fatigue26.charged).length'),run('chargedBefore+1'));assert(run('validSave(S)'));
console.log('PASS real model-8 qualifier maps, manual entry, BO3, 16 fatigue per SERIES and exactly-once JSON continuation');
// Other regions progress without replacing the manager's active state.
run('S.day=35;const managerState=JSON.stringify(S.active);Qualifiers.backgroundRegionals();');
assert.equal(run('JSON.stringify(S.active)'),run('managerState'));assert(run('S.events.filter(e=>Qualifiers.isRegional(e)&&!e.entrants.includes(S.club)).every(e=>e.done)'));
console.log('PASS independent background regions preserve manager state and use frozen per-map difficulty');
// Finish this bracket using deterministic recorded scores; this is a bracket/UI
// contract, not a balance experiment. Preserve the real first-series result.
run('const originalTitles=S.trophies;const a=S.active;while(true){if(a.cursor>=a.schedule.length){if(phaseNext6(a))continue;break;}const n=a.schedule[a.cursor];if(!n.score){const ids=n.pair.map(v=>resolve6(a,v));recordNode6(a,n,ids[0]===S.club?"2:0":ids[1]===S.club?"0:2":Qualifiers.fastRegionalSeries(a,n));}a.cursor++;}Qualifiers.finishRegional(a);');
assert.equal(run('S.active'),null);assert.equal(run('S.trophies'),run('originalTitles'));
assert(run('S.events.find(e=>e.id===ownEvent.id).inviteWinners.includes(S.club)'));
assert(run('trophiesView20().includes("ИНВАЙТ ЗАВОЁВАН")'));
assert(!run('wins20().some(e=>Qualifiers.isRegional(e))'));
assert(run('home().includes("Инвайт завоёван")'));
run('S.day=43;Qualifiers.complete(S.events.find(e=>e.id===0));');
assert.equal(run('S.events.find(e=>e.id===0).qualified13.length'),16);assert(run('validSave(S)'));
const eventResult=run('JSON.stringify(S.events.find(e=>e.id===ownEvent.id))'),budget=run('S.budget');
run('Qualifiers.finishRegional(a);');assert.equal(run('JSON.stringify(S.events.find(e=>e.id===ownEvent.id))'),eventResult);assert.equal(run('S.budget'),budget);
console.log('PASS invite award for top-K, trophy gallery, exact main field, archived series ledger and idempotent settlement');
run('fresh();S.calendar21.installedDay=100000;S.events=[{id:0,name:"Direct invitation",series:"PGL WALLACHIA",day:50,duration:8,pool:1000000}];clubState13(my()).seasonPoints=100000;Qualifiers.markCareer(S.events[0]);Qualifiers.freeze(S.events[0]);');
assert(run('S.events.find(e=>e.id===0).qualification.invited.some(v=>v.team===S.club)'));
assert(run('home().includes("Ваш клуб приглашён на турнир")'));
assert(!run('S.events.some(e=>Qualifiers.isRegional(e)&&e.entrants.includes(S.club))'));
assert.equal(run('nextEvent().id'),0);
console.log('PASS direct invitation on home and qualifier bypass');
run('fresh();S.calendar21.installedDay=100000;S.events=[{id:0,name:"Withdrawal fixture",series:"PGL WALLACHIA",day:50,duration:8,pool:1000000}];Qualifiers.markCareer(S.events[0]);clubState13(my()).elo=200;my().fame=0;Qualifiers.freeze(S.events[0]);const withdrawal=nextEvent(),closed=[...withdrawal.entrants];S.day=withdrawal.day;withdrawal.skipRequestedV12=true;S.pendingSkipV12=withdrawal.id;startEvent();');
assert.deepEqual(plain('[...S.active.entrants].sort((a,b)=>a-b)'),plain('[...closed].sort((a,b)=>a-b)'));
run('S.active.withdrawnV12=true;const ownNode=S.active.schedule[S.active.cursor],pair=ownNode.pair.map(v=>resolve6(S.active,v)),walkoverFatigue=roster().map(p=>p.fatigue);recordNode6(S.active,ownNode,pair[0]===S.club?"0:2":"2:0");');
assert.deepEqual(plain('roster().map(p=>p.fatigue)'),plain('walkoverFatigue'));
run('const movedParent=S.events.find(e=>e.id===0);movedParent.day=withdrawal.day-1;');assert.equal(run('nextEvent().id'),run('withdrawal.id'));
console.log('PASS withdrawal retains regional entrants, walkovers add no workload and unfinished qualification precedes its parent');
