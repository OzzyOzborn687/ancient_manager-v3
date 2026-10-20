'use strict';
Match8.finish=function(m,winner,reason){
 if(m.finishedSide!=null)return;
 for(let side=0;side<2;side++)this.closeDecision(m,side,'конец карты');
 m.finishedSide=winner;m.resultReason=reason;m.surrendered=reason==='surrender';m.window22.pending=false;
 this.sync(m);recordResult6(m);
};
Match8.tick=function(m,dt){
 if(m.finishedSide!=null)return;const B=this.B;m.clock+=dt;m.v8.frame++;
 this.arrivals(m);
 for(let side=0;side<2;side++){
  const s=m.sides[side];if(s.nextSmoke<=m.clock){s.smokes=Math.min(B.smoke.max,s.smokes+1);s.nextSmoke=m.clock+B.smoke.interval;}
  if(s.aegisUntil&&s.aegisUntil<=m.clock){s.aegisUntil=0;this.event(m,'Время Аегиса истекло.','aegis',{side});}
  const o=m.v8.orders[side];if(o&&o.until<=m.clock){if(o.manual)this.closeDecision(m,side,'приказ исполнен или истёк');m.v8.orders[side]=null;m.orders[side]={type:'coach',until:0};}
  const decision=m.v8.decisionLog.find(d=>d.id===m.v8.activeDecision[side]);if(decision&&m.clock-decision.start.sec>=B.orderDuration&&!o?.manual)this.closeDecision(m,side,'отрезок завершён');
 }
 if(!m.roshan.alive&&m.roshan.spawnAt<=m.clock){m.roshan.alive=true;m.roshan.progress=[0,0];m.roshan.spawnAt=0;this.event(m,'Рошан возродился.','roshan');this.window(m,'Респаун Рошана');}
 if(m.roshan.alive&&m.roshan.lastDamage8&&m.clock-m.roshan.lastDamage8>B.objectives.roshanReset)for(let side=0;side<2;side++)m.roshan.progress[side]=Math.max(0,m.roshan.progress[side]-dt*B.objectives.roshanRegen);
 this.resources(m,dt);for(let side=0;side<2;side++)this.economy(m,side,dt);
 this.observe(m);
 const intents=[null,null];
 for(let side=0;side<2;side++){
  const o=m.v8.orders[side];
  if(o?.manual)continue;
  if(m.clock>=m.v8.nextThink[side]||!o){
   intents[side]=m.v8.controllers?.[side]==='expert'?this.expert(m,side):this.choose(m,side);m.v8.nextThink[side]=m.clock+B.think;
  }
 }
 // Commit only after both coaches evaluated the same observation snapshot.
 for(let side=0;side<2;side++)if(intents[side])this.issue(m,side,intents[side]);
 for(let side=0;side<2;side++){this.autoBuyback(m,side);assign5(m,side);this.placeVision(m,side);}
 this.encounters(m);battle5(m,dt);
 for(const side of (m.v8.frame%2?[0,1]:[1,0])){objectives4(m,side,dt);if(m.finishedSide!=null)break;}
 for(let side=0;side<2;side++){
  const zones=new Set(this.alive(m,side).filter(p=>p.travelUntil<=m.clock&&p.zone<5).map(p=>p.zone));
  const T=B.tempo;m.sides[side].control=clamp(T.controlBase+zones.size*T.zone+m.v8.wards[side].length*T.ward,T.minControl,T.maxControl);
  m.tempo22.momentum[side]*=Math.pow(T.decay,dt/60);
  m.v8.lastObserved[side]=m.plans[side];
 }
 m.tempo22.mapSide=m.sides[0].control===m.sides[1].control?null:m.sides[0].control>m.sides[1].control?0:1;
 this.sync(m);
 if(m.clock%60===0)snapshot4(m);
 for(const at of B.windows)if(m.clock>=at&&!m.window22.seen.includes(at)){m.window22.seen.push(at);this.window(m,'Тайминг '+at/60+' минут');}
 for(let side=0;side<2;side++){const s=m.sides[side],e=m.sides[1-side],C=B.end,lost=11-towerCount4(s),deficit=net4(e)-net4(s);
  if(m.clock>=C.surrenderAfter&&lost>=C.lostTowers&&deficit>=C.deficit&&net4(s)/Math.max(1,net4(e))<C.ratio){m.v8.surrenderSince??=[null,null];m.v8.surrenderSince[side]??=m.clock;if(m.clock-m.v8.surrenderSince[side]>=C.grace){this.finish(m,1-side,'surrender');return;}}else if(m.v8.surrenderSince)m.v8.surrenderSince[side]=null;
 }
 for(let side=0;side<2;side++)if(m.sides[side].ancient.hp<=0){this.finish(m,1-side,'ancient');return;}
};
Match8.step=function(m,seconds=10){
 if(m.finishedSide!=null)return;
 m.v8.accumulator+=Math.max(0,Number.isFinite(seconds)?seconds:0);
 while(m.v8.accumulator>=this.B.step&&m.finishedSide==null){m.v8.accumulator-=this.B.step;this.tick(m,this.B.step);}
};
