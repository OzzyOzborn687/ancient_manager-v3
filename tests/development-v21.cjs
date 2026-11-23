'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8'),files=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]); // Load current replacements; form92.cjs and beta8.cjs cover form and OVR progression.
function environment(){const elements={},data=new Map(),c=vm.createContext({console,structuredClone,URL,Blob,setTimeout:(f,ms)=>{let t=setTimeout(f,ms);t.unref();return t},clearTimeout,setInterval,clearInterval,document:{hidden:false,getElementById:id=>elements[id]??={style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',showModal(){},close(){}},addEventListener(){}},addEventListener(){},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}});vm.runInContext('window=globalThis',c);for(let f of files)vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c,{filename:f});return {elements,c,run:s=>vm.runInContext(s,c)};}
(async()=>{
 const e=environment(),run=e.run;await run('boot()');assert(run('S.gameVersion==="2.6"&&validSave(S)'));
 assert.equal(run('historicalSeason21(2026).length'),21);assert.equal(run('historicalSeason21(2027).length'),23);
 assert(run(`historicalSeason21(2026).some(e=>e.name==='DreamLeague Season 28'&&e.sourceYear21===2024&&date(e.day).includes('февр'))`));
 assert(run(`historicalSeason21(2027).some(e=>e.name==='THE INTERNATIONAL 2027'&&e.pool===30000000&&e.sourceStart21==='2025-09-04')`));
 assert(run(`!S.events.some(e=>!e.done&&e.name==='Ancient Autumn Cup')`));
 run('let calendarCopy21=JSON.stringify(S.events);ensureTournamentCalendar();ensureTournamentCalendar()');assert(run('calendarCopy21===JSON.stringify(S.events)'));
 const original=run('JSON.stringify(S)');
 run(`let developmentSnapshot21=JSON.stringify(development21()),oldCash21=S.budget;S.budget=10000000;for(let i=0;i<4;i++){if(!upgradeDevelopment21('base')||!upgradeDevelopment21('staff'))throw Error('Upgrade failed');}let paid21=10000000-S.budget;`);
 assert.equal(run('development21().base'),5);assert.equal(run('development21().staff'),5);assert.equal(run('paid21'),3275000);assert(run('S.facility===5&&S.coach===95'));assert(run('!upgradeDevelopment21("base")&&!upgradeDevelopment21("staff")&&validSave(S)'));
 run('S='+original+';S.budget=0;let emptyCash21=JSON.stringify(development21());');assert(run('upgradeDevelopment21("base")===false&&JSON.stringify(development21())===emptyCash21'));
 run('S='+original+';S.practice13={team:1,maps:[]};');assert(run('upgradeDevelopment21("staff")===false'));run('delete S.practice13');
 // V9.2 form progression is covered by form92.cjs; infrastructure contracts remain here.
 run('S='+original+';');
 assert(run(`(()=>{let p=S.players[0],s=p.skill;p.form=75;for(let i=0;i<100;i++)formRecord21(p,true,999);return p.form===75&&p.skill===s&&p.progress21.successfulDays===0;})()`),'Same-day wins cannot instantly grow form/skill');
 assert(run(`(()=>{let p=S.players[0];p.form=90;for(let day=1;day<=60;day++){S.day=day;playerGrowth13(p,'balanced',1,'teamwork');}return p.form<90;})()`),'Inactivity decays form');
 run('S='+original+';');
 assert(run(`(()=>{let p=S.players[0];p.form=80;let event={done:true,name:'Exit fixture',placements6:{0:5}};tournamentDevelopment21(event);let after=p.form;tournamentDevelopment21(event);return after===80&&p.form===after;})()`),'Placement does not stack a second form penalty');
 assert(run(`(()=>{let p=S.players[0];p.form=80;tournamentDevelopment21({done:true,name:'Top 4',placements6:{0:4}});return p.form===80;})()`),'Top four is exempt');
 assert(run(`(()=>{let p=S.players[0];p.form=80;tournamentDevelopment21({done:true,name:'Exit fixture',placements6:{0:9}});return p.form===80;})()`));
 run('S='+original+';');
 assert(run(`(()=>{let p=S.players[0],m=makeLive4({opponent:1},autoDraft([0,1]),[0,1]);m.scope13='scrim';m.finishedSide=0;resultImpact13(m);return p.progress21.results.length===0&&p.progress21.successfulDays===0;})()`));
 const prep=run(`(()=>{development21().base=1;development21().preparation=100;let m=makeLive4({opponent:1},autoDraft([0,1]),[0,1]),p=m.sides[0].heroes[0],old=unitPower5(m,p);development21().base=5;initMap13(m);let frozen=unitPower5(m,p);let n=makeLive4({opponent:1},m.draft,[0,1]);return {base:m.preparation21[0],newBase:n.preparation21[0],old,frozen};})()`);
 assert.equal(prep.base,.01);assert.equal(prep.newBase,.05);assert.equal(prep.old,prep.frozen);
 run('S='+original+';');
 for(let page of ['home','development','calendar','menu21','players','squad','finance','tactics','match']){run(`go(${JSON.stringify(page)})`);assert(e.elements.app.innerHTML.length>100);assert(!/undefined|NaN|null%/.test(e.elements.app.innerHTML),page);}
 assert(run('home().includes("md-home")&&home().includes("md-news")&&home().includes("md-progress")&&home().includes("md-schedule")'));
 assert(run(`(()=>{let groups={schedule:[{pair:[0,7],score:'2:1'}]};return tableRows21(groups,[0,1,2,3])[0].w===1;})()`));
 assert(run(`(()=>{let activeEvent=S.events[0];S.active={event:activeEvent.id};let saved=JSON.stringify(activeEvent),id=activeEvent.id;delete S.calendar21;ensureTournamentCalendar();return S.events.some(e=>e.id===id&&JSON.stringify(e)===saved);})()`),'Active tournament remains byte-for-byte unchanged during calendar migration');
 run('S='+original+';development21().staff=9');assert(!run('validSave(S)'));run('S='+original+';');
 assert(run('validSave(JSON.parse(JSON.stringify(S)))'));
 run('S='+original+';S.seed=314159;S.events=[{id:900000,name:"Development integration",series:"FISSURE",day:S.day,duration:6,pool:1000000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];breathe13=async()=>true;');
 await run('autoTournament13()');
 assert(run('S.events.find(e=>e.id===900000).done&&S.events.find(e=>e.id===900000).developmentApplied21&&!S.active&&validSave(S)'));
 assert(run('S.players[0].progress21.results.length>0&&S.players[0].progress21.lastOfficialDay!==null'));
 console.log('PASS integrated automatic tournament: actual maps, career results, frozen base buffs, standings, one-time development outcome and valid save');
 console.log('PASS v2.1: historical templates, idempotent calendar migration, costs/5-level bounds/locks, current form rules, inactivity, no duplicate exit penalties, scrim exclusion, frozen preparation, standings, all new screens and save validation');
})().catch(e=>{console.error(e);process.exitCode=1});

