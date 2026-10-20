'use strict';
Match8.move=function(m,p,zone,defensive=false){
 if(p.deadUntil>m.clock||p.combatUntil>0&&p.combatUntil>=m.clock)return;
 if(p.travelUntil>m.clock){return;} // Never restart a journey on each simulation tick.
 if(p.zone===zone)return;
 const C=this.B.movement,tp=defensive&&p.tpUntil<=m.clock;
 p.destination=zone;p.travelUntil=m.clock+(tp?C.tp:C.walk+Math.abs(p.zone-zone)*C.zoneDistance);
 if(tp)p.tpUntil=m.clock+C.tpCooldown;
};
Match8.arrivals=function(m){
 for(let side=0;side<2;side++)for(const p of m.sides[side].heroes){
  if(p.deadUntil>m.clock)continue;
  if(p.respawnTravel){p.respawnTravel=false;p.zone=5;p.destination=5;p.travelUntil=0;p.retreat8=true;}
  if(p.travelUntil&&p.travelUntil<=m.clock){p.zone=p.destination;p.travelUntil=0;}
  if(p.retreat8&&p.zone===5&&p.health>=this.B.movement.healReady)p.retreat8=false;
 }
};
Match8.assign=function(m,side){
 const order=m.v8.orders[side],response=m.v8.defense?.[side];if(!order&&!response)return;
 const s=m.sides[side];s.targetLane=response?.zone??(order?.zone<3?order.zone:s.targetLane);
 for(const p of this.alive(m,side)){
  if(p.combatUntil>0&&p.combatUntil>=m.clock)continue;
  if(p.health<this.B.movement.retreatHealth&&order?.type!=='throne')p.retreat8=true;
  let zone=laneZone6(side,p.role),defensive=false;
  if(response&&!p.retreat8&&response.roles.includes(p.role)){
   zone=response.zone;defensive=true;
   // An available TP can interrupt an uncompleted walk; a spent TP/combat cannot.
   if(p.travelUntil>m.clock+this.B.movement.tp&&p.tpUntil<=m.clock){p.travelUntil=0;p.destination=p.zone;}
  }
  else if(m.v8.reformUntil?.[side]>m.clock)zone=this.B.movement.rallyZone;
  else if(p.retreat8)zone=5;
  else if(order?.roles.includes(p.role)){zone=order.zone;defensive=order.type==='defend';}
  else if(p.role===0)zone=3;
  this.move(m,p,zone,defensive);
 }
};
