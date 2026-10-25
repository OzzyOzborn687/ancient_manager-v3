'use strict';
const WildcardLegacy3b={fresh,migrate,valid:validSave,finish:finishEvent6,skip:finalizeSkipped12,
 regional:Qualifiers.finishRegional,create:Qualifiers.createRegionals,update:Qualifiers.update};
fresh=function(...args){WildcardLegacy3b.fresh(...args);Qualifiers.initOperators3b();save();render();};
migrate=function(){
 WildcardLegacy3b.migrate();Qualifiers.initOperators3b();
 for(const e of S.events)if(Qualifiers.isCalendar3(e)&&e.qualification.status==='frozen')Qualifiers.restoreWildcard3b(e);
};
Qualifiers.createRegionals=function(e){WildcardLegacy3b.create.call(this,e);this.restoreWildcard3b(e);};
Qualifiers.update=function(){
 let changed=false;
 if(S?.qualifiers?.operators3b)for(const e of S.events)if(e.qualification?.wildcardRestorePending3b)changed=this.restoreWildcard3b(e)||changed;
 WildcardLegacy3b.update.call(this);if(changed)save();
};
Qualifiers.finishRegional=function(a,withdrawn=false){
 const e=S.events.find(v=>v.id===a.event),before=e?.done;
 const result=WildcardLegacy3b.regional.call(this,a,withdrawn);
 if(!before&&e?.done&&(e.entrants||[]).includes(S.club)&&this.operator3b(e)){this.awardOperatorResult3b(e,a,withdrawn);save();}
 return result;
};
finishEvent6=function(a){
 const e=S.events.find(v=>v.id===a.event),before=e?.done;
 const result=WildcardLegacy3b.finish(a);
 if(!before&&e?.done&&!Qualifiers.isRegional(e)&&Qualifiers.operator3b(e)){Qualifiers.awardOperatorResult3b(e,a);save();}
 return result;
};
finalizeSkipped12=function(a){
 const e=S.events.find(v=>v.id===a.event),before=e?.done;
 const result=WildcardLegacy3b.skip(a);
 if(!before&&e?.done&&!Qualifiers.isRegional(e)&&Qualifiers.operator3b(e)){Qualifiers.awardOperatorResult3b(e,a,true);save();}
 return result;
};
Qualifiers.validOperators3b=function(x){
 const state=x.qualifiers?.operators3b;if(state===undefined)return true;
 const C=QUALIFIERS.operatorRelations,object=v=>v&&typeof v==='object'&&!Array.isArray(v),score=v=>Number.isFinite(v)&&v>=C.min&&v<=C.max;
 const id=id=>Number.isInteger(id)&&id>=0&&id<x.teams.length,day=v=>Number.isInteger(v)&&v>=0;
 if(!object(state)||state.version!==C.version||state.club!==x.club||!object(state.relations)||!object(state.requests)||!object(state.settled)||!Array.isArray(state.history))return false;
 if(Object.keys(state.relations).length!==QUALIFIERS.operators.length||QUALIFIERS.operators.some(op=>!score(state.relations[op])))return false;
 const records=[];
 for(const [season,list] of Object.entries(state.requests)){
  if(String(+season)!==season||!Number.isInteger(+season)||!Array.isArray(list))return false;
  const seen=new Set();let limit=0;
  for(const [i,r] of list.entries()){
   const rules=r?.rules;
   if(!object(r)||r.year!==+season||r.number!==i+1||!day(r.event)||typeof r.eventName!=='string'||!QUALIFIERS.operators.includes(r.operator)||!QUALIFIERS.regions.includes(r.region)||
    !day(r.qualifier)||r.team!==x.club||!day(r.day)||circuitYear(r.day)!==r.year||seen.has(r.event)||!score(r.relationshipBefore)||!score(r.relationshipAfter)||typeof r.accepted!=='boolean'||
    !object(rules)||!Number.isInteger(rules.seasonLimit)||rules.seasonLimit<1||!Number.isFinite(rules.relationshipCost)||rules.relationshipCost<0||
    !Number.isFinite(rules.minProbability)||!Number.isFinite(rules.maxProbability)||rules.minProbability<0||rules.maxProbability>1||rules.minProbability>rules.maxProbability||
    !score(rules.minRelation)||!score(rules.maxRelation)||rules.maxRelation<=rules.minRelation)return false;
   seen.add(r.event);limit=Math.max(limit,rules.seasonLimit);
   if(!Number.isFinite(r.pWin)||Math.abs(r.pWin-this.wildcardProbability3b(r.relationshipBefore,rules))>QUALIFIERS.precision||
    !Number.isFinite(r.roll)||r.roll<0||r.roll>=1||r.accepted!==(r.roll<r.pWin)||
    ![r.seedBefore,r.seedAfter].every(s=>Number.isInteger(s)&&(s>>>0)===s)||r.roll!==r.seedAfter/2**32||
    r.relationshipAfter!==clamp(r.relationshipBefore-rules.relationshipCost,rules.minRelation,rules.maxRelation)||
    (r.accepted?!id(r.replaced)||r.replaced===x.club:r.replaced!==null)||
    r.cancelled!==undefined&&typeof r.cancelled!=='boolean'||r.cancelled&&(!r.accepted||!day(r.cancelledDay)))return false;
   records.push(r);
  }
  if(list.length>limit)return false;
 }
 const validKey=key=>{
  const parts=key.split('|');return parts.length===5&&QUALIFIERS.operators.includes(parts[0])&&String(+parts[1])===parts[1]&&day(+parts[1])&&
   ['main','qualification'].includes(parts[2])&&(parts[2]==='main'?parts[3]==='':QUALIFIERS.regions.includes(parts[3]))&&parts[4]===String(x.club);
 };
 for(const [key,value] of Object.entries(state.settled))if(value!==true||!validKey(key))return false;
 for(const h of state.history){
  if(!object(h)||!validKey(h.key)||!state.settled[h.key]||!day(h.event)||!day(h.parent)||h.team!==x.club||!QUALIFIERS.operators.includes(h.operator)||
   !day(h.day)||!['qualification','main'].includes(h.kind)||!['withdrawal','qualification-pass','qualification-finish','main-finish'].includes(h.reason)||
   !score(h.before)||!score(h.after)||!Number.isFinite(h.delta)||Math.abs(h.after-h.before-h.delta)>QUALIFIERS.precision||
   h.key!==[h.operator,h.parent,h.kind,h.region,h.team].join('|'))return false;
 }
 const receiptOK=(receipt,parent,child)=>{
  if(!object(receipt)||!parent||!child||!this.isCalendar3(parent)||!this.isRegional(child)||child.qualifierFor!==parent.id)return false;
  const r=records.find(v=>v.year===receipt.year&&v.number===receipt.number);
  return !!r&&r.accepted&&r.event===parent.id&&r.operator===circuitSeries(parent)&&receipt.operator===r.operator&&receipt.team===x.club&&
   receipt.region===r.region&&child.qualifierRegion===r.region&&receipt.qualifier===child.id&&id(receipt.replaced)&&receipt.replaced!==x.club&&
   child.entrants.includes(x.club)&&!child.entrants.includes(receipt.replaced)&&day(receipt.appliedDay)&&typeof receipt.restored==='boolean'&&
   (receipt.restored||receipt.replaced===r.replaced&&receipt.qualifier===r.qualifier);
 };
 for(const e of x.events){
  if(e.wildcard3b){
   const parent=x.events.find(p=>p.id===e.qualifierFor);
   if(!receiptOK(e.wildcard3b,parent,e)||JSON.stringify(parent.qualification.wildcard3b)!==JSON.stringify(e.wildcard3b))return false;
  }
  if(e.qualification?.wildcard3b){const child=x.events.find(c=>c.id===e.qualification.wildcard3b.qualifier);if(!receiptOK(e.qualification.wildcard3b,e,child)||!child.wildcard3b)return false;}
 }
 return true;
};
validSave=function(x){try{return WildcardLegacy3b.valid(x)&&Qualifiers.validOperators3b(x);}catch{return false;}};
