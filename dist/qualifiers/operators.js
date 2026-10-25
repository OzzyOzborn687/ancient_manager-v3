'use strict';
Qualifiers.initOperators3b=function(){
 if(!S?.qualifiers)return null;
 if(S.qualifiers.operators3b)return S.qualifiers.operators3b;
 const C=QUALIFIERS.operatorRelations;
 return S.qualifiers.operators3b={version:C.version,club:S.club,
  relations:Object.fromEntries(QUALIFIERS.operators.map(op=>[op,C.initial])),requests:{},settled:{},history:[]};
};
Qualifiers.operator3b=function(e){
 const parent=this.isRegional(e)?S.events.find(p=>p.id===e.qualifierFor):e;
 const operator=parent&&circuitSeries(parent);return QUALIFIERS.operators.includes(operator)?operator:null;
};
Qualifiers.requests3b=function(state=this.initOperators3b()){return Object.values(state?.requests||{}).flat();};
Qualifiers.relationship3b=function(operator){return this.initOperators3b()?.relations[operator]??QUALIFIERS.operatorRelations.initial;};
Qualifiers.operatorResultKey3b=function(e,operator){
 return [operator,this.family3(e),this.isRegional(e)?'qualification':'main',e.qualifierRegion||'',S.club].join('|');
};
Qualifiers.awardOperatorResult3b=function(e,a=null,withdrawn=false){
 const operator=this.operator3b(e);if(!operator||!e?.done||!(e.entrants||a?.entrants||[]).includes(S.club))return false;
 const state=this.initOperators3b();if(!state)return false;
 const regional=this.isRegional(e),q=e.qualification;
 const declined=withdrawn||a?.withdrawnV12||e.withdrawnClub===S.club||e.skippedV12;
 const committed=regional||q?.qualified?.includes(S.club)||q?.invited?.some(v=>v.team===S.club)||e.registration3?.rosters[S.club];
 if(declined&&!committed||!declined&&e.notQualified13)return false;
 if(regional&&declined)for(const r of this.requests3b(state))if(r.accepted&&r.event===e.qualifierFor&&!r.cancelled){r.cancelled=true;r.cancelledDay=S.day;}
 const key=this.operatorResultKey3b(e,operator);if(state.settled[key])return false;
 const C=QUALIFIERS.operatorRelations,place=e.placements6?.[S.club]??e.place??null;
 const passed=regional&&e.inviteWinners?.includes(S.club),reason=declined?'withdrawal':regional?passed?'qualification-pass':'qualification-finish':'main-finish';
 const requestedDelta=declined?C.withdrawal:regional?C.qualificationFinish+(passed?C.qualifiedBonus:0):C.mainFinish+(C.mainPlace[place]||0);
 const before=state.relations[operator],after=clamp(before+requestedDelta,C.min,C.max),delta=after-before;
 state.relations[operator]=after;state.settled[key]=true;
 state.history.unshift({key,event:e.id,parent:this.family3(e),operator,team:S.club,kind:regional?'qualification':'main',
  region:e.qualifierRegion||'',day:S.day,place,reason,before,after,delta});state.history=state.history.slice(0,C.historyLimit);
 const text={'withdrawal':'отказ от подтверждённого участия','qualification-pass':'выход из квалификации','qualification-finish':'участие в квалификации','main-finish':'результат основного турнира'}[reason];
 log(operator+' · отношения '+(delta>=0?'+':'')+delta+' ('+text+'), теперь '+Math.round(after)+'/100.');return true;
};
