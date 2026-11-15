'use strict';
const assert=require('node:assert/strict'),h=require('./harness22.cjs')({modelVersion:8}),r=h.run;
r(`function fixture51(own=false){fresh();S.calendar21.installedDay=100000;S.events=[{id:900,name:'Background fixture',series:'FISSURE',day:0,duration:4,pool:100000,formatKey6:'eight5',qualified13:S.teams.slice(own?0:1,own?8:9).map(t=>t.id)},{id:901,name:'Later own fixture',series:'ANCIENT',day:80,pool:100000}];S.v4.camps={};for(const p of roster()){p.form=70;p.fatigue=10;p.progress21.initialForm=70;p.progress21.results=[];}S.training='balanced';return S.events[0];}`);
r('fixture51();var start51=S.day,ownMaps51=clubState13(my()).maps,ownPrizes51=S.prizes;');
assert(r('nextEvent().id===901&&trainingAvailable33()&&!locked()'));
r('trainingDay33();');
assert(r('S.day===start51+1&&!S.active&&!busy13&&roster().every(p=>p.form>70)&&clubState13(my()).maps===ownMaps51'));
assert(r('S.events[0].background51.status===\'running\'&&S.events[0].schedule6.some(n=>n.score)&&S.events[0].schedule6.every(n=>!n.score||n.day13<=S.day)&&validSave(S)'));
r('var score51=JSON.stringify(S.events[0].schedule6),seed51=S.seed;migrate();');
assert.equal(r('JSON.stringify(S.events[0].schedule6)'),r('score51'));assert.equal(r('S.seed'),r('seed51'));
// Finish with calendar days. Completion must not jump time, steal navigation or award the absent club.
r(`var nextDate51=S.events.find(e=>e.id===901).day;page='market';while(!S.events.find(e=>e.id===900).done){var beforeDay51=S.day;tick();if(S.day!==beforeDay51+1)throw Error('Background jumped calendar');}var final51=S.events.find(e=>e.id===900);`);
assert(r('page===\'market\'&&!S.active&&final51.reward===0&&final51.place===null&&S.prizes===ownPrizes51&&S.events.find(e=>e.id===901).day===nextDate51&&validSave(S)'));
assert(r('final51.schedule6.every(n=>!!n.score)&&Number.isInteger(final51.champion)&&final51.sponsor4a&&final51.qualifiersFameApplied&&final51.developmentApplied21'));
r('var settled51=JSON.stringify(S);Background51.update();');assert.equal(r('JSON.stringify(S)'),r('settled51'));
// An old career in spectator auto-simulation is detached without losing an unfinished AI map.
r(`fixture51();S.events=S.events.filter(e=>e.id===900);var nextRead51=nextEvent;nextEvent=nextBeforeBackground51;try{startBeforeBackground51()}finally{nextEvent=nextRead51;}var legacy51=S.active;var node51=legacy51.schedule[0],pair51=node51.pair.map(v=>resolve6(legacy51,v));legacy51.sim13={cursor:0,pair:pair51,score:[0,0],maps:[],live:makeLive4({opponent:pair51[1]},autoDraft(pair51),pair51)};simulateTick4(legacy51.sim13.live,10);var live51=legacy51.sim13.live,clock51=live51.clock;Background51.detach(legacy51);`);
assert(r('!S.active&&S.events[0].background51.state.sim13.live===live51&&live51.clock===clock51&&trainingAvailable33()&&validSave(S)'));
r('Background51.update();');assert(r('S.events[0].schedule6[0].score&&validSave(S)'));
// A voluntary withdrawal must release the club immediately, without simulating future dates.
r('fixture51(true);S.events[0].day=10;var queuedDay51=S.day;skipTournament12();');
assert(r('S.day===queuedDay51&&!S.active&&!locked()&&trainingAvailable33()&&S.events[0].background51.status===\'queued\'&&validSave(S)'));
r('while(!S.events.find(e=>e.id===900).done)tick();var withdrew51=S.events.find(e=>e.id===900);');
assert(r('withdrew51.skippedV12&&withdrew51.reward===0&&withdrew51.champion!==S.club&&withdrew51.schedule6.filter(n=>n.pair.map(v=>resolve6({schedule:withdrew51.schedule6},v)).includes(S.club)).every(n=>n.forfeitV12===S.club)&&validSave(S)'));
// Preserve an unrelated live tournament when an AI tournament settles on the same date.
r(`fixture51();Background51.queue(S.events[0]);Background51.create(S.events[0]);var bg51=S.events[0],a51=bg51.background51.state;while(a51.cursor<a51.schedule.length){var n51=a51.schedule[a51.cursor];recordNodeBase13(a51,n51,'2:0');a51.cursor++;}while(phaseNext6(a51)){while(a51.cursor<a51.schedule.length){var n51=a51.schedule[a51.cursor];recordNodeBase13(a51,n51,'2:0');a51.cursor++;}}S.active={event:901,entrants:[S.club],marker:'own active'};var protected51=S.active;Background51.finish(bg51);`);
assert(r('S.active===protected51&&S.active.marker===\'own active\''));
console.log('PASS V5.1 A: club controls stay available; calendar-time AI results; no time jumps; no absent-club prizes/maps; saved partial map retained; migration/reload; future withdrawal; idempotent rewards; unrelated active event protected.');
// Saved spectator migration continues the exact AI map, with no draft/map recreation.
r(`fixture51();S.events=S.events.filter(e=>e.id===900);nextRead51=nextEvent;nextEvent=nextBeforeBackground51;try{startBeforeBackground51()}finally{nextEvent=nextRead51;}legacy51=S.active;node51=legacy51.schedule[0];pair51=node51.pair.map(v=>resolve6(legacy51,v));legacy51.sim13={cursor:0,pair:pair51,score:[0,0],maps:[],live:makeLive4({opponent:pair51[1]},autoDraft(pair51),pair51)};simulateTick4(legacy51.sim13.live,10);var originalMap51=legacy51.sim13.live,firstClock51=null,firstIdentity51=false,tickMap51=simulateTick4;simulateTick4=function(m,...args){if(firstClock51===null){firstClock51=m.clock;firstIdentity51=m===originalMap51;}return tickMap51(m,...args);};try{migrate();}finally{simulateTick4=tickMap51;}`);
assert.equal(r('firstClock51'),10);assert(r('firstIdentity51&&!S.active&&validSave(S)'));
// Withdrawing from a qualifier does not block ordinary training or invent an invitation.
r(`fresh();S.calendar21.installedDay=100000;S.events=[{id:910,name:'PGL Wallachia background qualifier',series:'PGL WALLACHIA',day:70,pool:1000000}];Admissions5.install();Qualifiers.freeze(S.events[0]);var qChild51=S.events.find(e=>e.v5Qualifier);S.club=qChild51.entrants[0];S.day=qChild51.day;skipTournament12();`);
assert(r('!S.active&&trainingAvailable33()&&qChild51.background51.withdrawn'));
r('while(!qChild51.done)tick();');
assert(r('!qChild51.inviteWinners.includes(S.club)&&S.events.find(e=>e.id===910).qualified13.includes(qChild51.inviteWinners[0])&&!S.events.find(e=>e.id===910).qualified13.includes(S.club)&&validSave(S)'));
// Reject corrupted background state and preserve a partially won series when withdrawing.
r(`fixture51(true);startEvent();var ownA51=S.active,ownN51=ownA51.schedule[ownA51.cursor];ownA51.score=[1,0];ownA51.maps=[{win:true,durationSec:1800}];skipTournament12();var withdrawnA51=S.events[0].background51.state;S.day=Math.max(S.day,ownN51.day13);Background51.series(withdrawnA51,ownN51);`);
assert(r('ownN51.score===(ownN51.pair.map(v=>resolve6(withdrawnA51,v))[0]===S.club?\'1:2\':\'2:1\')&&ownN51.maps.length===1'));
r('var malformed51=structuredClone(S);malformed51.events[0].background51.state.cursor=99999;');assert(!r('validSave(malformed51)'));
console.log('PASS extended V5.1 A: exact saved AI map continuation; qualifier withdrawal and earned invitations; retained map win on withdrawal; corrupt state rejection.');
// Completion of a background tournament must leave an actual own live map byte-identical.
r(`fixture51();Background51.queue(S.events[0]);Background51.create(S.events[0]);bg51=S.events[0];a51=bg51.background51.state;do{while(a51.cursor<a51.schedule.length){var n51=a51.schedule[a51.cursor];recordNodeBase13(a51,n51,'2:0');a51.cursor++;}}while(phaseNext6(a51));S.events.push({id:903,name:'Own concurrent fixture',series:'FISSURE',day:0,pool:100000,formatKey6:'eight5',qualified13:S.teams.slice(0,8).map(t=>t.id)});startEvent();playMap();var protectedOwn51=S.active,protectedOwnRaw51=JSON.stringify(S.active),ownDay51=S.day;page='saves';Background51.finish(bg51);`);
assert(r('S.active===protectedOwn51&&JSON.stringify(S.active)===protectedOwnRaw51&&page===\'saves\'&&S.day===ownDay51&&validSave(S)'));
console.log('PASS concurrent actual live map, draft gate, score, calendar and save screen remain unchanged when background results settle.');
// A failed AI map must not prevent the player's training or discard the resumable job.
r(`fixture51();var realSeries51=Background51.series;Background51.series=function(){throw Error('Injected background interruption');};trainingDay33();Background51.series=realSeries51;`);
assert(r('trainingAvailable33()&&!locked()&&roster().every(p=>p.form>70)&&S.events[0].background51.error===\'Injected background interruption\'&&validSave(S)'));
r('tick();');assert(r('!S.events[0].background51.error&&S.events[0].schedule6.some(n=>n.score)&&validSave(S)'));
console.log('PASS background interruption leaves club controls and training available, then resumes without rerolling completed results.');
