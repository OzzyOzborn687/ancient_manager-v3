'use strict';
const Elimination52B={
 dialog:null,current:null,
 store(){return S.elimination52b??={version:1,notices:[]};},
 capture(a,stage,before){
  if(!S.v5?.sceneReady)return;
  const e=S.events.find(e=>e.id===a.event);if(!e)return;
  const future=a.schedule.slice(before),advancing=new Set(a.tiTop||[]);
  for(const n of future)for(const v of n.pair){const id=resolve6(a,v);if(Number.isInteger(id))advancing.add(id);}
  if(a.formatKey6.startsWith('qualifier5n'))for(const row of ranks6(a).slice(0,e.quota))advancing.add(row.id);
  if(!advancing.size)return;
  const notices=this.store().notices,known=new Set(notices.filter(n=>n.event===e.id).flatMap(n=>n.teams));
  const teams=a.entrants.filter(id=>!advancing.has(id)&&!known.has(id));if(!teams.length)return;
  const key=e.id+':'+stage+':'+before;if(notices.some(n=>n.key===key))return;
  notices.push({key,event:e.id,stage,teams,day:S.day,shown:false,participant:a.entrants.includes(S.club)&&!a.withdrawnV12&&!a.spectator13&&!e.background51});
 },
 pending(a=S.active){return (S.elimination52b?.notices||[]).find(n=>!n.shown&&n.participant&&(a?a.event===n.event:!!S.events.find(e=>e.id===n.event)?.done));},
 pause(a){const n=this.pending(a);if(!n||busy13||a.autoCoach13||S.active!==a||typeof document.createElement!=='function')return false;a.eliminationPause52b=n.key;return true;},
 markup(n){
  const e=S.events.find(e=>e.id===n.event),label=n.stage==='groups'?'Групповой этап завершён':n.stage==='ti-elimination'?'Матчи за выход завершены':'Этап отбора завершён';
  return '<section class="el52-card" aria-labelledby="el52-title"><header><span>ANCIENT MANAGER / TOURNAMENT BROADCAST</span><button type="button" onclick="Elimination52B.close()" aria-label="Пропустить анимацию вылета">Пропустить ×</button></header><div class="el52-intro"><small>'+esc(e?.name||'Турнир')+'</small><h1 id="el52-title">'+label.toUpperCase()+'</h1><p>Они покидают турнир</p><b>'+n.teams.length+' <small>ELIMINATED</small></b></div><div class="el52-teams">'+n.teams.map((id,i)=>'<article style="--delay:'+Math.min(i*.22,1.5)+'s"><small>ВЫСТУПЛЕНИЕ ЗАВЕРШЕНО</small><div class="el52-logo">'+clubAvatar12(S.teams[id],false)+'</div><h2>'+esc(S.teams[id].name)+'</h2><strong>ELIMINATED</strong></article>').join('')+'</div><footer><div><b>ИХ ПУТЬ ЗДЕСЬ ЗАВЕРШЁН.</b><p>Оставшиеся команды продолжают борьбу за трофей.</p></div><button type="button" onclick="Elimination52B.close()">Продолжить →</button></footer></section>';
 },
 show(n){
  if(this.dialog||typeof document.createElement!=='function')return;
  const d=document.createElement('dialog');d.id='eliminated52B';d.className='el52-dialog';d.setAttribute('aria-label','Команды, покинувшие турнир');d.innerHTML=this.markup(n);this.dialog=d;this.current=n.key;document.body.appendChild(d);
  d.addEventListener('cancel',event=>{event.preventDefault();this.close();});d.addEventListener('close',()=>{if(this.dialog===d)this.close();else d.remove();});d.showModal();d.querySelector('header button').focus();d.scrollTop=0;
 },
 present(){if(this.dialog||busy13||S.practice13||S.active?.autoCoach13||typeof document.querySelector!=='function'||document.querySelector('dialog[open]'))return;const n=this.pending();if(n)this.show(n);},
 dispose(){const d=this.dialog;this.dialog=null;this.current=null;if(d?.open)d.close();d?.remove();},
 close(){
  const key=this.current;if(!key){this.dispose();return;}
  const n=this.store().notices.find(n=>n.key===key);if(n)n.shown=true;
  const a=S.active,resume=a?.eliminationPause52b===key;if(resume)delete a.eliminationPause52b;
  this.dispose();save();if(resume)seekMatch6();else render();
 }
};
const phaseBeforeEliminated52B=phaseNext6;
phaseNext6=function(a,...args){const stage=a.stage6,count=a.schedule.length,result=phaseBeforeEliminated52B(a,...args);if(stage!=='playoffs'&&stage!==a.stage6)Elimination52B.capture(a,stage,count);return result;};
const renderBeforeEliminated52B=render;
render=function(...args){const result=renderBeforeEliminated52B(...args);if(S&&!Background51.finishing)Elimination52B.present();return result;};
const advanceMapBeforeEliminated52B=advanceMap,playBeforeEliminated52B=playMap;
advanceMap=function(...args){if(S.active?.eliminationPause52b){Elimination52B.present();return;}return advanceMapBeforeEliminated52B(...args);};
playMap=function(...args){if(S.active?.eliminationPause52b){Elimination52B.present();return;}return playBeforeEliminated52B(...args);};
const freshBeforeEliminated52B=fresh,migrateBeforeEliminated52B=migrate;
fresh=function(...args){Elimination52B.dispose();return freshBeforeEliminated52B(...args);};
migrate=function(...args){Elimination52B.dispose();const result=migrateBeforeEliminated52B(...args);if(S.elimination52b)S.elimination52b.notices=S.elimination52b.notices.filter(n=>n.day<=S.day&&S.events.some(e=>e.id===n.event));if(S.active?.eliminationPause52b&&!S.elimination52b?.notices.some(n=>n.key===S.active.eliminationPause52b))delete S.active.eliminationPause52b;return result;};
const validBeforeEliminated52B=validSave;
validSave=function(x){if(!validBeforeEliminated52B(x))return false;const v=x.elimination52b;if(!v)return !x.active?.eliminationPause52b;if(v.version!==1||!Array.isArray(v.notices))return false;const keys=new Set();for(const n of v.notices){if(typeof n.key!=='string'||keys.has(n.key)||!x.events.some(e=>e.id===n.event)||typeof n.stage!=='string'||!Number.isInteger(n.day)||n.day>x.day||typeof n.shown!=='boolean'||typeof n.participant!=='boolean'||!Array.isArray(n.teams)||!n.teams.length||new Set(n.teams).size!==n.teams.length||n.teams.some(id=>!Number.isInteger(id)||!x.teams[id]))return false;keys.add(n.key);}return !x.active?.eliminationPause52b||v.notices.some(n=>n.key===x.active.eliminationPause52b&&n.event===x.active.event&&!n.shown);};
// Retain access to every event's actual stage summaries without interrupting background events.
const bracketBeforeEliminated52B=bracketView;
bracketView=function(...args){const html=bracketBeforeEliminated52B(...args),event=selectedBracket??S.active?.event,notices=S.elimination52b?.notices||[],rows=notices.filter(n=>n.event===event);return html+(rows.length?'<section class="panel"><h2>Вылет после этапов</h2>'+rows.map(n=>'<p>'+n.teams.map(id=>esc(S.teams[id].name)).join(' · ')+'</p>'+btn('Показать анимацию','showElimination52B('+notices.indexOf(n)+')')).join('')+'</section>':'');};
function showElimination52B(index){const n=Number.isInteger(index)?S.elimination52b?.notices[index]:null;if(n)Elimination52B.show(n);}
