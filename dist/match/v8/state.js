'use strict';
Match8.phase=m=>m.clock<BALANCE8.phases[0]?'early':m.clock<BALANCE8.phases[1]?'mid':'late';
Match8.alive=(m,side)=>m.sides[side].heroes.filter(p=>p.deadUntil<=m.clock);
Match8.local=(m,side,zone)=>Match8.alive(m,side).filter(p=>p.zone===zone&&p.travelUntil<=m.clock);
Match8.name=(m,side)=>S.teams[m.sides[side].team].short;
Match8.event=function(m,text,type='info',extra={}){event4(m,text,type,extra);if(m.v8)m.events.at(-1).eventId8=m.v8.eventSerial=(m.v8.eventSerial||0)+1;if(m.v8)m.v8.counts[type]=(m.v8.counts[type]||0)+1;const side=extra.winner??extra.side,gain=this.B.tempo[type==='fight-end'?'fight':type==='roshan'?'roshan':type];if(m.v8&&side!=null&&gain)m.tempo22.momentum[side]=Math.min(this.B.tempo.max,m.tempo22.momentum[side]+gain);};
Match8.window=function(m,reason){if(m.finishedSide==null&&m.clock-m.window22.last>=this.B.windowCooldown){m.window22={...m.window22,pending:true,reason,last:m.clock};}};
Match8.init=function(m){
 if(m.modelVersion===8&&m.v8)return m;
 m.modelVersion=8;m.simVersion='8';m.minuteAccumulator22=0;m.battle=null;m.encounter6=null;
 m.v8={schema:8,nextThink:[0,0],orders:[null,null],intel:[[],[]],wards:[[],[]],
  battles:[],front:[Array(3).fill(0),Array(3).fill(0)],lastFight:Array(5).fill(-300),
  commandAt:[-100,-100],visionAt:[0,0],counts:{},decisionLog:[],nextId:1,activeDecision:[null,null],
  lastObserved:['coach','coach'],frame:0,accumulator:0,sideDay:[1,1]};
 m.orders=[{type:'coach',until:0},{type:'coach',until:0}];m.plans=['farm','farm'];
 m.window22={pending:true,reason:'План на начало карты · модель 8',last:0,seen:[]};
 for(let side=0;side<2;side++){
  const s=m.sides[side];s.smokes=this.B.smoke.initial;s.nextSmoke=m.clock+this.B.smoke.interval;s.control=.5;
  for(const zone of [1,side?0:2])m.v8.wards[side].push({zone,expires:m.clock+this.B.vision.lifetime,sentry:false});
  for(const p of s.heroes){p.modelVersion8=8;p.zone=laneZone6(side,p.role);p.destination=p.zone;p.travelUntil=0;p.tpUntil=0;p.combatUntil=0;p.smokeUntil8=0;p.retreat8=false;p.ultUntil=0;p.deadUntil=0;}
 }
 this.observe(m);this.sync(m);return m;
};
Match8.sync=function(m){
 m.phase=this.phase(m);m.roshan.kills=m.sides.reduce((n,s)=>n+s.roshKills,0);m.roshan.aegisSide=null;
 for(let side=0;side<2;side++){
  const s=m.sides[side];if(s.aegisUntil>m.clock)m.roshan.aegisSide=side;
  const wards=m.v8.wards[side];s.vision22.wards=wards.filter(w=>!w.sentry).length;s.vision22.sentries=wards.filter(w=>w.sentry).length;
  s.vision22.zones=Array.from({length:5},(_,z)=>this.sight(m,side,z));s.vision=avg(s.vision22.zones);
  for(const p of s.heroes){p.alive=p.deadUntil<=m.clock;p.respawnRemaining=Math.max(0,p.deadUntil-m.clock);p.teleportReady=p.tpUntil<=m.clock;p.ultimateReady=p.ultUntil<=m.clock;p.gold=p.bank;p.netWorth=p.nw;p.hasAegis=s.aegisUntil>m.clock&&s.aegisHero===p.role;}
  for(const l of s.lanes)l.rax.hp=l.melee.hp+l.ranged.hp;
 }
 sync4(m);
};
Match8.capture=function(m,side){return {sec:m.clock,gold:net4(m.sides[side])-net4(m.sides[1-side]),
 ownGold:net4(m.sides[side]),objects:this.objectCount(m.sides[side])-this.objectCount(m.sides[1-side]),
 deaths:m.sides[side].heroes.reduce((n,p)=>n+p.d,0),kills:m.sides[side].heroes.reduce((n,p)=>n+p.k,0),roshan:m.sides[side].roshKills,eventIndex:m.events.length,eventSerial:m.v8.eventSerial||0};};
Match8.closeDecision=function(m,side,reason){
 const id=m.v8.activeDecision[side],entry=m.v8.decisionLog.find(d=>d.id===id);if(!entry||entry.end)return;
 entry.end=this.capture(m,side);entry.reason=reason;entry.delta={gold:Math.round(entry.end.gold-entry.start.gold),ownGold:Math.round(entry.end.ownGold-entry.start.ownGold),objects:entry.end.objects-entry.start.objects,kills:entry.end.kills-entry.start.kills,deaths:entry.end.deaths-entry.start.deaths,roshan:entry.end.roshan-entry.start.roshan};
 entry.events=m.events.filter(e=>e.eventId8>entry.start.eventSerial&&['kill','fight-end','objective','roshan','vision','aegis','glyph','buyback'].includes(e.type)).slice(-12).map(e=>({sec:e.sec,text:e.text,type:e.type}));
 m.v8.activeDecision[side]=null;
};

Match8.objectCount=s=>s.lanes.reduce((n,l)=>n+l.towers.filter(t=>t.hp>0).length+(l.melee.hp>0)+(l.ranged.hp>0),0)+s.t4.filter(t=>t.hp>0).length+(s.ancient.hp>0);
