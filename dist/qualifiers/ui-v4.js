'use strict';
// UI-only selections deliberately stay outside the saved career and its RNG.
let selectedQualifierRegion4=null,qualifierRegionStage4='groups';
const QualifierUI4Legacy={view:qualifiersView,card:qualifierCard,bracket:bracketView,render};
const qualifierTabs4=[['invitations','Приглашения'],['regions','Регионы'],['path','Мой путь']];
function chooseQualifierTab4(key,focus=false){
 if(!qualifierTabs4.some(([k])=>k===key))return;
 qualifierTab=key;render();if(focus)document.querySelector('[data-qualifier-tab="'+key+'"]').focus();
}
function qualifierTabKey4(event){
 const keys=qualifierTabs4.map(([key])=>key),at=keys.indexOf(qualifierTab);let next;
 if(event.key==='ArrowRight')next=keys[(at+1)%keys.length];
 else if(event.key==='ArrowLeft')next=keys[(at+keys.length-1)%keys.length];
 else if(event.key==='Home')next=keys[0];else if(event.key==='End')next=keys.at(-1);else return;
 event.preventDefault();chooseQualifierTab4(next,true);
}
function qualifierControls4(parents,e){
 return '<div class="qualifier-controls"><select aria-label="Основной турнир" onchange="selectedQualifierEvent=+this.value;selectedQualifierRegion4=null;render()">'+
 parents.map(p=>'<option value="'+p.id+'" '+(p.id===e.id?'selected':'')+'>'+esc(p.name)+(p.done?' · завершён':'')+'</option>').join('')+'</select>'+
 '<div class="qualifier-tabs" role="group" aria-label="Разделы квалификаций" onkeydown="qualifierTabKey4(event)">'+qualifierTabs4.map(([key,label])=>
 '<button data-qualifier-tab="'+key+'" aria-pressed="'+(qualifierTab===key)+'" aria-controls="qualifier-content4" class="'+(qualifierTab===key?'primary':'')+'" onclick="chooseQualifierTab4(\''+key+'\')">'+label+'</button>').join('')+'</div></div>';
}
function qualifierIndex4(e){
 const q=e.qualification,own=q.rows?.find(v=>v.team===S.club),player=q.player;
 if(!player||!own)return '<section class="panel qualifier-index4"><h2>Ваш индекс и порог</h2><p>Расчёт появится после объявления приглашений. Рейтинг до объявления не фиксируется.</p></section>';
 const reasons={'schedule-conflict':'Пересечение официальных матчей.','region-cap':'Достигнут лимит прямых приглашений региона.',
  'regional-capacity':'Нужно сохранить места и доступное поле регионов.','below-cutoff':'Прямое приглашение не получено по правилам оператора.',
  index:'Приглашение по индексу оператора.',champion:'Гарантированное место действующего чемпиона.',wildcard:'Прямой wildcard за известность и форму.'};
 const labels={season:'Очки сезона',eloForm:'Elo и форма',history:'История у оператора',fame:'Известность'},weights=q.weights||{},total=Object.values(weights).reduce((a,b)=>a+b,0);
 const breakdown=row=>'<dl class="qualifier-factors4">'+Object.entries(labels).map(([k,label])=>'<div><dt>'+label+' · вес '+(weights[k]??'—')+'</dt><dd>'+((row.components?.[k]??0)*100).toFixed(1)+'% <small>· вклад '+(total?(row.components[k]*weights[k]/total).toFixed(4):'—')+'</small></dd></div>').join('')+'</dl>';
 const cutoff=Number.isFinite(player.cutoff)?player.cutoff.toFixed(4):'Нет порога',delta=Number.isFinite(player.cutoff)?player.index-player.cutoff:null;
 return '<section class="panel qualifier-index4"><span class="eyebrow">Снимок '+esc(date(q.snapshotDay))+'</span><h2>Ваш индекс и порог</h2><div class="qualifier-index-values4">'+
 stat('Ваш индекс',player.index.toFixed(4),'Зафиксирован при объявлении')+stat('Порог по индексу',cutoff,'Среди приглашений по индексу')+stat('Разница',delta===null?'—':(delta>=0?'+':'')+delta.toFixed(4),'Ваш индекс минус порог')+'</div><p>'+esc(reasons[player.reason]||'Причина указана в сохранённом объявлении.')+'</p>'+breakdown(own)+
 '<p class="sub">Порог — минимальный индекс среди приглашений по индексу. Чемпион, прямой wildcard, лимит региона и календарь учитываются отдельно; один индекс выше порога не гарантирует инвайт.</p></section>';
}
function qualifierInvitations4(e){
 const q=e.qualification;
 return qualifierCard(e,true)+qualifierIndex4(e)+(q.invited?.length?'<div class="qualifier-invites">'+q.invited.map(v=>'<article class="panel" data-invited-team="'+v.team+'"><div class="section-head">'+clubAvatar12(S.teams[v.team])+'<span class="tag">'+esc(v.region)+'</span></div><h3>'+esc(S.teams[v.team].name)+'</h3><p>'+esc(v.text)+'</p><small>Индекс '+v.index.toFixed(4)+'</small><details><summary>Факторы приглашения</summary><dl class="qualifier-factors4">'+
 Object.entries({season:'Очки сезона',eloForm:'Elo и форма',history:'История',fame:'Известность'}).map(([k,label])=>'<div><dt>'+label+'</dt><dd>'+((v.components?.[k]??0)*100).toFixed(1)+'%</dd></div>').join('')+'</dl></details></article>').join('')+'</div>':'<section class="panel"><p>Приглашения пока не опубликованы.</p></section>');
}
function chooseQualifierRegion4(region){if(!QUALIFIERS.regions.includes(region))return;selectedQualifierRegion4=region;render();document.querySelector('[data-region="'+region+'"]').focus();}
function qualifierRegions4(e){
 const children=S.events.filter(c=>c.qualifierFor===e.id);
 if(!children.length)return '<section class="panel"><h2>Региональные квалификации</h2><p>'+esc(e.qualification.reason||'Составы и сетки регионов будут опубликованы вместе с приглашениями. События прежней модели сохраняют свой регламент.')+'</p></section>';
 const region=children.some(c=>c.qualifierRegion===selectedQualifierRegion4)?selectedQualifierRegion4:children.some(c=>c.qualifierRegion===Qualifiers.region(my()))?Qualifiers.region(my()):children[0].qualifierRegion;
 const child=children.find(c=>c.qualifierRegion===region),view=neonDisplayEvent(child),a=view.a;
 const isLarge=child.formatKey6==='qualifier16',groups=isLarge&&qualifierRegionStage4!=='playoffs';
 // Build an unplayed GSL playoff projection; never advance the real bracket.
 const playoff=isLarge&&!a.schedule.some(n=>isPlayoffV1(n))?playoffPreviewV1('qualifier16'):a;
 const graph=groups?neonGroupStage(a,view.f,false):neonPlayoffGraph(playoff,playoff.schedule.filter(n=>!n.groupMatch),false,'ПЛЕЙ-ОФФ · '+region+' · BO3');
 const picker='<div class="qualifier-region-picker4" role="group" aria-label="Регион квалификации">'+children.map(c=>'<button data-region="'+c.qualifierRegion+'" aria-pressed="'+(c===child)+'" class="'+(c===child?'primary':'')+'" onclick="chooseQualifierRegion4(\''+c.qualifierRegion+'\')">'+esc(c.qualifierRegion)+' · '+c.quota+' инв.</button>').join('')+'</div>';
 const cards='<div class="qualifier-regions">'+children.map(c=>'<article class="panel '+(c===child?'qualifier-region-selected4':'')+'"><span class="eyebrow">'+esc(c.qualifierRegion)+' · '+(c.done?'Завершён':S.active?.event===c.id?'Идёт сейчас':'Региональный турнир')+'</span><h2>'+esc(c.name)+'</h2><p>'+c.entrants.length+' клубов · BO3 · '+eventDates(c)+'</p><p class="green">Квота: '+c.quota+' · Трофей: инвайт на '+esc(e.name)+'</p><small>Призовой фонд '+cash(c.pool)+'</small>'+btn('Сетка турнира →','showBracket('+c.id+')',true)+'</article>').join('')+'</div>';
 const preview='<section class="panel qualifier-region-preview4" data-preview-region="'+region+'"><h2>'+esc(region)+' · '+(child.done?'Результаты отбора':'Сетка отбора')+'</h2><p>Мест на основном турнире: '+child.quota+'. '+(child.done?'Инвайты: '+child.inviteWinners.map(id=>esc(S.teams[id].name)).join(', '):'Все серии BO3. Просмотр не запускает симуляцию.')+'</p>'+
 (isLarge?'<div class="qualifier-stage-tabs4" role="group" aria-label="Стадия выбранного региона">'+btn('Групповой этап',"qualifierRegionStage4='groups';render()",groups)+btn('Плей-офф',"qualifierRegionStage4='playoffs';render()",!groups)+'</div>':'')+
 graph+btn('Открыть полную сетку →','showBracket('+child.id+')',true)+'</section>';
 return picker+preview+cards;
}
qualifiersView=function(){
 const e=qualifierParent();if(!e)return QualifierUI4Legacy.view();
 if(!qualifierTabs4.some(([key])=>key===qualifierTab))qualifierTab='invitations';
 const q=e.qualification,warning=q.status==='blocked'?'<section class="panel qualifier-warning4" role="status"><h2>Квалификация требует внимания</h2><p>'+esc(q.reason||'Проверьте календарь турнира.')+'</p></section>':'';
 const body=qualifierTab==='invitations'?qualifierInvitations4(e):qualifierTab==='regions'?qualifierRegions4(e):qualifierCard(e)+'<section class="panel"><h2>Правила пути</h2><p>Прямой инвайт освобождает от квалификации. В региональном турнире нужно занять место не ниже квоты. Трофей — приглашение на конкретный основной турнир.</p><p>Все серии BO3. Усталость '+QUALIFIERS.regional.seriesFatigue+' п.п. за целую серию до эффекта восстановления.</p></section>'+operatorPanel3b(e);
 return head('ПУТЬ НА ТУРНИР','Квалификации','Приглашения, региональные турниры и награды клуба.')+qualifierControls4(qualifierParents(),e)+'<div id="qualifier-content4">'+warning+body+'</div>';
};
function nearestQualifier4(){
 const active=S.events.find(e=>e.id===S.active?.event),parent=Qualifiers.isRegional(active)?S.events.find(e=>e.id===active.qualifierFor):active;
 return parent?.qualification&&Qualifiers.supports(parent)?parent:qualifierParents().find(e=>!e.done);
}
// homeBeforeScene already includes the complete neon/TI/base-home chain.
// Replace only the old scene prefix, which used the inspection selection.
home=function(){const e=nearestQualifier4();return (e?qualifierCard(e):'')+homeBeforeScene();};
bracketView=function(){
 const html=QualifierUI4Legacy.bracket(),child=S.events.find(e=>e.id===(selectedBracket??S.active?.event));
 if(!Qualifiers.isRegional(child))return html;
 return '<nav class="qualifier-back4" aria-label="Путь квалификации">'+btn('← Регионы и квоты',"selectedQualifierRegion4='"+child.qualifierRegion+"';openQualifiers("+child.qualifierFor+",'regions')")+'</nav>'+html;
};
render=function(){QualifierUI4Legacy.render();if(page==='qualifiers')fitNeonBracket();};
