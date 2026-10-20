'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(process.env.DIST || 'dist');
const c = vm.createContext({ console, structuredClone, URL, Blob,
  setTimeout:()=>0, clearTimeout(){}, setInterval:()=>0, clearInterval(){},
  document:{getElementById:()=>({style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:''}),addEventListener(){}},
  window:{addEventListener(){}}, localStorage:{getItem(){return null},setItem(){}} });
// Actual production script order, including career, tactics, items and development.
const scripts = [...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^?" ]+)/g)].map(m=>m[1]);
for(const file of scripts) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
const run = code => vm.runInContext(code,c);
run('if(typeof LegacySpatial8!=="undefined")makeLive4=LegacySpatial8.make;Math.random=()=>.314159;render=()=>{};save=()=>{};fresh();S.seed=24680;');
if(!process.env.BASELINE){
assert.equal(run(`(() => {
  const m=makeLive4({opponent:1},autoDraft([0,1]),[0,1]);
  m.clock=1800;const victim=m.sides[1].heroes[0],group=m.sides[0].heroes;
  for(const p of m.sides[1].heroes){p.nw+=2000;p.bank+=2000;}
  const seed=S.seed,plain=structuredClone(m),plainVictim=plain.sides[1].heroes[0];
  killBase7(plain,0,plainVictim,plain.sides[0].heroes);
  S.seed=seed;kill5(m,0,victim,group);
  const extra=m.accounting[0].kills-plain.accounting[0].kills;
  if(Math.abs(extra-382.5)>1e-6)throw Error('Wrong comeback bounty '+extra);
  releaseGold6(m,10);releaseGold6(plain,10);
  if(Math.abs(net4(m.sides[0])-net4(plain.sides[0])-extra)>1e-6)throw Error('Bounty not paid once');
  const paid=net4(m.sides[0]);releaseGold6(m,10);
  if(net4(m.sides[0])!==paid)throw Error('Bounty paid twice');
  m.sides[1].aegisUntil=2100;m.sides[1].aegisHero=1;
  const before=m.accounting[0].kills;kill5(m,0,m.sides[1].heroes[1],group);
  if(m.accounting[0].kills!==before)throw Error('Aegis granted bounty');
  return true;
})()`),true);
assert.equal(run(`(() => {
  const m=makeLive4({opponent:1},autoDraft([0,1]),[0,1]);
  const seed=S.seed,a=structuredClone(m),b=structuredClone(m);
  killBase7(a,0,a.sides[1].heroes[0],a.sides[0].heroes);
  S.seed=seed;kill5(b,0,b.sides[1].heroes[0],b.sides[0].heroes);
  if(a.accounting[0].kills!==b.accounting[0].kills)throw Error('Bonus without deficit');
  return true;
})()`),true);
// Round-trip saves preserve the entire match and RNG continuation, even midfight.
assert.equal(run(`(() => {
  const m=makeLive4({opponent:1},autoDraft([0,1]),[0,1]);
  for(let i=0;i<130;i++)simulateTick4(m);
  const saved=JSON.stringify(m),seed=S.seed;
  for(let i=0;i<80;i++)simulateTick4(m);
  const endSeed=S.seed,copy=JSON.parse(saved);S.seed=seed;init6(copy);init7(copy);
  for(let i=0;i<80;i++)simulateTick4(copy);
  return JSON.stringify(m)===JSON.stringify(copy)&&endSeed===S.seed;
})()`),true);
assert.equal(run(`(() => {
  const m=makeLive4({opponent:1},autoDraft([0,1]),[0,1]);m.clock=1800;
  const p=m.sides[0].heroes[0],before=unitPower5(m,p);
  for(const q of m.sides[1].heroes){q.nw+=4000;q.bank+=4000;}
  if(unitPower5(m,p)!==before)throw Error('Enemy unspent gold changes own power');
  for(const l of m.sides[1].lanes){for(const t of l.towers)t.hp=0;l.rax.hp=0;}
  for(const t of m.sides[1].t4)t.hp=0;
  m.sides[1].ancient.hp=1;m.sides[1].glyphReady=99999;
  for(const q of m.sides[1].heroes){q.zone=3;q.destination=3;q.travelUntil=0;}
  for(const q of m.sides[0].heroes){q.zone=0;q.destination=0;q.travelUntil=0;q.health=100;}
  m.battle=null;m.plans[0]='throne';m.sides[0].targetLane=0;m.waves=[100,100,100];m.nextObjective6[0]=0;
  objectives6(m,0,10);
  if(m.finishedSide!==0)throw Error('Global lead prevents attack on undefended throne');
  return true;
})()`),true);
console.log('PASS: earned bounty, single payout, Aegis/equal-gold exclusions, save continuation, no gold power multiplier, undefended-base comeback');
}
run('fresh();S.seed=24680;');
const count = Number(process.env.MAPS || 300);
if(count===0)process.exit(0);
const stats = run(`(() => {
  const baseline=structuredClone(S), out=[];
  for(const gap of [0,10,20]){
    let wins=0, leaderWins=0, at20=0, comebacks=0, totalMinutes=0, maxMinutes=0;
    for(let i=0;i<${count};i++){
      S=structuredClone(baseline);S.seed=24680+i*7919+gap*104729;S.chem=80;S.coach=80;
      for(const id of [0,1])for(const p of roster(S.teams[id])){
        p.skill=85+(id===0?gap/2:-gap/2);p.form=70;p.morale=70;p.fatigue=10;p.heroPractice13={};
        for(const key of Object.keys(ATTR13))p.attributes13[key]=p.skill;
      }
      const draft=autoDraft([0,1]);
      if(gap===0){draft.enemy=[...draft.own];draft.details[1]=structuredClone(draft.details[0]);}
      const m=makeLive4({opponent:1},draft,[0,1]);
      m.patchBonusesV1=[1,1];m.heroMeta13=[];m.preparation21=[0,0];m.scout13=[0,0];m.cohesion6=[80,80];
      m.rating=[85+gap/2,85-gap/2];m.teamRating=m.rating.map(r=>r*.9+8);
      for(const s of m.sides)for(const p of s.heroes)p.mastery=1;
      let leader=null;
      while(m.finishedSide==null&&m.clock<12000){
        simulateTick4(m);
        if(m.clock===1200&&m.gold!==0)leader=m.gold>0?0:1;
      }
      if(m.finishedSide==null)throw Error('Map stalled: gap='+gap+' seed='+i);
      wins+=m.finishedSide===0;
      if(leader!==null){at20++;leaderWins+=leader===m.finishedSide;}
      comebacks+=m.peakLead6[1-m.finishedSide]>=3000;
      totalMinutes+=m.clock/60;maxMinutes=Math.max(maxMinutes,m.clock/60);
    }
    out.push({gap,maps:${count},strongerOrSide0Wins:wins,leaderAt20WinPct:100*leaderWins/at20,comeback3000Pct:100*comebacks/${count},averageMinutes:totalMinutes/${count},maxMinutes});
  }
  return out;
})()`);
console.log(JSON.stringify(stats,null,2));
if(process.env.CHECK_BALANCE==='1'){
  const [equal,moderate,strong]=stats;
  assert.ok(equal.strongerOrSide0Wins/count>.4&&equal.strongerOrSide0Wins/count<.6,'side bias');
  assert.ok(equal.leaderAt20WinPct<88,'20-minute lead too predictive');
  assert.ok(equal.comeback3000Pct>=15&&equal.comeback3000Pct<=40,'comeback frequency outside tolerance');
  assert.ok(moderate.strongerOrSide0Wins/count>.5&&moderate.strongerOrSide0Wins/count<.95,'moderate favorite balance');
  assert.ok(strong.strongerOrSide0Wins/count>.65&&strong.strongerOrSide0Wins/count<.99,'strong favorite balance');
}

