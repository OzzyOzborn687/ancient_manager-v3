'use strict';
ORDERS4.counterSmoke=['Контр-смоук','Ответная атака по общим правилам разведки и силы.'];
Match22.available=function(m,side,type){
 const B=this.B,A=B.actions,s=m.sides[side],living=alive4(m,side);
 if(m.finishedSide!=null)return 'Карта завершена';
 if(!ORDERS4[type])return 'Неизвестное действие';
 if(type==='gg'||type==='coach')return '';
 if(living.length<(type==='split'?1:A.minGroup))return 'Недостаточно живых героев';
 if(m.returnUntil22[side]>m.clock&&type!=='defend')return 'Команда возвращается со сплитпуша';
 if(type==='rosh'){
  if(!m.roshan.alive)return 'Рошан появится через '+clock4(m.roshan.spawnAt-m.clock);
  if(m.clock<A.roshanStart)return 'Сначала нужны уровни и предметы для Рошана';
  if(s.aegisUntil>m.clock)return 'Команда уже несёт Аегис';
  if(living.every(p=>p.items.length>=B.economy.slots))return 'Нет свободного слота для Аегиса';
 }
 if(['smoke','counterSmoke'].includes(type)){
  if(s.smokes<1)return 'Нет зарядов смоука';
  if(m.actionReady22[side]>m.clock)return 'Выход перезаряжается: '+clock4(m.actionReady22[side]-m.clock);
 }
 if(['siege','split','throne'].includes(type)&&m.clock<B.map.pushStart)return 'Сначала укрепите линии';
 if(type==='throne'&&!m.sides[1-side].lanes.some(l=>l.towers.every(t=>t.hp<=0)))return 'Нужно открыть хотя бы одну линию';
 return '';
};
Match22.target=function(m,side,throne=false){
 const enemy=m.sides[1-side];
 const lanes=enemy.lanes.map((l,i)=>({l,i,t:l.towers.find(t=>t.hp>0)}));
 // Farm remote lanes when split pushing, otherwise finish the most accessible objective.
 lanes.sort((a,b)=>((a.t?.tier||4)-(b.t?.tier||4))||((a.t?.hp||0)-(b.t?.hp||0)));
 let selected=throne?lanes.find(x=>!x.t)||lanes[0]:lanes[0];
 // Once a lane opens, advance through its barracks and base, rather than clear every lane.
 const open=lanes.find(x=>!x.t);if(open)selected=open;
 const {l,i,t}=selected;
 if(t)return {entity:t,label:'T'+t.tier+' · '+['верх','мид','низ'][i],lane:i,tier:t.tier,type:'tower'};
 if(!throne){if(l.melee.hp>0)return {entity:l.melee,label:'мили-бараки',lane:i,tier:3,type:'rax'};if(l.ranged.hp>0)return {entity:l.ranged,label:'рейндж-бараки',lane:i,tier:3,type:'rax'};}
 const t4=enemy.t4.find(t=>t.hp>0);if(t4)return {entity:t4,label:'T4',lane:i,tier:4,type:'tower'};
 return {entity:enemy.ancient,label:'Древний',lane:i,tier:5,type:'ancient'};
};
Match22.assess=function(m,side,type){
 const A=this.B.actions,s=m.sides[side],e=m.sides[1-side],zone=type==='rosh'?4:this.target(m,side,type==='throne').lane;
 const target=alive4(m,1-side).slice().sort((a,b)=>a.role-b.role||a.nw-b.nw)[0];
 const near=alive4(m,1-side).filter(p=>p.zone===zone||p.tpUntil<=m.clock).length;
 const factors=[];
 const groups=[0,1].map(i=>alive4(m,i));
 // A remote farming carry must travel or teleport; it cannot deal damage from another zone.
 if(type==='smoke'||type==='counterSmoke'){
  groups[1-side]=target?alive4(m,1-side).filter(p=>p===target||p.zone===target.zone||p.tpUntil<=m.clock):[];
 }
 const fight=this.encounter(m,side,{zone,highground:['siege','throne'].includes(type)&&this.target(m,side,type==='throne').tier>=3,exposed:type==='rosh'&&near>0,smoke:['smoke','counterSmoke'].includes(type),groups});
 let p=fight.p;
 if(type==='smoke'||type==='counterSmoke'){
  p-=e.vision22.wards*A.smokeWardPenalty+e.vision22.sentries*A.smokeSentryPenalty;
  p+=(s.control-e.control)*A.smokeControl+(target?.tpUntil>m.clock?A.smokeTpBonus:0);
  if(e.vision22.wards)factors.push('на маршруте '+e.vision22.wards+' вардов соперника');
  if(e.vision22.sentries)factors.push('сентри соперника контролируют подходы');
  if(target)factors.push(target.hero+(target.tpUntil>m.clock?' без телепорта':' может получить помощь через телепорты'));
  if(target?.items.some(i=>i.name==='Black King Bar'))factors.push(target.hero+' уже с BKB');
 }
 if(type==='rosh'){
  const carrier=alive4(m,side).find(p=>p.role===0);
  if(carrier&&!carrier.items.some(i=>i.name==='Black King Bar')){p-=A.roshanBkbPenalty;factors.push('керри без BKB');}
  if(e.vision22.zones[4]>s.vision22.zones[4]){p-=A.smokeWardPenalty;factors.push('враги лучше видят зону Рошана');}
  factors.push(near+' врагов могут подойти или телепортироваться');
  factors.push('урон по Рошану '+Math.round(this.roshanDamage(m,side)));
 }
 if(type==='farm'){
  p=clamp(s.control+(s.vision22.wards-e.vision22.wards)*A.smokeWardPenalty,A.riskHigh,1);
  factors.push('безопасность фарма '+Math.round(p*100)+'%','контроль карты снижается, враг может свободно пушить');
 }
 if(['siege','throne','split'].includes(type))factors.push('цель: '+this.target(m,side,type==='throne').label,'урон по строениям '+Math.round(this.pushDamage(m,side,type))+(type==='split'?' · возврат '+this.B.map.splitReturn+' с.':''));
 factors.push('сила '+Math.round(fight.A)+' против '+Math.round(fight.D));
 const reason=this.available(m,side,type);p=clamp(p,this.B.combat.minProbability,1-this.B.combat.minProbability);
 return {p,reason,risk:p<A.riskHigh?'высокий':p<A.riskLow?'средний':'низкий',factors,zone,target,fight};
};
Match22.roshanDamage=function(m,side){const A=this.B.actions;return alive4(m,side).reduce((n,p)=>n+this.unit(m,p)*(this.hero(p.hero).tags.includes('roshan')?A.roshanTag:1),0)};
Match22.pushDamage=function(m,side,type){const M=this.B.map;return alive4(m,side).reduce((n,p)=>n+M.pushHeroBase+this.hero(p.hero).push*M.pushTag+Math.max(0,p.nw-p.bank)*M.pushNet,0)*M.pushDamage*this.B.tick*(type==='split'?M.splitDamage:1)};
Match22.kill=function(m,side,victim,participants){
 if(victim.deadUntil>m.clock||!participants.length)return;
 const E=this.B.economy,s=m.sides[1-side];
 if(s.aegisUntil>m.clock&&s.aegisHero===victim.role){s.aegisUntil=0;victim.deadUntil=m.clock+5;victim.health=100;this.event(m,victim.hero+' теряет Аегис и возродится через 5 секунд.','aegis',{side:1-side});return;}
 const deficit=Math.max(0,net4(s)-net4(m.sides[side]));
 const bounty=E.killBase+victim.level*E.killLevel+victim.nw*E.killNet+Math.min(E.comebackMax,deficit*E.comeback);
 const killer=participants.slice().sort((a,b)=>b.nw-a.nw)[0];killer.k++;killer.streak++;
 for(const p of participants){income5(m,side,p,p===killer?bounty:bounty*E.assist/Math.max(1,participants.length-1),'kills');if(p!==killer)p.a++;}
 victim.d++;victim.streak=0;victim.deadUntil=m.clock+Math.min(E.deathMax,E.deathBase+victim.level*E.deathLevel);victim.zone=5;victim.destination=5;victim.travelUntil=0;victim.combatUntil=0;victim.health=100;
 this.event(m,killer.hero+' убивает '+victim.hero+': '+Math.round(bounty)+' золота, возрождение через '+Math.round(victim.deadUntil-m.clock)+' с.','kill',{side});
};
Match22.fight=function(m,side,assessment,{smoke=false,exposed=false,highground=false}={}){
 const C=this.B.combat,own=assessment.fight.own.filter(p=>p.deadUntil<=m.clock),enemy=assessment.fight.enemy.filter(p=>p.deadUntil<=m.clock);
 if(!own.length||!enemy.length)return own.length>0;
 const p=clamp(assessment.p+(rng()*2-1)*C.noise,C.minProbability,1-C.minProbability),win=rng()<p,winner=win?side:1-side,loser=1-winner;
 const winning=win?own:enemy,losing=win?enemy:own;
 const superiority=Math.abs(assessment.fight.A-assessment.fight.D)/Math.max(1,assessment.fight.A+assessment.fight.D);
 const count=Math.min(losing.length,C.casualties[0]+Math.floor(superiority*C.casualties[1])+(smoke?0:1));
 const victims=losing.slice().sort((a,b)=>smoke?(a.role-b.role):a.health-b.health||a.nw-b.nw);
 for(const v of victims.slice(0,count))this.kill(m,winner,v,winning.filter(p=>p.deadUntil<=m.clock));
 if(rng()<C.retaliation*(1-superiority)&&losing.some(p=>p.deadUntil<=m.clock))this.kill(m,loser,winning.at(-1),losing.filter(p=>p.deadUntil<=m.clock));
 for(const p of [...own,...enemy]){if(p.ultUntil<=m.clock)p.ultUntil=m.clock+C.ultCooldown;if(p.deadUntil<=m.clock)p.health=Math.max(1,p.health-C.healthLoss);}
 m.tempo22.initiator=side;m.tempo22.momentum[winner]=clamp(m.tempo22.momentum[winner]+C.momentumGain,-1,1);m.tempo22.momentum[loser]=clamp(m.tempo22.momentum[loser]-C.momentumGain,-1,1);
 const reason=assessment.factors.join('; ');
 this.event(m,(smoke?(win?'Смоук нашёл цель':'Смоук провалился'):'Файт: победа '+this.name(m,winner))+': '+reason+'.','fight-end',{winner,side,pWin:p,A:assessment.fight.A,D:assessment.fight.D});
 m.turningPoints6.push({sec:m.clock,started:m.clock-this.B.tick,stage:stage4(m),winner,kills:[winner===0?count:0,winner===1?count:0],gold:net4(m.sides[0])-net4(m.sides[1]),highground});
 this.window(m,winner===0?'Выигранный файт: реализуйте преимущество':'Проигранный файт: перестройте план');
 m.lastFight=m.clock;return win;
};
Match22.push=function(m,side,type,opponentAction){
 if(m.clock<m.objectiveReady22[side])return;
 const s=m.sides[side],enemy=m.sides[1-side],M=this.B.map,t=this.target(m,side,type==='throne'),a=this.assess(m,side,type);
 s.targetLane=t.lane;
 let damage=this.pushDamage(m,side,type);
 const defending=opponentAction==='defend'||(['siege','throne'].includes(type)&&!['farm','split','rosh'].includes(opponentAction));
 if(defending&&type==='split')damage*=M.defenderReduction;
 if(defending&&type!=='split'&&alive4(m,1-side).length>=this.B.actions.minGroup){
  if(!this.fight(m,side,a,{highground:t.tier>=3}))return;
  damage*=M.defenderReduction;
 }
 if(enemy.glyphUntil>=m.clock&&enemy.glyphUntil>0){this.event(m,'Пуш остановлен укреплением строений.','analysis',{side});return;}
 const before=t.entity.hp;t.entity.hp=Math.max(0,before-damage);
 this.event(m,this.name(m,side)+' давит '+t.label+': '+Math.round(Math.min(before,damage))+' урона. '+(opponentAction==='farm'?'Соперник занят фармом. ':defending?'Защита снизила урон. ':'Линия свободна. ')+a.factors.join('; ')+'.','push',{side});
 if(type==='split'){m.returnUntil22[side]=m.clock+M.splitReturn;for(const p of alive4(m,side)){p.tpUntil=Math.max(p.tpUntil,m.clock+M.tpCooldown);}}
 if(t.entity.hp<=0){
  m.objectiveReady22[side]=m.clock+M.regroup;
  m.objectiveLog.push({sec:m.clock,side,lane:t.lane,tier:t.tier,type:t.type});
  this.event(m,this.name(m,side)+' разрушает '+t.label+': давление и урон по зданиям превысили защиту.','objective',{side});
  if(t.type==='ancient'){this.finish(m,side,'ancient');return;}
  for(const p of s.heroes)income5(m,side,p,M.objectGold,'objects');
  this.window(m,side===0?'Разрушено строение врага':'Потеря строения: требуется решение');
 }
};
Match22.execute=function(m,side,type,opponentAction){
 const reason=this.available(m,side,type);if(reason){this.event(m,this.name(m,side)+': '+ORDERS4[type]?.[0]+' недоступно — '+reason+'.','analysis',{side});return;}
 const s=m.sides[side],A=this.B.actions,a=this.assess(m,side,type);
 if(['siege','split','throne'].includes(type)){this.push(m,side,type,opponentAction);return;}
 if(['smoke','counterSmoke'].includes(type)){
  s.smokes--;m.actionReady22[side]=m.clock+A.smokeCooldown;
  if(!a.target){this.event(m,'Смоук потрачен: все противники на возрождении.','analysis',{side});return;}
  this.fight(m,side,a,{smoke:true});
  if(a.target.deadUntil>m.clock){m.objectiveReady22[side]=m.clock;this.event(m,'Убийство '+a.target.hero+' открыло окно на башню или Рошана.','analysis',{side});}
  return;
 }
 if(type==='rosh'){
  // Exposure changes the same combat comparison; no independent fixed success roll.
  const nearby=alive4(m,1-side).filter(p=>p.zone===4||p.tpUntil<=m.clock);
  const contest=opponentAction==='rosh'||['smoke','counterSmoke','defend','vision'].includes(opponentAction)&&nearby.length>=A.minGroup;
  if(contest&&!this.fight(m,side,a,{exposed:true})){
   this.event(m,'Рошан сорван: враги вошли в яму, пока команда была занята. '+a.factors.join('; ')+'.','analysis',{side});m.roshan.progress[side]=0;return;
  }
  const damage=this.roshanDamage(m,side);m.roshan.progress[side]+=damage;
  for(const p of alive4(m,side))p.health=Math.max(1,p.health-A.roshanHealth);
  if(m.roshan.progress[side]<A.roshanWork){this.event(m,'Рошан: недостаточно урона за минуту; команда остаётся в опасной зоне.','analysis',{side});return;}
  const carrier=alive4(m,side).filter(p=>p.items.length<this.B.economy.slots).sort((a,b)=>a.role-b.role)[0];if(!carrier)return;
  m.roshan.alive=false;m.roshan.kills++;m.roshan.spawnAt=m.clock+int(...A.roshanRespawn);m.roshan.progress=[0,0];s.roshKills++;s.aegisUntil=m.clock+A.aegisDuration;s.aegisHero=carrier.role;
  for(const p of s.heroes)income5(m,side,p,A.roshanGold,'objects');
  this.event(m,this.name(m,side)+' забирает Рошана: '+carrier.hero+' несёт Аегис (1 слот, бонус следующего файта). '+a.factors.join('; ')+'.','roshan',{side});this.window(m,'Рошан убит: используйте или переждите Аегис');return;
 }
 if(type==='farm')this.event(m,this.name(m,side)+': керри получает приоритет фарма; безопасность зависит от вижена и контроля, сопернику уступлена инициатива.','farm',{side});
 if(type==='defend')this.event(m,this.name(m,side)+' защищает базу: герои готовы телепортироваться; доход снижен из-за обороны.','analysis',{side});
 if(type==='vision'){
  s.vision22.wards=Math.min(this.B.map.wardMax,s.vision22.wards+1);s.vision22.sentries=Math.min(this.B.map.sentryMax,s.vision22.sentries+1);
  const e=m.sides[1-side];e.vision22.wards=Math.max(0,e.vision22.wards-1);
  s.vision22.expires=m.clock+this.B.map.wardLifetime;
  this.event(m,this.name(m,side)+' ставит вижен и снимает вражеский вард: подготовлены подходы к объектам.','vision',{side});
 }
};
Match22.changeTactic=function(m,side,key){
 if(!this.B.tactics[key]||m.tactics22[side]===key)return false;
 m.tactics22[side]=key;m.disruption22[side]=m.clock+this.B.tacticDisruption;
 this.event(m,this.name(m,side)+': тактика «'+this.B.tactics[key].label+'». Слаженность снижена на '+this.B.tacticDisruption/60+' мин.','tactic',{side});return true;
};
