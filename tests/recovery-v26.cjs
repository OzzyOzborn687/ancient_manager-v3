'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
// Load the shipped HTML. The root deployment currently pins its tournament script
// to a GitHub commit via CDN; read exactly that version from the local git history.
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1]);
function environment(data=new Map()){
 const els={},c=vm.createContext({console,structuredClone,URL,Blob,setTimeout:(f,ms)=>{let t=setTimeout(f,ms);t.unref();return t},clearTimeout,setInterval,clearInterval,document:{hidden:false,getElementById:id=>els[id]??={style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',showModal(){},close(){}},addEventListener(){}},addEventListener(){},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}});
 vm.runInContext('window=globalThis',c);
 for(let src of scripts){let remote=src.match(/^https:\/\/cdn\.jsdelivr\.net\/gh\/[^@]+@([^/]+)\/(.+)$/),code=remote?execFileSync('git',['show',remote[1]+':'+remote[2]],{encoding:'utf8'}):fs.readFileSync('dist/'+src.split('?')[0],'utf8');vm.runInContext(code,c,{filename:src});}
 return {data,els,run:code=>vm.runInContext(code,c)};
}
(async()=>{
 let e=environment();await e.run('boot()');const original=e.run('JSON.stringify(S)');
 const run=code=>e.run(code),reset=()=>run('S='+original);
 assert(run('development21().recovery===1&&validSave(S)'));
 run('S.budget=10000000;let previousCoach=S.coach,previousFacility=S.facility;for(let n=0;n<4;n++)if(!upgradeDevelopment21("recovery"))throw Error("upgrade");');
 assert(run('development21().recovery===5&&S.budget===8475000&&S.coach===previousCoach&&S.facility===previousFacility&&!upgradeDevelopment21("recovery")&&validSave(S)'));
 run('go("development")');assert(e.els.app.innerHTML.includes('в 3.5 раза медленнее'));assert(!/undefined|NaN/.test(e.els.app.innerHTML));
 reset();run('S.budget=0');assert(!run('upgradeDevelopment21("recovery")'));run('S.budget=1000000;S.practice13={team:1,maps:[]}');assert(!run('upgradeDevelopment21("recovery")'));
 reset();
 // Both clubs, every level, and several map lengths: no cap hides a multiplier.
 for(let level=1;level<=5;level++)for(let seconds of [1200,2700,5400]){
  run(`S.active=null;development21(0).recovery=${level};development21(1).recovery=${level};for(let id of [0,1])for(let p of roster(S.teams[id]))p.fatigue=10;fatigueMap6([0,1],${seconds});`);
  assert(run(`roster(S.teams[0]).concat(roster(S.teams[1])).every(p=>Math.abs(p.fatigue-(10+(4+${seconds}/900)/DEVELOPMENT21.recovery.slowdown[${level-1}]))<1e-9)`));
 }
 // Exercise the actual calendar tick; training and match fatigue use the same level.
 for(let level of [1,5])for(let mode of ['balanced','rest','intensive'])for(let tournament of [false,true]){
  reset();run(`development21().recovery=${level};S.training='${mode}';for(let p of roster())p.fatigue=60;S.active=${tournament?'{event:S.events[0].id,entrants:[S.club],phase:"groups"}':'null'};tick();`);
  const delta=mode==='intensive'?4/(level===5?3.5:1):-(mode==='rest'?12:1)*(!tournament&&level===5?2:1);
  assert(run(`roster().every(p=>Math.abs(p.fatigue-${60+delta})<1e-9)`),`${level}/${mode}/${tournament}`);
 }
 reset();
 // Legacy levels migrate once; existing fatigue, money and purchased upgrades stay.
 run('development21().base=3;development21().staff=4;delete development21().recovery;let beforeMigration=roster().map(p=>p.fatigue),cashBeforeMigration=S.budget;');assert(run('validSave(S)'));
 run('init13();init13()');assert(run('development21().recovery===1&&development21().base===3&&development21().staff===4&&S.budget===cashBeforeMigration&&roster().every((p,i)=>p.fatigue===beforeMigration[i])'));
 for(let bad of [0,6,1.5,'"5"','null']){reset();run(`development21().recovery=${bad}`);assert(!run('validSave(S)'));}
 reset();run('S.events=[{id:700001,name:"Recovery groups",series:"PGL WALLACHIA",day:S.day,duration:6,pool:1000000,qualified13:S.teams.slice(0,16).map(t=>t.id)}];startEvent();S.budget=1000000;for(let p of roster())p.fatigue=60;');
 assert(run('S.active.stage6==="groups"&&buyRest6("basic")'));
 assert(run('S.active.restQuota21.groups===1&&S.budget===985000&&roster().every(p=>p.fatigue===45)&&!buyRest6("premium")'));
 // The first map of an official BO3 no longer charges fatigue; the series is unfinished.
 const activeBeforeMap=run('JSON.stringify(S)');
 run('development21().recovery=5;let opponentRecovery=S.active.opponent;development21(opponentRecovery).recovery=1;for(let id of [S.club,opponentRecovery])for(let p of roster(S.teams[id]))p.fatigue=10;playMap();let completedMap=S.active.live;while(completedMap.finishedSide==null&&completedMap.clock<72000)simulateTick4(completedMap,10);if(completedMap.finishedSide==null)throw Error("stalled map");let mapSeconds=completedMap.clock;finishMap();');
 assert(run('roster().every(p=>p.fatigue===10)&&roster(S.teams[opponentRecovery]).every(p=>p.fatigue===10)'));
 run('S='+activeBeforeMap);
 // A second series uses the same group allowance. Test handlers, not just disabled UI.
 run('S.active.matchKey+="-second"');assert(run('buyRest6("premium")'));
 run('S.active.matchKey+="-third"');const exhausted=run('JSON.stringify({budget:S.budget,fatigue:roster().map(p=>p.fatigue)})');assert(!run('buyRest6("basic")'));assert.equal(run('JSON.stringify({budget:S.budget,fatigue:roster().map(p=>p.fatigue)})'),exhausted);
 assert(run('restPanel6().includes("Группы и отбор: 2/2")&&restPanel6().includes("Лимит платного отдыха")'));
 // Reload actual saved data after exhausting a stage; no allowance returns.
 run('save()');await run('saveQueue');e=environment(new Map(e.data));await e.run('boot()');assert(run('S.active.restQuota21.groups===2&&!buyRest6("basic")&&validSave(S)'));
 run('S.active.stage6="ti-elimination";S.active.matchKey+="-qualifier"');assert(!run('buyRest6("premium")'));
 run('S.active.stage6="blast-seed"');assert(!run('buyRest6("premium")'));
 run('S.active.stage6="playoffs";S.active.matchKey+="-playoffs"');assert(run('buyRest6("basic")'));
 run('S.active.matchKey+="-next"');assert(run('buyRest6("premium")'));
 run('S.active.matchKey+="-lower-final"');assert(!run('buyRest6("basic")'));assert(run('S.active.restQuota21.groups===2&&S.active.restQuota21.playoffs===2'));
 // Minimal fixtures below test only purchase state; actual rendering was checked above.
 run('render=()=>{}');
 run('let oldEvent=S.active.event;S.active={event:oldEvent+1,format6:true,stage6:"playoffs",matchKey:"new-event"}');assert(run('buyRest6("basic")&&S.active.restQuota21.playoffs===1&&S.active.restQuota21.groups===0'));
 run('S.active.matchKey="new-series";S.active.live={clock:123}');assert(!run('buyRest6("basic")'));run('S.active.live=null;S.budget=0');assert(!run('buyRest6("basic")'));
 run('S.budget=1000000;S.active.spectator13=true');assert(!run('buyRest6("basic")'));run('S.active.spectator13=false');assert(!run('buyRest6("invalid")'));
 // Legacy purchase migration counts a known previous group payment at playoff start.
 run('S.active={event:123,format6:true,stage6:"playoffs",matchKey:"123-2",restKey:"123-0",schedule:[{id:0,label:"Группа A",groupMatch:true},{id:2,label:"Верхняя сетка"}]};ensureRestQuota6(S.active);ensureRestQuota6(S.active)');assert(run('S.active.restQuota21.groups===1&&S.active.restQuota21.playoffs===0'));
 run('S.active={event:124,phase:"groups",restKey:[124,"groups",0,0,1].join(":"),groupDay:0,round:0,opponent:1};ensureRestQuota6(S.active)');assert(run('S.active.restQuota21.groups===1&&!buyRest6("basic")'));run('S.active.groupDay=1');assert(run('buyRest6("basic")'));run('S.active.groupDay=2');assert(!run('buyRest6("basic")'));
 reset();run('S.active={restQuota21:{groups:3,playoffs:0}}');assert(!run('validSave(S)'));
 console.log('PASS recovery: 5 levels, prices and guards, map fatigue for both clubs, actual daily ticks, series fatigue policy, tournament/break distinction, old saves, paid-rest quotas per stage, real save/reload, legacy formats and purchase migration.');
})().catch(err=>{console.error(err);process.exitCode=1});

