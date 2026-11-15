'use strict';
const assert=require('node:assert/strict'),h=require('./harness22.cjs')({modelVersion:8,renderReal:true}),r=h.run;
r(`function fixture51b(){fresh();S.calendar21.installedDay=100000;S.events=[{id:920,name:'FISSURE Playground first',series:'FISSURE',day:40,duration:3,pool:100000},{id:921,name:'FISSURE Playground next',series:'FISSURE',day:45,duration:3,pool:100000}];Admissions5.install();for(const e of [...S.events])Qualifiers.freeze(e);S.day=33;S.budget=1000000;S.v4.camps={};campEvent4=920;selectedQualifierEvent=920;return S.events[0];}`);
r('fixture51b();var day51b=S.day,seed51b=S.seed,players51b=JSON.stringify(S.players),budget51b=S.budget;');
assert(r("home().includes(\"skipUpcomingTournament51B(920)\")"));
assert(r('skipUpcomingTournament51B(920)'));
assert(r('nextEvent().id===921&&S.day===day51b&&S.seed===seed51b&&S.budget===budget51b&&JSON.stringify(S.players)===players51b&&!S.active&&campEvent4===921&&CampUI4.selected().id===921'));
assert(r("home().includes(\"skipUpcomingTournament51B(921)\")&&home().includes(\"Открыть буткемп\")"));
assert(r("Camp4.reason(S.events.find(e=>e.id===921),S.club,'elite')===''&&validSave(S)"));
assert(!r('skipUpcomingTournament51B(920)'),'Stale double click must not skip the successor');
r('S=JSON.parse(JSON.stringify(S));migrate();');assert(r('nextEvent().id===921&&validSave(S)'));
// Cancelling the old camp follows the existing voluntary refund rule exactly once.
r("fixture51b();Camp4.book(920,'elite');var paid51b=S.budget;skipUpcomingTournament51B(920);");
assert(r("Camp4.plans()[Camp4.key(920)].status==='cancelled'&&Camp4.plans()[Camp4.key(920)].refund===112000&&S.budget===paid51b+112000"));
assert(r("Camp4.book(921,'elite').ok&&Camp4.plans()[Camp4.key(921)].status==='active'&&validSave(S)"));
r('var once51b=S.budget;migrate();migrate();');assert.equal(r('S.budget'),r('once51b'));
// Existing queued withdrawals from 5.1 A with an active camp are repaired on load.
r("fixture51b();Camp4.book(920,'elite');S.events[0].background51={version:1,status:'queued',withdrawn:true,queuedDay:S.day};var beforeRepair51b=S.budget;migrate();");
assert(r("Camp4.plans()[Camp4.key(920)].status==='cancelled'&&S.budget===beforeRepair51b+112000&&Camp4.reason(S.events.find(e=>e.id===921),S.club,'elite')===''&&validSave(S)"));
// Existing confirmation/window rules remain effective for the next camp.
r("fixture51b();skipUpcomingTournament51B(920);S.day=20;");assert(r("Camp4.reason(S.events.find(e=>e.id===921),S.club,'elite').includes('7–14')"));
r('fixture51b();S.practice13={team:1};');assert(!r('skipUpcomingTournament51B(920)'));
console.log('PASS V5.1 B: early home skip switches event immediately without calendar/player changes; stale clicks rejected; correct next invitation/camp selection; ordinary camp rules; cancellation/refund once; old withdrawal/camp repair; save reload.');
