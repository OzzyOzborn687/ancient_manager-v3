'use strict';
const assert=require('node:assert/strict'),h=require('./harness22.cjs')({modelVersion:8}),r=h.run;
r(`function introFixture(){fresh();S.calendar21.installedDay=100000;S.events=[{id:998,name:'Opening fixture',series:'FISSURE',day:0,pool:100000,formatKey6:'eight5',qualified13:S.teams.slice(0,8).map(t=>t.id)}];return S.events[0];}`);
r('var eIntro=introFixture(),dayIntro=S.day;TournamentIntro52A.open();');assert(r('!S.active&&TournamentIntro52A.event===998&&S.day===dayIntro'));
assert(r("TournamentIntro52A.markup(eIntro).includes(my().name)&&roster().every(p=>TournamentIntro52A.markup(eIntro).includes(p.name))"));
r('TournamentIntro52A.close();');assert(r('!S.active&&!TournamentIntro52A.event'));
r('TournamentIntro52A.open();TournamentIntro52A.start();');assert(r('S.active?.event===998&&!TournamentIntro52A.event&&validSave(S)'));
r('introFixture();advance();');assert(r('!S.active&&TournamentIntro52A.event===998'));r('TournamentIntro52A.withdraw();');assert(r('!S.active&&S.events[0].background51.withdrawn&&validSave(S)'));
r('introFixture();S.events[0].day=20;TournamentIntro52A.open();');assert(r('!TournamentIntro52A.event&&!S.active'));
r('introFixture();TournamentIntro52A.open();S=JSON.parse(JSON.stringify(S));migrate();');assert(r('!TournamentIntro52A.event&&!S.active&&validSave(S)'));
r('introFixture();TournamentIntro52A.open();S.club=1;');r('TournamentIntro52A.close();');
for(const team of [0,3,12,16]){r(`introFixture();S.club=${team};`);assert(r('TournamentIntro52A.markup(S.events[0]).includes(my().name)'));}
assert(r("btn('Start','startEvent()').includes('TournamentIntro52A.open()')"));
console.log('PASS V5.2 A: generic club/roster data, no early match start, confirm/escape/withdraw, next-day entry, future guard, migration and UI-only routing.');
r('introFixture();var renderBeforeIntro=JSON.stringify(S);');
for(const key of r('Object.keys(TOURNAMENTS5)')){
 h.c.tournamentKeyIntro=key;
 assert(r(`(()=>{const spec=TOURNAMENTS5[tournamentKeyIntro],e={id:1000,name:'Tournament '+tournamentKeyIntro,series:tournamentKeyIntro,day:0,formatKey6:spec.format};return TournamentIntro52A.markup(e).includes(spec.field+' КОМАНД')})()`));
}
assert.equal(r('JSON.stringify(S)'),r('renderBeforeIntro'));
console.log('PASS all sixteen tournament templates render without mutating career state.');
