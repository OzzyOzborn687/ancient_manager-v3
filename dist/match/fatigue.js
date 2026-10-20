'use strict';
// Official fatigue belongs to a completed SERIES, not to each constituent map.
Match22.fatigueStage=function(a,node=null){
 if(a?.format6){if(node?.groupMatch||/Swiss|Групп|GSL|BLAST.*(?:посев|Last Chance)|TI.*матч за выход/i.test(node?.label||''))return 'groups';return a.stage6==='playoffs'?'playoffs':'groups';}
 return a?.phase==='playoffs'?'playoffs':'groups';
};
Match22.seriesKey=function(a,ids,node=null){
 return [a.event,node?.id??[a.phase,a.stage6,a.groupDay??'',a.round??''].join(':'),[...ids].sort((x,y)=>x-y).join('-')].join('/');
};
Match22.fatigueState=function(a){
 if(a.fatigue26)return a.fatigue26;
 const state=a.fatigue26={groups:{},charged:{}};
 const remember=(ids,node,stage)=>{
  const key=this.seriesKey(a,ids,node);if(state.charged[key])return;
  for(const id of ids)if(stage==='groups')state.groups[id]=(state.groups[id]||0)+1;
  state.charged[key]={stage,migrated:true};
 };
 // Count finished old series without retroactively altering existing fatigue.
 if(a.format6){
  for(const node of a.schedule||[]){if(!node.score)continue;const ids=node.pair.map(v=>resolve6(a,v));if(ids.some(id=>!Number.isInteger(id)))continue;remember(ids,node,this.fatigueStage({...a,stage6:'playoffs'},node));}
  if(a.seriesDone&&a.maps?.length){const node=a.schedule?.[a.cursor];remember([S.club,a.opponent],node,this.fatigueStage(a,node));}
 }else{
  for(const group of a.groups||[])for(const match of group.matches||[]){
   const historic={...a,phase:'groups',stage6:undefined,groupDay:match.day,round:0};
   const key=this.seriesKey(historic,match.pair);if(state.charged[key])continue;
   for(const id of match.pair)state.groups[id]=(state.groups[id]||0)+1;
   state.charged[key]={stage:'groups',migrated:true};
  }
  if(a.seriesDone&&a.maps?.length)remember([S.club,a.opponent],null,this.fatigueStage(a));
 }
 return state;
};
Match22.seriesFatiguePreview=function(a,id,node=null){
 const state=this.fatigueState(a),stage=this.fatigueStage(a,node),count=state.groups[id]||0,F=this.B.fatigue;
 return {stage,base:stage==='playoffs'?F.playoffs:F.groups[count%F.groups.length],number:count+1};
};
Match22.chargeSeries=function(a,ids,node=null){
 if(!a)return false;const state=this.fatigueState(a),key=this.seriesKey(a,ids,node);
 if(state.charged[key])return false;
 const stage=this.fatigueStage(a,node),record={stage,teams:[],day:S.day};
 for(const id of ids){
  const {base,number}=this.seriesFatiguePreview(a,id,node);
  const players=roster(S.teams[id]);
  for(const p of players)p.fatigue=clamp(p.fatigue+fatigueDelta21(p,base));
  record.teams.push({id,base,series:stage==='groups'?number:null,applied:players.map(p=>({id:p.id,delta:fatigueDelta21(p,base)}))});
  if(stage==='groups')state.groups[id]=number;
 }
 state.charged[key]=record;
 log('Серия завершена: '+record.teams.map(t=>S.teams[t.id].short+' — усталость +'+t.base+' п.п. до эффекта восстановления').join('; ')+'.');
 return true;
};
const mapFatigueBefore26=fatigueMap6;
fatigueMap6=function(ids,seconds){
 if(S.active&&!S.practice13)return; // One charge when the official series ends.
 mapFatigueBefore26(ids,seconds); // Scrims keep their existing per-map workload.
};
const finishMapBefore26=finishMap;
finishMap=function(){
 const a=S.active,m=a?.live;if(!m||m.finishedSide==null)return;
 Match22.fatigueState(a);const ids=m.sides.map(s=>s.team),node=a.schedule?.[a.cursor];
 finishMapBefore26();
 if(a.seriesDone&&Match22.chargeSeries(a,ids,node))render();
};
const recordSeriesBefore26=recordNode6;
recordNode6=function(a,node,score){
 Match22.fatigueState(a);const done=!!node.score;
 recordSeriesBefore26(a,node,score);
 if(!done&&node.score)Match22.chargeSeries(a,node.pair.map(v=>resolve6(a,v)),node);
};
const aiSeriesBefore26=aiSeries6;
aiSeries6=function(ids,bo=3){
 const a=S.active,node=a?.schedule?.[a.cursor];if(a)Match22.fatigueState(a);
 const result=aiSeriesBefore26(ids,bo);
 if(a)Match22.chargeSeries(a,ids,node);return result;
};
const initBefore26=init13;
init13=function(){initBefore26();if(S.active)Match22.fatigueState(S.active);};
