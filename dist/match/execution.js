'use strict';
// Both teams can have a better match-day or make a concrete execution mistake.
// The leading side receives no arbitrary handicap and deficits grant no free power.
Match22.prepareExecution=function(m){
 const X=this.B.execution;
 if(!m.execution26)m.execution26={day:[0,1].map(()=>1+(rng()*2-1)*X.daySpread),drift:[1,1],next:m.clock+X.driftEvery,errors:[0,0]};
 const e=m.execution26;
 if(m.clock>=e.next){e.drift=[0,1].map(()=>1+(rng()*2-1)*X.driftSpread);e.next=m.clock+X.driftEvery;}
};
Match22.executionRisk=function(m,side,group=alive4(m,side),context={}){
 const X=this.B.execution;
 if(!group.length)return X.errorMin;
 const decisions=avg(group.map(p=>p.attributes13?.decisions??p.skill));
 const fatigue=avg(group.map(p=>100-(p.energy??100)));
 const vision=m.sides[side].vision22?.zones[context.zone??(context.exposed?4:1)]??m.sides[side].control;
 const greedy=(context.highground||context.exposed)&&net4(m.sides[side])>net4(m.sides[1-side])*X.greedRatio;
 return clamp(X.errorBase+(X.skillReference-decisions)*X.errorSkill+fatigue*X.errorFatigue+(1-vision)*X.errorVision+(greedy?X.errorGreed:0),X.errorMin,X.errorMax);
};
Match22.execution=function(m,side,group,context={}){
 this.prepareExecution(m);const X=this.B.execution,risk=this.executionRisk(m,side,group,context);
 let factor=m.execution26.drift[side]*(1+(rng()*2-1)*X.normalSpread),error=null;
 if(rng()<risk){
  error=X.types[Math.floor(rng()*X.types.length)];factor*=X.errorFactor;m.execution26.errors[side]++;
  const actor=weighted4(group,group.map(p=>1+(100-(p.attributes13?.decisions??p.skill))/100));
  this.event(m,this.name(m,side)+': '+actor.hero+' — '+X.labels[error]+'. '+
   (context.highground?'Рискованный штурм возвышенности. ':context.exposed?'Команда занята Рошаном. ':'')+
   'Усталость '+Math.round(100-actor.energy)+'%, контроль карты '+Math.round(m.sides[side].control*100)+'%. Ошибка снизила исполнение в этом бою.','mistake',{side,player:actor.role,error,factor,risk});
 }
 return {side,factor,error,risk};
};
// Lanes and farming routes create encounters even without an aggressive order.
// Otherwise an automatic farming plan can grow a lead for 20 minutes untested.
Match22.skirmish=function(m,actions){
 const X=this.B.execution;
 if(m.nextSkirmish26==null)m.nextSkirmish26=m.clock+int(...X.skirmishFirst);
 if(m.clock<m.nextSkirmish26||actions.some(a=>['siege','throne','rosh','smoke','counterSmoke'].includes(a)))return;
 m.nextSkirmish26=m.clock+int(...X.skirmishInterval);
 const zones=[0,1,2,3].map(zone=>({zone,groups:[0,1].map(side=>alive4(m,side).filter(p=>p.zone===zone))})).filter(z=>z.groups.every(g=>g.length));
 if(!zones.length)return;
 const {zone,groups}=weighted4(zones,zones.map(z=>Math.min(...z.groups.map(g=>g.length))));
 const side=rng()<.5?0:1,encounter=this.encounter(m,side,{zone,groups});
 const assessment={zone,fight:encounter,p:encounter.p,factors:[m.clock<this.B.phases[0]?'стычка на линии':'перехват на маршруте фарма',groups[side].length+' на '+groups[1-side].length,'сила '+Math.round(encounter.A)+' против '+Math.round(encounter.D)]};
 this.fight(m,side,assessment);
};
