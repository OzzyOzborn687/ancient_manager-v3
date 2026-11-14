'use strict';
const RULES5={
 pgl:{field:16,direct:16,quotas:{},format:'pgl',label:'PGL Wallachia S9 · 2026',source:'https://www.pglesports.com/dota2/wallachia-s9-2026/',note:'Все 16 мест — прямые приглашения. Выбор организатора моделируется рейтингом сезона.'},
 blast:{field:16,direct:12,quotas:{EUROPE:2,SEA:1,CN:1},format:'blast',label:'BLAST Slam IX · 2026',source:'https://bo3.gg/dota2/news/all-participants-blast-slam-ix',note:'Европейская квалификация объединяет WEU и EEU. Региональные квоты относятся к отбору, а не к прямым инвайтам.'},
 dream:{field:16,direct:6,quotas:{EU:1,EEU:1,SEA:1,SA:1,CN:1,DIV2:1,GLOBAL:4},format:'dreamGroup',label:'DreamLeague S31 · 2026/27',source:'https://pro.eslgaming.com/tour/2026/09/introducing-dotas-ept-season-26-27/',note:'6 EPT + 5 региональных мест + победитель Division 2 + 4 TBC. TBC в игре разыгрываются в мировом Last Chance; это игровая адаптация. Все сезоны в игре имеют 16 команд, включая S30, у которого в реальности 24. Победитель Division 2 определяется отдельным игровым отбором.'},
 esl:{field:16,direct:8,quotas:{EU:1,EEU:1,SEA:1,SA:1,CN:1,GLOBAL:3},format:'esl',label:'ESL One · EPT 2026/27',source:'https://pro.eslgaming.com/tour/2026/09/introducing-dotas-ept-season-26-27/',note:'8 EPT + 5 региональных мест + 3 TBC. Мировой Last Chance для TBC — игровое распределение ещё не объявленных мест.'},
 ti:{field:16,direct:7,quotas:{EUROPE:4,CN:2,SEA:1,NA:1,SA:1},format:'ti',label:'The International 2026',source:'https://www.gosugamers.net/dota2/news/78497-the-international-2026-direct-invites-regional-qualifier-slots-and-schedule-announced',note:'Единый европейский отбор на 4 места. Семь прямых приглашений моделируются по результатам сезона.'},
 dacha:{field:12,direct:7,quotas:{EU:1,EEU:1,CN:1,SEA:1,AMERICAS:1},format:'dacha5',label:'BetBoom Dacha Belgrade · 2024',source:'https://www.gosugamers.net/dota2/features/73500-betboom-dacha-belgrade-2024-survival-guide-teams-prizepool-format-broadcasts-and-more',note:'Шаблон Belgrade: 7 прямых + по одному месту WEU, EEU, CN, SEA, Americas. Будущие выпуски — сценарии карьеры.'},
 playground:{field:16,direct:12,quotas:{EU:1,EEU:1,ASIA:1,AMERICAS:1},format:'pgl',label:'FISSURE Playground 2 · 2025',source:'https://www.gosugamers.net/dota2/tournaments/62309-fissure-playground-2',note:'12 прямых + WEU, EEU, CN/SEA, Americas по одному. Для будущих сезонов используется этот опубликованный шаблон.'},
 universe:{field:10,direct:10,quotas:{},format:'ten5',label:'FISSURE Universe Episode 7 · 2025',source:'https://t.me/s/fissure_pro_dota2?before=7666',note:'Эпизоды Universe меняют правила. Выбран шаблон Episode 7: все десять приглашены. Две группы по пять → DE8 — игровой формат будущих выпусков.'},
 oneWin:{field:8,direct:8,quotas:{},format:'eight5',label:'1win Series · 2024',source:'https://www.gosugamers.net/dota2/tournaments/60705-1win-series-dota-2-spring',note:'Все восемь команд приглашены. Группы BO3 и DE8 — игровая адаптация; реальный шаблон использует GSL и Single Elimination.'},
 clavision:{field:10,direct:10,quotas:{},format:'ten5',label:'Clavision Snow Ruyi · 2024',source:'https://www.gosugamers.net/dota2/news/72201-kuroky-and-miracle-to-miss-clavision-snow-ruyi-invitational-lan',note:'Все десять команд приглашены; будущие выпуски используют исторический шаблон.'},
 acl:{field:8,direct:4,quotas:{CN:4},format:'eight5',label:'Asian Champions League · анонс 2025',source:'https://en.prnasia.com/releases/global/hero-esports-asian-champions-league-dota-2-tournament-champions-secure-place-in-esports-world-cup-480891.shtml',note:'4 приглашения + 4 места китайского отбора. Прямые приглашения также ограничены китайским пулом. Структура этапов адаптирована к игре.',inviteRegion:'CN'},
 elite:{field:16,direct:10,quotas:{EU:1,EEU:1,CN:1,SEA:1,NA:1,SA:1},format:'cup',label:'Elite League S2 · 2024',source:'https://esports.gg/news/dota-2/all-teams-qualified-for-elite-league-season-2/',note:'16 участников: 6 победителей региональных квалификаций и 10 прямых мест. Структура основного турнира — игровой шаблон.'},
 future:{field:16,direct:14,quotas:{GLOBAL:2},format:'cup',label:'Games of the Future · 2024',source:'https://www.cybersport.ru/tournaments/dota-2/igry-budushchego-2024',note:'14 приглашений + 2 победителя Phygital Games. В игре эти два места разыгрывает мировой отбор; исторические победители не назначаются автоматически.'},
 ewc:{field:16,direct:8,quotas:{EU:2,EEU:1,CN:1,SEA:1,NA:1,SA:1,GLOBAL:1},format:'cup',label:'Esports World Cup · 2025',source:'https://esports.gg/news/dota-2/esports-world-cup-2025-all-qualified-and-invited-dota-2-teams/',note:'Шаблон 2025: 8 прямых + 8 через отбор. MENA-слот заменён мировым отбором: в базе игры нет отдельного пула MENA. Китайский слот ACL представлен квалификацией CN; отдельной связи с результатом ACL пока нет.'},
 riyadh:{field:20,direct:8,quotas:{EU:2,EEU:1,CN:3,SEA:2,SA:2,NA:1,GLOBAL:1},format:'twenty5',label:'Riyadh Masters · 2024',source:'https://escharts.com/news/riyadh-masters-2024-quals-viewership',note:'8 EPT + 12 мест: WEU2, EEU1, CN3, SEA2, SA2, NA1, MENA1. MENA заменён мировым отбором. Четыре группы по пять → DE8 — упрощённый игровой формат; реальные play-in и группы не воспроизводятся.'}
};
RULES5.dachaDubai={...RULES5.dacha,quotas:{EU:1,EEU:1,ASIA:1,AMERICAS:1,GLOBAL:1},label:'BetBoom Dacha Dubai · 2024',source:'https://www.gosugamers.net/dota2/news/70379-betboom-dacha-features-odd-regions-merger-for-qualifiers-leg',note:'12 команд: 7 прямых + WEU1, EEU1, CN/SEA1, Americas1, MENA1. MENA заменён мировым отбором, поскольку отдельного пула MENA в игре нет.'};
FORMAT6.dacha5={n:12,kind:'rr',size:6,bo:2,lowerSplit8:true,label:'12 команд · 2 группы по 6 BO2 → Double Elimination на 8 · финал BO5',note:'Шаблон BetBoom Dacha Belgrade 2024.'};
FORMAT6.ten5={n:10,kind:'rr',size:5,bo:2,label:'10 команд · 2 группы по 5 BO2 → Double Elimination на 8 · финал BO5',note:'Группы и посев адаптированы для игрового календаря.'};
FORMAT6.eight5={n:8,kind:'rr',size:4,bo:3,allEight5:true,label:'8 команд · 2 группы по 4 BO3 → Double Elimination на 8 · финал BO5',note:'Игровая адаптация этапов; источник числа участников и инвайтов указан в квалификациях.'};
FORMAT6.twenty5={n:20,kind:'rr',size:5,bo:2,topTwo5:true,label:'20 команд · 4 группы по 5 BO2 → лучшие 2 каждой группы, DE8 · финал BO5',note:'Упрощённый игровой формат Riyadh: реальный play-in не воспроизводится.'};
for(let n=1;n<=16;n++)FORMAT6['qualifier5n'+n]={n,kind:'rr',size:n,bo:3,label:n+' реальных клубов · круговой отбор BO3',note:'Игровой закрытый отбор без вымышленных участников. Очки → Бухгольц → разница карт → выигранные карты → посев. Проходят первые K. При единственном участнике — проход без матча.'};
const Admissions5={
 installing:false,
 policy(e){
  const s=circuitSeries(e);
  if(s==='BETBOOM DACHA'&&/dubai|дубай/i.test(e.name))return RULES5.dachaDubai;
  return RULES5[({'PGL WALLACHIA':'pgl','BLAST SLAM':'blast','DREAMLEAGUE':'dream','ESL ONE':'esl','THE INTERNATIONAL':'ti','BETBOOM DACHA':'dacha','1WIN SERIES':'oneWin','CLAVISION':'clavision','ASIAN CHAMPIONS LEAGUE':'acl','ELITE LEAGUE':'elite','GAMES OF THE FUTURE':'future','ESPORTS WORLD CUP':'ewc','RIYADH MASTERS':'riyadh'})[s]||(s==='FISSURE'?(/playground/i.test(e.name)?'playground':'universe'):null)];
 },
 install(){
  if(!S?.v5?.sceneReady||this.installing||Scene5.loading||Scene5.installing)return;
  this.installing=true;
  try{for(const e of S.events){
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
 rows(e){return rankTeams13().map((t,i)=>({team:t.id,rank:i+1,region:Qualifiers.region(t),season:clubState13(t).seasonPoints,elo:clubState13(t).elo,index:1-i/Math.max(1,S.teams.length),busy:Qualifiers.busy(e,t.id)?.id??null}));},
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
   if(groupOK)invited.push({...r,reason:'season-top',text:'Рейтинг сезона · место '+r.rank});
  }
  Object.assign(q,{snapshotDay:S.day,eventDay:e.day,fieldSize:rule.field,rows,invited,rules:{invites:rule.direct,listLead:7},regionalEvents:{},player:{team:S.club,index:rows.find(r=>r.team===S.club)?.index??0,invited:invited.some(r=>r.team===S.club)}});
  if(invited.length!==rule.direct){q.status='blocked';q.reason='Недостаточно свободных реальных клубов при сохранении региональных квот.';return q;}
  q.status='frozen';
  try{
   // Division 2 gets a separate pool; fixed regions run concurrently. Last Chance runs after them.
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
 groupName(group){return ({EU:'Западная Европа',EEU:'Восточная Европа',EUROPE:'Европа (WEU + EEU)',CN:'Китай',SEA:'Юго-Восточная Азия',NA:'Северная Америка',SA:'Южная Америка',AMERICAS:'Америка (NA + SA)',ASIA:'Азия (CN + SEA)',DIV2:'Division 2 · игровой отбор',GLOBAL:'Мировой Last Chance · игровая адаптация'})[group]||group;},
 valid(e,state){
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
  if(!q||q.majorVersion!==5||q.regionalEvents?.[e.qualifierRegion]!==e.id||e.quota!==q.policy.quotas[e.qualifierRegion]||!Array.isArray(ids)||ids.length<e.quota||ids.length>16||e.formatKey6!=='qualifier5n'+ids.length||new Set(ids).size!==ids.length||ids.some(id=>!state.teams[id]||q.invited.some(v=>v.team===id)||!e.entry5?.[id]||![1,2,3].includes(e.entry5[id].tier)||!REGIONS5.includes(e.entry5[id].region)||!this.members(e.qualifierRegion,{homeRegion:e.entry5[id].region,tier:e.entry5[id].tier})))return false;
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
