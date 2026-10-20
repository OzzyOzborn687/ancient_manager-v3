'use strict';
const assert=require('node:assert/strict'),harness=require('./harness22.cjs');
const {run}=harness({modelVersion:8});
const keys=['pgl','blast','dreamSwiss','dreamGroup','ti','esl','fissure','cup'];
run('home();home();');
for(const key of keys){
 run('var previewEvent={id:991,name:"Preview",formatKey6:'+JSON.stringify(key)+',day:S.day+30};var stateBefore=JSON.stringify(S),seedBefore=S.seed;var display=neonDisplayEvent(previewEvent);');
 assert.equal(run('display.a.entrants.length'),run('display.f.n'),key+' entrants');
 const html=run('display.f.kind==="de"?neonPlayoffGraph(playoffPreviewV1(display.key),playoffPreviewV1(display.key).schedule,false):neonGroupStage(display.a,display.f,false)');
 assert(html.length>100,key);assert(!/NaN|undefined/.test(html),key+' valid content');
 assert(run('JSON.stringify(S)===stateBefore&&S.seed===seedBefore'),key+' preview does not mutate the career or RNG');
}
run('var pgl=neonDisplayEvent({id:992,name:"PGL",formatKey6:"pgl"});var swiss=neonSwissData(pgl.a,pgl.f);var swissHTML=neonSwissBoard(pgl.a,pgl.f,false);');
assert.equal(run('swiss.columns.length'),6);
assert.equal(run('swiss.columns.flat().length'),15);
assert.equal((run('swissHTML').match(/>QUALIFIED</g)||[]).length,3);
assert.equal((run('swissHTML').match(/>ELIMINATED</g)||[]).length,3);
assert(run('swissHTML.includes("ELIMINATION<br>ROUND")&&swissHTML.includes(\'data-record="3-2"\')&&swissHTML.includes(\'data-record="2-3"\')'));
for(const [key,rounds,n] of [['dreamSwiss',6,24],['ti',5,16]]){
 run('var fixed=neonDisplayEvent({id:993,name:"Swiss",formatKey6:'+JSON.stringify(key)+'});var fixedData=neonSwissData(fixed.a,fixed.f);var fixedHTML=neonSwissBoard(fixed.a,fixed.f,false);');
 assert.equal(run('fixedData.columns.length'),rounds+1);
 assert.equal(run('fixed.a.schedule.length'),n/2);
 assert(!run('fixedHTML').includes('>QUALIFIED<'),'No early exit in fixed-round Swiss');
 assert(run('fixedData.columns.flat().some(b=>b.key==="0-3"&&!b.status)'));
}
run('pgl.a.schedule.forEach(n=>{n.score="2:0";n.w=n.pair[0];n.l=n.pair[1];});var history=neonSwissData(pgl.a,pgl.f);');
assert.equal(run('history.columns[0][0].ids.length'),16);
assert.equal(run('history.columns[1].find(b=>b.key==="1-0").ids.length'),8);
assert.equal(run('history.columns[1].find(b=>b.key==="0-1").ids.length'),8);
run('var blast=neonDisplayEvent({id:994,name:"BLAST",formatKey6:"blast"});var gslHTML=neonGroupStage(blast.a,blast.f,false);var bridgeHTML=neonBridge(blast.a,"blast",false);');
assert.equal((run('gslHTML').match(/data-match-id=/g)||[]).length,20);
assert.equal((run('bridgeHTML').match(/data-match-id=/g)||[]).length,4);
assert(run('bridgeHTML.includes("Last Chance")'));
for(const key of ['dreamGroup','esl','cup']){
 run('var rr=neonDisplayEvent({id:995,name:"RR",formatKey6:'+JSON.stringify(key)+'});var rrHTML=neonGroupStage(rr.a,rr.f,false);');
 assert.equal(run('rr.a.groupIds.length'),run('rr.f.n/rr.f.size'));
 assert.equal((run('rrHTML').match(/data-match-id=/g)||[]).length,run('rr.f.n*(rr.f.size-1)/2'));
 assert(run('rrHTML.includes("BO"+rr.f.bo)'));
}
for(const key of keys){
 run('var playoffProjection=playoffPreviewV1('+JSON.stringify(key)+');var playoffNodes=playoffProjection.schedule;var playoffHTML=neonPlayoffGraph(playoffProjection,playoffNodes,false);');
 const html=run('playoffHTML');
 assert.equal((html.match(/data-match-id=/g)||[]).length,run('playoffNodes.length'),key+' all playoff matches');
 assert.equal((html.match(/<path class="neon-edge/g)||[]).length,run('playoffNodes.reduce((s,n)=>s+n.pair.filter(v=>v&&typeof v==="object"&&Number.isInteger(v.id)).length,0)'),key+' dependency edges');
 assert(html.includes('LOWER BRACKET')&&html.includes('BO5'),key+' lower bracket and final');
}
run('var ti=neonDisplayEvent({id:996,name:"TI",formatKey6:"ti"});var tiBridge=neonBridge(ti.a,"ti",false);');
assert.equal((run('tiBridge').match(/data-match-id=/g)||[]).length,5);
assert(run('tiBridge.includes("Топ-3")&&tiBridge.includes("Место 13")'));
run('var liveHTML=neonMatchContents({id:0,pair:[1,S.club],bo:3,label:"Live"},{cursor:0,schedule:[],score:[1,0]},true);');
assert(/neon-match-score">0</.test(run('liveHTML')));
assert(/neon-match-score">1</.test(run('liveHTML')));
// Walk real schedule phases to exercise finished displays, without simulating maps or changing career results.
for(const key of keys){
 run('var actual=neonDisplayEvent({id:997,name:"Completed",formatKey6:'+JSON.stringify(key)+'}).a;actual.placements={};actual.event=997;S.events=S.events.filter(e=>e.id!==997);S.events.push({id:997,day:S.day});if(FORMAT6[actual.formatKey6].kind==="de"){de8_6(actual,actual.entrants);actual.stage6="playoffs";}var phaseGuard=0;do{for(const n of actual.schedule){if(n.score)continue;var pair=n.pair.map(v=>resolve6(actual,v));var score=n.bo===5?"3:1":"2:0";n.score=score;n.w=pair[0];n.l=pair[1];}if(++phaseGuard>12)throw Error("Phase loop");}while(phaseNext6(actual));var completed={id:997,name:"Completed",formatKey6:actual.formatKey6,format:"circuit-v6",done:true,champion:actual.schedule.at(-1).w,entrants:actual.entrants,seeds6:actual.seeds,schedule6:actual.schedule,groupIds6:actual.groupIds,gsl6:actual.gsl};var completedView=neonDisplayEvent(completed);var completedGroups=neonGroupStage(completedView.a,completedView.f,false);var completedPlayoffs=neonPlayoffGraph(completedView.a,completedView.a.schedule.filter(isPlayoffV1),false);');
 assert(run('completedView.a.schedule.length===actual.schedule.length&&!completedView.preview'),key+' stored schedule');
 assert(!/NaN|undefined/.test(run('completedGroups+completedPlayoffs')),key+' finished view');
 assert.equal((run('completedPlayoffs').match(/data-match-id=/g)||[]).length,run('actual.schedule.filter(isPlayoffV1).length'),key+' actual playoff matches');
 if(key==='pgl')assert.equal(run('neonSwissData(completedView.a,completedView.f).qualified.size'),8);
}
console.log('PASS neon tournaments: 8 real formats, pure previews, full 24-team field, Swiss history/thresholds, all RR/GSL matches, playoff dependencies, BO5 finals, BLAST/TI bridges and live score orientation');
