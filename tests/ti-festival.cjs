'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const files=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
function env(data=new Map(),query='',deny=()=>false){
 const els={},location=new URL('https://game.example/'+query);
 const c=vm.createContext({console,structuredClone,URL,URLSearchParams,Blob,location,
  history:{replaceState(_a,_b,url){location.href=new URL(url,location.href).href;}},
  setTimeout:(f,ms)=>{const t=setTimeout(f,ms);if(ms>=3800)t.unref();return t;},clearTimeout,setInterval,clearInterval,
  document:{hidden:false,getElementById:id=>els[id]??={style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',showModal(){},close(){}},addEventListener(){}},addEventListener(){},
  localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>{if(deny(k))throw Error('quota');data.set(k,v);}}});
 vm.runInContext('window=globalThis',c);for(const file of files)vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),c,{filename:file});
 return {data,location,run:code=>vm.runInContext(code,c)};
}
(async()=>{
 let e=env();await e.run('boot()');
 assert(e.run('S.day<ti2027().day&&!S.tiRecovery.festival'),'Ordinary startup never jumps a fresh career');
 e.run('let target=ti2027();S.day=target.day+60;target.done=true;target.place=1;target.champion=S.club;target.reward=10800000;target.placements6={[S.club]:1};S.budget+=target.reward;S.prizes=target.reward;S.trophies=1;S.wins=1;S.players[0].fatigue=72;S.history=[{day:target.day,event:target.name,win:true,maps:[]}];save();');
 await e.run('saveQueue');
 const original=e.data.get('ancient-manager-v1'),originalState=JSON.parse(original).state;
 const paid=structuredClone(originalState);paid.events.find(x=>x.id===e.run('ti2027().id')).tiEvent={claimed:{first:true,rosh:true}};
 const replay=env(new Map([['ancient-manager-v1',JSON.stringify({state:paid})]]),'?ti2027=aegis');await replay.run('boot()');
 assert.equal(replay.run('S.budget'),originalState.budget-10800000-10000-25000,'Known sponsor payouts are undone before replay');
 e=env(new Map([['ancient-manager-v1',original],['ancient-manager-before-ti-rewind',original]]),'?ti2027=aegis');
 await e.run('boot()');
 assert(e.run('S.day===ti2027().day&&!S.active&&!ti2027().done&&S.tiRecovery.festival===TI_FESTIVAL.version&&S.prizes===0&&S.wins===0&&S.trophies===0'));
 assert.equal(e.run('S.players[0].fatigue'),72,'Rewind does not fabricate historical player attributes');
 assert.deepEqual(JSON.parse(e.data.get('ancient-manager-before-ti-festival')).state,originalState,'Full current career is protected');
 assert.equal(e.data.get('ancient-manager-before-ti-rewind'),original,'Earlier recovery backup is preserved');
 assert(e.run('ti2027().qualified13.length===16&&new Set(ti2027().qualified13).size===16&&ti2027().qualified13.includes(S.club)&&ti2027().festivalInvitation'));
 assert(e.run('!!readSnapshot(TI_FESTIVAL.checkpoint)&&validSave(S)'));
 assert.equal(e.location.search,'','Explicit link is consumed');
 assert(e.run('$("modal").innerHTML.includes("ПУСТЬ АРЕНА")'));
 const rawBackup=e.data.get('ancient-manager-before-ti-festival');
 e.run('S.day++;save();');await e.run('saveQueue');const continuedDay=e.run('S.day');
 e=env(new Map(e.data),'?ti2027=aegis');await e.run('boot()');
 assert.equal(e.run('S.day'),continuedDay,'Opening the same event link again never rewinds progress');
 assert.equal(e.data.get('ancient-manager-before-ti-festival'),rawBackup);
 console.log('PASS explicit one-time return, byte-valid backup, invitation, current primary, checkpoint and replay protection');
 e.run('askLoad(TI_FESTIVAL.backup)');await e.run('$("confirmLoad").onclick()');
 assert(e.run('S.day>ti2027().day&&S.tiRecovery.mode==="original-restored"'));
 e=env(new Map(e.data),'?ti2027=aegis');await e.run('boot()');
 assert.equal(e.run('S.day'),originalState.day,'Restoring the original opts out even on the event link');
 console.log('PASS original restoration remains stable across restart and repeated deep link');
 for(const blocked of ['ancient-manager-before-ti-festival','ancient-manager-v1']){
  const failed=env(new Map([['ancient-manager-v1',original]]),'?ti2027=aegis',key=>key===blocked);
  await failed.run('boot()');
  assert.equal(failed.run('S.day'),originalState.day);
  assert.equal(failed.run('S.budget'),originalState.budget);
  assert.equal(failed.run('S.trophies'),originalState.trophies);
  assert(failed.run('!!S.tiRecoveryError'));
  if(blocked==='ancient-manager-v1')assert.equal(failed.data.get(blocked),original,'Failed commit keeps original primary bytes');
 }
 console.log('PASS backup failure and main-career commit failure abort the return');
 // Historical state is selected only when its club, identity and exact start match.
 const exactEnv=env();await exactEnv.run('boot()');exactEnv.run('S='+JSON.stringify(originalState));
 exactEnv.run('S.day=ti2027().day;S.events.filter(x=>x.day<S.day).forEach(x=>x.done=true);delete ti2027().done;S.history=[];S.budget=123456;S.players[0].skill=71;');
 const exact=exactEnv.run('JSON.stringify(makePacket(S,"Historical start"))');
 e=env(new Map([['ancient-manager-v1',original],['ancient-manager-slot-0',exact]]),'?ti2027=aegis');await e.run('boot()');
 assert(e.run('S.tiRecovery.mode==="exact"&&S.budget===123456&&S.players[0].skill===71'));
 e.run('enterTIArena();chooseTIPlan("tempo");chooseTIPrediction(S.club);startTIFestival();playMap();');
 assert(e.run('S.active.live.modelVersion===8&&S.active.live.tiEvent.plan==="tempo"'));
 e.run('let deficit=structuredClone(S.active.live);deficit.sides[1].heroes.forEach(p=>p.nw+=2000);simulateTick4(deficit,1);');
 assert(e.run('deficit.tiTrailed'),'A model-8 tick remembers early deficits for a later comeback');
 e.run('let map=S.active.live;map.finishedSide=0;map.sides[0].roshKills=3;map.tiTrailed=true;recordResult6(map);recordResult6(map);');
 assert(e.run('tiState(ti2027()).mapWins===1&&tiState(ti2027()).roshans===3&&tiState(ti2027()).comebacks===1'));
 assert(e.run('tiState(ti2027()).chronicle.filter(n=>n.text.includes("Первый луч")).length===1'));
 const budget=e.run('S.budget');
 e.run('claimTIReward("first");claimTIReward("first");claimTIReward("rosh");claimTIReward("comeback");');
 assert.equal(e.run('S.budget'),budget+10000+25000+45000,'Sponsor payments are credited exactly once');
 const count=e.run('tiState(ti2027()).mapWins');
 e.run('let scrim=makeLive4({opponent:1},autoDraft([S.club,1]),[S.club,1]);scrim.scope13="scrim";scrim.finishedSide=0;recordResult6(scrim);');
 assert.equal(e.run('tiState(ti2027()).mapWins'),count,'Scrims never count toward TI contracts');
 e.run('for(const tab of ["arena","clubs","contracts","chronicle"])openTIHub(tab);showTICeremony();settings();savesView();');
 e.run('S.active.stage6="ti-elimination";');assert.equal(e.run('tiFestivalPhase().index'),1);
 e.run('S.active.stage6="playoffs";');assert.equal(e.run('tiFestivalPhase().index'),2);
 e.run('S.active.schedule[S.active.cursor].bo=5;');assert.equal(e.run('tiFestivalPhase().index'),3);
 e.run('let a=S.active;a.schedule=[{id:0,label:"Гранд-финал",pair:[S.club,a.opponent],bo:5,score:"3:0",w:S.club,l:a.opponent}];a.cursor=1;a.placements=Object.fromEntries(a.entrants.map(id=>[id,id===S.club?1:9]));finishEvent6(a);');
 assert(e.run('ti2027().done&&tiState(ti2027()).championBadge&&tiState(ti2027()).oracleWon&&tiFestivalPhase().index===4'));
 assert(e.run('tiState(ti2027()).chronicle.some(n=>n.kind==="closing"&&n.text.includes("ВАШ AEGIS"))'));
 await e.run('saveQueue');
 console.log('PASS exact restoration, v8 official maps, idempotent milestones/rewards, scrim exclusion, phases and championship ceremony');
 const fresh=env(new Map(),'?ti2027=aegis');await fresh.run('boot()');
 assert(fresh.run('S.day===ti2027().day&&validSave(S)'),'Explicit invitation works without an existing career too');
 console.log('PASS TI festival');
})().catch(error=>{console.error(error);process.exitCode=1;});
