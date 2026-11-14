'use strict';
const ADMISSION_RULES5=Object.freeze({confirmationDays:15,qualifierSlots:Object.freeze({'BLAST SLAM':2,'PGL WALLACHIA':1,'ESL ONE':1,'DREAMLEAGUE':1})});
const TOURNAMENTS5={
 pgl:{field:16,format:'pgl',source:'https://www.pglesports.com/dota2/wallachia-s9-2026/'},
 blast:{field:16,format:'blast',source:'https://bo3.gg/dota2/news/all-participants-blast-slam-ix'},
 dream:{field:16,format:'dreamGroup',source:'https://pro.eslgaming.com/tour/2026/09/introducing-dotas-ept-season-26-27/'},
 esl:{field:16,format:'esl',source:'https://pro.eslgaming.com/tour/2026/09/introducing-dotas-ept-season-26-27/'},
 ti:{field:16,format:'ti',source:'https://www.gosugamers.net/dota2/news/78497-the-international-2026-direct-invites-regional-qualifier-slots-and-schedule-announced'},
 dacha:{field:12,format:'dacha5',source:'https://www.gosugamers.net/dota2/features/73500-betboom-dacha-belgrade-2024-survival-guide-teams-prizepool-format-broadcasts-and-more'},
 playground:{field:16,format:'pgl',source:'https://www.gosugamers.net/dota2/tournaments/62309-fissure-playground-2'},
 universe:{field:10,format:'ten5',source:'https://t.me/s/fissure_pro_dota2?before=7666'},
 oneWin:{field:8,format:'eight5',source:'https://www.gosugamers.net/dota2/tournaments/60705-1win-series-dota-2-spring'},
 clavision:{field:10,format:'ten5',source:'https://www.gosugamers.net/dota2/news/72201-kuroky-and-miracle-to-miss-clavision-snow-ruyi-invitational-lan'},
 acl:{field:8,format:'eight5',source:'https://en.prnasia.com/releases/global/hero-esports-asian-champions-league-dota-2-tournament-champions-secure-place-in-esports-world-cup-480891.shtml'},
 elite:{field:16,format:'cup',source:'https://esports.gg/news/dota-2/all-teams-qualified-for-elite-league-season-2/'},
 future:{field:16,format:'cup',source:'https://www.cybersport.ru/tournaments/dota-2/igry-budushchego-2024'},
 ewc:{field:16,format:'cup',source:'https://esports.gg/news/dota-2/esports-world-cup-2025-all-qualified-and-invited-dota-2-teams/'},
 riyadh:{field:20,format:'twenty5',source:'https://escharts.com/news/riyadh-masters-2024-quals-viewership'},
 dachaDubai:{field:12,format:'dacha5',source:'https://www.gosugamers.net/dota2/news/70379-betboom-dacha-features-odd-regions-merger-for-qualifiers-leg'},
};
FORMAT6.dacha5={n:12,kind:'rr',size:6,bo:2,lowerSplit8:true,label:'12 команд · 2 группы по 6 BO2 → Double Elimination на 8 · финал BO5',note:'Шаблон BetBoom Dacha Belgrade 2024.'};
FORMAT6.ten5={n:10,kind:'rr',size:5,bo:2,label:'10 команд · 2 группы по 5 BO2 → Double Elimination на 8 · финал BO5',note:'Группы и посев адаптированы для игрового календаря.'};
FORMAT6.eight5={n:8,kind:'rr',size:4,bo:3,allEight5:true,label:'8 команд · 2 группы по 4 BO3 → Double Elimination на 8 · финал BO5',note:'Игровая адаптация этапов; источник числа участников и инвайтов указан в квалификациях.'};
FORMAT6.twenty5={n:20,kind:'rr',size:5,bo:2,topTwo5:true,label:'20 команд · 4 группы по 5 BO2 → лучшие 2 каждой группы, DE8 · финал BO5',note:'Упрощённый игровой формат Riyadh: реальный play-in не воспроизводится.'};
for(let n=1;n<=16;n++)FORMAT6['qualifier5n'+n]={n,kind:'rr',size:n,bo:3,label:n+' реальных клубов · круговой отбор BO3',note:'Игровой закрытый отбор без вымышленных участников. Очки → Бухгольц → разница карт → выигранные карты → посев. Проходят первые K. При единственном участнике — проход без матча.'};
const Admissions5={
 installing:false,
 policy(e){
  const series=circuitSeries(e),key=series==='BETBOOM DACHA'&&/dubai|дубай/i.test(e.name)?'dachaDubai':
   ({'PGL WALLACHIA':'pgl','BLAST SLAM':'blast','DREAMLEAGUE':'dream','ESL ONE':'esl','THE INTERNATIONAL':'ti','BETBOOM DACHA':'dacha','1WIN SERIES':'oneWin','CLAVISION':'clavision','ASIAN CHAMPIONS LEAGUE':'acl','ELITE LEAGUE':'elite','GAMES OF THE FUTURE':'future','ESPORTS WORLD CUP':'ewc','RIYADH MASTERS':'riyadh'})[series]||(series==='FISSURE'?(/playground/i.test(e.name)?'playground':'universe'):null);
  const format=TOURNAMENTS5[key];if(!format)return null;
  const slots=ADMISSION_RULES5.qualifierSlots[series]??0;
  return {...format,direct:format.field-slots,quotas:slots?{GLOBAL:slots}:{},label:'V5.0 B · региональный рейтинг',
   note:slots?'Лидер каждого региона получает прямой инвайт. Оставшиеся прямые места — следующим командам по региональному месту и рейтингу сезона. '+slots+' мест на квалификацию на весь турнир.':'Все места — прямые инвайты по региональному рейтингу. Квалификаций нет.'};
 },
 migrateAdmissions(){
  if(S.v5.hotfixA)return;
  const activeParent=S.events.find(e=>e.id===S.active?.event)?.qualifierFor;
  const reset=new Set(S.events.filter(e=>!e.done&&!Qualifiers.isRegional(e)&&e.id!==S.active?.event&&e.id!==activeParent).map(e=>e.id));
  for(const b of Object.values(S.v4?.camps||{}))if(reset.has(b.event)&&b.status==='active')Camp4.close(b,'interrupted');
  for(const e of S.events)if(reset.has(e.id)){delete e.qualification;delete e.qualified13;delete e.qualification13;}
  const removed=new Set(S.events.filter(e=>reset.has(e.qualifierFor)).map(e=>e.id));
  S.v5.legacyArchive.events.push(...S.events.filter(e=>removed.has(e.id)&&e.done));
  S.events=S.events.filter(e=>!removed.has(e.id));
  if(S.v4)for(const [key,b] of Object.entries(S.v4.camps))if(removed.has(b.event)){if(b.status==='active')Camp4.close(b,'interrupted');delete S.v4.camps[key];}
  S.v5.hotfixA=true;
 },
 install(){
  if(!S?.v5?.sceneReady||this.installing||Scene5.loading||Scene5.installing)return;
  this.installing=true;
  try{this.migrateAdmissions();LegacyAdmissions5.repairFuture();for(const e of S.events){
   if(Qualifiers.isRegional(e)||e.done||e.id===S.active?.event)continue;
   if(isTI(e)&&e.qualified13&&(e.festivalInvitation||S.tiRecovery?.day===e.day&&['exact','restart'].includes(S.tiRecovery.mode))){
    if(e.qualification?.majorVersion===5){const children=new Set(Object.values(e.qualification.regionalEvents||{}));e.legacyQualification5=e.qualification;delete e.qualification;S.events=S.events.filter(c=>!children.has(c.id)||c.done||c.id===S.active?.event);}
    e.formatKey6='ti';continue;
   }
   if(e.qualification?.majorVersion===5)continue;
   if(e.qualified13&&!e.qualification)continue; // Explicit legacy/festival fields already accepted by the engine.
   const rule=this.policy(e);if(!rule)continue;e.formatKey6=rule.format;
   delete e.qualified13;delete e.qualification13;
   e.qualification={qualVersion:1,majorVersion:5,status:'pending',mode:'published-rules-v5',policy:structuredClone(rule)};
  }}finally{this.installing=false;}
 },
 members(group,t){const r=Qualifiers.region(t);return group==='GLOBAL'||group==='DIV2'&&t.tier>1||group==='EUROPE'&&['EU','EEU'].includes(r)||group==='AMERICAS'&&['NA','SA'].includes(r)||group==='ASIA'&&['CN','SEA'].includes(r)||group===r;},
 rows(e){
  const positions={},rows=rankTeams13().map(t=>{const region=Qualifiers.region(t);positions[region]=(positions[region]||0)+1;return {team:t.id,region,regionalRank:positions[region],season:clubState13(t).seasonPoints,elo:clubState13(t).elo,busy:Qualifiers.busy(e,t.id)?.id??null};});
  rows.sort((a,b)=>a.regionalRank-b.regionalRank||b.season-a.season||b.elo-a.elo||a.team-b.team);
  return rows.map((r,i)=>({...r,rank:i+1,index:1-i/rows.length}));
 },
 freeze(e){
  const q=e.qualification;if(q.status!=='pending')return q;
  const rule=q.policy;
  e.originalDay13??=e.day;e.day=Math.max(e.day,S.day+QUALIFIERS.snapshotLead);
  const rows=this.rows(e),available=rows.filter(r=>r.busy===null&&(!rule.inviteRegion||this.members(rule.inviteRegion,S.teams[r.team])));
  // Reserve the exact published regional quotas before selecting direct invites.
  const residual=group=>rows.filter(r=>r.busy===null&&this.members(group,S.teams[r.team])).length;
  const invited=[];
  for(const r of available){
   if(invited.length===rule.direct)break;
   const groupOK=Object.entries(rule.quotas).every(([group,quota])=>['GLOBAL','DIV2'].includes(group)||residual(group)-[...invited,r].filter(v=>this.members(group,S.teams[v.team])).length>=quota);
   if(groupOK)invited.push({...r,reason:'season-top',text:'Регион '+(r.region==='EU'?'WEU':r.region)+' · место '+r.regionalRank});
  }
  Object.assign(q,{snapshotDay:S.day,eventDay:e.day,fieldSize:rule.field,rows,invited,rules:{invites:rule.direct,listLead:ADMISSION_RULES5.confirmationDays},regionalEvents:{},player:{team:S.club,index:rows.find(r=>r.team===S.club)?.index??0,invited:invited.some(r=>r.team===S.club)}});
  if(invited.length!==rule.direct){q.status='blocked';q.reason='Недостаточно свободных реальных клубов при сохранении региональных квот.';return q;}
  q.status='frozen';
  try{
   // Saved pre-5.0 A qualifications may retain historical regional/Division 2 paths.
   if(rule.quotas.DIV2)this.child(e,'DIV2',rule.quotas.DIV2);
   for(const [group,quota] of Object.entries(rule.quotas))if(!['DIV2','GLOBAL'].includes(group))this.child(e,group,quota);
   if(!Object.keys(q.regionalEvents).length&&rule.quotas.GLOBAL)this.child(e,'GLOBAL',rule.quotas.GLOBAL);
   log(e.name+' · '+rule.direct+' прямых инвайтов; '+(rule.field-rule.direct)+' мест отбора. Регламент: '+rule.label+'.');
  }catch(error){q.status='blocked';q.reason=error.message;}
  this.complete(e);S.events.sort((a,b)=>a.day-b.day||a.id-b.id);return q;
 },
 child(parent,group,quota){
  const q=parent.qualification,used=new Set(q.invited.map(r=>r.team));
  const children=Object.values(q.regionalEvents).map(id=>S.events.find(e=>e.id===id));
  for(const child of children)for(const id of group==='GLOBAL'?child.inviteWinners||[]:child.entrants)used.add(id);
  let candidates=q.rows.filter(r=>!used.has(r.team)&&this.members(group,S.teams[r.team])&&!Qualifiers.busy(parent,r.team));
  const max=group==='DIV2'?Math.min(8,Math.max(quota,candidates.length-6)):Math.max(8,quota*2);
  if(group==='DIV2'){
   const pool=q.rows.filter(r=>!used.has(r.team)&&!Qualifiers.busy(parent,r.team)),selected=[];
   for(const r of candidates){
    if(selected.length===max)break;
    const chosen=[...selected,r];
    if(Object.entries(q.policy.quotas).every(([region,k])=>['DIV2','GLOBAL'].includes(region)||pool.filter(v=>this.members(region,S.teams[v.team])&&!chosen.some(x=>x.team===v.team)).length>=k))selected.push(r);
   }
   candidates=selected;
  }else candidates=candidates.slice(0,Math.min(16,max));
  if(candidates.length<quota)throw Error('Отбор '+group+': недостаточно свободных реальных клубов. Квота не передана другому региону.');
  if(group==='GLOBAL'){parent.day=Math.max(parent.day,S.day+QUALIFIERS.listLead+Math.ceil(candidates.length/2)+3);q.eventDay=parent.day;}
  const own=candidates.some(r=>r.team===S.club),day=Qualifiers.regionalWindow(parent,own);
  if(day===null)throw Error('Не найдено окно отбора '+group+'.');
  const id=Math.max(...S.events.map(e=>e.id))+1;
  const child={id,name:parent.name+' · '+this.groupName(group),series:'QUALIFICATION',qualifierFor:parent.id,qualifierRegion:group,v5Qualifier:true,quota,day,duration:Math.max(6,Math.ceil(candidates.length/2)),pool:QUALIFIERS.regional.pool,venue:'Онлайн · '+this.groupName(group),real:false,formatKey6:'qualifier5n'+candidates.length,format:'circuit-v6',entrants:candidates.map(r=>r.team),inviteTrophy:true,rosterLock:Object.fromEntries(candidates.map(r=>[r.team,roster(S.teams[r.team]).map(p=>p.id)]))};
  child.entry5=Object.fromEntries(candidates.map(r=>[r.team,{region:Qualifiers.region(S.teams[r.team]),tier:S.teams[r.team].tier}]));
  q.regionalEvents[group]=id;S.events.push(child);
  if(child.entrants.length===quota){Object.assign(child,{done:true,inviteWinners:[...child.entrants],champion:child.entrants[0],placements6:Object.fromEntries(child.entrants.map((id,i)=>[id,i+1])),seeds6:Object.fromEntries(candidates.map(r=>[r.team,r.elo])),schedule6:[],completedDay20:S.day,walkover5:true});}
  else Qualifiers.regionalState(child);
  return child;
 },
 complete(e){
  const q=e.qualification;if(q.status==='pending')return this.freeze(e)?.qualified||null;
  if(q.status==='complete')return [...q.qualified];if(q.status!=='frozen')return null;
  const children=Object.values(q.regionalEvents).map(id=>S.events.find(c=>c.id===id));
  if(children.some(c=>!c?.done))return null;
  if(q.policy.quotas.GLOBAL&&!q.regionalEvents.GLOBAL){try{this.child(e,'GLOBAL',q.policy.quotas.GLOBAL);}catch(error){q.status='blocked';q.reason=error.message;}return null;}
  const qualified=[...q.invited.map(r=>r.team),...children.flatMap(c=>c.inviteWinners)];
  if(qualified.length!==q.fieldSize||new Set(qualified).size!==q.fieldSize){q.status='blocked';q.reason='Квалификации не сформировали полное уникальное поле.';return null;}
  const conflicts=qualified.map(id=>Qualifiers.busy(e,id)).filter(Boolean);
  if(conflicts.length){e.day=Math.max(e.day,...conflicts.map(c=>c.day+(c.duration||10)+2));q.eventDay=e.day;return null;}
  q.status='complete';q.qualified=qualified;q.completedDay=S.day;e.qualified13=[...qualified];e.qualification13={invited:q.invited.map(r=>r.team),matches:[],day:S.day,majorVersion:5};return [...qualified];
 },
 groupName(group){return ({EU:'Западная Европа',EEU:'Восточная Европа',EUROPE:'Европа (WEU + EEU)',CN:'Китай',SEA:'Юго-Восточная Азия',NA:'Северная Америка',SA:'Южная Америка',AMERICAS:'Америка (NA + SA)',ASIA:'Азия (CN + SEA)',DIV2:'Division 2 · игровой отбор',GLOBAL:'Квалификация'})[group]||group;},
 valid(e,state){
  if(LegacyAdmissions5.validField(e,state))return true;
  const q=e.qualification,r=q.policy,idOK=id=>Number.isInteger(id)&&!!state.teams[id];
  if(q.qualVersion!==1||q.majorVersion!==5||!['pending','frozen','complete','blocked'].includes(q.status)||!r||!Number.isInteger(r.field)||r.field!==format6(e).n||!Number.isInteger(r.direct)||r.direct<0||r.direct>r.field||!r.quotas||Object.values(r.quotas).some(n=>!Number.isInteger(n)||n<1)||r.direct+Object.values(r.quotas).reduce((s,n)=>s+n,0)!==r.field)return false;
  if(q.status==='pending')return true;
  if(!Number.isInteger(q.snapshotDay)||q.snapshotDay>state.day||q.fieldSize!==r.field||!Array.isArray(q.rows)||q.rows.some(row=>!idOK(row.team)||!Number.isFinite(row.elo)||!Number.isInteger(row.rank)))return false;
  if(q.status==='blocked')return typeof q.reason==='string';
  if(q.rules?.invites!==r.direct||!Array.isArray(q.invited)||q.invited.length!==r.direct||new Set(q.invited.map(v=>v.team)).size!==r.direct||q.invited.some(v=>!idOK(v.team))||!q.regionalEvents)return false;
  for(const [group,id] of Object.entries(q.regionalEvents)){
   const child=state.events.find(c=>c.id===id);if(!child||!child.v5Qualifier||child.qualifierFor!==e.id||child.qualifierRegion!==group||child.quota!==r.quotas[group])return false;
  }
  if(q.status==='complete'){
   const children=Object.values(q.regionalEvents).map(id=>state.events.find(c=>c.id===id));
   if(children.some(c=>!c.done)||Object.keys(q.regionalEvents).length!==Object.keys(r.quotas).length||!Array.isArray(q.qualified)||q.qualified.length!==r.field||new Set(q.qualified).size!==r.field||q.qualified.some(id=>!idOK(id))||JSON.stringify(q.qualified)!==JSON.stringify([...q.invited.map(v=>v.team),...children.flatMap(c=>c.inviteWinners)])||JSON.stringify(e.qualified13)!==JSON.stringify(q.qualified))return false;
  }
  return true;
 },
 validChild(e,state){
  const parent=state.events.find(p=>p.id===e.qualifierFor),q=parent?.qualification,ids=e.entrants;
  if(!q||q.majorVersion!==5||q.regionalEvents?.[e.qualifierRegion]!==e.id||e.quota!==q.policy.quotas[e.qualifierRegion]||!Array.isArray(ids)||ids.length<e.quota||ids.length>16||e.formatKey6!=='qualifier5n'+ids.length||new Set(ids).size!==ids.length||ids.some(id=>!state.teams[id]||(!LegacyAdmissions5.recognizes(parent)&&q.invited.some(v=>v.team===id))||!e.entry5?.[id]||![1,2,3].includes(e.entry5[id].tier)||!REGIONS5.includes(e.entry5[id].region)||!this.members(e.qualifierRegion,{homeRegion:e.entry5[id].region,tier:e.entry5[id].tier})))return false;
  if(e.done&&(!Array.isArray(e.inviteWinners)||e.inviteWinners.length!==e.quota||new Set(e.inviteWinners).size!==e.quota||e.inviteWinners.some(id=>!ids.includes(id))))return false;
  const a=state.active?.event===e.id?state.active:e.regionalState;
  for(const n of a?.schedule||e.schedule6||[])if(n.bo!==3||!Array.isArray(n.pair)||n.pair.length!==2||n.pair[0]===n.pair[1]||n.pair.some(id=>!ids.includes(id))||n.w!==undefined&&n.w!==null&&!n.pair.includes(n.w))return false;
  return true;
 }
};
// Keep the previous save validators and engine; extend only their explicit V5 schema branches.
const majorInstall5=Majors4.install;
Majors4.install=function(){if(S?.v5?.sceneReady)return Admissions5.install();if(!Scene5.loading)return majorInstall5.call(this);};
const calendar5=ensureTournamentCalendar,formatKey5=formatKey6,freeze5=Qualifiers.freeze,complete5=Qualifiers.complete,qualify5=qualify13;
ensureTournamentCalendar=function(){calendar5();Admissions5.install();};
const mark5=Qualifiers.mark;
Qualifiers.mark=function(e){if(!S?.v5?.sceneReady||Scene5.loading)return mark5.call(this,e);if(!this.isRegional(e)&&!e.done&&e.id!==S.active?.event&&!e.qualification&&!e.qualified13){const policy=Admissions5.policy(e);if(policy){e.formatKey6=policy.format;e.qualification={qualVersion:1,majorVersion:5,status:'pending',mode:'published-rules-v5',policy:structuredClone(policy)};}}};
Qualifiers.markCareer=function(e){this.mark(e);};
formatKey6=function(e){return e?.qualification?.majorVersion===5||e?.v5Qualifier?(e.formatKey6||e.qualification?.policy?.format||Admissions5.policy(e)?.format||formatKey5(e)):formatKey5(e);};
Qualifiers.freeze=function(e){return e.qualification?.majorVersion===5?Admissions5.freeze(e):freeze5.call(this,e);};
Qualifiers.complete=function(e){return e.qualification?.majorVersion===5?Admissions5.complete(e):complete5.call(this,e);};
qualify13=function(e,f){if(e.qualification?.majorVersion!==5)return qualify5(e,f);const ids=Admissions5.complete(e);if(!ids)throw Error(e.qualification.reason||'Сначала завершите квалификации.');return [...ids];};
const regionalState5=Qualifiers.regionalState,finishRegional5=Qualifiers.finishRegional,phase5=phaseNext6,rr5=roundRobin6;
roundRobin6=function(a,ids,size,bo){
 if(size%2===0)return rr5(a,ids,size,bo);
 a.groupIds=[];for(let offset=0;offset<ids.length;offset+=size)a.groupIds.push(ids.slice(offset,offset+size));
 for(let g=0;g<a.groupIds.length;g++){
  const ring=[...a.groupIds[g],null];
  for(let round=0;round<size;round++){
   for(let i=0;i<ring.length/2;i++)if(ring[i]!==null&&ring[ring.length-1-i]!==null)node6(a,'Группа '+String.fromCharCode(65+g)+' · тур '+(round+1),[ring[i],ring[ring.length-1-i]],bo,{groupMatch:true,group:g});
   ring.splice(1,0,ring.pop());
  }
 }
};
Qualifiers.regionalState=function(e){
 if(!e.v5Qualifier)return regionalState5.call(this,e);if(e.regionalState)return e.regionalState;
 const a={event:e.id,qualifierFor:e.qualifierFor,qualifierRegion:e.qualifierRegion,format6:true,formatKey6:e.formatKey6,phase:'circuit',stage:'Круговой отбор BO3',schedule:[],cursor:0,entrants:[...e.entrants],seeds:Object.fromEntries(e.entrants.map(id=>[id,strength(S.teams[id])])),stage6:'groups',placements:{},score:[0,0],maps:[],live:null,seriesDone:false,round:0,totalRounds:1,pairs:[],bracket:[],bo:3,startDay13:e.day};
 roundRobin6(a,a.entrants,a.entrants.length,3);e.regionalState=a;assignDates13(a);e.schedule6=structuredClone(a.schedule);e.seeds6={...a.seeds};return a;
};
phaseNext6=function(a){
 if(a.formatKey6.startsWith('qualifier5n')){ranks6(a).forEach((r,i)=>a.placements[r.id]=i+1);a.stage6='playoffs';return false;}
 const f=FORMAT6[a.formatKey6];
 if(a.stage6==='groups'&&(f.allEight5||f.topTwo5)){
  const groups=a.groupIds.map(ids=>ranks6(a,ids)),take=f.allEight5?4:2,seeds=[];
  for(let rank=0;rank<take;rank++)for(const group of groups)seeds.push(group[rank].id);
  for(const id of a.entrants)if(!seeds.includes(id))a.placements[id]=9;
  de8_6(a,seeds);a.stage6='playoffs';return true;
 }
 return phase5(a);
};
Qualifiers.finishRegional=function(a,...args){const e=S.events.find(e=>e.id===a.event);if(e?.v5Qualifier)ranks6(a).forEach((r,i)=>a.placements[r.id]=i+1);const result=finishRegional5.call(this,a,...args);if(e?.v5Qualifier)e.champion=+Object.keys(e.placements6).find(id=>e.placements6[id]===1);return result;};
const start5=startEvent;
startEvent=function(...args){
 const e=nextEvent();if(e?.qualification?.majorVersion!==5||S.active||e.day>S.day)return start5(...args);
 if(!Admissions5.complete(e)){toast(e.qualification.reason||'Сначала завершите отборы из вкладки «Квалификации».');return;}
 const requested=e.skipRequestedV12;e.skipRequestedV12=false;try{return start5(...args);}finally{e.skipRequestedV12=requested;}
};
