'use strict';
const assert=require('node:assert/strict'),harness=require('./harness22.cjs'),fixture=require('./helpers/wildcards.cjs');
const {run}=harness({modelVersion:8});
for(const [series,season] of [['PGL WALLACHIA',30],['BLAST SLAM',30],['ESL ONE',30],['DREAMLEAGUE',30],['DREAMLEAGUE',31]]){
 run(fixture.setup(series,season));run('selectedQualifierEvent=0;beforeUI4=JSON.stringify(S);');
 for(const tab of ['invitations','regions','path']){
  run('qualifierTab='+JSON.stringify(tab)+';ui4=qualifiersView();');
  assert(!/undefined|NaN/.test(run('ui4')),'Displayed values and metric captions must be defined');
  assert.equal((run('ui4').match(/data-qualifier-tab=/g)||[]).length,3);
  if(tab==='invitations'){
   assert.equal((run('ui4').match(/data-invited-team=/g)||[]).length,6);
   assert(run('ui4.includes(S.events.find(e=>e.id===0).qualification.player.index.toFixed(4))&&ui4.includes(S.events.find(e=>e.id===0).qualification.player.cutoff.toFixed(4))'));
   assert.match(run('ui4'),/Ваш индекс и порог/);assert.match(run('ui4'),/вклад/);
  }
  if(tab==='regions')for(const r of ['EEU','EU','CN','SEA','NA']){
   run('selectedQualifierRegion4='+JSON.stringify(r)+';qualifierRegionStage4="groups";ui4=qualifiersView();');
   assert(run('ui4.includes(\'data-preview-region="'+r+'"\')'));assert.match(run('ui4'),/neon-node/);
   run('qualifierRegionStage4="playoffs";ui4=qualifiersView();');assert.match(run('ui4'),/neon-node/);
  }
 }
 assert(run('JSON.stringify(S)===beforeUI4'),'Views must not alter the saved world, RNG, results, roster or map');assert(run('validSave(S)'));
 run('S=JSON.parse(beforeUI4);migrate();');assert(run('validSave(S)'));
}
console.log('PASS five formats: six invitations, exact snapshot index/cutoff, all five regions, GSL/DE preview and every view leaves the entire saved world unchanged');
run(fixture.setup());run('selectedQualifierEvent=0;S.events.push({id:999,name:"Historical selection",series:"ESL ONE",day:0,done:true,qualification:{qualVersion:1,status:"pending"}});selectedQualifierEvent=999;');
assert.equal(run('nearestQualifier4().id'),0);assert(run('home().includes(\'data-qualification-event="0"\')'));assert(!run('home().includes(\'data-qualification-event="999"\')'));assert.equal(run('selectedQualifierEvent'),999);
run('const activeRegional=S.events.find(e=>e.qualifierFor===0);S.active={event:activeRegional.id};');assert.equal(run('nearestQualifier4().id'),0);
run('S.active=null;S.events.forEach(e=>e.done=true);');assert.equal(run('nearestQualifier4()'),undefined);
console.log('PASS nearest home event ignores historical inspection selection, includes pending events, follows active regional parent and omits finished events');
run(fixture.setup('PGL WALLACHIA',30,1,false));run('selectedQualifierEvent=0;qualifierTab="invitations";');assert.match(run('qualifiersView()'),/Расчёт появится после объявления/);
run('S.events[0].qualification.status="blocked";S.events[0].qualification.reason="No free dates <unsafe>";');
for(const tab of ['invitations','regions','path']){run('qualifierTab='+JSON.stringify(tab)+';');assert.match(run('qualifiersView()'),/No free dates &lt;unsafe&gt;/);}
run('S.events=[];');assert.match(run('qualifiersView()'),/События старой карьеры/);
console.log('PASS pending, blocked and empty legacy views, escaped blocking reason and unchanged three-tab structure');
