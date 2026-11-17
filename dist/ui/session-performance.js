'use strict';
// V6.0 B: bounded autosave work and a self-contained, lossless cold match archive.
const Session60B={delay:120,pending:null,task:null,timer:null,resolve:null,trusted:null,writes:0,snapshots:0,
 packet(state){const current=JSON.stringify(state);this.snapshots++;return {current,raw:'{"format":"AncientManager3","name":"Автосохранение","updatedAt":'+JSON.stringify(new Date().toISOString())+',"checksum":'+JSON.stringify(checksum(current))+',"state":'+current+'}'};},
 request(){if(!S||recoveryBlocked)return saveQueue;this.pending=S;if(!this.task){this.task=new Promise(resolve=>{this.resolve=resolve;});saveQueue=this.task;this.timer=setTimeout(()=>{this.timer=null;this.flush();},this.delay);}return saveQueue;},
 async flush(){let result;try{while(this.pending){const state=this.pending;this.pending=null;const packet=this.packet(state);if(packet.current===lastAuto)continue;
   const previous=STORE_CACHE.get(KEY);let validPrevious=previous===this.trusted;if(previous&&!validPrevious)validPrevious=!!decodePacket(previous);
   $('saveStatus').textContent='Сохраняем…';const serial=++saveSerial;
   // persist writes localStorage synchronously before its first await.
   result=await persist(KEY,packet.raw);this.writes++;
   if(result.ok){lastAuto=packet.current;this.trusted=packet.raw;if(previous&&validPrevious&&previous!==packet.raw)await persist(KEY+'-previous',previous);}else lastAuto='';
   if(serial===saveSerial){storageHealth=healthText(result);paintStorageStatus();}
  }}catch(error){lastAuto='';storageHealth='Сохранение не подтверждено — скачай JSON';paintStorageStatus();}
  finally{const done=this.resolve;this.task=null;this.resolve=null;done?.(result);}
 },
 checkpoint(){if(!S||recoveryBlocked)return;let raw;try{raw=this.packet(S).raw;localStorage.setItem(KEY,raw);}catch(error){}this.request();if(this.timer!==null){clearTimeout(this.timer);this.timer=null;this.flush();}else if(raw){persist(KEY,raw).catch(()=>{});}}
};
save=function(){const result=Session60B.request();MatchArchive60B.schedule();return result;};
const MatchArchive60B={keep:5,running:false,scheduled:false,failed:new WeakSet(),reportToken:0,
 supported(){return typeof CompressionStream==='function'&&typeof DecompressionStream==='function'&&typeof Response==='function';},
 async transform(bytes,decode=false){const stream=new Blob([bytes]).stream().pipeThrough(decode?new DecompressionStream('gzip'):new CompressionStream('gzip'));return new Uint8Array(await new Response(stream).arrayBuffer());},
 encode(bytes){let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(value);},
 async read(entry){const a=entry.matchArchive60b;if(!a)return entry.maps;const bytes=Uint8Array.from(atob(a.data),c=>c.charCodeAt(0)),text=new TextDecoder().decode(await this.transform(bytes,true));if(checksum(text)!==a.checksum)throw Error('Archive checksum');const maps=JSON.parse(text);if(!Array.isArray(maps)||maps.length!==entry.maps.length)throw Error('Archive maps');return maps;},
 summary(m){return {win:m.win,duration:m.duration,durationSec:m.durationSec,kills:m.kills,deaths:m.deaths,gold:m.gold,towers:m.towers,rosh:m.rosh,tactic:m.tactic,prob:m.prob,players:(m.players||[]).map(p=>({name:p.name,hero:p.hero,k:p.k,d:p.d,a:p.a}))};},
 async pack(entry,state=S){if(entry.matchArchive60b||!Array.isArray(entry.maps)||!entry.maps.length)return false;const original=entry.maps,text=JSON.stringify(original);if(text.length<8192)return false;
  const bytes=await this.transform(new TextEncoder().encode(text)),archive={version:1,codec:'gzip',checksum:checksum(text),data:this.encode(bytes)};
  if(archive.data.length>=text.length)return false;
  const candidate={maps:original,matchArchive60b:archive};if(JSON.stringify(await this.read(candidate))!==text)throw Error('Archive verification');
  if(S!==state||entry.maps!==original||!state.history.includes(entry))return false;
  entry.maps=original.map(m=>this.summary(m));entry.matchArchive60b=archive;return true;
 },
 schedule(){if(!this.supported()||this.running||this.scheduled||!S?.history?.slice(this.keep).some(h=>!h.matchArchive60b&&!this.failed.has(h)&&Array.isArray(h.maps)&&h.maps.length>0))return;
  this.scheduled=true;setTimeout(()=>{this.scheduled=false;this.run();},250);
 },
 async run(){if(this.running||!this.supported()||!S)return;this.running=true;const state=S;try{for(const h of state.history.slice(this.keep)){if(S!==state)break;if(h.matchArchive60b||this.failed.has(h))continue;try{if(await this.pack(h,state))Session60B.request();else this.failed.add(h);}catch(error){this.failed.add(h);}await new Promise(resolve=>setTimeout(resolve,0));}}finally{this.running=false;}}
};
const reportBeforeArchive60B=report;report=async function(index){const entry=S.history[index];if(!entry?.matchArchive60b){MatchArchive60B.reportToken++;return reportBeforeArchive60B(index);}const state=S;openModal('<h2>Открываем отчёт…</h2><p>Подробности сохранённой серии загружаются.</p>');const token=MatchArchive60B.reportToken;try{const maps=await MatchArchive60B.read(entry);if(S!==state||S.history[index]!==entry||token!==MatchArchive60B.reportToken||!$('modal').open)return;const full={...entry,maps};S.history[index]=full;try{return reportBeforeArchive60B(index);}finally{S.history[index]=entry;}}catch(error){if(token===MatchArchive60B.reportToken)openModal('<h2>Не удалось открыть подробный отчёт</h2><p>Результат серии сохранён. Попробуйте открыть отчёт повторно.</p>'+btn('Закрыть','closeModal()'));}};
const openBeforeArchive60B=openModal;openModal=function(...args){MatchArchive60B.reportToken++;return openBeforeArchive60B(...args);};
const closeBeforeArchive60B=closeModal;closeModal=function(...args){MatchArchive60B.reportToken++;return closeBeforeArchive60B(...args);};
const validBeforeArchive60B=validSave;validSave=function(x){return validBeforeArchive60B(x)&&x.history.every(h=>{const a=h.matchArchive60b;return a===undefined||a&&a.version===1&&a.codec==='gzip'&&typeof a.checksum==='string'&&/^[0-9a-f]{1,8}$/.test(a.checksum)&&typeof a.data==='string'&&a.data.length>=4&&a.data.length%4===0&&/^[A-Za-z0-9+/]*={0,2}$/.test(a.data)&&Array.isArray(h.maps)&&h.maps.length>0;});};
if(typeof document.addEventListener==='function')document.addEventListener('visibilitychange',()=>{if(document.hidden)Session60B.checkpoint();});
if(typeof window.addEventListener==='function')window.addEventListener('pagehide',()=>Session60B.checkpoint());
