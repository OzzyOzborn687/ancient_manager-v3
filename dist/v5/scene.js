'use strict';
const REGIONS5=['EEU','EU','CN','SEA','NA','SA'];
// V5 changes the starting world; player growth, OVR, SIN and match rules stay in their existing modules.
const Scene5={
 installing:false,loading:false,creating:false,
 key(name){return String(name).normalize('NFKC').replace(/[^\p{L}\p{N}]/gu,'').toLowerCase();},
 coreRegions:['CN','EEU','EEU','EEU','EU','CN','SA','SA','EU','EEU','EEU','EU','NA','SEA','EEU','EU'],
 realPlayer(name,role,team,rating){
  let p=S.players.find(p=>!p.retired&&p.team===null&&this.key(p.name)===this.key(name));
  if(!p){p=newPlayerV1(name,role,team,rating,true);S.players.push(p);initPlayer13(p);}
  Object.assign(p,{team,role,active:true,fiction:false,scenePlayer:false,contract:Math.max(365,p.contract)});
  const skill=p.skill;amPlayerRating(p);p.skill=skill;p.amRating.initial=skill;p.amRating.offset=skill-amWeightedRating(p.amRating.values,role);return p;
 },
 replacement(team,role){
  const reserved=new Set(CLUBS5.flatMap(d=>d.players.map(p=>this.key(p.name))));
  let p=S.players.filter(p=>p.team===null&&!p.retired&&!p.fiction&&p.role===role&&!reserved.has(this.key(p.name))).sort((a,b)=>a.skill-b.skill||a.id-b.id)[0];
  if(!p){
   const veterans=[['Arteezy','EternaLEnVy','Sccc'],['Dendi','Fata','MagicaL'],['Resolut1on','Ceb','Universe'],['Cr1t-','Chuvash','YapzOr'],['pieliedie','Dubu','Fly','Solo','ppd','Dy']][role];
   const name=veterans.find(name=>!S.players.some(p=>this.key(p.name)===this.key(name)));
   if(!name)throw Error('Не найден реальный свободный игрок позиции '+(role+1));
   p=this.realPlayer(name,role,team,78);p.source5='https://liquipedia.net/dota2/'+encodeURIComponent(name);p.gameSigning5=true;
  }
  Object.assign(p,{team,active:true,contract:365});return p;
 },
 install(){
  if(!S||this.installing||this.loading||S.v5?.sceneReady)return;
  const removed=S.teams.filter(t=>t.fiction),gone=new Set(removed.map(t=>t.id));
  if(S.active&&S.active.entrants?.some(id=>gone.has(id))||S.practice13&&gone.has(S.practice13.team)){
   const sa=QUALIFIERS.regions.indexOf('SA');if(sa>=0)QUALIFIERS.regions.splice(sa,1);delete QUALIFIERS.baseQuotas.SA;
   S.v5??={version:5};S.v5.pending=true;this.queue();return;
  }
  this.installing=true;
  try{
   if(!QUALIFIERS.regions.includes('SA'))QUALIFIERS.regions.push('SA');QUALIFIERS.baseQuotas.SA=1;
   const oldClub=S.club,oldTeams=S.teams,archive={clubs:structuredClone(removed),events:[],camps:[],day:S.day};
   const real=oldTeams.filter(t=>!t.fiction),map=new Map(real.map((t,i)=>[t.id,i]));
   // A manager of a generated club keeps their roster and finances under a real club identity.
   let replacementClub=null;
   if(gone.has(oldClub)){
    const d=CLUBS5.find(d=>!real.some(t=>this.key(t.name)===this.key(d.name)));
    replacementClub={...oldTeams[oldClub],id:real.length,name:d.name,short:d.name.slice(0,4),fiction:false,v5Key:d.key};
    map.set(oldClub,replacementClub.id);real.push(replacementClub);
   }
   const remap=id=>map.get(id)??null;
   const teamList=a=>Array.isArray(a)?a.map(remap).filter(Number.isInteger):a;
   const keyed=o=>o?Object.fromEntries(Object.entries(o).filter(([id])=>map.has(+id)).map(([id,v])=>[remap(+id),v])):o;
   for(const t of real){const previous=t.id;t.id=remap(previous)??t.id;t.fiction=false;t.sceneClub=true;t.homeRegion=this.coreRegions[t.id]||t.homeRegion||'EU';t.tier??=1;}
   S.teams=real;S.club=remap(oldClub)??0;
   for(const p of S.players){
    if(p.team!==null){const id=remap(p.team);p.team=id;if(id===null)p.active=false;}
    if(p.retired)p.retiredFromTeam=remap(p.retiredFromTeam)??S.club;
    if(p.v4FanSupport)p.v4FanSupport.team=p.team;
   }
   const hasGone=e=>gone.has(e.champion)||(e.entrants||e.qualified13||[]).some(id=>gone.has(id))||Object.keys(e.placements6||{}).some(id=>gone.has(+id));
   const activeId=S.active?.event;
   S.events=S.events.filter(e=>{
    if((e.done&&hasGone(e))||Number.isInteger(e.qualifierFor)&&e.id!==activeId){archive.events.push(structuredClone(e));return false;}return true;
   });
   for(const e of S.events){
    if(e.qualification){e.legacyQualification5=structuredClone(e.qualification);delete e.qualification;}
    if(!e.done&&e.id!==activeId){for(const k of ['entrants','qualified13','qualification13','schedule6','seeds6','rosterLock','regionalState','placements6','formatKey6'])delete e[k];}
    else{
     for(const k of ['entrants','qualified13'])if(e[k])e[k]=teamList(e[k]);
     for(const k of ['placements6','seeds6','rosterLock'])if(e[k])e[k]=keyed(e[k]);
     if(Number.isInteger(e.champion))e.champion=remap(e.champion);
    }
   }
   if(S.practice13)S.practice13.team=remap(S.practice13.team);
   if(S.patchV1?.bonuses){const used=new Set();S.patchV1.bonuses=S.patchV1.bonuses.map(b=>{let id=remap(b.team);if(id===null||used.has(id))id=S.teams.find(t=>!used.has(t.id)).id;used.add(id);return {...b,team:id};});}
   if(S.world13?.seasons)for(const season of S.world13.seasons)season.table=season.table.filter(r=>map.has(r.team)).map(r=>({...r,team:remap(r.team)}));
   if(S.sponsors4a){S.sponsors4a.clubs=keyed(S.sponsors4a.clubs);S.sponsors4a.notices=S.sponsors4a.notices.filter(n=>n.team===undefined||map.has(n.team)).map(n=>({...n,...(n.team===undefined?{}:{team:remap(n.team)})}));}
   if(S.v4)for(const [key,b] of Object.entries(S.v4.camps)){
    if(!map.has(b.team)||!S.events.some(e=>e.id===b.event)){
     if(b.status==='active'&&map.has(b.team))Camp4.close(b,'interrupted');archive.camps.push(b);delete S.v4.camps[key];
    }
   }
   if(S.v4)S.v4.camps=Object.fromEntries(Object.values(S.v4.camps).map(b=>{b.team=remap(b.team);return [b.event+':'+b.team,b];}));
   // Original sixteen IDs do not move in normal careers. Additional real clubs are appended.
   S.v5={version:5,sceneReady:true,installedDay:S.day,legacyArchive:archive,replacements:[],pending:false};
   if(this.creating){
    // PlayTime is one of the agreed T2 clubs; refresh its dated reference roster for new careers only.
    const d=CLUBS5.find(d=>d.name==='PlayTime'),t=S.teams.find(t=>t.name==='PlayTime');
    for(const p of roster(t)){p.team=null;p.active=false;}
    for(const data of d.players)this.realPlayer(data.name,data.role,t.id,data.rating).source5=d.source;
   }
   for(const d of CLUBS5){
    let t=S.teams.find(t=>this.key(t.name)===this.key(d.name));
    const added=!t;
    if(!t){t={id:S.teams.length,name:d.name,short:d.name.split(' ').map(v=>v[0]).join('').slice(0,4),coach:'Team Coach',tactic:'balanced',points:0};S.teams.push(t);}
    Object.assign(t,{v5Key:d.key,fiction:false,sceneClub:true,homeRegion:d.region,region:d.region,logo5:d.logo,source5:d.source});
    if(added){
     t.tier=d.tier;
     for(const data of d.players){
      const busy=S.players.find(p=>!p.retired&&p.team!==null&&this.key(p.name)===this.key(data.name));
      // Preserve a single player identity when public roster snapshots overlap.
      if(busy){const p=this.replacement(t.id,data.role);S.v5.replacements.push({team:t.id,listed:data.name,player:p.id,reason:'overlapping-source-rosters'});}
      else this.realPlayer(data.name,data.role,t.id,data.rating).source5=d.source;
     }
     Object.assign(clubState13(t),{budget:1200000,coach:75,elo:1400+(avg(roster(t).map(p=>p.skill))-85)*18});
    }else if(this.creating)t.tier=d.tier;else t.tier??=d.tier;
   }
   S.qualifiers??={version:1,legacyEvents:[]};
   S.qualifiers.phase2=true;S.qualifiers.legacyEvents=S.events.filter(e=>e.done||e.id===activeId).map(e=>e.id);
   S.qualifiers.scene={version:QUALIFIERS.scene.version,seed:S.seed>>>0,coreCount:16,createdDay:S.day,generated:S.teams.slice(16).map(t=>t.id),seasons:{},progress:{}};
   Qualifiers.initFame();init13();ensureDevelopment21();Sponsor4A.install();Fans4.cache=null;
   log('V5.0 · '+S.teams.length+' реальных клубов. Вымышленные клубы убраны; завершённые события с ними сохранены в архиве.');
   if(replacementClub)log('Ваш клуб продолжает карьеру под названием '+replacementClub.name+'. Состав и финансы сохранены.');
   if(S.v5.replacements.length)log('Пересекающиеся срезы составов: '+S.v5.replacements.length+' игровых замен из реальных свободных агентов. Подробности — в справочнике сцены.');
  }finally{this.installing=false;}
 },
 queue(){if(this.queued)return;this.queued=true;setTimeout(()=>{this.queued=false;if(S?.v5?.pending&&!S.active&&!S.practice13&&!busy13){this.install();Admissions5.install();save();render();}},0);}
};
addField6=function(){};
Qualifiers.generateClub=function(){throw Error('V5.0: генерация клубов отключена.');};
Qualifiers.fillRegion=function(parent,region,count,invited){return rankTeams13().filter(t=>this.region(t)===region&&!invited.includes(t.id)&&!this.busy(parent,t.id)).slice(0,count).map(t=>t.id);};
Qualifiers.ensureScene=function(){Scene5.install();return S.qualifiers?.scene;};
const sceneFresh5=fresh,sceneMigrate5=migrate,sceneTick5=tick;
fresh=function(id=0){Scene5.creating=true;Scene5.loading=true;try{sceneFresh5(Number.isInteger(id)&&id>=0&&id<16?id:0);Scene5.loading=false;Scene5.install();}finally{Scene5.loading=false;Scene5.creating=false;}S.club=S.teams[id]?id:0;if(S.club>=16){S.budget=clubState13(my()).budget;const welcome=S.news.find(n=>n.text.startsWith('Совет директоров:'));if(welcome)welcome.text='Совет директоров: цель — выиграть турнир. Трансферный бюджет: '+cash(S.budget)+'. Добро пожаловать в '+my().name+'.';}Admissions5.install();save();render();};
migrate=function(...args){if(S?.v5?.sceneReady){if(!QUALIFIERS.regions.includes('SA'))QUALIFIERS.regions.push('SA');QUALIFIERS.baseQuotas.SA=1;}Scene5.loading=true;try{sceneMigrate5(...args);}finally{Scene5.loading=false;}Scene5.install();Admissions5.install();};
tick=function(...args){if(S?.v5?.pending)Scene5.queue();else Scene5.install();Admissions5.install();return sceneTick5(...args);};
const updateScene5=Qualifiers.update;
Qualifiers.update=function(){if(S?.v5?.pending){this.decay();this.backgroundRegionals();return;}return updateScene5.call(this);};
const region5=Qualifiers.region;
Qualifiers.region=function(t){return REGIONS5.includes(t?.homeRegion)?t.homeRegion:region5.call(this,t);};
