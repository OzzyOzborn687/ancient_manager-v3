'use strict';
PAGES.splice(PAGES.findIndex(p=>p[0]==='calendar'),0,['qualifiers','✉','Квалификации']);
let selectedQualifierEvent=null,qualifierTab='invitations';
const qualifierPreviewLegacy=playoffPreviewV1,qualifierDisplayLegacy=neonDisplayEvent;
playoffPreviewV1=function(key){const a=qualifierPreviewLegacy(key);if(key==='qualifier8'||key==='qualifier16')for(const n of a.schedule)n.bo=QUALIFIERS.regional.bo;return a;};
neonDisplayEvent=function(e){
 if(Qualifiers.isRegional(e)&&e.regionalState&&S.active?.event!==e.id)return {a:e.regionalState,f:format6(e),key:e.formatKey6,active:false,preview:false};
 return qualifierDisplayLegacy(e);
};
function inviteIcon(){return '<svg class="invite-icon" viewBox="0 0 64 48" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M3 3h58v13a8 8 0 0 0 0 16v13H3V32a8 8 0 0 0 0-16V3z M43 4v40 M14 16h19 M14 25h19 M14 34h12"/></svg>';}
function qualifierParents(){return S.events.filter(e=>Qualifiers.supports(e)&&e.qualification).sort((a,b)=>a.day-b.day||a.id-b.id);}
function qualifierParent(){return qualifierParents().find(e=>e.id===selectedQualifierEvent)||qualifierParents().find(e=>!e.done&&e.qualification.status!=='pending')||qualifierParents().find(e=>!e.done)||qualifierParents().at(-1);}
function openQualifiers(id,tab='invitations'){selectedQualifierEvent=id;qualifierTab=tab;go('qualifiers');}
function qualifierCard(parent,compact=false){
 const q=parent.qualification,invite=q.invited?.find(v=>v.team===S.club);
 const child=S.events.find(e=>e.qualifierFor===parent.id&&e.entrants?.includes(S.club));
 let title='Приглашения ещё не объявлены',detail='Объявление '+date(parent.day-QUALIFIERS.snapshotLead)+'.',action=btn('Квалификации →','openQualifiers('+parent.id+')');
 if(invite){title='Ваш клуб приглашён на турнир';detail=invite.text+'. Квалификации пропускаются.';}
 else if(child){
  const passed=child.inviteWinners?.includes(S.club);
  title=passed?'Инвайт завоёван':child.done?'Квалификация завершена без инвайта':'Ваш путь — региональная квалификация';
  detail=child.name+' · '+date(child.day)+' · '+child.quota+' '+(child.quota===1?'инвайт':'инвайта')+'.';
  action=btn(child.done?'Результаты →':S.active?.event===child.id?'Матч-центр →':'Открыть квалификацию →',S.active?.event===child.id?"go('match')":'showBracket('+child.id+')',true);
  if(!child.done&&!S.active&&nextEvent()?.id===child.id&&child.day<=S.day)action+=btn('Начать квалификацию','startEvent()',true);
 }else if(q.status==='blocked'){title='Квалификация требует внимания';detail=q.reason;}
 else if(q.status!=='pending'){title='Прямого приглашения нет';detail='Ваш индекс '+(q.player?.index??0).toFixed(4)+'. '+(q.mode==='provisional-p1'?'Этот отбор начат по прежней модели.':'Ваш клуб не вошёл в закрытую квалификацию.');}
 return '<section class="panel qualifier-invite '+(invite||child?.inviteWinners?.includes(S.club)?'invite-earned':'')+'" data-qualification-event="'+parent.id+'">'+inviteIcon()+'<div><span class="eyebrow">'+esc(title)+'</span><h2>'+esc(parent.name)+'</h2><p>'+esc(detail)+'</p>'+(compact?'':action)+'</div></section>';
}
function qualifiersView(){
 const parents=qualifierParents(),e=qualifierParent();
 if(!e)return head('ПУТЬ НА ТУРНИР','Квалификации','Приглашения и региональные турниры появятся для новых событий BLAST, PGL, ESL и DreamLeague.')+'<section class="panel"><p>События старой карьеры сохраняют прежний отбор.</p>'+btn('Календарь',"go('calendar')")+'</section>';
 const q=e.qualification,tabs=[['invitations','Приглашения'],['regions','Регионы'],['path','Мой путь']];
 const controls='<div class="qualifier-controls"><select aria-label="Основной турнир" onchange="selectedQualifierEvent=+this.value;render()">'+parents.map(p=>'<option value="'+p.id+'" '+(p.id===e.id?'selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select><div class="qualifier-tabs">'+tabs.map(([key,label])=>btn(label,"qualifierTab='"+key+"';render()",qualifierTab===key)).join('')+'</div></div>';
 let body='';
 if(qualifierTab==='invitations'){
  body=qualifierCard(e,true)+(q.invited?'<div class="qualifier-invites">'+q.invited.map(v=>'<article class="panel"><div class="section-head">'+clubAvatar12(S.teams[v.team])+'<span class="tag">'+esc(v.region)+'</span></div><h3>'+esc(S.teams[v.team].name)+'</h3><p>'+esc(v.text)+'</p><small>Индекс '+v.index.toFixed(4)+'</small></article>').join('')+'</div>':'<section class="panel"><p>Объявление шести приглашений: '+date(e.day-QUALIFIERS.snapshotLead)+'.</p></section>');
 }else if(qualifierTab==='regions'){
  const regionals=S.events.filter(c=>c.qualifierFor===e.id);
  body=regionals.length?'<div class="qualifier-regions">'+regionals.map(c=>'<article class="panel"><span class="eyebrow">'+esc(c.qualifierRegion)+' · '+(c.done?'Завершён':S.active?.event===c.id?'Идёт сейчас':'Региональный турнир')+'</span><h2>'+esc(c.name)+'</h2><p>'+c.entrants.length+' клубов · BO3 · '+eventDates(c)+'</p><p class="green">Трофей: '+c.quota+' '+(c.quota===1?'инвайт':'инвайта')+' на '+esc(e.name)+'</p><small>Призовой фонд '+cash(c.pool)+'</small>'+btn('Сетка турнира →','showBracket('+c.id+')',true)+'</article>').join('')+'</div>':'<section class="panel"><p>Составы регионов будут опубликованы вместе с приглашениями.</p></section>';
 }else body=qualifierCard(e)+'<section class="panel"><h2>Правила пути</h2><p>Прямой инвайт освобождает от квалификации. В региональном турнире нужно занять место не ниже квоты. Выход приносит отдельную награду — приглашение на основное событие.</p><p>Усталость: '+QUALIFIERS.regional.seriesFatigue+' п.п. за завершённую серию до эффекта восстановления. Все серии, включая финал, BO3.</p></section>';
 return head('ПУТЬ НА ТУРНИР','Квалификации','Приглашения, региональные турниры и награды клуба.')+controls+body;
}
const homeBeforeScene=home;
home=function(){const e=qualifierParent();return (e&&e.qualification.status!=='pending'?qualifierCard(e):'')+homeBeforeScene();};
const calendarBeforeScene=calendar;
calendar=function(){
 let html=calendarBeforeScene();
 for(const e of S.events.filter(e=>Qualifiers.isRegional(e))){
  const parent=S.events.find(p=>p.id===e.qualifierFor);
  const title='<h2>'+esc(e.name)+'</h2>';
  html=html.replace(title,title+'<p class="qualifier-calendar-prize">Награда: '+e.quota+' инвайт'+(e.quota===1?'':'а')+' на '+esc(parent?.name||'основной турнир')+'</p>'+btn('Сетка квалификации','showBracket('+e.id+')'));
 }
 return '<div class="notice qualifier-calendar-note">Квалификации — отдельные турниры. Их главный трофей — приглашение.'+btn('Приглашения и мой путь',"go('qualifiers')")+'</div>'+html;
};
const bracketBeforeScene=bracketView;
bracketView=function(){
 const html=bracketBeforeScene(),e=S.events.find(e=>e.id===(selectedBracket??S.active?.event));
 if(!Qualifiers.isRegional(e))return html;
 const parent=S.events.find(p=>p.id===e.qualifierFor);
 const a= S.active?.event===e.id;
 return '<section class="panel qualifier-prize">'+inviteIcon()+'<div><span class="eyebrow">ТРОФЕЙ КВАЛИФИКАЦИИ</span><h2>Инвайт на '+esc(parent?.name||'основной турнир')+'</h2><p>Проходят '+e.quota+' лучших. '+(e.done?'Обладатели: '+e.inviteWinners.map(id=>esc(S.teams[id].name)).join(', '):'Все серии BO3.')+'</p>'+(!e.done&&!S.active&&nextEvent()?.id===e.id&&e.day<=S.day?btn('Начать квалификацию','startEvent()',true):a?btn('Матч-центр →',"go('match')",true):'')+'</div></section>'+html.replace('Гранд-финал · BO5','Гранд-финал · BO3');
};
const winsBeforeScene=wins20;
wins20=function(...args){return winsBeforeScene(...args).filter(e=>!Qualifiers.isRegional(e));};
const trophiesBeforeScene=trophiesView20;
trophiesView20=function(){
 const club=awardClub20??S.club,year=awardYear20??year20(S.day),awards=[];
 for(const e of S.events){
  if(!Qualifiers.isRegional(e)||!e.done||!e.inviteWinners?.includes(club)||year20(e.completedDay20??e.day)!==+year)continue;
  const parent=S.events.find(p=>p.id===e.qualifierFor);awards.push({e,parent});
 }
 return trophiesBeforeScene()+'<section class="panel"><h2>Завоёванные инвайты · '+awards.length+'</h2><p>Приглашения, выигранные в квалификациях. Чемпионские титулы учитываются отдельно.</p></section>'+(awards.length?'<div class="qualifier-awards">'+awards.map(({e,parent})=>'<article class="panel qualifier-prize">'+inviteIcon()+'<div><span class="eyebrow">ИНВАЙТ ЗАВОЁВАН</span><h2>'+esc(parent?.name||'Турнир')+'</h2><p>'+esc(e.name)+'</p>'+btn('Путь к инвайту →','showBracket('+e.id+')')+'</div></article>').join('')+'</div>':'');
};
const renderBeforeScene=render;
render=function(){
 renderBeforeScene();
 const nav=$('nav');
 if(!nav.innerHTML.includes("go('qualifiers')"))nav.innerHTML+='<button class="'+(page==='qualifiers'?'active':'')+'" onclick="go(\'qualifiers\')">'+icon21('next')+'<span>Квалификации</span></button>';
 if(page==='qualifiers'&&!busy13&&!S.practice13)$('app').innerHTML=qualifiersView();
};
