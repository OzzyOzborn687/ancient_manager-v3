'use strict';
// A saved calendar model opts in only while a qualification is still pending.
const QualifierCalendarLegacy={freeze:Qualifiers.freeze,create:Qualifiers.createRegionals,
 busy:Qualifiers.busy,complete:Qualifiers.complete,dates:assignDates13,finishCalendar:finishCalendar13};
Qualifiers.isCalendar3=function(e){return e?.qualification?.calendarVersion===QUALIFIERS.calendar.version;};
Qualifiers.family3=function(e){return e?.calendarParent3??e?.qualifierFor??e?.id;};
Qualifiers.commitmentTeams3=function(e){
 const a=S.active?.event===e.id?S.active:null;
 return a?.entrants||e.entrants||e.qualified13||e.qualification?.invited?.map(v=>v.team)||[];
};
Qualifiers.eventEnd3=function(e){
 const a=S.active?.event===e.id?S.active:e.regionalState;
 const last=Math.max(e.day,...(a?.schedule||[]).map(n=>n.slot13??e.day));
 return Math.max(e.day+(e.duration||QUALIFIERS.defaultDuration),Math.ceil(last+QUALIFIERS.regional.slotDays));
};
Qualifiers.priority3=function(e){
 if(S.active?.event===e.id)return [-Infinity,e.day,e.id];
 return [e.qualification?(e.qualification.snapshotDay??S.day):-Infinity,e.day,e.id];
};
Qualifiers.before3=function(a,b){
 const x=this.priority3(a),y=this.priority3(b);
 for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]<y[i];
 return false;
};
Qualifiers.busy=function(e,id){
 const parent=S.events.find(p=>p.id===this.family3(e))||e;
 if(!this.isCalendar3(parent))return QualifierCalendarLegacy.busy.call(this,e,id);
 return S.events.find(other=>{
  if(other.done||this.family3(other)===this.family3(e)||!this.overlap(e,{...other,duration:this.eventEnd3(other)-other.day})||!this.commitmentTeams3(other).includes(id))return false;
  if(other.qualification?.status==='blocked'&&!other.qualification.calendarBlock3)return false;
  // A closed field/active event is a hard booking. Among two new invitations,
  // the earlier saved announcement wins; this prevents mutual displacement.
  return this.isRegional(other)||!other.qualification||other.qualification.status==='complete'||this.before3(other,parent);
 })||null;
};
Qualifiers.calendarSegments3=function(span,minimum=QUALIFIERS.calendar.minSegments){
 const preferred=QUALIFIERS.calendar.preferredSegments,total=preferred.reduce((a,b)=>a+b,0);
 const minima=minimum.reduce((a,b)=>a+b,0);if(span<minima)return null;
 if(span>=total)return [...preferred];
 const room=span-minima,weights=preferred.map((v,i)=>v-minimum[i]),weight=weights.reduce((a,b)=>a+b,0);
 const exact=weights.map((v,i)=>minimum[i]+room*v/weight),result=exact.map(Math.floor);
 const order=exact.map((v,i)=>({i,remainder:v-result[i]})).sort((a,b)=>b.remainder-a.remainder||a.i-b.i);
 for(let n=span-result.reduce((a,b)=>a+b,0),i=0;n>0;n--,i++)result[order[i].i]++;
 return result;
};
Qualifiers.calendarBlockers3=function(parent){
 const gap=QUALIFIERS.regional.minGap;
 return S.events.filter(e=>!e.done&&this.family3(e)!==parent.id&&(!this.regionalPlayable3||this.regionalPlayable3(e))&&(
  this.isRegional(e)||this.commitmentTeams3(e).includes(S.club)||
  // Unresolved earlier legacy events still belong to the manager's calendar.
  !e.qualification&&!e.skipRequestedV12
 )).map(e=>({event:e.id,start:e.day-gap,end:this.eventEnd3(e)+gap}));
};
Qualifiers.planCalendar3=function(parent,quotas){
 const C=QUALIFIERS.calendar,preferred=C.preferredSegments.reduce((a,b)=>a+b,0);
 const large=Object.values(quotas).some(v=>v>=QUALIFIERS.regional.largeQuota),key=large?'qualifier16':'qualifier8';
 const minimum=[...C.minSegments];minimum[1]=Math.max(minimum[1],C.minRegionalDays[key]);
 const minSpan=minimum.reduce((a,b)=>a+b,0),announced=S.day,blockers=this.calendarBlockers3(parent);
 for(let main=Math.max(parent.day,announced+minSpan);main<=Math.max(parent.day,announced)+C.maxDelay;main++){
  for(let anchor=Math.max(announced,main-preferred);anchor<=main-minSpan;anchor++){
   const segments=this.calendarSegments3(main-anchor,minimum);if(!segments)continue;
   const start=anchor+segments[0],end=start+segments[1],list=end+segments[2];
   const duration=Math.min(QUALIFIERS.regional.duration,segments[1]);
   if(blockers.some(b=>start<b.end&&start+duration>b.start))continue;
   return {version:C.version,announcedDay:announced,anchorDay:anchor,qualStart:start,qualEnd:end,
    listDay:list,mainDay:main,duration,segments,minimum,compressed:segments.some((v,i)=>v<C.preferredSegments[i]),
    blockers,originalDay:parent.day};
  }
 }
 return null;
};
Qualifiers.freeze=function(e){
 if(!this.isCalendar3(e))return QualifierCalendarLegacy.freeze.call(this,e);
 const q=e.qualification;if(q.status!=='pending')return q;
 const scene=this.ensureScene(),quota=this.seasonQuotas(format6(e).n-QUALIFIERS.invites),plan=this.planCalendar3(e,quota.quotas);
 if(!plan){
  // Retain a complete frozen rules/snapshot shape even for a blocked calendar.
  QualifierRegionalLegacy.freeze.call(this,e);q.status='blocked';
  q.reason='Не найдено безопасное окно квалификаций. Минимальные интервалы и официальные матчи сохраняются; можно отказаться от участия.';
  log(e.name+' · '+q.reason);return q;
 }
 q.calendar=plan;
 if(e.day!==plan.mainDay){e.originalDay13??=e.day;e.day=plan.mainDay;}
 const C=QUALIFIERS.regional,probe={id:e.id,day:plan.qualStart,duration:plan.duration,calendarParent3:e.id};
 for(const region of QUALIFIERS.regions){
  const needed=(quota.quotas[region]>=C.largeQuota?C.largeField:C.smallField)+QUALIFIERS.regionInviteCap;
  while(S.teams.filter(t=>this.region(t)===region&&!this.busy(e,t.id)&&!this.busy(probe,t.id)).length<needed&&S.teams.length<QUALIFIERS.scene.maxTeams)this.generateClub(region,3);
 }
 // Reuse the retained invitation-index implementation, without P2's unconditional
 // 35-day postponement. The calendar has already been planned above.
 QualifierRegionalLegacy.freeze.call(this,e);
 if(q.status==='frozen'){
  q.season=circuitYear(S.day);q.quotas={...quota.quotas};q.plannedQuotas={...quota.quotas};
  q.rules.baseQuotas={...quota.quotas};q.rules.listLead=e.day-plan.listDay;
  q.mode='regional-tournaments';q.initialInvited=q.invited.map(v=>v.team);
  try{this.createRegionals(e);}catch(error){q.status='blocked';q.reason=error.message;log(e.name+' · '+q.reason);}
 }
 scene.reviewYear??=circuitYear(S.day);
 if(plan.compressed||e.day!==plan.originalDay)log(e.name+' · календарь квалификаций: '+date(plan.qualStart)+' — '+date(plan.qualStart+plan.duration-1)+
  ', итоговая заявка '+date(plan.listDay)+', основной турнир '+date(e.day)+(plan.compressed?'. Интервалы пропорционально сжаты; минимальные отступы сохранены.':'.'));
 S.events.sort((a,b)=>a.day-b.day||a.id-b.id);return q;
};
Qualifiers.createRegionals=function(parent){
 if(!this.isCalendar3(parent))return QualifierCalendarLegacy.create.call(this,parent);
 const q=parent.qualification;if(q.regionalEvents)return;
 const plan=q.calendar,C=QUALIFIERS.regional,invited=q.invited.map(v=>v.team),prepared=[];
 let nextId=Math.max(-1,...S.events.map(e=>e.id))+1;
 const probe={id:parent.id,day:plan.qualStart,duration:plan.duration,calendarParent3:parent.id};
 for(const region of QUALIFIERS.regions){
  const quota=q.quotas[region],count=quota>=C.largeQuota?C.largeField:C.smallField;
  const eligible=()=>S.teams.filter(t=>this.region(t)===region&&!invited.includes(t.id)&&!this.busy(parent,t.id)&&!this.busy(probe,t.id));
  while(eligible().length<count&&S.teams.length<QUALIFIERS.scene.maxTeams)this.generateClub(region,3);
  if(eligible().length<count)throw Error('Регион '+region+': не хватает свободных клубов для закрытой квалификации.');
  const entrants=eligible().sort((a,b)=>(a.tier||1)-(b.tier||1)||clubState13(b).elo-clubState13(a).elo||a.id-b.id).slice(0,count).map(t=>t.id);
  prepared.push({id:nextId++,name:parent.name+' · Квалификация '+region,series:'QUALIFICATION',qualifierFor:parent.id,
   qualifierRegion:region,quota,day:plan.qualStart,duration:plan.duration,pool:C.pool,venue:'Онлайн · '+region,real:false,
   calendarVersion:QUALIFIERS.calendar.version,
   formatKey6:count===C.smallField?'qualifier8':'qualifier16',format:'circuit-v6',entrants,inviteTrophy:true,
   rosterLock:Object.fromEntries(entrants.map(id=>[id,roster(S.teams[id]).map(p=>p.id)]))});
 }
 S.events.push(...prepared);q.regionalEvents=Object.fromEntries(prepared.map(e=>[e.qualifierRegion,e.id]));
 for(const e of prepared)this.regionalState(e);
 S.events.sort((a,b)=>a.day-b.day||a.id-b.id);
 const own=prepared.find(e=>e.entrants.includes(S.club));
 if(own)log('Ваш путь на '+parent.name+': '+own.name+' начинается '+date(own.day)+'. Награда — приглашение; мест: '+own.quota+'.');
};
assignDates13=function(a){
 QualifierCalendarLegacy.dates(a);
 const e=S.events.find(e=>e.id===a.event);if(e?.calendarVersion!==QUALIFIERS.calendar.version||a.calendarSorted3===a.schedule.length)return;
 // GSL groups are constructed group by group. Execute their nodes by planned
 // slot so that four parallel groups do not consume four consecutive calendars.
 const fixed=a.schedule.filter(n=>n.score),pending=a.schedule.filter(n=>!n.score).sort((x,y)=>x.slot13-y.slot13||x.id-y.id);
 const ordered=[...fixed,...pending],ids=new Map(ordered.map((n,i)=>[n.id,i]));
 for(const [i,n] of ordered.entries()){n.id=i;for(const v of n.pair)if(v&&typeof v==='object')v.id=ids.get(v.id);}
 for(const g of a.gsl||[]){g.w=ids.get(g.w);g.d=ids.get(g.d);}
 a.schedule=ordered;a.calendarSorted3=ordered.length;
};
Qualifiers.calendarDelay3=function(parent,earliestList,reason){
 const q=parent.qualification,c=q.calendar;if(!c||earliestList<=c.listDay)return;
 const before=parent.day;c.listDay=earliestList;c.mainDay=earliestList+q.rules.listLead;
 parent.originalDay13??=parent.day;parent.day=c.mainDay;q.eventDay=parent.day;
 c.revisions??=[];c.revisions.push({day:S.day,before,after:parent.day,reason});c.revisions=c.revisions.slice(-QUALIFIERS.calendar.noticeLimit);
 log(parent.name+' · '+reason+'. Итоговая заявка '+date(c.listDay)+', старт '+date(parent.day)+'.');
};
Qualifiers.deferRegional3=function(e,day=S.day){
 const parent=S.events.find(p=>p.id===e.qualifierFor);
 if(!this.isCalendar3(parent)||e.done||day<e.day||e.id===S.active?.event||parent.qualification.status==='blocked')return false;
 const a=e.regionalState,pending=a?.schedule.filter(n=>!n.score)||[];
 if(!pending.length)return false;
 const played=a.schedule.some(n=>n.score),first=played?Math.floor(Math.min(...pending.map(n=>n.slot13))):e.day;
 const duration=Math.max(1,e.day+e.duration-first),gap=QUALIFIERS.regional.minGap;
 const probe=start=>({id:e.id,calendarParent3:parent.id,day:start-gap,duration:duration+gap*2});
 if(!e.entrants.some(id=>this.busy(probe(first),id)))return false;
 let start=first;while(start<=first+QUALIFIERS.calendar.maxDelay&&e.entrants.some(id=>this.busy(probe(start),id)))start++;
 if(start>first+QUALIFIERS.calendar.maxDelay){parent.qualification.status='blocked';parent.qualification.reason='Регион '+e.qualifierRegion+': участники заняты, безопасный перенос не найден.';log(parent.name+' · '+parent.qualification.reason);return true;}
 const delta=start-first;e.calendarOriginalDay3??=e.day;
 if(!played){e.day+=delta;a.startDay13+=delta;}else e.duration+=delta;
 for(const n of pending){n.slot13+=delta;n.day13=Math.floor(n.slot13);if(n.phaseFloor13!==undefined)n.phaseFloor13+=delta;}
 e.schedule6=structuredClone(a.schedule);
 this.calendarDelay3(parent,e.day+e.duration+QUALIFIERS.calendar.minSegments[2],'регион '+e.qualifierRegion+' ожидает освобождения участников от официальных матчей');
 log(e.name+' · несыгранные серии перенесены на '+date(start)+': участник занят на другом официальном событии. Состав и результаты сохранены.');
 return true;
};
Qualifiers.complete=function(e){
 if(!this.isCalendar3(e))return QualifierCalendarLegacy.complete.call(this,e);
 const q=e.qualification;if(q.status==='pending')this.freeze(e);
 if(q.status!=='frozen')return q.status==='complete'?[...q.qualified]:null;
 const c=q.calendar,children=Object.values(q.regionalEvents||{}).map(id=>S.events.find(v=>v.id===id)).filter(Boolean);
 if(c.mainDay!==e.day){c.mainDay=e.day;c.listDay=e.day-q.rules.listLead;q.eventDay=e.day;}
 if(children.length===QUALIFIERS.regions.length&&children.every(v=>v.done)){
  const last=Math.max(...children.map(v=>v.completedDay20??v.day+v.duration-1));
  this.calendarDelay3(e,last+QUALIFIERS.calendar.minSegments[2],'региональные матчи завершились позже первоначального окна');
 }
 if(S.day<c.listDay)return null;
 const before=q.invited?.map(v=>v.team)||[],result=QualifierCalendarLegacy.complete.call(this,e);
 if(result){
  q.inviteChanges3=q.invited.filter(v=>!before.includes(v.team)).map(v=>({team:v.team,day:S.day,reason:'schedule-conflict-replacement',
   regionalEvent:children.find(child=>child.entrants.includes(v.team))?.id??null}));
  if(this.registerMain3)this.registerMain3(e);
 }
 return result;
};
Qualifiers.catchUpCalendar3=function(afterOfficial=false){
 for(const parent of S.events.filter(e=>this.isCalendar3(e)&&!e.done&&e.qualification.status==='frozen')){
  const q=parent.qualification,c=q.calendar;
  for(const child of S.events.filter(e=>e.qualifierFor===parent.id&&!e.done&&e.id!==S.active?.event&&e.entrants.includes(S.club)&&e.day<S.day)){
   const a=child.regionalState;if(a?.schedule.some(n=>n.score))continue;
   const blockers=this.calendarBlockers3(parent),first=S.day+(afterOfficial?QUALIFIERS.regional.minGap:0);
   let day=first;while(day<=first+QUALIFIERS.calendar.maxDelay&&blockers.some(b=>day<b.end&&day+child.duration>b.start))day++;
   if(day>first+QUALIFIERS.calendar.maxDelay){q.status='blocked';q.reason='После завершения официальных матчей нет безопасного окна квалификации клуба.';log(parent.name+' · '+q.reason);continue;}
   const delta=day-child.day;child.calendarOriginalDay3??=child.day;child.day=day;
   if(a){a.startDay13+=delta;for(const n of a.schedule){n.slot13+=delta;n.day13=Math.floor(n.slot13);if(n.phaseFloor13!==undefined)n.phaseFloor13+=delta;}child.schedule6=structuredClone(a.schedule);}
   this.calendarDelay3(parent,day+child.duration+QUALIFIERS.calendar.minSegments[2],'квалификация клуба перенесена после текущего официального турнира');
  }
  if(c.mainDay!==parent.day){c.mainDay=parent.day;c.listDay=parent.day-q.rules.listLead;q.eventDay=parent.day;}
 }
 S.events.sort((a,b)=>a.day-b.day||a.id-b.id);
};
finishCalendar13=function(e){
 if(!S.events.some(v=>Qualifiers.isCalendar3(v)))return QualifierCalendarLegacy.finishCalendar(e);
 const until=Math.max(S.day,e.day+(e.duration||1)-1);while(S.day<until)tick();e.completedDay20=until;
 for(const other of S.events.filter(v=>!v.done&&v.id!==e.id&&!Qualifiers.isRegional(v)&&!Qualifiers.isCalendar3(v)&&v.day<=until)){
  other.originalDay13??=other.day;other.day=until+QUALIFIERS.regional.minGap;
 }
 Qualifiers.catchUpCalendar3(true);ensureTournamentCalendar();
 for(const parent of S.events.filter(v=>Qualifiers.isCalendar3(v)&&!v.done&&v.id!==S.active?.event&&v.day<=until)){
  const q=parent.qualification;if(q.status==='complete'||q.calendarBlock3){
   parent.originalDay13??=parent.day;parent.day=until+QUALIFIERS.regional.minGap;
   q.calendar.mainDay=parent.day;q.eventDay=parent.day;q.rules.listLead=parent.day-q.calendar.listDay;
   log(parent.name+' · участие перенесено после текущего турнира на '+date(parent.day)+'. Закрытая заявка сохранена.');
  }else if(q.status==='frozen')Qualifiers.calendarDelay3(parent,until+QUALIFIERS.regional.minGap,'основной турнир ожидает окончания текущего официального участия');
 }
 Qualifiers.auditFinalFields3?.();S.events.sort((a,b)=>a.day-b.day||a.id-b.id);
};
