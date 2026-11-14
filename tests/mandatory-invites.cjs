'use strict';
const assert=require('node:assert/strict'),h=require('./harness22.cjs')({modelVersion:8}),r=h.run;
assert.equal(r('Admissions5.mandatoryIds().length'),15);
assert.equal(r('new Set(Admissions5.mandatoryIds()).size'),15);
assert.equal(r('new Set(REGIONAL_GRANDS5.map(name=>Qualifiers.region(S.teams.find(t=>t.name===name)))).size'),6);
for(const [series,name,n,all] of [
 ['PGL WALLACHIA','PGL Wallachia',16,true],['BLAST SLAM','BLAST Slam',16,true],['DREAMLEAGUE','DreamLeague',16,true],['ESL ONE','ESL One',16,true],['THE INTERNATIONAL','THE INTERNATIONAL',16,true],
 ['BETBOOM DACHA','BetBoom Dacha',12,false],['1WIN SERIES','1win Series',8,false],['FISSURE','FISSURE Universe',10,false],['FISSURE','FISSURE Playground',16,false],['CLAVISION','Clavision',10,false],['ASIAN CHAMPIONS LEAGUE','Asian Champions League',8,false],['RIYADH MASTERS','Riyadh Masters',20,false]]){
 r(`fresh();S.calendar21.installedDay=100000;S.events=[{id:900,name:${JSON.stringify(name)},series:${JSON.stringify(series)},day:70,pool:1000000}];for(const t of S.teams){clubState13(t).seasonPoints=Admissions5.mandatoryIds().includes(t.id)?0:100000;}Admissions5.install();Qualifiers.freeze(S.events[0]);var parentMandatory=S.events.find(e=>e.id===900);`);
 assert.equal(r('format6(parentMandatory).n'),n);
 assert(r('Admissions5.priorityIds(parentMandatory.qualification.policy).every(id=>parentMandatory.qualification.invited.some(v=>v.team===id&&v.reason===\'mandatory\'))'),name);
 if(all){assert.equal(r('Admissions5.priorityIds(parentMandatory.qualification.policy).length'),15);assert(r('parentMandatory.qualification.invited.some(v=>S.teams[v.team].name===\'Xtreme Gaming\')'));}
 assert(r('S.events.filter(e=>e.v5Qualifier).every(e=>e.quota===1&&e.entrants.every(id=>!Admissions5.mandatoryIds().includes(id)))'));
 r(`for(const c of [...S.events].filter(e=>e.v5Qualifier&&!e.done)){const a=Qualifiers.regionalState(c);while(a.cursor<a.schedule.length){recordNode6(a,a.schedule[a.cursor],'2:0');a.cursor++;}phaseNext6(a);S.day=c.day+c.duration;Qualifiers.finishRegional(a);}Qualifiers.complete(parentMandatory);`);
 assert(r('parentMandatory.qualification.status===\'complete\'&&new Set(parentMandatory.qualified13).size===format6(parentMandatory).n&&validSave(S)'),name);
 assert(r('parentMandatory.day-parentMandatory.participationConfirmed5b>=15'));
 r('var fieldMandatory=JSON.stringify(S.events.map(e=>({id:e.id,day:e.day,qualification:e.qualification,qualified13:e.qualified13,entrants:e.entrants,confirmed:e.participationConfirmed5b})));S=JSON.parse(JSON.stringify(S));migrate();');
 assert.equal(r('JSON.stringify(S.events.map(e=>({id:e.id,day:e.day,qualification:e.qualification,qualified13:e.qualified13,entrants:e.entrants,confirmed:e.participationConfirmed5b})))'),r('fieldMandatory'),'stable saved field '+name);
}
// Reproduce the previous policy in an existing career, including two unplayed BLAST slots.
r(`fresh();S.calendar21.installedDay=100000;S.events=[{id:901,name:'BLAST Slam migration',series:'BLAST SLAM',day:70,pool:1000000}];Admissions5.install();var oldMandatory=S.events[0],oldRule=oldMandatory.qualification.policy;delete oldRule.mandatory;delete oldRule.mandatoryVersion;oldRule.direct=14;oldRule.quotas={GLOBAL:2};Qualifiers.freeze(oldMandatory);var removedMandatory=Object.values(oldMandatory.qualification.regionalEvents),playersMandatory=JSON.stringify(S.players),budgetMandatory=S.budget;migrate();`);
assert(r('S.events.find(e=>e.id===901).qualification.policy.mandatoryVersion===1'));
assert(r('removedMandatory.every(id=>!S.events.some(e=>e.id===id))&&S.v5.legacyArchive.events.some(e=>removedMandatory.includes(e.id))'));
r('Qualifiers.freeze(S.events.find(e=>e.id===901));');
assert(r('Admissions5.mandatoryIds().every(id=>S.events.find(e=>e.id===901).qualification.invited.some(v=>v.team===id))&&validSave(S)'));
assert(r('JSON.stringify(S.players)===playersMandatory&&S.budget===budgetMandatory'));
// Already-started qualifiers retain their original policy, roster and scored matches.
r(`fresh();S.calendar21.installedDay=100000;S.events=[{id:902,name:'BLAST Slam played migration',series:'BLAST SLAM',day:70,pool:1000000}];Admissions5.install();var playedParent=S.events[0],playedRule=playedParent.qualification.policy;delete playedRule.mandatory;delete playedRule.mandatoryVersion;playedRule.direct=14;playedRule.quotas={GLOBAL:2};Qualifiers.freeze(playedParent);var playedChild=S.events.find(e=>e.v5Qualifier),playedState=Qualifiers.regionalState(playedChild);recordNode6(playedState,playedState.schedule[0],'2:0');playedState.cursor++;var playedPacket=JSON.stringify(playedChild),playedPolicy=JSON.stringify(playedParent.qualification.policy);Admissions5.install();`);
assert.equal(r('JSON.stringify(playedChild)'),r('playedPacket'));
assert.equal(r('JSON.stringify(playedParent.qualification.policy)'),r('playedPolicy'));
assert(r('validSave(S)'));
console.log('PASS mandatory invites: exact 15 clubs despite low rankings; six regional grands; all field sizes; one earned qualifier slot; 15-day deadline; stable reload; previous-policy migration and played-qualifier protection.');
