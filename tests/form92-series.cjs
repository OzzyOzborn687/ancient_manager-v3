'use strict';
const assert=require('node:assert/strict'),{run:r}=require('./harness22.cjs')({modelVersion:8});
(async()=>{
 r(`fresh();S.calendar21.installedDay=100000;S.events=[{id:990,name:'Later fixture',series:'ANCIENT',day:5000,pool:100000}];S.budget=1000000;breathe13=async()=>true;S.practice13={team:1,day:S.day,price:0,score:[0,0],maps:[],live:null};var job92=S.practice13;`);
 await r('resumeScrim13()');
 assert(r("!S.practice13&&job92.maps.length===2&&job92.formApplied92&&Object.values(job92.formStats92).length===10&&Object.values(job92.formStats92).every(s=>s.maps===2)&&roster().every(p=>p.form92.lastSeries.scrim&&p.form92.scrimGain<=.2)&&validSave(S)"),'actual BO2 scrim: two observations, one capped series award');
 r(`fresh();S.calendar21.installedDay=100000;S.events=[{id:991,name:'AI form fixture',series:'FISSURE',day:0,duration:6,pool:100000,qualified13:S.teams.slice(1,9).map(t=>t.id)}];var e92=S.events[0];Background51.queue(e92);Background51.create(e92);var a92=e92.background51.state,n92=a92.schedule[0],pair92=n92.pair.map(v=>resolve6(a92,v));Background51.series(a92,n92);`);
 assert(r("n92.formApplied92&&n92.score&&!n92.formStats92&&pair92.every(id=>roster(S.teams[id]).every(p=>p.form92?.lastSeries&&!p.form92.lastSeries.scrim&&!p.form92.lastSeries.details.includes('Недостаточно')))&&validSave(S)"),'actual background series uses its own player statistics');
 console.log('PASS V9.2 real BO2 scrim and background BO3: actual role statistics, one series award, capped scrim gains and valid saves.');
})().catch(e=>{console.error(e);process.exitCode=1});
