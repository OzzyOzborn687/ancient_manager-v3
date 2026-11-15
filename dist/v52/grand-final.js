'use strict';
const GrandFinal52C={
 dialog:null,state:null,key:null,
 match(){
  const a=S?.active,n=a?.schedule?.[a.cursor],e=S?.events.find(e=>e.id===a?.event);
  if(!a?.format6||!n?.championship||n.score||a.withdrawnV12||a.spectator13||a.autoCoach13||e?.background51||busy13||S.practice13||!e)return null;
  const pair=n.pair.map(v=>resolve6(a,v));
  if(pair.length!==2||pair[0]===pair[1]||pair.some(id=>!Number.isInteger(id)||!S.teams[id])||!pair.includes(S.club)||a.maps?.length||a.live||a.seriesDone||a.score?.some(Boolean))return null;
  return {a,n,e,pair,key:a.event+':'+n.id};
 },
 markup(m){
  const {e,n,pair}=m,need=Math.floor(n.bo/2)+1,edition=e.season??e.edition??e.sourceYear21??'';
  return '<section class="gf52-card" aria-labelledby="gf52-title"><header><span>ANCIENT MANAGER / GRAND FINAL BROADCAST</span><button type="button" onclick="GrandFinal52C.close()">Пропустить ×</button></header><div class="gf52-intro" aria-hidden="true"><small>THE FINAL CHAPTER</small><b>GRAND FINAL</b><span>'+esc(e.name)+'</span></div><div class="gf52-heading"><small>ПОСЛЕДНЯЯ СЕРИЯ ТУРНИРА</small><h1 id="gf52-title">'+esc(e.name)+'</h1><p>ГРАНД-ФИНАЛ · BEST OF '+n.bo+(edition!==''?' · ВЫПУСК '+esc(String(edition)):'')+'</p></div><div class="gf52-arena">'+pair.map((id,i)=>'<article class="gf52-team gf52-team-'+i+'"><small>ФИНАЛИСТ</small><div class="gf52-logo">'+clubAvatar12(S.teams[id],false)+'</div><h2>'+esc(S.teams[id].name)+'</h2><p>В одном шаге от титула</p></article>').join('<div class="gf52-cup"><div class="gf52-halo"></div>'+Trophy4B.sprite(Trophy4B.select(e).key)+'<small>'+esc(e.name)+' · THE TROPHY</small></div>')+'</div><footer><div><b>ЗДЕСЬ ОСТАНЕТСЯ ТОЛЬКО ЧЕМПИОН.</b><p>Серия до '+need+' побед. Один трофей.</p></div><strong>0 : 0</strong><button type="button" onclick="GrandFinal52C.close()">К ГРАНД-ФИНАЛУ →</button></footer></section>';
 },
 present(){
  if(this.dialog||typeof document.querySelector!=='function'||document.querySelector('dialog[open]'))return;
  const m=this.match();if(!m||m.a.grandFinalSeen52c===m.key||typeof document.createElement!=='function')return;
  const d=document.createElement('dialog');d.id='grandFinal52C';d.className='gf52-dialog';d.setAttribute('aria-label','Гранд-финал '+m.e.name);d.innerHTML=this.markup(m);this.dialog=d;this.state=S;this.key=m.key;document.body.appendChild(d);
  d.addEventListener('cancel',event=>{event.preventDefault();this.close();});d.addEventListener('close',()=>{if(this.dialog===d)this.close();else d.remove();});d.showModal();d.querySelector('footer button').focus();d.scrollTop=0;
 },
 dispose(){const d=this.dialog;this.dialog=null;this.state=null;this.key=null;if(d?.open)d.close();d?.remove();},
 close(){const m=this.match();if(this.state===S&&m?.key===this.key){m.a.grandFinalSeen52c=m.key;this.dispose();save();render();}else this.dispose();},
 blocked(){const m=this.match();if(m&&m.a.grandFinalSeen52c!==m.key&&typeof document.createElement==='function'){this.present();return true;}return false;}
};
const renderBeforeGrandFinal52C=render;
render=function(...args){const result=renderBeforeGrandFinal52C(...args);if(S&&!Background51.finishing)GrandFinal52C.present();return result;};
const playBeforeGrandFinal52C=playMap,advanceBeforeGrandFinal52C=advanceMap;
playMap=function(...args){if(GrandFinal52C.blocked())return;return playBeforeGrandFinal52C(...args);};
advanceMap=function(...args){if(GrandFinal52C.blocked())return;return advanceBeforeGrandFinal52C(...args);};
const freshBeforeGrandFinal52C=fresh,migrateBeforeGrandFinal52C=migrate;
fresh=function(...args){GrandFinal52C.dispose();return freshBeforeGrandFinal52C(...args);};
migrate=function(...args){GrandFinal52C.dispose();return migrateBeforeGrandFinal52C(...args);};
