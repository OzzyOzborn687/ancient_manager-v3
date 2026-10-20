'use strict';
Match22.ai=function(m,side,reaction=null){
 const B=this.B,V=B.ai,s=m.sides[side],e=m.sides[1-side],tactic=m.tactics22[side];
 const style=V.styles[tactic==='aggressive'||tactic==='pressure'?'aggressive':tactic==='late'?'farmer':'balanced'];
 const draftSlope=s.heroes.reduce((n,p)=>n+this.hero(p.hero).early-this.hero(p.hero).late,0)/s.heroes.length;
 const danger=['siege','throne','split'].includes(reaction),low=alive4(m,side).length<alive4(m,1-side).length;
 const values=[];
 for(const type of ['farm','vision','smoke','rosh','siege','defend','split','throne']){
  if(this.available(m,side,type))continue;
  const a=this.assess(m,side,type),p=a.p;let score=0;
  switch(type){
   case 'farm':score=V.farmValue+s.control*V.farmSafety+(tactic==='late'?V.lateValue:0)-(danger?V.pressureValue:0);break;
   case 'vision':score=V.visionValue+(1-s.control)*V.farmSafety;break;
   case 'smoke':score=p*V.smokeValue-(1-p)*V.smokeRisk+(reaction==='smoke'?V.pressureValue:0);break;
   case 'rosh':score=p*V.roshanValue-(1-p)*V.roshanRisk;break;
   case 'siege':case 'throne':score=p*V.pushValue-(1-p)*V.pushRisk+(reaction==='farm'?V.pressureValue:0)+(s.aegisUntil>m.clock?V.pressureValue:0)+(alive4(m,1-side).length<3?V.pressureValue:0);if(type==='throne')score+=V.throneValue;break;
   case 'defend':score=danger?V.defendValue+(1-p)*V.pushRisk:V.defendPassive+(low?V.pressureValue:0);break;
   case 'split':score=V.splitValue+(1-p)*V.splitRisk-(danger?V.pressureValue:0);break;
  }
  if(m.clock<B.phases[1]&&['siege','smoke'].includes(type))score+=Math.max(0,draftSlope)*V.earlyUrgency;
  if(m.clock>=B.phases[1]){if(type==='farm')score*=V.lateFarmMultiplier;if(['siege','split','smoke'].includes(type))score+=V.latePressure;}
  if(type==='vision')score-=s.vision22.wards/B.map.wardMax*V.visionSaturation;
  if(type===B.tactics[tactic].preferred)score+=V.lateValue;
  score+=(style[type]||0)+(rng()*2-1)*V.jitter;
  values.push({type,score,probability:p});
 }
 values.sort((a,b)=>b.score-a.score);
 m.ai22??=[null,null];m.ai22[side]={sec:m.clock,options:values,chosen:values[0]?.type||'defend',reaction};
 return values[0]?.type||'defend';
};
