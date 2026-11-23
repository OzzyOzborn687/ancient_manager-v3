'use strict';
const QualifierCalendar91={
 lead:14,repairing:false,
 children(p){return Object.values(p.qualification?.regionalEvents||{}).map(id=>S.events.find(e=>e.id===id)).filter(e=>e?.v5Qualifier);},
 started(e){return e.done||S.active?.event===e.id||[...(e.regionalState?.schedule||[]),...(e.schedule6||[]),...(e.background51?.state?.schedule||[])].some(n=>n.score);},
 shift(e,day){const base=(e.regionalState||e.background51?.state)?.startDay13??e.day,delta=day-base;if(!delta&&day===e.day)return;e.originalDay13??=e.day;e.day=day;const seen=new Set();for(const a of [e.regionalState,e.background51?.state]){if(!a)continue;if(Number.isFinite(a.startDay13))a.startDay13+=delta;for(const n of a.schedule||[])seen.add(n);}for(const n of e.schedule6||[])seen.add(n);for(const n of seen)for(const key of ['day13','slot13','phaseFloor13'])if(Number.isFinite(n[key]))n[key]+=delta;},
 makePlan(p,cs,own,baseline){
  const q=p.qualification,fixed=cs.some(c=>this.started(c)),duration=cs.length?Math.max(...cs.map(c=>c.duration||6)):8;
  let start=fixed?Math.max(...cs.map(c=>c.day)):Math.max(S.day,(q.snapshotDay??S.day)+PARTICIPATION_LEAD5B,baseline-this.lead);
  if(!fixed&&own){
   const reserved=S.events.filter(e=>e.id!==p.id&&!e.done&&e.qualification?.schedule91?.version===2&&e.qualification.schedule91.own).flatMap(e=>{const v=e.qualification.schedule91;return [{day:v.qualifierDay-1,duration:v.qualifierDuration+2},{day:v.mainDay-1,duration:(e.duration||10)+2}];});
   if(S.active&&S.active.event!==p.id&&!cs.some(c=>c.id===S.active.event)){const e=S.events.find(e=>e.id===S.active.event);if(e)reserved.push({day:e.day,duration:e.duration||10});}
   for(let n=0;n<10000;n++){const intervals=[{day:start,duration},{day:start+this.lead,duration:p.duration||10}];if(!reserved.some(r=>intervals.some(i=>Qualifiers.overlap(i,r))))break;start++;}
  }
  return {version:2,own,qualifierDay:start,mainDay:Math.max(start+this.lead,...cs.filter(c=>c.done).map(c=>(c.completedDay20??c.day)+1),...cs.flatMap(c=>(c.regionalState?.schedule||c.schedule6||[]).filter(()=>this.started(c)).map(n=>(n.day13??c.day)+1))),qualifierDuration:duration,plannedAt:S.day};
 },
 repair(){if(this.repairing||!S?.v5?.sceneReady)return;this.repairing=true;try{
  for(const p of [...S.events].sort((a,b)=>(a.plannedDay21??a.originalDay13??a.day)-(b.plannedDay21??b.originalDay13??b.day)||a.id-b.id)){
   if(p.done||S.active?.event===p.id||Qualifiers.isRegional(p)||p.qualification?.majorVersion!==5)continue;
   const cs=this.children(p);if(!cs.length)continue;const q=p.qualification;
   if(p.background51&&!p.background51.withdrawn&&!this.started(p)&&cs.some(c=>!c.done&&c.entrants?.includes(S.club))&&q.status!=='complete'){
    const queued=p.background51.queuedDay;delete p.background51;
    for(const c of cs)if(!this.started(c)&&c.background51&&c.background51.queuedDay===queued){delete c.background51;c.skipRequestedV12=false;delete c.withdrawnClub;c.skippedV12=false;if(c.regionalState){c.regionalState.withdrawnV12=false;c.regionalState.spectator13=false;c.regionalState.autoCoach13=false;}}
   }
   if(p.background51||p.skipRequestedV12)continue;
   const legacy=q.calendarLead91===14;
   q.calendarLead91=this.lead;if(q.rules)q.rules.listLead=0;
   let plan=q.schedule91;
   if(!plan||plan.version!==2){
    const baseline=legacy?(p.plannedDay21??p.originalDay13??p.day):p.day;
    plan=q.schedule91=this.makePlan(p,cs,cs.some(c=>c.entrants?.includes(S.club))||q.invited?.some(v=>v.team===S.club),baseline);
   }
   for(const c of cs)if(!this.started(c))this.shift(c,plan.qualifierDay);
   if(cs.every(c=>c.done)&&Object.keys(q.policy.quotas).every(g=>q.regionalEvents[g]!==undefined)&&plan.resolvedAt===undefined){
    plan.resolvedAt=Math.max(...cs.map(c=>c.completedDay20??c.day));
    // A late result opens the main event once; provisional future reservations must not exile it for seasons.
    plan.mainDay=Math.max(plan.mainDay,plan.resolvedAt+1);
   }
   p.originalDay13??=p.day;p.day=plan.mainDay;q.eventDay=p.day;
   if(q.status!=='complete'&&cs.some(c=>!c.done&&c.entrants?.includes(S.club))){delete p.qualified13;delete p.qualification13;}
  }
  S.events.sort((a,b)=>a.day-b.day||a.id-b.id);
 }finally{this.repairing=false;}},
 waiting(e){return e?.qualification?.majorVersion===5&&e.qualification.status!=='complete'&&this.children(e).some(c=>!c.done&&c.entrants?.includes(S.club));}
};
const participationBeforeCalendar91=Participation5B.enforce;Participation5B.enforce=function(e){if(e?.v5Qualifier){const parent=S.events.find(p=>p.id===e.qualifierFor),plan=parent?.qualification?.schedule91;if(plan?.version===2){e.participationConfirmed5b??=plan.plannedAt;QualifierCalendar91.repair();return;}}if(e&&!Qualifiers.isRegional(e)&&e.qualification?.majorVersion===5&&Object.keys(e.qualification.policy?.quotas||{}).length){if(e.qualification.rules)e.qualification.rules.listLead=0;QualifierCalendar91.repair();return;}return participationBeforeCalendar91.call(this,e);};
const windowBeforeCalendar91=Qualifiers.regionalWindow;Qualifiers.regionalWindow=function(p,own){if(p.qualification?.majorVersion!==5)return windowBeforeCalendar91.call(this,p,own);if(p.qualification.schedule91?.version===2)return p.qualification.schedule91.qualifierDay;const day=Math.max(S.day+PARTICIPATION_LEAD5B,p.day-14);p.originalDay13??=p.day;p.day=day+14;p.qualification.eventDay=p.day;return day;};
const installBeforeCalendar91=Admissions5.install;Admissions5.install=function(...a){const r=installBeforeCalendar91.apply(this,a);QualifierCalendar91.repair();for(const p of S.events){const q=p.qualification;if(!p.done&&!Qualifiers.isRegional(p)&&q?.majorVersion===5&&q.status==='pending'&&Object.keys(q.policy?.quotas||{}).length&&!q.schedule91){q.schedule91=QualifierCalendar91.makePlan(p,[],true,Math.max(S.day+QUALIFIERS.snapshotLead,p.plannedDay21??p.originalDay13??p.day));p.day=q.schedule91.mainDay;}}S.events.sort((a,b)=>a.day-b.day||a.id-b.id);return r;};
const migrateBeforeCalendar91=migrate;migrate=function(...a){QualifierCalendar91.repair();const r=migrateBeforeCalendar91(...a);QualifierCalendar91.repair();return r;};
// The former calendar decorators moved every unrelated future event after each finish.
finishCalendar13=function(e){if(Background51.finishing===e.id){e.completedDay20=S.day;return;}const until=Math.max(S.day,e.day+(e.duration||1)-1);while(S.day<until)tick();e.completedDay20=S.day;QualifierCalendar91.repair();};
const backgroundBeforeCalendar91=Background51.update;Background51.update=function(...a){QualifierCalendar91.repair();return backgroundBeforeCalendar91.apply(this,a);};
const queueBeforeCalendar91=Background51.queue;Background51.queue=function(e,withdrawn=false){if(!withdrawn&&QualifierCalendar91.waiting(e))return;return queueBeforeCalendar91.call(this,e,withdrawn);};
const ruleBeforeCalendar91=UI5.rule;UI5.rule=function(e){return ruleBeforeCalendar91.call(this,e).replace('Полный состав участников подтверждается минимум за 15 дней до начала турнира. Квалификация завершается до этого срока. При позднем определении участников старт переносится.','Квалификации начинаются за 14 дней до основного турнира. Основной турнир ожидает результаты отбора; при задержке расписание переносится без автоматического отказа клуба от участия.');};

// Reserve the pair BEFORE invitation/candidate selection so availability uses the final dates.
const freezeBeforeFixed91=Admissions5.freeze;Admissions5.freeze=function(p,...a){const q=p.qualification;if(q?.status==='pending'&&Object.keys(q.policy?.quotas||{}).length&&!q.schedule91){const own=true;q.schedule91=QualifierCalendar91.makePlan(p,[],own,Math.max(S.day+QUALIFIERS.snapshotLead,p.plannedDay21??p.originalDay13??p.day));p.day=q.schedule91.mainDay;}return freezeBeforeFixed91.call(this,p,...a);};

const validBeforeFixedSchedule91=validSave;validSave=function(x){return validBeforeFixedSchedule91(x)&&x.events.every(e=>{const p=e.qualification?.schedule91;if(p===undefined)return true;return p&&p.version===2&&typeof p.own==='boolean'&&['qualifierDay','mainDay','qualifierDuration','plannedAt'].every(k=>Number.isInteger(p[k])&&p[k]>=0)&&p.mainDay>=p.qualifierDay+14&&p.plannedAt<=x.day&&(p.resolvedAt===undefined||Number.isInteger(p.resolvedAt)&&p.resolvedAt>=0&&p.resolvedAt<=x.day);});};
// Qualification is settled from saved results, not repeatedly deferred by provisional AI reservations.
Admissions5.complete=function(e){const q=e.qualification;if(q.status==='pending')return this.freeze(e)?.qualified||null;if(q.status==='complete')return [...q.qualified];if(q.status!=='frozen')return null;
 const children=Object.values(q.regionalEvents||{}).map(id=>S.events.find(c=>c.id===id));if(children.some(c=>!c?.done))return null;
 if(q.policy.quotas.GLOBAL&&!q.regionalEvents.GLOBAL){try{this.child(e,'GLOBAL',q.policy.quotas.GLOBAL);}catch(err){q.status='blocked';q.reason=err.message;}return null;}
 const ids=[...q.invited.map(v=>v.team),...children.flatMap(c=>c.inviteWinners)];if(ids.length!==q.fieldSize||new Set(ids).size!==q.fieldSize){q.status='blocked';q.reason='Квалификации не сформировали полное уникальное поле.';return null;}
 q.status='complete';q.qualified=ids;q.completedDay=S.day;e.qualified13=[...ids];e.qualification13={invited:q.invited.map(v=>v.team),matches:[],day:S.day,majorVersion:5};e.participationConfirmed5b??=S.day;QualifierCalendar91.repair();return [...ids];
};
