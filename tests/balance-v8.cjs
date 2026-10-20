'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{run}=require('./harness22.cjs')({modelVersion:8});run(require('./fixtures-v8.cjs'));
const resultDir=process.env.RESULTS_DIR||'test-results';
const result=run(`(()=>{const rows=[];for(const mode of ['mirror','favorite','expert']){let wins=0,stalls=0,seconds=0,comebacks=0,killsByRole=[0,0,0,0,0],errors=[0,0];const maps=200;
 for(let i=0;i<maps;i++){const seed=660000+i*431,m=mirrorMap26(seed,['control','control']);if(mode!=='mirror')for(let s=0;s<2;s++)for(const p of m.sides[s].heroes)p.skill=s===0?90:80;if(mode==='expert')m.v8.controllers=['auto','expert'];const deficits=[0,0];
 while(m.finishedSide==null&&m.clock<21600){simulateTick4(m,10);const gap=net4(m.sides[0])-net4(m.sides[1]);deficits[0]=Math.max(deficits[0],-gap);deficits[1]=Math.max(deficits[1],gap);}
 stalls+=m.finishedSide==null;wins+=m.finishedSide===(mode==='expert'?1:0);seconds+=m.clock;
 if(m.finishedSide!=null)comebacks+=deficits[m.finishedSide]>=3000;
 for(const s of m.sides)for(const p of s.heroes){killsByRole[p.role]+=p.k;if(!Number.isFinite(p.nw)||p.bank<0)throw Error('Invalid economy');}for(const e of m.events)if(e.type==='mistake')errors[e.side]++;
 }rows.push({mode,maps,wins,rate:wins/maps,meanMinutes:seconds/maps/60,stalls,comebacks,killsByRole,errors});}return rows})()`);
console.table(result.map(({killsByRole,errors,...r})=>r));
fs.mkdirSync(resultDir,{recursive:true});fs.writeFileSync(resultDir+'/balance-v8.json',JSON.stringify(result,null,2));
for(const r of result){assert.equal(r.stalls,0);assert(r.killsByRole.every(k=>k>0));assert(r.killsByRole[0]/r.killsByRole.reduce((n,k)=>n+k,0)<.6);assert(r.errors.every(n=>n>0));}
assert(result[0].rate>=.4&&result[0].rate<=.6,'mirror side bias');
assert(result[1].rate>=.6&&result[1].rate<=.75,'favorite target 60–75%');
assert(result[2].rate>=.45&&result[2].rate<=.55,'underdog with observable-state policy target 45–55%');
assert(result[0].meanMinutes>=54&&result[0].meanMinutes<=66,'representative match duration target');
const tactics=run(`(()=>{const rows=[],keys=Object.keys(BALANCE8.tactics);for(let a=0;a<4;a++)for(let b=a+1;b<4;b++){let wins=0,seconds=0;for(let i=0;i<50;i++)for(let swap=0;swap<2;swap++){const m=mirrorMap26(80000+i*431,swap?[keys[b],keys[a]]:[keys[a],keys[b]]);finish8(m);wins+=m.finishedSide===swap;seconds+=m.clock;}rows.push({a:keys[a],b:keys[b],maps:100,wins,rate:wins/100,meanMinutes:seconds/6000});}return rows})()`);
console.table(tactics);fs.writeFileSync(resultDir+'/tactics-v8.json',JSON.stringify(tactics,null,2));for(const r of tactics)assert(r.rate>=.4&&r.rate<=.6,'tactic pair '+r.a+'/'+r.b);
console.log('PASS v8 balance, duration, kill distribution, errors, all six 100-map tactic mirrors');

const legacy=require('./harness22.cjs')();legacy.run(require('./mirror-fixture.cjs'));
const baseline=legacy.run(`(()=>{let seconds=0;for(let i=0;i<200;i++){const m=mirrorMap26(660000+i*431,['control','control']);while(m.finishedSide==null&&m.clock<21600)simulateTick4(m,60);if(m.finishedSide==null)throw Error('legacy baseline stall');seconds+=m.clock;}return {model:'2.6',maps:200,meanMinutes:seconds/12000}})()`);
fs.writeFileSync(resultDir+'/duration-baseline-v8.json',JSON.stringify({...baseline,newMeanMinutes:result[0].meanMinutes,relativeChange:result[0].meanMinutes/baseline.meanMinutes-1},null,2));
assert(Math.abs(result[0].meanMinutes/baseline.meanMinutes-1)<=.1,'same-condition legacy duration ±10%');console.log('PASS measured legacy duration baseline',baseline);
