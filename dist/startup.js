'use strict';
// The legacy screen named history() shadows window.history in some runtimes.
window.ancientNavigationHistory=window.history;
// Runs before the game scripts so failures do not leave an indefinite splash screen.
window.ancientStartup={ready:false,running:false,error:null};
function startupText(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function showStartupError(error){
 const state=window.ancientStartup;state.error=String(error?.message||error||'Неизвестная ошибка');state.running=false;
 try{recoveryBlocked=true;}catch(_){}
 const app=document.getElementById('app'),advance=document.getElementById('advance');if(advance)advance.disabled=true;
 if(app)app.innerHTML='<section class="panel"><h2>Не удалось завершить загрузку</h2><p>Исходные сохранения остаются в браузере. Можно повторить загрузку или скачать копию для восстановления.</p><p class="sub">Ошибка: '+startupText(state.error)+'</p><div class="actions"><button class="primary" onclick="startAncientManager()">Повторить загрузку</button><button onclick="downloadStartupSave()">Скачать сохранение</button></div></section>';
}
function downloadStartupSave(){
 const keys=['ancient-manager-v1','ancient-manager-v1-previous','ancient-manager-backup','ancient-manager-before-update','ancient-manager-unreadable',...Array.from({length:5},(_,i)=>'ancient-manager-slot-'+i)],copies={};
 try{if(typeof STORE_CACHE!=='undefined')for(const [key,raw] of STORE_CACHE)if(raw)copies[key]=raw;}catch(_){}
 for(const key of keys)try{const raw=localStorage.getItem(key);if(raw&&!copies[key])copies[key]=raw;}catch(_){}
 const primary=copies['ancient-manager-v1'];let payload=primary;
 if(!payload)payload=JSON.stringify({format:'AncientManagerRecovery',copies,error:window.ancientStartup.error},null,2);
 const blob=new Blob([payload],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Ancient-Manager-recovery.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function startAncientManager(){
 const state=window.ancientStartup;if(state.running)return;state.running=true;state.ready=false;
 try{if(typeof boot!=='function')throw Error('Не загрузились файлы игры. Обновите страницу.');await boot();state.ready=true;state.error=null;}
 catch(error){console.error('Ancient Manager startup:',error);showStartupError(error);}
 finally{state.running=false;}
}
window.addEventListener('error',event=>{if(window.ancientStartup.ready)return;if(event.target&&event.target!==window&&event.target.tagName!=='SCRIPT')return;let error=event.error||new Error(event.target?.src?'Не загрузился файл '+event.target.src:event.message||'Ошибка запуска');window.ancientStartup.error=String(error.message||error);if(document.getElementById('app'))showStartupError(error);},true);

