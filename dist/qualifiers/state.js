'use strict';
Qualifiers.mark=function(e){
 if(this.supports(e)&&!e.done&&e.id!==S.active?.event&&!e.qualified13&&!e.qualification){
  e.qualification={qualVersion:QUALIFIERS.version,status:'pending',mode:'provisional-p1'};
 }
};
Qualifiers.install=function(fresh=false){
 if(!S.qualifiers){
  S.qualifiers={version:QUALIFIERS.version,legacyEvents:fresh?[]:S.events.filter(e=>!e.qualification).map(e=>e.id)};
 }
 this.initFame();
 if(fresh)for(const e of S.events)this.mark(e);
};
Qualifiers.invalidateFuture=function(e){
 const q=e.qualification;
 if(q?.qualVersion===QUALIFIERS.version&&!e.done&&e.id!==S.active?.event&&(q.snapshotDay>S.day||q.completedDay>S.day)){
  // The TI reconstruction moves the clock back but retains optional future fields.
  delete e.qualification;delete e.qualification13;delete e.qualified13;this.mark(e);
 }
};
Qualifiers.freeze=function(e){
 const q=e.qualification;if(!q||q.qualVersion!==QUALIFIERS.version||q.status!=='pending')return q;
 const n=format6(e).n;
 let plan=this.invitations(e,n);
 // Existing built-in 24-club field, not the future Tier 2/3 scene.
 if(!plan.ok&&S.teams.length<Math.max(...Object.values(FORMAT6).map(f=>f.n))){
  addField6();plan=this.invitations(e,n);
 }
 q.snapshotDay=S.day;q.eventDay=e.day;q.fieldSize=n;q.rows=plan.rows;
 q.rules={invites:QUALIFIERS.invites,regionInviteCap:QUALIFIERS.regionInviteCap,minQuota:QUALIFIERS.minQuota,maxQuota:QUALIFIERS.maxQuota,baseQuotas:{...QUALIFIERS.baseQuotas},listLead:QUALIFIERS.listLead};
 q.champion=plan.champion??this.champion(e);
 q.weights={...QUALIFIERS.weights[circuitSeries(e)]};
 if(!plan.ok){
  q.status='blocked';q.reason=plan.reason;
  log(e.name+' · квалификации: '+q.reason);return q;
 }
 Object.assign(q,{status:'frozen',invited:plan.invited,skipped:plan.skipped,player:plan.player,championUnavailable:plan.championUnavailable});
 log(e.name+' · объявлены '+QUALIFIERS.invites+' приглашений. '+(q.player.invited?'Ваш клуб приглашён: '+q.invited.find(v=>v.team===S.club).text+'.':'Ваш индекс '+q.player.index.toFixed(4)+'; порог '+q.player.cutoff?.toFixed(4)+'.'));
 return q;
};
Qualifiers.provisionalSeries=function(pair,stats){
 const C=QUALIFIERS.provisional,score=[0,0],maps=[],need=Math.floor(C.bo/2)+1;
 while(score.every(v=>v<need)){
  const level=Difficulty.current(),multipliers=Difficulty.multipliers(level,S.club,pair);
  const rating=pair.map(id=>clubState13(S.teams[id]).elo+(stats[id].form-C.formReference)*C.formWeight);
  const relative=C.eloBase**((rating[1]-rating[0])/C.eloScale)*multipliers[1]/multipliers[0];
  const p=clamp(1/(1+relative),C.minProbability,C.maxProbability),side=rng()<p?0:1;
  score[side]++;maps.push({winner:pair[side],pWin:p,rating,difficulty:{level,club:S.club,multipliers}});
 }
 return {pair:[...pair],score:score.join(':'),w:pair[score[0]>score[1]?0:1],maps,mode:'provisional-p1'};
};
Qualifiers.complete=function(e){
 let q=e.qualification;
 if(!q||q.qualVersion!==QUALIFIERS.version)return null;
 if(q.status==='pending')q=this.freeze(e);
 if(q.status==='complete')return q.qualified;
 if(q.status!=='frozen')return null;
 // Ratings remain frozen; later calendar bookings may displace a former invite.
 const rows=q.rows.map(r=>({...r,busy:this.busy(e,r.team)?.id??null}));
 const plan=this.invitations(e,q.fieldSize,rows,q.champion,q.rules);
 if(!plan.ok){q.status='blocked';q.reason=plan.reason;log(e.name+': '+q.reason);return null;}
 const invited=plan.invited.map(v=>v.team),available=rows.filter(r=>r.busy===null&&!invited.includes(r.team));
 const capacities=Object.fromEntries(QUALIFIERS.regions.map(r=>[r,available.filter(t=>t.region===r).length]));
 const total=q.fieldSize-invited.length,quotas=this.quotas(total,capacities,q.rules),planned=this.quotas(total,undefined,q.rules),stats=this.stats(),regions={};
 const seedBefore=S.seed;
 for(const region of QUALIFIERS.regions){
  const candidates=available.filter(r=>r.region===region),table=candidates.map(r=>({team:r.team,wins:0,mapDiff:0,elo:r.elo})),matches=[];
  for(let a=0;a<candidates.length;a++)for(let b=a+1;b<candidates.length;b++){
   const match=this.provisionalSeries([candidates[a].team,candidates[b].team],stats);
   const scores=match.score.split(':').map(Number);matches.push(match);
   for(let side=0;side<scores.length;side++){
    const row=table.find(t=>t.team===match.pair[side]);row.wins+=Number(match.w===row.team);row.mapDiff+=scores[side]-scores[1-side];
   }
  }
  table.sort((a,b)=>b.wins-a.wins||b.mapDiff-a.mapDiff||b.elo-a.elo||a.team-b.team);
  regions[region]={quota:quotas[region],planned:planned[region],candidates:candidates.map(r=>r.team),matches,table,qualified:table.slice(0,quotas[region]).map(r=>r.team)};
 }
 const qualified=[...invited,...QUALIFIERS.regions.flatMap(r=>regions[r].qualified)];
 if(qualified.length!==q.fieldSize||new Set(qualified).size!==q.fieldSize)throw Error('Неверное поле квалификаций');
 const displaced=q.invited.filter(v=>!invited.includes(v.team)).map(v=>({team:v.team,reason:'schedule-conflict'}));
 Object.assign(q,{status:'complete',invited:plan.invited,skipped:plan.skipped,player:plan.player,championUnavailable:plan.championUnavailable,
  revalidation:{day:S.day,displaced,conflicts:rows.filter(r=>r.busy!==null).map(r=>({team:r.team,event:r.busy}))},
  quotas,plannedQuotas:planned,regions,qualified,completedDay:S.day,seedBefore,seedAfter:S.seed,
  adjustments:QUALIFIERS.regions.filter(r=>quotas[r]!==planned[r]).map(region=>({region,planned:planned[region],actual:quotas[region],reason:'current-pool-capacity'}))});
 // Compatibility projection for the existing tournament and ranking screens.
 e.qualified13=[...qualified];e.qualification13={invited:[...invited],matches:QUALIFIERS.regions.flatMap(r=>regions[r].matches),day:S.day,qualVersion:QUALIFIERS.version};
 log(e.name+' · определены все '+qualified.length+' участников. Региональный отбор p1 завершён.');
 return qualified;
};
Qualifiers.update=function(){
 if(!S.qualifiers)return;
 this.decay();
 for(const e of S.events){
  if(e.done||e.id===S.active?.event||!this.supports(e)||!e.qualification)continue;
  if(e.qualification.status==='pending'&&S.day>=e.day-QUALIFIERS.snapshotLead)this.freeze(e);
  if(e.qualification.status==='frozen'&&S.day>=e.day-e.qualification.rules.listLead)this.complete(e);
 }
};
Qualifiers.valid=function(state){
 if(state.qualifiers&&(state.qualifiers.version!==QUALIFIERS.version||!Array.isArray(state.qualifiers.legacyEvents)||state.qualifiers.legacyEvents.some(id=>!Number.isInteger(id))))return false;
 if(!state.teams.every(t=>t.fame===undefined||Number.isFinite(t.fame)&&t.fame>=QUALIFIERS.fame.min&&t.fame<=QUALIFIERS.fame.max))return false;
 for(const e of state.events){
  const q=e.qualification;if(!q)continue;
  if(q.qualVersion!==QUALIFIERS.version||!this.supports(e)||!['pending','frozen','complete','blocked'].includes(q.status))return false;
  if(q.status==='pending')continue;
  const C=q.rules;if(!C||!Number.isInteger(C.invites)||C.invites<1||C.invites>=q.fieldSize||!Number.isInteger(C.regionInviteCap)||C.regionInviteCap<1||!Number.isInteger(C.minQuota)||C.minQuota<1||!Number.isInteger(C.maxQuota)||C.maxQuota<C.minQuota||!Number.isInteger(C.listLead)||!C.baseQuotas||QUALIFIERS.regions.some(r=>!Number.isFinite(C.baseQuotas[r])||C.baseQuotas[r]<=0))return false;
  if(!Number.isInteger(q.fieldSize)||q.fieldSize!==format6(e).n||!Number.isInteger(q.snapshotDay)||!Array.isArray(q.rows))return false;
  const idOK=id=>Number.isInteger(id)&&id>=0&&id<state.teams.length;
  if(q.rows.some(r=>!idOK(r.team)||!QUALIFIERS.regions.includes(r.region)||!Number.isFinite(r.elo)||!Number.isFinite(r.form)||!Number.isFinite(r.index)||r.index<0||r.index>1+QUALIFIERS.precision||!r.components||['season','eloForm','history','fame'].some(k=>!Number.isFinite(r.components[k])||r.components[k]<0||r.components[k]>1)))return false;
  if(q.status==='blocked')continue;
  if(!Array.isArray(q.invited)||q.invited.length!==C.invites||new Set(q.invited.map(v=>v.team)).size!==C.invites||q.invited.some(v=>!idOK(v.team)||!['index','champion','wildcard'].includes(v.reason)))return false;
  if(QUALIFIERS.regions.some(r=>q.invited.filter(v=>v.region===r).length>C.regionInviteCap))return false;
  if(q.status!=='complete')continue;
  if(!Array.isArray(q.qualified)||q.qualified.length!==q.fieldSize||new Set(q.qualified).size!==q.fieldSize||q.qualified.some(id=>!idOK(id)))return false;
  if(!q.quotas||!q.regions||QUALIFIERS.regions.some(r=>!Number.isInteger(q.quotas[r])||q.quotas[r]<C.minQuota||q.quotas[r]>C.maxQuota||!Array.isArray(q.regions[r]?.qualified)||q.regions[r].qualified.length!==q.quotas[r]))return false;
  if(Object.values(q.quotas).reduce((a,b)=>a+b,0)!==q.fieldSize-C.invites)return false;
  const regional=QUALIFIERS.regions.flatMap(r=>q.regions[r].qualified);
  if(new Set([...q.invited.map(v=>v.team),...regional]).size!==q.fieldSize||regional.some(id=>!q.qualified.includes(id))||q.invited.some(v=>!q.qualified.includes(v.team)))return false;
  for(const r of QUALIFIERS.regions){
   const region=q.regions[r];
   if(!Array.isArray(region.candidates)||new Set(region.candidates).size!==region.candidates.length||region.candidates.some(id=>!idOK(id)||q.invited.some(v=>v.team===id))||!Array.isArray(region.matches))return false;
   if(region.qualified.some(id=>!region.candidates.includes(id)))return false;
   for(const match of region.matches){
    if(!Array.isArray(match.pair)||match.pair.length!==2||match.pair[0]===match.pair[1]||match.pair.some(id=>!region.candidates.includes(id))||!match.pair.includes(match.w)||!Array.isArray(match.maps))return false;
    for(const map of match.maps)if(!match.pair.includes(map.winner)||!Number.isFinite(map.pWin)||map.pWin<0||map.pWin>1||!Difficulty.validMap({sides:match.pair.map(team=>({team})),difficulty:map.difficulty},state))return false;
   }
  }
 }
 return true;
};
