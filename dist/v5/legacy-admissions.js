'use strict';
// Read/repair packets written by the removed forced-field patches. Never creates new forced fields.
const LegacyAdmissions5={
 recognizes(e){return ['mandatory-hard-v5','mandatory-hard','mandatory-closed'].includes(e.qualification13?.mode);},
 validField(e,state){
  if(!this.recognizes(e)||e.qualification?.status!=='complete')return false;
  const ids=e.qualified13,n=format6(e)?.n;
  return Array.isArray(ids)&&ids.length===n&&new Set(ids).size===n&&ids.every(id=>Number.isInteger(id)&&!!state.teams[id])&&
   Array.isArray(e.qualification.qualified)&&JSON.stringify(ids)===JSON.stringify(e.qualification.qualified)&&
   (!e.qualification.invited||Array.isArray(e.qualification.invited)&&e.qualification.invited.every(v=>ids.includes(v.team)));
 },
 repairFuture(){
  const active=S.events.find(e=>e.id===S.active?.event),protectedId=active?.qualifierFor;
  for(const e of [...S.events]){
   if(e.done||e.background51||e.id===active?.id||e.id===protectedId||!this.recognizes(e)||e.qualification?.majorVersion!==5)continue;
   const old=e.qualification,children=S.events.filter(c=>c.qualifierFor===e.id);
   const started=children.some(c=>c.done||(c.regionalState?.schedule||c.schedule6||[]).some(n=>n.score));
   const policy=started&&old.policy?old.policy:Admissions5.policy(e);if(!policy)continue;
   (S.v5.legacyArchive.repairedAdmissions??=[]).push({event:e.id,day:S.day,qualification:structuredClone(old),qualification13:structuredClone(e.qualification13)});
   const child=children.length===1&&children[0].v5Qualifier&&children[0].qualifierRegion==='GLOBAL'&&children[0].quota===policy.quotas.GLOBAL?children[0]:null;
   const rows=Admissions5.rows(e),excluded=new Set(child?.entrants||[]),available=rows.filter(r=>!excluded.has(r.team)),invited=policy.mandatory?Admissions5.selectInvites(policy,available):available.slice(0,policy.direct).map(r=>({...r,reason:'season-top',text:'Регион '+(r.region==='EU'?'WEU':r.region)+' · место '+r.regionalRank}));
   for(const b of Object.values(S.v4?.camps||{}))if((b.event===e.id||children.some(c=>c.id===b.event))&&b.status==='active')Camp4.close(b,'interrupted');
   delete e.qualified13;delete e.qualification13;delete e.participationConfirmed5b;
   if(child&&invited.length===policy.direct){
    e.qualification={qualVersion:1,majorVersion:5,status:'frozen',mode:'regional-ranking-v5',policy,snapshotDay:Math.min(S.day,old.snapshotDay??S.day),eventDay:e.day,fieldSize:policy.field,rows,invited,rules:{invites:policy.direct,listLead:ADMISSION_RULES5.confirmationDays},regionalEvents:{GLOBAL:child.id},player:{team:S.club,invited:invited.some(r=>r.team===S.club),index:rows.find(r=>r.team===S.club)?.index??0}};
   }else{
    const ids=new Set(children.map(c=>c.id));
    S.v5.legacyArchive.events.push(...children.map(c=>structuredClone(c)));
    S.events=S.events.filter(c=>!ids.has(c.id));
    if(S.v4)for(const [key,b] of Object.entries(S.v4.camps))if(ids.has(b.event))delete S.v4.camps[key];
    e.qualification={qualVersion:1,majorVersion:5,status:'pending',mode:'regional-ranking-v5',policy};
   }
   log(e.name+' · восстановлены согласованные правила допуска; результаты прежних отборов сохранены.');
  }
 }
};
