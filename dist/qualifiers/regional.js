'use strict';
FORMAT6.qualifier8={n:8,kind:'de',label:'Региональная квалификация · 8 клубов · Double Elimination · все серии BO3',note:'Лучшие K команд получают приглашения на основной турнир. Инвайт является отдельной наградой, а не чемпионским титулом.'};
FORMAT6.qualifier16={n:16,kind:'gsl',label:'Региональная квалификация · 16 клубов · GSL → Double Elimination на 8 · все серии BO3',note:FORMAT6.qualifier8.note};
const QualifierRegionalLegacy={freeze:Qualifiers.freeze,complete:Qualifiers.complete,supports:Qualifiers.supports,formatKey:formatKey6,qualify:qualify13,dates:assignDates13,phase:phaseNext6,finish:finishEvent6,skip:finalizeSkipped12};
Qualifiers.isRegional=e=>Number.isInteger(e?.qualifierFor);
Qualifiers.supports=function(e){return !this.isRegional(e)&&QualifierRegionalLegacy.supports(e);};
formatKey6=function(e){return Qualifiers.isRegional(e)?e.formatKey6:QualifierRegionalLegacy.formatKey(e);};
Qualifiers.markCareer=function(e){this.mark(e);if(e.qualification?.status==='pending')e.qualification.sceneVersion=QUALIFIERS.scene.version;};
Qualifiers.freeze=function(e){
 if(e.qualification?.sceneVersion!==QUALIFIERS.scene.version)return QualifierRegionalLegacy.freeze.call(this,e);
 if(e.qualification.status!=='pending')return e.qualification;
 const scene=this.ensureScene(),quota=this.seasonQuotas(format6(e).n-QUALIFIERS.invites),C=QUALIFIERS.regional;
 for(const r of QUALIFIERS.regions){
  const required=(quota.quotas[r]>=C.largeQuota?C.largeField:C.smallField)+QUALIFIERS.regionInviteCap;
  while(S.teams.filter(t=>this.region(t)===r&&!this.busy(e,t.id)).length<required&&S.teams.length<QUALIFIERS.scene.maxTeams)this.generateClub(r,3);
 }
 const q=QualifierRegionalLegacy.freeze.call(this,e);
 if(q.status==='frozen'){
  q.season=circuitYear(S.day);q.quotas={...quota.quotas};q.plannedQuotas={...quota.quotas};
  q.rules.baseQuotas={...quota.quotas};q.mode='regional-tournaments';
  try{this.createRegionals(e);}catch(error){q.status='blocked';q.reason=error.message;log(e.name+' · '+q.reason);}
 }
 scene.reviewYear??=circuitYear(S.day);return q;
};
Qualifiers.regionalState=function(e){
 if(e.regionalState)return e.regionalState;
 const a={event:e.id,qualifierFor:e.qualifierFor,qualifierRegion:e.qualifierRegion,format6:true,formatKey6:e.formatKey6,
  phase:'circuit',stage:'Региональная квалификация',schedule:[],cursor:0,entrants:[...e.entrants],
  seeds:Object.fromEntries(e.entrants.map(id=>[id,strength(S.teams[id])])),swissRound:0,stage6:e.formatKey6==='qualifier8'?'playoffs':'groups',
  placements:{},score:[0,0],maps:[],live:null,seriesDone:false,round:0,totalRounds:1,pairs:[],bracket:[],bo:QUALIFIERS.regional.bo,startDay13:e.day};
 if(e.formatKey6==='qualifier8')de8_6(a,a.entrants);else gsl6(a);
 for(const n of a.schedule)n.bo=QUALIFIERS.regional.bo;
 e.regionalState=a;assignDates13(a);e.schedule6=structuredClone(a.schedule);e.seeds6={...a.seeds};e.gsl6=a.gsl;return a;
};
Qualifiers.regionalWindow=function(parent,own){
 const C=QUALIFIERS.regional,duration=C.duration,earliest=Math.max(S.day,parent.day-C.startLead),latest=parent.day-QUALIFIERS.listLead-duration;
 for(let day=earliest;day<=latest;day++){
  if(!own||!S.events.some(e=>!e.done&&e.id!==parent.id&&this.overlap({day:day-C.minGap,duration:duration+C.minGap*2},e)&&(e.entrants||e.qualified13||e.qualification?.invited?.map(v=>v.team)||[]).includes(S.club)))return day;
 }
 return null;
};
Qualifiers.createRegionals=function(parent){
 const q=parent.qualification;if(q.regionalEvents)return;
 const C=QUALIFIERS.regional,invited=q.invited.map(v=>v.team),prepared=[];
 let nextId=Math.max(-1,...S.events.map(e=>e.id))+1;
 for(const region of QUALIFIERS.regions){
  const quota=q.quotas[region],count=quota>=C.largeQuota?C.largeField:C.smallField;
  const entrants=this.fillRegion(parent,region,count,invited),own=entrants.includes(S.club);
  const day=this.regionalWindow(parent,own);
  if(day===null)throw Error('Нет безопасного окна квалификации '+region+' до '+parent.name+'. Участие требует переноса расписания.');
  prepared.push({id:nextId++,name:parent.name+' · Квалификация '+region,series:'QUALIFICATION',qualifierFor:parent.id,
   qualifierRegion:region,quota,day,duration:C.duration,pool:C.pool,venue:'Онлайн · '+region,real:false,
   formatKey6:count===C.smallField?'qualifier8':'qualifier16',format:'circuit-v6',entrants,inviteTrophy:true,
   rosterLock:Object.fromEntries(entrants.map(id=>[id,roster(S.teams[id]).map(p=>p.id)]))});
 }
 S.events.push(...prepared);q.regionalEvents=Object.fromEntries(prepared.map(e=>[e.qualifierRegion,e.id]));
 for(const e of prepared)this.regionalState(e);
 S.events.sort((a,b)=>a.day-b.day||a.id-b.id);
 const own=prepared.find(e=>e.entrants.includes(S.club));
 if(own)log('Ваш путь на '+parent.name+': '+own.name+' начинается '+date(own.day)+'. Награда — приглашение; мест: '+own.quota+'.');
};
assignDates13=function(a){
 const e=S.events.find(e=>e.id===a.event);
 if(!Qualifiers.isRegional(e))return QualifierRegionalLegacy.dates(a);
 a.qualifierFor=e.qualifierFor;a.qualifierRegion=e.qualifierRegion;
 const C=QUALIFIERS.regional,base=a.startDay13??=e.day,free={};
 for(const n of a.schedule){
  n.bo=C.bo;
  const dependencies=n.pair.filter(v=>v&&typeof v==='object').map(v=>(a.schedule[v.id]?.slot13??base)+C.slotDays);
  const ids=n.pair.map(v=>resolve6(a,v)).filter(Number.isInteger);
  n.slot13??=Math.max(base,n.phaseFloor13??base,...dependencies,...ids.map(id=>free[id]??base));
  n.day13=Math.floor(n.slot13);for(const id of ids)free[id]=n.slot13+C.slotDays;
 }
 e.duration=Math.max(e.duration,Math.ceil(Math.max(base,...a.schedule.map(n=>n.slot13))+C.slotDays-e.day));
};
phaseNext6=function(a){
 if(a.formatKey6!=='qualifier16')return QualifierRegionalLegacy.phase(a);
 if(a.stage6==='playoffs')return false;
 const seeds=a.gsl.flatMap(g=>[a.schedule[g.w].w,a.schedule[g.d].w]);
 for(const id of a.entrants)if(!seeds.includes(id))a.placements[id]=9;
 const floor=Math.max(...a.schedule.map(n=>n.slot13))+QUALIFIERS.regional.slotDays;
 const before=a.schedule.length;de8_6(a,seeds);
 for(const n of a.schedule.slice(before)){n.bo=QUALIFIERS.regional.bo;n.phaseFloor13=floor;}
 a.stage6='playoffs';assignDates13(a);return true;
};
qualify13=function(e,f){return Qualifiers.isRegional(e)?[...e.entrants]:QualifierRegionalLegacy.qualify(e,f);};
Qualifiers.fastRegionalSeries=function(a,n){
 const pair=n.pair.map(v=>resolve6(a,v)),score=[0,0],maps=[],C=QUALIFIERS.regional;
 while(score.every(v=>v<Math.floor(C.bo/2)+1)){
  const stats=this.stats(),level=Difficulty.current(),multipliers=Difficulty.multipliers(level,S.club,pair);
  const ratings=pair.map(id=>clubState13(S.teams[id]).elo*C.skillEloWeight+
   (strength(S.teams[id])-C.skillReference)*C.skillScale+(stats[id].form-C.formReference)*C.formWeight);
  const p=clamp(1/(1+QUALIFIERS.provisional.eloBase**((ratings[1]-ratings[0])/QUALIFIERS.provisional.eloScale)*multipliers[1]/multipliers[0]),QUALIFIERS.provisional.minProbability,QUALIFIERS.provisional.maxProbability);
  const winner=rng()<p?0:1;score[winner]++;maps.push({winner:pair[winner],difficulty:{level,club:S.club,multipliers},pWin:p});
  const clubs=pair.map(id=>clubState13(S.teams[id])),expected=1/(1+10**((clubs[1].elo-clubs[0].elo)/QUALIFIERS.provisional.eloScale));
  const change=C.eloK*(Number(winner===0)-expected);clubs[0].elo+=change;clubs[1].elo-=change;
  this.initFame(stats);const F=QUALIFIERS.fame,team=S.teams[pair[winner]];
  team.fame=clamp(team.fame+F.mapWin,F.min,F.max);
  for(let side=0;side<pair.length;side++){
   const c=clubs[side],win=side===winner;c.maps++;c.wins+=Number(win);c.lastResults.push(win);c.lastResults=c.lastResults.slice(-10);
   for(const p of roster(S.teams[pair[side]])){formRecord21(p,win,a.event);p.morale=clamp(p.morale+(win?C.moraleDelta:-C.moraleDelta));}
  }
 }
 n.maps=maps;return score.join(':');
};
Qualifiers.finishRegional=function(a,withdrawn=false){
 const e=S.events.find(e=>e.id===a.event);if(!e||e.done)return;
 const parent=S.events.find(p=>p.id===e.qualifierFor);if(!parent)throw Error('Основной турнир квалификации отсутствует');
 const order=[...a.entrants].sort((x,y)=>(a.placements[x]||9)-(a.placements[y]||9)||a.seeds[y]-a.seeds[x]||x-y);
 const winners=order.filter(id=>!withdrawn||id!==S.club).slice(0,e.quota),C=QUALIFIERS.regional;
 Object.assign(e,{done:true,place:a.placements[S.club]??null,champion:a.schedule.at(-1).w,placements6:{...a.placements},
  schedule6:structuredClone(a.schedule),seeds6:{...a.seeds},gsl6:a.gsl,completedDay20:S.day,inviteWinners:winners,reward:0,
  fatigue26:structuredClone(a.fatigue26||{groups:{},charged:{}}),withdrawnClub:withdrawn?S.club:undefined,
  skipRequestedV12:false,skippedV12:withdrawn});
 for(const id of a.entrants){
  const place=a.placements[id]||9,prize=withdrawn&&id===S.club?0:Math.round(e.pool*(C.prizeShares[place]||0));
  if(prize)pay13(id,prize,e.name+' · '+placeLabel(place));
  if(id===S.club){e.reward=prize;S.prizes+=prize;}
  clubState13(S.teams[id]).seasonPoints+=Math.round(C.mainWinPoints*C.pointsScale/place);
  const t=S.teams[id];t.fame=clamp((t.fame??0)+QUALIFIERS.fame.eventWin*C.fameScale/place,QUALIFIERS.fame.min,QUALIFIERS.fame.max);
 }
 if(S.active===a){S.active=null;S.pendingSkipV12=null;selectedBracket=e.id;}
 e.regionalState=null;this.sceneResult(e);this.complete(parent);
 log(e.name+' завершена. '+winners.map(id=>S.teams[id].name).join(', ')+' получают инвайт на '+parent.name+'.');
};
finishEvent6=function(a){
 if(Qualifiers.isRegional(S.events.find(e=>e.id===a.event))){Qualifiers.finishRegional(a);save();go('bracket');return;}
 QualifierRegionalLegacy.finish(a);const e=S.events.find(e=>e.id===a.event);if(e)Qualifiers.sceneResult(e);
};
finalizeSkipped12=function(a){
 if(Qualifiers.isRegional(S.events.find(e=>e.id===a.event))){Qualifiers.finishRegional(a,true);return;}
 QualifierRegionalLegacy.skip(a);const e=S.events.find(e=>e.id===a.event);if(e)Qualifiers.sceneResult(e);
};
Qualifiers.backgroundRegionals=function(){
 if(this.backgroundBusy)return;this.backgroundBusy=true;
 try{for(const e of [...S.events]){
  if(!this.isRegional(e)||e.done||e.id===S.active?.event||e.entrants.includes(S.club)||e.day>S.day)continue;
  const a=this.regionalState(e);let safety=0;
  while(safety++<100){
   if(a.cursor>=a.schedule.length){if(phaseNext6(a))continue;this.finishRegional(a);break;}
   const n=a.schedule[a.cursor];if(n.day13>S.day)break;
   if(!n.score)recordNode6(a,n,this.fastRegionalSeries(a,n));a.cursor++;
  }
 }}finally{this.backgroundBusy=false;}
};
Qualifiers.complete=function(e){
 const q=e.qualification;
 if(q?.sceneVersion!==QUALIFIERS.scene.version)return QualifierRegionalLegacy.complete.call(this,e);
 if(q.status==='pending')this.freeze(e);
 if(q.status==='complete')return [...q.qualified];
 if(q.status!=='frozen')return null;
 const children=Object.values(q.regionalEvents||{}).map(id=>S.events.find(e=>e.id===id));
 if(children.length!==QUALIFIERS.regions.length||children.some(e=>!e?.done))return null;
 if(S.day<e.day-q.rules.listLead)return null;
 const rows=q.rows.map(r=>({...r,busy:this.busy(e,r.team)?.id??null}));
 const plan=this.invitations(e,q.fieldSize,rows,q.champion,q.rules);
 if(!plan.ok){q.status='blocked';q.reason=plan.reason;return null;}
 const invited=plan.invited.map(v=>v.team),regionalWinners={};
 for(const child of children){
  const order=[...child.entrants].sort((a,b)=>(child.placements6[a]||9)-(child.placements6[b]||9)||child.seeds6[b]-child.seeds6[a]||a-b);
  regionalWinners[child.id]=order.filter(id=>id!==child.withdrawnClub&&!invited.includes(id)&&!this.busy(e,id)).slice(0,child.quota);
  if(regionalWinners[child.id].length!==child.quota){q.status='blocked';q.reason='Регион '+child.qualifierRegion+': участники заняты на другом турнире.';return null;}
 }
 q.revalidation={day:S.day,displaced:q.invited.filter(v=>!invited.includes(v.team)).map(v=>({team:v.team,reason:'schedule-conflict'}))};
 q.invited=plan.invited;q.skipped=plan.skipped;q.player=plan.player;q.championUnavailable=plan.championUnavailable;
 for(const displaced of q.revalidation.displaced)log(e.name+' · инвайт '+S.teams[displaced.team].name+' передан следующему клубу: пересечение дат турниров.');
 q.regions={};
 for(const child of children){
  child.inviteWinners=regionalWinners[child.id];
  const a={schedule:child.schedule6};
  q.regions[child.qualifierRegion]={quota:child.quota,planned:child.quota,event:child.id,candidates:[...child.entrants],qualified:[...child.inviteWinners],
   table:Object.entries(child.placements6).map(([team,place])=>({team:+team,place})),
   matches:child.schedule6.map(n=>({pair:n.pair.map(v=>resolve6(a,v)),w:n.w,score:n.score,maps:[]}))};
 }
 q.qualified=[...invited,...children.flatMap(c=>c.inviteWinners)];
 if(q.qualified.length!==q.fieldSize||new Set(q.qualified).size!==q.fieldSize)throw Error('Неверный состав после региональных турниров');
 q.status='complete';q.completedDay=S.day;q.adjustments=[];
 e.qualified13=[...q.qualified];e.qualification13={invited:q.invited.map(v=>v.team),matches:QUALIFIERS.regions.flatMap(r=>q.regions[r].matches),day:S.day,qualVersion:QUALIFIERS.version};
 log(e.name+' · региональные турниры завершены, состав из '+q.fieldSize+' клубов утверждён.');return [...q.qualified];
};
const qualifierFatiguePreview=Match22.seriesFatiguePreview;
Match22.seriesFatiguePreview=function(a,id,node){return Number.isInteger(a?.qualifierFor)?{stage:'qualification',base:QUALIFIERS.regional.seriesFatigue,number:0}:qualifierFatiguePreview.call(this,a,id,node);};
const qualifierChargeSeries=Match22.chargeSeries;
Match22.chargeSeries=function(a,ids,node){
 if(Number.isInteger(a?.qualifierFor)&&a.withdrawnV12&&ids.includes(S.club)){
  const state=this.fatigueState(a),key=this.seriesKey(a,ids,node);if(state.charged[key])return false;
  state.charged[key]={stage:'qualification',forfeit:true,teams:[],day:S.day};return true;
 }
 return qualifierChargeSeries.call(this,a,ids,node);
};
