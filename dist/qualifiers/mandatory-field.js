'use strict';
/**
 * Non-operator tournaments: mandatory core teams + closed regional quals.
 * Operator events (Blast / PGL / ESL / DreamLeague) keep the full invite system
 * from invitations.js + state.js with the same mandatory list as guaranteed invites.
 */
(function(){
 const legacyQualify=typeof qualify13==='function'?qualify13:null;
 qualify13=function(e,f){
  // Operator events are handled by Qualifiers.complete → this path is the fallback.
  if(typeof Qualifiers!=='undefined'&&Qualifiers.supports?.(e)){
   return legacyQualify?legacyQualify(e,f):e.qualified13||[];
  }
  if(e.qualified13)return e.qualified13;
  if(typeof addField6==='function')addField6();
  for(const t of S.teams)if(typeof clubState13==='function')clubState13(t);
  for(const p of S.players)if(typeof initPlayer13==='function')initPlayer13(p);

  const names=new Set((QUALIFIERS.mandatoryTeamNames||[]).map(n=>n.toLowerCase()));
  const mandatory=S.teams.filter(t=>names.has(t.name.toLowerCase()))
   .sort((a,b)=>strength(b)-strength(a)).map(t=>t.id);

  let invited=mandatory.slice(0,f.n);
  // Keep the player club in the field when space allows.
  if(!invited.includes(S.club)&&invited.length<f.n)invited.push(S.club);
  invited=invited.slice(0,f.n);

  const ranked=(typeof rankTeams13==='function'?rankTeams13():S.teams.slice().sort((a,b)=>strength(b)-strength(a)))
   .map(t=>t.id).filter(id=>!invited.includes(id));
  const slots=f.n-invited.length;
  const matches=[];
  let qualified=[...invited];

  if(slots>0){
   const regions=QUALIFIERS.regions.slice();
   const regionOf=id=>Qualifiers.region(S.teams[id]);
   const quotas=Object.fromEntries(regions.map(r=>[r,0]));
   let left=slots;
   // User rule: if 8 missing slots → prefer 2 per region; odd remainders random.
   const base=slots===8?2:Math.floor(slots/regions.length);
   for(const r of regions){const give=Math.min(base,left);quotas[r]=give;left-=give;}
   while(left>0){const r=regions[Math.floor(rng()*regions.length)];quotas[r]++;left--;}

   const byRegion=Object.fromEntries(regions.map(r=>[r,ranked.filter(id=>regionOf(id)===r)]));
   for(const r of regions){
    let pool=byRegion[r].slice(),need=quotas[r];
    while(pool.length>1&&need>0){
     const pair=pool.splice(0,2);
     const series=typeof aiSeries6==='function'?aiSeries6(pair,3):{score:'1:0',w:pair[0]};
     matches.push({pair,score:series.score,w:series.w,region:r});
     pool.push(series.w);
    }
    while(need>0&&pool.length){qualified.push(pool.shift());need--;}
   }
   while(qualified.length<f.n){
    const next=ranked.find(id=>!qualified.includes(id));
    if(next==null)break;
    qualified.push(next);
   }
  }

  qualified=qualified.slice(0,f.n);
  e.qualification13={invited,matches,day:S.day,mode:'mandatory-closed'};
  e.qualified13=qualified;
  return qualified;
 };
})();
