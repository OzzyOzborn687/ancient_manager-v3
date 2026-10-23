'use strict';
const QualifierSceneLegacy={fresh,migrate,calendar:ensureTournamentCalendar,next:nextEvent,update:Qualifiers.update,
 tick,rank:rankTeams13,qualify:qualify13,start:startEvent,finishCalendar:finishCalendar13,valid:validSave,development:ensureDevelopment21};
Qualifiers.installPhase2=function(){
 S.qualifiers.phase2=true;
 // Existing completed/frozen qualifications and active legacy series remain untouched.
 for(const e of S.events)if(e.id!==S.active?.event&&e.qualification?.status==='pending')this.markCareer(e);
 if(S.qualifiers.scene)for(const t of S.teams)t.homeRegion??=this.region(t);
};
fresh=function(...args){QualifierSceneLegacy.fresh(...args);Qualifiers.installPhase2();save();render();};
migrate=function(){QualifierSceneLegacy.migrate();Qualifiers.installPhase2();};
ensureTournamentCalendar=function(){
 const ids=new Set(S?.events?.map(e=>e.id)||[]);QualifierSceneLegacy.calendar();
 if(S?.qualifiers?.phase2)for(const e of S.events)if(!ids.has(e.id)&&!Qualifiers.isRegional(e))Qualifiers.markCareer(e);
 if(S?.qualifiers?.phase2)S.events=S.events.filter(e=>!Qualifiers.isRegional(e)||e.done||e.id===S.active?.event||S.events.find(p=>p.id===e.qualifierFor)?.qualification?.regionalEvents?.[e.qualifierRegion]===e.id);
};
nextEvent=function(){
 ensureTournamentCalendar();
 const active=S.events.find(e=>e.id===S.active?.event);if(active)return active;
 const first=S.events.find(e=>!e.done&&(!Qualifiers.isRegional(e)||e.entrants.includes(S.club)));
 return S.events.find(e=>!e.done&&e.qualifierFor===first?.id&&e.entrants.includes(S.club))||first;
};
startEvent=function(){
 const e=nextEvent();if(!Qualifiers.isRegional(e)||S.active)return QualifierSceneLegacy.start();
 const requested=e.skipRequestedV12;
 // The legacy skip shortcut fills an arbitrary main-event field. Regional clubs
 // must always come from their closed, saved participant list.
 e.skipRequestedV12=false;e.rosterLock=Object.fromEntries(e.entrants.map(id=>[id,roster(S.teams[id]).map(p=>p.id)]));
 try{return QualifierSceneLegacy.start();}finally{e.skipRequestedV12=requested;}
};
finishCalendar13=function(e){
 QualifierSceneLegacy.finishCalendar(e);
 for(const parent of S.events){
  if(parent.done||!parent.qualification?.regionalEvents)continue;
  const children=Object.values(parent.qualification.regionalEvents).map(id=>S.events.find(c=>c.id===id)).filter(Boolean);
  const earliest=Math.max(...children.map(c=>c.completedDay20??c.day+c.duration))+QUALIFIERS.listLead;
  if(parent.day<earliest){parent.originalDay13??=parent.day;parent.day=earliest;log(parent.name+' перенесён после квалификаций на '+date(earliest)+'.');}
 }
 S.events.sort((a,b)=>a.day-b.day||a.id-b.id);
};
Qualifiers.update=function(){QualifierSceneLegacy.update.call(this);this.sceneSeason();this.sceneInactivity();this.backgroundRegionals();};
let qualifierDevelopmentCache=null;
ensureDevelopment21=function(){
 if(!S?.qualifiers?.scene)return QualifierSceneLegacy.development();
 const key=[S,S.day,S.teams.length,S.players.length,S.active];
 if(qualifierDevelopmentCache?.every((v,i)=>v===key[i]))return;
 QualifierSceneLegacy.development();qualifierDevelopmentCache=key;
};
let qualifierLegacySelection=false;
rankTeams13=function(){
 const teams=QualifierSceneLegacy.rank();
 return qualifierLegacySelection&&S.qualifiers?.scene?teams.filter(t=>t.id<S.qualifiers.scene.coreCount):teams;
};
qualify13=function(e,f){
 const previous=qualifierLegacySelection;
 qualifierLegacySelection=!!S.qualifiers?.scene&&!Qualifiers.isRegional(e)&&e.qualification?.sceneVersion!==QUALIFIERS.scene.version;
 try{return QualifierSceneLegacy.qualify(e,f);}finally{qualifierLegacySelection=previous;}
};
Qualifiers.validScene=function(x){
 const scene=x.qualifiers?.scene;if(!scene)return true;
 const C=QUALIFIERS.scene,idOK=id=>Number.isInteger(id)&&id>=0&&id<x.teams.length;
 if(scene.version!==C.version||!Number.isInteger(scene.seed)||!Number.isInteger(scene.coreCount)||scene.coreCount<16||scene.coreCount>24||x.teams.length>C.maxTeams||!Array.isArray(scene.generated)||new Set(scene.generated).size!==scene.generated.length||scene.generated.some(id=>!idOK(id)||id<scene.coreCount)||scene.generated.length!==x.teams.length-scene.coreCount)return false;
 const names=new Set(),roles=x.teams.map(()=>Array(5).fill(0));
 for(const p of x.players){
  if(p.team!==null&&!idOK(p.team)||p.retired&&(!idOK(p.retiredFromTeam)||p.team!==null)||!Number.isInteger(p.role)||p.role<0||p.role>=5)return false;
  if(p.team!==null&&p.active)roles[p.team][p.role]++;
 }
 for(const [i,t] of x.teams.entries()){
  if(t.id!==i||typeof t.name!=='string'||names.has(t.name.toLowerCase())||![1,2,3].includes(t.tier)||!QUALIFIERS.regions.includes(t.homeRegion)||roles[i].some(n=>n!==1))return false;
  names.add(t.name.toLowerCase());
  if(i>=scene.coreCount&&(!t.fiction||!t.sceneClub))return false;
 }
 for(const season of Object.values(scene.seasons||{}))for(const v of Object.values(season)){
  if(!Number.isInteger(v.total)||!v.quotas||Object.values(v.quotas).reduce((a,b)=>a+b,0)!==v.total||QUALIFIERS.regions.some(r=>!Number.isInteger(v.quotas[r])||v.quotas[r]<QUALIFIERS.minQuota||v.quotas[r]>QUALIFIERS.maxQuota))return false;
 }
 if(x.patchV1?.bonuses?.some(b=>!idOK(b.team)))return false;
 if(x.careerRulesV1&&(!Array.isArray(x.patchV1?.bonuses)||x.patchV1.bonuses.length!==2||new Set(x.patchV1.bonuses.map(b=>b.team)).size!==2))return false;
 if(x.practice13&&(!idOK(x.practice13.team)||x.practice13.team===x.club))return false;
 for(const e of x.events){
  if(!this.isRegional(e))continue;
  const parent=x.events.find(p=>p.id===e.qualifierFor),f=FORMAT6[e.formatKey6];
  if(!parent||!f||!['qualifier8','qualifier16'].includes(e.formatKey6)||!QUALIFIERS.regions.includes(e.qualifierRegion)||!Number.isInteger(e.quota)||e.quota<1||e.quota>QUALIFIERS.maxQuota||!Array.isArray(e.entrants)||e.entrants.length!==f.n||new Set(e.entrants).size!==f.n||e.entrants.some(id=>!idOK(id)||parent.qualification?.invited?.some(v=>v.team===id)))return false;
  if(e.done&&(!Array.isArray(e.inviteWinners)||e.inviteWinners.length!==e.quota||new Set(e.inviteWinners).size!==e.quota||e.inviteWinners.some(id=>!e.entrants.includes(id))))return false;
  const a=x.active?.event===e.id?x.active:e.regionalState;
  for(const n of a?.schedule||e.schedule6||[]){
   if(n.bo!==QUALIFIERS.regional.bo||!Array.isArray(n.pair)||n.pair.length!==2)return false;
   if(n.pair.some(v=>typeof v==='number'?!e.entrants.includes(v):!Number.isInteger(v?.id)||v.id<0||v.id>=n.id||!['w','l'].includes(v.out)))return false;
   if(n.maps?.some(m=>!e.entrants.includes(m.winner)||!Difficulty.validMap({sides:n.pair.map(v=>({team:typeof v==='number'?v:(a?.schedule||e.schedule6)[v.id]?.[v.out]})),difficulty:m.difficulty},x)))return false;
  }
 }
 return [x.active?.live,x.active?.sim13?.live,x.practice13?.live].every(m=>Difficulty.validMap(m,x));
};
validSave=function(x){
 try{
 if(!x?.qualifiers?.scene)return QualifierSceneLegacy.valid(x);
 if(!Array.isArray(x.teams)||!Array.isArray(x.players)||!Array.isArray(x.events)||!Number.isInteger(x.club)||x.club<0||x.club>=x.teams.length||!safeStrings(x)||!Qualifiers.validScene(x)||!Qualifiers.valid(x))return false;
 // Run every retained validator for every club, using bounded 16-club projections.
 // Original team bounds and cross-club references are checked above, before projection.
 for(let offset=0;offset<x.teams.length;offset+=16){
  const ids=x.teams.slice(offset,offset+16).map(t=>t.id);
  for(let id=0;ids.length<16;id++)if(!ids.includes(id))ids.push(id);
  const map=new Map(ids.map((id,i)=>[id,i])),club=map.get(x.club)??0;
  const mapLive=m=>m?{...m,difficulty:undefined}:m;
  const copy={...x,club,teams:ids.map((id,i)=>({...x.teams[id],id:i})),
   players:x.players.map(p=>({...p,team:p.team===null?null:map.get(p.team)??null,retiredFromTeam:map.get(p.retiredFromTeam)??0})),
   events:x.events.map(e=>({...e,qualification:undefined})),
   active:x.active?{...x.active,live:mapLive(x.active.live),sim13:x.active.sim13?{...x.active.sim13,live:mapLive(x.active.sim13.live)}:undefined}:null,
   practice13:x.practice13?{...x.practice13,team:map.get(x.practice13.team)??(club===0?1:0),live:mapLive(x.practice13.live)}:null,
   patchV1:x.patchV1?{...x.patchV1,bonuses:x.patchV1.bonuses.map((b,i)=>({...b,team:i}))}:undefined};
  if(copy.practice13?.team===club)copy.practice13.team=(club+1)%16;
  if(!QualifierSceneLegacy.valid(copy))return false;
 }
 return true;
 }catch{return false;}
};
