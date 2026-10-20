'use strict';
Match22.phaseIndex = m => m.clock<BALANCE22.phases[0]?0:m.clock<BALANCE22.phases[1]?1:2;
Match22.phase = m => ['early','mid','late'][Match22.phaseIndex(m)];
Match22.tacticKey = key => ({tempo:'pressure',teamfight:'aggressive',balanced:'control'})[key] || (BALANCE22.tactics[key]?key:'control');
Match22.init = function(m) {
 if(m.simVersion===BALANCE22.version)return m;
 const B=this.B;
 m.simVersion=B.version;m.minuteAccumulator22=0;m.phase=this.phase(m);
 m.tempo22={initiator:null,mapAdvantage:null,momentum:[0,0]};
 m.window22={pending:true,reason:m.clock?'Продолжение сохранённой карты':'План на старт карты',last:m.clock,seen:B.windows.filter(t=>t<=m.clock)};
 m.pendingAction22=null;m.lastActions22=['farm','farm'];m.tactics22=m.sides.map(s=>this.tacticKey(s.team===S.club?S.tactic:S.teams[s.team].tactic));
 m.disruption22=[0,0];m.returnUntil22=[0,0];m.actionReady22=[0,0];m.objectiveReady22=[0,0];
 m.speed22=B.playback.speeds.includes(m.speed22)?m.speed22:(S.matchSpeed22||B.playback.defaultSpeed);
 m.roshan.kills=m.sides.reduce((n,s)=>n+s.roshKills,0);m.roshan.aegisSide=null;
 m.battle=null;m.encounter6=null;m.smokeBonus=[0,0];
 if(m.counterSmoke11)m.counterSmoke11.pending=null;
 // Preserve all old economy, scores, cooldowns and objective damage.
 for(let side of [0,1]){
  const s=m.sides[side];s.vision22={wards:B.map.wards,sentries:B.map.sentries,expires:m.clock+B.map.wardLifetime,nextWard:m.clock+B.map.wardRefresh,zones:Array(B.map.zoneCount).fill(s.control)};
  for(const l of s.lanes){
   const fraction=l.rax.max?l.rax.hp/l.rax.max:1;
   l.melee??={hp:B.map.raxMelee*fraction,max:B.map.raxMelee};
   l.ranged??={hp:B.map.raxRanged*fraction,max:B.map.raxRanged};
   l.rax={hp:l.melee.hp+l.ranged.hp,max:l.melee.max+l.ranged.max};
  }
  for(const p of s.heroes){p.tpUntil??=0;p.tags22=this.hero(p.hero).tags;p.roleNumber=p.role+1;}
 }
 this.refresh(m);return m;
};
Match22.refresh=function(m){
 m.minute=Math.floor(m.clock/60);m.phase=this.phase(m);m.roshan.respawnRemaining=Math.max(0,m.roshan.spawnAt-m.clock);
 m.roshan.aegisSide=null;
 for(let side of [0,1]){
  const s=m.sides[side];if(s.aegisUntil>m.clock)m.roshan.aegisSide=side;
  for(const p of s.heroes){p.alive=p.deadUntil<=m.clock;p.respawnRemaining=Math.max(0,p.deadUntil-m.clock);p.teleportReady=p.tpUntil<=m.clock;p.ultimateReady=p.ultUntil<=m.clock;p.gold=p.bank;p.netWorth=p.nw;p.hasAegis=s.aegisUntil>m.clock&&s.aegisHero===p.role;}
  for(const l of s.lanes)l.rax.hp=l.melee.hp+l.ranged.hp;
 }
 m.tempo22.mapAdvantage=m.sides[0].control===m.sides[1].control?null:m.sides[0].control>m.sides[1].control?0:1;
};
stage4=function(m){return ['Лайнинг · 0–10','Мидгейм · 10–25','Лейт · 25+'][Match22.phaseIndex(m)]};
const makeBase22=makeLive4;
makeLive4=function(...args){const m=makeBase22(...args);Match22.init(m);m.initialChance=positionScore4(m);return m};
const migrateBase22=migrate;
migrate=function(){
 migrateBase22();pauseLive4(false);S.gameVersion=BALANCE22.version;S.matchSchema22=22;
 const maps=[S.active?.live,S.active?.sim13?.live,S.practice13?.live];
 for(const m of maps)if(m?.sides){const old=m.simVersion!==BALANCE22.version;Match22.init(m);if(old)event4(m,'Карта перенесена в 2.2: золото, счёт, предметы и повреждения сохранены; вижен и раздельные бараки восстановлены.','migration');}
};
