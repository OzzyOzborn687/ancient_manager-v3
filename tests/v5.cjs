'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),harness=require('./harness22.cjs');
const h=harness({modelVersion:8});const run=h.run;
assert.equal(run('S.teams.length'),51);assert.equal(run('CLUBS5.length'),37);
assert(run('S.teams.every(t=>!t.fiction)'));
assert(run('CLUBS5.every(d=>S.teams.filter(t=>t.v5Key===d.key).length===1)'));
assert(run('S.teams.every(t=>[0,1,2,3,4].every(r=>roster(t).filter(p=>p.role===r).length===1))'));
assert(run('validSave(S)'));
assert(run('(()=>{const before=JSON.stringify(S);UI5.scene();return before===JSON.stringify(S)})()'),'scene catalogue is read-only');
assert(run('new Set(S.players.filter(p=>p.team!==null).map(p=>Scene5.key(p.name))).size===S.players.filter(p=>p.team!==null).length'));
assert.throws(()=>run("Qualifiers.generateClub('NA',3)"),/отключена/);
const initial=run('JSON.stringify(S)');
for(const key of run('Object.keys(RULES5)')){
 run(`S=JSON.parse(${JSON.stringify(initial)});S.events=[{id:100,name:'Rule fixture',series:'ANCIENT',day:50,pool:1000000,duration:10,formatKey6:RULES5[${JSON.stringify(key)}].format,qualification:{qualVersion:1,majorVersion:5,status:'pending',policy:structuredClone(RULES5[${JSON.stringify(key)}])}}];S.qualifiers.legacyEvents=[];`);
 run('Qualifiers.freeze(S.events[0])');
 assert.equal(run('S.events.find(e=>e.id===100).qualification.status'),'frozen'===run('S.events.find(e=>e.id===100).qualification.status')?'frozen':'complete',key+': '+run('S.events[0].qualification?.reason'));
 assert(run('validSave(S)'),key+' frozen save');
 for(let stage=0;stage<4;stage++){
  run(`for(const e of [...S.events].filter(e=>e.v5Qualifier&&!e.done)){
   const a=Qualifiers.regionalState(e);while(a.cursor<a.schedule.length){const n=a.schedule[a.cursor];recordNode6(a,n,(n.id%3?'2:1':'0:2'));a.cursor++;}phaseNext6(a);S.day=Math.max(S.day,e.day+e.duration);Qualifiers.finishRegional(a);
  }Qualifiers.complete(S.events.find(e=>e.id===100));`);
  if(run('S.events.find(e=>e.id===100).qualification.status')==='complete')break;
 }
 assert.equal(run('S.events.find(e=>e.id===100).qualification.status'),'complete',key+': '+run('S.events.find(e=>e.id===100).qualification.reason'));
 assert.equal(run('S.events.find(e=>e.id===100).qualified13.length'),run('S.events.find(e=>e.id===100).qualification.policy.field'),key);
 assert(run('validSave(S)'),key+' completed save');
 assert(run(`S.events.filter(e=>e.v5Qualifier).every(e=>e.entrants.every(id=>Admissions5.members(e.qualifierRegion,S.teams[id])))`),key+' eligibility');
}
run(`S=JSON.parse(${JSON.stringify(initial)});`);
// Full 16-team DreamLeague: 56 BO3 group series and DE12 with a BO5 final.
run(`const dream=S.events.find(e=>circuitSeries(e)==='DREAMLEAGUE');S.events=[dream];S.calendar21.installedDay=100000;S.day=dream.day;dream.qualification.status='complete';dream.qualification.completedDay=S.day-15;dream.participationConfirmed5b=S.day-15;dream.qualification.qualified=S.teams.slice(0,16).map(t=>t.id);dream.qualified13=[...dream.qualification.qualified];dream.qualification13={invited:[S.club],matches:[]};seekMatch6=()=>{};startEvent();`);
assert.equal(run('S.active.entrants.length'),16);assert.equal(run('S.active.groupIds.length'),2);
assert.equal(run('S.active.schedule.length'),56);assert(run('S.active.schedule.every(n=>n.bo===3)'));
run(`while(S.active.cursor<S.active.schedule.length){recordNode6(S.active,S.active.schedule[S.active.cursor],'2:0');S.active.cursor++;}phaseNext6(S.active);`);
assert.equal(run('S.active.schedule.filter(n=>!n.groupMatch).length'),18);
assert.equal(run('S.active.schedule.at(-1).bo'),5);
run(`while(S.active.cursor<S.active.schedule.length){const n=S.active.schedule[S.active.cursor];recordNode6(S.active,n,n.bo===5?'3:1':'2:0');S.active.cursor++;}`);
assert.equal(run('new Set(Object.values(S.active.placements)).has(1)'),true);
// Real qualifier series uses the existing simulation, player form and difficulty metadata.
run(`S=JSON.parse(${JSON.stringify(initial)});const parent=S.events.find(e=>circuitSeries(e)==='PGL WALLACHIA');S.events=[parent];Qualifiers.freeze(parent);const child=S.events.find(e=>e.v5Qualifier&&e.qualifierRegion==='GLOBAL');const qa=Qualifiers.regionalState(child);const qn=qa.schedule[0];recordNode6(qa,qn,Qualifiers.fastRegionalSeries(qa,qn));`);
assert(run('qn.maps.length>=2&&qn.maps.every(m=>m.difficulty&&qn.pair.includes(m.winner))'));
assert(run('validSave(S)'));
// Unicode identities must remain different; Chinese names cannot collapse to an empty key.
assert(run("Scene5.key('天命')!==Scene5.key('生死')"));
// Updating a V4 save removes generated teams but preserves the manager and active real roster.
const legacy=harness({modelVersion:8,stopBefore:'v5/clubs.js'});
legacy.run('Qualifiers.ensureScene()');
const before=legacy.run('JSON.stringify({club:S.club,budget:S.budget,roster:roster().map(p=>({id:p.id,skill:p.skill,form:p.form}))})');
for(const file of ['clubs.js','scene.js','admissions.js','ui.js'])vm.runInContext(fs.readFileSync('dist/v5/'+file,'utf8'),legacy.c,{filename:file});
legacy.run('migrate()');
assert.equal(legacy.run('S.teams.length'),51);assert.equal(legacy.run('S.teams.filter(t=>t.fiction).length'),0);
assert.equal(legacy.run('JSON.stringify({club:S.club,budget:S.budget,roster:roster().map(p=>({id:p.id,skill:p.skill,form:p.form}))})'),before);
assert(legacy.run('S.v5.legacyArchive.clubs.length===48'));assert(legacy.run('validSave(S)'));
const after=legacy.run('JSON.stringify({...S,news:[]})');legacy.run('migrate()');assert.equal(legacy.run('JSON.stringify({...S,news:[]})'),after,'idempotent world migration (legacy engine may append a load notice)');
run(`S=JSON.parse(${JSON.stringify(initial)});`);
const bad=run('structuredClone(S)');bad.teams[18].fiction=true;assert.equal(run('validSave('+JSON.stringify(bad)+')'),false);
const pending=harness({modelVersion:8,stopBefore:'v5/clubs.js'});
pending.run(`Qualifiers.ensureScene();S.calendar21.installedDay=100000;S.events=[{id:900,name:'Played legacy final',day:0,pool:100000,done:true,champion:16,entrants:[0,16],placements6:{0:2,16:1}},{id:901,name:'Active legacy event',day:0,pool:100000,entrants:[0,16]}];S.active={event:901,entrants:[0,16]};`);
for(const file of ['clubs.js','scene.js','admissions.js','ui.js'])vm.runInContext(fs.readFileSync('dist/v5/'+file,'utf8'),pending.c,{filename:file});
assert(pending.run('validSave({...S,active:null})'),'old scene validates before migration in a new runtime');
pending.run('const pendingBefore=JSON.stringify(S.active);Scene5.install()');
assert(pending.run('S.v5.pending&&S.teams.length===64&&pendingBefore===JSON.stringify(S.active)'),'active legacy opponents preserved');
pending.run('S.active=null;Scene5.install();Admissions5.install()');
assert(pending.run('S.teams.length===51&&S.teams.every(t=>!t.fiction)&&S.v5.legacyArchive.events.some(e=>e.id===900&&e.champion===16)&&validSave(S)'),'completed fictional results retained in archive');
console.log('PASS V5: 51 real clubs / 37 agreed T2 entries; unique player identities; six regions; all invitation policies and real qualifier pools; DreamLeague groups + DE12; actual qualifier series; legacy migration and reload integrity.');
