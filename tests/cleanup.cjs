'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),harness=require('./harness22.cjs');
const html=fs.readFileSync('dist/index.html','utf8'),scripts=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
assert.equal(scripts.length,new Set(scripts).size);
for(const path of scripts)assert(fs.existsSync('dist/'+path),'Missing deployed script '+path);
for(const [dependency,consumer] of [['hero-pools.js','game.js'],['career-v1.js','world-v1.2.js'],['config/ti-festival.js','ti-event.js'],['v5/legacy-admissions.js','v5/admissions.js'],['v5/admissions.js','v5/hotfix-b.js']])assert(scripts.indexOf(dependency)<scripts.indexOf(consumer),dependency+' before '+consumer);
assert(!scripts.some(path=>/mandatory-field|hotfix-mandatory|hotfix-mobile-nav|hotfix-coach|hotfix-a/.test(path)));
const h=harness({modelVersion:8}),r=h.run;
assert.equal(r(`startupText('<img src="x" onerror="alert(1)">&')`),'&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;&amp;');
assert(r('validSave(S)&&S.teams.length===51'));
for(const [series,slots] of [['BLAST SLAM',1],['PGL WALLACHIA',1],['ESL ONE',1],['DREAMLEAGUE',1],['THE INTERNATIONAL',0]]){
 r(`fresh();S.calendar21.installedDay=100000;S.events=[{id:909,name:'Cleanup fixture',series:${JSON.stringify(series)},day:60,pool:1000000}];Admissions5.install();Qualifiers.freeze(S.events[0]);`);
 assert.equal(r('S.events.find(e=>e.id===909).qualification.policy.field-S.events.find(e=>e.id===909).qualification.policy.direct'),slots);
 assert(r('validSave(S)'));
 if(slots){assert.equal(r('S.events.find(e=>e.id===909).qualification.status'),'frozen','No automatic qualification bypass');assert(r('Admissions5.mandatoryIds().every(id=>S.events.find(e=>e.id===909).qualification.invited.some(v=>v.team===id))'));}
}
// Repair the exact failure shape of the removed forced-field patch, keeping earned qualifier wins.
r(`fresh();S.calendar21.installedDay=100000;S.events=[{id:909,name:'Legacy forced fixture',series:'PGL WALLACHIA',day:60,pool:1000000}];Admissions5.install();Qualifiers.freeze(S.events[0]);var childCleanup=S.events.find(e=>e.v5Qualifier),aCleanup=Qualifiers.regionalState(childCleanup);while(aCleanup.cursor<aCleanup.schedule.length){recordNode6(aCleanup,aCleanup.schedule[aCleanup.cursor],'2:0');aCleanup.cursor++;}phaseNext6(aCleanup);S.day=childCleanup.day+childCleanup.duration;Qualifiers.finishRegional(aCleanup);var winnerCleanup=childCleanup.inviteWinners[0],eCleanup=S.events.find(e=>e.id===909),fieldCleanup=S.teams.map(t=>t.id).filter(id=>id!==winnerCleanup).slice(0,16);eCleanup.qualification.status='complete';eCleanup.qualification.qualified=[...fieldCleanup];eCleanup.qualification.invited=fieldCleanup.slice(0,15).map(team=>({team,reason:'mandatory',text:'Обязательный инвайт'}));eCleanup.qualified13=[...fieldCleanup];eCleanup.qualification13={mode:'mandatory-hard-v5',invited:fieldCleanup.slice(0,15),matches:[],majorVersion:5};S.qualifiers.version=2;var packetCleanup=JSON.stringify(makePacket(S,'Forced legacy'));var ownedCleanup=JSON.stringify(owned()),budgetCleanup=S.budget,playedCleanup=JSON.stringify(childCleanup.schedule6);`);
assert(r('!!decodePacket(packetCleanup)'),'Old damaged metadata remains importable');
r('S=JSON.parse(packetCleanup).state;migrate();Qualifiers.complete(S.events.find(e=>e.id===909));');
assert(r('validSave(S)&&S.events.find(e=>e.id===909).qualified13.includes(winnerCleanup)'));
assert(r('ownedCleanup===JSON.stringify(owned())&&budgetCleanup===S.budget'));
assert.equal(r('JSON.stringify(S.events.find(e=>e.id===childCleanup.id).schedule6)'),r('playedCleanup'));
assert(r('S.events.find(e=>e.id===909).day-S.events.find(e=>e.id===909).participationConfirmed5b>=15'));
r('var stableCleanup=JSON.stringify({...S,news:[]});migrate();');assert.equal(r('JSON.stringify({...S,news:[]})'),r('stableCleanup'));
// One coach action in both manual phases; no forced changes to spectator or active fields.
r(`fresh();S.calendar21.installedDay=100000;S.events=[{id:799,name:'Coach fixture',series:'FISSURE',day:0,pool:1000000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];startEvent();`);
assert.equal(r('(matchView().match(/autoTournament13\\(\\)/g)||[]).length'),1);
r('playMap()');assert.equal(r('(matchView().match(/autoTournament13\\(\\)/g)||[]).length'),1);
r('var activeCleanup=JSON.stringify(S.active);Admissions5.install();');assert.equal(r('JSON.stringify(S.active)'),r('activeCleanup'));
console.log('PASS cleanup: deployed assets/order, one admission policy, honest qualifiers, mandatory clubs, legacy forced-packet repair, earned wins, unchanged player progress, 15-day notice, stable reload, one coach action and active-map protection.');
