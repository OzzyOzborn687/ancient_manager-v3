'use strict';
function qualificationTimeline3(e){
 const q=e?.qualification,c=q?.calendar;if(!Qualifiers.isCalendar3(e)||!c)return '';
 const child=S.events.find(v=>v.qualifierFor===e.id&&v.entrants?.includes(S.club)),start=child?.day??c.qualStart,duration=child?.duration??c.duration;
 const lock=Qualifiers.registeredRoster3(S.club),own=e.qualification.qualified?.includes(S.club)||e.qualification.invited?.some(v=>v.team===S.club)||
  S.events.some(v=>v.qualifierFor===e.id&&v.entrants?.includes(S.club));
 return '<div class="qualifier-timeline3" data-calendar-version="3">'+[
  ['Приглашения',date(c.announcedDay)],['Квалификации',date(start)+' — '+date(start+duration-1)],
  ['Закрытие заявок',date(c.listDay)],['Основной турнир',date(e.day)]
 ].map(([title,value])=>'<span><small>'+esc(title)+'</small><b>'+esc(value)+'</b></span>').join('')+'</div>'+
 (c.compressed?'<p class="sub">Плотный календарь: интервалы сжаты пропорционально, минимальные отступы сохранены.</p>':'')+
 (own&&!e.done?'<p class="qualifier-roster3">'+(lock?'Состав зафиксирован в турнирной заявке. Продление контрактов доступно; прошедшая команда сохраняет пятёрку до конца основного турнира.':'Состав можно изменить до '+date(S.events.find(v=>v.qualifierFor===e.id&&v.entrants?.includes(S.club))?.day??c.listDay)+'.')+'</p>':'');
}
const qualifierCardBefore3=qualifierCard;
qualifierCard=function(e,...args){return qualifierCardBefore3(e,...args).replace('</div></section>',qualificationTimeline3(e)+'</div></section>');};
const qualifierBracketBefore3=bracketView;
bracketView=function(){
 const html=qualifierBracketBefore3(),e=S.events.find(v=>v.id===(selectedBracket??S.active?.event));
 const parent=Qualifiers.isRegional(e)?S.events.find(v=>v.id===e.qualifierFor):e;
 if(!Qualifiers.isCalendar3(parent)||!parent.qualification.calendar)return html;
 return '<section class="panel qualifier-regulations3"><h2>Календарь и заявки</h2>'+qualificationTimeline3(parent)+
  '<p class="sub">Ранее подтверждённые официальные матчи имеют приоритет. До закрытия списка конфликтующий инвайт передаётся следующему клубу по замороженному индексу. После закрытия новый конфликт останавливает старт и объясняется заранее.</p></section>'+html;
};
