'use strict';
const assert=require('node:assert/strict'),{run}=require('./harness22.cjs')();
const test=(name,code)=>{assert(run(code),name);console.log('PASS',name)};
run(`function fatigueFixture26(bo=3,stage='groups'){
 fresh();S.seed=1000;for(const id of [0,6])for(const p of roster(S.teams[id]))p.fatigue=10;
 const node={id:0,pair:[0,6],bo,groupMatch:stage==='groups',label:'Тестовая серия',day13:S.day,slot13:S.day};
 const a=S.active={event:S.events[0].id,format6:true,stage6:stage,cursor:0,schedule:[node],score:[0,0],maps:[],opponent:6,bo,phase:'circuit',stage:'Тест',round:0,totalRounds:1,bracket:[],pairs:[]};
 Match22.fatigueState(a);return a;
}
function completeCard26(a,winner){const m=a.live=makeLive4(a,autoDraft([0,6]),[0,6]);m.clock=1800;Match22.finish(m,winner,'ancient');finishMap();return m;}`);
test('groups repeat 20/30/25/25 once per series, independently for each team',`(()=>{
 const a=fatigueFixture26();let expected=[20,30,25,25,20,30,25,25];
 for(let i=0;i<expected.length;i++){
  const node={id:i,pair:[0,6],groupMatch:true};a.schedule[i]=node;
  for(const id of [0,6])for(const p of roster(S.teams[id]))p.fatigue=0;
  if(!Match22.chargeSeries(a,[0,6],node)||Match22.chargeSeries(a,[6,0],node))return false;
  if(![0,6].every(id=>roster(S.teams[id]).every(p=>p.fatigue===expected[i])))return false;
 }
 const n={id:9,pair:[0,11],groupMatch:true};for(const p of roster(S.teams[11]))p.fatigue=0;
 Match22.chargeSeries(a,[0,11],n);return a.fatigue26.groups[0]===9&&a.fatigue26.groups[11]===1&&roster(S.teams[11]).every(p=>p.fatigue===20);
})()`);
for(const [bo,winners] of [[2,[0,1]],[3,[0,1,0]],[5,[0,1,0,1,0]]]){
 test('BO'+bo+' charges after final card, never per map or twice on record',`(()=>{
  const a=fatigueFixture26(${bo});const winners=${JSON.stringify(winners)};
  for(let i=0;i<winners.length;i++){completeCard26(a,winners[i]);const expected=i===winners.length-1?30:10;if(![0,6].every(id=>roster(S.teams[id]).every(p=>p.fatigue===expected)))return false;}
  if(!a.seriesDone||a.fatigue26.groups[0]!==1)return false;
  recordNode6(a,a.schedule[0],a.score.join(':'));finishMap();
  return [0,6].every(id=>roster(S.teams[id]).every(p=>p.fatigue===30));
 })()`);
}
test('playoffs +33 for every series; clamps at 100',`(()=>{
 const a=fatigueFixture26(3,'playoffs');for(const id of [0,6])for(const p of roster(S.teams[id]))p.fatigue=80;
 completeCard26(a,0);if(roster().some(p=>p.fatigue!==80))return false;completeCard26(a,0);
 return [0,6].every(id=>roster(S.teams[id]).every(p=>p.fatigue===100));
})()`);
test('recovery levels 1..5 affect only their club; staff/base grant no recovery',`(()=>{
 for(let level=1;level<=5;level++){
  const a=fatigueFixture26();development21(0).recovery=level;development21(0).staff=5;development21(0).base=5;
  Match22.chargeSeries(a,[0,6],a.schedule[0]);
  if(!roster().every(p=>Math.abs(p.fatigue-(10+20/DEVELOPMENT21.recovery.slowdown[level-1]))<1e-9))return false;
  if(!roster(S.teams[6]).every(p=>p.fatigue===30))return false;
 }return true;
})()`);
test('save/reload and 2.2 migration do not recharge completed series',`(()=>{
 const a=fatigueFixture26();completeCard26(a,0);completeCard26(a,0);let raw=JSON.stringify(S);S=JSON.parse(raw);migrate();
 const loaded=S.active;recordNode6(loaded,loaded.schedule[0],loaded.score.join(':'));
 if(roster().some(p=>p.fatigue!==30))return false;
 const old=JSON.parse(raw);old.gameVersion='2.2';delete old.active.fatigue26;S=old;const before=roster().map(p=>p.fatigue);migrate();
 if(!validSave(S)||S.gameVersion!=='2.6'||!roster().every((p,i)=>p.fatigue===before[i]))return false;
 return !Match22.chargeSeries(S.active,[0,6],S.active.schedule[0])&&S.active.fatigue26.groups[0]===1;
})()`);
test('unfinished series resumes without charging; later completion charges once',`(()=>{
 const a=fatigueFixture26();completeCard26(a,0);S=JSON.parse(JSON.stringify(S));migrate();const loaded=S.active;
 if(roster().some(p=>p.fatigue!==10))return false;completeCard26(loaded,0);
 return roster().every(p=>p.fatigue===30)&&loaded.fatigue26.groups[0]===1;
})()`);
test('automatic opponent series uses same +20, not a charge for every map',`(()=>{
 const a=fatigueFixture26();const before=[0,6].map(id=>roster(S.teams[id]).map(p=>p.fatigue));
 const result=aiSeries6([0,6],3);recordNode6(a,a.schedule[0],result.score);
 return result.maps.length>=2&&[0,6].every((id,i)=>roster(S.teams[id]).every((p,j)=>p.fatigue===before[i][j]+20));
})()`);
test('scrim workload unchanged and does not advance group fatigue cycle',`(()=>{
 fatigueFixture26();S.practice13={team:6,maps:[]};fatigueMap6([0,6],1800);
 return roster().every(p=>p.fatigue===16)&&!S.active.fatigue26.groups[0];
})()`);
test('legacy 2.1 series charges once after BO3, both clubs equally',`(()=>{
 const a=fatigueFixture26();a.format6=false;a.phase='groups';a.groupDay=0;delete a.schedule;a.fatigue26={groups:{},charged:{}};
 completeCard26(a,0);if(roster().some(p=>p.fatigue!==10))return false;completeCard26(a,0);
 return [0,6].every(id=>roster(S.teams[id]).every(p=>p.fatigue===30));
})()`);
test('old qualifier/group history seeds cycle without retroactive fatigue',`(()=>{
 const a=fatigueFixture26();delete a.fatigue26;
 a.stage6='playoffs';a.schedule=[{id:0,pair:[0,6],score:'2:0',groupMatch:true},{id:1,pair:[0,11],score:'2:1',label:'BLAST · Last Chance'}];
 const state=Match22.fatigueState(a);
 return state.groups[0]===2&&state.groups[6]===1&&state.groups[11]===1&&roster().every(p=>p.fatigue===10);
})()`);
console.log('PASS fatigue 2.6');
