'use strict';
const assert=require('node:assert/strict'),harness=require('./harness22.cjs');
const {run}=harness({modelVersion:8}),plain=code=>JSON.parse(run('JSON.stringify('+code+')'));
function setup(series='PGL WALLACHIA',day=50,extra=[]){
 run('fresh();S.seed=4545;S.calendar21.installedDay=100000;S.events='+JSON.stringify([{id:0,name:'Calendar fixture',series,season:30,day,duration:8,pool:1000000},...extra])+';Qualifiers.markCareer(S.events[0]);');
}
function finishRegions(){
 run(`S.day=Math.max(S.day,S.events.find(e=>e.id===0).qualification.calendar.qualStart);Qualifiers.ensureRegistrations3();
 for(const e of [...S.events].filter(e=>e.qualifierFor===0)){
  if(e.done)continue;const a=Qualifiers.regionalState(e);while(true){if(a.cursor>=a.schedule.length){if(phaseNext6(a))continue;break;}
   const n=a.schedule[a.cursor];S.day=Math.max(S.day,n.day13);recordNode6(a,n,Qualifiers.fastRegionalSeries(a,n));a.cursor++;}
  Qualifiers.finishRegional(a);
 }`);
}
setup();run('S.day=15;Qualifiers.freeze(S.events[0]);');
assert.deepEqual(plain('S.events.find(e=>e.id===0).qualification.calendar.segments'),[7,18,3,7]);
assert.deepEqual(plain('((c)=>[c.announcedDay,c.qualStart,c.qualEnd,c.listDay,c.mainDay])(S.events.find(e=>e.id===0).qualification.calendar)'),[15,22,40,43,50]);
assert(run('validSave(S)'));
const min=plain('QUALIFIERS.calendar.minSegments'),preferred=plain('QUALIFIERS.calendar.preferredSegments');
for(let span=min.reduce((a,b)=>a+b,0);span<=35;span++){
 const values=plain('Qualifiers.calendarSegments3('+span+')');
 assert.equal(values.reduce((a,b)=>a+b,0),span);assert(values.every((v,i)=>v>=min[i]&&v<=preferred[i]));
 assert.deepEqual(plain('Qualifiers.calendarSegments3('+span+')'),values);
}
assert.equal(run('Qualifiers.calendarSegments3(1)'),null);
console.log('PASS normal -35/-28/-10/-7 timeline and integer proportional compression with configured minima');
setup('DREAMLEAGUE',30,[{id:9,name:'Confirmed official event',series:'FISSURE',day:2,duration:16,entrants:[0]}]);
run('Qualifiers.freeze(S.events[0]);');
assert.equal(run('S.events.find(e=>e.id===0).day'),30,'Compress before postponing the main event');
assert(run('S.events.find(e=>e.id===0).qualification.calendar.compressed'));
assert(run('S.events.filter(e=>e.qualifierFor===0).every(e=>e.day>=19&&e.day+e.duration<=S.events.find(v=>v.id===0).qualification.calendar.listDay-1)'));
assert(run('validSave(S)'));
finishRegions();run('S.day=S.events.find(e=>e.id===0).qualification.calendar.listDay;Qualifiers.complete(S.events.find(e=>e.id===0));');
assert.equal(run('S.events.find(e=>e.id===0).qualification.qualified.length'),24);assert(run('validSave(S)'));
assert(run('S.events.filter(e=>e.qualifierFor===0).every(e=>e.schedule6.every((n,i,a)=>i===0||n.slot13>=a[i-1].slot13))'));
assert(run('S.events.filter(e=>e.qualifierFor===0).every(e=>e.schedule6.every(n=>n.slot13+QUALIFIERS.regional.slotDays<=e.day+e.duration))'));
console.log('PASS dense calendar keeps main date, official gap and complete chronological GSL16→DE8 inside the reserved window');
setup('PGL WALLACHIA',25,[{id:9,name:'No free dates',series:'FISSURE',day:1,duration:500,entrants:[0]}]);run('Qualifiers.freeze(S.events[0]);');
assert.equal(run('S.events.find(e=>e.id===0).qualification.status'),'blocked');assert(run('validSave(S)'));
assert(run('home().includes("Минимальные интервалы")'));
console.log('PASS impossible calendar produces a saved advance warning and no shortened tournament field');
setup();run('Qualifiers.freeze(S.events[0]);const heldInvite=S.events.find(e=>e.id===0).qualification.invited[0].team;');
finishRegions();
run('S.events.push({id:999,name:"Late official booking",series:"FISSURE",day:50,duration:8,qualified13:[heldInvite]});S.day=43;const beforeList=JSON.stringify(S);Qualifiers.complete(S.events.find(e=>e.id===0));');
assert(run('!S.events.find(e=>e.id===0).qualification.invited.some(v=>v.team===heldInvite)'));
assert.equal(run('S.events.find(e=>e.id===0).qualification.invited.length'),6);
assert(run('S.events.find(e=>e.id===0).qualification.inviteChanges3.some(v=>v.regionalEvent!==null)'),'Next frozen-index club may have already played a regional qualifier');
assert(run('validSave(S)'));
run('const finalizedField=JSON.stringify(S.events.find(e=>e.id===0).qualification),seedAtList=S.seed;S=JSON.parse(beforeList);migrate();Qualifiers.complete(S.events.find(e=>e.id===0));');
assert.equal(run('JSON.stringify(S.events.find(e=>e.id===0).qualification)'),run('finalizedField'));assert.equal(run('S.seed'),run('seedAtList'));
run('const broken=JSON.parse(JSON.stringify(S));broken.events.find(e=>e.id===0).qualification.inviteChanges3=[];');assert(!run('validSave(broken)'));
console.log('PASS conflict replacement follows frozen index, records regional history, preserves exact N, rejects forged history and survives reload without RNG use');
run('const closed=JSON.stringify(S.events.find(e=>e.id===0).qualification.qualified),closedSeed=S.seed,lateTeam=S.events.find(e=>e.id===0).qualification.qualified[0];S.events.push({id:998,name:"Post-deadline booking",series:"FISSURE",day:50,duration:8,qualified13:[lateTeam]});Qualifiers.auditFinalFields3();');
assert.equal(run('S.events.find(e=>e.id===0).qualification.status'),'blocked');assert(run('validSave(S)'));
assert(run('Qualifiers.registeredRoster3(lateTeam)'));
run('S.events.find(e=>e.id===998).done=true;Qualifiers.auditFinalFields3();');
assert.equal(run('S.events.find(e=>e.id===0).qualification.status'),'complete');assert.equal(run('JSON.stringify(S.events.find(e=>e.id===0).qualification.qualified)'),run('closed'));
assert.equal(run('S.seed'),run('closedSeed'));assert(run('validSave(S)'));
console.log('PASS post-deadline conflict warns in advance, preserves closed rosters/field and resumes without reroll when resolved');
run('const closedRegistration=JSON.stringify(S.events.find(e=>e.id===0).registration3),listDate=S.events.find(e=>e.id===0).qualification.calendar.listDay,finishedOfficial={id:997,name:"Long finished official",series:"FISSURE",day:S.day,duration:20,done:true};S.events.push(finishedOfficial);finishCalendar13(finishedOfficial);');
assert.equal(run('S.events.find(e=>e.id===0).day'),run('S.day+QUALIFIERS.regional.minGap'));
assert.equal(run('S.events.find(e=>e.id===0).qualification.calendar.listDay'),run('listDate'));
assert.equal(run('JSON.stringify(S.events.find(e=>e.id===0).registration3)'),run('closedRegistration'));assert(run('validSave(S)'));
console.log('PASS overdue main participation moves after official play without changing the historical closed roster date');
setup();run('clubState13(my()).elo=200;my().fame=0;Qualifiers.freeze(S.events[0]);const delayedOwn=S.events.find(e=>e.qualifierFor===0&&e.entrants.includes(S.club));S.day=delayedOwn.day;Qualifiers.ensureRegistrations3();const lockedBeforeDelay=JSON.stringify(delayedOwn.registration3),seedBeforeDelay=S.seed;S.day=55;Qualifiers.catchUpCalendar3(true);');
assert.equal(run('delayedOwn.day'),56);assert(run('delayedOwn.schedule6.every(n=>n.slot13>=delayedOwn.day)'));
assert.equal(run('JSON.stringify(delayedOwn.registration3)'),run('lockedBeforeDelay'));assert.equal(run('S.seed'),run('seedBeforeDelay'));
assert(run('S.events.find(e=>e.id===0).qualification.calendar.listDay>=delayedOwn.day+delayedOwn.duration+QUALIFIERS.calendar.minSegments[2]'));assert(run('validSave(S)'));
console.log('PASS delayed own qualifier shifts only unplayed slots, preserves its registered lineup and postpones the final deadline safely');
setup();run('Qualifiers.freeze(S.events[0]);const aiRegion=S.events.find(e=>e.qualifierFor===0&&!e.entrants.includes(S.club)),closedRegionalIds=JSON.stringify(aiRegion.entrants),aiTarget=aiRegion.entrants[0],originalRegionalDay=aiRegion.day;S.events.push({id:999,name:"Late AI official commitment",series:"FISSURE",day:aiRegion.day,duration:30,qualified13:[aiTarget]});S.day=aiRegion.day;Qualifiers.ensureRegistrations3();');
assert(run('aiRegion.day>=originalRegionalDay+30+QUALIFIERS.regional.minGap'));
assert.equal(run('JSON.stringify(aiRegion.entrants)'),run('closedRegionalIds'));
assert(!run('aiRegion.registration3'));assert(run('aiRegion.schedule6.every(n=>!n.score&&n.slot13>=aiRegion.day)'));
assert(run('validSave(S)'));
run('S.day=aiRegion.day;Qualifiers.ensureRegistrations3();');assert(run('!!aiRegion.registration3'));assert(run('validSave(S)'));
console.log('PASS late official conflict for an AI participant postpones its regional series, preserves the closed field and captures its roster only at the new start');
setup();run('S.events.push({id:1,name:"Other operator",series:"ESL ONE",day:55,duration:8,pool:1000000});Qualifiers.markCareer(S.events[1]);Qualifiers.freeze(S.events.find(e=>e.id===0));Qualifiers.freeze(S.events.find(e=>e.id===1));');
assert(run('S.events.find(e=>e.id===0).qualification.invited.every(v=>!S.events.find(e=>e.id===1).qualification.invited.some(w=>w.team===v.team))'));
assert(run('S.events.filter(e=>e.qualifierFor===0).every(a=>S.events.filter(e=>e.qualifierFor===1).every(b=>!Qualifiers.overlap(a,b)))'));
assert(run('S.events.filter(e=>Qualifiers.isRegional(e)).every(e=>e.entrants.every(id=>!Qualifiers.busy(e,id)))'));
assert(run('validSave(S)'));
console.log('PASS two operators retain prior commitments, disjoint qualifier windows and conflict-free regional entrants');
run('fresh();S.seed=330;S.calendar21.installedDay=100000;clubState13(my()).elo=200;my().fame=0;S.events=Array.from({length:4},(_,id)=>({id,name:"Dense season "+id,series:id%2?"DREAMLEAGUE":"PGL WALLACHIA",season:30,day:50+id*20,duration:8,pool:1000000}));for(const e of S.events)Qualifiers.markCareer(e);');
run(`for(let days=0;days<150&&!S.events.filter(e=>Qualifiers.isCalendar3(e)).every(e=>e.done);days++){
 tick();for(const e of [...S.events].filter(e=>Qualifiers.isRegional(e)&&!e.done&&e.entrants.includes(S.club)&&e.day<=S.day)){
  const a=Qualifiers.regionalState(e);while(true){if(a.cursor>=a.schedule.length){if(phaseNext6(a))continue;break;}
   const n=a.schedule[a.cursor],pair=n.pair.map(v=>resolve6(a,v));recordNode6(a,n,pair.includes(S.club)?pair[0]===S.club?'2:0':'0:2':Qualifiers.fastRegionalSeries(a,n));a.cursor++;}Qualifiers.finishRegional(a);
 }
 for(const e of S.events.filter(e=>Qualifiers.isCalendar3(e)&&!e.done&&e.qualification.status==='complete'&&S.day>=e.day+e.duration-1)){e.entrants=[...e.qualified13];e.done=true;e.completedDay20=S.day;}
 if(S.events.some(e=>e.qualification?.status==='blocked'))throw Error('Unexpected dense-season block');
}`);
assert(run('S.events.filter(e=>Qualifiers.isCalendar3(e)).length===4&&S.events.filter(e=>Qualifiers.isCalendar3(e)).every(e=>e.done&&e.qualified13.length===format6(e).n)'));
assert(run('((events)=>events.every((a,i)=>events.slice(i+1).every(b=>Qualifiers.family3(a)===Qualifiers.family3(b)||!Qualifiers.overlap(a,b))))(S.events.filter(e=>(e.entrants||[]).includes(S.club)))'));
assert.equal(run('Qualifiers.registeredRoster3(S.club)'),null);assert(run('validSave(S)'));
console.log('PASS four-event dense season with real calendar ticks, recorded qualifier series, exact fields and disjoint manager commitments; no balance claim');
// A P2 career with a real active map keeps its calendar and exact saved model.
const old=harness({modelVersion:8,stopBefore:'qualifiers/calendar-v3.js'});
old.run('S.calendar21.installedDay=100000;S.events=[{id:0,name:"P2 active",series:"PGL WALLACHIA",day:50,duration:8,pool:1000000}];clubState13(my()).elo=200;my().fame=0;Qualifiers.markCareer(S.events[0]);Qualifiers.freeze(S.events[0]);S.day=nextEvent().day;startEvent();S.active.live=makeLive4(S.active,autoDraft([S.club,S.active.opponent]),[S.club,S.active.opponent]);');
const oldSave=old.run('JSON.stringify(S)'),active=old.run('JSON.stringify(S.active)');
run('S=JSON.parse('+JSON.stringify(oldSave)+');migrate();');
assert.equal(run('JSON.stringify(S.active)'),active);assert.equal(run('S.events.find(e=>e.id===0).qualification.calendarVersion'),undefined);assert(run('validSave(S)'));
old.run('for(let i=0;i<60;i++)simulateTick4(S.active.live,10);');run('for(let i=0;i<60;i++)simulateTick4(S.active.live,10);');
assert.equal(run('JSON.stringify(S.active.live)'),old.run('JSON.stringify(S.active.live)'));
console.log('PASS active P2 model-8 map and frozen P2 event continue exactly on the retained model');
(async()=>{
 setup('DREAMLEAGUE');run('clubState13(my()).elo=200;my().fame=0;Qualifiers.freeze(S.events[0]);S.day=nextEvent().day;startEvent();');
 assert.equal(run('S.active?.formatKey6'),'qualifier16');
 await run('autoTournament13()');
 assert.equal(run('S.active'),null);assert(run('S.events.some(e=>e.qualifierFor===0&&e.done&&e.entrants.includes(S.club))'));assert(run('validSave(S)'));
 assert(run('S.events.filter(e=>e.qualifierFor===0&&e.done).every(e=>e.schedule6.every(n=>n.slot13+QUALIFIERS.regional.slotDays<=e.day+e.duration))'));
 console.log('PASS full real model-8/coaching GSL16→DE8 qualification, official series ledger and valid saved calendar');
})().catch(error=>{console.error(error);process.exitCode=1;});
