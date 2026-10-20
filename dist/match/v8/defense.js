'use strict';
// Both sides read the same completed-order snapshot, never a current hidden order.
Match8.updateDefense=function(m){
 const C=this.B.defense;m.v8.defense??=[null,null];m.v8.defenseSeen??=[null,null];
 const threats=[0,1].map(side=>{
  const announced=m.v8.lastObservedOrders?.[1-side],push=announced&&['siege','throne'].includes(announced.type)&&announced.zone<3;
  const hit=m.v8.structurePressure?.[side],damaged=hit&&m.clock-hit.at<=C.damageMemory;
  const key=push?announced.type+':'+announced.zone:null,fresh=key&&key!==m.v8.defenseSeen[side];
  return {zone:damaged?hit.zone:push?announced.zone:null,key,refresh:!!damaged,fresh:!!fresh};
 });
 for(let side=0;side<2;side++){
  const threat=threats[side],current=m.v8.defense[side];
  if(threat.key)m.v8.defenseSeen[side]=threat.key;else m.v8.defenseSeen[side]=null;
  if(threat.zone!=null&&(threat.fresh||threat.refresh)){
   const changed=!current||current.zone!==threat.zone,tier=this.target(m,1-side,false,threat.zone).tier,roles=C.rolesByTier[tier];
   m.v8.defense[side]={zone:threat.zone,roles:[...roles],since:changed?m.clock:current.since,until:m.clock+C.alertHold};
   if(changed)this.event(m,this.name(m,side)+' стягивает свободных героев на защиту: '+this.zoneName(threat.zone)+'. Доступные TP используются; сражающиеся и мёртвые герои присоединятся позже. Фарм и давление в других зонах прерываются.','defense',{side,zone:threat.zone});
  }else if(current&&m.clock>=current.until){
   m.v8.defense[side]=null;
   this.event(m,this.name(m,side)+': угроза отступила, герои возвращаются к основному приказу.','defense',{side});
  }
 }
};
