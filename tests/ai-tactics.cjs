'use strict';
const assert=require('node:assert/strict'),{run}=require('./harness22.cjs')();
run(require('./mirror-fixture.cjs'));
const test=(name,code)=>{assert(run(code),name);console.log('PASS',name)};
test('softmax stable at extreme scores, normalized, temperature controls spread',`(()=>{
 const high=Match22.softmax([10000,9999,9990],.2),equal=Match22.softmax([1,1,1],.2);
 const cold=Match22.softmax([1,.9],.02),hot=Match22.softmax([1,.9],.5);
 return high.every(Number.isFinite)&&Math.abs(high.reduce((a,b)=>a+b)-1)<1e-12&&equal.every(n=>Math.abs(n-1/3)<1e-12)&&cold[0]>hot[0]&&Match22.softmax([],.2).length===0;
})()`);
test('AI samples valid alternatives rather than always selecting argmax',`(()=>{
 const m=mirrorMap26(10001,['control','control']);m.clock=1200;const choices=new Set();let nonmax=0;
 for(let i=0;i<160;i++){
  const chosen=Match22.ai(m,0,'farm'),info=m.ai22[0];choices.add(chosen);nonmax+=chosen!==info.options[0].type;
  if(!info.options.some(o=>o.type===chosen)||info.options.some(o=>Match22.available(m,0,o.type)||!Number.isFinite(o.selectionProbability)))return false;
  if(Math.abs(info.options.reduce((n,o)=>n+o.selectionProbability,0)-1)>1e-12)return false;
 }
 return choices.size>=4&&nonmax>20;
})()`);
test('style and preferred bonuses remain within requested range',`(()=>{
 const V=BALANCE22.ai;
 return V.preferredBonus>=.03&&V.preferredBonus<=.05&&Object.values(V.styles).flatMap(Object.values).every(n=>Math.abs(n)>=.03&&Math.abs(n)<=.05);
})()`);
test('draft slope and opposing draft influence tactic fit',`(()=>{
 const early=['Ursa','Viper','Beastmaster','Enchantress','Undying'],late=['Anti-Mage','Invoker','Doom','Rubick','Oracle'];
 const m=mirrorMap26(10002,['control','control']);
 m.sides[0].heroes.forEach((p,i)=>p.hero=early[i]);m.sides[1].heroes.forEach((p,i)=>p.hero=late[i]);
 const earlyFit=Match22.tacticScores(m,0),lateFit=Match22.tacticScores(m,1);
 if(earlyFit.draftSlope<=lateFit.draftSlope||earlyFit.scores.pressure<=earlyFit.scores.late||lateFit.scores.late<=lateFit.scores.pressure)return false;
 m.sides[1].heroes.forEach((p,i)=>p.hero=early[i]);const againstEarly=Match22.tacticScores(m,0);
 if(earlyFit.scores.pressure<=againstEarly.scores.pressure)return false;
 delete m.tacticSelection26;m.autoCoach13=true;Match22.selectDraftTactics(m);
 return m.tacticSelection26.every(t=>t.automatic&&t.chosen in BALANCE22.tactics);
})()`);
test('manual manager tactic and restored active map are preserved',`(()=>{
 const m=mirrorMap26(10003,['late','late']);delete m.tacticSelection26;m.autoCoach13=false;Match22.selectDraftTactics(m);
 if(m.tactics22[0]!=='late'||m.tacticSelection26[0].automatic)return false;
 delete m.tacticSelection26;m.clock=600;const tactics=[...m.tactics22];Match22.selectDraftTactics(m);
 return tactics.every((t,i)=>t===m.tactics22[i]);
})()`);
test('new manual orders do not leak to the opposing coach',`(()=>{
 const original=Match22.ai;
 try{
  const m=mirrorMap26(10004,['control','control']);m.lastActions22=['farm','vision'];m.pendingAction22='siege';m.orders[0]={type:'siege',until:1000};
  const observed=[];Match22.ai=function(map,side,reaction){observed.push({side,reaction});return 'defend';};
  Match22.minute(m);
  if(observed.length!==1||observed[0].side!==1||observed[0].reaction!=='farm'||m.orderInfo26.committed[0]!=='siege')return false;
  m.orders[0]={type:'coach',until:0};m.pendingAction22=null;m.lastActions22=['smoke','split'];observed.length=0;
  Match22.minute(m);
  return observed.length===2&&observed[0].reaction==='split'&&observed[1].reaction==='smoke';
 }finally{Match22.ai=original;}
})()`);
test('smoke regeneration independent from Roshan start and action cooldown',`(()=>{
 const A=BALANCE22.actions,interval=A.smokeInterval,roshan=A.roshanStart;
 try{
  A.smokeInterval=120;A.roshanStart=900;
  const m=mirrorMap26(10005,['control','control']);const s=m.sides[0];s.smokes=0;
  if(s.nextSmoke!==120)return false;m.clock=119;Match22.timers(m);if(s.smokes!==0)return false;
  m.clock=120;Match22.timers(m);
  return s.smokes===1&&s.nextSmoke===240&&A.smokeCooldown!==A.smokeInterval;
 }finally{A.smokeInterval=interval;A.roshanStart=roshan;}
})()`);
test('close fights have one base casualty, winner losses use its own probability',`(()=>{
 const execution=Match22.execution,noise=BALANCE22.combat.noise;
 try{
  Match22.execution=(m,side)=>({side,factor:1,error:null});BALANCE22.combat.noise=0;
  const m=mirrorMap26(10006,['control','control']);const side=0,own=m.sides[0].heroes,enemy=m.sides[1].heroes;
  const a={p:.5,fight:{A:1000,D:1000,p:.5,own,enemy},factors:['test'],zone:1};
  m.clock=1200;Match22.fight(m,side,a);
  const e=m.events.filter(e=>e.type==='fight-end').at(-1),loser=1-e.winner;
  const loserDeaths=m.sides[loser].heroes.reduce((n,p)=>n+p.d,0);
  return loserDeaths===1&&e.winnerProbability===.5&&e.retaliationProbability===.25;
 }finally{Match22.execution=execution;BALANCE22.combat.noise=noise;}
})()`);
test('retaliation hurts winners more in close fights than dominant wins',`(()=>{
 const execution=Match22.execution,noise=BALANCE22.combat.noise;
 try{
  Match22.execution=(m,side)=>({side,factor:1,error:null});BALANCE22.combat.noise=0;
  const measure=probability=>{
   let wins=0,deaths=0;const m=mirrorMap26(10007,['control','control']);
   for(let i=0;i<240;i++){
    m.clock+=300;for(const s of m.sides)for(const p of s.heroes){p.deadUntil=0;p.health=100;}
    const own=m.sides[0].heroes,enemy=m.sides[1].heroes,before=own.reduce((n,p)=>n+p.d,0);
    const won=Match22.fight(m,0,{p:probability,fight:{A:1000,D:1000,p:.5,own,enemy},factors:['test'],zone:1});
    if(won){wins++;deaths+=own.reduce((n,p)=>n+p.d,0)-before;}
   }
   return deaths/wins;
  };
  return measure(.5)>measure(.9);
 }finally{Match22.execution=execution;BALANCE22.combat.noise=noise;}
})()`);
console.log('PASS AI and fight regression checks');
