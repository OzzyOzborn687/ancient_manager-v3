'use strict';
Match22.ai=function(m,side,reaction=null){
 const B=this.B,V=B.ai,s=m.sides[side],tactic=m.tactics22[side];
 const style=V.styles[tactic==='aggressive'||tactic==='pressure'?'aggressive':tactic==='late'?'farmer':'balanced'];
 const draftSlope=s.heroes.reduce((n,p)=>n+this.hero(p.hero).early-this.hero(p.hero).late,0)/s.heroes.length;
 const danger=['siege','throne','split'].includes(reaction),low=alive4(m,side).length<alive4(m,1-side).length;
 const values=[];
 for(const type of ['farm','vision','smoke','rosh','siege','defend','split','throne']){
  if(this.available(m,side,type))continue;
  const a=this.assess(m,side,type),p=a.p;let score=0;
  switch(type){
   case 'farm':score=V.farmValue+s.control*V.farmSafety-(danger?V.pressureValue:0);break;
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
  if(type===B.tactics[tactic].preferred)score+=V.preferredBonus;
  score+=(style[type]||0);
  values.push({type,score,probability:p});
 }
 values.sort((a,b)=>b.score-a.score);
 const distribution=this.softmax(values.map(v=>v.score),V.temperature);
 values.forEach((v,i)=>v.selectionProbability=distribution[i]);
 const chosen=values.length?weighted4(values,distribution).type:'defend';
 m.ai22??=[null,null];m.ai22[side]={sec:m.clock,options:values,chosen,reaction};
 return chosen;
};

// Stable softmax: large absolute utilities cannot overflow exp().
Match22.softmax=function(scores,temperature){
 if(!scores.length)return [];
 const peak=Math.max(...scores),T=Math.max(Number.EPSILON,temperature);
 const weights=scores.map(score=>Math.exp((score-peak)/T)),total=weights.reduce((a,b)=>a+b,0);
 return weights.map(w=>w/total);
};
Match22.tacticScores=function(m,side){
 const C=this.B.tacticSelection,own=m.sides[side].heroes.map(p=>this.hero(p.hero)),enemy=m.sides[1-side].heroes.map(p=>this.hero(p.hero));
 const slope=heroes=>avg(heroes.map(h=>h.early-h.late));
 const draftSlope=slope(own),opponentSlope=slope(enemy),tags=tag=>own.filter(h=>h.tags.includes(tag)).length;
 const scores={
  pressure:draftSlope*C.ownSlope-opponentSlope*C.opponentSlope+tags('building')*C.push,
  late:-draftSlope*C.ownSlope+opponentSlope*C.opponentSlope+tags('save')*C.save,
  aggressive:tags('initiator')*C.initiation+tags('control')*C.control,
  control:C.neutral+tags('save')*C.save+tags('control')*C.control
 };
 return {draftSlope,opponentSlope,scores};
};
Match22.selectDraftTactics=function(m){
 if(m.clock!==0||m.tacticSelection26)return;
 const choices=m.sides.map((s,side)=>this.tacticScores(m,side));
 m.tacticSelection26=choices.map((fit,side)=>{
  // The manager's declared tactic is authoritative in a manually managed map.
  const automatic=m.sides[side].team!==S.club||m.autoCoach13;
  const chosen=automatic?Object.keys(fit.scores).sort((a,b)=>fit.scores[b]-fit.scores[a])[0]:m.tactics22[side];
  if(automatic)m.tactics22[side]=chosen;
  return {...fit,chosen,automatic};
 });
};
