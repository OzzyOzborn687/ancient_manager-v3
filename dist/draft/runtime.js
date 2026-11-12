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
const DRAFT_HERO_IMAGE_IDS={
 'Shadow Fiend':'nevermore','Vengeful Spirit':'vengefulspirit','Windranger':'windrunner',
 Zeus:'zuus',Necrophos:'necrolyte','Queen of Pain':'queenofpain','Wraith King':'skeleton_king',
 Clockwerk:'rattletrap',"Nature's Prophet":'furion',Lifestealer:'life_stealer',
 Doom:'doom_bringer','Outworld Destroyer':'obsidian_destroyer','Outworld Devourer':'obsidian_destroyer',
 'Treant Protector':'treant',Io:'wisp','Centaur Warrunner':'centaur',Magnus:'magnataur',
 Timbersaw:'shredder',Underlord:'abyssal_underlord',Ringmaster:'ringmaster','Ring Master':'ringmaster'
};
function draftPortrait(hero){
 const initials=hero.split(' ').map(word=>word[0]).join('').slice(0,3).toUpperCase();
 const id=DRAFT_HERO_IMAGE_IDS[hero]??hero.toLowerCase().replace(/[^a-z0-9 ]/g,'').replaceAll(' ','_');
 const url='https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/'+encodeURIComponent(id)+'.png';
 return '<span class="draft-hero-portrait" aria-hidden="true">'+esc(initials)+
  '<img src="'+url+'" alt="" loading="lazy" onerror="this.hidden=true"></span>';
}
const draftNumber=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2,signDisplay:'exceptZero'});
function draftReportUpdate(m){
 const d=m?.draftUpdate;
 if(!d)return '<p>Эта карта начата по прежним правилам драфта.</p>';
 const list=(label,items)=>items.length?'<h4>'+label+'</h4><ul>'+items.map(t=>'<li>'+t+'</li>').join('')+'</ul>':'';
 const leading=d.difference===0?null:S.teams[m.sides[d.difference>0?0:1].team];
 const sides=d.teams.map((team,side)=>{
  const club=S.teams[m.sides[side].team],details=team.details,bonus=d.bonuses[side];
  const picks=details.positions.map(p=>'<li class="draft-pick">'+draftPortrait(p.hero)+
   '<div><strong>'+esc(p.hero)+'</strong><small>'+esc(DraftUpdate.roleLabels[p.role])+
   ' · '+esc(p.fit)+'</small></div><span class="draft-pick-value">'+draftNumber.format(p.points)+'</span></li>').join('');
  const breakdown=list('Контрпики · '+draftNumber.format(team.parts.counters),details.counters.map(p=>
   esc(p.hero)+' → '+esc(p.target)+' ('+draftNumber.format(p.points)+') · '+esc(p.reason)))+
   list('Сочетания · '+draftNumber.format(team.parts.synergy),details.combinations.map(p=>
    esc(p.label)+' · '+p.heroes.map(esc).join(' + ')))+
   list('Пробелы · '+draftNumber.format(-team.parts.gaps),details.gaps.map(p=>
    esc(p.label)+' ('+draftNumber.format(p.points)+')'))+
   list('Условные взаимодействия',details.conditional.map(p=>esc(p.hero)+' → '+esc(p.target)+' · '+esc(p.reason)))+
   list('Особенности героев',team.picks.map(p=>DRAFT_HEROES[p.hero]?.notes).filter(Boolean).map(esc));
  return '<article class="draft-side"><header class="draft-side-header"><div class="draft-team-name">'+
   clubAvatar12(club,true)+'<h3>'+esc(club.name)+'</h3></div><div class="draft-rating">'+
   draftNumber.format(bonus)+'<small>'+(bonus>0?'Бафф':bonus<0?'Штраф':'Равный драфт')+' · оценка '+
   draftNumber.format(team.score)+'</small></div></header><ol class="draft-picks">'+picks+'</ol>'+
   '<details class="draft-breakdown"><summary>Разбор драфта</summary>'+
   (breakdown||'<p>Оценку определили позиции героев.</p>')+'</details></article>';
 }).join('');
 return '<section class="draft-update-report"><header class="draft-header"><h2>Итоги драфта</h2><p>'+
  (leading?'Преимущество · '+esc(leading.name):'Равный драфт')+
  '</p></header><div class="draft-sides">'+sides+
  '</div><p class="draft-disclaimer">Поправка к силе действует на одну карту и ограничена диапазоном от −5 до +5.</p></section>';
}
function showDraftUpdate(){
 const m=S.active?.live;if(!m)return;
 openModal('<div class="draft-prematch">'+draftReportUpdate(m)+'<div class="draft-actions">'+
  btn(m.draftUpdatePending?'Начать матч':'Закрыть','confirmDraftUpdate()',true)+'</div></div>');
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
