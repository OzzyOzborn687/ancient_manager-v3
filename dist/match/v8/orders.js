'use strict';
Match8.target=function(m,side,focus=false,lane=null){
 const e=m.sides[1-side];
 if(lane==null){const open=e.lanes.findIndex(l=>l.towers.every(t=>t.hp<=0));lane=open>=0?open:e.lanes.map((l,i)=>({i,t:l.towers.find(t=>t.hp>0)})).sort((a,b)=>(a.t?.tier||4)-(b.t?.tier||4)||(a.t?.hp||0)-(b.t?.hp||0))[0].i;}
 const l=e.lanes[lane],tower=l.towers.find(t=>t.hp>0);
 if(tower)return {entity:tower,lane,tier:tower.tier,type:'tower',label:'T'+tower.tier+' · '+this.zoneName(lane)};
 if(!focus){if(l.melee.hp>0)return {entity:l.melee,lane,tier:3,type:'rax',label:'мили-бараки'};if(l.ranged.hp>0)return {entity:l.ranged,lane,tier:3,type:'rax',label:'рейндж-бараки'};}
 const t4=e.t4.find(t=>t.hp>0);return t4?{entity:t4,lane,tier:4,type:'tower',label:'T4'}:{entity:e.ancient,lane,tier:5,type:'ancient',label:'Древний'};
};
Match8.available=function(m,side,type){
 const s=m.sides[side],alive=this.alive(m,side),C=this.B;
 if(m.finishedSide!=null)return 'Карта завершена';if(!ORDERS4[type])return 'Неизвестный приказ';
 if(type==='coach'||type==='gg')return '';
 if(!alive.length)return 'Нет живых героев';
 if(['rosh','siege','smoke','counterSmoke','throne'].includes(type)&&alive.length<C.orders.minimumGroup)return 'Нужны хотя бы три живых героя';
 if(['smoke','counterSmoke'].includes(type)&&(s.smokes<1||m.actionReady22[side]>m.clock))return s.smokes<1?'Нет заряда смоука':'Выход ещё перезаряжается';
 if(type==='rosh'&&(!m.roshan.alive||m.clock<C.objectives.roshanStart||s.aegisUntil>m.clock))return !m.roshan.alive?'Рошан ещё не появился':s.aegisUntil>m.clock?'Аегис уже у команды':'Нужны первые уровни и предметы';
 if(type==='rosh'&&alive.every(p=>p.items.length>=C.economy.itemSlots))return 'Нет свободного слота для Аегиса';
 if(['siege','split','throne'].includes(type)&&m.clock<C.objectives.pushStart)return 'Сначала завершите первые линии';
 if(type==='throne'&&!m.sides[1-side].lanes.some(l=>l.towers[2].hp<=0)&&net4(s)<net4(m.sides[1-side])*C.orders.throneNetRatio)return 'Нужно открыть базу или создать явное окно прорыва';
 return '';
};
Match8.describe=function(m,side,type){
 const known=this.known(m,side),target=this.target(m,side,type==='throne');let zone=target.lane,roles=[0,1,2,3,4];
 if(type==='farm'){zone=3;roles=[...this.B.orders.farmRoles];}
 if(type==='vision'){zone=this.sight(m,side,4)<.5?4:target.lane;roles=[...this.B.orders.visionRoles];}
 if(type==='defend'){const threatening=known.filter(p=>p.zone<3);zone=threatening.length?threatening[0].zone:(m.sides[1-side].targetLane??1);}
 if(type==='split'){const scored=[0,1,2].map(z=>({z,seen:known.filter(p=>p.zone===z).length,hp:this.target(m,side,false,z).entity.hp})).sort((a,b)=>a.seen-b.seen||a.hp-b.hp);zone=scored[0].z;roles=[...this.B.orders.splitRoles];}
 if(type==='rosh')zone=4;
 if(['smoke','counterSmoke'].includes(type)){const victim=known.sort((a,b)=>a.role-b.role)[0];zone=victim?.zone??3;roles=m.clock<1500?[1,2,3,4]:[0,1,2,3];}
 return {type,zone,roles:roles.filter(role=>m.sides[side].heroes[role].deadUntil<=m.clock)};
};
Match8.issue=function(m,side,type,{manual=false,target=null,roles=null}={}){
 const reason=this.available(m,side,type);if(reason)return {ok:false,reason};
 if(manual&&m.clock-m.v8.commandAt[side]<this.B.commandCooldown&&type!=='coach')return {ok:false,reason:'Подождите '+Math.ceil(this.B.commandCooldown-m.clock+m.v8.commandAt[side])+' с. после приказа'};
 if(type==='gg'){this.finish(m,1-side,'gg');return {ok:true};}
 if(manual)this.closeDecision(m,side,'смена приказа');
 if(manual)m.v8.commandAt[side]=m.clock;
 if(type==='coach'){const previous=m.v8.orders[side];if(previous)previous.manual=false;m.orders[side]={type:'coach',until:0};}
 else{
  if(!manual&&m.v8.orders[side]?.type===type&&!['smoke','counterSmoke'].includes(type)){m.v8.orders[side].until=m.clock+this.B.ai.commit;return {ok:true};}
  const order=this.describe(m,side,type);if(target!=null)order.zone=target;if(roles)order.roles=roles.filter(r=>m.sides[side].heroes[r]?.deadUntil<=m.clock);
  order.calledAt=m.clock;order.until=m.clock+(manual?this.B.orderDuration:this.B.ai.commit);order.manual=manual;order.hidden=false;
  if(['smoke','counterSmoke'].includes(type)){m.sides[side].smokes--;m.actionReady22[side]=m.clock+this.B.smoke.cooldown;order.hidden=true;order.until=m.clock+this.B.vision.smokeDuration;for(const r of order.roles)m.sides[side].heroes[r].smokeUntil8=order.until;}
  m.v8.orders[side]=order;m.orders[side]={type,until:order.until};m.plans[side]=type;
 }
 if(manual){const entry={id:m.v8.nextId++,side,type,tactic:m.tactics22[side],start:this.capture(m,side),participants:m.v8.orders[side]?.roles||[],target:m.v8.orders[side]?.zone??null};m.v8.decisionLog.push(entry);m.v8.activeDecision[side]=entry.id;m.decisions.push({minute:m.minute,sec:m.clock,key:type,title:ORDERS4[type][0],decisionId8:entry.id});}
 if(manual||['rosh','smoke','counterSmoke','throne'].includes(type))this.event(m,this.name(m,side)+': '+ORDERS4[type][0]+'. '+(type==='coach'?'Тренер пересмотрит план на ближайшей минутной оценке; текущие переходы продолжаются.':'Группа '+(m.v8.orders[side].roles.map(r=>r+1).join('/'))+' направляется в зону '+this.zoneName(m.v8.orders[side].zone)+'. Действие начнётся после прибытия.'),'order',{side});
 return {ok:true};
};
