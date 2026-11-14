'use strict';
// V5.0 B: confirmed participation at least 15 calendar days before play.
const PARTICIPATION_LEAD5B=15;
const Participation5B={
 busy:false,
 shift(e,minimum){if(e.done||e.id===S.active?.event||e.day>=minimum||Qualifiers.isRegional(e)&&(e.regionalState?.schedule||e.schedule6||[]).some(n=>n.score))return;const delta=minimum-e.day;e.originalDay13??=e.day;e.day=minimum;if(e.qualification)e.qualification.eventDay=e.day;
  if(e.regionalState){const a=e.regionalState;a.startDay13+=delta;for(const n of a.schedule){if(Number.isFinite(n.slot13))n.slot13+=delta;if(Number.isFinite(n.day13))n.day13+=delta;if(Number.isFinite(n.phaseFloor13))n.phaseFloor13+=delta;}e.schedule6=structuredClone(a.schedule);}
 },
 enforce(e){
  if(!e||e.done||e.id===S.active?.event)return;
  if(Qualifiers.isRegional(e)){
   const p=S.events.find(p=>p.id===e.qualifierFor);if(p?.qualification?.majorVersion!==5)return;
   e.participationConfirmed5b??=p.qualification.snapshotDay??S.day;this.shift(e,e.participationConfirmed5b+15);return;
  }
  const q=e.qualification;if(q?.majorVersion!==5)return;
  if(q.rules)q.rules.listLead=15;
  if(q.status==='complete'){e.participationConfirmed5b??=q.completedDay??S.day;this.shift(e,e.participationConfirmed5b+15);}
  else if(q.status==='frozen'){
   const children=Object.values(q.regionalEvents||{}).map(id=>S.events.find(c=>c.id===id)).filter(Boolean);
   for(const child of children)this.enforce(child);
   const end=Math.max(S.day,...children.map(c=>c.done?(c.completedDay20??S.day):Math.max(S.day,c.day+(c.duration||6))));this.shift(e,end+15);
  }else if(q.status==='pending'&&e.day-S.day<15)this.shift(e,S.day+35);
 }
};
const childBefore5B=Admissions5.child;
Admissions5.child=function(e,...args){if(e.qualification.rules)e.qualification.rules.listLead=15;const child=childBefore5B.call(this,e,...args);Participation5B.enforce(child);Participation5B.enforce(e);return child;};
const completeBefore5B=Admissions5.complete;
Admissions5.complete=function(e){Participation5B.enforce(e);const ids=completeBefore5B.call(this,e);if(ids){e.participationConfirmed5b??=e.qualification.completedDay??S.day;Participation5B.enforce(e);}return ids;};
const installBefore5B=Admissions5.install;
Admissions5.install=function(){installBefore5B.call(this);if(!S?.v5?.sceneReady||Participation5B.busy||Scene5.loading||Scene5.installing)return;Participation5B.busy=true;try{for(const e of S.events)Participation5B.enforce(e);S.events.sort((a,b)=>a.day-b.day||a.id-b.id);}finally{Participation5B.busy=false;}};
const rulesBefore5B=UI5.rule;
UI5.rule=function(e){return rulesBefore5B.call(this,e)+'<section class="panel"><h3>Подтверждение участия</h3><p>Полный состав участников подтверждается минимум за 15 дней до начала турнира. Квалификация завершается до этого срока. При позднем определении участников старт переносится.</p>'+(Number.isInteger(e.participationConfirmed5b)?'<p>Подтверждено: '+date(e.participationConfirmed5b)+' · старт: '+date(e.day)+'.</p>':'')+'</section>';};
const renderBefore5B=render;
render=function(...args){const result=renderBefore5B(...args);if(S?.v5?.sceneReady)$('broadcastStatus33c').innerHTML=$('broadcastStatus33c').innerHTML.replace(/V5\.0(?: A)? \/ ARENA/,'V5.0 B / ARENA');return result;};
