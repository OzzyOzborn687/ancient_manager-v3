'use strict';
Match22.timers=function(m){
 const B=this.B;
 for(let side of [0,1]){
  const s=m.sides[side],v=s.vision22;
  if(s.aegisUntil&&s.aegisUntil<=m.clock){s.aegisUntil=0;this.event(m,'Аегис истёк: бонус следующего файта потерян.','aegis',{side});}
  if(s.nextSmoke<=m.clock){s.smokes=Math.min(3,s.smokes+1);s.nextSmoke=m.clock+B.actions.roshanStart;}
  if(v.expires<=m.clock){v.wards=Math.max(0,v.wards-1);v.sentries=Math.max(0,v.sentries-1);v.expires=m.clock+B.map.wardLifetime;}
  if(v.nextWard<=m.clock){v.wards=Math.min(B.map.wardMax,v.wards+1);v.nextWard=m.clock+B.map.wardRefresh;}
  for(const p of s.heroes){
   if(p.deadUntil<=m.clock&&p.zone===5){p.zone=laneZone6(side,p.role);p.destination=p.zone;p.health=100;}
   if(p.travelUntil&&p.travelUntil<=m.clock){p.zone=p.destination;p.travelUntil=0;}
  }
 }
 if(!m.roshan.alive&&m.roshan.spawnAt<=m.clock){m.roshan.alive=true;m.roshan.spawnAt=0;m.roshan.progress=[0,0];this.event(m,'Рошан возродился: проверьте вижен и предметы перед заходом.','roshan');this.window(m,'Респаун Рошана');}
};
Match22.map=function(m,actions){
 const M=this.B.map;
 for(let side of [0,1]){
  const s=m.sides[side],e=m.sides[1-side],action=actions[side];
  const desired=clamp(M.controlBase+(towerCount4(e)-towerCount4(s))*M.structureControl+
   (alive4(m,side).length-alive4(m,1-side).length)*M.aliveControl+
   (action==='vision'?M.visionControl:action==='farm'?M.farmControl:['siege','throne'].includes(action)?M.pushControl:0),M.controlMin,M.controlMax);
  s.control+=(desired-s.control)*M.controlBlend;s.vision=s.vision22.wards/M.wardMax;
  for(let zone=0;zone<M.zoneCount;zone++)s.vision22.zones[zone]=clamp(s.control+(s.vision22.wards-e.vision22.wards)*M.structureControl,M.controlMin,M.controlMax);
  for(const p of alive4(m,side)){
   let zone=action==='rosh'?4:['siege','throne','split'].includes(action)?this.target(m,side,action==='throne').lane:action==='defend'?e.targetLane??1:action==='farm'&&p.role===0?3:laneZone6(side,p.role);
   if(p.zone!==zone){p.destination=zone;const tp=action==='defend'&&p.tpUntil<=m.clock;p.travelUntil=m.clock+(tp?M.tpTravel:M.travel);if(tp)p.tpUntil=m.clock+M.tpCooldown;}else p.destination=zone;
  }
 }
};
Match22.finish=function(m,winner,reason){
 if(m.finishedSide!=null)return;
 m.finishedSide=winner;m.resultReason=reason;m.surrendered=reason==='surrender';m.window22.pending=false;
 this.refresh(m);sync4(m);
 // Keep established career effects and report construction, exactly once.
 recordResult6(m);
 if(reason==='surrender'){
  const text=this.name(m,1-winner)+' сдаётся: большой минус по нетворсу и потеря большинства башен.';
  const last=m.events.at(-1);if(last?.type==='end')last.text=text;
  if(m.report13){m.report13.reason=reason;m.report13.points.unshift({sec:m.clock,text});}
 }
};
Match22.checkEnd=function(m){
 if(m.finishedSide!=null)return;
 const G=this.B.surrender;
 for(let side of [0,1]){
  const s=m.sides[side],e=m.sides[1-side];
  if(s.ancient.hp<=0){this.finish(m,1-side,'ancient');return;}
  const lost=m.clock>=G.minute&&net4(e)-net4(s)>=G.deficit&&net4(s)/Math.max(1,net4(e))<G.ratio&&towerCount4(s)>=G.lostTowers;
  m.surrenderSince26??=[null,null];
  if(!lost)m.surrenderSince26[side]=null;
  else {m.surrenderSince26[side]??=m.clock;if(m.clock-m.surrenderSince26[side]>=G.grace&&m.lastFight<m.clock-G.grace){this.finish(m,1-side,'surrender');return;}}
 }
};
Match22.minute=function(m){
 if(m.finishedSide!=null)return;
 const B=this.B;this.prepareExecution(m);
 // Economy uses the preceding minute's commitment. No reward is granted by clicking.
 for(let side of [0,1])this.economy(m,side,B.tick);
 m.clock+=B.tick;this.timers(m);this.refresh(m);
 const manual=!!m.pendingAction22||m.orders[0].until>m.clock&&m.orders[0].type!=='coach';
 const own=m.pendingAction22||(m.orders[0].until>m.clock&&m.orders[0].type!=='coach'?m.orders[0].type:this.ai(m,0,m.lastActions22[1]));
 m.pendingAction22=null;
 const enemy=this.ai(m,1,manual?own:m.lastActions22[0]),actions=[own,enemy];m.plans=[...actions];
 this.map(m,actions);
 for(const side of [0,1])autoBuyback6(m,side);
 this.skirmish(m,actions);
 // Initiative is based on the intended action; resolution order alternates to avoid side bias.
 const order=m.minute%2===0?[0,1]:[1,0];
 for(const side of order){
  if(m.finishedSide!=null)break;
  let action=actions[side];
  // A fight already resolved the opposing smoke/roshan/defence this minute.
  if(m.resolvedFight22===m.clock&&['smoke','counterSmoke','rosh'].includes(action)&&m.fightInitiator22!==side)continue;
  this.execute(m,side,action,actions[1-side]);
 }
 if(['smoke','counterSmoke'].includes(m.orders[0].type)||m.orders[0].type==='rosh'&&!m.roshan.alive)m.orders[0]={type:'coach',until:0};
 m.lastActions22=actions;
 for(let side of [0,1])m.tempo22.momentum[side]*=B.combat.momentumDecay;
 this.refresh(m);sync4(m);snapshot4(m);this.checkEnd(m);
 for(const t of B.windows)if(m.clock>=t&&!m.window22.seen.includes(t)){m.window22.seen.push(t);this.window(m,'Ключевой тайминг · '+t/60+' мин.');}
};
// The existing tournament/background runners may request 10 seconds. Accumulate
// them into the same deterministic minute tick used by every playback mode.
simulateTick4=function(m,dt=10){
 if(m.finishedSide!=null)return;
 Match22.init(m);m.minuteAccumulator22+=Math.max(0,Number.isFinite(dt)?dt:0);
 while(m.minuteAccumulator22>=BALANCE22.tick&&m.finishedSide==null){m.minuteAccumulator22-=BALANCE22.tick;Match22.minute(m);}
};
const fight22=Match22.fight;
Match22.fight=function(m,side,a,options){if(m.resolvedFight22===m.clock)return m.fightWinner22===side;const won=fight22.call(this,m,side,a,options);m.resolvedFight22=m.clock;m.fightInitiator22=side;m.fightWinner22=won?side:1-side;return won;};
