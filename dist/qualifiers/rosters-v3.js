'use strict';
const QualifierRosterLegacy={locked,release:releasePlayerV1,academy,options:reshuffleOptions13,
 sign:signReshuffle13,replacement:signReplacement12,terms:transferTerms13,tick,
 promote,buy,sell,offer,canRetire:canRetirePlayer,profile,playerView:playerView20,market};
let qualifierRosterContext3=false;
Qualifiers.registrationHeld3=function(state,parent,team){
 const q=parent?.qualification;
 if(!q||parent.done||q.status==='blocked'&&!q.calendarBlock3)return false;
 return q.status==='complete'||q.calendarBlock3?q.qualified.includes(team):true;
};
Qualifiers.registerRegion3=function(e,day=S.day){
 const parent=S.events.find(p=>p.id===e.qualifierFor);
 if(!this.isCalendar3(parent)||e.done||day<e.day||parent.qualification.status==='blocked')return;
 if(this.deferRegional3(e,day)||e.registration3)return;
 const rosters=Object.fromEntries(e.entrants.map(id=>[id,roster(S.teams[id]).map(p=>p.id)]));
 e.registration3={version:QUALIFIERS.calendar.version,day:Math.max(S.day,e.day),rosters};
 e.rosterLock=structuredClone(rosters);
 if(e.entrants.includes(S.club))log(e.name+' · заявка из пяти игроков зафиксирована. Прошедшие команды сохраняют состав до конца основного турнира; остальные освобождаются после утверждения списка участников.');
};
Qualifiers.registerMain3=function(e){
 if(!this.isCalendar3(e)||e.registration3||e.qualification.status!=='complete')return;
 const children=S.events.filter(v=>v.qualifierFor===e.id),rosters={};
 for(const id of e.qualification.qualified){
  const child=children.find(v=>v.registration3?.rosters[id]);
  rosters[id]=[...(child?.registration3.rosters[id]||roster(S.teams[id]).map(p=>p.id))];
 }
 e.registration3={version:QUALIFIERS.calendar.version,day:S.day,rosters};e.rosterLock=structuredClone(rosters);
 if(e.qualification.qualified.includes(S.club))log(e.name+' · итоговая заявка закрыта. Состав сохранён до завершения турнира; продление контрактов доступно.');
};
Qualifiers.ensureRegistrations3=function(day=S.day){
 if(!S?.qualifiers?.phase3)return;
 for(const e of S.events){
  if(this.isRegional(e))this.registerRegion3(e,day);
  else if(this.isCalendar3(e)&&e.qualification.status==='complete')this.registerMain3(e);
 }
};
Qualifiers.registeredRoster3=function(team,state=S){
 if(!state?.qualifiers?.phase3)return null;
 for(const e of state.events){
  const ids=e.registration3?.rosters?.[team];if(!ids)continue;
  const parent=this.isRegional(e)?state.events.find(p=>p.id===e.qualifierFor):e;
  if(this.registrationHeld3(state,parent,team))return ids;
 }
 return null;
};
Qualifiers.rosterMatches3=function(team,ids){return JSON.stringify(roster(S.teams[team]).map(p=>p.id))===JSON.stringify(ids);};
locked=function(){
 if(QualifierRosterLegacy.locked())return true;
 return qualifierRosterContext3&&!!Qualifiers.registeredRoster3(S.club);
};
Qualifiers.rosterContext3=function(callback){
 this.ensureRegistrations3();const previous=qualifierRosterContext3;qualifierRosterContext3=true;
 try{return callback();}finally{qualifierRosterContext3=previous;}
};
Qualifiers.rosterAction3=function(callback,args){
 this.ensureRegistrations3();
 if(this.registeredRoster3(S.club)){toast('Состав зафиксирован в турнирной заявке. Продление контрактов доступно.');return false;}
 return callback(...args);
};
promote=function(...args){return Qualifiers.rosterAction3(QualifierRosterLegacy.promote,args);};
buy=function(...args){return Qualifiers.rosterAction3(QualifierRosterLegacy.buy,args);};
sell=function(...args){return Qualifiers.rosterAction3(QualifierRosterLegacy.sell,args);};
offer=function(...args){return Qualifiers.rosterAction3(QualifierRosterLegacy.offer,args);};
canRetirePlayer=function(...args){Qualifiers.ensureRegistrations3();return !Qualifiers.registeredRoster3(S.club)&&QualifierRosterLegacy.canRetire(...args);};
profile=function(...args){return Qualifiers.rosterContext3(()=>QualifierRosterLegacy.profile(...args));};
playerView20=function(...args){return Qualifiers.rosterContext3(()=>QualifierRosterLegacy.playerView(...args));};
market=function(...args){return Qualifiers.rosterContext3(()=>QualifierRosterLegacy.market(...args));};
transferTerms13=function(p,...args){
 const terms=QualifierRosterLegacy.terms(p,...args);
 if(p.team!==null&&Qualifiers.registeredRoster3(p.team))return {...terms,reason:'Состав клуба зафиксирован в заявке квалификаций или основного турнира.'};
 return terms;
};
releasePlayerV1=function(p,...args){
 if(p.team!==null&&Qualifiers.registeredRoster3(p.team)?.includes(p.id))return null;
 return QualifierRosterLegacy.release(p,...args);
};
academy=function(team,role,...args){
 const ids=team===null?null:Qualifiers.registeredRoster3(team);
 if(ids)return ids.map(id=>S.players[id]).find(p=>p.role===role);
 return QualifierRosterLegacy.academy(team,role,...args);
};
reshuffleOptions13=function(t,used,closed){
 if(Qualifiers.registeredRoster3(t.id))return [];
 const protectedClubs=S.teams.filter(v=>Qualifiers.registeredRoster3(v.id)).map(v=>v.id);
 return QualifierRosterLegacy.options(t,used,new Set([...closed,...protectedClubs]));
};
signReshuffle13=function(p,team,...args){
 if(Qualifiers.registeredRoster3(team)||p.team!==null&&Qualifiers.registeredRoster3(p.team))return false;
 return QualifierRosterLegacy.sign(p,team,...args);
};
signReplacement12=function(team,...args){
 if(Qualifiers.registeredRoster3(team))return null;
 return QualifierRosterLegacy.replacement(team,...args);
};
tick=function(){
 Qualifiers.ensureRegistrations3(S.day+1);
 const day=S.day,contracts=[];
 // Defer expiry/renewal during registration, preserving the real remaining days.
 for(const t of S.teams)for(const id of Qualifiers.registeredRoster3(t.id)||[]){
  const p=S.players[id];contracts.push([id,p.contract]);p.contract=Math.max(p.contract,2);
 }
 try{return QualifierRosterLegacy.tick();}
 finally{for(const [id,contract] of contracts)S.players[id].contract=contract-Number(S.day>day);}
};
