'use strict';
// Future editions are fictional career events, not claims about official schedules.
const CIRCUIT_SERIES=['PGL WALLACHIA','BLAST SLAM','DREAMLEAGUE','THE INTERNATIONAL','ESL ONE','FISSURE'];
const CIRCUIT_SLOTS=[
  [0,12,0,1000000,10,'Бухарест'],[1,2,2,1000000,12,'Онлайн'],
  [1,23,1,1000000,10,'Копенгаген'],[2,16,5,1000000,10,'Белград'],
  [3,6,4,1000000,10,'Европа'],[3,27,0,1000000,10,'Бухарест'],
  [4,18,2,1000000,12,'Онлайн'],[5,8,1,1000000,10,'Сингапур'],
  [5,29,5,1000000,10,'Европа'],[6,20,4,1000000,10,'Азия'],
  [7,10,0,1000000,10,'Бухарест'],[8,7,3,3000000,14,'Город по сценарию'],
  [9,5,5,1000000,10,'Белград'],[9,26,0,1000000,10,'Бухарест'],
  [10,16,1,1000000,10,'Копенгаген'],[11,1,2,1000000,12,'Онлайн'],
  [11,14,4,1000000,10,'Европа']
];
// Anchors: Wallachia S9 (September 2026), BLAST VIII (September–October),
// BLAST IX (November), DreamLeague S30 (December). Later editions are modeled.
function circuitEdition(series,year,edition){
  const anchors={'PGL WALLACHIA':[6,4],'BLAST SLAM':[6,3],'DREAMLEAGUE':[27,3]};
  const a=anchors[series];
  return a?a[0]+(year-2026)*a[1]+edition:null;
}
function circuitRoman(n){const parts=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let result='';for(const [value,label] of parts)while(n>=value){result+=label;n-=value}return result}
function circuitName(series,year,edition){
  const season=circuitEdition(series,year,edition);
  if(series==='PGL WALLACHIA')return `PGL Wallachia Season ${season}`;
  if(series==='BLAST SLAM')return `BLAST Slam ${circuitRoman(season)}`;
  if(series==='DREAMLEAGUE')return `DreamLeague Season ${season}`;
  return series==='THE INTERNATIONAL'?`${series} ${year}`:`${series} ${year} · ${edition}`;
}
function updateCircuitMetadata(){
  for(const e of S.events){
    const key=/^circuit-(\d+)-(\d+)-(\d+)$/.exec(e.calendarKey||'');
    if(key){const [,year,index,edition]=key;const series=CIRCUIT_SERIES[+index];e.name=circuitName(series,+year,+edition);const season=circuitEdition(series,+year,+edition);if(season)e.season=season;}
    const year=key?+key[1]:circuitYear(e.day);
    if(circuitSeries(e)==='THE INTERNATIONAL'&&year===2027)e.pool=30000000;
  }
}
let calendarSeries='all',calendarYear='all';
function circuitSeries(e){return e.series||CIRCUIT_SERIES.find(s=>e.name.toUpperCase().includes(s))||'ДРУГИЕ'}
function circuitYear(day){return new Date(Date.UTC(2026,9,15)+day*86400000).getUTCFullYear()}
function eventDates(e){return e.range||date(e.day)+' — '+date(e.day+(e.duration||10)-1)}
function ensureTournamentCalendar(){
  if(!S?.events)return;
  const horizon=S.day+400,active=S.events.find(e=>e.id===S.active?.event);
  const cutoff=Math.max(S.day,active?.day??-1);
  let nextId=Math.max(-1,...S.events.map(e=>e.id))+1;
  // Keep existing event objects and IDs: brackets, active maps and results refer to them.
  for(let year=circuitYear(cutoff);year<=circuitYear(horizon);year++){
    const counts={};
    for(const [month,day,seriesIndex,pool,duration,venue] of CIRCUIT_SLOTS){
      const series=CIRCUIT_SERIES[seriesIndex],edition=counts[series]=(counts[series]||0)+1;
      const key=`circuit-${year}-${seriesIndex}-${edition}`;
      let start=Math.round((Date.UTC(year,month,day)-Date.UTC(2026,9,15))/86400000);
      if(start<=cutoff||start>horizon||S.events.some(e=>e.calendarKey===key))continue;
      // An existing official or played edition in this slot already fills that series.
      if(S.events.some(e=>circuitSeries(e)===series&&Math.abs(e.day-start)<21))continue;
      for(let i=0;i<100;i++){
        const conflict=S.events.find(e=>!e.done&&start<e.day+(e.duration||10)+3&&start+duration+3>e.day);
        if(!conflict)break;
        start=conflict.day+(conflict.duration||10)+3;
      }
      const name=circuitName(series,year,edition);
      S.events.push({id:nextId++,name,series,calendarKey:key,day:start,pool,duration,venue,real:false,modeled:true});
    }
  }
  S.events.sort((a,b)=>a.day-b.day||a.id-b.id);
  updateCircuitMetadata();
  S.calendarVersion=2;
}
function calendar(){
  ensureTournamentCalendar();
  const years=[...new Set(S.events.map(e=>circuitYear(e.day)))],next=nextEvent();
  const events=S.events.filter(e=>(calendarSeries==='all'||circuitSeries(e)===calendarSeries)&&(calendarYear==='all'||circuitYear(e.day)===+calendarYear));
  return head('МИРОВОЙ ТУР · '+circuitYear(S.day),'Турнирный календарь','Шесть серий, сезон за сезоном. Календарь автоматически продолжается по мере развития карьеры.')+
  `<div class="notice">Новые выпуски серий — <b>модель карьеры</b>: даты, города и призовые придуманы для игры, включая неанонсированные турниры. Ранее добавленные события с источниками сохранены. Для всех турниров используется игровой формат: 16 клубов, 4 группы по 4, затем плей-офф на 8 команд; BO3 и финал BO5. Это не официальные регламенты серий.</div>`+
  `<div class="filters"><select aria-label="Серия турниров" onchange="calendarSeries=this.value;render()"><option value="all">Все серии</option>${[...CIRCUIT_SERIES,'ДРУГИЕ'].map(s=>`<option value="${s}" ${calendarSeries===s?'selected':''}>${s}</option>`).join('')}</select><select aria-label="Год турнира" onchange="calendarYear=this.value;render()"><option value="all">Все годы</option>${years.map(y=>`<option value="${y}" ${String(calendarYear)===String(y)?'selected':''}>${y}</option>`).join('')}</select><span class="sub">Турниров: ${events.length}</span></div>`+
  `<div class="cards">${events.map(e=>`<section class="panel"><div class="section-head"><span class="tag ${e.real?'':'dim'}">${e.modeled?'Смоделированный выпуск':e.real?'Событие с источником':'Игровой турнир'}</span><span class="sub">${e.done?'Завершён':S.active?.event===e.id?'Идёт сейчас':'Впереди'}</span></div><span class="eyebrow">${esc(circuitSeries(e))}</span><h2 style="margin-top:14px">${esc(e.name)}</h2><p>${esc(eventDates(e))}<br>${e.venue?esc(e.venue)+' · ':''}16 команд<br>Фонд${e.modeled?' (игровой)':''}: <b class="green">${cash(e.pool)}</b></p>${e.done?`<p>Твоё место: <b>${e.skippedV12?'Не участвовал':e.notQualified13?'Не прошёл отбор':placeLabel(e.place)}</b><br>Призовые: ${cash(e.reward)}</p>${btn('Сетка турнира',`showBracket(${e.id})`)}`:e.id===next?.id?btn(S.active?'В матч-центр':e.day<=S.day?'Начать турнир':'До турнира · '+(e.day-S.day)+' дн.',S.active?"go('match')":e.day<=S.day?'startEvent()':'skip()',true):'<span class="sub">Откроется после предыдущего турнира</span>'}${S.active?.event===e.id?btn('Сетка турнира',`showBracket(${e.id})`):''}${e.url?`<a class="sub" href="${esc(e.url)}" target="_blank" rel="noopener">Источник расписания ↗</a>`:''}</section>`).join('')||'<section class="panel"><p>В этом году турниров выбранной серии пока нет. Выбери все годы.</p></section>'}</div>`+
  `<div class="panel" style="margin-top:22px"><h2>Рейтинг карьеры</h2><table><thead><tr><th>КЛУБ</th><th>ОЧКИ</th><th>СИЛА</th></tr></thead><tbody>${[...S.teams].sort((a,b)=>b.points-a.points).map(t=>`<tr><td>${esc(t.name)}${t.id===S.club?' <span class="green">← твой клуб</span>':''}</td><td>${t.points}</td><td>${Math.round(strength(t))}</td></tr>`).join('')}</tbody></table></div>`;
}
