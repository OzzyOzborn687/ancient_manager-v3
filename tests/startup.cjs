'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
// Execute exactly the scripts and order shipped in HTML, not a parallel hand-written list.
const html=fs.readFileSync('dist/index.html','utf8');
const files=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
assert.equal(new Set(files).size,files.length,'HTML must not load a script twice');
assert(files.indexOf('world-v1.2.js')>=0,'v1.3 requires world-v1.2.js');
assert(files.indexOf('world-v1.2.js')<files.indexOf('world-v1.3.js'),'v1.2 must load before v1.3');
assert(html.includes('window.gameReady=startAncientManager();'),'HTML must start the guarded boot');
function environment(data=new Map(),options={}){
 const elements={},events={},downloads=[];
 const document={hidden:false,body:{appendChild(){}},getElementById:id=>elements[id]??={style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',value:'',showModal(){},close(){}},addEventListener(){},createElement:()=>({click(){downloads.push(this.download)},remove(){}})};
 const c=vm.createContext({console:{...console,error(){}},structuredClone,URL,Blob,setTimeout:(fn,ms,...args)=>{let t=setTimeout(fn,ms,...args);if(ms>=3800)t.unref();return t},clearTimeout,setInterval,clearInterval,document,addEventListener:(type,fn)=>events[type]=fn,localStorage:{getItem:k=>{if(options.denied)throw Error('Storage disabled');return data.get(k)||null},setItem:(k,v)=>{if(options.denied)throw Error('Storage disabled');data.set(k,v)}}});
 vm.runInContext('window=globalThis',c);
 if(options.stalled)c.indexedDB={open(){let req={result:{objectStoreNames:{contains:()=>true},close(){},transaction(){return {objectStore(){return {get(){return {}},put(){}}}}}}};setTimeout(()=>req.onsuccess?.(),0);return req;}};
 for(let file of files)vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),c,{filename:file});
 return {data,elements,c,events,downloads,run:code=>vm.runInContext(code,c),start:()=>vm.runInContext('startAncientManager()',c)};
}
function opened(e){assert(!e.elements.app.innerHTML.includes('Восстанавливаем карьеру…'));assert(e.run('ancientStartup.ready'));assert(e.run('validSave(S)'));}
(async()=>{
 let e=environment();e.events.error({target:{tagName:'IMG',src:'missing-logo.webp'}});assert.equal(e.run('ancientStartup.error'),null);await e.start();opened(e);console.log('Fresh boot with real storage/render: PASS');
 e.run('S.day=42;S.budget=765432;save()');await e.run('saveQueue');let data=new Map(e.data),snapshot=data.get('ancient-manager-v1');
 e=environment(data);await e.start();opened(e);assert.equal(e.run('S.day'),42);assert.equal(e.run('S.budget'),765432);console.log('v1.3 saved career reload: PASS');
 let legacy=e.run(`(()=>{let x=structuredClone(S);delete x.world13;x.gameVersion='1.2';x.players=x.players.filter(p=>!p.profile13&&!p.scenarioPlayer13);for(let p of x.players){delete p.attributes13;delete p.heroPractice13;}for(let t of x.teams)delete t.career13;return JSON.stringify(makePacket(x,'v1.2 fixture'));})()`);
 e=environment(new Map([['ancient-manager-v1',legacy]]));await e.start();opened(e);assert.equal(e.run('S.day'),42);assert.equal(e.run('S.budget'),765432);assert.equal(e.run('S.players.filter(p=>p.name==="fy").length'),1);console.log('v1.2 migration via actual boot: PASS');
 e.run(`S.events=[{id:0,name:'Startup FISSURE',series:'FISSURE',day:S.day,duration:3,pool:1000000,qualified13:[0,1,2,3,4,5,6,7]}];startEvent();playMap();simulateTick4(S.active.live,10);save()`);await e.run('saveQueue');let activeRaw=e.data.get('ancient-manager-v1'),clock=e.run('S.active.live.clock'),gold=e.run('S.active.live.gold');e=environment(new Map([['ancient-manager-v1',activeRaw]]));await e.start();opened(e);assert.equal(e.run('S.active.live.clock'),clock);assert.equal(e.run('S.active.live.gold'),gold);assert(e.elements.app.innerHTML.includes('Управление матчем'));console.log('Active map restore through real boot: PASS');
 e=environment(new Map([['ancient-manager-v1',snapshot]]),{stalled:true});let start=Date.now();await Promise.race([e.start(),new Promise((_,reject)=>{let t=setTimeout(()=>reject(Error('Startup hung')),6000);t.unref();})]);opened(e);assert.equal(e.run('S.budget'),765432);assert(Date.now()-start<6000);console.log('IndexedDB reads/writes never settle: local career opens in',Date.now()-start,'ms');
 e=environment(new Map(),{denied:true});await e.start();opened(e);assert(e.run('storageHealth.includes("не подтверждено")'));console.log('Storage denied: usable game + visible save warning PASS');
 e=environment(new Map([['ancient-manager-v1',snapshot]]));e.run('migrate=()=>{S.budget=0;throw Error("migration fixture")}');await e.start();assert(e.elements.app.innerHTML.includes('Не удалось завершить загрузку'));assert.equal(e.data.get('ancient-manager-v1'),snapshot);assert(e.run('recoveryBlocked'));e.run('downloadStartupSave()');assert.equal(e.downloads.length,1);console.log('Migration failure: visible recovery, original bytes untouched, export available PASS');
 e=environment(new Map([['ancient-manager-v1','broken-json']]));await e.start();assert.equal(e.data.get('ancient-manager-v1'),'broken-json');assert(e.elements.modal.innerHTML.includes('Скачать исходное сохранение'));console.log('Unreadable save is retained: PASS');
 console.log('PASS startup regression');
})().catch(e=>{console.error(e);process.exitCode=1;});

