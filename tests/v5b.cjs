'use strict';
const assert=require('node:assert/strict'),h=require('./harness22.cjs')({modelVersion:8}),r=h.run;
for(const series of ['BLAST SLAM','PGL WALLACHIA','ESL ONE','DREAMLEAGUE','THE INTERNATIONAL']){
 r(`fresh();S.calendar21.installedDay=100000;S.events=[{id:999,name:'Confirmation fixture',series:${JSON.stringify(series)},day:40,pool:1000000}];Admissions5.install();Qualifiers.freeze(S.events[0]);`);
 assert(r('S.events.filter(e=>e.v5Qualifier).every(e=>e.day-e.participationConfirmed5b>=15)'));
 r(`for(const c of [...S.events].filter(c=>c.v5Qualifier&&!c.done)){const a=Qualifiers.regionalState(c);while(a.cursor<a.schedule.length){recordNode6(a,a.schedule[a.cursor],'2:0');a.cursor++;}phaseNext6(a);S.day=c.day+c.duration+20;Qualifiers.finishRegional(a);}Qualifiers.complete(S.events.find(e=>e.id===999));`);
 assert(r('S.events.find(e=>e.id===999).qualification.status===\'complete\'&&S.events.find(e=>e.id===999).day-S.events.find(e=>e.id===999).participationConfirmed5b>=15&&validSave(S)'),series);
 r('var dates5b=JSON.stringify(S.events.map(e=>[e.id,e.day,e.participationConfirmed5b]));S=JSON.parse(JSON.stringify(S));migrate();Admissions5.install()');
 assert(r('dates5b===JSON.stringify(S.events.map(e=>[e.id,e.day,e.participationConfirmed5b]))&&validSave(S)'),'stable reload '+series);
}
r(`const event5b=S.events.find(e=>e.id===999);S.active={event:event5b.id,entrants:event5b.qualified13};const day5b=event5b.day;Participation5B.shift(event5b,day5b+30);`);assert(r('event5b.day===day5b'),'active event unchanged');
console.log('PASS V5.0 B: invitations, qualifiers, late results, 15-day notice, stable reload, valid saves and active-event protection.');
