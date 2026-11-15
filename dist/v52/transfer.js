'use strict';
// Presentation only: one transient reveal after an actual successful player purchase.
const TransferReveal52={
 current:null,returnFocus:null,dialog:null,
 portrait(p){
  const src=photo20(p),fallback='<span class="t52-silhouette" '+(src?'hidden':'')+'><svg viewBox="0 0 100 110" aria-hidden="true"><circle cx="50" cy="32" r="20"/><path d="M12 110V92c0-23 17-37 38-37s38 14 38 37v18z"/></svg><small>Фото недоступно</small></span>';
  return '<span class="portrait20">'+(src?'<img src="'+esc(src)+'" alt="'+esc(p.name)+'" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false">':'')+fallback+'</span>';
 },
 markup(t){
  const from=t.from,to=t.to;
  return '<section class="t52-card" aria-labelledby="t52-name"><div class="t52-grid"></div><div class="t52-halo"></div><div class="t52-stripe"></div>'+
   '<header class="t52-header"><span>ANCIENT MANAGER / TRANSFER REVEAL</span><button type="button" class="t52-skip" onclick="TransferReveal52.close()" autofocus aria-label="Пропустить анимацию трансфера">Пропустить ×</button></header>'+
   '<div class="t52-intro" aria-hidden="true"><b>✓</b><h2>КОНТРАКТ ПОДПИСАН</h2><p>НОВАЯ ГЛАВА НАЧИНАЕТСЯ</p></div>'+
   '<div class="t52-route">'+(from?clubAvatar12(from,true):'<span class="t52-agent">↗</span>')+'<div><small>ПРЕДЫДУЩИЙ КЛУБ</small><strong>'+esc(from?.name||'Свободный агент')+'</strong></div><span class="t52-arrow">→</span><div><small>НОВЫЙ КЛУБ</small><strong>'+esc(to.name)+'</strong></div></div>'+
   '<div class="t52-club">'+clubAvatar12(to,true)+'<div><strong>'+esc(to.name)+'</strong><small>ROSTER UPDATE</small></div></div>'+
   '<div class="t52-photo">'+this.portrait(t.player)+'<i></i></div>'+
   '<div class="t52-copy"><span class="t52-eyebrow">НОВОЕ ИМЯ. НОВАЯ ЭНЕРГИЯ.</span><p class="t52-welcome">WELCOME,</p><h1 id="t52-name" class="t52-name">'+esc(t.player.name)+'</h1><div class="t52-line"></div><div class="t52-role"><b>POS '+(t.player.role+1)+'</b><span>'+esc(ROLES[t.player.role])+'</span></div><div class="t52-fee"><small>'+ (from?'СУММА ТРАНСФЕРА':'ПОДПИСНОЙ БОНУС')+'</small><strong>'+esc(cash(t.fee))+'</strong></div></div>'+
   '<footer class="t52-footer"><div><b>✓ ТРАНСФЕР ЗАВЕРШЁН</b><small>'+esc(from?.name||'Свободный агент')+' → '+esc(to.name)+'</small></div><button type="button" onclick="TransferReveal52.squad()">К составу →</button></footer></section>';
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
