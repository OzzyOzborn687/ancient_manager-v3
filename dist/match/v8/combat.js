'use strict';
Match8.unit=function(m,p){
 const P=this.B.power,h=Match22.hero(p.hero),spent=Math.max(0,p.nw-p.bank),items=p.items.reduce((n,i)=>n+(P.items[i.name]||0),0);
 return this.careerFactor(m,p)*P.base*Math.exp((p.skill-P.skillReference)*P.skill)*P.role[p.role]*(P.heroBase+h[this.phase(m)]*P.heroPhase)*
  (1+Math.pow(spent/P.spentDivisor,P.spentExponent)+p.level*P.level)*(1+items)*
  (1+((p.form??P.formReference)-P.formReference)*P.form)*(1+((p.morale??P.formReference)-P.formReference)*P.morale)*(1-((100-(p.energy??100))*P.energy))*
  (P.masteryBase+(p.mastery??1)*P.mastery)*(P.healthBase+p.health*P.health);
};
Match8.strength=function(m,side,group=this.alive(m,side)){return group.reduce((n,p)=>n+this.unit(m,p),0);};
Match8.probability=function(m,b){
 const C=this.B.combat,groups=[0,1].map(s=>this.local(m,s,b.zone)),powers=groups.map((g,s)=>this.strength(m,s,g));
 const readiness=groups.map((g,s)=>g.length?avg(g.map(p=>b.ready[s][p.role]?1:0)):0);
 const info=b.information||[0,1].map(s=>this.coverage(m,s,b.zone));
 const skill=C.skillWeight*Math.log(Math.max(1,powers[0])/Math.max(1,powers[1]));
 const position=b.highground?(b.attacker===0?-C.position:C.position):0;
 const initiative=b.attacker===0?C.initiative:b.attacker===1?-C.initiative:0;
 const surprise=b.surprise===0?C.surprise:b.surprise===1?-C.surprise:0;
 const information=(info[0]-info[1])*C.vision,spells=(readiness[0]-readiness[1])*C.readiness;
 const synergy=groups.map(g=>comboCount6(g.map(p=>p.hero))*C.combo);
 const logit=skill+position+initiative+surprise+information+spells+synergy[0]-synergy[1]+(b.noise||0);
 return {p:clamp(1/(1+Math.exp(-logit)),C.minProbability,C.maxProbability),groups,powers,factors:{localPower:skill,position,initiative,surprise,information,spells,synergy:synergy[0]-synergy[1]}};
};
Match8.startFight=function(m,attacker=null,highground=false,zone=1,extra={}){
 if(m.v8.battles.some(b=>b.zone===zone))return false;
 const groups=[0,1].map(s=>this.local(m,s,zone));if(groups.some(g=>!g.length))return false;
 if(m.clock-m.v8.lastFight[zone]<this.B.combat.encounterCooldown)return false;
 const b={zone,attacker,highground,surprise:extra.surprise??null,started:m.clock,ends:m.clock+this.B.combat.duration,
  information:[0,1].map(s=>this.coverage(m,s,zone)),ready:[{},{}],groups:[[],[]],kills:[0,0],noise:(rng()*2-1)*this.B.combat.executionNoise};
 for(let side=0;side<2;side++)for(const p of groups[side]){b.ready[side][p.role]=p.ultUntil<=m.clock;b.groups[side].push(p.role);p.ultUntil=b.ready[side][p.role]?m.clock+this.B.combat.ultCooldown:p.ultUntil;p.combatUntil=b.ends;}
 if(Math.abs(b.noise)>this.B.combat.executionErrorAt)this.event(m,this.name(m,b.noise>0?1:0)+' ошибается при исполнении: запоздалая реакция на начало боя.','mistake',{side:b.noise>0?1:0});
 m.tempo22.initiator=attacker;m.v8.battles.push(b);m.battle=m.v8.battles[0];m.nextFight=b.ends;
 this.event(m,'Бой: '+this.zoneName(zone)+' · '+groups[0].length+' на '+groups[1].length+'. Подкрепления присоединятся только после прибытия.','fight',{zone,side:attacker});
 this.window(m,'Начался локальный бой · '+this.zoneName(zone));return true;
};
Match8.kill=function(m,side,victim,participants){
 const C=this.B.combat,enemy=m.sides[1-side];participants=participants.filter(p=>p.deadUntil<=m.clock&&p.zone===victim.zone&&p.travelUntil<=m.clock);
 if(victim.deadUntil>m.clock||!participants.length)return false;
 if(enemy.aegisUntil>m.clock&&enemy.aegisHero===victim.role){enemy.aegisUntil=0;victim.deadUntil=m.clock+this.B.objectives.aegisRespawn;victim.health=100;this.event(m,victim.hero+' теряет Аегис; убийство не начислено.','aegis',{side:1-side});return false;}
 const killer=weighted4(participants,participants.map(p=>C.killWeights[p.role]*Math.sqrt(Math.max(1,this.unit(m,p)))));
 const shutdown=Math.min(C.shutdownMax,victim.streak*C.shutdown),bounty=C.killBase+victim.level*C.killLevel+victim.nw*C.killNet+shutdown;
 for(const p of participants){income5(m,side,p,p===killer?bounty:bounty*C.assist/Math.max(1,participants.length-1),'kills');if(p!==killer)p.a++;}
 killer.k++;killer.streak++;victim.d++;victim.streak=0;addGold4(victim,-Math.min(victim.bank,C.deathGold));
 victim.deadUntil=m.clock+Math.min(C.deathMax,C.deathBase+victim.level*C.deathLevel);victim.combatUntil=0;victim.travelUntil=0;victim.zone=5;victim.destination=5;victim.health=100;victim.respawnTravel=true;
 this.event(m,killer.hero+' убивает '+victim.hero+' · '+Math.round(bounty)+' золота'+(shutdown?' · прервана серия +'+shutdown:'')+'. Возрождение '+Math.round(victim.deadUntil-m.clock)+' с.','kill',{side,killer:killer.role,victim:victim.role,gold:bounty});return true;
};
Match8.battles=function(m,dt){
 for(const b of [...m.v8.battles]){
  const result=this.probability(m,b);
  for(let side=0;side<2;side++)for(const p of result.groups[side]){
   if(b.ready[side][p.role]===undefined){b.ready[side][p.role]=p.ultUntil<=m.clock;b.groups[side].push(p.role);if(b.ready[side][p.role])p.ultUntil=m.clock+this.B.combat.ultCooldown;this.event(m,p.hero+' прибыл в бой в зоне '+this.zoneName(b.zone)+'.','reinforcement',{side,zone:b.zone});}
   p.combatUntil=b.ends;if(result.groups[1-side].length)p.health=Math.max(1,p.health-dt*this.B.combat.chip*result.groups[1-side].length/Math.max(1,result.groups[side].length));
  }
  if(m.clock<b.ends&&result.groups.every(g=>g.length))continue;
  if(result.groups.every(g=>g.length)){
   const win=rng()<result.p?0:1,lose=1-win,winning=result.groups[win],losing=[...result.groups[lose]];
   const probability=win===0?result.p:1-result.p,margin=Math.abs(probability-.5)*2;
   const count=Math.min(losing.length,Math.floor(losing.length*this.B.combat.lossFraction*probability+rng()));
   for(let i=0;i<count&&losing.length;i++){const victim=weighted4(losing,losing.map(p=>this.B.combat.targetWeights[p.role]*(2-p.health/100)));losing.splice(losing.indexOf(victim),1);if(this.kill(m,win,victim,winning))b.kills[win]++;}
   for(const p of winning){if(!losing.some(q=>q.deadUntil<=m.clock)||winning.filter(q=>q.deadUntil<=m.clock).length<=1)break;if(rng()<this.B.combat.retaliation*(1-probability)&&this.kill(m,lose,p,losing))b.kills[lose]++;}
   this.event(m,'Файт '+b.kills.join(':')+' · победа '+this.name(m,win)+'. В зоне было '+result.groups.map(g=>g.length).join(' против ')+'; '+(b.highground?'защита возвышенности; ':'')+(b.surprise!=null?'неожиданный контакт; ':'')+'готовность ультимейтов и вижен учтены.','fight-end',{winner:win,zone:b.zone,pWin:result.p,factors:result.factors,kills:[...b.kills]});
   m.turningPoints6.push({sec:m.clock,started:b.started,stage:stage4(m),winner:win,kills:[...b.kills],gold:net4(m.sides[0])-net4(m.sides[1]),highground:b.highground});
   this.window(m,win===0?'Файт выигран: окно для объекта':'Файт проигран: пересмотрите план');
  }
  for(const side of [0,1])for(const p of result.groups[side]){p.combatUntil=0;if(p.health<this.B.movement.retreatHealth)p.retreat8=true;}
  m.v8.lastFight[b.zone]=m.clock;m.lastFight=m.clock;m.v8.battles=m.v8.battles.filter(q=>q!==b);
 }
 m.battle=m.v8.battles[0]||null;
};
Match8.encounters=function(m){
 for(let zone=0;zone<5;zone++){
  const groups=[0,1].map(s=>this.local(m,s,zone));if(groups.some(g=>!g.length))continue;
  const orders=m.v8.orders,aggressive=s=>orders[s]&&orders[s].zone===zone&&['smoke','siege','throne','rosh'].includes(orders[s].type);
  let attacker=aggressive(0)&&aggressive(1)?(rng()<.5?0:1):aggressive(0)?0:aggressive(1)?1:null,surprise=null;
  if(m.v8.battles.some(b=>b.zone===zone)||m.clock-m.v8.lastFight[zone]<this.B.combat.encounterCooldown)continue;
  if(attacker!=null&&orders[attacker].hidden){
   const ward=m.v8.wards[1-attacker].some(w=>w.zone===zone&&w.expires>m.clock),counter=orders[1-attacker]?.type==='counterSmoke';
   const read=rng()<this.B.vision.smokeRead+(ward?this.B.vision.smokeReadVision:0)+(counter?this.B.vision.counterSmokeRead:0);
   surprise=read?1-attacker:attacker;orders[attacker].hidden=false;
   this.event(m,read?'Смоук прочитан: враг занял удобную позицию для встречного боя.':'Смоук нашёл цель: группа прибыла незамеченной.','smoke',{side:attacker,zone});
   for(const p of groups[attacker])p.smokeUntil8=0;
  }
  const target=attacker!=null?this.target(m,attacker,orders[attacker]?.type==='throne',zone<3?zone:null):null;
  const highground=zone<3&&target?.tier>=3&&aggressive(attacker);
  if(m.clock>=m.nextFight||attacker!=null)fight4(m,attacker,!!highground,zone,{surprise});
 }
};

// Preserve purchased preparation, patch tuning and the frozen TI plan.
Match8.careerFactor=function(m,p){
 const side=m.sides.findIndex(s=>s.heroes.includes(p)),own=m.sides[side].team===S.club,P=this.B.power,Q=P.quality;
 const a=p.attributes13||{},quality=Object.entries(Q).filter(([k])=>!['reference','scale'].includes(k)).reduce((n,[k,w])=>n+(a[k]??Q.reference)*w,0);
 const patch=(m.heroMeta13?.find(h=>h.hero===p.hero)?.percent||0)/100,scout=own?(m.scout13?.[1-side]||0):0;
 const plan=own&&m.tiEvent?.plan,ti=plan==='tempo'?P.ti.tempo[m.clock<P.ti.tempoAt?0:1]:plan==='late'?P.ti.late[m.clock<P.ti.lateAt?0:1]:plan==='steady'?P.ti.steady:1;
 return (1+(quality-Q.reference)*Q.scale)*(1+patch)*(1+scout)*(p.itemFactor13||1)*(1+(m.preparation21?.[side]||0))*ti;
};
