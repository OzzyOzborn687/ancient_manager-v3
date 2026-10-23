'use strict';
const QualifierRuntime3Legacy={fresh,migrate,mark:Qualifiers.markCareer,calendar:ensureTournamentCalendar,
 next:nextEvent,start:startEvent,update:Qualifiers.update,background:Qualifiers.backgroundRegionals,valid:validSave};
Qualifiers.installPhase3=function(){
 if(!S?.qualifiers)return;
 S.qualifiers.phase3=true;
 for(const e of S.events)if(e.qualification?.status==='pending'&&e.id!==S.active?.event&&e.qualification.sceneVersion===QUALIFIERS.scene.version)e.qualification.calendarVersion=QUALIFIERS.calendar.version;
};
Qualifiers.markCareer=function(e){
 QualifierRuntime3Legacy.mark.call(this,e);
 if(S.qualifiers?.phase3&&e.qualification?.status==='pending')e.qualification.calendarVersion=QUALIFIERS.calendar.version;
};
fresh=function(...args){QualifierRuntime3Legacy.fresh(...args);Qualifiers.installPhase3();save();render();};
migrate=function(){QualifierRuntime3Legacy.migrate();Qualifiers.installPhase3();};
ensureTournamentCalendar=function(){QualifierRuntime3Legacy.calendar();Qualifiers.installPhase3();};
nextEvent=function(){
 ensureTournamentCalendar();
 const active=S.events.find(e=>e.id===S.active?.event);if(active)return active;
 const candidates=S.events.filter(e=>!e.done&&(!Qualifiers.isRegional(e)||e.entrants.includes(S.club)&&!S.events.find(p=>p.id===e.qualifierFor)?.done&&S.events.find(p=>p.id===e.qualifierFor)?.qualification?.status!=='blocked'));
 const ready=candidates.filter(e=>!Qualifiers.isCalendar3(e)||!S.events.some(c=>c.qualifierFor===e.id&&!c.done&&c.entrants.includes(S.club)));
 return ready.sort((a,b)=>a.day-b.day||a.id-b.id)[0]||candidates.sort((a,b)=>a.day-b.day||a.id-b.id)[0];
};
startEvent=function(){
 if(!S.active)Qualifiers.catchUpCalendar3();
 Qualifiers.ensureRegistrations3();
 Qualifiers.auditFinalFields3();
 const e=nextEvent();
 if(e&&!S.active&&e.day<=S.day&&!e.skipRequestedV12){
  const parent=Qualifiers.isRegional(e)?S.events.find(p=>p.id===e.qualifierFor):e;
  if(Qualifiers.isCalendar3(parent)){
   const rosterError=Object.entries(e.registration3?.rosters||{}).some(([id,ids])=>!Qualifiers.rosterMatches3(+id,ids));
   if(rosterError){toast('Состав не совпадает с зарегистрированной заявкой. Начало матча остановлено.');return;}
  }
 }
 return QualifierRuntime3Legacy.start();
};
Qualifiers.regionalPlayable3=function(e){
 if(!this.isRegional(e))return true;
 const parent=S.events.find(p=>p.id===e.qualifierFor);
 return !this.isCalendar3(parent)||!parent.done&&parent.qualification.status!=='blocked';
};
Qualifiers.backgroundRegionals=function(){this.ensureRegistrations3();return QualifierRuntime3Legacy.background.call(this);};
Qualifiers.auditFinalFields3=function(){
 for(const e of S.events){
  if(!this.isCalendar3(e)||e.done||e.id===S.active?.event||e.qualification.status!=='complete'&&!e.qualification.calendarBlock3)continue;
  const conflict=e.qualification.qualified.map(id=>({id,event:this.busy(e,id)})).find(v=>v.event);
  if(!conflict){
   if(e.qualification.calendarBlock3){e.qualification.status='complete';delete e.qualification.calendarBlock3;delete e.qualification.reason;log(e.name+' · пересечение устранено. Закрытая заявка сохранена; старт снова доступен.');}
   continue;
  }
  if(e.qualification.calendarBlock3)continue;
  e.qualification.calendarBlock3={day:S.day,team:conflict.id,event:conflict.event.id};
  e.qualification.status='blocked';e.qualification.reason='После закрытия заявок возникло пересечение: '+S.teams[conflict.id].name+' занят на '+conflict.event.name+'. Старт остановлен; состав и результаты не переписываются.';
  log(e.name+' · '+e.qualification.reason);
 }
};
Qualifiers.update=function(){this.ensureRegistrations3();QualifierRuntime3Legacy.update.call(this);this.ensureRegistrations3();this.auditFinalFields3();};
Qualifiers.historicalInvite3=function(q,team,regionalEvent){
 return q?.calendarVersion===QUALIFIERS.calendar.version&&q.inviteChanges3?.some(v=>v.team===team&&v.regionalEvent===regionalEvent&&v.reason==='schedule-conflict-replacement');
};
Qualifiers.validCalendar3=function(x){
 if(!x.events.some(e=>e.qualification?.calendarVersion!==undefined||e.calendarVersion!==undefined||e.registration3!==undefined))return true;
 const C=QUALIFIERS.calendar,ids=new Set(x.events.map(e=>e.id));
 if(ids.size!==x.events.length)return false;
 for(const e of x.events){
  const q=e.qualification;
  if(q?.calendarBlock3){
   const b=q.calendarBlock3;
   if(q.status!=='blocked'||!Number.isInteger(b.day)||!Number.isInteger(b.team)||!Number.isInteger(b.event)||!q.qualified?.includes(b.team)||!x.events.some(v=>v.id===b.event&&v.id!==e.id))return false;
   const projected={...x,events:x.events.map(v=>v===e?{...v,qualification:{...q,status:'complete'}}:v)};
   if(!this.valid(projected))return false;
  }
  if(q?.calendarVersion!==undefined){
   if(q.calendarVersion!==C.version||q.sceneVersion!==QUALIFIERS.scene.version)return false;
   if(q.status!=='pending'&&q.status!=='blocked'){
    const c=q.calendar,keys=['announcedDay','anchorDay','qualStart','qualEnd','listDay','mainDay','duration'];
    if(!c||c.version!==C.version||keys.some(k=>!Number.isInteger(c[k]))||c.mainDay!==e.day||c.announcedDay!==q.snapshotDay||c.anchorDay<c.announcedDay||
     c.qualStart<c.announcedDay+C.minSegments[0]||c.duration<C.minSegments[1]||c.qualEnd<c.qualStart+c.duration||c.listDay<c.qualEnd+C.minSegments[2]||
     c.mainDay<c.listDay+C.minSegments[3]||q.rules.listLead!==c.mainDay-c.listDay||!Array.isArray(c.segments)||c.segments.length!==C.minSegments.length||
     c.segments.some((v,i)=>!Number.isInteger(v)||v<C.minSegments[i]))return false;
    if(!Array.isArray(q.initialInvited)||q.initialInvited.length!==q.rules.invites||new Set(q.initialInvited).size!==q.rules.invites)return false;
    for(const change of q.inviteChanges3||[]){
     const child=x.events.find(v=>v.id===change.regionalEvent);
     if(!Number.isInteger(change.day)||change.day<q.snapshotDay||change.reason!=='schedule-conflict-replacement'||!q.invited.some(v=>v.team===change.team)||
      change.regionalEvent!==null&&(!child||child.qualifierFor!==e.id||!child.done||!child.entrants.includes(change.team)))return false;
    }
   }
  }
  if(e.calendarVersion===C.version){
   const parent=x.events.find(v=>v.id===e.qualifierFor),c=parent?.qualification?.calendar;
   if(!c||!this.isCalendar3(parent)||e.entrants.some(id=>parent.qualification.initialInvited.includes(id))||
    e.duration<C.minRegionalDays[e.formatKey6]||e.day+e.duration>c.listDay-C.minSegments[2])return false;
   const a=x.active?.event===e.id?x.active:e.regionalState;
   for(const n of a?.schedule||e.schedule6||[])if(!Number.isFinite(n.slot13)||n.day13!==Math.floor(n.slot13)||n.slot13<e.day||n.slot13+QUALIFIERS.regional.slotDays>e.day+e.duration)return false;
  }
  if(e.registration3!==undefined){
   const r=e.registration3,parent=this.isRegional(e)?x.events.find(p=>p.id===e.qualifierFor):e;
   if(!this.isCalendar3(parent)||r.version!==C.version||!Number.isInteger(r.day)||r.day<0||!r.rosters||typeof r.rosters!=='object')return false;
   const expected=this.isRegional(e)?e.entrants:e.qualification.qualified;
   if(!Array.isArray(expected)||Object.keys(r.rosters).length!==expected.length||expected.some(id=>!r.rosters[id]))return false;
   for(const [team,list] of Object.entries(r.rosters)){
    if(!expected.includes(+team)||!Array.isArray(list)||list.length!==ROLES.length||new Set(list).size!==ROLES.length||list.some((id,role)=>!Number.isInteger(id)||x.players[id]?.role!==role))return false;
    if(this.registrationHeld3(x,parent,+team)&&list.some(id=>x.players[id].team!==+team||!x.players[id].active||x.players[id].retired))return false;
   }
  }
 }
 return true;
};
validSave=function(x){try{return QualifierRuntime3Legacy.valid(x)&&Qualifiers.validCalendar3(x);}catch{return false;}};
