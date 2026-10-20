'use strict';
income5=function(m,side,p,n,type){addGold4(p,n);p.totalEarned=(p.totalEarned||0)+n;m.accounting[side][type]+=n};
Match22.economy=function(m,side,seconds){
 const E=this.B.economy,s=m.sides[side],plan=m.lastActions22[side],tactic=this.B.tactics[m.tactics22[side]],fraction=seconds/60;
 for(const p of s.heroes){
  income5(m,side,p,E.passive*fraction,'passive');if(p.deadUntil>m.clock)continue;
  const h=this.hero(p.hero),safety=clamp(this.B.map.controlMin+s.control,E.safetyMin,1);
  const focus=plan==='farm'?(p.role===0?E.farmCarry:E.farmOthers):['siege','throne','rosh','smoke','counterSmoke'].includes(plan)?E.actionFarm:plan==='defend'?E.defendFarm:1;
  const access=clamp(E.accessBase+s.control*E.accessControl,E.accessMin,E.accessMax);
  const gold=E.farm[p.role]*access*focus*tactic.farm*(1+(h.farm-3)*E.farmTag)*
   (1+(p.skill-this.B.power.skillBase)*E.skill)*safety*fraction*(m.returnUntil22[side]>m.clock?E.actionFarm:1);
  income5(m,side,p,Math.max(0,gold),'farm');p.farmGold+=Math.max(0,gold);p.lastHits+=Math.max(0,gold)/43;
  p.xp+=Math.max(0,gold)*E.xp;p.level=Math.min(E.maxLevel,1+Math.floor(Math.sqrt(p.xp/E.xpDivisor)));
  p.health=clamp(p.health+E.heal*fraction,0,100);
  const slots=E.slots-(s.aegisUntil>m.clock&&s.aegisHero===p.role?1:0);
  if(p.items.length<slots&&p.bank>=p.nextItem){
   p.bank-=p.nextItem;
   if(typeof purchaseItem13==='function')purchaseItem13(m,side,p);
   else {const name=E.fallbackItems[p.items.length];p.items.push({name,cost:p.nextItem,at:m.clock});p.nextItem=Math.min(E.itemMax,p.nextItem*E.itemGrowth);this.event(m,p.name+' завершает '+name+'.','item',{side});}
  }
 }
};
