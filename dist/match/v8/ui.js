'use strict';
Match8.commands=function(m){
 const defense=m.v8.defense?.[0];
 return `<section class="panel decision-panel"><div class="eyebrow">МОДЕЛЬ 8 · ${clock4(m.clock)}</div><h2>Управление матчем</h2>${defense?'<div class="notice">Автоматическая защита: '+Match8.zoneName(defense.zone)+'. Свободные герои возвращаются; текущий приказ возобновится, когда угроза отойдёт.</div>':''}<p>Текущий план: ${esc(ORDERS4[m.plans[0]]?.[0]||'Свобода тренеру')}. Последний завершённый план соперника: ${esc(ORDERS4[m.v8.lastObserved[1]]?.[0]||'Свобода тренеру')}.</p><p>${esc(m.window22.reason)}</p><p>Приказ действует ${this.B.orderDuration/60} мин.; следующий ручной приказ — не раньше чем через ${this.B.commandCooldown} с. Герои должны добраться до цели. Неизвестные позиции противника не раскрываются прогнозом.</p><div class="command-grid">${Object.entries(ORDERS4).filter(([k])=>k!=='gg').map(([key,value])=>{
  const a=this.assess(m,0,key),cool=m.clock-m.v8.commandAt[0]<this.B.commandCooldown&&key!=='coach',reason=a.reason||(cool?'Кулдаун приказа ещё не истёк':'');
  return `<button onclick="issueOrder4('${key}')" ${reason?'disabled':''}><b>${esc(value[0])}</b><small>${reason?esc(reason)+'. ':''}Риск: ${a.riskLabel}. Цена: ${esc(a.price)}. ${esc(a.conditions.join('; '))}</small></button>`;
 }).join('')}</div><div class="actions" style="margin-top:14px">${btn('До следующего решения','advanceMap()',true)}${btn('Глиф','glyph4()',false,m.sides[0].glyphReady>m.clock)}${btn('Сохранить',"go('saves')")}${btn('GG',"issueOrder4('gg')")}</div><h3>Тактика меняет поведение и распределение героев</h3><div class="actions">${Object.entries(this.B.tactics).map(([k,t])=>btn(t.label,`changeMatchTactic22('${k}')`,m.tactics22[0]===k)).join('')}</div><p class="sub">Смена требует перегруппировки; прямого множителя силы от тактики нет.</p></section>`;
};
const commands22Before8=Match22.commands;
Match22.commands=function(m){return isModel8(m)?Match8.commands(m):commands22Before8.call(this,m);};
issueOrder4=function(type,redraw=true){
 const m=S.active?.live;if(!isModel8(m))return isSpatial8(m)?LegacySpatial8.issue(type,redraw):Legacy26.issue(type,redraw);
 const result=Match8.issue(m,0,type,{manual:true});
 if(!result.ok){if(redraw)toast(result.reason);return false;}
 m.window22.pending=false;if(m.finishedSide!=null)finishMap();else if(redraw){render();save();}return true;
};
const changeTacticBefore8=changeMatchTactic22;
changeMatchTactic22=function(key){
 const m=S.active?.live;if(!isModel8(m))return changeTacticBefore8(key);
 if(!BALANCE8.tactics[key]||m.tactics22[0]===key)return false;
 Match8.closeDecision(m,0,'смена тактики');m.tactics22[0]=key;m.v8.reformUntil??=[0,0];m.v8.reformUntil[0]=m.clock+BALANCE8.movement.regroup;
 const entry={id:m.v8.nextId++,side:0,type:'tactic:'+key,start:Match8.capture(m,0),participants:[0,1,2,3,4],target:1};m.v8.decisionLog.push(entry);m.v8.activeDecision[0]=entry.id;
 Match8.event(m,'Новая тактика «'+BALANCE8.tactics[key].label+'»: команда перегруппируется '+BALANCE8.movement.regroup+' с.','tactic',{side:0});render();save();return true;
};
advanceMap=function(choice=null){
 const m=S.active?.live;if(!isModel8(m))return isSpatial8(m)?LegacySpatial8.advance(choice):Legacy26.advance(choice);
 if(choice&&!issueOrder4(choice,false))return;pauseLive4(false);m.window22.pending=false;
 let limit=0;while(m.finishedSide==null&&!m.window22.pending&&limit++<3600)simulateTick4(m,10);
 if(m.finishedSide!=null)finishMap();else render();
};
const reportBefore8=buildReport13;
buildReport13=function(m){const report=reportBefore8(m);if(isModel8(m)){report.modelVersion=8;report.decisions=structuredClone(m.v8.decisionLog);report.summary+=' Приказы и изменения за время их исполнения приведены отдельно.';}return report;};
const reportViewBefore8=reportView13;
reportView13=function(m){
 const base=reportViewBefore8(m),decisions=m?.report13?.decisions||m?.v8?.decisionLog;if(!decisions?.length)return base;
 return base+`<section class="panel"><h2>Сводка решений менеджера</h2><p class="sub">Дельты за период исполнения включают действия соперника. Это фактическое изменение, не точная причинная оценка кнопки.</p><div class="table-wrap"><table><thead><tr><th>Время / приказ</th><th>Последствия</th><th>Δ золота</th><th>Δ объектов</th></tr></thead><tbody>${decisions.filter(d=>d.side===0).map(d=>`<tr><td>${clock4(d.start.sec)} · ${esc(ORDERS4[d.type]?.[0]||d.type)}</td><td>${esc(d.events?.slice(-2).map(e=>e.text).join(' ')||d.reason||'Выполняется')}</td><td>${d.delta?.gold??'—'}</td><td>${d.delta?.objects??'—'}</td></tr>`).join('')}</tbody></table></div></section>`;
};
matchView=function(){
 const m=S.active?.live;if(isSpatial8(m))return LegacySpatial8.view();
 const html=Legacy26.view();return isModel8(m)?html.replace('MATCH ENGINE / 2.6','MATCH ENGINE / 8')+`<section class="panel"><h2>Переходы и локальные группы</h2>${m.sides.map((s,side)=>`<p><b>${esc(Match8.name(m,side))}</b>: ${s.heroes.map(p=>side===1?thisEnemyPosition8(m,p):esc(p.hero)+' — '+(p.deadUntil>m.clock?'возрождение '+clock4(p.deadUntil-m.clock):p.travelUntil>m.clock?'в пути в '+Match8.zoneName(p.destination)+' ('+clock4(p.travelUntil-m.clock)+')':Match8.zoneName(p.zone))).join('; ')}</p>`).join('')}</section>`:html;
};
const glyphBefore8=glyph4,buybackBefore8=buyback4;
glyph4=function(){const m=S.active?.live;if(!isModel8(m))return glyphBefore8();const s=m.sides[0];if(m.finishedSide!=null||s.glyphReady>m.clock)return;s.glyphUntil=m.clock+BALANCE8.objectives.glyphDuration;s.glyphReady=m.clock+BALANCE8.objectives.glyphCooldown;Match8.event(m,'Глиф включён на '+BALANCE8.objectives.glyphDuration+' с.; герои всё ещё должны успеть в защиту.','glyph',{side:0});render();};
buyback4=function(i){const m=S.active?.live;if(!isModel8(m))return buybackBefore8(i);const p=m.sides[0].heroes[i],cost=buybackCost4(p);if(p.deadUntil<=m.clock||p.buybackUntil>m.clock||p.bank<cost)return;addGold4(p,-cost);p.deadUntil=m.clock;p.buybackUntil=m.clock+BALANCE8.objectives.buybackCooldown;p.zone=5;p.destination=5;p.travelUntil=0;p.respawnTravel=false;p.retreat8=false;p.health=100;Match8.event(m,p.hero+' выкупился за '+cost+'; до боя ещё нужно добраться.','buyback',{side:0});render();};

// Historical spatial maps retain their original playback controls.
toggleLive4=function(){const m=S.active?.live;return isSpatial8(m)?LegacySpatial8.toggle():Legacy26.toggle();};

const modelViewBefore8=modelView4;
modelView4=function(){const m=S.active?.live;if(m&&!isModel8(m))return modelViewBefore8();return head('МОДЕЛЬ МАТЧА / 2.6','Решения меняют события на карте','Оценки используют доступную разведку')+`<section class="panel"><p>Приказ отправляет конкретных героев в выбранную зону. Пока они идут, их нет в локальном бою, они пропускают фарм и не защищают оставленные линии.</p><p>Шанс победы в столкновении зависит от участников на месте, предметов, здоровья, готовности ультимейтов, позиции, разведки и исполнения. Более сильная команда остаётся фаворитом; подкрепления, засада и ошибка способны изменить исход.</p><p>Рошан требует присутствия группы. Аегис занимает слот и даёт вторую жизнь. Штурм базы может остановиться об глиф и выкуп. Фокус Древнего пропускает бараки, но не стоящие перед ним башни.</p><p>Тренеры оценивают доступные действия раз в минуту. Ручной приказ позволяет использовать короткое окно сразу. Смена тактики требует перегруппировки; готовой прибавки к боевой силе она не даёт.</p></section>`;};

function thisEnemyPosition8(m,p){const known=m.v8.intel[0][p.role],name=esc(p.hero);if(p.deadUntil>m.clock)return name+' — возрождение '+clock4(p.deadUntil-m.clock);return !known||!known.alive||m.clock-known.seenAt>BALANCE8.vision.knownFor?name+' — нет свежих данных':name+' — последний контакт: '+Match8.zoneName(known.zone)+' ('+clock4(m.clock-known.seenAt)+' назад)';}
const heroTableBefore8=heroTable4;
heroTable4=function(m,side){const html=heroTableBefore8(m,side);return isModel8(m)&&side===1?html.replace(/<div class="position-list">[\s\S]*?<\/div>/,''):html;};
