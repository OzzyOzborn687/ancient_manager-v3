'use strict';
const assert=require('node:assert/strict'),{run}=require('./harness22.cjs')();
const result=run(`(()=>{
 const result={maps:100,strongWins:0,upsets:0,comebacks5000:0,leadChanges3000:0,stalls:0,killsByRole:[0,0,0,0,0],errors:[0,0],meanMinutes:0};
 for(let i=0;i<result.maps;i++){
  const originalRandom=Math.random;Math.random=()=>((40000+i*117)>>>0)/4294967296;fresh();Math.random=originalRandom;S.seed=40000+i*117;
  for(let side=0;side<2;side++)for(const p of roster(S.teams[[0,6][side]])){p.skill=side===0?88:80;p.form=80;p.morale=80;p.fatigue=10;}
  const draft=autoDraft([0,6]);draft.enemy=[...draft.own];draft.details[1]=structuredClone(draft.details[0]);
  const m=makeLive4({opponent:6},draft,[0,6]);m.tactics22=['control','control'];m.scope13='scrim';
  const peaks=[0,0];let sign=0,changed=false;
  while(m.finishedSide==null&&m.clock<12000){simulateTick4(m,60);peaks[0]=Math.max(peaks[0],m.gold);peaks[1]=Math.max(peaks[1],-m.gold);const next=Math.abs(m.gold)>=3000?Math.sign(m.gold):0;if(sign&&next&&sign!==next)changed=true;if(next)sign=next;}
  if(m.finishedSide==null)result.stalls++;
  else {result.strongWins+=m.finishedSide===0;result.upsets+=m.finishedSide===1;result.comebacks5000+=peaks[1-m.finishedSide]>=5000;}
  result.leadChanges3000+=changed;result.meanMinutes+=m.minute/result.maps;
  for(let side=0;side<2;side++){for(const p of m.sides[side].heroes){result.killsByRole[p.role]+=p.k;if(!Number.isFinite(p.nw)||p.bank<0)throw Error('invalid economy');}result.errors[side]+=m.execution26.errors[side];}
 }
 return result;
})()`);
assert.equal(result.stalls,0,'maps must terminate without selecting a forced winner');
assert(result.strongWins>55&&result.strongWins<99,'stronger roster should be favoured while upsets remain possible');
assert(result.comebacks5000>0,'winning after a significant deficit must remain possible');
assert(result.leadChanges3000>0,'some maps must reverse a significant lead');
assert(result.killsByRole.every(n=>n>0),'all roles must receive kills');
assert(result.errors.every(n=>n>0),'both teams must make execution mistakes');
const carryShare=result.killsByRole[0]/result.killsByRole.reduce((a,b)=>a+b,0);
assert(carryShare<.6,'carry must not monopolize kill credit');
console.log('PASS seeded 100-map balance sample',JSON.stringify({...result,carryShare},null,2));
