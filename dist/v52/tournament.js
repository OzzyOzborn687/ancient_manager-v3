'use strict';
const TournamentIntro52A={
 event:null,dialog:null,state:null,frame:null,
 markup(e){
  const team=my(),ps=roster(team),f=format6(e),camp=Camp4.plans()[Camp4.key(e.id)],invite=e.qualification?.invited?.find(r=>r.team===S.club),avgValue=k=>avg(ps.map(p=>p[k]));
  const metrics=[['OVR',avgValue('skill')],['SIN',amSynergy(ps).score],['ФОРМА',avgValue('form')],['ЭНЕРГИЯ',100-avgValue('fatigue')]];
  const reason=Qualifiers.isRegional(e)?'Участник квалификации':invite?.text|| (e.qualification13?.invited?.includes(S.club)?'Прямое приглашение':'Участие подтверждено');
  return '<section class="ta-card" aria-labelledby="ta-title"><header class="ta-header"><span>ТУРНИР ГОТОВ К СТАРТУ</span><button type="button" onclick="TournamentIntro52A.start()" aria-label="Пропустить анимацию и начать турнир">Пропустить анимацию →</button></header><div class="ta-hero"><div><small>'+esc(date(e.day))+' · '+esc(e.venue||'Игровая арена')+'</small><h1 id="ta-title">'+esc(e.name)+'</h1><p>'+f.n+' КОМАНД · '+esc(f.label)+'</p><b>✓ '+esc(reason)+'</b></div><div class="ta-trophy">'+Trophy4B.sprite(Trophy4B.select(e).key)+'</div></div><div class="ta-team">'+clubAvatar12(team,true)+'<div><small>ВАША КОМАНДА</small><h2>'+esc(team.name)+'</h2></div></div><div class="ta-readiness"><div class="ta-players">'+ps.map((p,i)=>'<article style="--delay:'+(.5+i*.12)+'s">'+TransferReveal52.portrait(p)+'<strong>'+esc(p.name)+'</strong><small>POS '+(p.role+1)+'</small></article>').join('')+'</div><div class="ta-metrics">'+metrics.map(([label,value],i)=>'<div style="--delay:'+(1.2+i*.1)+'s"><small>'+label+'</small><strong data-value="'+value+'" data-suffix="'+(i===3?'%':'')+'">'+Arena33C.number(value)+(i===3?'%':'')+'</strong>'+(i>1?'<span class="ta-bar"><i style="--value:'+clamp(value)+'%"></i></span>':'')+'</div>').join('')+'</div></div><div class="ta-checks"><span>✓ Состав: '+ps.length+' / 5</span><span>'+esc(camp?CampUI4.labels[camp.status]+' · '+V4_CONFIG.camp.tiers[camp.tier].label:'Обычная подготовка')+'</span><span>Сетка по регламенту турнира</span></div><footer class="ta-actions"><button class="ta-start" type="button" onclick="TournamentIntro52A.start()">НАЧАТЬ ТУРНИР →</button><button type="button" onclick="TournamentIntro52A.bracket()">Сетка и участники</button><button type="button" onclick="TournamentIntro52A.withdraw()">Пропустить турнир</button></footer></section>';
 },
 open(){
  if(S.active||S.practice13||busy13)return;
  const e=nextEvent();if(!e||e.done||e.day>S.day||e.background51)return;
  if(e.qualification&&!Qualifiers.complete(e)){startEvent();return;}
  if(e.day>S.day)return;
  const ids=e.entrants||e.qualified13||qualify13(e,format6(e));
  if(!ids.includes(S.club)){startEvent();return;}
  this.close();this.event=e.id;this.state=S;save();
  if(typeof document.createElement!=='function')return;
  const d=document.createElement('dialog');d.className='ta-dialog';d.id='tournamentIntro52A';d.setAttribute('aria-label','Старт турнира '+e.name);d.innerHTML=this.markup(e);this.dialog=d;document.body.appendChild(d);
  d.addEventListener('cancel',event=>{event.preventDefault();this.close();});d.addEventListener('close',()=>{if(this.dialog===d)this.close();else d.remove();});d.showModal();d.querySelector('.ta-start').focus();
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){const start=performance.now();const tick=now=>{if(this.dialog!==d)return;const x=Math.max(0,Math.min(1,(now-start-1100)/800)),v=1-Math.pow(1-x,3);for(const el of d.querySelectorAll('[data-value]'))el.textContent=Arena33C.number(Number(el.dataset.value)*v)+el.dataset.suffix;if(x<1)this.frame=requestAnimationFrame(tick);else this.frame=null;};this.frame=requestAnimationFrame(tick);}
 },
 close(){if(this.frame!=null){cancelAnimationFrame(this.frame);this.frame=null;}const d=this.dialog;this.dialog=null;this.event=null;this.state=null;if(d?.open)d.close();d?.remove();},
 valid(){return this.state===S&&!S.active&&!S.practice13&&!busy13&&nextEvent()?.id===this.event;},
 start(){if(!this.valid()){this.close();return;}this.close();startEvent();},
 bracket(){if(!this.valid()){this.close();return;}const id=this.event;this.close();showBracket(id);},
 withdraw(){if(!this.valid()){this.close();return;}const id=this.event;this.close();skipUpcomingTournament51B(id);}
};
// Only manual UI entry points show the introduction. Coach and calendar simulations keep their engine entry point.
const buttonBeforeTournament52A=btn;
btn=function(label,action,...args){return buttonBeforeTournament52A(label,action==='startEvent()'?'TournamentIntro52A.open()':action,...args);};
const advanceBeforeTournament52A=advance;
advance=function(...args){const e=nextEvent();if(!S.active&&!S.practice13&&!busy13&&e&&e.day<=S.day)return TournamentIntro52A.open();return advanceBeforeTournament52A(...args);};
$('advance').onclick=advance;
const freshBeforeTournament52A=fresh,migrateBeforeTournament52A=migrate;
fresh=function(...args){TournamentIntro52A.close();return freshBeforeTournament52A(...args);};
migrate=function(...args){TournamentIntro52A.close();return migrateBeforeTournament52A(...args);};
