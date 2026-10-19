'use strict';
// Historical main-event calendar. Source years are templates, not 2026/27 announcements.
const HISTORY_SOURCES21={tier1:'https://liquipedia.net/dota2/Tier_1_Tournaments',tier2:'https://liquipedia.net/dota2/Tier_2_Tournaments',esl:'https://pro.eslgaming.com/tour/2023/11/ept-dota-2024-event-overview/',pgl:'https://liquipedia.net/dota2/PGL',fissure:'https://liquipedia.net/dota2/FISSURE',blast:'https://liquipedia.net/dota2/BLAST'};
// title, month/day start/end, pool, venue, source family, historical edition.
const SEASONS21={2024:[
 ['BetBoom Dacha Dubai','02-04','02-16',1000000,'Дубай','tier1'],
 ['Games of the Future','02-19','02-24',1000000,'Казань','tier2'],
 ['DreamLeague','02-25','03-10',1000000,'Онлайн','esl',22],
 ['1win Series Spring','03-16','03-19',100000,'Онлайн','tier2'],
 ['Elite League','03-31','04-14',960000,'Онлайн','tier1',1],
 ['ESL One Birmingham','04-22','04-28',1000000,'Бирмингем','esl'],
 ['PGL Wallachia','05-10','05-19',1000000,'Бухарест','pgl',1],
 ['DreamLeague','05-20','05-26',1000000,'Онлайн','esl',23],
 ['FISSURE Universe','05-27','05-30',80000,'Онлайн','fissure',2],
 ['1win Series Summer','06-27','06-30',100000,'Онлайн','tier2'],
 ['Riyadh Masters','07-04','07-21',5000000,'Эр-Рияд','tier1'],
 ['Elite League','07-25','08-04',800000,'Лима','tier2',2],
 ['Clavision: Snow Ruyi','07-28','08-04',500000,'Чжанцзякоу','tier1'],
 ['FISSURE Universe','08-21','08-25',135000,'Онлайн','fissure',3],
 ['The International','09-04','09-15',2776566,'Копенгаген','pgl'],
 ['PGL Wallachia','10-04','10-13',1000000,'Бухарест','pgl',2],
 ['BetBoom Dacha Belgrade','10-19','10-26',1000000,'Белград','fissure'],
 ['DreamLeague','10-27','11-10',1000000,'Онлайн','esl',24],
 ['1win Series Fall','11-19','11-22',100000,'Онлайн','tier2'],
 ['BLAST Slam','11-26','12-01',1000000,'Копенгаген','blast',1],
 ['ESL One Bangkok','12-09','12-15',1000000,'Бангкок','esl']
],2025:[
 ['FISSURE Playground','01-24','02-02',1000000,'Белград','fissure',1],
 ['BLAST Slam','02-04','02-09',1000000,'Копенгаген','blast',2],
 ['DreamLeague','02-16','03-04',1000000,'Онлайн','tier1',25],
 ['PGL Wallachia','03-08','03-16',1000000,'Бухарест','pgl',3],
 ['FISSURE Universe','03-22','03-30',500000,'Онлайн','fissure',4],
 ['FISSURE Special','04-05','04-13',70000,'Онлайн','fissure'],
 ['ESL One Raleigh','04-07','04-13',1000000,'Роли','tier1'],
 ['PGL Wallachia','04-19','04-27',1000000,'Бухарест','pgl',4],
 ['BLAST Slam','05-06','05-11',1000000,'Копенгаген','blast',3],
 ['Asian Champions League','05-16','05-16',150000,'Шанхай','tier2'],
 ['DreamLeague','05-19','06-01',1000000,'Онлайн','tier1',26],
 ['PGL Wallachia','06-21','06-29',1000000,'Бухарест','pgl',5],
 ['FISSURE Universe','07-01','07-04',250000,'Онлайн','fissure',5],
 ['Esports World Cup','07-08','07-19',3000000,'Эр-Рияд','tier1'],
 ['Clavision Masters: Snow Ruyi','07-28','08-03',700000,'Чжанцзякоу','tier1'],
 ['FISSURE Universe','08-19','08-24',250000,'Онлайн','fissure',6],
 ['The International','09-04','09-14',2881791,'Гамбург','pgl'],
 ['FISSURE Universe','10-05','10-12',250000,'Онлайн','fissure',7],
 ['BLAST Slam','10-14','11-09',1000000,'Онлайн / Сингапур','blast',4],
 ['FISSURE Playground','10-23','11-02',1000000,'Белград','fissure',2],
 ['PGL Wallachia','11-15','11-23',1000000,'Бухарест','pgl',6],
 ['BLAST Slam','11-25','12-07',1000000,'Онлайн / Чэнду','blast',5],
 ['DreamLeague','12-10','12-21',1000000,'Онлайн','tier1',27]
]};
const SERIES_EXTRA21=['BETBOOM DACHA','ELITE LEAGUE','RIYADH MASTERS','ESPORTS WORLD CUP','CLAVISION','1WIN SERIES','ASIAN CHAMPIONS LEAGUE','GAMES OF THE FUTURE'];
function sourceYear21(year){return (year-2026)%2===0?2024:2025;}
function dayFrom21(year,md){let [month,day]=md.split('-').map(Number);return Math.round((Date.UTC(year,month-1,day)-BASE_DATE_V1)/86400000);}
function historicalSeason21(year){let sourceYear=sourceYear21(year),cycle=Math.floor((year-2026)/2);return SEASONS21[sourceYear].map((row,index)=>{
 let [title,start,end,pool,venue,source,edition]=row,name=title,series=title.toUpperCase();
 if(title==='DreamLeague'){edition+=6+cycle*6;name='DreamLeague Season '+edition;series='DREAMLEAGUE';}
 else if(title==='PGL Wallachia'){edition+=6+cycle*6;name='PGL Wallachia Season '+edition;series='PGL WALLACHIA';}
 else if(title==='BLAST Slam'){edition+=5+cycle*5;name='BLAST Slam '+circuitRoman(edition);series='BLAST SLAM';}
 else if(title==='FISSURE Universe'){edition+=6+cycle*6;name='FISSURE Universe: Episode '+edition;series='FISSURE';}
 else if(title==='FISSURE Playground'){edition+=2+cycle*2;name='FISSURE Playground '+edition;series='FISSURE';}
 else if(title==='Elite League'){edition+=2+cycle*2;name='Elite League Season '+edition;series='ELITE LEAGUE';}
 else{name=title+' '+year;if(title.startsWith('ESL One'))series='ESL ONE';else if(title.startsWith('FISSURE'))series='FISSURE';else if(title.startsWith('1win'))series='1WIN SERIES';else if(title.startsWith('BetBoom'))series='BETBOOM DACHA';else if(title.startsWith('Clavision'))series='CLAVISION';}
 if(title==='The International'){name='THE INTERNATIONAL '+year;series='THE INTERNATIONAL';if(year===2027)pool=30000000;}
 let day=dayFrom21(year,start),last=dayFrom21(year,end);return {name,series,season:edition,day,duration:last-day+1,pool,venue,real:false,modeled:true,baselineKey21:'history-'+year+'-'+index,plannedDay21:day,plannedDuration21:last-day+1,sourceYear21:sourceYear,sourceName21:title+(row[6]?' '+row[6]:''),sourceStart21:sourceYear+'-'+start,sourceEnd21:sourceYear+'-'+end,sourcePool21:row[3],url:HISTORY_SOURCES21[source]};
 });}
// Keep played and active IDs unchanged. Only pending calendar entries are replaced once.
ensureTournamentCalendar=function(){if(!S?.events)return;
 if(S.calendar21?.version!==21){let keep=S.events.filter(e=>e.done||e.id===S.active?.event);S.calendar21={version:21,installedDay:S.day,initialDay:S.day};S.events=keep;}
 let nextId=Math.max(-1,...S.events.map(e=>e.id))+1,first=circuitYear(S.day),last=circuitYear(S.day+730);
 for(let year=first;year<=last;year++)for(let e of historicalSeason21(year)){
  if(e.day<S.calendar21.installedDay||S.events.some(v=>v.baselineKey21===e.baselineKey21))continue;
  if(S.events.some(v=>(v.done||v.id===S.active?.event)&&circuitSeries(v)===e.series&&Math.abs(v.day-e.day)<12))continue;
  S.events.push({...e,id:nextId++});
 }
 S.events.sort((a,b)=>a.day-b.day||a.id-b.id);S.calendarVersion=21;
};
// Historical dates remain immutable. Only overdue career participation moves forward.
finishCalendar13=function(e){let until=Math.max(S.day,e.day+(e.duration||1)-1);while(S.day<until)tick();e.completedDay20=until;
 for(let other of S.events.filter(x=>!x.done&&x.id!==e.id&&x.day<=until)){other.originalDay13??=other.day;other.day=until+1;}
 ensureTournamentCalendar();
};
eventDates=function(e){return date(e.day)+' — '+date(e.day+(e.duration||1)-1)+(e.plannedDay21!=null&&e.day!==e.plannedDay21?' · перенос в карьере':'');};
function calendarStatus21(e){return e?.done?'Завершён':e?.id===S.active?.event?'Идёт сейчас':'Предстоит';}
calendar=function(){ensureTournamentCalendar();let year=calendarYear==='all'?circuitYear(S.day):+calendarYear,first=circuitYear(S.calendar21.initialDay),years=Array.from({length:Math.max(3,circuitYear(S.day)-first+3)},(_,i)=>first+i),list=S.events.filter(e=>circuitYear(e.plannedDay21??e.day)===year&&(calendarSeries==='all'||circuitSeries(e)===calendarSeries)),next=nextEvent();return head('СЕЗОН '+year,'Календарь игр','Основа сезона: реальный календарь '+sourceYear21(year)+' года.')+`<div class="filters"><select aria-label="Год турнира" onchange="calendarYear=this.value;render()">${years.map(y=>`<option value="${y}" ${y===year?'selected':''}>${y} ← ${sourceYear21(y)}</option>`).join('')}</select><select aria-label="Серия турниров" onchange="calendarSeries=this.value;render()"><option value="all">Все турниры</option>${[...CIRCUIT_SERIES,...SERIES_EXTRA21].map(s=>`<option value="${s}" ${calendarSeries===s?'selected':''}>${s}</option>`).join('')}</select></div><section class="panel"><h2>Ритм реального сезона</h2><p>2024 → 2026, 2025 → 2027. Далее шаблоны чередуются. Месяцы, паузы, длительность и набор турниров взяты из исторических сезонов; игровые номера серий продолжаются. Форматы матчей адаптированы к симулятору.</p><p class="sub">При пересечении турниров участие в следующем переносится до завершения текущего. Исходная дата остаётся в карточке. Сыгранные результаты и активный турнир сохранены. TI 2027: игровой фонд $30 млн.</p></section><div class="calendar-list21">${list.map(e=>`<article class="panel calendar-event21"><div class="calendar-date21"><b>${new Date(BASE_DATE_V1+e.day*86400000).getUTCDate()}</b><span>${new Date(BASE_DATE_V1+e.day*86400000).toLocaleDateString('ru-RU',{month:'short',timeZone:'UTC'})}</span></div><div><span class="eyebrow">${calendarStatus21(e)}</span><h2>${esc(e.name)}</h2><p>${eventDates(e)} · ${cash(e.pool)} · ${esc(e.venue||'')}</p>${e.sourceYear21?`<small>Прототип ${e.sourceYear21}: ${esc(e.sourceName21)} · ${e.sourceStart21.slice(5)} — ${e.sourceEnd21.slice(5)}${e.day!==e.plannedDay21?' · исходная игровая дата '+date(e.plannedDay21):''}</small>`:''}</div><div class="actions">${e.done?e.champion!=null?btn('Результаты',`showBracket(${e.id})`):'<span class="sub">Архив карьеры</span>':e.id===S.active?.event?btn('Матч-центр',"go('match')",true):e.id===next?.id?btn(e.day<=S.day?'Начать турнир':'До турнира',e.day<=S.day?'startEvent()':'skip()',true):'<span class="sub">По расписанию</span>'}${e.url?`<a href="${esc(e.url)}" target="_blank" rel="noopener">Источник ↗</a>`:''}</div></article>`).join('')||'<section class="panel empty">Нет предстоящих турниров по этому фильтру.</section>'}</div><details class="panel historical-preview21"><summary>Полный план сезона ${year}</summary><p class="sub">События до начала твоей карьеры приведены для просмотра; результаты для них не выдумываются.</p>${historicalSeason21(year).map(e=>`<div class="news"><b>${esc(e.name)}</b> · ${date(e.plannedDay21)} — ${date(e.plannedDay21+e.plannedDuration21-1)}</div>`).join('')}</details>`;};
