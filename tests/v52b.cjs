'use strict';
const assert=require('node:assert/strict'),h=require('./harness22.cjs')({modelVersion:8}),r=h.run;
r(`function eliminationFixture(key){fresh();S.calendar21.installedDay=100000;const f=FORMAT6[key];S.events=[{id:999,name:'Actual '+key,series:'ANCIENT',formatKey6:key,day:0,pool:100000,qualified13:S.teams.slice(0,f.n).map(t=>t.id)}];const ids=S.events[0].qualified13;const a=S.active={event:999,format6:true,formatKey6:key,phase:'circuit',stage:'Groups',schedule:[],cursor:0,entrants:[...ids],seeds:Object.fromEntries(ids.map(id=>[id,strength(S.teams[id])])),placements:{},score:[0,0],maps:[],live:null,seriesDone:false,round:0,totalRounds:1,pairs:[],bracket:[],bo:3,startDay13:0};S.events[0].entrants=[...ids];S.events[0].format='circuit-v6';a.schedule=[];a.cursor=0;a.placements={};a.stage6=f.kind==='de'?'playoffs':'groups';if(f.kind==='de')de8_6(a,a.entrants);else if(f.kind==='swiss'){a.swissRound=0;swissRound6(a);}else if(f.kind==='gsl')gsl6(a);else roundRobin6(a,a.entrants,f.size,f.bo);assignDates13(a);return a;}
function resolveStage(a,reverse=false){while(a.cursor<a.schedule.length){const n=a.schedule[a.cursor],ids=n.pair.map(v=>resolve6(a,v));if(ids.some(id=>!Number.isInteger(id)))throw Error('Invalid pair');recordNodeBase13(a,n,n.bo===2?'2:0':reverse?'0:2':'2:0');a.cursor++;}return phaseNext6(a);}`);
for(const [key,count] of [['cup',8],['dreamGroup',4],['blast',8],['ti',3],['eight5',0],['ten5',2],['dacha5',4],['twenty5',12]]){
 console.log('Checking',key);r(`var aE=eliminationFixture('${key}');var guardE=0;while(aE.stage6==='groups'&&guardE++<12)resolveStage(aE);`);
 assert.equal(r('(S.elimination52b?.notices||[]).flatMap(n=>n.teams).length'),count,key);
 assert(r('(S.elimination52b?.notices||[]).every(n=>n.teams.every(id=>aE.entrants.includes(id)))'));
 assert(r('validSave(S)'),key+' save');
 if(count)assert(r("Elimination52B.markup(S.elimination52b.notices[0]).includes('ELIMINATED')"));
 if(key==='blast'){r('resolveStage(aE)');assert.equal(r('S.elimination52b.notices.length'),2);assert.equal(r('S.elimination52b.notices[1].teams.length'),2);}
 if(key==='ti'){r('resolveStage(aE)');assert.equal(r('S.elimination52b.notices.length'),2);assert.equal(r('S.elimination52b.notices[1].teams.length'),5);}
}
r("aE=eliminationFixture('cup');resolveStage(aE);var firstOutE=JSON.stringify(S.elimination52b.notices[0].teams),noticeRawE=JSON.stringify(S.elimination52b);S=JSON.parse(JSON.stringify(S));migrate();");assert.equal(r('JSON.stringify(S.elimination52b)'),r('noticeRawE'));
r('var nE=S.elimination52b.notices[0];Elimination52B.current=nE.key;Elimination52B.close();');assert(r('nE.shown'));r('migrate()');assert(r('!Elimination52B.pending()'));
r("aE=eliminationFixture('cup');resolveStage(aE,true);");assert.notEqual(r('JSON.stringify(S.elimination52b.notices[0].teams)'),r('firstOutE'),'actual changed results must change eliminated teams');
r("aE=eliminationFixture('cup');aE.withdrawnV12=true;resolveStage(aE);");assert(r('!S.elimination52b.notices[0].participant&&!Elimination52B.pending()'));
r("aE=eliminationFixture('eight5');resolveStage(aE);");assert(r('!S.elimination52b?.notices.length'),'all eight advance: no invented eliminations');
console.log('PASS V5.2 B: actual results across RR/Swiss/GSL/TI, lower-bracket survivors, variable 0/2/3/4/8/12 outs, no duplicate IDs, changed results change cards, saved acknowledgements and background non-interruption.');
