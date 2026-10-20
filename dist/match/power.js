'use strict';
Match22.hero=function(name){
 const h=this.B.heroes[name]||this.B.heroes['Crystal Maiden'],P=this.B.power,tags=[];
 if(P.initiationHeroes.includes(name))tags.push('initiator');
 for(const [tag,key] of [['push','push'],['control','control'],['farm','farm'],['save','save'],['building','push']])if(h[key]>=P.tagThreshold)tags.push(tag);
 tags.push(P.magicHeroes.includes(name)?'magic':'physical');
 if(P.roshanHeroes.includes(name)||HERO_ROLES4[0].includes(name))tags.push('roshan');
 return {...h,tags};
};
Match22.unit=function(m,p){
 const P=this.B.power,h=this.hero(p.hero),side=m.sides.findIndex(s=>s.heroes.includes(p));
 const original=roster(S.teams[m.sides[side].team]).find(q=>q.role===p.role);
 const roleSkill=original?.roleSkills?.[p.role]??p.skill;
 const itemBonus=p.items.reduce((n,i)=>n+(P.items[i.name]||0),0);
 return roleSkill*P.role[p.role]*(P.heroBase+h[this.phase(m)]*P.heroPhase)*
  (1+Math.pow(Math.max(0,p.nw-p.bank)/P.netWorthDivisor,P.netWorthExponent)+p.level*P.level)*
  (1+itemBonus)*(P.formBase+(p.form??80)*P.form)*(P.moraleBase+(p.morale??80)*P.morale)*
  (P.energyBase+(p.energy??80)*P.energy)*(P.masteryBase+(p.mastery??1)*P.mastery)*
  (p.ultUntil<=m.clock?P.ultReady:P.ultMissing)*(P.healthBase+p.health*P.health);
};
Match22.strength=function(m,side,group=alive4(m,side)){
 const P=this.B.power,C=this.B.combat,s=m.sides[side],hs=group.map(p=>this.hero(p.hero));
 if(!group.length)return 0;
 const count=tag=>hs.filter(h=>h.tags.includes(tag)).length;
 const synergy=1+comboCount6(group.map(p=>p.hero))*P.combo+Math.min(2,count('control'))*P.control+
  (count('initiator')?P.initiation:0)+(count('physical')&&count('magic')?P.damageBalance:0)+count('save')*P.save;
 const tactic=this.B.tactics[m.tactics22?.[side]||this.tacticKey(s.team===S.club?S.tactic:S.teams[s.team].tactic)];
 return group.reduce((n,p)=>n+this.unit(m,p),0)*synergy*tactic.phase[this.phaseIndex(m)]*
  (m.disruption22?.[side]>m.clock?P.cohesionPenalty:1)*(s.aegisUntil>m.clock?C.aegis:1);
};
Match22.probability=function(A,D,noise=0){const C=this.B.combat;return clamp(1/(1+Math.exp(-(A-D)/C.scale))+noise,C.minProbability,1-C.minProbability)};
Match22.encounter=function(m,side,{zone=1,highground=false,exposed=false,smoke=false,groups=null}={}){
 const C=this.B.combat,own=groups?.[side]||alive4(m,side),enemy=groups?.[1-side]||alive4(m,1-side);
 const factor=s=>1+m.sides[s].vision22.zones[zone]*C.vision+m.sides[s].control*C.control+m.tempo22.momentum[s]*C.momentum;
 const A=this.strength(m,side,own)*C.initiative*factor(side)*(exposed?C.roshanExposure:1)*(smoke?C.smokeBonus:1);
 const D=this.strength(m,1-side,enemy)*factor(1-side)*(highground?C.highground:1);
 return {A,D,p:this.probability(A,D),own,enemy};
};
unitPower5=function(m,p){return m.simVersion?Match22.unit(m,p):unitBase6(m,p)};
fightingPower4=function(m,side,context='field'){return Match22.strength(m,side)*(context==='highground-defense'?BALANCE22.combat.highground:1)};
positionScore4=function(m){return Match22.probability(Match22.strength(m,0),Match22.strength(m,1))*100};
