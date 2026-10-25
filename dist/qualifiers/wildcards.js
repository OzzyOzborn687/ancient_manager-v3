'use strict';
Qualifiers.wildcardProbability3b=function(relationship,rules=null){
 const C=QUALIFIERS.wildcardRequest,R=QUALIFIERS.operatorRelations;
 const r=rules||{minProbability:C.minProbability,maxProbability:C.maxProbability,minRelation:R.min,maxRelation:R.max};
 const normalized=clamp((relationship-r.minRelation)/(r.maxRelation-r.minRelation),0,1);
 return r.minProbability+(r.maxProbability-r.minProbability)*normalized;
};
Qualifiers.wildcardStatus3b=function(e,restoring=false){
 const operator=e&&this.operator3b(e),state=this.initOperators3b(),year=circuitYear(S.day),used=state?.requests[year]||[];
 const result={available:false,operator,year,used:used.length,limit:QUALIFIERS.wildcardRequest.perSeason,
  relationship:operator?this.relationship3b(operator):null,request:null};
 const stop=(code,reason)=>({...result,code,reason});
 if(!e||this.isRegional(e)||!operator)return stop('unsupported','Запрос доступен для BLAST, PGL, ESL и DreamLeague.');
 result.request=used.find(r=>r.event===e.id&&r.operator===operator)||null;
 result.pWin=this.wildcardProbability3b(result.relationship);
 if(!restoring&&result.request)return stop('already-requested','Запрос на этот турнир в текущем сезоне уже рассмотрен.');
 if(!restoring&&used.length>=result.limit)return stop('season-used','Попытка этого сезона уже использована.');
 if(!this.isCalendar3(e))return stop('legacy','Отбор идёт по прежнему регламенту; запрос будет доступен на следующих турнирах.');
 const q=e.qualification;
 if(e.done||q.status==='complete')return stop('closed','Список основного турнира уже закрыт.');
 if(q.status==='pending')return stop('pending','Дождитесь объявления приглашений.');
 if(q.status!=='frozen')return stop('blocked',q.reason||'Календарь отбора пока не готов.');
 if(q.invited.some(v=>v.team===S.club))return stop('invited','Ваш клуб уже получил прямое приглашение.');
 const children=Object.values(q.regionalEvents||{}).map(id=>S.events.find(c=>c.id===id)).filter(Boolean);
 if(children.some(c=>c.entrants?.includes(S.club)))return stop('entered','Ваш клуб уже участвует в закрытой квалификации.');
 const region=this.region(my()),child=children.find(c=>c.qualifierRegion===region);
 if(!child)return stop('no-region','Региональный турнир ещё не подготовлен.');
 result.region=region;result.child=child;
 if(child.done||child.day<=S.day||child.registration3||S.active?.event===child.id)return stop('started','Региональная квалификация уже началась; менять поле нельзя.');
 const a=child.regionalState;
 if(!a||a.live||a.cursor!==0||a.schedule.some(n=>n.score)||a.placements&&Object.keys(a.placements).length)return stop('started','В сетке уже есть результаты; менять поле нельзя.');
 const gap=QUALIFIERS.regional.minGap,probe={id:child.id,calendarParent3:e.id,day:child.day-gap,duration:child.duration+gap*2};
 if(this.busy(e,S.club)||this.busy(probe,S.club))return stop('busy','У клуба пересекаются официальные матчи. Сначала нужен свободный календарь.');
 const slots=child.entrants.filter(id=>id!==S.club&&!q.invited.some(v=>v.team===id));
 slots.sort((x,y)=>(a.seeds[x]??0)-(a.seeds[y]??0)||y-x);
 if(!slots.length)return stop('no-slot','Нет доступного места в закрытом региональном поле.');
 return {...result,available:true,code:'available',reason:'Запрос места в закрытой квалификации '+region+'.',replaced:slots[0]};
};
Qualifiers.applyWildcard3b=function(e,status,record,restored=false){
 const child=status.child,old=status.replaced,a=structuredClone(child.regionalState),team=S.club;
 const replace=id=>id===old?team:id;
 a.entrants=a.entrants.map(replace);delete a.seeds[old];a.seeds[team]=strength(my());
 for(const n of a.schedule)n.pair=n.pair.map(v=>typeof v==='number'?replace(v):v);
 for(const g of a.gsl||[])g.ids=g.ids.map(replace);
 if(a.groupIds)a.groupIds=a.groupIds.map(ids=>ids.map(replace));
 const receipt={year:record.year,number:record.number,team,operator:record.operator,region:record.region,
  qualifier:child.id,replaced:old,appliedDay:S.day,restored};
 child.entrants=child.entrants.map(replace);child.regionalState=a;
 child.schedule6=structuredClone(a.schedule);child.seeds6={...a.seeds};if(a.gsl)child.gsl6=structuredClone(a.gsl);
 child.rosterLock??={};delete child.rosterLock[old];child.rosterLock[team]=roster().map(p=>p.id);
 child.wildcard3b=receipt;e.qualification.wildcard3b={...receipt};delete e.qualification.wildcardRestorePending3b;
};
Qualifiers.requestWildcard3b=function(e){
 const state=this.initOperators3b(),year=circuitYear(S.day),used=state?.requests[year]||[];
 if(!state)return null;
 const previous=e&&used.find(r=>r.event===e.id&&r.operator===this.operator3b(e));
 if(previous)return previous;
 const status=this.wildcardStatus3b(e);if(!status.available)return null;
 const C=QUALIFIERS.wildcardRequest,R=QUALIFIERS.operatorRelations;
 const rules={seasonLimit:C.perSeason,minProbability:C.minProbability,maxProbability:C.maxProbability,
  minRelation:R.min,maxRelation:R.max,relationshipCost:C.relationshipCost};
 const before=state.relations[status.operator],seedBefore=S.seed,roll=rng(),pWin=this.wildcardProbability3b(before,rules),accepted=roll<pWin;
 const after=clamp(before-C.relationshipCost,R.min,R.max);
 const record={year,number:used.length+1,event:e.id,eventName:e.name,operator:status.operator,region:status.region,
  qualifier:status.child.id,team:S.club,day:S.day,relationshipBefore:before,relationshipAfter:after,
  rules,pWin,roll,seedBefore,seedAfter:S.seed,accepted,replaced:accepted?status.replaced:null};
 if(accepted)this.applyWildcard3b(e,status,record);
 state.relations[status.operator]=after;state.requests[year]=[...used,record];
 log(e.name+' · '+(accepted?'wildcard в квалификацию '+status.region+' одобрен. Ваш клуб заменил '+S.teams[status.replaced].name+'.':'оператор отклонил запрос wildcard.')+
  ' Отношения '+Math.round(before)+'/100, оценка шанса '+Math.round(pWin*100)+'%. Попытка сезона '+year+' использована.');
 return record;
};
Qualifiers.restoreWildcard3b=function(e){
 const record=this.requests3b().find(r=>r.event===e.id&&r.operator===this.operator3b(e)&&r.accepted&&!r.cancelled);
 if(!record||e.done||e.qualification?.status!=='frozen')return;
 if(e.qualification.invited.some(v=>v.team===S.club)||S.events.some(c=>c.qualifierFor===e.id&&c.entrants?.includes(S.club)))return;
 const status=this.wildcardStatus3b(e,true);
 if(status.available){this.applyWildcard3b(e,status,record,true);return true;}
 e.qualification.wildcardRestorePending3b=status.reason;return false;
};
