'use strict';
Match8.objectives=function(m,side,dt){
 const O=this.B.objectives,s=m.sides[side],e=m.sides[1-side],order=m.v8.orders[side];if(!order)return;
 const group=this.local(m,side,order.zone).filter(p=>order.roles.includes(p.role)&&!p.retreat8&&p.combatUntil<=m.clock);
 if(order.type==='rosh'&&m.roshan.alive){
  if(group.length<this.B.orders.minimumGroup||m.v8.battles.some(b=>b.zone===4))return;
  const dps=group.reduce((n,p)=>n+this.unit(m,p)*(Match22.hero(p.hero).tags.includes('roshan')?O.roshanTag:1),0)*O.roshanDps;
  m.roshan.progress[side]+=dt*dps;m.roshan.lastDamage8=m.clock;for(const p of group)p.health=Math.max(1,p.health-dt*O.roshanDamage);
  if(m.roshan.progress[0]+m.roshan.progress[1]>=O.roshanHealth){
   const carrier=group.filter(p=>p.items.length<this.B.economy.itemSlots).sort((a,b)=>a.role-b.role)[0];if(!carrier)return;
   m.roshan.alive=false;m.roshan.spawnAt=m.clock+int(...O.roshanRespawn);m.roshan.progress=[0,0];s.roshKills++;s.aegisUntil=m.clock+O.aegis;s.aegisHero=carrier.role;
   for(const p of group)income5(m,side,p,O.roshanGold,'objects');
   this.event(m,this.name(m,side)+' забирает Рошана реальной группой из '+group.length+' героев. Аегис у '+carrier.hero+'; линии оставались без этих игроков.','roshan',{side});
   order.until=m.clock;this.window(m,'Рошан убит: используйте Аегис');
  }
  return;
 }
 if(!['siege','split','throne'].includes(order.type)||m.clock<O.pushStart||!group.length)return;
 const t=this.target(m,side,order.type==='throne',order.zone),defenders=this.local(m,1-side,t.lane),engaged=m.v8.battles.some(b=>b.zone===t.lane);
 if(engaged)return;
 if(m.clock<s.nextObjective)return;
 const front=m.v8.front[side];front[t.lane]=clamp(front[t.lane]+dt*(group.length*O.frontRate-defenders.length*O.frontDefense),0,1);
 if(front[t.lane]<O.front[t.tier]||m.clock<s.nextObjective)return;
 if(defenders.length&&m.clock-m.v8.lastFight[t.lane]>=this.B.combat.encounterCooldown){fight4(m,side,t.tier>=3,t.lane);return;}
 if(e.glyphUntil>m.clock)return;
 if(e.glyphReady<=m.clock&&t.entity.hp<t.entity.max*O.glyphThreshold&&(defenders.length||m.v8.defense?.[1-side]?.zone===t.lane)){e.glyphUntil=m.clock+O.glyphDuration;e.glyphReady=m.clock+O.glyphCooldown;this.event(m,this.name(m,1-side)+' использует глиф: время на подкрепления.','glyph',{side:1-side});return;}
 const earlyTier2=t.type==='tower'&&t.tier===2&&m.clock<O.earlyTier2Until;
 if(earlyTier2){m.v8.fortificationNotices??=[null,null];if(m.v8.fortificationNotices[side]!==t.lane){m.v8.fortificationNotices[side]=t.lane;this.event(m,'T2 · '+this.zoneName(t.lane)+' укреплена до '+O.earlyTier2Until/60+'-й минуты: ранняя осада наносит '+Math.round(O.earlyTier2Damage*100)+'% урона.','fortification',{side:1-side,zone:t.lane});}}
 const damage=(earlyTier2?O.earlyTier2Damage:1)*dt*group.reduce((n,p)=>n+O.dpsBase+Match22.hero(p.hero).push*O.dpsHero+Math.max(0,p.nw-p.bank)*O.dpsSpent,0)/(1+defenders.length*O.defenderBlock);
 const before=t.entity.hp;t.entity.hp=Math.max(0,before-damage);
 if(t.entity.hp<before){m.v8.structurePressure??=[null,null];m.v8.structurePressure[1-side]={zone:t.lane,tier:t.tier,type:t.type,at:m.clock};}
 if(t.entity.hp<=0){
  m.objectiveLog.push({sec:m.clock,side,lane:t.lane,tier:t.tier,type:t.type});s.nextObjective=m.clock+O.regroup;if(t.type==="tower"&&t.tier<3)front[t.lane]=O.frontAfterObjective;
  this.event(m,this.name(m,side)+' разрушает '+t.label+'. На месте '+group.length+' атакующих; '+defenders.length+' защитников.','objective',{side,target:t.type,zone:t.lane});
  if(t.type==='ancient'){this.finish(m,side,'ancient');return;}
  for(const p of s.heroes)income5(m,side,p,t.type==='tower'?O.goldTower:O.goldRax,'objects');
  this.window(m,side===0?'Строение разрушено':'Потеря строения');
 }
};
Match8.autoBuyback=function(m,side){
 const s=m.sides[side],order=m.v8.orders[side],threat=this.known(m,side).filter(p=>p.zone<3).length;
 if(!s.lanes.some(l=>l.towers[2].hp<=0)||threat<2||this.alive(m,side).length>=3)return;
 if(order?.manual&&s.team===S.club&&!m.autoCoach13&&order.type!=='defend')return;
 for(const p of s.heroes){const cost=buybackCost4(p);if(p.deadUntil>m.clock+25&&p.buybackUntil<=m.clock&&p.bank>=cost){addGold4(p,-cost);p.deadUntil=m.clock;p.buybackUntil=m.clock+this.B.objectives.buybackCooldown;p.zone=5;p.destination=5;p.travelUntil=0;p.retreat8=false;p.respawnTravel=false;p.health=100;this.event(m,p.hero+' выкупается за '+cost+' и готовит TP в защиту.','buyback',{side});break;}}
};
