'use strict';
const assert=require('node:assert/strict'),{run}=require('./harness22.cjs')();
const test=(name,code)=>{assert(run(code),name);console.log('PASS',name)};
run(`function fixture26(){fresh();S.seed=40001;return makeLive4({opponent:6},autoDraft([0,6]),[0,6]);}`);
test('probability keeps relative skill meaningful at late-game power scales',`(()=>{
 const a=Match22.probability(1100,1000),b=Match22.probability(11000,10000);
 return Math.abs(a-b)<1e-10&&a>.5&&a<.7&&Match22.probability(2000,1000)>.95&&Match22.probability(2000,1000)<1;
})()`);
test('kill credit uses living participants only and includes every role',`(()=>{
 const m=fixture26(),target=m.sides[1].heroes[0],players=m.sides[0].heroes;const counts=[0,0,0,0,0];
 players[0].nw=30000;players[0].bank=29000;
 for(let i=0;i<600;i++){target.deadUntil=0;const before=players.map(p=>p.k);Match22.kill(m,0,target,players);for(let j=0;j<5;j++)counts[j]+=players[j].k-before[j];}
 if(counts.some(n=>n<20)||counts[0]>=350)return false;
 const before=players[0].k,assist=players[0].a;players[0].deadUntil=99999;target.deadUntil=0;
 for(let i=0;i<40;i++){target.deadUntil=0;Match22.kill(m,0,target,players);}
 return players[0].k===before&&players[0].a===assist&&counts.reduce((a,b)=>a+b)===600;
})()`);
test('shutdown rewards a real kill, not Aegis loss or a failed attack',`(()=>{
 const m=fixture26(),target=m.sides[1].heroes[0];target.streak=6;m.sides[1].aegisUntil=300;m.sides[1].aegisHero=0;
 const before=net4(m.sides[0]);Match22.kill(m,0,target,m.sides[0].heroes);
 if(target.d!==0||net4(m.sides[0])!==before)return false;m.clock=60;
 Match22.kill(m,0,target,m.sides[0].heroes);
 return target.d===1&&m.events.at(-1).shutdown===6*BALANCE22.economy.shutdownPerKill&&net4(m.sides[0])>before;
})()`);
test('both teams make explained errors; fatigue and risky sieges raise their risk',`(()=>{
 const m=fixture26(),base=Match22.executionRisk(m,0);
 for(const p of m.sides[0].heroes)p.energy=10;
 const tired=Match22.executionRisk(m,0);if(tired<=base)return false;
 for(let i=0;i<120;i++)for(let side=0;side<2;side++)Match22.execution(m,side,m.sides[side].heroes,{highground:true});
 const events=m.events.filter(e=>e.type==='mistake');
 return m.execution26.errors.every(n=>n>0)&&events.some(e=>e.side===0)&&events.some(e=>e.side===1)&&events.every(e=>e.factor<1&&e.text.includes('Усталость'));
})()`);
test('forecasts render without rolling form or mistakes; JSON continues exactly',`(()=>{
 const m=fixture26();S.active={opponent:6,score:[0,0],maps:[],live:m};let seed=S.seed;
 Match22.commands(m);if(seed!==S.seed||m.execution26)return false;
 for(let n=0;n<19;n++)simulateTick4(m,10);
 const copy=JSON.parse(JSON.stringify(m));seed=S.seed;
 for(let n=0;n<20;n++)simulateTick4(m,60);S.seed=seed;
 for(let n=0;n<20;n++)simulateTick4(copy,60);
 return JSON.stringify(m)===JSON.stringify(copy);
})()`);
test('2.2 match upgrades preserve orders, partial tick, vision and economy',`(()=>{
 const m=fixture26();m.simVersion='2.2';m.clock=360;m.minuteAccumulator22=20;m.pendingAction22='rosh';m.orders[0]={type:'rosh',until:600};m.sides[0].vision22.wards=5;
 const bank=m.sides[0].heroes[0].bank,seed=S.seed;
 Match22.init(m);const raw=JSON.stringify(m);Match22.init(m);
 return m.simVersion==='2.6'&&m.minuteAccumulator22===20&&m.pendingAction22==='rosh'&&m.orders[0].until===600&&m.sides[0].vision22.wards===5&&m.sides[0].heroes[0].bank===bank&&seed===S.seed&&raw===JSON.stringify(m);
})()`);
test('farmers still encounter lane fights and can lose a core',`(()=>{
 const m=fixture26();m.clock=300;m.nextSkirmish26=300;const before=m.events.length;
 Match22.skirmish(m,['farm','farm']);
 return m.events.slice(before).some(e=>e.type==='fight-end')&&m.sides.some(s=>s.heroes.some(p=>p.d>0));
})()`);
console.log('PASS v2.6 mechanics');
