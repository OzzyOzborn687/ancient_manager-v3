'use strict';
Match8.resources=function(m,dt){
 const E=this.B.economy;
 if(m.v8.resourceMinute===Math.floor(m.clock/60))return;
 m.v8.resourceMinute=Math.floor(m.clock/60);
 for(let side=0;side<2;side++){
  m.camps[side]=Math.min(E.resourceCap,m.camps[side]+E.campPool);
  for(let lane=0;lane<3;lane++)m.laneFarm[side][lane]=Math.min(E.resourceCap,m.laneFarm[side][lane]+E.lanePool);
 }
};
Match8.economy=function(m,side,dt){
 const E=this.B.economy,s=m.sides[side];
 for(const p of s.heroes){
  income5(m,side,p,E.passive*dt/60,'passive');if(p.deadUntil>m.clock)continue;
  const here=p.zone,atBase=here===5&&p.travelUntil<=m.clock,underTower=here<3&&s.lanes[here].towers.some(t=>t.hp>0);
  if(p.combatUntil<=m.clock)p.health=Math.min(100,p.health+dt*(atBase?E.healBase:underTower?E.healTower:E.healField));
  if(here>3||p.combatUntil>m.clock||p.retreat8)continue;
  const h=Match22.hero(p.hero),peers=this.local(m,side,here).filter(q=>!q.retreat8&&q.combatUntil<=m.clock),pool=here===3?m.camps[side]:m.laneFarm[side][here];
  const weight=q=>q.role<3?E.coreFarmWeight:E.supportFarmWeight,priority=peers.reduce((n,q)=>n+weight(q),0);
  const skill=clamp(1+(p.skill-this.B.power.skillReference)*E.farmSkill,E.farmSkillMin,E.farmSkillMax);
  const cap=E.farm[p.role]*skill*(1+(h.farm-E.farmHeroReference)*E.farmHero)*dt/60*(p.travelUntil>m.clock?E.travelFactor:1);
  const earned=Math.max(0,Math.min(cap,pool*weight(p)/Math.max(1,priority)));
  if(here===3)m.camps[side]-=earned;else m.laneFarm[side][here]-=earned;
  income5(m,side,p,earned,'farm');p.farmGold+=earned;p.lastHits+=earned/E.lastHitGold;p.xp+=earned*E.xp;
  p.level=Math.min(30,1+Math.floor(Math.sqrt(p.xp/E.xpDivisor)));
  const slots=E.itemSlots-(s.aegisUntil>m.clock&&s.aegisHero===p.role?1:0);
  if(p.items.length<slots&&p.bank>=p.nextItem){p.bank-=p.nextItem;purchaseItem13(m,side,p);}
 }
};
