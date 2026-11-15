'use strict';
// Presentation only: one transient reveal after an actual successful player purchase.
const TransferReveal52={
 current:null,returnFocus:null,dialog:null,
 portrait(p){
  const src=photo20(p),fallback='<span class="t52-silhouette" '+(src?'hidden':'')+'><svg viewBox="0 0 100 110" aria-hidden="true"><circle cx="50" cy="32" r="20"/><path d="M12 110V92c0-23 17-37 38-37s38 14 38 37v18z"/></svg><small>Фото недоступно</small></span>';
  return '<span class="portrait20">'+(src?'<img src="'+esc(src)+'" alt="'+esc(p.name)+'" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false">':'')+fallback+'</span>';
 },
 identity(p){const bio=bio20(p);return nameKey4(p.name)==='satanic'?{first:'Алан',last:'Галлямов'}:{first:bio?.first||'',last:bio?.last||''};},
 markup(t){
  const {from,to,player}=t,n=this.identity(player);
  const name=(intro=false)=>'<div class="w6-first">'+esc(n.first)+'</div><'+(intro?'div':'h1')+' '+(intro?'':'id="t52-name" ')+'class="w6-nick">'+esc(player.name)+'</'+(intro?'div':'h1')+'><div class="w6-last">'+esc(n.last)+'</div>';
  return '<section class="t52-card w6-card" aria-labelledby="t52-name"><header class="t52-header w6-header"><span>ANCIENT MANAGER / PLAYER INTRODUCTION</span><button type="button" class="t52-skip" onclick="TransferReveal52.close()" aria-label="Пропустить анимацию трансфера">Пропустить ×</button></header><div class="w6-arena" aria-hidden="true"></div><div class="w6-backword" aria-hidden="true">'+esc(to.short||to.name)+'</div><div class="t52-photo w6-photo">'+this.portrait(player)+'</div><div class="w6-copy"><small>WELCOME TO THE NEXT CHAPTER</small>'+name()+'<div class="w6-role"><b>POS '+String(player.role+1).padStart(2,'0')+'</b><span>'+esc(ROLES[player.role])+'</span></div></div><div class="w6-signed">✓ CONTRACT SIGNED</div><section class="w6-route" aria-label="Переход между клубами"><div class="w6-route-club"><small>ПРЕДЫДУЩИЙ КЛУБ</small><strong>'+esc(from?.name||'Свободный агент')+'</strong><div class="w6-club-logo">'+(from?clubAvatar12(from,false):'<span class="w6-agent" aria-label="Свободный агент">FA</span>')+'</div></div><b class="w6-arrow" aria-hidden="true">→</b><div class="w6-route-club"><small>НОВЫЙ КЛУБ</small><strong>'+esc(to.name)+'</strong><div class="w6-club-logo">'+clubAvatar12(to,false)+'</div></div></section><footer class="w6-footer"><div><small>'+(from?'СУММА ТРАНСФЕРА':'ПОДПИСНОЙ БОНУС')+'</small><strong>'+esc(cash(t.fee))+'</strong></div><button type="button" onclick="TransferReveal52.squad()">К составу →</button></footer><div class="t52-intro w6-intro" aria-hidden="true"><small>INTRODUCING / '+esc(to.name)+'</small>'+name(true)+'<div class="w6-rule"></div></div><div class="w6-slice" aria-hidden="true"></div></section>';
 },
 show(t){
  this.close();this.current=t;
  if(typeof document.createElement!=='function')return;
  const dialog=document.createElement('dialog');dialog.id='transferReveal52';dialog.className='t52-dialog';dialog.setAttribute('aria-label','Подписание игрока '+t.player.name);dialog.innerHTML=this.markup(t);
  this.returnFocus=document.activeElement;this.dialog=dialog;document.body.appendChild(dialog);
  dialog.addEventListener('close',()=>{if(this.dialog===dialog)this.close();else dialog.remove();});
  dialog.addEventListener('cancel',event=>{event.preventDefault();this.close();});
  dialog.addEventListener('click',event=>{if(event.target===dialog)this.close();});
  dialog.showModal();dialog.querySelector('.t52-skip').focus();
 },
 close(){this.current=null;const d=this.dialog||document.getElementById('transferReveal52'),focus=this.returnFocus;this.dialog=null;this.returnFocus=null;if(d?.open)d.close();d?.remove?.();if(focus?.isConnected)focus.focus();},
 squad(){this.close();go('squad');}
};
const buyBeforeReveal52=buy;
buy=function(id,...args){
 const state=S,p=S.players[id],from=p?.team,to=S.club;
 const source=from==null?null:structuredClone(S.teams[from]);
 const result=buyBeforeReveal52(id,...args);
 if(p&&S===state&&from!==to&&p.team===to&&Number.isFinite(p.paid))TransferReveal52.show({player:structuredClone(p),from:source,to:structuredClone(S.teams[to]),fee:p.paid});
 return result;
};
const freshBeforeReveal52=fresh,migrateBeforeReveal52=migrate;
fresh=function(...args){TransferReveal52.close();return freshBeforeReveal52(...args);};
migrate=function(...args){TransferReveal52.close();return migrateBeforeReveal52(...args);};
