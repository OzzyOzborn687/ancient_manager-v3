'use strict';
const assert=require('node:assert/strict'),{run}=require('./harness22.cjs')();
(async()=>{
 run(`fresh();S.seed=242424;for(const id of [0,6,11])for(const p of roster(S.teams[id]))p.fatigue=10;
 const node={id:0,pair:[6,11],bo:3,label:'Группа A',groupMatch:true,day13:S.day,slot13:S.day};
 S.active={event:S.events[0].id,format6:true,stage6:'groups',cursor:0,schedule:[node],score:[0,0],maps:[],opponent:6,bo:3,phase:'circuit',stage:'Группа A',round:0,totalRounds:1,bracket:[],pairs:[]};
 breathe13=async()=>true;`);
 assert(await run('automaticNode13(S.active,S.active.schedule[0],S)'));
 assert(run(`(()=>{const a=S.active;return !!a.schedule[0].score&&a.sim13===null&&a.fatigue26.groups[6]===1&&a.fatigue26.groups[11]===1&&[6,11].every(id=>roster(S.teams[id]).every(p=>p.fatigue===30))&&roster().every(p=>p.fatigue===10);})()`));
 run('recordNode6(S.active,S.active.schedule[0],S.active.schedule[0].score)');
 assert(run('[6,11].every(id=>roster(S.teams[id]).every(p=>p.fatigue===30))'));
 console.log('PASS asynchronous background series fatigue, independent clubs, exact single charge');
})().catch(e=>{console.error(e);process.exitCode=1});
