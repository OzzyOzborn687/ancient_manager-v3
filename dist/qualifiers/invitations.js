'use strict';
const Qualifiers={
 supports:e=>!!e&&QUALIFIERS.operators.includes(circuitSeries(e)),
 region(t){
  if(QUALIFIERS.regions.includes(t.homeRegion))return t.homeRegion;
  if(QUALIFIERS.regions.includes(t.region))return t.region;
  return QUALIFIERS.aliases[t.region]||QUALIFIERS.homeById[t.id]||QUALIFIERS.regions[t.id%QUALIFIERS.regions.length];
 },
 /** Resolve fixed core team IDs by exact name from the config list. */
 mandatoryIds(){
  const names=new Set((QUALIFIERS.mandatoryTeamNames||[]).map(n=>n.toLowerCase()));
  return S.teams.filter(t=>names.has(t.name.toLowerCase())).map(t=>t.id);
 },
 stats(){
  const result=S.teams.map(()=>({best:0,form:0,count:0}));
  for(const p of S.players)if(p.active&&p.team!==null&&!p.retired&&result[p.team]){
   const r=result[p.team];r.best=Math.max(r.best,p.skill);r.form+=p.form;r.count++;
  }
  for(const r of result)r.form=r.count?r.form/r.count:QUALIFIERS.provisional.formReference;
  return result;
 },
 initFame(stats=this.stats()){
  const C=QUALIFIERS.fame;
  for(const t of S.teams)if(t.fame===undefined){
   t.fame=clamp(clubState13(t).seasonPoints*C.pointsWeight+(stats[t.id].best-C.skillReference)*C.skillWeight,C.min,C.max);
   t.fameDay=S.day;t.fameBest=stats[t.id].best;
  }
 },
 decay(){
  const stats=this.stats(),C=QUALIFIERS.fame;this.initFame(stats);
  for(const t of S.teams){
   const elapsed=Math.max(0,S.day-(t.fameDay??S.day)),best=stats[t.id].best;
   t.fame=clamp(t.fame*C.dailyDecay**elapsed+Math.max(0,best-(t.fameBest??best))*C.bestPlayerGrowth,C.min,C.max);
   t.fameDay=S.day;t.fameBest=best;
  }
 },
 normalize(values){
  const lo=Math.min(...values),hi=Math.max(...values);
  return values.map(v=>hi===lo?QUALIFIERS.normalNeutral:(v-lo)/(hi-lo));
 },
 overlap(a,b){
  return a.day<=b.day+(b.duration||QUALIFIERS.defaultDuration)-1&&b.day<=a.day+(a.duration||QUALIFIERS.defaultDuration)-1;
 },
 busy(e,id){
  return S.events.find(other=>{
   if(other.id===e.id||other.done||!this.overlap(e,other))return false;
   const a=S.active?.event===other.id?S.active:null;
   return (a?.entrants||other.entrants||other.qualified13||[]).includes(id)||
    other.qualification?.invited?.some(v=>v.team===id);
  })||null;
 },
 historyScore(e,id,day=S.day){
  let score=0;
  for(const prior of S.events){
   if(!prior.done||prior.id===e.id||circuitSeries(prior)!==circuitSeries(e)||prior.day>day||day-prior.day>QUALIFIERS.historyDays)continue;
   const place=prior.placements6?.[id]??(prior.champion===id?1:null);
   if(place)score+=1/place**QUALIFIERS.historyExponent;
  }
  return score;
 },
 champion(e,day=S.day){
  return S.events.filter(x=>x.done&&x.id!==e.id&&Number.isInteger(x.champion)&&x.day<=day&&circuitSeries(x)===circuitSeries(e))
   .sort((a,b)=>b.day-a.day||b.id-a.id)[0]?.champion??null;
 },
 rows(e){
  const stats=this.stats();this.initFame(stats);
  const raw=S.teams.map(t=>({team:t.id,region:this.region(t),elo:clubState13(t).elo,form:stats[t.id].form,
   season:clubState13(t).seasonPoints,history:this.historyScore(e,t.id),fame:t.fame,busy:this.busy(e,t.id)?.id??null}));
  const series=circuitSeries(e);
  const weights=QUALIFIERS.weights[series]||QUALIFIERS.weights['DREAMLEAGUE'];
  const total=Object.values(weights).reduce((a,b)=>a+b,0);
  const normalized=Object.fromEntries(['season','elo','form','history','fame'].map(k=>[k,this.normalize(raw.map(r=>r[k]))]));
  return raw.map((r,i)=>{
   const components={season:normalized.season[i],eloForm:normalized.elo[i]*QUALIFIERS.eloForm.elo+normalized.form[i]*QUALIFIERS.eloForm.form,history:normalized.history[i],fame:normalized.fame[i]};
   return {...r,components,index:Object.entries(weights).reduce((n,[k,w])=>n+components[k]*w/total,0),wildcard:normalized.fame[i]*normalized.form[i]};
  }).sort((a,b)=>b.index-a.index||b.elo-a.elo||a.team-b.team);
 },
 canFinish(selected,rows,n,rules=QUALIFIERS){
  // With mandatory invites the regional capacity check is relaxed:
  // only ensure there are enough free clubs overall for the remaining field.
  if(selected.length>rules.invites)return false;
  const free=rows.filter(r=>!selected.some(s=>s.team===r.team)).length;
  return free>=(n-selected.length);
 },
 /**
  * Operator invites: every available mandatory team gets a direct invite.
  * Remaining invite slots (if any) are filled by index, then a wildcard.
  * Remaining field slots after invites go to regional closed quals.
  */
 invitations(e,n,allRows=this.rows(e),champion=this.champion(e),rules=QUALIFIERS){
  const rows=allRows.filter(r=>r.busy===null),selected=[],skipped=[];
  const mandatorySet=new Set(this.mandatoryIds());
  const mandatoryRows=rows.filter(r=>mandatorySet.has(r.team))
   .sort((a,b)=>b.index-a.index||b.elo-a.elo||a.team-b.team);

  // 1. Mandatory core — always invited when free.
  for(const row of mandatoryRows){
   if(selected.length>=n)break;
   selected.push({...row,reason:'mandatory',text:'Обязательный инвайт оператора'});
  }

  // 2. If field is smaller than the full mandatory list, stop here.
  if(selected.length>=n){
   const own=allRows.find(s=>s.team===S.club);
   return {ok:true,invited:selected.slice(0,n),rows:allRows,skipped,champion,
    championUnavailable:champion!==null&&!selected.some(s=>s.team===champion),
    player:{team:S.club,index:own?.index??0,cutoff:null,
     invited:selected.some(s=>s.team===S.club),
     reason:own?.busy!==null?'schedule-conflict':selected.find(s=>s.team===S.club)?.reason||'below-cutoff'}};
  }

  // 3. Dynamic invite budget: take all mandatory, then optionally a few more by index
  //    so that at least some regional slots remain when field is large enough.
  const inviteBudget=Math.min(rules.invites,Math.max(selected.length,n-QUALIFIERS.regions.length));
  const holder=rows.find(r=>r.team===champion&&!selected.some(s=>s.team===r.team));
  if(holder&&selected.length<inviteBudget){
   selected.push({...holder,reason:'champion',text:'Действующий чемпион оператора'});
  }
  for(const row of rows){
   if(selected.length>=inviteBudget)break;
   if(selected.some(s=>s.team===row.team))continue;
   selected.push({...row,reason:'index',text:'Индекс оператора '+row.index.toFixed(4)});
  }

  if(selected.length>n)selected.length=n;
  if(selected.length===0)return {ok:false,reason:'Нет доступных клубов для приглашений.',rows:allRows};

  const own=allRows.find(s=>s.team===S.club);
  return {ok:true,invited:selected,rows:allRows,skipped,champion,
   championUnavailable:champion!==null&&!selected.some(s=>s.team===champion),
   player:{team:S.club,index:own?.index??0,cutoff:null,
    invited:selected.some(s=>s.team===S.club),
    reason:own?.busy!==null?'schedule-conflict':selected.find(s=>s.team===S.club)?.reason||'below-cutoff'}};
 },
 /**
  * Random regional slot distribution for closed quals.
  * Special case: when total === 8 → prefer 2 slots on as many regions as possible.
  * Odd remainders are assigned randomly.
  */
 randomQuotas(total,capacities,rules=QUALIFIERS){
  const regions=QUALIFIERS.regions.slice();
  const caps=Object.fromEntries(regions.map(r=>[r,Math.min(rules.maxQuota,capacities?.[r]??rules.maxQuota)]));
  const result=Object.fromEntries(regions.map(r=>[r,0]));
  if(total<=0)return result;

  // Prefer even spread: start with floor(total/regions) each, then random extras.
  let base=Math.floor(total/regions.length);
  if(total===8)base=Math.min(2,base||2); // explicit rule for 8 missing slots
  let left=total;
  for(const r of regions){
   const give=Math.min(caps[r],base,left);
   result[r]=give;left-=give;
  }
  // Distribute remaining slots randomly among regions that still have capacity.
  while(left>0){
   const open=regions.filter(r=>result[r]<caps[r]);
   if(!open.length)break;
   const pick=open[Math.floor(rng()*open.length)];
   result[pick]++;left--;
  }
  // If still short (capacity), dump into any region under maxQuota.
  while(left>0){
   const open=regions.filter(r=>result[r]<rules.maxQuota);
   if(!open.length)break;
   const pick=open[Math.floor(rng()*open.length)];
   result[pick]++;left--;
  }
  return result;
 },
 quotas(total,capacities,rules=QUALIFIERS){
  // Prefer random distribution (user rule). Fall back to weighted if random fails capacity.
  try{
   const random=this.randomQuotas(total,capacities,rules);
   if(Object.values(random).reduce((a,b)=>a+b,0)===total)return random;
  }catch(_){}
  const regions=QUALIFIERS.regions,weights=rules.baseQuotas,sum=Object.values(weights).reduce((a,b)=>a+b,0);
  const targets=Object.fromEntries(regions.map(r=>[r,total*weights[r]/sum]));
  const caps=Object.fromEntries(regions.map(r=>[r,Math.min(rules.maxQuota,capacities?.[r]??rules.maxQuota)]));
  if(Object.values(caps).reduce((a,b)=>a+b,0)<total)throw Error('Недостаточная ёмкость регионов');
  const result=Object.fromEntries(regions.map(r=>[r,Math.min(caps[r],Math.max(rules.minQuota,Math.floor(targets[r])))]));
  while(Object.values(result).reduce((a,b)=>a+b,0)>total){
   const r=[...regions].filter(r=>result[r]>rules.minQuota).sort((a,b)=>(result[b]-targets[b])-(result[a]-targets[a])||regions.indexOf(a)-regions.indexOf(b))[0];if(!r)throw Error('Слишком мало мест');result[r]--;
  }
  while(Object.values(result).reduce((a,b)=>a+b,0)<total){
   const r=[...regions].filter(r=>result[r]<caps[r]).sort((a,b)=>(targets[b]-result[b])-(targets[a]-result[a])||regions.indexOf(a)-regions.indexOf(b))[0];if(!r)throw Error('Не распределены места');result[r]++;
  }
  return result;
 }
};
