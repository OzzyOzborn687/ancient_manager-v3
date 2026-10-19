'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8'),files=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
function environment(){const elements={},data=new Map(),c=vm.createContext({console,structuredClone,URL,Blob,setTimeout:(f,ms)=>{let t=setTimeout(f,ms);t.unref();return t},clearTimeout,setInterval,clearInterval,document:{hidden:false,getElementById:id=>elements[id]??={style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',showModal(){},close(){}},addEventListener(){}},addEventListener(){},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}});vm.runInContext('window=globalThis',c);for(let f of files)vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c,{filename:f});return {elements,c,run:s=>vm.runInContext(s,c)};}
(async()=>{
 const e=environment(),run=e.run;await run('boot()');assert(run('S.gameVersion==="2.1"&&validSave(S)'));
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
 // Use calendar days with identical successful official results; never tick contracts or change opponents.
 const traces=run(`(()=>{let result=[];for(let staff of [1,5]){S=JSON.parse(${JSON.stringify(original)});let p=S.players[0],d=development21();d.staff=staff;p.skill=80;p.potential=99;p.form=75;p.fatigue=5;p.progress21={initialForm:75,initialSkill:80,successfulDays:0,lastOfficialDay:null,lastTitleDay:0,lastPenaltyDay:null,results:[],lastDailyDay:0};let trace=[],peak=null;for(let day=1;day<=90;day++){S.day=day;if(day===1||day%7===0)for(let j=0;j<6;j++)formRecord21(p,true,999);playerGrowth13(p,'balanced',1,'teamwork');if(day%30===0)trace.push({day,form:p.form,skill:p.skill});if(peak===null&&p.form>=94.99)peak=day;}result.push({staff,trace,peak,skill:p.skill});}return result;})()`);
 for(let t of traces){assert(t.trace[0].form<90);assert(t.peak>=60&&t.peak<=90);assert(t.skill>80&&t.skill<82);}assert(traces[1].skill>traces[0].skill);assert(traces[1].peak<=traces[0].peak);console.log('Successful season form/OVR traces:',traces);
 run('S='+original+';');
 assert(run(`(()=>{let p=S.players[0],s=p.skill;p.form=75;for(let i=0;i<100;i++)formRecord21(p,true,999);return p.form===75&&p.skill===s&&p.progress21.successfulDays===0;})()`),'Same-day wins cannot instantly grow form/skill');
 assert(run(`(()=>{let p=S.players[0];p.form=90;for(let day=1;day<=60;day++){S.day=day;playerGrowth13(p,'balanced',1,'teamwork');}return p.form<90;})()`),'Inactivity decays form');
 run('S='+original+';');
 assert(run(`(()=>{let p=S.players[0];p.form=80;let event={done:true,name:'Exit fixture',placements6:{0:5}};tournamentDevelopment21(event);let after=p.form;tournamentDevelopment21(event);return Math.abs(after-76.8)<1e-8&&p.form===after;})()`),'Early exit is a relative, one-time 4% loss');
 assert(run(`(()=>{let p=S.players[0];p.form=80;tournamentDevelopment21({done:true,name:'Top 4',placements6:{0:4}});return p.form===80;})()`),'Top four is exempt');
 assert(run(`(()=>{let p=S.players[0];p.form=80;tournamentDevelopment21({done:true,name:'Exit fixture',placements6:{0:9}});return Math.abs(p.form-74.4)<1e-8;})()`));
 run('S='+original+';');
 assert(run(`(()=>{let p=S.players[0],m=makeLive4({opponent:1},autoDraft([0,1]),[0,1]);m.scope13='scrim';m.finishedSide=0;resultImpact13(m);return p.progress21.results.length===0&&p.progress21.successfulDays===0;})()`));
 const prep=run(`(()=>{development21().base=1;development21().preparation=100;let m=makeLive4({opponent:1},autoDraft([0,1]),[0,1]),p=m.sides[0].heroes[0],old=unitPower5(m,p);development21().base=5;initMap13(m);let frozen=unitPower5(m,p);let n=makeLive4({opponent:1},m.draft,[0,1]);return {base:m.preparation21[0],newBase:n.preparation21[0],old,frozen};})()`);
 assert.equal(prep.base,.01);assert.equal(prep.newBase,.05);assert.equal(prep.old,prep.frozen);
 run('S='+original+';');
 for(let page of ['home','development','calendar','menu21','players','squad','finance','tactics','match']){run(`go(${JSON.stringify(page)})`);assert(e.elements.app.innerHTML.length>100);assert(!/undefined|NaN|null%/.test(e.elements.app.innerHTML),page);}
 assert(run('home().includes("reference-dashboard21")&&home().includes("news-board21")&&home().includes("group-panels21")&&home().includes("schedule-rail21")'));
 assert(run(`(()=>{let groups={schedule:[{pair:[0,7],score:'2:1'}]};return tableRows21(groups,[0,1,2,3])[0].w===1;})()`));
 assert(run(`(()=>{let activeEvent=S.events[0];S.active={event:activeEvent.id};let saved=JSON.stringify(activeEvent),id=activeEvent.id;delete S.calendar21;ensureTournamentCalendar();return S.events.some(e=>e.id===id&&JSON.stringify(e)===saved);})()`),'Active tournament remains byte-for-byte unchanged during calendar migration');
 run('S='+original+';development21().staff=9');assert(!run('validSave(S)'));run('S='+original+';');
 assert(run('validSave(JSON.parse(JSON.stringify(S)))'));
 run('S='+original+';S.seed=314159;S.events=[{id:900000,name:"Development integration",series:"FISSURE",day:S.day,duration:6,pool:1000000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];breathe13=async()=>true;');
 await run('autoTournament13()');
 assert(run('S.events.find(e=>e.id===900000).done&&S.events.find(e=>e.id===900000).developmentApplied21&&!S.active&&validSave(S)'));
 assert(run('S.players[0].progress21.results.length>0&&S.players[0].progress21.lastOfficialDay!==null'));
 console.log('PASS integrated automatic tournament: actual maps, career results, frozen base buffs, standings, one-time development outcome and valid save');
 console.log('PASS v2.1: historical templates, idempotent calendar migration, costs/5-level bounds/locks, calendar-time peak, staff acceleration, long potential growth, inactivity, early exits, scrim exclusion, frozen preparation, standings, all new screens and save validation');
})().catch(e=>{console.error(e);process.exitCode=1});
