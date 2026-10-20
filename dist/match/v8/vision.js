'use strict';
Match8.sight=function(m,side,zone){
 const V=this.B.vision;
 return Math.min(1,(m.v8.wards[side].some(w=>w.zone===zone&&!w.sentry&&w.expires>m.clock)?V.wardSight:0)+(this.local(m,side,zone).length?V.heroSight:0));
};
Match8.observe=function(m){
 const V=this.B.vision;
 for(let side=0;side<2;side++){
  m.v8.wards[side]=m.v8.wards[side].filter(w=>w.expires>m.clock);
  const intel=m.v8.intel[side];
  for(const p of m.sides[1-side].heroes){
   const visible=p.deadUntil>m.clock||(this.sight(m,side,p.zone)>0&&(p.smokeUntil8<=m.clock||this.local(m,side,p.zone).length));
   if(visible)intel[p.role]={role:p.role,zone:p.zone,alive:p.deadUntil<=m.clock,deadUntil:p.deadUntil,seenAt:m.clock,teleportReady:p.tpUntil<=m.clock,ultimateReady:p.ultUntil<=m.clock,health:p.health,power:this.unit(m,p)};
  }
 }
};
Match8.known=function(m,side){return m.v8.intel[side].filter(p=>p&&m.clock-p.seenAt<=this.B.vision.knownFor&&p.alive);};
Match8.placeVision=function(m,side){
 const order=m.v8.orders[side],V=this.B.vision;if(!order||order.type!=='vision'||m.clock<m.v8.visionAt[side])return;
 const ps=this.local(m,side,order.zone).filter(p=>order.roles.includes(p.role)),p=ps.find(p=>p.bank>=V.wardCost);if(!p)return;
 addGold4(p,-V.wardCost);m.v8.visionAt[side]=m.clock+V.interval;
 const ws=m.v8.wards[side];while(ws.length>=V.maxWards)ws.shift();ws.push({zone:order.zone,expires:m.clock+V.lifetime,sentry:false});
 const sentry=p.bank>=V.sentryCost;if(sentry){addGold4(p,-V.sentryCost);while(ws.length>=V.maxWards)ws.shift();ws.push({zone:order.zone,expires:m.clock+V.lifetime,sentry:true});}
 const enemy=m.v8.wards[1-side],old=enemy.length;m.v8.wards[1-side]=enemy.filter(w=>!sentry||w.zone!==order.zone);
 if(old!==m.v8.wards[1-side].length)income5(m,side,p,V.dewardGold,'objects');
 this.event(m,this.name(m,side)+' ставит обзор в зоне '+this.zoneName(order.zone)+'. Потрачено '+(V.wardCost+(sentry?V.sentryCost:0))+' золота; саппорты пропускают фарм.','vision',{side,zone:order.zone});
};
Match8.zoneName=zone=>['верх','мид','низ','лес','Рошан','база'][zone]||'карта';

// Preparation information differs from line-of-sight after two groups collide.
Match8.coverage=function(m,side,zone){const V=this.B.vision;return Math.min(1,m.v8.wards[side].filter(w=>w.expires>m.clock).reduce((n,w)=>n+(w.zone===zone?(w.sentry?V.sentrySight:V.wardSight):Math.abs(w.zone-zone)===1?V.adjacentSight:0),0));};
