'use strict';
Match22.commands=function(m){
 const open=m.window22.pending;
 return `<section class="panel decision-panel"><div class="eyebrow">ШТАБ · ${clock4(m.clock)}</div><h2>${esc(open?m.window22.reason:'Команда исполняет текущую тактику')}</h2><p>${stage4(m)} · текущий план: ${esc(ORDERS4[m.lastActions22[0]]?.[0]||'Старт')}. Решения доступны в ключевых окнах и после важных событий.</p><div class="command-grid">${Object.entries(ORDERS4).filter(([k])=>k!=='gg').map(([key,v])=>{
  const a=this.assess(m,0,key),disabled=!!a.reason||!open;
  const price=key==='smoke'||key==='counterSmoke'?'Цена: 1 смоук и минута фарма. ':key==='rosh'?'Цена: фарм, здоровье, слот Аегиса. ':key==='farm'?'Цена: уступаете контроль карты. ':key==='split'?'Цена: возврат '+this.B.map.splitReturn+' с. ':'Цена: минута исполнения, меньше фарма. ';
  return `<button onclick="issueOrder4('${key}')" ${disabled?'disabled':''} title="${esc(a.reason||a.factors.join('; '))}"><b>${esc(v[0])}</b><small>${a.reason?esc(a.reason):'Риск: '+a.risk+'. '+price+esc(a.factors.join('; '))}</small></button>`;
 }).join('')}</div><div class="actions" style="margin-top:14px">${btn(open?'Продолжить по тактике →':'До следующего решения →','advanceMap()',true)}${btn('Укрепление','glyph4()',false,m.sides[0].glyphReady>m.clock)}${btn('Сохранить на паузе',"go('saves')")}${btn('Заколить GG',"issueOrder4('gg')")}</div><h3>Тактика на карте</h3><div class="actions">${Object.entries(this.B.tactics).map(([key,t])=>btn(t.label,`changeMatchTactic22('${key}')`,m.tactics22[0]===key,!open||m.tactics22[0]===key)).join('')}</div><p class="sub">Ранняя / средняя / поздняя сила тактики: ${this.B.tactics[m.tactics22[0]].phase.map(v=>Math.round((v-1)*100)+'%').join(' / ')}. Смена снижает слаженность на ${this.B.tacticDisruption/60} мин.${m.disruption22[0]>m.clock?' Перестройка: ещё '+clock4(m.disruption22[0]-m.clock)+'.':''}</p></section>`;
};
issueOrder4=function(type,redraw=true){
 const m=S.active?.live;if(!m||m.finishedSide!=null)return false;Match22.init(m);
 if(type==='gg'){pauseLive4(false);Match22.finish(m,1,'gg');finishMap();return true;}
 if(!m.window22.pending){if(redraw)toast('Дождитесь следующего окна решений.');return false;}
 const reason=Match22.available(m,0,type);if(reason){if(redraw)toast(reason);return false;}
 const a=Match22.assess(m,0,type);m.pendingAction22=type==='coach'?null:type;
 m.orders[0]={type,until:type==='coach'?0:m.clock+BALANCE22.actions.duration};m.commandAt=m.clock;
 m.decisions.push({minute:m.minute,sec:m.clock,key:type,title:ORDERS4[type][0],risk:a.risk,factors:a.factors,pWin:a.p});
 Match22.event(m,'Приказ: '+ORDERS4[type][0]+'. Оценка: '+a.risk+' риск; '+a.factors.join('; ')+'.','order',{side:0});
 m.window22.pending=false;if(redraw){render();save();}return true;
};
chooseDecision=function(key){if(issueOrder4(key,false))advanceMap()};
function changeMatchTactic22(key){const m=S.active?.live;if(!m||!m.window22.pending)return false;const ok=Match22.changeTactic(m,0,key);if(ok){render();save();}return ok;}
setSpeed4=function(speed){if(!BALANCE22.playback.speeds.includes(speed))return;S.matchSpeed22=speed;if(S.active?.live)S.active.live.speed22=speed;render()};
advanceMap=function(choice=null){
 const m=S.active?.live;if(!m)return;
 if(choice&&!issueOrder4(choice,false))return;
 pauseLive4(false);m.window22.pending=false;
 let ticks=0;
 while(m.finishedSide==null&&!m.window22.pending&&ticks++<BALANCE22.playback.maxMinutes)simulateTick4(m,BALANCE22.tick);
 if(m.finishedSide!=null)finishMap();else render();
};
toggleLive4=function(){
 const m=S.active?.live;if(!m)return;if(liveRunning4){pauseLive4();return;}
 m.window22.pending=false;liveRunning4=true;
 liveTimer4=setInterval(()=>{
  if(page!=='match'||document.hidden||!S.active?.live){pauseLive4(false);return;}
  const map=S.active.live;simulateTick4(map,BALANCE22.playback.gameSeconds*map.speed22);
  if(map.finishedSide!=null){finishMap();return;}
  if(map.window22.pending)pauseLive4(false);render();
 },BALANCE22.playback.realTickMs);render();
};
let skipRunning22=false;
async function skipMatch22(){
 const m=S.active?.live;if(!m||skipRunning22)return;pauseLive4(false);skipRunning22=true;m.window22.pending=false;
 try{
  while(S.active?.live===m&&m.finishedSide==null){
   for(let i=0;i<BALANCE22.playback.skipBatch&&m.finishedSide==null;i++)simulateTick4(m,BALANCE22.tick);
   render();await new Promise(resolve=>setTimeout(resolve,0));
   if(m.clock>BALANCE22.playback.maxMinutes*60)throw Error('Матч не завершился: сохраните карту для проверки баланса.');
  }
  if(S.active?.live===m&&m.finishedSide!=null)finishMap();
 }catch(e){toast(e.message);}finally{skipRunning22=false;render();}
}
const heroTableBase22=heroTable4;
heroTable4=function(m,side){
 const base=heroTableBase22(m,side),players=m.sides?.[side]?.heroes||(side===0?m.players:m.enemyPlayers);
 if(!players||!m.simVersion)return base;
 return base.replace('</section>',`<div class="position-list">${players.map(p=>`<span><b>${esc(p.hero)}</b> · роль ${p.role+1} · TP ${p.tpUntil>m.clock?clock4(p.tpUntil-m.clock):'готов'}${p.hasAegis?' · Аегис':''}<br>${p.items.map(i=>esc(i.name)).join(' · ')||'Нет ключевых предметов'}</span>`).join('')}</div></section>`);
};
const objectivesBase22=objectivesView4;
objectivesView4=function(m){
 if(!m.simVersion)return objectivesBase22(m);
 return objectivesBase22(m)+`<section class="panel"><h2>Вижен и темп</h2><div class="stats">${m.sides.map((s,side)=>stat(Match22.name(m,side),s.vision22.wards+' вардов · '+s.vision22.sentries+' сентри','Карта '+Math.round(s.control*100)+'% · импульс '+m.tempo22.momentum[side].toFixed(2))).join('')}</div><p class="sub">Зоны: верх / мид / низ / лес / Рошан</p>${m.sides.map((s,side)=>`<p>${esc(Match22.name(m,side))}: ${s.vision22.zones.map(n=>Math.round(n*100)+'%').join(' / ')} · инициатива ${m.tempo22.initiator===side?'у команды':'у соперника'}</p>`).join('')}<h3>Бараки: мили / рейндж</h3>${m.sides.map((s,side)=>`<p>${esc(Match22.name(m,side))}: ${s.lanes.map(l=>Math.round(l.melee.hp)+' / '+Math.round(l.ranged.hp)).join(' · ')}</p>`).join('')}<p>Рошан убит ${m.roshan.kills} раз · Аегис ${m.roshan.aegisSide==null?'отсутствует':esc(Match22.name(m,m.roshan.aegisSide))}.</p></section>`;
};
const matchBase22=matchView;
matchView=function(){
 const m=S.active?.live;
 if(!m||S.active?.autoCoach13)return matchBase22().replaceAll('каждые 10 минут','в ключевые моменты').replaceAll('через выбранный отрезок','в ключевые моменты');
 Match22.init(m);
 return coachControls13()+head('MATCH ENGINE / 2.2',my().name+' — '+S.teams[S.active.opponent].name,'Серия '+S.active.score.join(' : ')+' · '+stage4(m))+
 `<section class="panel"><div class="section-head"><h2>${clock4(m.clock)} · ${liveRunning4?'● Матч идёт':'Ⅱ Пауза'}</h2><span class="tag">${esc(BALANCE22.tactics[m.tactics22[0]].label)}</span></div><div class="actions">${btn(liveRunning4?'Пауза':'Запустить', 'toggleLive4()',true,skipRunning22)}${BALANCE22.playback.speeds.map(n=>btn(n+'×',`setSpeed4(${n})`,m.speed22===n)).join('')}${btn('Пропуск до конца','skipMatch22()',false,skipRunning22)}</div><p class="sub">1×: ${BALANCE22.playback.gameSeconds} игровых секунд за секунду. Автопауза: 5, 12, 20 минут, файты, объекты и Рошан. Скрытие вкладки и выход из матч-центра ставят матч на паузу.</p></section>`+
 `<div class="live-stats">${stat('Убийства',m.kills+' : '+m.deaths,'Результаты столкновений')}${stat('Нетворс',(m.gold>=0?'+':'')+cash(m.gold),'Живы '+alive4(m,0).length+' : '+alive4(m,1).length)}${stat('Сила команд',Math.round(Match22.strength(m,0))+' : '+Math.round(Match22.strength(m,1)),'Герои, предметы, форма и тактика')}${stat('Башни',m.towers.join(' : '),'Рошан '+m.rosh.join(' : '))}</div>`+
 Match22.commands(m)+`<div class="columns"><section class="panel"><h2>Экономика карты</h2>${goldChart4(m)}</section><section class="panel feed-panel"><h2>Лента матча</h2><div class="live-feed" aria-live="polite">${m.events.slice(-20).reverse().map(e=>`<div class="feed-event ${esc(e.type||'')}"><small>${clock4(e.sec??e.t*60)}</small><span>${esc(e.text)}</span></div>`).join('')}</div></section></div>`+
 objectivesView4(m)+`<div class="roster-grid">${heroTable4(m,0)}${heroTable4(m,1)}</div>`+`<section class="panel"><h2>Драфт текущей карты</h2><p>Ваши пики: ${m.draft.own.map(esc).join(' · ')}</p><p>Соперник: ${m.draft.enemy.map(esc).join(' · ')}</p><p class="sub">Баны: ${(m.draft.bans||[]).map(esc).join(' · ')}</p></section>`+restPanel6();
};
modelView4=function(){return head('MATCH ENGINE / 2.2','Решения следуют из состояния карты','Параметры модели: config/balance.js')+`<section class="panel"><p>Фазы: 0–10, 10–25 и 25+ минут. Сила складывается из навыка на роли, героя, предметов, нетворса, формы, морали, здоровья, ультимейтов, синергии и тактики.</p><p>Столкновения: p = 1 / (1 + exp(−(A − D) / SCALE)). Инициатива, вижен, возвышенность, живые участники и Аегис меняют A и D. Небольшой шум добавляется к оценке. Поражение означает смерти, потерю фарма и окно для объекта.</p><p>Обе команды используют одинаковые правила. ИИ каждую минуту сравнивает ожидаемую выгоду и риск действий. Нет ограничения перевеса золота или принудительного победителя по времени. Конец карты: Древний, добровольное GG или большой экономический минус вместе с потерей большинства башен.</p></section>`};
const freshBase22=fresh;fresh=function(...args){freshBase22(...args);S.gameVersion=BALANCE22.version;S.matchSchema22=22;};
// Older career initialization writes its own version; retain the current save marker.
const initCareerBase22=init13;init13=function(){initCareerBase22();S.gameVersion=BALANCE22.version;};

coachControls13=function(){return `<section class="panel"><h2>Управление матчем</h2><p class="sub">Решения на ключевых таймингах и после событий. Тренер использует ту же симуляцию без остановок.</p>${S.active?btn('Поручить турнир тренеру','autoTournament13()',true):''}</section>`;};

glyph4=function(){const m=S.active?.live;if(!m||m.finishedSide!=null||m.sides[0].glyphReady>m.clock)return;const s=m.sides[0];s.glyphUntil=m.clock+BALANCE22.map.glyphDuration;s.glyphReady=m.clock+BALANCE22.map.glyphCooldown;Match22.event(m,'Укрепление: строения защищены на следующем минутном тике.','glyph',{side:0});render();};
