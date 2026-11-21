'use strict';
const QualifierCalendar91={
 lead:14,repairing:false,
 children(p){return Object.values(p.qualification?.regionalEvents||{}).map(id=>S.events.find(e=>e.id===id)).filter(e=>e?.v5Qualifier);},
 started(e){return e.done||S.active?.event===e.id||[...(e.regionalState?.schedule||[]),...(e.schedule6||[]),...(e.background51?.state?.schedule||[])].some(n=>n.score);},
 shift(e,day){const base=(e.regionalState||e.background51?.state)?.startDay13??e.day,delta=day-base;if(!delta&&day===e.day)return;e.originalDay13??=e.day;e.day=day;const seen=new Set();for(const a of [e.regionalState,e.background51?.state]){if(!a)continue;if(Number.isFinite(a.startDay13))a.startDay13+=delta;for(const n of a.schedule||[])seen.add(n);}for(const n of e.schedule6||[])seen.add(n);for(const n of seen)for(const key of ['day13','slot13','phaseFloor13'])if(Number.isFinite(n[key]))n[key]+=delta;},
 repair(){if(this.repairing||!S?.v5?.sceneReady)return;this.repairing=true;try{
  for(const p of [...S.events].sort((a,b)=>a.day-b.day||a.id-b.id)){
   if(p.done||S.active?.event===p.id||Qualifiers.isRegional(p)||p.qualification?.majorVersion!==5)continue;
   const cs=this.children(p);if(!cs.length)continue;const q=p.qualification;
   if(p.background51&&!p.background51.withdrawn&&!this.started(p)&&cs.some(c=>!c.done&&c.entrants?.includes(S.club))&&q.status!=='complete'){
    const queued=p.background51.queuedDay;delete p.background51;
    for(const c of cs)if(!this.started(c)&&c.background51&&c.background51.queuedDay===queued){delete c.background51;c.skipRequestedV12=false;delete c.withdrawnClub;c.skippedV12=false;if(c.regionalState){c.regionalState.withdrawnV12=false;c.regionalState.spectator13=false;c.regionalState.autoCoach13=false;}}
   }
   if(p.background51||p.skipRequestedV12)continue;
   q.calendarLead91=this.lead;if(q.rules)q.rules.listLead=0;
   let start=Math.max(S.day,p.day-this.lead,(q.snapshotDay??S.day)+PARTICIPATION_LEAD5B);
   const movable=cs.filter(c=>!this.started(c)),own=movable.some(c=>c.entrants?.includes(S.club));
   if(own)for(let count=0;count<3660;count++){
    const clash=S.events.find(e=>!e.done&&e.id!==p.id&&!cs.includes(e)&&!e.background51&&(e.entrants||e.qualified13||e.qualification?.invited?.map(v=>v.team)||[]).includes(S.club)&&Qualifiers.overlap({day:start-1,duration:Math.max(...movable.map(c=>c.duration||6))+2},e));
    if(!clash)break;start=Math.max(start+1,clash.day+(clash.duration||10)+1);
   }
   for(const c of movable)this.shift(c,start);
   const end=Math.max(...cs.map(c=>Math.max(c.day+this.lead,...(c.regionalState?.schedule||c.schedule6||[]).map(n=>(n.day13??c.day)+1),c.done?(c.completedDay20??c.day)+1:0)));
   if(q.status!=='complete'&&cs.some(c=>this.started(c))&&S.day>=end)q.calendarMainFloor91=Math.max(q.calendarMainFloor91||0,S.day+1);
   const day=Math.max(end,q.calendarMainFloor91||0);
   p.originalDay13??=p.day;p.day=day;q.eventDay=day;
   if(q.status!=='complete'&&cs.some(c=>!c.done&&c.entrants?.includes(S.club))){delete p.qualified13;delete p.qualification13;}
  }
  S.events.sort((a,b)=>a.day-b.day||a.id-b.id);
 }finally{this.repairing=false;}},
 waiting(e){return e?.qualification?.majorVersion===5&&e.qualification.status!=='complete'&&this.children(e).some(c=>!c.done&&c.entrants?.includes(S.club));}
};
const participationBeforeCalendar91=Participation5B.enforce;Participation5B.enforce=function(e){if(e&&!Qualifiers.isRegional(e)&&e.qualification?.majorVersion===5&&Object.keys(e.qualification.policy?.quotas||{}).length){if(e.qualification.rules)e.qualification.rules.listLead=0;QualifierCalendar91.repair();return;}return participationBeforeCalendar91.call(this,e);};
const windowBeforeCalendar91=Qualifiers.regionalWindow;Qualifiers.regionalWindow=function(p,own){if(p.qualification?.majorVersion!==5)return windowBeforeCalendar91.call(this,p,own);const day=Math.max(S.day+PARTICIPATION_LEAD5B,p.day-14);p.originalDay13??=p.day;p.day=day+14;p.qualification.eventDay=p.day;return day;};
const installBeforeCalendar91=Admissions5.install;Admissions5.install=function(...a){const r=installBeforeCalendar91.apply(this,a);QualifierCalendar91.repair();return r;};
const migrateBeforeCalendar91=migrate;migrate=function(...a){QualifierCalendar91.repair();const r=migrateBeforeCalendar91(...a);QualifierCalendar91.repair();return r;};
const calendarBefore91=finishCalendar13;finishCalendar13=function(...a){const r=calendarBefore91(...a);QualifierCalendar91.repair();return r;};
const backgroundBeforeCalendar91=Background51.update;Background51.update=function(...a){QualifierCalendar91.repair();return backgroundBeforeCalendar91.apply(this,a);};
const queueBeforeCalendar91=Background51.queue;Background51.queue=function(e,withdrawn=false){if(!withdrawn&&QualifierCalendar91.waiting(e))return;return queueBeforeCalendar91.call(this,e,withdrawn);};
const ruleBeforeCalendar91=UI5.rule;UI5.rule=function(e){return ruleBeforeCalendar91.call(this,e).replace('Полный состав участников подтверждается минимум за 15 дней до начала турнира. Квалификация завершается до этого срока. При позднем определении участников старт переносится.','Квалификации начинаются за 14 дней до основного турнира. Основной турнир ожидает результаты отбора; при задержке расписание переносится без автоматического отказа клуба от участия.');};
