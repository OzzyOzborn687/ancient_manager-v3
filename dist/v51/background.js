'use strict';
// Non-participation belongs to the calendar, not to the manager's active match.
const Background51={
 updating:false,simulating:false,finishing:null,
 jobs(){return S.events.filter(e=>!e.done&&e.background51);},
 absent(e){return !!e?.background51||Array.isArray(e?.qualified13)&&!e.qualified13.includes(S.club);},
 queue(e,withdrawn=false){
  if(!e||e.done)return;
  e.background51??={version:1,status:'queued',withdrawn,queuedDay:S.day};
  if(withdrawn){e.background51.withdrawn=true;e.skipRequestedV12=true;this.releaseCamp(e);}
  // Declining a main event also declines an unplayed player qualifier for it.
  for(const child of S.events.filter(c=>c.qualifierFor===e.id&&!c.done&&c.entrants?.includes(S.club)))this.queue(child,true);
 },
 releaseCamp(e){const b=Camp4.plans()[Camp4.key(e.id)];if(b?.status==='active')Camp4.close(b,'cancelled',true);},
 detach(a){
  const e=S.events.find(e=>e.id===a?.event);if(!e||!a.format6||!Array.isArray(a.entrants))return false;
  if(!a.spectator13&&!a.withdrawnV12&&a.entrants.includes(S.club))return false;
  this.queue(e,!!a.withdrawnV12);
  e.background51.status='running';e.background51.state=a;
  a.autoCoach13=false;a.spectator13=!a.entrants.includes(S.club);
  if(S.active===a)S.active=null;
  if(S.pendingSkipV12===e.id)S.pendingSkipV12=null;
  this.project(e);return true;
 },
 create(e){
  const b=e.background51;if(!b||b.state||e.day>S.day)return;
  let a;
  if(Qualifiers.isRegional(e))a=Qualifiers.regionalState(e);
  else{
   const key=formatKey6(e),f=FORMAT6[key];if(!f)return;
   if(e.qualification&&e.qualification.status!=='complete'&&!Qualifiers.complete(e))return;
   const ids=qualify13(e,f);if(e.day>S.day)return;
   const entrants=[...ids].sort((x,y)=>strength(S.teams[y])-strength(S.teams[x]));
   a={event:e.id,format6:true,formatKey6:key,phase:'circuit',stage:'Турнир без участия',schedule:[],cursor:0,entrants,seeds:Object.fromEntries(entrants.map(id=>[id,strength(S.teams[id])])),swissRound:0,stage6:'groups',placements:{},score:[0,0],maps:[],live:null,seriesDone:false,round:0,totalRounds:1,pairs:[],bracket:[],bo:3,startDay13:e.day};
   e.entrants=[...entrants];e.formatKey6=key;e.format='circuit-v6';
   if(f.kind==='de'){de8_6(a,entrants);a.stage6='playoffs';}else if(f.kind==='swiss')swissRound6(a);else if(f.kind==='gsl')gsl6(a);else roundRobin6(a,entrants,f.size,f.bo);
   assignDates13(a);
  }
  a.withdrawnV12=!!b.withdrawn;a.spectator13=!a.entrants.includes(S.club);a.autoCoach13=false;
  b.status='running';b.state=a;this.project(e);
 },
 project(e){const a=e.background51?.state;if(!a)return;Object.assign(e,{schedule6:structuredClone(a.schedule),seeds6:{...a.seeds},groupIds6:a.groupIds,gsl6:a.gsl,entrants:[...a.entrants]});},
 series(a,n){
  const pair=n.pair.map(v=>resolve6(a,v));
  if(pair.some(id=>!Number.isInteger(id)))throw Error('Не разрешена пара фонового турнира.');
  if(a.withdrawnV12&&pair.includes(S.club)){
   if(a.seriesDone){const score=pair[0]===S.club?a.score:[...a.score].reverse();recordNodeBase13(a,n,score.join(':'));a.seriesDone=false;}
   else{const won=a.matchKey===a.event+'-'+n.id?(a.score?.[0]||0):0,need=n.bo===2?2-won:Math.floor(n.bo/2)+1;recordNodeBase13(a,n,pair[0]===S.club?won+':'+need:need+':'+won);n.forfeitV12=S.club;if(a.matchKey===a.event+'-'+n.id&&a.maps?.length)n.maps=structuredClone(a.maps);}
   a.live=null;return;
  }
  // Continue a persisted partial AI series/map instead of rerolling it on load.
  const sim=a.sim13??={cursor:a.cursor,pair,score:[0,0],maps:[],live:null},need=Math.floor(n.bo/2)+1;
  this.simulating=true;
  try{
   while(n.bo===2?sim.maps.length<2:sim.score.every(x=>x<need)){
    sim.live??=makeLive4({opponent:pair[1]},autoDraft(pair),pair);
    const m=sim.live;let steps=0;
    while(m.finishedSide==null&&steps++<7200)simulateTick4(m,10);
    if(m.finishedSide==null)throw Error('Фоновая карта не завершилась за 20 игровых часов.');
    sim.score[m.finishedSide]++;sim.maps.push({winner:pair[m.finishedSide],duration:m.clock,gold:m.gold});sim.live=null;
   }
   n.maps=structuredClone(sim.maps);recordNode6(a,n,sim.score.join(':'));a.sim13=null;
  }finally{this.simulating=false;}
 },
 finish(e){
  const b=e.background51,a=b.state;if(e.done)return;
  const selected=selectedBracket;this.finishing=e.id;
  try{
   if(Qualifiers.isRegional(e))Qualifiers.finishRegional(a,b.withdrawn);
   else if(b.withdrawn){
    const shares={1:.36,2:.19,3:.11,4:.075,5:.04,7:.025,9:.006,13:.004,14:.003};
    for(const id of a.entrants)if(id!==S.club)pay13(id,Math.round(e.pool*(shares[a.placements[id]||9]||.003)),'Призовые · '+e.name);
    finalizeSkipped12(a);
   }else finishEvent6(a);
   b.status='complete';b.completedDay=S.day;delete b.state;
  }finally{this.finishing=null;selectedBracket=selected;}
 },
 update(){
  if(this.updating||this.finishing||!S?.v5?.sceneReady)return;
  this.updating=true;
  try{
   for(const e of [...S.events])if(!e.done&&e.day<=S.day&&e.id!==S.active?.event&&!Qualifiers.isRegional(e)&&Array.isArray(e.qualified13)&&!e.qualified13.includes(S.club))this.queue(e);
   for(const e of this.jobs()){
    if(e.day>S.day)continue;
    try{this.create(e);const a=e.background51.state;if(!a)continue;
    let guard=0;
    while(guard++<1000){
     if(a.cursor>=a.schedule.length){if(phaseNext6(a))continue;if(S.day>=e.day+(e.duration||1)-1)this.finish(e);break;}
     const n=a.schedule[a.cursor];if((n.day13??e.day)>S.day)break;
     if(!n.score)this.series(a,n);a.cursor++;this.project(e);
    }
    delete e.background51.error;
    }catch(error){const message=String(error?.message||error);if(e.background51.error!==message)log(e.name+' · фоновая симуляция приостановлена: '+message);e.background51.error=message;}
   }
  }finally{this.updating=false;}
 },
 panel(){const jobs=this.jobs();return jobs.length?'<section class="panel background51"><h2>Турниры без участия клуба</h2><p>Управление клубом доступно. Результаты обновляются при переходе игровых дней.</p>'+jobs.map(e=>'<div class="news"><b>'+esc(e.name)+'</b><p>'+date(e.day)+' · '+(e.background51.error?'Пауза: '+esc(e.background51.error):e.background51.status==='queued'?'Ожидает старта':'Идёт · сыграно серий '+e.background51.state.cursor)+'</p>'+btn('Сетка и результаты','showBracket('+e.id+')')+'</div>').join('')+'</section>':'';},
 valid(x){
  for(const e of x.events){
   const b=e.background51;if(!b)continue;
   if(b.version!==1||!['queued','running','complete'].includes(b.status)||typeof b.withdrawn!=='boolean'||!Number.isInteger(b.queuedDay)||b.queuedDay>x.day||b.error!==undefined&&typeof b.error!=='string')return false;
   if(b.status==='complete'){if(!e.done||!Number.isInteger(b.completedDay)||b.completedDay>x.day||b.state)return false;continue;}
   if(e.done||x.active?.event===e.id)return false;
   if(b.status==='queued'){if(b.state)return false;continue;}
   const a=b.state,f=FORMAT6[a?.formatKey6],idOK=id=>Number.isInteger(id)&&!!x.teams[id];
   if(!a||a.event!==e.id||!a.format6||!f||!Array.isArray(a.entrants)||a.entrants.length!==f.n||new Set(a.entrants).size!==f.n||a.entrants.some(id=>!idOK(id))||!b.withdrawn&&a.entrants.includes(x.club)||!Number.isInteger(a.cursor)||a.cursor<0||!Array.isArray(a.schedule)||a.cursor>a.schedule.length||a.autoCoach13||!!a.withdrawnV12!==b.withdrawn||!a.seeds||!a.placements)return false;
   for(const n of a.schedule){if(!Number.isInteger(n.id)||!Array.isArray(n.pair)||n.pair.length!==2||![2,3,5].includes(n.bo)||!Number.isFinite(n.day13)||n.pair.some(v=>Number.isInteger(v)?!a.entrants.includes(v):!v||!Number.isInteger(v.id)||v.id<0||v.id>=n.id))return false;}
   if(!validBeforeBackground51({...x,active:a}))return false;
  }
  return true;
 }
};
const nextBeforeBackground51=nextEvent;
nextEvent=function(){
 if(!S?.v5?.sceneReady)return nextBeforeBackground51();
 ensureTournamentCalendar();const active=S.events.find(e=>e.id===S.active?.event);if(active)return active;
 const first=S.events.find(e=>!e.done&&!Background51.absent(e)&&(!Qualifiers.isRegional(e)||e.entrants.includes(S.club)));
 return first?(S.events.find(e=>!e.done&&!e.background51&&e.qualifierFor===first.id&&e.entrants?.includes(S.club))||first):undefined;
};
const startBeforeBackground51=startEvent;
startEvent=function(...args){const result=startBeforeBackground51(...args);if(S.v5?.sceneReady&&S.active?.spectator13&&Background51.detach(S.active)){go('home');save();}return result;};
const skipBeforeBackground51=skipTournament12;
skipTournament12=function(){
 if(!S.v5?.sceneReady)return skipBeforeBackground51();
 const a=S.active,e=skipEvent12();if(!e||e.done||busy13||S.practice13)return;
 if(a&&!a.format6)return skipBeforeBackground51();
 if(a?.seriesDone&&a.schedule[a.cursor]?.championship){finishSeries();return;}
 pauseLive4(false);Background51.queue(e,true);
 if(a){a.withdrawnV12=true;Background51.detach(a);}
 save();go('home');toast('Клуб пропускает турнир. Управление клубом доступно.');
};
const calendarBeforeBackground51=finishCalendar13;
finishCalendar13=function(e){if(Background51.finishing===e.id){e.completedDay20=S.day;return;}return calendarBeforeBackground51(e);};
const tickBeforeBackground51=tick;
tick=function(){tickBeforeBackground51();Background51.update();save();};
const migrateBeforeBackground51=migrate;
migrate=function(...args){migrateBeforeBackground51(...args);for(const e of S.events)if(e.background51?.withdrawn)Background51.releaseCamp(e);if(S.v5?.sceneReady&&S.active?.format6&&(S.active.spectator13||S.active.withdrawnV12||Array.isArray(S.active.entrants)&&!S.active.entrants.includes(S.club)||S.pendingSkipV12===S.active.event)){if(S.pendingSkipV12===S.active.event)S.active.withdrawnV12=true;Background51.detach(S.active);}if(S.v5?.sceneReady&&!S.active&&S.pendingSkipV12!=null){Background51.queue(S.events.find(e=>e.id===S.pendingSkipV12),true);S.pendingSkipV12=null;}Background51.update();};
const fatigueBeforeBackground51=fatigueMap6;
fatigueMap6=function(...args){if(!Background51.simulating)return fatigueBeforeBackground51(...args);};
const busyBeforeBackground51=Camp4.busy;
Camp4.busy=function(team){return busyBeforeBackground51.call(this,team)||Background51.jobs().some(e=>e.background51.status==='running'&&e.entrants?.includes(team)&&!(e.background51.withdrawn&&team===S.club));};
const confirmedBeforeBackground51=Camp4.confirmed;
Camp4.confirmed=function(e,team){return !(e?.background51?.withdrawn&&team===S.club)&&confirmedBeforeBackground51.call(this,e,team);};
const trainingBeforeBackground51=trainingAvailable33;
trainingAvailable33=function(){if(!S?.v5?.sceneReady)return trainingBeforeBackground51();return !locked()&&!S.practice13&&!busy13&&(!nextEvent()||nextEvent().day>S.day);};
const advanceBeforeBackground51=advance;
advance=function(){if(!S.active&&!S.practice13&&!busy13&&!nextEvent()){tick();render();return;}return advanceBeforeBackground51();};
$('advance').onclick=advance;
const skipDaysBeforeBackground51=skip;
skip=function(){if(!S?.v5?.sceneReady)return skipDaysBeforeBackground51();if(S.active||S.practice13||busy13)return;let next=nextEvent();if(!next){advance();return;}while((next=nextEvent())&&next.day>S.day){if(preparationGate4())return;tick();}if(preparationGate4())return;render();};
const coachBeforeBackground51=autoTournament13;
autoTournament13=function(...args){if(S.active?.spectator13){Background51.detach(S.active);go('home');save();return;}if(!S.active&&!nextEvent())return;return coachBeforeBackground51(...args);};
const goBeforeBackground51=go;
go=function(...args){if(!Background51.finishing)return goBeforeBackground51(...args);};
const renderBeforeBackground51=render;
render=function(...args){if(!Background51.finishing)return renderBeforeBackground51(...args);};
const saveBeforeBackground51=save;
save=function(...args){if(!Background51.finishing)return saveBeforeBackground51(...args);};
const hubBeforeBackground51=openTIHub;
openTIHub=function(...args){if(!Background51.finishing)return hubBeforeBackground51(...args);};
const viewBeforeBackground51=neonDisplayEvent;
neonDisplayEvent=function(e){const a=e.background51?.state;return a?{a,f:FORMAT6[a.formatKey6],key:a.formatKey6,active:false,preview:false}:viewBeforeBackground51(e);};
const statusBeforeBackground51=calendarStatus21;
calendarStatus21=function(e){return e?.background51&&!e.done?'Без участия клуба · '+(e.background51.status==='queued'?'ожидает':'идёт'):statusBeforeBackground51(e);};
const homeBeforeBackground51=home,calendarViewBeforeBackground51=calendar;
home=function(...args){return homeBeforeBackground51(...args)+Background51.panel();};
calendar=function(...args){return Background51.panel()+calendarViewBeforeBackground51(...args);};
const validBeforeBackground51=validSave;
validSave=function(x){return validBeforeBackground51(x)&&Background51.valid(x);};

// The event ID is the one shown on the home card: a stale/double click cannot skip its successor.
function skipUpcomingTournament51B(eventId){
 if(S.active||S.practice13||busy13||!S.v5?.sceneReady)return false;
 const e=nextEvent();if(!e||e.id!==eventId||e.done||e.background51)return false;
 skipTournament12();
 const next=nextEvent(),parent=Qualifiers.isRegional(next)?S.events.find(e=>e.id===next.qualifierFor):next;
 campEvent4=parent?.id??null;selectedQualifierEvent=parent?.id??null;
 render();return true;
}
