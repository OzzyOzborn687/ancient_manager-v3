'use strict';
// In-match actions. Surrender is an explicit player result; counter-smoke changes
// one local engagement, never gold, structures, deaths or the map winner directly.
const COUNTER_SMOKE_CHANCE11=.225,COUNTER_SMOKE_COOLDOWN11=600;
ORDERS4.gg=['Заколить GG','Немедленно сдаться: эта карта завершится твоим поражением. Доступно на любой стадии.'];
ORDERS4.counterSmoke=['Контр-смок','При явном отставании: 22,5% на удачную контратаку. Нужен смок и 3 живых героя; перезарядка 10 минут.'];
function counterState11(m){return m.counterSmoke11??=( {cooldownUntil:0,attempts:0,pending:null,history:[]})}
function counterReason11(m){
 if(!m||m.finishedSide!=null)return 'Карта уже завершена.';
 let state=counterState11(m),lost=towerCount4(m.sides[0])-towerCount4(m.sides[1]);
 if(state.pending)return 'Контр-смок уже готовится.';
 if(m.clock<state.cooldownUntil)return 'Контр-смок будет доступен через '+clock4(state.cooldownUntil-m.clock)+'.';
 if(m.gold>-4000&&lost<3)return 'Нужно отставание от 4000 золота или на 3 потерянные башни.';
 if(m.battle)return 'Дождись завершения текущей драки.';
 if(alive4(m,0).length<3)return 'Нужны минимум 3 живых героя.';
 if(m.sides[0].smokes<1)return 'Нет зарядов смоука.';
 if(m.clock-m.commandAt<20)return 'Слишком рано после предыдущего приказа.';
 if(!alive4(m,1).some(p=>p.zone<5&&p.travelUntil<=m.clock))return 'На карте пока нет цели для контратаки.';
 return '';
}
function prepareCounter11(m){
 let s=counterState11(m),p=s.pending;if(!p||m.encounter6)return;
 let enemies=alive4(m,1).filter(q=>q.zone<5&&q.travelUntil<=m.clock),counts=Array.from({length:5},(_,zone)=>enemies.filter(q=>q.zone===zone).length),zone=counts.indexOf(Math.max(...counts));if(!counts[zone])return;
 let own=alive4(m,0);if(own.length<3)return;
 let other=enemies.filter(q=>q.zone===zone),groups=[own.map(q=>q.role),other.map(q=>q.role)];for(let hero of own)move5(m,hero,zone);
 m.encounter6={at:Math.max(m.clock+10,...own.map(q=>q.travelUntil)),zone,groups,attacker:0,highground:false,counterSmoke11:true};p.zone=zone;
}
const resultBefore11=recordResult6;recordResult6=function(m){if(m.resultReason!=='gg')return resultBefore11(m);sync4(m);m.matchReport6={winner:m.sides[1].team,reason:'gg',durationSec:m.clock,kills:[m.kills,m.deaths],draft:structuredClone(m.draft),stages:structuredClone(m.stageHistory6),turningPoints:structuredClone(m.turningPoints6),objects:structuredClone(m.objectiveLog)};event4(m,'Карта завершена сдачей. Победа '+S.teams[m.sides[1].team].name+'.','end',{side:1,reason:'gg'});};
const orderBefore11=issueOrder4;issueOrder4=function(type,redraw=true){
 if(type!=='gg'&&type!=='counterSmoke')return orderBefore11(type,redraw);
 let m=S.active?.live;if(!m||m.finishedSide!=null)return false;
 if(type==='gg'){
  pauseLive4(false);m.resultReason='gg';m.surrendered=true;m.battle=null;m.encounter6=null;if(m.counterSmoke11)m.counterSmoke11.pending=null;
  m.decisions.push({minute:Math.floor(m.clock/60),sec:m.clock,key:'gg',title:ORDERS4.gg[0],stage:stage4(m),gold:m.gold});
  event4(m,S.teams[m.sides[0].team].short+': GG. Команда сдаётся.','gg',{side:0});m.finishedSide=1;recordResult6(m);finishMap();return true;
 }
 let reason=counterReason11(m);if(reason){if(redraw)toast(reason);return false;}
 let state=counterState11(m);m.sides[0].smokes--;m.commandAt=m.clock;state.attempts++;state.cooldownUntil=m.clock+COUNTER_SMOKE_COOLDOWN11;
 state.pending={calledAt:m.clock,expiresAt:m.clock+180,chance:COUNTER_SMOKE_CHANCE11,favorable:rng()<COUNTER_SMOKE_CHANCE11};
 m.orders[0]={type:'vision',until:m.clock+180};m.encounter6=null;
 m.decisions.push({minute:Math.floor(m.clock/60),sec:m.clock,key:'counterSmoke',title:ORDERS4.counterSmoke[0],stage:stage4(m),gold:m.gold,chance:COUNTER_SMOKE_CHANCE11});
 event4(m,'Контр-смок: команда собирается для ответной контратаки. Потрачен 1 заряд.','order',{side:0});prepareCounter11(m);save();if(redraw)render();return true;
};
const scheduleBefore11=scheduleFight6;scheduleFight6=function(m){let state=m.counterSmoke11,p=state?.pending;if(p){if(m.clock>p.expiresAt){state.history.push({...p,resolvedAt:m.clock,outcome:'expired'});state.pending=null;if(m.encounter6?.counterSmoke11)m.encounter6=null;event4(m,'Контр-смок закончился без контакта с противником.','counter-smoke',{side:0,outcome:'expired'});}else prepareCounter11(m);}scheduleBefore11(m);};
const fightBefore11=fight4;fight4=function(m,attacker=null,highground=false,zone=null){let pending=m.counterSmoke11?.pending,queued=!!m.encounter6?.counterSmoke11&&attacker===0&&zone===m.encounter6.zone&&m.clock>=m.encounter6.at;if(m.battle)return;fightBefore11(m,attacker,highground,zone);if(!queued||!pending||!m.battle)return;
 let b=m.battle,success=pending.favorable;b.counterSmoke11={success,chance:pending.chance,calledAt:pending.calledAt};
 b.execution6[0]*=success?1.85:.8;b.execution6[1]*=success?.85:1.08;
 m.counterSmoke11.history.push({...pending,resolvedAt:m.clock,outcome:success?'success':'failed'});m.counterSmoke11.pending=null;
 event4(m,success?'Удачный контр-смок: соперник застигнут врасплох. У команды преимущество инициации в этой драке.':'Контр-смок прочитан: соперник готов к выходу. Команда начинает драку в неудобной позиции.','counter-smoke',{side:0,outcome:success?'success':'failed',chance:pending.chance});
};
function decorateActions11(html,m){let reason=counterReason11(m);html=html.replace(/<button([^>]*onclick="(?:issueOrder4|chooseDecision)\('counterSmoke'[^\"]*"[^>]*)>/g,(_,attrs)=>'<button'+attrs+(reason?' disabled title="'+esc(reason)+'"':'')+'>');html=html.replace(/<button([^>]*onclick="(?:issueOrder4|chooseDecision)\('gg'[^\"]*"[^>]*)>/g,(_,attrs)=>'<button'+attrs+' style="border-color:#a85e5e;color:#ffabab"'+'>');let state=m.counterSmoke11;if(state?.pending)html=html.replace(/<\/section>$/,`<p class="sub">Контр-смок готовится. Героям нужно добраться до цели; удачный выход не гарантирует победу на карте.</p></section>`);return html;}
const decisionBefore11=decisionView;decisionView=function(m){return decorateActions11(decisionBefore11(m),m)};
const liveBefore11=liveControls4;liveControls4=function(m){return decorateActions11(liveBefore11(m),m)};
const viewBefore11=matchView;matchView=function(){let m=S.active?.live||S.active?.maps.at(-1),html=viewBefore11();html=html.replaceAll('Победа определяется разрушением Древнего','Победа: Древний или сдача соперника');if(m?.resultReason==='gg')html=html.replace('Итоговый перевес','Итоговый перевес · поражение после GG');return html;};
const migrateBefore11=migrate;migrate=function(){migrateBefore11();S.gameVersion=GAME_VERSION_V1;};
const settingsBefore11=settings;settings=function(){let change=`<section class="panel"><h2>v1.1 · решения во время матча</h2><p>«Заколить GG» — немедленное поражение на карте в любой момент. «Контр-смок» — при отставании от 4000 золота или на три потерянные башни: 22,5% на удачную инициацию, один заряд смоука, минимум три живых героя, перезарядка десять минут. Эффект действует на одну драку, без мгновенной смены победителя или золота.</p></section>`;return settingsBefore11().replace('<section class="panel">',change+'<section class="panel">');};

const modelBefore11=modelView4;modelView4=function(){return modelBefore11().replace('Победить можно только после последовательного сноса башен и открытия базы.','Победа достигается последовательным сносом базы либо сдачей соперника после GG.')};
