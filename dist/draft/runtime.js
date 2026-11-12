'use strict';
// New maps opt in. Existing saves without draftUpdate keep their original rules.
const makeBeforeDraftUpdate=makeLive4;
makeLive4=function(...args){
 const m=makeBeforeDraftUpdate(...args);
 if(m.modelVersion!==8)return m;
 // Mirror maps are useful for training/tests; generated competitive drafts stay unique.
 m.draftUpdate=DraftUpdate.evaluate(...m.sides.map(s=>s.heroes),{allowMirror:true});
 m.initialChance=positionScore4(m);
 return m;
};
const unitBeforeDraftUpdate=Match8.unit;
Match8.unit=function(m,p){
 const base=unitBeforeDraftUpdate.call(this,m,p),side=m.sides.findIndex(s=>s.heroes.includes(p));
 // Equivalent to adding points to skill only inside its existing exponential power term.
 // Stored skill, career synergy, form, mastery, difficulty and economy are untouched.
 return base*Math.exp((m.draftUpdate?.bonuses[side]||0)*this.B.power.skill);
};
function draftReportUpdate(m){
 const d=m?.draftUpdate;if(!d)return '<p>Эта карта начата по прежним правилам драфта.</p>';
 const number=n=>(n>0?'+':'')+Number(n.toFixed(2));
 const list=items=>items.length?'<ul>'+items.map(t=>'<li>'+t+'</li>').join('')+'</ul>':'<p class="sub">Нет.</p>';
 return '<section class="panel draft-update-report"><h2>AM - Draft update · итоги драфта</h2><p>Поправка действует только на эту карту. Предел: −5…+5 очков силы на команду.</p><div class="roster-grid">'+d.teams.map((team,side)=>{
  const details=team.details,bonus=d.bonuses[side],name=esc(S.teams[m.sides[side].team].name);
  return '<section class="panel"><h3>'+name+'</h3><p><b>'+(bonus>0?'Бафф':bonus<0?'Штраф':'Равный драфт')+': '+number(bonus)+' силы</b> · оценка '+number(team.score)+'</p>'+
   '<h4>Герои и позиции · '+number(team.parts.roles)+'</h4>'+list(details.positions.map(p=>esc(p.hero)+' · '+DraftUpdate.roleLabels[p.role]+' · '+p.fit+' ('+number(p.points)+')'))+
   (team.picks.map(p=>DRAFT_HEROES[p.hero].notes).filter(Boolean).map(n=>'<p class="sub">'+esc(n)+'</p>').join(''))+'<h4>Контрпики · '+number(team.parts.counters)+' (предел +5)</h4>'+list(details.counters.map(p=>esc(p.hero)+' → '+esc(p.target)+': '+esc(p.reason)))+
   '<h4>Сочетания · '+number(team.parts.synergy)+' (предел +3)</h4>'+list(details.combinations.map(p=>esc(p.label)+': '+p.heroes.map(esc).join(' + ')))+
   '<h4>Пробелы · '+number(-team.parts.gaps)+'</h4>'+list(details.gaps.map(p=>esc(p.label)+' ('+number(p.points)+')'))+
   (details.conditional.length?'<h4>Условные взаимодействия · без очков</h4>'+list(details.conditional.map(p=>esc(p.hero)+' → '+esc(p.target)+': '+esc(p.reason))):'')+'</section>';
 }).join('')+'</div><p class="sub">Оценка = позиции + контрпики + сочетания − пробелы. Разница: '+number(d.difference)+'. Поправка A = clamp(0,5 × разница, −5, +5); поправка B противоположна.</p></section>';
}
function showDraftUpdate(){
 const m=S.active?.live;if(!m)return;
 openModal(draftReportUpdate(m)+'<div class="actions">'+btn(m.draftUpdatePending?'Начать матч':'Закрыть','confirmDraftUpdate()',true)+'</div>');
}
function confirmDraftUpdate(){
 const m=S.active?.live;if(m)m.draftUpdatePending=false;
 closeModal();save();render();
}
const playBeforeDraftUpdate=playMap;
playMap=function(...args){
 const before=S.active?.live,result=playBeforeDraftUpdate(...args),m=S.active?.live;
 if(m&&m!==before&&m.draftUpdate){m.draftUpdatePending=true;save();showDraftUpdate();}
 return result;
};
const advanceBeforeDraftUpdate=advanceMap;
advanceMap=function(...args){if(S.active?.live?.draftUpdatePending){showDraftUpdate();return;}return advanceBeforeDraftUpdate(...args);};
const toggleBeforeDraftUpdate=toggleLive4;
toggleLive4=function(...args){if(S.active?.live?.draftUpdatePending){showDraftUpdate();return;}return toggleBeforeDraftUpdate(...args);};
const viewBeforeDraftUpdate=matchView;
matchView=function(...args){
 const html=viewBeforeDraftUpdate(...args),m=S.active?.live;
 return html+(m?.draftUpdate?'<section class="panel"><h2>Итоги драфта</h2><p>'+m.sides.map((s,i)=>esc(S.teams[s.team].short)+': '+(m.draftUpdate.bonuses[i]>0?'+':'')+m.draftUpdate.bonuses[i]+' силы').join(' / ')+'</p>'+btn('Подробности драфта','showDraftUpdate()')+'</section>':'');
};
const renderBeforeDraftUpdate=render;
render=function(...args){
 const result=renderBeforeDraftUpdate(...args);
 if(page==='match'&&S.active?.live?.draftUpdatePending)showDraftUpdate();
 return result;
};
const reportBeforeDraftUpdate=buildReport13;
buildReport13=function(m){
 const report=reportBeforeDraftUpdate(m);
 if(m.draftUpdate){report.draftUpdate=structuredClone(m.draftUpdate);report.draftTeamIds=m.sides.map(s=>s.team);}
 return report;
};
const reportViewBeforeDraftUpdate=reportView13;
reportView13=function(m){
 const html=reportViewBeforeDraftUpdate(m),r=m?.report13;
 return html+(r?.draftUpdate?draftReportUpdate({draftUpdate:r.draftUpdate,sides:r.draftTeamIds.map(team=>({team}))}):'');
};
