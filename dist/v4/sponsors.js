'use strict';
const SPONSOR4A={base:120000,pointsRate:100,pointsCap:80000,titleRate:10000,winRate:.1,winMin:50000,winMax:350000,window:90,targets:[2,4,6],step:.2};
const Sponsor4A={
 install(){if(!S)return;S.sponsors4a??={version:1,installedDay:S.day,existingResults:S.events.filter(e=>e.done).map(e=>e.id),clubs:{},notices:[]};},
 club(id){this.install();return S.sponsors4a.clubs[id]??={level:0,raisedDay:null,raises:[]};},
 wins(id){return S.events.filter(e=>e.done&&!Qualifiers.isRegional(e)&&e.champion===id&&(e.sponsor4a?.day??e.completedDay20??e.day)<=S.day&&S.day-(e.sponsor4a?.day??e.completedDay20??e.day)<=SPONSOR4A.window);},
 factor(id){return 1+this.club(id).level*SPONSOR4A.step;},
 titles(id){return id===S.club?S.trophies:S.events.filter(e=>e.done&&!Qualifiers.isRegional(e)&&e.champion===id).length;},
 breakdown(id){const C=SPONSOR4A;return {base:C.base,season:Math.min(C.pointsCap,Math.max(0,clubState13(S.teams[id]).seasonPoints)*C.pointsRate),titles:this.titles(id)*C.titleRate,factor:this.factor(id)};},
 weekly(id){const b=this.breakdown(id);return Math.round((b.base+b.season+b.titles)*b.factor);},
 bonus(pool,id){const C=SPONSOR4A;return Math.round(clamp(Math.round((pool||0)*C.winRate),C.winMin,C.winMax)*this.factor(id));},
 settle(e){
  this.install();if(!e?.done||Qualifiers.isRegional(e)||e.sponsor4a||S.sponsors4a.existingResults.includes(e.id)||!Number.isInteger(e.champion)||!S.teams[e.champion])return false;
  const id=e.champion,c=this.club(id),bonus=this.bonus(e.pool,id),oldLevel=c.level,oldWeekly=this.weekly(id);
  // The title bonus uses the contract that was active at the start of settlement.
  e.sponsor4a={version:1,team:id,bonus,day:S.day,level:oldLevel};
  const wins=this.wins(id).length;
  pay13(id,bonus,e.name+' · спонсорская премия за титул');
  c.level=Math.max(c.level,SPONSOR4A.targets.filter(target=>wins>=target).length);
  if(c.level>oldLevel){
   c.raisedDay=S.day;(c.raises??=[]).push({event:e.id,day:S.day,from:oldLevel,to:c.level});
   if(id===S.club){const notice={event:e.id,day:S.day,wins,from:oldLevel,to:c.level,before:oldWeekly,after:this.weekly(id),acknowledged:false};S.sponsors4a.notices.push(notice);log('Спонсоры повысили выплаты: '+wins+' титулов за 90 дней. Контракт +'+Math.round(c.level*SPONSOR4A.step*100)+'%; еженедельно '+cash(notice.after)+'.');}
  }
  if(id===S.club)log(e.name+' · спонсорская премия '+cash(bonus)+' за победу (отдельно от призовых).');
  save();return true;
 },
 pending(){return S.sponsors4a?.notices.find(n=>!n.acknowledged);},
 showNotice(){
  const n=this.pending();if(!n||busy13||S.active||S.practice13||$('modal').open)return;
  const e=S.events.find(e=>e.id===n.event);
  openModal('<div class="sponsor4a-notice"><span class="eyebrow">СПОНСОРЫ ПОВЫШАЮТ ВЫПЛАТЫ</span><h2>Победы укрепляют партнёрство</h2><p>'+esc(e?.name||'Победа на турнире')+' · '+n.wins+' титулов за последние 90 дней.</p><div class="sponsor4a-increase"><span>'+cash(n.before)+' / нед.</span><b>→</b><strong>'+cash(n.after)+' / нед.</strong></div><p>Бонус к базовой выплате и премиям вырос с <b>+'+Math.round(n.from*SPONSOR4A.step*100)+'%</b> до <b>+'+Math.round(n.to*SPONSOR4A.step*100)+'%</b>. Новая ставка действует со следующей еженедельной выплаты. Повторно оплачивать или подписывать контракт не нужно.</p><p class="sub">Это повышение ставки, а не разовое начисление показанной недельной суммы. Текущий титул оплачен по прежней ставке, следующие — по новой.</p>'+btn('Понятно','acknowledgeSponsor4A('+n.event+')',true)+'</div>');
 },
 view(){
  this.install();const id=S.club,b=this.breakdown(id),c=this.club(id),wins=this.wins(id),target=SPONSOR4A.targets[c.level],total=this.weekly(id),next=S.day+(7-S.day%7),paid=S.events.filter(e=>e.sponsor4a?.team===id).sort((a,b)=>b.sponsor4a.day-a.sponsor4a.day||b.id-a.id).slice(0,8);
  return head('КОММЕРЦИЯ / V4.0 A','Спонсоры',esc(my().name)+' · действующая программа поддержки клуба')+'<div class="cards sponsor4a-metrics">'+stat('Выплата в неделю',cash(total),'Следующее начисление: '+date(next))+stat('Уровень партнёрства','+'+Math.round((b.factor-1)*100)+'%','Применяется к выплатам и премиям')+stat('Титулы за 90 дней',wins.length,target?'Следующий порог: '+target:'Максимальный уровень достигнут')+'</div><section class="panel sponsor4a-contract"><span class="eyebrow">ДЕЙСТВУЮЩИЙ КОНТРАКТ</span><h2>Финансирование, подкреплённое результатами</h2><div class="table-wrap"><table><tbody><tr><td>Базовая выплата</td><td>'+cash(b.base)+' / нед.</td></tr><tr><td>Результаты сезона · '+SPONSOR4A.pointsRate+' за очко, максимум '+cash(SPONSOR4A.pointsCap)+'</td><td>'+cash(b.season)+' / нед.</td></tr><tr><td>Титулы клуба · '+cash(SPONSOR4A.titleRate)+' за титул</td><td>'+cash(b.titles)+' / нед.</td></tr><tr><td>Множитель партнёрства</td><td>×'+b.factor.toFixed(1)+'</td></tr><tr><th>Итог</th><th>'+cash(total)+' / нед.</th></tr></tbody></table></div><p>Начисляется автоматически раз в семь игровых дней и отражается в финансовом журнале. Еженедельные расходы клуба продолжают рассчитываться отдельно.</p></section><section class="panel"><h2>Премия за чемпионство</h2><p>10% призового фонда, от '+cash(SPONSOR4A.winMin)+' до '+cash(SPONSOR4A.winMax)+', умноженные на уровень партнёрства. Например, победа на турнире с фондом $1 000 000 сейчас принесёт <b>'+cash(this.bonus(1000000,id))+'</b> от спонсоров сверх обычных призовых.</p><p>Только титулы основных турниров. Квалификации, инвайты, отдельные серии и КВ не считаются чемпионством. Премия за каждый турнир выдаётся один раз.</p></section><section class="panel"><h2>Рост доверия спонсоров</h2><div class="sponsor4a-levels">'+SPONSOR4A.targets.map((n,i)=>'<article class="'+(c.level>i?'earned':'')+'"><span>'+n+' титула за 90 дней</span><strong>+'+Math.round((i+1)*SPONSOR4A.step*100)+'%</strong><small>'+(c.level>i?'Уровень получен':'Порог для повышения')+'</small></article>').join('')+'</div><p>Проверка после каждого нового чемпионства. Полученный уровень сохраняется; снижение числа недавних побед его не отнимает. Максимальная надбавка +60%. Повышение приходит отдельным уведомлением и применяется к следующим выплатам.</p>'+(this.pending()?btn('Открыть уведомление спонсоров','Sponsor4A.showNotice()',true):'')+'</section><section class="panel"><h2>Последние премии</h2>'+(paid.length?paid.map(e=>'<div class="club-result"><span>'+date(e.sponsor4a.day)+' · '+esc(e.name)+'</span><b class="positive">+'+cash(e.sponsor4a.bonus)+'</b></div>').join(''):'<p>Здесь появятся премии за новые победы после установки V4.0 A. Старые результаты повторно не оплачиваются.</p>')+'</section>';
 },
 valid(x){
  const s=x.sponsors4a;if(s===undefined)return true;
  const idOK=id=>Number.isInteger(id)&&!!x.teams[id];
  if(!s||s.version!==1||!Number.isInteger(s.installedDay)||s.installedDay<0||!Array.isArray(s.existingResults)||s.existingResults.some(id=>!Number.isInteger(id))||!s.clubs||typeof s.clubs!=='object'||Array.isArray(s.clubs)||!Array.isArray(s.notices))return false;
  if(Object.entries(s.clubs).some(([id,c])=>!idOK(+id)||!c||!Number.isInteger(c.level)||c.level<0||c.level>3||c.raisedDay!==null&&(!Number.isInteger(c.raisedDay)||c.raisedDay<0)||c.raises!==undefined&&(!Array.isArray(c.raises)||c.raises.length>3||c.raises.some(r=>!r||!Number.isInteger(r.event)||!Number.isInteger(r.day)||r.day<0||!Number.isInteger(r.from)||!Number.isInteger(r.to)||r.from<0||r.to>3||r.to<=r.from))))return false;
  if(s.notices.some(n=>!n||!Number.isInteger(n.event)||!Number.isInteger(n.day)||n.day<0||!Number.isInteger(n.wins)||n.wins<2||!Number.isInteger(n.from)||!Number.isInteger(n.to)||n.from<0||n.to>3||n.to<=n.from||!Number.isFinite(n.before)||!Number.isFinite(n.after)||n.before<0||n.after<=n.before||typeof n.acknowledged!=='boolean'))return false;
  if(new Set(s.notices.map(n=>n.event)).size!==s.notices.length)return false;
  return x.events.every(e=>!e.sponsor4a||e.done&&!Qualifiers.isRegional(e)&&e.sponsor4a.version===1&&idOK(e.sponsor4a.team)&&e.sponsor4a.team===e.champion&&Number.isInteger(e.sponsor4a.day)&&e.sponsor4a.day>=0&&Number.isInteger(e.sponsor4a.level)&&e.sponsor4a.level>=0&&e.sponsor4a.level<=3&&Number.isInteger(e.sponsor4a.bonus)&&e.sponsor4a.bonus>=SPONSOR4A.winMin&&e.sponsor4a.bonus<=SPONSOR4A.winMax*1.6);
 }
};
function acknowledgeSponsor4A(event){const n=S.sponsors4a?.notices.find(n=>n.event===event);if(n)n.acknowledged=true;save();closeModal();render();}
const sponsorFinish4A=finishEvent6;
finishEvent6=function(a){Sponsor4A.install();const e=S.events.find(e=>e.id===a.event),done=e?.done;const result=sponsorFinish4A(a);if(e&&!done&&e.done)Sponsor4A.settle(e);Sponsor4A.showNotice();return result;};
const sponsorSkip4A=finalizeSkipped12;
finalizeSkipped12=function(a){Sponsor4A.install();const e=S.events.find(e=>e.id===a.event),done=e?.done;const result=sponsorSkip4A(a);if(e&&!done&&e.done)Sponsor4A.settle(e);return result;};
const sponsorRender4A=render;
render=function(...args){Sponsor4A.install();const r=sponsorRender4A(...args);if(!S)return r;if(page==='sponsors'&&!busy13&&!S.practice13)$('app').innerHTML=Sponsor4A.view();$('broadcastStatus33c').innerHTML=$('broadcastStatus33c').innerHTML.replace('V4.0 / ARENA','V4.0 A / ARENA');Sponsor4A.showNotice();return r;};
const sponsorValid4A=validSave;
validSave=function(x){return Sponsor4A.valid(x)&&sponsorValid4A(x);};

function resetSponsorsAfterRewind4A(){
 if(!S.sponsors4a||S.tiRecovery?.mode!=='restart')return;
 const done=id=>S.events.some(e=>e.id===id&&e.done);
 for(const c of Object.values(S.sponsors4a.clubs)){c.raises=(c.raises||[]).filter(r=>r.day<S.day&&done(r.event));c.level=c.raises.at(-1)?.to||0;c.raisedDay=c.raises.at(-1)?.day??null;}
 S.sponsors4a.notices=S.sponsors4a.notices.filter(n=>n.day<S.day&&done(n.event));
 S.sponsors4a.existingResults=S.sponsors4a.existingResults.filter(done);
}
