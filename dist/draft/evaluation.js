'use strict';
// One score per completed draft. All weights are tunable game-design values.
const DraftUpdate={
 version:1,
 roles:['carry','mid','offlane','soft_support','hard_support'],
 roleLabels:['Керри','Мид','Оффлейн','Поддержка 4','Поддержка 5'],
 tags:['initiation','control','teamfight','frontline','physical_damage','magic_damage','pure_damage','burst','save','sustain','push','waveclear','catch','scaling','farm_dependent'],
 weights:{secondary:-1,unsupported:-3,counter:1,counterCap:5,combo:1,comboCap:3,initiation:2,control:2,damage:3,protection:1,farm:1,conversion:.5,limit:5},
 combos:[
  {a:'initiation',b:'teamfight',label:'Инициация + массовый бой'},
  {a:'control',b:'burst',label:'Контроль + быстрый урон'},
  {a:'frontline',b:'physical_damage',label:'Передняя линия + физический урон'}
 ],
 validate(picks){
  if(!Array.isArray(picks)||picks.length!==5)throw Error('Драфт должен содержать пять героев');
  if(new Set(picks.map(p=>p.hero)).size!==5)throw Error('Повтор героя в составе');
  if(new Set(picks.map(p=>p.role)).size!==5)throw Error('Каждая позиция должна быть занята один раз');
  for(const p of picks){if(!Object.hasOwn(DRAFT_HEROES,p.hero))throw Error('Нет данных драфта: '+p.hero);if(!Number.isInteger(p.role)||p.role<0||p.role>4)throw Error('Некорректная позиция');}
 },
 score(picks,enemy){
  this.validate(picks);this.validate(enemy);
  const W=this.weights,details={positions:[],counters:[],combinations:[],gaps:[],conditional:[]},parts={roles:0,counters:0,synergy:0,gaps:0};
  const has=tag=>picks.some(p=>DRAFT_HEROES[p.hero].tags.includes(tag));
  for(const p of picks){
   const h=DRAFT_HEROES[p.hero],role=this.roles[p.role],fit=h.roles.includes(role)?'основная':h.secondary_roles.includes(role)?'вторичная':'неподходящая';
   const points=fit==='основная'?0:fit==='вторичная'?W.secondary:W.unsupported;
   parts.roles+=points;details.positions.push({hero:p.hero,role:p.role,fit,points});
   for(const q of enemy){
    if(h.counters.includes(q.hero))details.counters.push({hero:p.hero,target:q.hero,points:W.counter,reason:DRAFT_COUNTER_REASONS[p.hero+'|'+q.hero]});
    if(h.conditional_counters[q.hero])details.conditional.push({hero:p.hero,target:q.hero,reason:h.conditional_counters[q.hero],points:0});
   }
  }
  // countered_by mirrors counters for inspection; never count that mirror again.
  parts.counters=Math.min(W.counterCap,details.counters.length*W.counter);
  for(const rule of this.combos){
   let pair;
   for(const a of picks)for(const b of picks)if(!pair&&a.hero!==b.hero&&DRAFT_HEROES[a.hero].tags.includes(rule.a)&&DRAFT_HEROES[b.hero].tags.includes(rule.b))pair=[a.hero,b.hero];
   if(pair)details.combinations.push({label:rule.label,heroes:pair,points:W.combo});
  }
  parts.synergy=Math.min(W.comboCap,details.combinations.length*W.combo);
  const gap=(label,points)=>{details.gaps.push({label,points:-points});parts.gaps+=points;};
  if(!has('initiation'))gap('Нет инициации',W.initiation);
  if(!has('control'))gap('Нет контроля',W.control);
  if(!has('physical_damage')&&!has('magic_damage')&&!has('pure_damage'))gap('Нет отмеченного источника урона',W.damage);
  if(!has('frontline')&&!has('save')&&!has('sustain'))gap('Нет передней линии, спасения или восстановления',W.protection);
  // Resource demand is position-dependent: a support Lina is not a farming core.
  const farmers=picks.filter(p=>p.role<3&&DRAFT_HEROES[p.hero].tags.includes('farm_dependent'));
  if(farmers.length>2)gap('Избыток зависимых от фарма коров: '+farmers.map(p=>p.hero).join(', '),(farmers.length-2)*W.farm);
  return {picks:picks.map(p=>({hero:p.hero,role:p.role})),parts,score:parts.roles+parts.counters+parts.synergy-parts.gaps,details};
 },
 evaluate(a,b,{allowMirror=false}={}){
  this.validate(a);this.validate(b);
  if(!allowMirror&&a.some(p=>b.some(q=>q.hero===p.hero)))throw Error('Герой выбран обеими командами');
  const teams=[this.score(a,b),this.score(b,a)],difference=teams[0].score-teams[1].score;
  const bonus=Math.max(-this.weights.limit,Math.min(this.weights.limit,difference*this.weights.conversion));
  return {version:this.version,teams,difference,bonuses:[bonus,bonus===0?0:-bonus]};
 },
 audit(){
  const supported=new Set(HERO_ROLES4.flat()),errors=[];
  for(const hero of supported)if(!DRAFT_HEROES[hero])errors.push('Missing '+hero);
  for(const [name,h] of Object.entries(DRAFT_HEROES)){
   if(!supported.has(name))errors.push('Unsupported '+name);
   if(!h.roles.length||h.roles.some(r=>!this.roles.includes(r))||h.secondary_roles.some(r=>!this.roles.includes(r)||h.roles.includes(r)))errors.push('Roles '+name);
   if(h.tags.some(t=>!this.tags.includes(t))||new Set(h.tags).size!==h.tags.length)errors.push('Tags '+name);
   for(const other of h.counters){if(!DRAFT_HEROES[other]?.countered_by.includes(name)||!DRAFT_COUNTER_REASONS[name+'|'+other]||other===name)errors.push('Counter '+name+' / '+other);}
   for(const other of h.countered_by)if(!DRAFT_HEROES[other]?.counters.includes(name))errors.push('Reverse '+name+' / '+other);
   for(const other of Object.keys(h.conditional_counters))if(!DRAFT_HEROES[other]||h.counters.includes(other))errors.push('Conditional '+name+' / '+other);
  }
  return errors;
 }
};
