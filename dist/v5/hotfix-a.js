'use strict';
// V5.0 A: regional invitations, only BLAST/PGL/ESL qualifiers.

const policyBefore5A=Admissions5.policy;
Admissions5.policy=function(e){
 const old=policyBefore5A.call(this,e);if(!old)return old;
 const series=circuitSeries(e),allowed=['BLAST SLAM','PGL WALLACHIA','ESL ONE','DREAMLEAGUE'].includes(series);
 const slots=series==='BLAST SLAM'?2:1,field=old.field;
 return {...old,field,direct:allowed?field-slots:field,quotas:allowed?{GLOBAL:slots}:{},format:old.format,inviteRegion:undefined,label:'V5.0 A · региональный рейтинг',note:allowed?'Лидер каждого региона получает прямой инвайт. Оставшиеся прямые места — следующим командам по региональному месту и рейтингу сезона. '+slots+' мест на квалификацию на весь турнир.':'Все места — прямые инвайты по региональному рейтингу. Квалификаций нет.'};
};
Admissions5.rows=function(e){
 const ranked=rankTeams13(),positions={};
 const rows=ranked.map(t=>{const region=Qualifiers.region(t);positions[region]=(positions[region]||0)+1;return {team:t.id,region,regionalRank:positions[region],season:clubState13(t).seasonPoints,elo:clubState13(t).elo,busy:Qualifiers.busy(e,t.id)?.id??null};});
 rows.sort((a,b)=>a.regionalRank-b.regionalRank||b.season-a.season||b.elo-a.elo||a.team-b.team);
 return rows.map((r,i)=>({...r,rank:i+1,index:1-i/rows.length}));
};
const freezeBefore5A=Admissions5.freeze;
Admissions5.freeze=function(e){const result=freezeBefore5A.call(this,e);for(const r of result.invited||[])r.text='Регион '+(r.region==='EU'?'WEU':r.region)+' · место '+r.regionalRank;return result;};
const installBefore5A=Admissions5.install;
Admissions5.install=function(){
 if(S?.v5?.sceneReady&&!S.v5.hotfixA&&!Scene5.loading&&!Scene5.installing){
  const activeParent=S.events.find(e=>e.id===S.active?.event)?.qualifierFor;
  const reset=new Set(S.events.filter(e=>!e.done&&!Qualifiers.isRegional(e)&&e.id!==S.active?.event&&e.id!==activeParent).map(e=>e.id));
  for(const b of Object.values(S.v4?.camps||{}))if(reset.has(b.event)&&b.status==='active')Camp4.close(b,'interrupted');
  for(const e of S.events)if(reset.has(e.id)){delete e.qualification;delete e.qualified13;delete e.qualification13;}
  const removed=new Set(S.events.filter(e=>reset.has(e.qualifierFor)).map(e=>e.id));
  S.v5.legacyArchive.events.push(...S.events.filter(e=>removed.has(e.id)&&e.done));
  S.events=S.events.filter(e=>!removed.has(e.id));
  if(S.v4)for(const [key,b] of Object.entries(S.v4.camps))if(removed.has(b.event)){if(b.status==='active')Camp4.close(b,'interrupted');delete S.v4.camps[key];}
  S.v5.hotfixA=true;
 }
 return installBefore5A.call(this);
};
const ruleBefore5A=UI5.rule;
UI5.rule=function(e){return ruleBefore5A.call(this,e).replace('Прямые инвайты: рейтинг сезона (очки → Elo → ID), с резервом опубликованных региональных квот. EPT и выбор организатора заменены игровым рейтингом.','Прямые инвайты: место команды в своём регионе; затем очки сезона → Elo → ID. Лидеры шести регионов имеют приоритет.');};
const renderBefore5A=render;
render=function(...args){const result=renderBefore5A(...args);if(S?.v5?.hotfixA)$('broadcastStatus33c').innerHTML=$('broadcastStatus33c').innerHTML.replace('V5.0 / ARENA','V5.0 A / ARENA');return result;};

const groupBefore5A=Admissions5.groupName;Admissions5.groupName=function(group){return group==='GLOBAL'?'Квалификация':groupBefore5A.call(this,group);};
