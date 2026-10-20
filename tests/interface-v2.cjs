'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const files=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
const els={},data=new Map(),c=vm.createContext({console,structuredClone,URL,Blob,setTimeout:(f,ms)=>{let t=setTimeout(f,ms);t.unref();return t},clearTimeout,setInterval,clearInterval,document:{hidden:false,getElementById:id=>els[id]??={style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',showModal(){},close(){}},addEventListener(){}},addEventListener(){},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}});
vm.runInContext('window=globalThis',c);for(let f of files)vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c,{filename:f});const run=s=>vm.runInContext(s,c);
(async()=>{
 await run('boot()');assert(run('validSave(S)&&S.gameVersion==="2.6"'));
 for(let id of run('PAGES.map(p=>p[0])')){run(`go(${JSON.stringify(id)})`);assert(els.app.innerHTML.length>100,id);assert(!/undefined|NaN|null%/.test(els.app.innerHTML),id);}
 assert(run('S.players.filter(p=>!p.fiction).every(p=>!!bio20(p)&&!!photo20(p))'),'Missing: '+run('S.players.filter(p=>!p.fiction&&(!bio20(p)||!photo20(p))).map(p=>[p.name,!!bio20(p),!!photo20(p)])'));
 run('profile(0)');assert(run('page==="player"'));assert(els.app.innerHTML.includes('Chunyu')&&els.app.innerHTML.includes('Wang')&&els.app.innerHTML.includes('[XG]'));
 assert(!/Стиль игрока|Черты характера|Амбиции|Лидерство/.test(els.app.innerHTML));assert(els.app.innerHTML.includes('renew(0)')&&els.app.innerHTML.includes('askRetirePlayer(0)'));
 run('S.players[0].team=15;profile(0)');assert(els.app.innerHTML.includes('[Liquid]'));assert(!els.app.innerHTML.includes('renew(0)'));run('S.players[0].team=0');
 run('playerSearch20="Chunyu"');assert(run('playerMatches20().length===1'));run('playerSearch20="zzzzzz"');assert(run('playerCards20().includes("не найдены")'));run('playerSearch20="";playerClub20="0"');assert(run('playerMatches20().every(p=>p.team===0)'));run('playerClub20=""');
 const snapshot=run('JSON.stringify(S)');run(`S.events.push({id:99991,name:'Award 2026',day:1,done:true,champion:S.club,pool:100},{id:99992,name:'Other Club',day:2,done:true,champion:1,pool:200},{id:99993,name:'Award 2027',day:100,done:true,champion:S.club,pool:300},{id:99994,name:'Pending',day:3,done:false,champion:S.club,pool:300})`);
 assert.equal(run('wins20(S.club,2026).filter(e=>e.id>=99991).length'),1);assert.equal(run('wins20(S.club,2027).filter(e=>e.id>=99991).length'),1);assert.equal(run('wins20(1,2026).filter(e=>e.id>=99991).length'),1);
 run('awardYear20=2027;go("trophies")');assert(els.app.innerHTML.includes('Award 2027')&&!els.app.innerHTML.includes('Award 2026'));run('S='+snapshot+';awardYear20=null;');
 run('let fiction20=academy(null,2);profile(fiction20.id)');assert(els.app.innerHTML.includes('Биография не заполнена')&&!els.app.innerHTML.includes('источник биографии'));assert(run('validSave(S)'));
 run('go("match")');assert(els.app.innerHTML.includes('Следующая серия впереди'));
 run('let ne20=nextEvent();S.day=ne20.day;ne20.qualified13=S.teams.slice(0,FORMAT6[formatKey6(ne20)].n).map(t=>t.id);startEvent();go("match")');assert(run('!!S.active'));assert(els.app.innerHTML.length>100);run('playMap()');assert(run('!!S.active.live'));run('profile(0)');assert(run('page==="player"&&!!S.active.live&&validSave(S)'));run('go("match")');assert(els.app.innerHTML.includes('Карта'));
 await run('saveQueue');assert(data.get('ancient-manager-v1'));console.log('PASS v2.0: every tab, all biographies/photos, full-page player profile, dynamic team tags, filters, year/club awards, fictional fallback, contracts, active map navigation and save');
})().catch(e=>{console.error(e);process.exitCode=1});

