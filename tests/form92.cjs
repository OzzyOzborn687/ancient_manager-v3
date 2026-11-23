'use strict';
const assert=require('node:assert/strict'),{run:r}=require('./harness22.cjs')({modelVersion:8});
const close=(a,b,msg)=>assert(Math.abs(a-b)<1e-8,`${msg}: ${a} != ${b}`);
r(`function fixture92(form=75,fatigue=0){fresh();S.calendar21.installedDay=100000;S.events=[{id:990,name:'Form fixture',series:'ANCIENT',day:10,pool:100000,entrants:[S.club]}];S.v4.camps={};development21().staff=1;development21().recovery=1;S.training='balanced';for(const p of roster()){p.form=form;p.fatigue=fatigue;}return roster()[0];}`);
for(const [form,gross,loss] of [[69,2,0],[70,1.2,0],[84.99,1.2,0],[85,.7,.1],[91.99,.7,.1],[92,.4,.2],[96.99,.4,.2],[97,.2,.3],[99,.2,.3]]){
 r(`fixture92(${form});var state92=JSON.stringify(S),preview92=trainingPreview33();`);
 assert(r('JSON.stringify(S)===state92'),'preview is pure including RNG');
 close(r('preview92[0].formGain'),gross,'tier gross');close(r('preview92[0].formDecay'),loss,'tier decay');
 r('trainingDay33();');close(r('roster()[0].form'),Math.min(99,form+gross-loss),'actual net');
 assert(r('roster().every((p,i)=>p.form===preview92[i].form)&&validSave(S)'),'preview equals actual and save valid');
 r('var once92=JSON.stringify(roster());playerGrowth13(roster()[0],S.training,S.facility,trainingFocus33());');
 assert(r('JSON.stringify(roster())===once92'),'repeat day changes neither form nor growth');
}
for(const [fatigue,mult] of [[25,1],[25.01,.75],[45,.75],[45.01,.4],[65,.4],[65.01,0]]){
 r(`fixture92(75,${fatigue});S.training='intensive';var pre92=trainingPreview33();trainingDay33();`);
 close(r('roster()[0].form'),75+1.2*1.25*mult,'pre-training fatigue threshold');
 close(r('roster()[0].fatigue'),fatigue+6,'intensive fatigue');
}
for(const tier of ['online','standard','advanced','elite']){
 const mult={online:1,standard:1.15,advanced:1.3,elite:1.5}[tier];
 r(`fixture92(69);S.budget=1000000;Camp4.book(990,${JSON.stringify(tier)});var previewCamp92=trainingPreview33();trainingDay33();`);
 close(r('roster()[0].form'),69+2*mult,'camp multiplier, no flat award');
 assert(r('roster()[0].form===previewCamp92[0].form&&validSave(S)'));
 if(tier!=='online')close(r('Object.values(Camp4.plans())[0].days[1].players[roster()[0].id].form'),2*mult,'camp ledger');
}
r("fixture92(60);development21().staff=5;S.budget=1000000;S.training='intensive';Camp4.book(990,'elite');trainingDay33();");
close(r('roster()[0].form'),63.75,'combined cap');assert(r('validSave(S)'),'camp ledger accepts maximum V9.2 gain');
r("fixture92(99);S.training='rest';trainingDay33();");close(r('roster()[0].form'),98.7,'rest loses only peak decay');
r("fixture92(99);trainingDay33(true);");close(r('roster()[0].form'),98.7,'skip day peak decay');
r("fixture92(99);Growth8.plan(roster()[0],'specialist');trainingDay33();");close(r('roster()[0].form'),98.7,'service replaces training and never truncates form to 95');
r("fixture92(99);Growth8.plan(roster()[0],'psych');trainingDay33();");close(r('roster()[0].form'),98.8,'psych small form bonus minus decay');
// A loss/map or final placement no longer charges form separately.
r("fixture92(98);var p92=roster()[0];formRecord21(p92,false,990);tournamentDevelopment21({done:true,name:'Exit',placements6:{[S.club]:9}});");close(r('p92.form'),98,'no stacked map/exit penalty');
// Role-aware performance: support farm/kill count cannot lower a good contribution score.
r(`fixture92(80);var ids92=[S.club,1],stats92={};for(const id of ids92)for(const p of roster(S.teams[id]))stats92[p.id]={team:id,role:p.role,k:0,a:id===S.club?18:5,d:id===S.club?1:5,nw:p.role>=3?(id===S.club?1000:25000):15000,kills:20,maps:2};Form92.settle(ids92,stats92);`);
close(r('roster()[4].form'),80.4,'support contribution without farm or kills');
assert(r("roster().every(p=>p.form92.lastSeries.quality==='Хорошее выступление')"));
r('for(let i=0;i<10;i++)Form92.settle(ids92,stats92,true);');close(r('roster()[4].form'),80.6,'daily positive scrim cap');assert(r('validSave(S)'));
// New maps use form once, with exactly the same exponential unit as an OVR point.
r(`fixture92(75);var m92=makeLive4({opponent:1},autoDraft([S.club,1]),[S.club,1]),h92=m92.sides[0].heroes[0];h92.form=75;var neutral92=Match8.unit(m92,h92);h92.form=99;var peak92=Match8.unit(m92,h92);h92.form=55;var low92=Match8.unit(m92,h92);delete m92.formVersion92;var old92=Match8.unit(m92,h92);`);
close(r('peak92/neutral92'),Math.exp(r('BALANCE8.power.skill')*6),'99 => +6 strength equivalent');
close(r('low92/neutral92'),Math.exp(r('BALANCE8.power.skill')*-5),'55 => -5 strength equivalent');
close(r('old92'),r('unitBeforeForm92.call(Match8,m92,h92)'),'unmarked saved map keeps original power');
r('fixture92(75);var baseStrength92=strength();for(const p of roster())p.form=99;');
close(r('strength()-baseStrength92'),6*r('patchMultiplierV1(S.club)'),'career strength counts form once');
// One series award despite duplicate record calls, survives a reload.
r(`fixture92(80);var a92={schedule:[{id:0,pair:[S.club,1],bo:3,label:'Test series',day13:S.day,slot13:0}],cursor:0,placements:{},entrants:[S.club,1],event:990};var n92=a92.schedule[0];recordNode6(a92,n92,'2:0');var onceSeries92=JSON.stringify(roster().map(p=>[p.form,p.form92]));recordNode6(a92,n92,'2:0');`);
assert(r('JSON.stringify(roster().map(p=>[p.form,p.form92]))===onceSeries92'),'duplicate result cannot award twice');
r('var savedForm92=JSON.stringify(roster().map(p=>p.form));S=JSON.parse(JSON.stringify(S));migrate();');
assert(r('validSave(S)&&JSON.stringify(roster().map(p=>p.form))===savedForm92'),'migration does not overwrite progress');
r('var malformed92=structuredClone(S);malformed92.players[0].form92={day:S.day+1,gain:0,decay:0};');assert(!r('validSave(malformed92)'),'future form stamp rejected');
// Maintaining elite form takes a mix of workload, recovery and good series.
r(`fixture92(75);var pp92=roster()[0];for(let day=1;day<=150;day++){S.day=day;playerGrowth13(pp92,pp92.fatigue>25?'rest':'balanced',1,'mechanics');}var trainOnly92=pp92.form;for(let day=151;day<=240&&pp92.form<99;day++){S.day=day;playerGrowth13(pp92,pp92.fatigue>25?'rest':'intensive',1,'mechanics');const op=roster(S.teams[1])[0];Form92.settle([S.club],{[pp92.id]:{team:S.club,role:0,k:10,a:12,d:0,nw:30000,kills:25,maps:1},[op.id]:{team:1,role:0,k:1,a:1,d:8,nw:15000,kills:10,maps:1}});}var finalForm92=pp92.form;`);
assert(r('trainOnly92>=95&&trainOnly92<98'),'ordinary training cannot trivially hold maximum');
close(r('finalForm92'),99,'well managed preparation and good performance can reach 99');
r('fixture92(99);roster()[0].form=100;S=JSON.parse(JSON.stringify(S));migrate();');assert(r('roster()[0].form===99&&validSave(S)'), 'legacy form 100 migrates to cap 99');
console.log('PASS V9.2: tiers, fatigue, decay, camps, cap99, preview/actual, rest/skip/services, role-aware series, scrim cap, no stacked penalties, old maps, exact match power, career power and reload.');
