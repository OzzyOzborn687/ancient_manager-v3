'use strict';
function requestWildcard3b(id){
 const e=S.events.find(e=>e.id===id),record=Qualifiers.requestWildcard3b(e);
 if(!record){toast(Qualifiers.wildcardStatus3b(e).reason);return;}
 save();render();toast(record.cancelled?'Участие по wildcard отменено.':record.accepted?'Wildcard одобрен: вы участвуете в региональной квалификации.':'Оператор отклонил запрос. Попытка сохранена.');
}
function operatorPanel3b(e){
 const state=Qualifiers.initOperators3b();if(!state)return '';
 const year=circuitYear(S.day),used=state.requests[year]||[],status=Qualifiers.wildcardStatus3b(e),C=QUALIFIERS.wildcardRequest;
 const cards=QUALIFIERS.operators.map(op=>{
  const last=state.history.find(v=>v.operator===op);
  return '<article class="panel operator-card3b '+(op===status.operator?'operator-selected3b':'')+'"><span class="eyebrow">'+esc(op)+'</span><h3>'+Math.round(state.relations[op])+' / 100</h3>'+bar('Отношения',state.relations[op])+
  '<p class="sub">'+(last?'Последний официальный результат: '+(last.delta>=0?'+':'')+last.delta+' · '+date(last.day):'Официальные результаты и участие укрепляют отношения.')+'</p></article>';
 }).join('');
 const record=used.find(v=>v.event===e?.id&&v.operator===status.operator);
 const R=QUALIFIERS.operatorRelations,cost=record?record.relationshipBefore-record.relationshipAfter:Math.min(C.relationshipCost,Math.max(0,(status.relationship??R.initial)-R.min));
 let message=status.reason;
 if(record)message=record.cancelled?'Вы отказались от участия по одобренному wildcard.':record.accepted?'Оператор одобрил wildcard в региональную квалификацию.':'Оператор отклонил запрос. Повторный запрос на этот турнир в текущем сезоне недоступен.';
 if(e?.qualification?.wildcardRestorePending3b)message='Одобрение сохранено. '+e.qualification.wildcardRestorePending3b;
 const chance=status.operator?'<p>'+(record?'На момент запроса — шанс: ':'Оценка шанса: ')+'<b class="green">'+Math.round((record?.pWin??status.pWin??Qualifiers.wildcardProbability3b(status.relationship))*100)+'%</b>, отношения '+Math.round(record?.relationshipBefore??status.relationship)+'/100.</p>':'';
 return '<section class="panel operator-section3b"><h2>Отношения с операторами</h2><p>Влияют на запрос места в закрытой квалификации. Основные приглашения по индексу сохраняют прежние правила.</p><p class="sub">Завершение отбора +'+R.qualificationFinish+', выход ещё +'+R.qualifiedBonus+'. Основной турнир +'+R.mainFinish+' и бонус за высокое место. Отказ от подтверждённого участия '+R.withdrawal+'.</p><div class="operator-grid3b">'+cards+'</div></section>'+
  '<section class="panel wildcard-request3b" data-wildcard-event="'+(e?.id??'')+'"><span class="eyebrow">WILDCARD · СЕЗОН '+year+'</span><h2>Последний шанс попасть в отбор</h2><p>'+esc(message||'Выберите основной турнир.')+'</p>'+chance+
  '<p>Цена: одна попытка из общего лимита сезона и −'+cost+' к отношениям. Использовано: <b>'+used.length+' / '+C.perSeason+'</b>.</p><p class="sub">Запрос доступен до начала региона, если ваш клуб не приглашён и не вошёл в закрытый отбор. В отборе по-прежнему нужно выиграть место на основной турнир.</p>'+
  (e?btn('Запросить wildcard','requestWildcard3b('+e.id+')',true,!status.available):'')+'</section>';
}
const qualifierViewBeforeWildcard3b=qualifiersView;
qualifiersView=function(){const html=qualifierViewBeforeWildcard3b();return qualifierTab==='path'?html+operatorPanel3b(qualifierParent()):html;};
const qualifierCardBeforeWildcard3b=qualifierCard;
qualifierCard=function(e,...args){
 const html=qualifierCardBeforeWildcard3b(e,...args),status=Qualifiers.wildcardStatus3b(e);
 const action=status.available?'<p class="wildcard-home3b">Ваш клуб может запросить место в отборе. '+btn('Запрос wildcard · '+Math.round(status.pWin*100)+'%',"openQualifiers("+e.id+",'path')")+'</p>':'';
 return action?html.replace('</div></section>',action+'</div></section>'):html;
};
