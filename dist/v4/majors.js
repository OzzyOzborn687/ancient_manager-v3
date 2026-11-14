'use strict';
FORMAT6.major16={...FORMAT6.cup,label:'Крупный турнир V4 · 16 команд · группы BO3 → Double Elimination',note:'Поле расширено до 16 для 15 прямых приглашений и одного квалификационного места.'};
const majorFormatBefore4=formatKey6;
formatKey6=function(e){return e?.formatKey6==='major16'?'major16':majorFormatBefore4(e);};
const Majors4={
 isMajor(e){return !!e&&!Qualifiers.isRegional(e)&&((e.pool||0)>=V4_CONFIG.major.minimumPool||circuitSeries(e)==='THE INTERNATIONAL');},
 inviteCount(e){return format6(e).n>=24?V4_CONFIG.major.invites24:V4_CONFIG.major.invites16;},
 install(){
  for(const e of [...S.events]){
   if(!this.isMajor(e)||e.done||e.id===S.active?.event||S.qualifiers?.legacyEvents?.includes(e.id))continue;
   const q=e.qualification,children=S.events.filter(c=>c.qualifierFor===e.id);
   if(isTI(e)&&e.qualified13&&(e.festivalInvitation||S.tiRecovery?.day===e.day&&['exact','restart'].includes(S.tiRecovery.mode))){
    if(q?.majorVersion===4){delete e.qualification;const unfinished=new Set(children.filter(c=>!c.done&&c.id!==S.active?.event).map(c=>c.id));S.events=S.events.filter(c=>!unfinished.has(c.id));}
    continue;
   }
   if(q?.majorVersion===4)continue;
   if(q?.status==='complete'||q?.status==='frozen'||e.qualified13||children.some(c=>c.done||c.id===S.active?.event||(c.regionalState?.schedule||c.schedule6||[]).some(n=>n.score)))continue;
   if(format6(e).n<16){e.v4OriginalFormat??=formatKey6(e);e.formatKey6='major16';}
   const ids=new Set(children.map(c=>c.id));S.events=S.events.filter(c=>!ids.has(c.id));
   e.qualification={qualVersion:QUALIFIERS.version,majorVersion:4,status:'pending',mode:'major-v4'};
  }
 },
 rows(e){return rankTeams13().map((t,i)=>({team:t.id,rank:i+1,region:Qualifiers.region(t),season:clubState13(t).seasonPoints,elo:clubState13(t).elo,index:1-i/Math.max(1,S.teams.length),busy:Qualifiers.busy(e,t.id)?.id??null}));},
 freeze(e){
  const q=e.qualification;if(q.status!=='pending')return q;
  Qualifiers.ensureScene();
  if(e.day-S.day<QUALIFIERS.snapshotLead){e.originalDay13??=e.day;e.day=S.day+QUALIFIERS.snapshotLead;}
  const n=format6(e).n,count=this.inviteCount(e),slots=n-count,field=slots>1?16:8;
  const top=rankTeams13().slice(0,count).map(t=>t.id);
  for(let attempt=0;attempt<=S.events.length;attempt++){
   const conflicts=top.map(id=>Qualifiers.busy(e,id)).filter(Boolean);if(!conflicts.length)break;
   e.originalDay13??=e.day;e.day=Math.max(e.day,...conflicts.map(c=>c.day+(c.duration||10)+2));
  }
  const rows=this.rows(e);
  const invited=rows.slice(0,count).map(r=>({...r,reason:'season-top',text:'Сезонный рейтинг · место '+r.rank}));
  const excluded=new Set(invited.map(v=>v.team)),rest=rows.filter(r=>r.busy===null&&!excluded.has(r.team)).slice(0,field);
  if(invited.length!==count||invited.some(r=>r.busy!==null)||rest.length!==field){q.status='blocked';q.reason='Недостаточно свободных команд для приглашений и международного отбора.';q.rows=rows;q.snapshotDay=S.day;q.fieldSize=n;return q;}
  const day=Qualifiers.regionalWindow(e,rest.some(r=>r.team===S.club));
  if(day===null){q.status='blocked';q.reason='Нет свободного окна международной квалификации.';q.rows=rows;q.snapshotDay=S.day;q.fieldSize=n;return q;}
  const id=Math.max(...S.events.map(e=>e.id))+1;
  const child={id,name:e.name+' · Международная квалификация',series:'QUALIFICATION',qualifierFor:e.id,qualifierRegion:'GLOBAL',v4MajorQualifier:4,quota:slots,day,duration:QUALIFIERS.regional.duration,pool:QUALIFIERS.regional.pool,venue:'Онлайн · все регионы',real:false,formatKey6:field===8?'qualifier8':'qualifier16',format:'circuit-v6',entrants:rest.map(r=>r.team),inviteTrophy:true,rosterLock:Object.fromEntries(rest.map(r=>[r.team,roster(S.teams[r.team]).map(p=>p.id)]))};
  Object.assign(q,{status:'frozen',snapshotDay:S.day,eventDay:e.day,fieldSize:n,rows,invited,regionalEvents:{GLOBAL:id},rules:{invites:count,listLead:QUALIFIERS.listLead},player:{team:S.club,index:rows.find(r=>r.team===S.club)?.index??0,invited:excluded.has(S.club),reason:excluded.has(S.club)?'season-top':'qualifier'},skipped:rows.filter(r=>r.busy!==null).map(r=>({team:r.team,reason:'schedule-conflict',event:r.busy}))});
  S.events.push(child);Qualifiers.regionalState(child);S.events.sort((a,b)=>a.day-b.day||a.id-b.id);
  log(e.name+' · '+count+' прямых приглашений по рейтингу сезона, '+slots+' мест в международной квалификации. Рейтинг зафиксирован на '+date(S.day)+'.');return q;
 },
 complete(e){
  const q=e.qualification;if(q.status==='pending')this.freeze(e);if(q.status==='complete')return [...q.qualified];if(q.status!=='frozen')return null;
  const child=S.events.find(c=>c.id===q.regionalEvents.GLOBAL);if(!child?.done||S.day<e.day-q.rules.listLead)return null;
  // No reroll or re-ranking after the snapshot. A scheduling conflict delays the main event.
  const order=[...child.entrants].filter(id=>id!==child.withdrawnClub).sort((a,b)=>(child.placements6[a]||9)-(child.placements6[b]||9)||child.seeds6[b]-child.seeds6[a]||a-b);
  const winners=order.slice(0,child.quota),ids=[...q.invited.map(r=>r.team),...winners];
  if(ids.length!==q.fieldSize||new Set(ids).size!==ids.length){q.status='blocked';q.reason='Недостаточно победителей квалификации.';return null;}
  const conflicts=ids.map(id=>Qualifiers.busy(e,id)).filter(Boolean);
  if(conflicts.length){const until=Math.max(...conflicts.map(c=>c.day+(c.duration||10)));e.originalDay13??=e.day;e.day=Math.max(e.day,until+2);q.eventDay=e.day;log(e.name+' перенесён: сохраняем приглашения и победителей отбора без замены участников.');return null;}
  child.inviteWinners=winners;q.status='complete';q.qualified=ids;q.completedDay=S.day;
  e.qualified13=[...ids];e.qualification13={invited:q.invited.map(r=>r.team),matches:child.schedule6.map(n=>({pair:n.pair.map(v=>resolve6({schedule:child.schedule6},v)),w:n.w,score:n.score,maps:n.maps||[]})),day:S.day,majorVersion:4};return [...ids];
 },
 valid(e,state){
  const q=e.qualification,idOK=id=>Number.isInteger(id)&&id>=0&&id<state.teams.length;
  if(q.majorVersion!==4||q.qualVersion!==1||!this.isMajor(e)||!['pending','frozen','complete','blocked'].includes(q.status))return false;
  if(q.status==='pending')return true;
  if(!Number.isInteger(q.snapshotDay)||q.snapshotDay<0||q.snapshotDay>state.day||q.fieldSize!==format6(e).n||!Array.isArray(q.rows)||q.rows.some(r=>!idOK(r.team)||!Number.isInteger(r.rank)||!Number.isFinite(r.season)||!Number.isFinite(r.elo)))return false;
  if(q.status==='blocked')return typeof q.reason==='string';
  const count=this.inviteCount(e),child=state.events.find(c=>c.id===q.regionalEvents?.GLOBAL),expected=q.rows.slice(0,count).map(r=>r.team);
  if(q.rules?.invites!==count||q.rules.listLead!==QUALIFIERS.listLead||!Array.isArray(q.invited)||q.invited.length!==count||q.invited.some((r,i)=>r.team!==expected[i]||r.reason!=='season-top')||new Set(expected).size!==count||!child||child.qualifierFor!==e.id||child.v4MajorQualifier!==4||child.quota!==q.fieldSize-count)return false;
  if(q.status==='complete'&&(!child.done||!Array.isArray(q.qualified)||q.qualified.length!==q.fieldSize||new Set(q.qualified).size!==q.fieldSize||q.qualified.some(id=>!idOK(id))||JSON.stringify(q.qualified)!==JSON.stringify([...expected,...child.inviteWinners])||JSON.stringify(e.qualified13)!==JSON.stringify(q.qualified)))return false;
  return true;
 }
};
const majorSupportsBefore4=Qualifiers.supports,majorFreezeBefore4=Qualifiers.freeze,majorCompleteBefore4=Qualifiers.complete;
Qualifiers.supports=function(e){return !!e?.qualification?.majorVersion||Majors4.isMajor(e)||majorSupportsBefore4.call(this,e);};
Qualifiers.freeze=function(e){return e.qualification?.majorVersion===4?Majors4.freeze(e):majorFreezeBefore4.call(this,e);};
Qualifiers.complete=function(e){return e.qualification?.majorVersion===4?Majors4.complete(e):majorCompleteBefore4.call(this,e);};
const majorCalendarBefore4=ensureTournamentCalendar;
ensureTournamentCalendar=function(){majorCalendarBefore4();if(S?.v4&&S.qualifiers)Majors4.install();};
// Existing early-start paths (including legacy operators and skipped majors) use the same field.
const majorQualifyBefore4=qualify13;
qualify13=function(e,f){if(e.qualification?.majorVersion!==4)return majorQualifyBefore4(e,f);const ids=Majors4.complete(e);if(!ids)throw Error(e.qualification.reason||'Международная квалификация ещё не завершена.');return [...ids];};

const majorStartBefore4=startEvent;
startEvent=function(...args){
 const e=nextEvent();if(e?.qualification?.majorVersion!==4)return majorStartBefore4(...args);
 if(e.day>S.day||S.active)return majorStartBefore4(...args);
 if(!Majors4.complete(e)){toast(e.qualification.reason||'Сначала завершите международную квалификацию.');return;}
 const requested=e.skipRequestedV12;e.skipRequestedV12=false;
 try{return majorStartBefore4(...args);}finally{e.skipRequestedV12=requested;}
};
