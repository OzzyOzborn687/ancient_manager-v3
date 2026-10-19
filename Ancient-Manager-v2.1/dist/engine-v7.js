'use strict';
// Event-based sports-simulation design: tactical intent -> local opportunity ->
// execution -> consequences. This is an original model, not EA's proprietary code.
// No player-side win bonus, predetermined result or forced lead reversal.
function noise7(){return (rng()+rng()+rng()-1.5)*1.1547}
function init7(m){
 if(m.variation7)return;
 m.variation7={version:7,form:m.sides.map(s=>{let teamDay=noise7()*.24;return s.heroes.map(p=>teamDay+noise7()*.1)}),phase:[0,0],nextPhase:m.clock,planUntil:[0,0],plan:['farm','farm'],styles:m.sides.map(()=>({risk:.65+rng()*.7,tempo:.7+rng()*.6})),history:[]};
 if(!m.roshan)m.roshan={alive:true,spawnAt:0,progress:[0,0]};
 if(!m.roshan.alive&&!Number.isFinite(m.roshan.spawnAt))m.roshan.spawnAt=m.clock+int(480,660);
}
const makeBase7=makeLive4;makeLive4=function(a,d,ids){let m=makeBase7(a,d,ids);init7(m);return m};
function updatePerformance7(m){let v=m.variation7;if(m.clock<v.nextPhase)return;v.nextPhase=m.clock+int(60,180);for(let side of [0,1])v.phase[side]=clamp(v.phase[side]*.25+noise7()*.24,-.45,.45);v.history.push({sec:m.clock,phase:[...v.phase]});if(v.history.length>200)v.history.shift();}
function performance7(m,side,p){let v=m.variation7;if(!v)return 1;let state=(p.form??70)-70,morale=(p.morale??70)-70;return clamp(1+v.form[side][p.role]+v.phase[side]+state*.0015+morale*.001,.55,1.5)}
const unitBase7=unitPower5;unitPower5=function(m,p){let side=m.sides.findIndex(s=>s.heroes.includes(p));return unitBase7(m,p)*Math.sqrt(performance7(m,side,p))};
choosePlan4=function(m,side){
 init7(m);let v=m.variation7,o=m.orders[side],s=m.sides[side],enemy=m.sides[1-side],n=alive4(m,side).length,opp=alive4(m,1-side).length,lead=net4(s)-net4(enemy),open=enemy.lanes.some(l=>l.towers[2].hp<=0);
 if(o.until>m.clock&&o.type!=='coach')return o.type;
 if(!n)return 'defend';
 if(opp<=1||!m.battle&&opp<=3&&n>=opp+1)return open&&opp<=2?'throne':'siege';
 if(s.aegisUntil>m.clock&&n>=3)return open&&opp<=2?'throne':'siege';
 if(m.clock<v.planUntil[side])return v.plan[side];
 let early=m.clock<600,behind=lead<-3000,strong=lead>3000,tactic=s.team===S.club?S.tactic:S.teams[s.team].tactic,risk=v.styles[side].risk;
 let opts=['farm','vision','defend','split','siege','rosh'],weights=early?[8,1,.15,.1,.03,0]:[behind?3:2,2,behind?3:.6,behind?2:1,strong?5:1.8, m.roshan.alive&&m.clock>900&&n>=3&&s.aegisUntil<=m.clock?(behind?.5:2.4):0];
 if(n<3)weights=[1,.2,6,1,.1,0];
 if(tactic==='late')weights[0]*=1.5;if(tactic==='tempo')weights[4]*=1.5;if(tactic==='teamfight')weights[1]*=1.5;
 if(m.clock>1800){weights[0]*=.55;weights[1]*=.6;}weights[4]*=risk*(m.clock>2400?3:1);weights[3]*=risk;
 if(open&&n>=3){opts.push('throne');weights.push(opp<=2?8:m.clock>2700?1:.25)}
 v.plan[side]=weighted4(opts,weights);v.planUntil[side]=m.clock+int(65,160);return v.plan[side];
};
// Independent execution rolls for each encounter, plus occasional missed initiation.
// A gold lead still matters through actual items, XP and access, but is no guarantee.
const fightBase7=fight4;fight4=function(m,attacker=null,highground=false,zone=null){
 if(m.battle)return;init7(m);fightBase7(m,attacker,highground,zone);if(!m.battle)return;
 let b=m.battle;b.execution6=[0,1].map(side=>{
  let cohesion=m.cohesion6?.[side]??80,roll=noise7(),error=rng()<clamp(.19-(cohesion-80)*.002,.08,.27);
  return clamp(Math.exp(roll*.38)*(error?.65:1)*(side===attacker?1.06:1),.4,1.85);
 });b.ends=m.clock+int(25,45);
 for(let side of [0,1])for(let role of b.groups[side])m.sides[side].heroes[role].combatUntil=b.ends;
};
// Replace clock-modulo encounters with independent opportunities. A small group
// can be caught; the entire team does not automatically join every midgame fight.
scheduleFight6=function(m){
 let e=m.encounter6;if(e){if(m.clock<e.at)return;fight4(m,e.attacker,e.highground,e.zone);m.encounter6=null;if(!m.battle)m.nextFight=m.clock+int(25,65);return;}
 if(m.clock<m.nextFight)return;
 let lane=m.clock<600,attacker=lane?null:weighted4([0,1],[0,1].map(s=>m.variation7.styles[s].tempo*(1+Math.max(-.4,m.variation7.phase[s])))),zone,highground=false;
 if(lane)zone=int(0,2);else{let plan=m.plans[attacker];zone=plan==='rosh'&&m.roshan.alive?4:['siege','throne'].includes(plan)?targetLane4(m,attacker):int(0,2);highground=zone<3&&['siege','throne'].includes(plan)&&availableTarget4(m,attacker).tier>=3;}
 let groups=[[],[]];for(let side of [0,1]){let living=alive4(m,side),g=lane?living.filter(p=>laneZone6(side,p.role)===zone):living.filter(p=>p.role!==0||m.clock>=1500||['rosh','siege','throne','defend'].includes(m.plans[side]));
  if(!lane&&!highground&&zone!==4){let participation=.55+rng()*.4;g=g.filter(()=>rng()<participation);}
  for(let p of g){groups[side].push(p.role);move5(m,p,zone,highground&&side!==attacker);}
 }
 if(groups.some(g=>!g.length)){m.nextFight=m.clock+int(25,75);return;}
 let at=Math.max(m.clock+10,...m.sides.flatMap((s,side)=>s.heroes.filter(p=>groups[side].includes(p.role)).map(p=>p.travelUntil)));m.encounter6={at,zone,groups,attacker,highground};
};
const migrateBase7=migrate;migrate=function(){migrateBase7();if(S.active?.live)init7(S.active.live)};

// Comeback rewards are earned only by killing a richer opponent. There is no
// passive catch-up gold, winner reroll or requirement to reverse a lead.
const killBase7=kill5;
kill5=function(m,side,victim,participants){
 const deaths=victim.d,deficit=net4(m.sides[1-side])-net4(m.sides[side]);
 const bounty=clamp((deficit-1500)*.045,0,900);
 killBase7(m,side,victim,participants);
 // Losing Aegis is not a kill. No bonus for failed/empty encounters.
 if(victim.d===deaths||!participants.length||bounty===0)return;
 for(const p of participants)income5(m,side,p,bounty/participants.length,'kills');
 event4(m,S.teams[m.sides[side].team].short+' получает '+Math.round(bounty)+' дополнительного золота за убийство при отставании.','comeback',{side});
};
