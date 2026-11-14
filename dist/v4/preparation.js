'use strict';
const Fans4={
 support(team){if(!this.cache||this.cache.state!==S||this.cache.day!==S.day||this.cache.teams!==S.teams.length||this.cache.events!==S.events.length)this.cache={state:S,day:S.day,teams:S.teams.length,events:S.events.length,values:S.teams.map(t=>clubAudience4(t).fans)};const fans=this.cache.values[team.id];return {fans,bonus:Math.min(V4_CONFIG.fans.max,Math.max(0,Math.log2(1+fans/V4_CONFIG.fans.reference)*V4_CONFIG.fans.scale))};},
 apply(p,info){
  const old=p.v4FanSupport?.applied||0,base=clamp(p.morale-old,V4_CONFIG.fans.minMorale,V4_CONFIG.fans.maxMorale),bonus=p.team===null||p.retired?0:info.bonus;
  p.morale=clamp(base+bonus,V4_CONFIG.fans.minMorale,V4_CONFIG.fans.maxMorale);
  p.v4FanSupport={team:p.team,applied:p.morale-base,fans:p.team===null?0:info.fans};
 },
 reconcile(){this.cache=null;const table=S.teams.map(t=>this.support(t));for(const p of S.players)this.apply(p,table[p.team]||{fans:0,bonus:0});},
};
const Camp4={
 plans(){return S.v4?.camps||{};},
 key(event,team=S.club){return event+':'+team;},
 confirmed(e,team){return !!e&&(e.qualified13||e.entrants||[]).includes(team)||!!e?.qualification?.invited?.some(r=>r.team===team);},
 current(team,day=S.day){return Object.values(this.plans()).find(b=>b.team===team&&b.status==='active'&&day>b.start&&day<=b.end);},
 busy(team){return !!(S.active?.entrants?.includes(team)||S.active?.event&&S.events.find(e=>e.id===S.active.event)?.entrants?.includes(team)||S.practice13&&[S.club,S.practice13.team].includes(team));},
 reason(e,team,tier){
  if(!e||e.done)return 'Турнир завершён или отсутствует.';
  if(!Object.hasOwn(V4_CONFIG.camp.tiers,tier))return 'Неизвестная программа.';
  if(this.plans()[this.key(e.id,team)])return 'Подготовка к этому турниру уже выбрана.';
  if(!this.confirmed(e,team))return 'Сначала подтвердите участие: получите инвайт или пройдите квалификацию.';
  const gap=e.day-S.day;if(gap<7||gap>14)return 'Выбор доступен за 7–14 дней до старта.';
  if(this.busy(team))return 'Команда занята официальным турниром или КВ.';
  if(tier!=='online'&&S.events.some(other=>other.id!==e.id&&!other.done&&this.confirmed(other,team)&&other.day<S.day+7&&other.day+(other.duration||1)>S.day))return 'На неделе буткемпа запланирован другой турнир.';
  if(Object.values(this.plans()).some(b=>b.team===team&&b.status==='active'))return 'Сначала завершите текущий буткемп.';
  if(funds13(team)<V4_CONFIG.camp.tiers[tier].cost)return 'Недостаточно средств клуба.';
  return '';
 },
 book(event,tier,team=S.club){
  V4.install();const e=S.events.find(e=>e.id===event),reason=this.reason(e,team,tier);if(reason)return {ok:false,reason};
  const cfg=V4_CONFIG.camp.tiers[tier],record={event,team,tier,start:S.day,end:S.day+7,eventDay:e.day,cost:cfg.cost,status:tier==='online'?'online':'active',days:{},refund:0};
  if(cfg.cost)pay13(team,-cfg.cost,'Буткемп · '+cfg.label+' · '+e.name);
  S.v4.camps[this.key(event,team)]=record;
  if(team===S.club)log(e.name+' · выбрана '+cfg.label+(cfg.cost?' за '+cash(cfg.cost):' без бонусов буткемпа')+'.');
  return {ok:true,record};
 },
 close(b,status,voluntary=false){
  if(b.status!=='active')return false;
  const used=Object.keys(b.days).length,refund=Math.floor(b.cost*(7-used)/7*(voluntary?V4_CONFIG.camp.cancellationRefund:1));
  b.status=status;b.closedDay=S.day;b.refund=refund;
  if(refund)pay13(b.team,refund,'Возврат за неиспользованные дни буткемпа');
  if(b.team===S.club)log('Буткемп '+V4_CONFIG.camp.tiers[b.tier].label+': '+(status==='cancelled'?'отменён':'прерван')+'. Возврат '+cash(refund)+'.');
  return true;
 },
 apply(p,beforeForm,allowForm=true){
  if(p.retired||!p.active||p.team===null)return;
  const b=this.current(p.team);if(!b)return;
  const e=S.events.find(e=>e.id===b.event);
  if(!e||e.done||S.day>e.day||this.busy(p.team)){this.close(b,'interrupted');return;}
  const day=b.days[S.day]??={players:{}};if(Object.hasOwn(day.players,p.id))return;
  const cfg=V4_CONFIG.camp.tiers[b.tier],old=p.form,fatigue=p.fatigue,g=p.progress21;
  const ceiling=Math.min(95,Math.max(g?.initialForm||75,75+20*Math.min(1,(g?.successfulDays||0)/60))+5);
  if(allowForm)p.form=Math.max(old,Math.min(ceiling,old+cfg.form+Math.max(0,old-beforeForm)*cfg.growth));
  p.fatigue=Math.max(0,p.fatigue-cfg.recovery);
  day.players[p.id]={form:p.form-old,recovery:fatigue-p.fatigue};
 },
 daily(skipOwn=false){
  for(const p of S.players)this.apply(p,p.form,!(p.team===S.club&&skipOwn));
  for(const b of Object.values(this.plans()))if(b.status==='active'&&S.day>=b.end){b.status='completed';b.closedDay=S.day;if(b.team===S.club)log('Буткемп завершён: '+V4_CONFIG.camp.tiers[b.tier].label+'. Дневные результаты доступны в подготовке.');}
 },
 choiceEvent(){return S.events.filter(e=>!e.done).sort((a,b)=>a.day-b.day||a.id-b.id).find(e=>!this.reason(e,S.club,'online'));},
 autoBook(){
  for(const team of S.teams){
   if(team.id===S.club)continue;
   for(const e of [...S.events].sort((a,b)=>a.day-b.day||a.id-b.id)){
    if(e.day-S.day<7||e.day-S.day>14||!this.confirmed(e,team.id)||e.done||this.plans()[this.key(e.id,team.id)]||this.busy(team.id))continue;
    const funds=funds13(team.id),tier=['elite','advanced','standard'].find(key=>V4_CONFIG.camp.tiers[key].cost<=funds*.1&&V4_CONFIG.camp.tiers[key].cost<=(e.pool||0)*.2)||'online';
    if(this.book(e.id,tier,team.id).ok&&tier!=='online')break;
   }
  }
 },
 results(b){
  return Object.entries(b.days).map(([day,entry])=>{const values=Object.values(entry.players);return {day:+day,players:values.length,form:values.length?avg(values.map(v=>v.form)):0,recovery:values.length?avg(values.map(v=>v.recovery)):0};}).sort((a,b)=>a.day-b.day);
 }
};
const V4={
 install(){if(!S)return;S.v4??={version:4,camps:{},installedDay:S.day};Majors4.install();},
 valid(state){
  if(state.v4===undefined)return true;
  const v=state.v4;if(v.version!==4||!Number.isInteger(v.installedDay)||v.installedDay<0||!v.camps||typeof v.camps!=='object'||Array.isArray(v.camps))return false;
  const keys=new Set();
  for(const [key,b] of Object.entries(v.camps)){
   if(!b||key!==b.event+':'+b.team||keys.has(key)||!Number.isInteger(b.team)||!state.teams[b.team]||!state.events.some(e=>e.id===b.event)||!Object.hasOwn(V4_CONFIG.camp.tiers,b.tier)||!['active','online','completed','cancelled','interrupted'].includes(b.status)||!Number.isInteger(b.start)||b.start<0||!Number.isInteger(b.end)||b.end!==b.start+7||b.start>state.day||b.cost!==V4_CONFIG.camp.tiers[b.tier].cost||!Number.isFinite(b.refund)||b.refund<0||b.refund>b.cost||!b.days||Array.isArray(b.days)||Object.keys(b.days).length>7)return false;
   keys.add(key);
   if(b.status==='online'&&b.tier!=='online'||b.status==='active'&&(b.tier==='online'||b.refund!==0))return false;
   for(const [day,entry] of Object.entries(b.days)){
    if(!Number.isInteger(+day)||+day<=b.start||+day>b.end||+day>state.day||!entry?.players||Array.isArray(entry.players)||Object.keys(entry.players).length>5)return false;
    for(const [id,value] of Object.entries(entry.players))if(!state.players[+id]||!Number.isFinite(value.form)||value.form<0||value.form>2||!Number.isFinite(value.recovery)||value.recovery<0||value.recovery>V4_CONFIG.camp.tiers[b.tier].recovery+1e-8)return false;
   }
  }
  if(Object.values(v.camps).filter(b=>b.status==='active').some((b,i,a)=>a.some((other,j)=>i!==j&&other.team===b.team)))return false;
  return state.players.every(p=>p.v4FanSupport===undefined||p.v4FanSupport&&Number.isFinite(p.v4FanSupport.applied)&&p.v4FanSupport.applied>=0&&p.v4FanSupport.applied<=V4_CONFIG.fans.max+1e-8&&Number.isFinite(p.v4FanSupport.fans)&&p.v4FanSupport.fans>=0&&(p.v4FanSupport.team===null||Number.isInteger(p.v4FanSupport.team)&&!!state.teams[p.v4FanSupport.team]));
 }
};
const growthBeforeV4=playerGrowth13;
playerGrowth13=function(p,...args){const before=p.form;growthBeforeV4(p,...args);if(S.v4){Camp4.apply(p,before);Fans4.apply(p,p.team===null?{fans:0,bonus:0}:Fans4.support(S.teams[p.team]));}};
const tickBeforeV4=tick;
tick=function(){V4.install();const skip=skipTraining33;tickBeforeV4();Camp4.daily(skip);Fans4.reconcile();Camp4.autoBook();for(const [key,b] of Object.entries(Camp4.plans()))if(b.team!==S.club&&b.status!=='active'&&S.day-b.end>90&&S.events.find(e=>e.id===b.event)?.done)delete S.v4.camps[key];};
const freshBeforeV4=fresh;
fresh=function(...args){freshBeforeV4(...args);V4.install();save();render();};
const migrateBeforeV4=migrate;
migrate=function(...args){migrateBeforeV4(...args);V4.install();};
const validBeforeV4=validSave;
validSave=function(state){return V4.valid(state)&&validBeforeV4(state);};
const makeBeforeV4=makeLive4;
makeLive4=function(...args){if(S.v4)Fans4.reconcile();return makeBeforeV4(...args);};

const fanFinishBefore4=finishEvent6;
finishEvent6=function(...args){const result=fanFinishBefore4(...args);if(S.v4){Fans4.reconcile();save();}return result;};
const fanRegionalBefore4=Qualifiers.finishRegional;
Qualifiers.finishRegional=function(...args){const result=fanRegionalBefore4.apply(this,args);Fans4.cache=null;return result;};

function preparationGate4(){const e=Camp4.choiceEvent();if(!e)return false;campEvent4=e.id;go('bootcamp');toast('Перед турниром выберите буткемп или бесплатную онлайн-подготовку.');return true;}
const skipBeforeV4=skip;
skip=function(){if(!S.v4)return skipBeforeV4();if(S.active||S.practice13||busy13)return;while(nextEvent()?.day>S.day){if(preparationGate4())return;tick();}if(preparationGate4())return;render();toast('Команда прибыла на турнир');};
const coachBeforeV4=autoTournament13;
autoTournament13=async function(...args){if(S.v4&&!S.active&&!S.practice13&&!busy13){while(nextEvent()?.day>S.day){if(preparationGate4())return;tick();}if(preparationGate4())return;}return coachBeforeV4(...args);};

function resetPreparationAfterRewind4(){
 if(!S.v4)return;
 for(const [key,b] of Object.entries(S.v4.camps)){
  const future=b.start>S.day,missing=!S.events.some(e=>e.id===b.event);
  if(future||missing){const refund=Math.max(0,b.cost-b.refund);if(refund)pay13(b.team,refund,'Возврат подготовки при возврате к точке карьеры');delete S.v4.camps[key];continue;}
  for(const day of Object.keys(b.days))if(+day>S.day)delete b.days[day];
  if(b.status==='active')Camp4.close(b,'interrupted');
 }
 Fans4.cache=null;
}
