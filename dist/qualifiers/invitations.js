'use strict';
const Qualifiers={
 supports:e=>!!e&&QUALIFIERS.operators.includes(circuitSeries(e)),
 region(t){
  if(QUALIFIERS.regions.includes(t.homeRegion))return t.homeRegion;
  if(QUALIFIERS.regions.includes(t.region))return t.region;
  return QUALIFIERS.aliases[t.region]||QUALIFIERS.homeById[t.id]||QUALIFIERS.regions[t.id%QUALIFIERS.regions.length];
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
  const normalized=Object.fromEntries(['season','elo','form','history','fame'].map(k=>[k,this.normalize(raw.map(r=>r[k]))]));
  const weights=QUALIFIERS.weights[circuitSeries(e)],total=Object.values(weights).reduce((a,b)=>a+b,0);
  return raw.map((r,i)=>{
   const components={season:normalized.season[i],eloForm:normalized.elo[i]*QUALIFIERS.eloForm.elo+normalized.form[i]*QUALIFIERS.eloForm.form,history:normalized.history[i],fame:normalized.fame[i]};
   return {...r,components,index:Object.entries(weights).reduce((n,[k,w])=>n+components[k]*w/total,0),wildcard:normalized.fame[i]*normalized.form[i]};
  }).sort((a,b)=>b.index-a.index||b.elo-a.elo||a.team-b.team);
 },
 canFinish(selected,rows,n,rules=QUALIFIERS){
  const counts=Object.fromEntries(QUALIFIERS.regions.map(r=>[r,rows.filter(t=>t.region===r).length]));
  const picked=Object.fromEntries(QUALIFIERS.regions.map(r=>[r,selected.filter(t=>t.region===r).length]));
  if(selected.length>rules.invites||Object.values(picked).some(v=>v>rules.regionInviteCap))return false;
  const left=rules.invites-selected.length,needed=n-rules.invites;
  function search(index,remaining,capacity){
   if(index===QUALIFIERS.regions.length)return remaining===0&&capacity>=needed;
   const r=QUALIFIERS.regions[index],available=counts[r]-picked[r];
   const limit=Math.min(remaining,rules.regionInviteCap-picked[r],available-rules.minQuota);
   for(let extra=0;extra<=limit;extra++)if(search(index+1,remaining-extra,capacity+Math.min(rules.maxQuota,available-extra)))return true;
   return false;
  }
  return rows.length>=n&&search(0,left,0);
 },
 invitations(e,n,allRows=this.rows(e),champion=this.champion(e),rules=QUALIFIERS){
  const rows=allRows.filter(r=>r.busy===null),selected=[],skipped=[];
  const holder=rows.find(r=>r.team===champion);
  if(!this.canFinish([],rows,n,rules))return {ok:false,reason:'Недостаточно доступных клубов по регионам для поля '+n+'.',rows:allRows};
  if(holder){
   if(!this.canFinish([holder],rows,n,rules))return {ok:false,reason:'Гарантия чемпиона несовместима с доступными региональными местами.',rows:allRows};
   selected.push({...holder,reason:'champion',text:'Действующий чемпион оператора'});
  }
  for(const row of rows){
   if(selected.length>=rules.invites-1)break;
   if(selected.some(s=>s.team===row.team))continue;
   const count=selected.filter(s=>s.region===row.region).length;
   if(count>=rules.regionInviteCap){skipped.push({team:row.team,reason:'region-cap'});continue;}
   if(!this.canFinish([...selected,row],rows,n,rules)){skipped.push({team:row.team,reason:'regional-capacity'});continue;}
   selected.push({...row,reason:'index',text:'Индекс оператора '+row.index.toFixed(4)});
  }
  const wildcard=[...rows].sort((a,b)=>b.wildcard-a.wildcard||b.elo-a.elo||a.team-b.team)
   .find(row=>!selected.some(s=>s.team===row.team)&&this.canFinish([...selected,row],rows,n,rules));
  if(!wildcard||selected.length!==rules.invites-1)return {ok:false,reason:'Не удалось заполнить приглашения без нарушения региональных ограничений.',rows:allRows};
  selected.push({...wildcard,reason:'wildcard',text:'Wildcard: известность × форма'});
  const indices=selected.filter(s=>s.reason==='index').map(s=>s.index),own=allRows.find(s=>s.team===S.club);
  return {ok:true,invited:selected,rows:allRows,skipped,champion,championUnavailable:champion!==null&&!holder,
   player:{team:S.club,index:own?.index??0,cutoff:indices.length?Math.min(...indices):null,
    invited:selected.some(s=>s.team===S.club),reason:own?.busy!==null?'schedule-conflict':selected.find(s=>s.team===S.club)?.reason||skipped.find(s=>s.team===S.club)?.reason||'below-cutoff'}};
 },
 quotas(total,capacities,rules=QUALIFIERS){
  const regions=QUALIFIERS.regions,weights=rules.baseQuotas,sum=Object.values(weights).reduce((a,b)=>a+b,0);
  const targets=Object.fromEntries(regions.map(r=>[r,total*weights[r]/sum]));
  const caps=Object.fromEntries(regions.map(r=>[r,Math.min(rules.maxQuota,capacities?.[r]??rules.maxQuota)]));
  if(regions.some(r=>caps[r]<rules.minQuota)||Object.values(caps).reduce((a,b)=>a+b,0)<total)throw Error('Недостаточная ёмкость регионов');
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
