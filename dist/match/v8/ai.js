'use strict';
Match8.assess=function(m,side,type){
 const description=this.describe(m,side,type),known=this.known(m,side),zone=description.zone;
 const ready=description.roles.map(r=>m.sides[side].heroes[r]).filter(p=>!p.retreat8),seen=known.filter(p=>p.zone===zone),unknown=5-m.v8.intel[side].filter(p=>p&&(m.clock-p.seenAt<=this.B.vision.knownFor||p.deadUntil>m.clock)).length;
 const own=this.strength(m,side,ready),opposition=seen.reduce((n,p)=>n+p.power,0);
 const arrival=ready.length?Math.max(...ready.map(p=>p.travelUntil>m.clock?p.travelUntil-m.clock:p.zone===zone?0:this.B.movement.walk+Math.abs(p.zone-zone)*this.B.movement.zoneDistance)):0;
 const danger=seen.length/Math.max(1,ready.length)+unknown*this.B.risk.unknown+(this.sight(m,side,zone)?0:this.B.risk.noSight);
 const risk=clamp(danger+(opposition-own)/Math.max(1,own+opposition)*this.B.risk.power,this.B.risk.min,this.B.risk.max);
 const conditions=[ready.length+' героев в группе',Math.round(arrival)+' с. до сбора',seen.length+' обнаруженных врагов в зоне',unknown+' позиций неизвестно',m.sides[side].heroes[0].items.some(i=>i.name==='Black King Bar')?'BKB у керри готов':'Керри без BKB'];
 const objective=this.target(m,side,type==='throne',zone<3?zone:null);
 if(['siege','split','throne'].includes(type)&&objective.tier===2&&m.clock<this.B.objectives.earlyTier2Until)conditions.push('T2 укреплена до '+this.B.objectives.earlyTier2Until/60+'-й минуты; урон осады '+Math.round(this.B.objectives.earlyTier2Damage*100)+'%');
 if(m.v8.defense?.[side])conditions.push('Автозащита временно стягивает героев: '+this.zoneName(m.v8.defense[side].zone));
 const price=type==='farm'?'Уступаете давление на линии и объекты':type==='vision'?'Саппорты покидают коров; вард стоит '+this.B.vision.wardCost+' золота; сентри — '+this.B.vision.sentryCost+' при наличии средств':type==='rosh'?'Группа оставляет линии, теряет здоровье в яме; Аегис занимает слот':type==='smoke'||type==='counterSmoke'?'Один заряд смоука и фарм участников':type==='split'?'1–2 героя отделяются; возвращение и TP требуют времени':type==='defend'?'Отказ от давления; возможны расходы глифа и выкупа':type==='throne'?'Полный сбор и риск потери героев глубоко на базе':type==='coach'?'Короткое окно может быть упущено при автоматическом выборе':'Фарм группы и время перехода; глиф может остановить штурм';
 return {...description,reason:this.available(m,side,type),risk,riskLabel:risk>this.B.risk.high?'высокий':risk>this.B.risk.medium?'средний':'низкий',arrival,conditions,price,known:seen.length,unknown};
};
Match8.choose=function(m,side){
 const A=this.B.ai,known=this.known(m,side),tactic=m.tactics22[side],enemyDead=m.sides[1-side].heroes.filter(p=>p.deadUntil>m.clock).length;
 const enemyPlan=m.v8.lastObserved[1-side],threat=['siege','split','throne'].includes(enemyPlan)?known.filter(p=>p.zone<3).length:0,open=m.sides[side].lanes.some(l=>l.towers[2].hp<=0),enemyOpen=m.sides[1-side].lanes.some(l=>l.towers[2].hp<=0);
 const ready=this.alive(m,side).filter(p=>p.health>=this.B.movement.retreatHealth).length;
 const options=[],types=['farm','vision','smoke','rosh','siege','split','defend','throne'];
 if(enemyPlan==='smoke')types.push('counterSmoke');
 for(const type of types){
  const a=this.assess(m,side,type);if(a.reason)continue;
  let score=A[type]??A.push;
  if(type==='siege')score=A.push+(m.clock>=A.lateAt?A.latePush:0)+(enemyDead>=A.deathWindow?A.opportunity:0)+(m.sides[side].aegisUntil>m.clock?A.opportunity*A.aegisOpportunity:0);
  if(type==='defend')score=A.defend+(threat>=A.threatGroup?(open?A.danger:A.danger*A.defenseMultiplier):0)+(ready<this.B.orders.minimumGroup?A.opportunity:0);
  if(type==='farm')score=A.farm+(m.clock<A.farmUntil?A.earlyFarm:-A.lateFarmPenalty)-(open&&threat>=A.farmThreat?A.danger:0);
  if(type==='vision')score=A.vision+(a.unknown>=A.visionUnknown?A.visionNeed:0);
  if(type==='rosh')score=A.roshan+(known.filter(p=>p.zone===4).length>=A.threatGroup?A.opportunity*A.roshanContest:0)+(enemyDead>=A.deathWindow?A.opportunity:0)-(a.unknown>=A.visionUnknown?A.roshanUnknownPenalty:0);
  if(type==='throne')score=enemyOpen&&enemyDead>=A.throneDeaths?A.throne+A.opportunity:A.throneUnavailable;
  if(type==='split')score=A.split+(known.filter(p=>p.zone===4).length>=A.threatGroup?A.splitDiversion:0);
  if(m.v8.orders[side]?.type===type)score+=A.continuity;score-=a.risk*A.risk;if(this.B.tactics[tactic]?.preferred===type)score+=A.preferred;
  if(!Number.isFinite(score))throw Error('Invalid action score: '+type);options.push({type,score});
 }
 const probabilities=Match22.softmax(options.map(o=>o.score),A.temperature);
 const chosen=options.length?weighted4(options,probabilities).type:'defend';
 m.ai22??=[null,null];m.ai22[side]={sec:m.clock,chosen,options:options.map((o,i)=>({...o,selectionProbability:probabilities[i]}))};return chosen;
};
// Public-state policy used by the A/B evaluation; no future outcomes or hidden positions.
Match8.expert=function(m,side){
 const A=this.B.ai,o=m.v8.orders[side],enemy=m.sides[1-side];
 // Protect enough time for travel and a completed encounter. No oracle or future RNG.
 if(o&&m.clock-o.calledAt<A.expertCommit&&!this.available(m,side,o.type))return o.type;
 if(m.clock<A.expertLaneStart)return 'farm';
 const dead=enemy.heroes.filter(p=>p.deadUntil>m.clock).length;
 if(dead>=A.expertThroneDeaths&&!this.available(m,side,'throne'))return 'throne';
 return !this.available(m,side,'siege')?'siege':!this.available(m,side,'split')?'split':'farm';
};
