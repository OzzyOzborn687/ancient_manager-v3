'use strict';
// Permanent clubs use the same stable numeric IDs as the existing match engine.
Qualifiers.ensureScene=function(){
 if(S.qualifiers?.scene)return S.qualifiers.scene;
 const sourceSeed=S.seed;this.install(false);addField6();
 const C=QUALIFIERS.scene,scene=S.qualifiers.scene={version:C.version,seed:(sourceSeed^C.seedSalt)>>>0,coreCount:S.teams.length,createdDay:S.day,generated:[],seasons:{},progress:{}};
 for(const t of S.teams){t.homeRegion=this.region(t);t.tier??=t.fiction?2:1;}
 for(const tier of [2,3])for(let n=0;n<C['tier'+tier];n++)this.generateClub(QUALIFIERS.regions[n%QUALIFIERS.regions.length],tier);
 this.initFame();return scene;
};
Qualifiers.sceneRandom=function(ordinal,part){
 let x=(S.qualifiers.scene.seed^Math.imul(ordinal+1,QUALIFIERS.scene.seedSalt)^Math.imul(part+1,2246822519))>>>0;
 x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;
};
Qualifiers.generateClub=function(region,tier=3){
 const C=QUALIFIERS.scene,scene=S.qualifiers.scene;
 if(!scene||!QUALIFIERS.regions.includes(region)||![2,3].includes(tier)||S.teams.length>=C.maxTeams)throw Error('Лимит или неверный регион сцены квалификаций');
 const id=S.teams.length,ordinal=scene.generated.length,random=part=>this.sceneRandom(ordinal,part);
 const stem=C.first[Math.floor(random(0)*C.first.length)]+' '+C.last[Math.floor(random(1)*C.last.length)];
 let name=stem,suffix=1;while(S.teams.some(t=>t.name.toLowerCase()===name.toLowerCase()))name=stem+' '+(++suffix);
 const t={id,name,short:region+String(ordinal+1),region,homeRegion:region,tier,fiction:true,sceneClub:true,
  coach:'Regional Coach',tactic:['balanced','late','tempo'][Math.floor(random(2)*3)],points:0};
 S.teams.push(t);
 for(let role=0;role<5;role++){
  const [lo,hi]=C.skill[tier],skill=lo+Math.floor(random(role+3)*(hi-lo+1));
  const nick=C.nickFirst[Math.floor(random(role+8)*C.nickFirst.length)]+C.nickLast[Math.floor(random(role+13)*C.nickLast.length)]+'_'+(id+1)+'_'+(role+1);
  const p={...newPlayerV1(nick,role,id,skill,true),fiction:true,scenePlayer:true,
   potential:Math.min(99,skill+C.potentialBonus),form:C.form,morale:C.morale,fatigue:C.fatigue,contract:C.contract,
   salary:Math.round((skill-C.skillSalaryReference)*C.salaryPerSkill)};
  S.players.push(p);initPlayer13(p);
 }
 const c=clubState13(t);Object.assign(c,{budget:C.budget,coach:C.coach,elo:C.eloBase+(avg(roster(t).map(p=>p.skill))-C.eloSkillReference)*C.eloPerSkill});
 scene.generated.push(id);return t;
};
Qualifiers.regionScores=function(){
 const C=QUALIFIERS.seasonal;
 const rows=QUALIFIERS.regions.map(region=>{
  const clubs=S.teams.filter(t=>this.region(t)===region).sort((a,b)=>clubState13(b).elo-clubState13(a).elo).slice(0,C.topClubs);
  const elo=avg(clubs.map(t=>clubState13(t).elo));
  const results=clubs.reduce((n,t)=>n+S.events.filter(e=>!Number.isInteger(e.qualifierFor)&&e.done&&e.day<=S.day&&S.day-e.day<=QUALIFIERS.historyDays).reduce((v,e)=>v+(e.placements6?.[t.id]?1/e.placements6[t.id]:0),0),0);
  return {region,elo,results,clubs:clubs.map(t=>t.id)};
 });
 const elo=this.normalize(rows.map(r=>r.elo)),results=this.normalize(rows.map(r=>r.results));
 return rows.map((r,i)=>({...r,index:elo[i]*C.eloWeight+results[i]*C.resultsWeight}));
};
Qualifiers.seasonQuotas=function(total){
 const scene=this.ensureScene(),year=circuitYear(S.day),C=QUALIFIERS.seasonal;
 scene.seasons[year]??={};if(scene.seasons[year][total])return scene.seasons[year][total];
 const previousYear=Object.keys(scene.seasons).map(Number).filter(y=>y<year&&scene.seasons[y][total]).sort((a,b)=>b-a)[0];
 const baseline=this.quotas(total),previous=previousYear?scene.seasons[previousYear][total].quotas:baseline,scores=this.regionScores();
 const quotas={...previous};
 if(previousYear){
  const weights=Object.fromEntries(scores.map(r=>[r.region,baseline[r.region]*(1+C.influence*(r.index-QUALIFIERS.normalNeutral))]));
  const sum=Object.values(weights).reduce((a,b)=>a+b,0),targets=Object.fromEntries(QUALIFIERS.regions.map(r=>[r,total*weights[r]/sum]));
  const lows=Object.fromEntries(QUALIFIERS.regions.map(r=>[r,Math.max(QUALIFIERS.minQuota,previous[r]-C.maxShift)]));
  const highs=Object.fromEntries(QUALIFIERS.regions.map(r=>[r,Math.min(QUALIFIERS.maxQuota,previous[r]+C.maxShift)]));
  for(const r of QUALIFIERS.regions)quotas[r]=Math.max(lows[r],Math.min(highs[r],Math.floor(targets[r])));
  while(Object.values(quotas).reduce((a,b)=>a+b,0)!==total){
   const up=Object.values(quotas).reduce((a,b)=>a+b,0)<total;
   const options=QUALIFIERS.regions.filter(r=>up?quotas[r]<highs[r]:quotas[r]>lows[r]);
   options.sort((a,b)=>up?(targets[b]-quotas[b])-(targets[a]-quotas[a]):(quotas[b]-targets[b])-(quotas[a]-targets[a]));
   if(!options.length)throw Error('Невозможно распределить сезонные квоты');quotas[options[0]]+=up?1:-1;
  }
 }
 return scene.seasons[year][total]={year,total,day:S.day,quotas,scores,previousYear:previousYear??null};
};
Qualifiers.fillRegion=function(parent,region,count,invited){
 const eligible=()=>S.teams.filter(t=>this.region(t)===region&&!invited.includes(t.id)&&!this.busy(parent,t.id));
 while(eligible().length<count)this.generateClub(region,3);
 return eligible().sort((a,b)=>(a.tier||1)-(b.tier||1)||clubState13(b).elo-clubState13(a).elo||a.id-b.id).slice(0,count).map(t=>t.id);
};
Qualifiers.sceneResult=function(e){
 const scene=S.qualifiers?.scene;if(!scene||!e.done||e.sceneProgressApplied)return;
 e.sceneProgressApplied=true;const C=QUALIFIERS.seasonal;
 for(const [id,place] of Object.entries(e.placements6||{})){
  const t=S.teams[+id];if(!t)continue;
  const p=scene.progress[id]??={qualifications:0,lastResultDay:scene.createdDay,season:[]};
  p.lastResultDay=S.day;
  if(Number.isInteger(e.qualifierFor)&&e.inviteWinners?.includes(+id)){
   p.qualifications++;clubState13(t).elo+=C.promotionElo;
  }
  const c=clubState13(t),old=t.tier||1;
  if(old>1&&p.qualifications>=C.promotionWins&&c.elo>=(old===2?C.tier1Elo:C.tier2Elo)){t.tier--;p.qualifications=0;log(t.name+' повышается в Tier '+t.tier+' благодаря результатам.');}
  p.season.push({event:e.id,place:+place,day:S.day});p.season=p.season.filter(r=>S.day-r.day<=QUALIFIERS.historyDays);
 }
};
Qualifiers.sceneSeason=function(){
 const scene=S.qualifiers?.scene;if(!scene)return;
 const year=circuitYear(S.day);if(scene.reviewYear===year)return;
 const first=scene.reviewYear===undefined;scene.reviewYear=year;if(first)return;
 const C=QUALIFIERS.seasonal;
 for(const t of S.teams){
  const p=scene.progress[t.id],c=clubState13(t),last=p?.lastResultDay??scene.createdDay;
  if(S.day-last<C.inactiveDays)continue;
  if(t.tier===1&&c.elo<C.tier1Elo||t.tier===2&&c.elo<C.demotionElo){t.tier=Math.min(C.maxTier,t.tier+1);log(t.name+' переходит в Tier '+t.tier+': сезон без результатов.');}
 }
};
Qualifiers.sceneInactivity=function(){
 const scene=S.qualifiers?.scene;if(!scene)return;
 const C=QUALIFIERS.seasonal,period=Math.floor(S.day/C.reviewDays);
 if(scene.inactivityPeriod===period)return;scene.inactivityPeriod=period;
 for(const t of S.teams){
  const last=scene.progress[t.id]?.lastResultDay??scene.createdDay;
  if(S.day-last>=C.inactiveDays)clubState13(t).seasonPoints*=C.pointsDecay;
 }
};
