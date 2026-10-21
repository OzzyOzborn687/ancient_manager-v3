'use strict';
const QualifiersLegacy={qualify:qualify13,calendar:ensureTournamentCalendar,fresh,migrate,tick,start:startEvent,result:recordResult6,finish:finishEvent6,valid:validSave};
ensureTournamentCalendar=function(){
 const previous=new Set(S?.events?.map(e=>e.id)||[]);QualifiersLegacy.calendar();
 if(S?.qualifiers)for(const e of S.events){
  Qualifiers.invalidateFuture(e);if(!previous.has(e.id))Qualifiers.mark(e);
 }
};
fresh=function(...args){QualifiersLegacy.fresh(...args);Qualifiers.install(true);save();render();};
migrate=function(){QualifiersLegacy.migrate();Qualifiers.install(false);};
tick=function(){QualifiersLegacy.tick();Qualifiers.update();};
qualify13=function(e,f){
 if(!Qualifiers.supports(e)||e.qualification?.qualVersion!==QUALIFIERS.version)return QualifiersLegacy.qualify(e,f);
 const qualified=Qualifiers.complete(e);
 if(!qualified)throw Error(e.name+': '+(e.qualification.reason||'Отбор ещё не готов'));
 return [...qualified];
};
startEvent=function(){
 const e=nextEvent();
 if(!S.active&&!S.practice13&&!busy13&&e&&!e.skipRequestedV12&&e.day<=S.day&&Qualifiers.supports(e)&&e.qualification){
  if(!Qualifiers.complete(e)){toast(e.qualification.reason||'Не удалось подготовить участников.');save();return;}
 }
 return QualifiersLegacy.start();
};
recordResult6=function(m){
 const first=m.finishedSide!=null&&!m.careerResult13&&!m.qualifiersFameApplied&&m.scope13!=='scrim';
 const elos=first?m.sides.map(s=>clubState13(S.teams[s.team]).elo):null;
 QualifiersLegacy.result(m);
 if(!first)return;
 m.qualifiersFameApplied=true;Qualifiers.initFame();
 const winner=m.sides[m.finishedSide].team,C=QUALIFIERS.fame,t=S.teams[winner];
 const upset=clamp((elos[1-m.finishedSide]-elos[m.finishedSide])/C.upsetEloScale,0,C.upsetCap);
 t.fame=clamp(t.fame+C.mapWin+upset*C.upsetWin,C.min,C.max);
};
finishEvent6=function(a){
 const e=S.events.find(e=>e.id===a.event),done=e?.done;QualifiersLegacy.finish(a);
 if(!e||done||!e.done||e.qualifiersFameApplied)return;
 e.qualifiersFameApplied=true;Qualifiers.initFame();const C=QUALIFIERS.fame;
 for(const [id,place] of Object.entries(e.placements6||{})){
  const t=S.teams[+id];if(t)t.fame=clamp(t.fame+C.eventWin/place**C.placeExponent,C.min,C.max);
 }
 save();
};
validSave=function(state){return QualifiersLegacy.valid(state)&&Qualifiers.valid(state);};
const rankingBeforeQualifiers=rankingView13;
rankingView13=function(){
 const html=rankingBeforeQualifiers();
 return S.events.some(e=>e.qualification?.qualVersion===QUALIFIERS.version)?
  html.replace('Половина мест — приглашения по сезонному рейтингу. Остальные — победители автоматических отборочных BO3. Отборочные и посев смоделированы для карьеры.',
   'Новые BLAST, PGL, ESL и DreamLeague: шесть приглашений по индексу оператора и региональные места. Региональный отбор фазы 1 рассчитывается мгновенно. Существующие события старых карьер, TI и FISSURE сохраняют свои правила.'):html;
};
