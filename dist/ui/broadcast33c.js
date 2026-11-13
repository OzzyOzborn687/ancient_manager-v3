'use strict';
// Arena 3.3 C: presentation and read-only projections. No simulation coefficients.
const Arena33C={tab:'overview',squadMode:'cards',compareBase:null,compareCandidate:null,
 number:n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(Number.isFinite(n)?n:0),
 signed(n){return (n>0?'+':'')+this.number(n);},
 tabs:{overview:'Обзор',teams:'Команды',map:'Карта',draft:'Драфт',events:'События'},
 metric(label,value,note=''){return '<div class="c-metric"><span>'+esc(label)+'</span><strong>'+esc(String(value))+'</strong><small>'+esc(note)+'</small></div>';},
 ribbon(label,right=''){return '<div class="c-ribbon"><span><i></i>'+esc(label)+'</span><small>'+esc(right)+'</small></div>';}
};
function setArenaTab33C(key){if(!Object.hasOwn(Arena33C.tabs,key))return;Arena33C.tab=key;render();}
function setSquadMode33C(mode){if(!['cards','table'].includes(mode))return;Arena33C.squadMode=mode;render();}
function readiness33C(){const ps=roster();return {ovr:avg(ps.map(p=>p.skill)),sin:amSynergy(ps).score,form:avg(ps.map(p=>p.form)),energy:avg(ps.map(p=>100-p.fatigue)),morale:avg(ps.map(p=>p.morale))};}
function alerts33C(){
 const rows=[],ps=roster(),tired=ps.filter(p=>p.fatigue>=40),contracts=owned().filter(p=>p.contract<=30&&!p.retired);
 if(tired.length)rows.push({text:'Нужен отдых: '+tired.map(p=>p.name).join(', '),action:"go('tactics')",label:'Восстановление',kind:'warning'});
 if(contracts.length)rows.push({text:'Контракт до 30 дней: '+contracts.map(p=>p.name).join(', '),action:"go('squad')",label:'Контракты',kind:'warning'});
 const next=nextEvent();if(next&&next.day-S.day<=7&&!S.active)rows.push({text:next.day<=S.day?'Турнир готов к старту':'До '+next.name+' — '+(next.day-S.day)+' дн.',action:"go('calendar')",label:'Календарь',kind:'info'});
 const invite=S.events.filter(e=>e.done&&e.inviteWinners?.includes(S.club)&&S.day-(e.completedDay20??e.day)<=7).at(-1);
 if(invite)rows.push({text:'Приглашение завоёвано: '+(S.events.find(e=>e.id===invite.qualifierFor)?.name||invite.name),action:"go('qualifiers')",label:'Мой путь',kind:'good'});
 if(S.active)rows.push({text:'Текущая серия: '+S.active.score.join(' : ')+(S.active.live?' · карта на '+clock4(S.active.live.clock):''),action:"go('match')",label:'К матчу',kind:'info'});
 if(!rows.length)rows.push({text:'Срочных кадровых вопросов нет. Проверь план подготовки к следующему турниру.',action:"go('tactics')",label:'План команды',kind:'good'});
 return rows;
}
home=function(){
 const A=Arena33C,r=readiness33C(),a=S.active,e=S.events.find(e=>e.id===a?.event)||nextEvent(),opp=a&&S.teams[a.opponent],d=development21();
 const news=gameplayNewsNeon(),recent=S.history.slice(0,5),ti=currentTI?.(),tiSoon=ti&&ti.day-S.day<=30;
 return '<div class="c-home">'+A.ribbon('CLUB OPERATIONS / '+my().short,date(S.day))+
 '<section class="c-next panel"><div class="c-next-copy"><span class="eyebrow">'+(a?'СЕРИЯ В ПРОЦЕССЕ':'БЛИЖАЙШИЙ ВЫЗОВ')+'</span><h1>'+esc(e?.name||'Новый сезон')+'</h1><p>'+esc(a?.stage||'Подготовка к турниру')+' · '+(e?date(e.day):'Календарь обновляется')+'</p><div class="c-matchup">'+clubAvatar12(my(),true)+'<strong>'+esc(my().short)+'</strong><b>'+(a?a.score.join(' : '):'VS')+'</b>'+(opp?clubAvatar12(opp,true):'<span class="c-unknown">?</span>')+'<strong>'+esc(opp?.short||'Жеребьёвка')+'</strong></div><div class="actions">'+btn(a?'Открыть матч →':e?.day<=S.day?'Начать турнир →':'Подготовить команду →',a?"go('match')":e?.day<=S.day?'startEvent()':"go('tactics')",true)+btn('Календарь',"go('calendar')")+(!a&&e?.day>S.day?btn('Следующий день','advance()'):'')+'</div></div><div class="c-next-stamp"><span>SEASON '+circuitYear(S.day)+'</span><strong>'+S.wins+'<i> / </i>'+S.losses+'</strong><small>ПОБЕДЫ / ПОРАЖЕНИЯ СЕРИЙ</small><div class="c-form-strip">'+(recent.length?recent.map(h=>'<b class="'+(h.draw?'neutral':h.win?'positive':'negative')+'" title="'+esc(h.event+' · '+h.opponent)+'">'+(h.draw?'D':h.win?'W':'L')+'</b>').join(''):'<span>Первая серия впереди</span>')+'</div></div></section>'+
 '<div class="c-readiness">'+A.metric('OVR',A.number(r.ovr),'Уровень пятёрки')+A.metric('SIN',A.number(r.sin),'Сыгранность')+A.metric('Форма',A.number(r.form),'Текущее состояние')+A.metric('Энергия',A.number(r.energy)+'%','Готовность к нагрузке')+A.metric('Подготовка',A.number(d.preparation)+'%','К следующему турниру')+A.metric('Бюджет',cash(S.budget),'Средства клуба')+'</div>'+
 (qualifierParent()&&qualifierParent().qualification.status!=='pending'?qualifierCard(qualifierParent()):'')+'<div class="c-home-grid"><section class="panel"><h2>Требует внимания</h2><div class="c-alerts">'+alerts33C().map(row=>'<div class="c-alert '+row.kind+'"><span>'+esc(row.text)+'</span>'+btn(row.label,row.action)+'</div>').join('')+'</div><h3>Пятёрка на сервер</h3><div class="c-lineup">'+roster().map(p=>'<button onclick="profile('+p.id+')">'+portrait20(p)+'<b>'+esc(p.name)+'</b><small>'+esc(ROLES[p.role])+'</small><strong>'+A.number(p.skill)+'</strong></button>').join('')+'</div></section><section class="panel c-news"><h2>Лента клуба</h2>'+news.slice(0,4).map(n=>'<div class="news"><small>'+date(n.day)+'</small><p>'+esc(n.text)+'</p></div>').join('')+'</section></div>'+
 '<section class="panel"><div class="section-head"><h2>Маршрут сезона</h2>'+btn('Квалификации',"go('qualifiers')")+'</div>'+scheduleRail21(e)+'</section>'+
 '<details class="c-tournament"><summary>Таблица и посев · '+esc(e?.name||'Текущий турнир')+'</summary>'+overviewGroups21(e)+'</details>'+
 (ti?'<section class="panel c-ti '+(tiSoon?'c-ti-soon':'')+'"><div><span class="eyebrow">THE INTERNATIONAL · '+(ti.day>S.day?'ДО СТАРТА '+(ti.day-S.day)+' ДН.':'СОБЫТИЕ КАРЬЕРЫ')+'</span><h2>Дорога к Aegis</h2><p>'+date(ti.day)+' · '+cash(ti.pool)+'</p></div>'+btn('Войти на арену','openTIHub()',false)+'</section>':'')+'</div>';
};
function playerCard33C(p){
 const rating=p.amRating,change=(rating?.recent||[]).filter(x=>x[0]>=S.day-30).reduce((n,x)=>n+x[1],0),A=Arena33C;
 return '<article class="panel c-player arena-player-card"><div class="c-player-id">'+portrait20(p)+'<span class="c-role">POS '+(p.role+1)+'</span></div><span class="eyebrow">'+esc(ROLES[p.role])+'</span><h3>'+playerLink20(p)+'</h3><div class="c-player-ovr"><strong>'+A.number(p.skill)+'</strong><small>OVR <span class="'+(change<0?'negative':change>0?'positive':'neutral')+'">'+A.signed(change)+' / 30 дн.</span></small></div><div class="c-player-vitals">'+[['Форма',p.form],['Энергия',100-p.fatigue],['Мораль',p.morale]].map(([label,value])=>'<div><span>'+label+'</span><b>'+A.number(value)+(label==='Энергия'?'%':'')+'</b><i style="--value:'+clamp(value)+'%"></i></div>').join('')+'</div><details><summary>Характеристики и контракт</summary>'+AM_RATING_LABELS.map((label,i)=>'<p>'+label+' <b>'+A.number(rating?.values[i]??p.skill)+'</b></p>').join('')+'<p>'+p.contract+' дн. · '+cash(p.salary)+'/нед.</p></details><div class="actions">'+btn('Профиль','profile('+p.id+')')+btn('Сравнить','openCompare33C('+p.id+')')+'</div></article>';
}
squad=function(){
 const ps=roster(),reserve=owned().filter(p=>!p.active&&!p.retired),A=Arena33C;
 return A.ribbon('ROSTER / ОСНОВНАЯ ПЯТЁРКА',my().name)+amTeamCard(my())+'<div class="c-squad-tools"><p>Выбери игрока для управления контрактом или сравнения кандидатов.</p><div class="actions" role="group" aria-label="Вид состава">'+['cards','table'].map((mode,i)=>'<button aria-pressed="'+(A.squadMode===mode)+'" onclick="setSquadMode33C(\''+mode+'\')">'+['Карточки','Таблица'][i]+'</button>').join('')+'</div></div>'+(A.squadMode==='cards'?'<section class="c-five" aria-label="Карточки игроков">'+ps.map(playerCard33C).join('')+'</section>':'<section class="panel neon-squad">'+neonSquadTable(ps)+'</section>')+'<section class="panel"><h2>Скамейка запасных · '+reserve.length+'/3</h2>'+(reserve.length?'<div class="c-five">'+reserve.map(playerCard33C).join('')+'</div>':'<div class="c-empty">Резерв свободен. Сравни кандидатов с основой перед предложением контракта. '+btn('Трансферный рынок',"go('market')")+'</div>')+'</section><details><summary>Архив · завершили карьеру</summary>'+S.players.filter(p=>p.retired&&p.retiredFromTeam===S.club).map(p=>btn(p.name,'profile('+p.id+')')).join('')+'</details>';
};
function openCompare33C(id){
 const candidate=S.players[id];if(!candidate)return;
 const base=roster().find(p=>p.role===candidate.role);if(!base){toast('В основе нет игрока этой позиции.');return;}
 Arena33C.compareBase=base.id;Arena33C.compareCandidate=candidate.id===base.id?(S.players.find(p=>!p.retired&&p.role===base.role&&p.id!==base.id)?.id??base.id):candidate.id;
 showCompare33C();
}
function chooseCompare33C(id){const p=S.players[+id],b=S.players[Arena33C.compareBase];if(p&&!p.retired&&p.role===b?.role){Arena33C.compareCandidate=p.id;showCompare33C();}}
function comparison33C(){
 const A=Arena33C,b=S.players[A.compareBase],p=S.players[A.compareCandidate];if(!b||!p)return '';
 const original=roster(),current=amSynergy(original),after=original.map(q=>q.id===b.id?p:q),future=amSynergy(after);
 return '<div class="c-comparison"><span class="eyebrow">SCOUTING / '+esc(ROLES[b.role])+'</span><h2>Сравнение игроков</h2><label>Кандидат <select aria-label="Кандидат для сравнения" onchange="chooseCompare33C(this.value)">'+S.players.filter(q=>q.role===b.role&&!q.retired).sort((a,b)=>b.skill-a.skill).map(q=>'<option value="'+q.id+'" '+(q.id===p.id?'selected':'')+'>'+esc(q.name)+' · '+esc(S.teams[q.team]?.short||'Свободный агент')+'</option>').join('')+'</select></label><div class="c-compare-head">'+[b,p].map(q=>'<div>'+portrait20(q)+'<h3>'+esc(q.name)+'</h3><b>'+A.number(q.skill)+' OVR</b><p>'+cash(value(q))+' · '+cash(q.salary)+'/нед.</p><small>Контракт: '+q.contract+' дн.</small></div>').join('')+'</div><div class="table-wrap"><table><thead><tr><th>Показатель</th><th>'+esc(b.name)+'</th><th>'+esc(p.name)+'</th><th>Разница</th></tr></thead><tbody>'+[...AM_RATING_LABELS.map((label,i)=>[label,b.amRating?.values[i]??b.skill,p.amRating?.values[i]??p.skill]),['Форма',b.form,p.form],['Энергия',100-b.fatigue,100-p.fatigue],['Мораль',b.morale,p.morale]].map(([label,x,y])=>'<tr><th>'+label+'</th><td>'+A.number(x)+'</td><td>'+A.number(y)+'</td><td class="'+(y<x?'negative':'positive')+'">'+A.signed(y-x)+'</td></tr>').join('')+'</tbody></table></div><div class="c-readiness">'+A.metric('OVR команды',A.number(avg(after.map(p=>p.skill))),A.signed((p.skill-b.skill)/5)+' к текущему')+A.metric('SIN состава',A.number(future.score),A.signed(future.score-current.score)+' при замене')+'</div><p class="sub">Предпросмотр состава на текущую дату. Подписание и замена не выполняются; будущие совместные карты здесь не предполагаются.</p><div class="actions">'+btn('Закрыть','closeModal()',true)+'</div></div>';
}
function showCompare33C(){openModal(comparison33C());}
const playerViewBefore33C=playerView20;
playerView20=function(...args){const p=S.players[selectedPlayer20];return playerViewBefore33C(...args)+(p&&!p.retired?'<section class="panel c-scout-action"><h2>Скаутинг и замена</h2>'+btn('Сравнить с игроком основы','openCompare33C('+p.id+')',true)+'</section>':'');};
const marketBefore33C=market;
market=function(...args){return '<section class="panel"><div class="section-head"><h2>Скаутинг по позиции</h2><div class="actions">'+roster().map(p=>btn('Сравнить · '+ROLES[p.role],'openCompare33C('+p.id+')')).join('')+'</div></div></section>'+marketBefore33C(...args);};
// Accessible portrait fallback remains visible even if external images fail.
portrait20=function(p,large=false){const src=photo20(p);return '<span class="portrait20 c-portrait '+(large?'portrait-large20':'')+'"><span class="c-initials" aria-hidden="true">'+esc(p.name.slice(0,2).toUpperCase())+'</span>'+(src?'<img src="'+esc(src)+'" alt="'+esc(p.name)+'" '+(large?'':'loading="lazy"')+' referrerpolicy="no-referrer" onerror="this.hidden=true">':'')+'</span>';};
const playerTableBefore33C=neonSquadTable;
neonSquadTable=function(players){return '<div class="table-wrap"><table><thead><tr><th>Игрок</th><th>Позиция</th><th>OVR</th><th>Форма</th><th>Энергия</th><th>Мораль</th><th></th></tr></thead><tbody>'+players.map(p=>'<tr><td><span class="player-cell20">'+portrait20(p)+playerLink20(p)+'</span></td><td>'+ROLES[p.role]+'</td><td>'+Arena33C.number(p.skill)+'</td><td>'+Arena33C.number(p.form)+'</td><td>'+Arena33C.number(100-p.fatigue)+'%</td><td>'+Arena33C.number(p.morale)+'</td><td>'+btn('Сравнить','openCompare33C('+p.id+')')+'</td></tr>').join('')+'</tbody></table></div>';};
const calendarBefore33C=calendar;
calendar=function(...args){return calendarBefore33C(...args).replace(/<section class="panel"><h2>Ритм реального сезона<\/h2>([\s\S]*?)<\/section>/,'<details class="panel c-source-details"><summary>Источники и правила календаря</summary>$1</details>').replace(/<small>(Прототип [\s\S]*?)<\/small>/g,'<details class="c-calendar-source"><summary>Происхождение расписания</summary><small>$1</small></details>');};
const tacticsBefore33C=tactics;
tactics=function(...args){const html=tacticsBefore33C(...args),available=trainingAvailable33();if(!available)return html;const before=roster(),after=trainingPreview33(),gain=avg(after.map(p=>p.form))-avg(before.map(p=>p.form));return html.replace('<div class="training-actions33">','<div class="notice c-training-note"><b>Что изменится за день</b><p>'+esc(trainingModes33[S.training])+' · '+esc(trainingFocuses33[trainingFocus33()])+'. Форма '+Arena33C.signed(gain)+'. Прогноз учитывает текущее состояние и индивидуальные фокусы игроков. Малый дневной прирост может не менять округлённый OVR.</p></div><div class="training-actions33">');};
const renderBefore33C=render;
render=function(...args){
 const result=renderBefore33C(...args);if(!S)return result;
 $('mobileNav33c').innerHTML=[['home','Главная','◈'],['squad','Команда','♙'],['match','Матч','▷'],['menu21','Ещё','☰']].map(([key,label,icon])=>'<button aria-current="'+(page===key?'page':'false')+'" onclick="go(\''+key+'\')"><span aria-hidden="true">'+icon+'</span>'+label+'</button>').join('');
 $('broadcastStatus33c').innerHTML='<span class="c-status-dot"></span><b>'+esc(my().short)+'</b><span>'+date(S.day)+'</span><span>'+esc(S.active?'Серия '+S.active.score.join(' : '):'Подготовка к турниру')+'</span><strong>3.3 C / ARENA</strong>';
 return result;
};

const teamCardBefore33C=amTeamCard;
amTeamCard=function(team){
 const html=teamCardBefore33C(team),last=S.active?.maps?.at(-1)||S.history[0]?.maps?.at(-1),rows=last?.report13?.broadcast33c?.synergy;
 const ids=roster(team).map(p=>p.id).sort((a,b)=>a-b),row=rows?.find(r=>r.team===team.id&&JSON.stringify(r.ids)===JSON.stringify(ids));
 return html.replace('</section>','<details class="c-sin-help"><summary>Как считается SIN'+(row&&row.before!=null&&row.after!=null?' · после последней карты '+Arena33C.signed(row.after-row.before):'')+'</summary><p>Сыгранность складывается из общения, опыта пар и совместных карт этой пятёрки. Замена игрока сохраняет опыт оставшихся пар, но меняет историю полного состава. Показатель не равен сумме OVR.</p></details></section>');
};

function arenaTabKey33C(event){
 const keys=Object.keys(Arena33C.tabs),i=keys.indexOf(Arena33C.tab);
 const next=event.key==='ArrowRight'?keys[(i+1)%keys.length]:event.key==='ArrowLeft'?keys[(i+keys.length-1)%keys.length]:event.key==='Home'?keys[0]:event.key==='End'?keys.at(-1):null;
 if(!next)return;event.preventDefault();setArenaTab33C(next);document.getElementById('c-tab-'+next)?.focus();
}
