'use strict';

const trainingModes33 = {
 balanced:'Сбалансированный', intensive:'Интенсивный', rest:'Восстановление'
};
const trainingFocuses33 = {
 lane:'Лейнинг', mechanics:'Механика', teamfight:'Командные бои',
 macro:'Макро', decisions:'Игровые решения', versatility:'Пул героев'
};
const trainingNumber33 = new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2});
const trainingDelta33 = new Intl.NumberFormat('ru-RU',{maximumFractionDigits:3,signDisplay:'exceptZero'});
function trainingAvailable33(){
 return !locked()&&!S.practice13&&!busy13&&nextEvent()?.day>S.day;
}
function trainingFocus33(){
 const focus=S.world13.trainingFocus33??S.world13.trainingFocus;
 return focus==='teamwork'?'teamfight':focus;
}
function selectTraining33(field,key){
 if(!trainingAvailable33())return;
 if(field==='mode'&&Object.hasOwn(trainingModes33,key))S.training=key;
 if(field==='focus'&&Object.hasOwn(trainingFocuses33,key))S.world13.trainingFocus33=key;
 render();
}
function trainingSnapshot33(p){
 return {id:p.id,skill:p.skill,form:p.form,fatigue:p.fatigue,morale:p.morale};
}
function trainingPreview33(){
 const original=S;
 S=structuredClone(original);
 try{
  S.day++;
  return roster().map(p=>{
   playerGrowth13(p,S.training,S.facility,trainingFocus33());
   return trainingSnapshot33(p);
  });
 }finally{S=original;}
}
function trainingDay33(skip=false){
 if(!trainingAvailable33())return;
 const before=roster().map(trainingSnapshot33);
 skipTraining33=skip;
 try{tick();}finally{skipTraining33=false;}
 const after=before.map(p=>trainingSnapshot33(S.players[p.id]));
 S.world13.lastTraining33={day:S.day,before,after,skip};
 render();
}
function trainingBar33(current,next){
 const from=clamp(current),to=clamp(next);
 return '<div class="training-bar33" aria-hidden="true"><span style="width:'+from+
  '%"></span><i class="'+(to<from?'training-loss33':'')+'" style="left:'+Math.min(from,to)+
  '%;width:'+Math.abs(to-from)+'%"></i></div>';
}
function trainingChoices33(values,selected,field,disabled){
 return Object.entries(values).map(([key,label])=>
  '<button type="button" aria-pressed="'+(key===selected)+'" '+(disabled?'disabled ':'')+
  'onclick="selectTraining33(\''+field+'\',\''+key+'\')">'+label+'</button>').join('');
}
tactics=function(){
 const available=trainingAvailable33(),focus=trainingFocus33(),players=roster();
 const before=players.map(trainingSnapshot33),after=available?trainingPreview33():before;
 const form=avg(before.map(p=>p.form)),nextForm=avg(after.map(p=>p.form));
 const fmt=number=>trainingNumber33.format(number),delta=number=>trainingDelta33.format(number);
 const last=S.world13.lastTraining33;
 const lastMessage=last?.day===S.day?(last.skip?'Последняя тренировка пропущена.':
  'Последняя тренировка · форма '+delta(avg(last.after.map(p=>p.form))-avg(last.before.map(p=>p.form)))+
  ' · средний OVR '+delta(avg(last.after.map(p=>p.skill))-avg(last.before.map(p=>p.skill)))):'';
 const rows=players.map((p,i)=>{
  const next=after[i],effective=p.amRating?.focus??focus;
  return '<tr><th scope="row">'+esc(p.name)+'<small>'+esc(trainingFocuses33[effective]??'')+
   '</small></th><td>'+fmt(p.skill)+' '+trainingBar33(p.skill,next.skill)+
   '<small>Δ '+delta(next.skill-p.skill)+'</small></td><td>'+fmt(p.form)+
   '<small>Δ '+delta(next.form-p.form)+'</small></td><td>'+fmt(p.fatigue)+
   '<small>Δ '+delta(next.fatigue-p.fatigue)+'</small></td><td>'+fmt(p.morale)+
   '<small>Δ '+delta(next.morale-p.morale)+'</small></td></tr>';
 }).join('');
 return '<div class="training-screen33"><h1>Тактика</h1>'+
  '<section class="panel training-choice33"><h2>Тактика на карту</h2><div>'+
  Object.entries(TACTICS).map(([key,info])=>'<button type="button" title="'+esc(info[1])+
   '" aria-pressed="'+(S.tactic===key)+'" '+(S.active?.live?'disabled ':'')+
   'onclick="setTactic(\''+key+'\')">'+esc(info[0])+'</button>').join('')+'</div></section>'+
  '<section class="panel training-choice33"><h2>Интенсивность тренировки</h2><div>'+
  trainingChoices33(trainingModes33,S.training,'mode',!available)+'</div></section>'+
  '<section class="panel training-form33"><h2>Форма команды</h2><strong>'+fmt(form)+
  (available?' → '+fmt(nextForm)+' <small>'+delta(nextForm-form)+'</small>':'')+
  '</strong>'+trainingBar33(form,nextForm)+'</section>'+
  '<div class="training-layout33"><section class="panel training-choice33"><h2>Фокус тренировки</h2><div>'+
  trainingChoices33(trainingFocuses33,focus,'focus',!available)+'</div></section>'+
  '<section class="panel"><h2>'+(available?'Прогноз тренировки':'Показатели игроков')+
  '</h2><div class="table-wrap"><table><thead><tr><th>Игрок</th><th>OVR</th><th>Форма</th><th>Усталость</th><th>Мораль</th></tr></thead><tbody>'+
  rows+'</tbody></table></div></section></div>'+
  '<div class="training-actions33">'+btn('Провести тренировку','trainingDay33()',true,!available)+
  btn('Пропустить','trainingDay33(true)',false,!available)+'</div>'+
  '<p class="sub">'+(available?'Оба действия переводят календарь на следующий день.':'Тренировка доступна в свободный игровой день.')+
  '</p>'+(lastMessage?'<p role="status">'+lastMessage+'</p>':'')+
  '<p class="sub">Подготовка '+Math.round(development21().preparation)+'% · '+btn('Развитие клуба', "go('development')")+'</p></div>';
};
