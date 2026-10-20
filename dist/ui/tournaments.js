'use strict';
// All graph data is a projection of schedule6. No draws, scores or career state are changed here.
const NeonTournament={zoom:'auto',serial:0};
function neonTeamName(id,a){return S.teams[id]?.short||'Слот '+((a?.entrants?.indexOf(id)??-1)+1||Math.abs(id));}
function neonSlot(a,value){
 if(Number.isInteger(value))return {id:value>=0?value:null,label:neonTeamName(value,a)};
 if(value?.seedLabel)return {id:null,label:value.seedLabel};
 if(value&&Number.isInteger(value.id)){
  const source=a.schedule[value.id],out=value.out||'w',id=source?.[out];
  if(Number.isInteger(id))return {id,label:S.teams[id]?.short||'—'};
  return {id:null,label:(out==='l'?'Проигравший ':'Победитель ')+'M'+(value.id+1)};
 }
 return {id:null,label:'Ожидание'};
}
function neonCrest(id){return Number.isInteger(id)&&S.teams[id]?clubAvatar12(S.teams[id],true):'<span class="gabe-unknown" aria-hidden="true">—</span>';}
function neonMatchContents(n,a,active){
 const slots=n.pair.map(v=>neonSlot(a,v)),live=!!active&&n.id===a.cursor;
 let scores=n.score?n.score.split(':'):null;
 if(!scores&&live){scores=[...(a.score||[0,0])];if(slots[1].id===S.club)scores.reverse();}
 return '<div class="neon-match-content">'+slots.map((s,i)=>
  '<div class="neon-match-team '+(s.id===S.club?'own-team ':'')+(s.id!=null&&n.w===s.id?'is-winner':'')+'">'+neonCrest(s.id)+'<span class="neon-match-name" title="'+esc(s.label)+'">'+esc(s.label)+'</span><b class="neon-match-score">'+(scores?scores[i]:'–')+'</b></div>').join('')+'</div>'+
  (live?'<button class="neon-match-live-button" onclick="go(\'match\')">'+(slots.some(s=>s.id===S.club)?'Играть →':'Открыть серию →')+'</button>':'');
}
function neonInlineMatch(n,a,active){
 return '<article class="neon-inline-match" data-match-id="'+n.id+'"><div class="neon-node-head">'+esc(n.label)+' · BO'+n.bo+'</div>'+neonMatchContents(n,a,active)+'</article>';
}
function neonMatchNode(n,a,active,pos){
 const live=active&&n.id===a.cursor,label=n.championship?'ГРАНД-ФИНАЛ':n.label;
 return '<article class="neon-node '+(live?'playing ':'')+(n.championship?'neon-champion-card':'')+'" data-match-id="'+n.id+'" style="left:'+pos.x+'px;top:'+pos.y+'px;width:'+pos.w+'px;height:'+pos.h+'px"><div class="neon-node-inner"><div class="neon-node-head">'+esc(label)+' · BO'+n.bo+'</div>'+neonMatchContents(n,a,active)+'</div></article>';
}
function neonConnector(x1,y1,x2,y2,kind){
 const middle=x1+(x2-x1)/2;
 return '<path class="neon-edge '+(kind||'')+'" d="M'+x1+' '+y1+' H'+middle+' V'+y2+' H'+x2+'"/>';
}
function neonNodeFrame(w,h){
 const bevel=(inset,corner)=>'M'+(inset+corner)+' '+inset+' H'+(w-inset-corner)+' L'+(w-inset)+' '+(inset+corner)+' V'+(h-inset-corner)+' L'+(w-inset-corner)+' '+(h-inset)+' H'+(inset+corner)+' L'+inset+' '+(h-inset-corner)+' V'+(inset+corner)+' Z';
 return '<svg class="neon-card-frame" viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><path class="frame-outer" d="'+bevel(1,7)+'"/><path class="frame-inner" d="'+bevel(4,6)+'"/></svg>';
}
function neonGraphFrame(title,width,height,body,hint){
 body=body.replace(/<(?:article|div) class="neon-node[^"]*"[^>]*style="[^"]*width:([\d.]+)px;height:([\d.]+)px"[^>]*>/g,(tag,w,h)=>tag+neonNodeFrame(+w,+h));

 return '<section class="neon-bracket-shell"><div class="neon-bracket-toolbar"><h2>'+esc(title)+'</h2><div class="neon-bracket-tools"><button aria-label="Уменьшить сетку" onclick="neonZoom(-1)">−</button><button onclick="neonZoom(\'fit\')">Вписать</button><button onclick="neonZoom(\'100\')">100%</button><button aria-label="Увеличить сетку" onclick="neonZoom(1)">+</button></div></div>'+
 '<p class="neon-bracket-hint">'+esc(hint||'Сплошная линия — переход победителя. Пунктир — переход проигравшего.')+'</p>'+
 '<div class="neon-bracket-viewport"><div class="neon-graph-stage" data-width="'+width+'" data-height="'+height+'" style="width:'+width+'px;height:'+height+'px"><div class="neon-graph" style="width:'+width+'px;height:'+height+'px">'+body+'</div></div></div></section>';
}
function neonZoom(value){
 if(value==='fit')NeonTournament.zoom='fit';
 else if(value==='100')NeonTournament.zoom=1;
 else{const current=typeof NeonTournament.zoom==='number'?NeonTournament.zoom:1;NeonTournament.zoom=clamp(current+value*.15,.25,1.6);}
 fitNeonBracket();
}
function fitNeonBracket(){
 if(!document.querySelectorAll)return;
 for(const stage of document.querySelectorAll('.neon-graph-stage')){
  const viewport=stage.parentElement,w=+stage.dataset.width,h=+stage.dataset.height;
  if(!w||!h||!viewport.clientWidth)continue;
  const mode=NeonTournament.zoom,available=Math.max(200,viewport.clientWidth-22);
  const scale=mode==='fit'?Math.min(1,available/w):mode==='auto'?(available>=900?Math.min(1,available/w):1):mode;
  stage.style.width=w*scale+'px';stage.style.height=h*scale+'px';
  stage.firstElementChild.style.transform='scale('+scale+')';
 }
}
if(typeof addEventListener==='function')addEventListener('resize',fitNeonBracket);

function neonSwissData(a,f){
 const ids=[...a.entrants],history=new Map(),records=new Map(ids.map(id=>[id,{w:0,l:0}])),rounds=f.rounds||5,threshold=f.threshold||null;
 const add=(key,id)=>{if(!history.has(key))history.set(key,new Set());history.get(key).add(id);};
 ids.forEach(id=>add('0-0',id));
 for(let round=1;round<=rounds;round++){
  for(const n of a.schedule.filter(n=>n.groupMatch&&n.swissRound===round&&n.score)){
   const pair=n.pair.map(v=>neonSlot(a,v).id),scores=n.score.split(':').map(Number);
   if(scores[0]===scores[1])continue; // Current Swiss formats are BO3 without draws.
   pair.forEach((id,i)=>{const r=records.get(id);if(!r)return;r[scores[i]>scores[1-i]?'w':'l']++;add(r.w+'-'+r.l,id);});
  }
 }
 const ranked=ranks6(a,ids),complete=a.schedule.filter(n=>n.groupMatch).length>0&&a.schedule.filter(n=>n.groupMatch).every(n=>n.score)&&((a.swissRound||0)>=rounds||a.stage6!=='groups');
 const qualified=new Set(threshold?ranked.filter(r=>r.w>=threshold).map(r=>r.id):complete?ranked.slice(0,a.formatKey6==='ti'?3:8).map(r=>r.id):[]);
 const capacities=new Map([['0-0',ids.length]]);
 for(let round=0;round<rounds;round++)for(let losses=0;losses<=round;losses++){const wins=round-losses;if(threshold&&(wins>=threshold||losses>=threshold))continue;const count=capacities.get(wins+'-'+losses)||0;for(const key of [(wins+1)+'-'+losses,wins+'-'+(losses+1)])capacities.set(key,(capacities.get(key)||0)+count/2);}
 const columns=[];
 for(let round=0;round<=rounds;round++){
  const col=[];
  for(let losses=0;losses<=round;losses++){
   const wins=round-losses;
   if(threshold&&(wins>threshold||losses>threshold))continue;
   const key=wins+'-'+losses,list=[...(history.get(key)||[])];
   const status=threshold?(wins===threshold?'qualified':losses===threshold?'eliminated':null):null;
   const slots=Math.max(list.length,Math.ceil(capacities.get(key)||0),2),h=48+slots*18;
   col.push({slots,key,w:wins,l:losses,round,ids:list,h,status,footprint:h+(status?68:0)});
  }
  columns.push(col);
 }
 return {columns,ranked,qualified,complete,threshold,rounds};
}
function neonSwissBoard(a,f,active){
 const data=neonSwissData(a,f),cardWidth=164,gap=32,pad=66;
 const height=Math.max(720,...data.columns.map(col=>col.reduce((n,b)=>n+b.footprint,0)+Math.max(0,col.length-1)*20+100));
 const width=pad*2+data.columns.length*cardWidth+(data.columns.length-1)*gap;
 const all=[],positions=new Map();let boxes='';
 data.columns.forEach((col,i)=>{
  if(data.threshold===3&&i===data.columns.length-1){
   const x=pad+i*(cardWidth+gap),win=col.find(b=>b.w===3),loss=col.find(b=>b.l===3),hh=Math.max(216,56+Math.max(win?.slots||3,loss?.slots||3)*22),yy=(height-hh)/2;
   for(const b of col){b.x=x;b.y=yy+(b.w===3?20:hh/2);b.h=hh/2;positions.set(b.key,b);all.push(b);}
   const renderList=b=>b.ids.length?b.ids.map(id=>'<div class="neon-bucket-team '+(id===S.club?'own-team':'')+'">'+neonCrest(id)+'<span>'+esc(neonTeamName(id,a))+'</span></div>').join(''):Array.from({length:b.slots},()=>'<div class="neon-placeholder-line"></div>').join('');
   boxes+='<div class="neon-node neon-terminal" style="left:'+x+'px;top:'+(yy-80)+'px;width:'+cardWidth+'px;height:64px"><div class="neon-node-inner"><div class="neon-node-head">QUALIFIED</div><p>Выход в плей-офф</p></div></div><article class="neon-node neon-elimination-round" style="left:'+x+'px;top:'+yy+'px;width:'+cardWidth+'px;height:'+hh+'px"><div class="neon-node-inner"><div class="neon-elimination-caption">ELIMINATION<br>ROUND</div><div class="neon-elimination-columns"><div data-record="3-2"><div class="neon-node-head">3-2</div><div class="neon-node-body">'+renderList(win)+'</div></div><div data-record="2-3"><div class="neon-node-head">2-3</div><div class="neon-node-body">'+renderList(loss)+'</div></div></div></div></article><div class="neon-node neon-terminal eliminated" style="left:'+x+'px;top:'+(yy+hh+18)+'px;width:'+cardWidth+'px;height:64px"><div class="neon-node-inner"><div class="neon-node-head">ELIMINATED</div><p>Турнир завершён</p></div></div>';
   return;
  }
  let y=(height-col.reduce((n,b)=>n+b.footprint,0)-(col.length-1)*20)/2;
  for(const b of col){
   const x=pad+i*(cardWidth+gap),before=b.status==='qualified'?68:0;
   b.x=x;b.y=y+before;positions.set(b.key,b);all.push(b);
   if(b.status){
    const ty=b.status==='qualified'?y:b.y+b.h+12;
    boxes+='<div class="neon-node neon-terminal '+(b.status==='eliminated'?'eliminated':'')+'" style="left:'+x+'px;top:'+ty+'px;width:'+cardWidth+'px;height:54px"><div class="neon-node-inner"><div class="neon-node-head">'+(b.status==='qualified'?'QUALIFIED':'ELIMINATED')+'</div><p>'+(b.status==='qualified'?'Выход в плей-офф':'Турнир завершён')+'</p></div></div>';
   }
   const rows=b.ids.length?b.ids.map(id=>'<div class="neon-bucket-team '+(id===S.club?'own-team ':'')+(data.qualified.has(id)?'qualified-team':'')+'">'+neonCrest(id)+'<span>'+esc(neonTeamName(id,a))+'</span></div>').join(''):Array.from({length:b.slots},()=>'<div class="neon-placeholder-line"></div>').join('');
   boxes+='<article class="neon-node '+(b.status==='eliminated'?'eliminated':'')+'" data-record="'+b.key+'" data-round="'+b.round+'" style="left:'+x+'px;top:'+b.y+'px;width:'+cardWidth+'px;height:'+b.h+'px"><div class="neon-node-inner"><div class="neon-node-head">'+b.key+'</div><div class="neon-node-body">'+rows+'</div></div></article>';
   y+=b.footprint+20;
  }
 });
 let edges='';
 for(const b of all){
  if(b.status||b.round>=data.rounds)continue;
  for(const key of [(b.w+1)+'-'+b.l,b.w+'-'+(b.l+1)]){
   const target=positions.get(key);if(target)edges+=neonConnector(b.x+cardWidth,b.y+b.h/2,target.x,target.y+target.h/2,b.ids.length?'':'future');
  }
 }
 const svg='<svg class="neon-connectors" viewBox="0 0 '+width+' '+height+'" aria-hidden="true">'+edges+'</svg>';
 const hint=data.threshold?'Swiss BO3: три победы — выход, три поражения — вылет. Каждый блок показывает команды, прошедшие через этот счёт.':'Swiss BO3: '+data.rounds+' полных раундов. Три победы или поражения не останавливают участие; выход определяется итоговой таблицей.';
 let html=neonGraphFrame('SWISS · '+(data.threshold?'3 ПОБЕДЫ / 3 ПОРАЖЕНИЯ':data.rounds+' РАУНДОВ'),width,height,svg+boxes,hint);
 const current=a.schedule.filter(n=>n.groupMatch&&n.swissRound===(a.swissRound||1));
 if(current.length)html+='<section class="neon-round-strip"><h3>Раунд '+(a.swissRound||1)+' · реальные пары</h3><div class="neon-round-matches">'+current.map(n=>neonInlineMatch(n,a,active)).join('')+'</div></section>';
 return html;
}
function neonPlayoffGraph(a,nodes,active,title){
 if(!nodes.length)return '';
 const map=new Map(nodes.map(n=>[n.id,n])),depth=new Map(),lane=new Map(),positions=new Map();
 const lower=n=>/нижн|Last Chance|выбывание|выбывани/i.test(n.label);
 const visit=(n,path=new Set())=>{
  if(depth.has(n.id))return depth.get(n.id);
  if(path.has(n.id))throw Error('Cyclic bracket display graph');
  path.add(n.id);
  const parents=n.pair.filter(v=>v&&typeof v==='object'&&Number.isInteger(v.id)&&map.has(v.id));
  const d=parents.length?1+Math.max(...parents.map(v=>visit(map.get(v.id),new Set(path)))):0;
  depth.set(n.id,d);lane.set(n.id,n.championship?'final':lower(n)?'lower':'upper');return d;
 };
 nodes.forEach(n=>visit(n));
 const W=208,H=130,DX=58,DY=40,PX=52,top=76;
 const upperNodes=nodes.filter(n=>lane.get(n.id)==='upper'),lowerNodes=nodes.filter(n=>lane.get(n.id)==='lower');
 const maxCount=items=>Math.max(1,...Array.from(new Set(items.map(n=>depth.get(n.id)))).map(d=>items.filter(n=>depth.get(n.id)===d).length));
 const upperHeight=maxCount(upperNodes)*(H+DY)-DY,lowerTop=top+upperHeight+108;
 function layout(items,baseY,laneHeight){
  const levels=[...new Set(items.map(n=>depth.get(n.id)))].sort((a,b)=>a-b);
  for(const d of levels){
   const inCol=items.filter(n=>depth.get(n.id)===d).sort((a,b)=>a.id-b.id);let previous=-Infinity;
   for(let i=0;i<inCol.length;i++){
    const n=inCol[i],parents=n.pair.filter(v=>v&&typeof v==='object'&&positions.has(v.id)&&lane.get(v.id)===lane.get(n.id));
    const ideal=parents.length?parents.reduce((sum,v)=>sum+positions.get(v.id).y+H/2,0)/parents.length-H/2:baseY+(laneHeight-inCol.length*(H+DY)+DY)/2+i*(H+DY);
    const y=Math.max(baseY,ideal,previous+H+DY);previous=y;
    positions.set(n.id,{x:PX+d*(W+DX),y,w:W,h:H+(active&&n.id===a.cursor?30:0)});
   }
  }
 }
 layout(upperNodes,top,upperHeight);
 const lowerHeight=maxCount(lowerNodes)*(H+DY)-DY;layout(lowerNodes,lowerTop,lowerHeight);
 let bottom=Math.max(top+H,...[...positions.values()].map(p=>p.y+p.h));
 for(const n of nodes.filter(n=>lane.get(n.id)==='final')){
  const parents=n.pair.filter(v=>v&&typeof v==='object'&&positions.has(v.id)),y=parents.length?parents.reduce((sum,v)=>sum+positions.get(v.id).y,0)/parents.length:top;
  positions.set(n.id,{x:PX+depth.get(n.id)*(W+DX),y,w:W,h:H+(active&&n.id===a.cursor?30:0)});bottom=Math.max(bottom,y+H);
 }
 const width=PX*2+(Math.max(...depth.values())+1)*W+Math.max(...depth.values())*DX,height=Math.max(480,bottom+60);
 let edges='';
 for(const n of nodes)for(const v of n.pair){
  if(!v||typeof v!=='object'||!positions.has(v.id))continue;
  const s=positions.get(v.id),t=positions.get(n.id);
  edges+=neonConnector(s.x+s.w,s.y+s.h/2,t.x,t.y+t.h/2,v.out==='l'?'loser':'');
 }
 const svg='<svg class="neon-connectors" viewBox="0 0 '+width+' '+height+'" aria-hidden="true">'+edges+'</svg>';
 const labels=(upperNodes.length?'<div class="neon-graph-label" style="left:'+PX+'px;top:24px">UPPER BRACKET</div>':'')+(lowerNodes.length?'<div class="neon-graph-label lower" style="left:'+PX+'px;top:'+(lowerTop-40)+'px">LOWER BRACKET</div>':'');
 return neonGraphFrame(title||'ПЛЕЙ-ОФФ · DOUBLE ELIMINATION',width,height,svg+labels+nodes.map(n=>neonMatchNode(n,a,active,positions.get(n.id))).join(''));
}
function neonStandings(a,ids,f,compact){
 const rows=ranks6(a,ids);
 return '<table class="neon-standings"><thead><tr><th>КОМАНДА</th><th>В–Н–П</th><th>КАРТЫ</th><th>О</th></tr></thead><tbody>'+rows.map((r,i)=>{
  const upper=f.lower12?4:f.lowerSplit8?2:f.size===4?2:4,lower=f.lower12?6:f.lowerSplit8?4:upper;
  return '<tr class="'+(r.id===S.club?'own-team ':'')+(i<upper?'advance-upper':i<lower?'advance-lower':'')+'"><td>'+miniClub21(r.id)+'</td><td>'+r.w+'–'+r.d+'–'+r.l+'</td><td>'+r.mf+':'+r.ma+'</td><td>'+r.points+'</td></tr>';
 }).join('')+'</tbody></table>';
}
function neonRoundRobin(a,f,active){
 return '<div class="neon-rr-groups">'+(a.groupIds||[]).map((ids,index)=>{
  const nodes=a.schedule.filter(n=>n.groupMatch&&n.group===index),rounds=new Map();
  for(const n of nodes){const round=+(n.label.match(/тур (\d+)/i)||[])[1]||1;if(!rounds.has(round))rounds.set(round,[]);rounds.get(round).push(n);}
  return '<section class="neon-group-panel"><div class="neon-group-title"><h3>ГРУППА '+String.fromCharCode(65+index)+'</h3><small>'+ids.length+' команд · BO'+f.bo+' · круговой этап</small></div><div class="neon-rr-layout"><div class="table-wrap">'+neonStandings(a,ids,f)+'</div><div class="neon-rr-rounds">'+[...rounds.entries()].map(([round,list])=>'<div class="neon-rr-round"><h4>ТУР '+round+'</h4>'+list.map(n=>neonInlineMatch(n,a,active)).join('')+'</div>').join('')+'</div></div><div class="neon-rr-legend">Лаймовая метка — посев в верхнюю сетку. Розовая — посев в нижнюю, если это предусмотрено регламентом. Итоговые места учитывают тай-брейки.</div></section>';
 }).join('')+'</div>';
}
function neonGroupStage(a,f,active){
 if(f.kind==='swiss')return neonSwissBoard(a,f,active);
 if(f.kind==='rr')return neonRoundRobin(a,f,active);
 if(f.kind==='gsl')return '<div class="neon-gsl-list">'+(a.gsl||[]).map((g,i)=>{
  const ids=new Set(g.ids),nodes=a.schedule.filter(n=>n.groupMatch&&n.pair.some(v=>typeof v==='number'&&ids.has(v)||v&&typeof v==='object'&&a.schedule[v.id]?.label.startsWith('GSL '+String.fromCharCode(65+i))));
  return '<section class="neon-group-panel"><div class="neon-group-title"><h3>ГРУППА '+String.fromCharCode(65+i)+' · GSL</h3><small>BO3 · два места в следующей стадии</small></div>'+neonPlayoffGraph(a,nodes,active,'ОТКРЫТИЕ → ПОБЕДИТЕЛИ / ВЫБЫВАНИЕ → РЕШАЮЩИЙ')+'</section>';
 }).join('')+'</div>';
 return '';
}
function neonBridge(a,key,active){
 let graph=a,nodes=a.schedule.filter(n=>!n.groupMatch&&!isPlayoffV1(n)),preview=false;
 if(!nodes.length&&(key==='blast'||key==='ti')){
  graph={schedule:[]};preview=true;const seed=seedLabel=>({seedLabel});
  if(key==='blast'){
   node6(graph,'BLAST · посев за полуфинал 1',[seed('A1'),seed('D1')]);
   node6(graph,'BLAST · посев за полуфинал 2',[seed('B1'),seed('C1')]);
   node6(graph,'BLAST · Last Chance 1',[seed('A2'),seed('D2')]);
   node6(graph,'BLAST · Last Chance 2',[seed('B2'),seed('C2')]);
  }else for(let i=0;i<5;i++)node6(graph,'TI · матч за выход '+(i+1),[seed('Место '+(4+i)),seed('Место '+(13-i))]);
  nodes=graph.schedule;
 }
 if(!nodes.length)return '';
 const note=key==='blast'?'Первые места GSL играют за прямой посев в полуфинал. Вторые места проходят Last Chance; затем — Double Elimination на 6 команд.':'Топ-3 Swiss проходят напрямую. Места 4–13 играют пять матчей за оставшиеся слоты плей-офф.';
 return '<div class="neon-format-note">'+note+(preview?' Участники займут слоты после предыдущего этапа.':'')+'</div>'+neonPlayoffGraph(graph,nodes,preview?false:active,key==='blast'?'BLAST · ПОСЕВ И LAST CHANCE':'TI · МАТЧИ ЗА ВЫХОД');
}
function neonDisplayEvent(e){
 const key=e.formatKey6||formatKey6(e),f=FORMAT6[key],live=S.active?.event===e.id?S.active:null;
 if(live)return {a:live,f,key,active:true,preview:false};
 const scheduled=Array.isArray(e.schedule6)&&e.schedule6.length;
 const ids=[...(e.entrants||e.qualified13?.slice(0,f.n)||[S.club,...S.teams.filter(t=>t.id!==S.club).slice(0,f.n-1).map(t=>t.id)])];
 while(ids.length<f.n)ids.push(-ids.length-1);
 const a={schedule:scheduled?e.schedule6:[],entrants:[...ids],seeds:e.seeds6||Object.fromEntries(ids.map((id,i)=>[id,100-i])),formatKey6:key,groupIds:e.groupIds6,gsl:e.gsl6,swissRound:scheduled?Math.max(0,...e.schedule6.map(n=>n.swissRound||0)):0,cursor:-1,stage6:e.done?'playoffs':'groups'};
 if(!scheduled){
  if(f.kind==='rr')roundRobin6(a,ids,f.size,f.bo);
  else if(f.kind==='gsl')gsl6(a);
  else if(f.kind==='swiss')swissRound6(a);
 }
 return {a,f,key,active:false,preview:!scheduled};
}
const overviewBeforeNeon=overviewGroups21;
overviewGroups21=function(e){
 if(!e)return overviewBeforeNeon(e);
 const view=neonDisplayEvent(e),a=view.a,f=view.f;
 const actual=!!(S.active?.event===e.id||e.done),groups=f.kind==='rr'?a.groupIds:f.kind==='gsl'?a.gsl?.map(g=>g.ids):[a.entrants];
 const lists=(groups||[]).map((ids,i)=>{
  const ranked=ranks6(a,ids),shown=f.kind==='swiss'||f.kind==='de'?ranked.slice(0,8):ranked;
  const title=f.kind==='swiss'?'SWISS · '+a.entrants.length+' КОМАНД':f.kind==='de'?'ПОСЕВ · DOUBLE ELIMINATION':(actual?'ГРУППА ':'ПОСЕВ ')+(actual?String.fromCharCode(65+i):i+1);
  return '<section class="group-card21"><div class="group-header21"><b>'+title+'</b><span>М</span><span>В</span><span>Н</span><span>П</span><span>О</span></div><div class="group-table21">'+shown.map(r=>'<div class="group-row21 '+(r.id===S.club?'own-club21':'')+'">'+miniClub21(r.id)+'<span>'+(r.w+r.d+r.l)+'</span><span>'+r.w+'</span><span>'+r.d+'</span><span>'+r.l+'</span><b>'+r.points+'</b></div>').join('')+'</div></section>';
 }).join('');
 const live=S.active?.event===e.id;
 return '<section class="tournament-board21"><div class="white-heading21"><span class="heading-photo-neon" aria-hidden="true">'+neonScene('city')+'</span><h1>'+esc(e.name)+'</h1><p>'+(live?esc(S.active.stage):e.done?'Итог турнира':'Подготовка к турниру')+'</p></div><div class="group-panels21">'+lists+'</div><div class="board-foot21"><small>'+(actual?(f.kind==='swiss'?'Показаны первые 8 мест. Все раунды — в полной сетке.':'Формат и таблицы текущего турнира.'):'Предварительный посев. Жеребьёвка участников ещё не проведена.')+'</small>'+btn('Полная сетка →','showBracket('+e.id+')')+'</div></section>';
};
const bracketBeforeNeon=bracketView;
bracketView=function(){
 const available=S.events,e=available.find(e=>e.id===(selectedBracket??S.active?.event))||available.find(e=>!e.done)||available.at(-1);
 if(!e)return bracketBeforeNeon();
 if((e.done||S.active?.event===e.id)&&e.format&&e.format!=='circuit-v6')return bracketBeforeNeon();
 const view=neonDisplayEvent(e),a=view.a,f=view.f;
 const tab=f.kind==='de'?'playoffs':bracketTabV1==='auto'||!['groups','playoffs'].includes(bracketTabV1)?(view.active&&a.stage6==='playoffs'||e.done?'playoffs':'groups'):bracketTabV1;
 const tabs=(f.kind!=='de'?btn('Групповой этап',"bracketTabV1='groups';render()",tab==='groups'):'')+btn('Плей-офф',"bracketTabV1='playoffs';render()",tab==='playoffs');
 let board='';
 if(tab==='groups')board=neonGroupStage(a,f,view.active)+neonBridge(a,view.key,view.active);
 else{
  const nodes=a.schedule.filter(isPlayoffV1);
  if(nodes.length)board=neonPlayoffGraph(a,nodes,view.active);
  else{
   const preview=playoffPreviewV1(view.key);
   board='<div class="neon-format-note">Схема плей-офф по регламенту турнира. Команды займут указанные слоты после завершения предыдущих этапов.</div>'+neonPlayoffGraph(preview,preview.schedule,false);
  }
 }
 return head('ТУРНИРНЫЙ ЦЕНТР',esc(e.name),view.active?esc(a.stage):e.done&&e.champion!=null?'Чемпион — '+esc(S.teams[e.champion].name):'Групповой этап и путь к чемпионству',view.active?btn('Мой матч →',"go('match')",true):'')+
 '<div class="neon-tournament-controls"><select aria-label="Турнир" onchange="selectedBracket=+this.value;bracketTabV1=\'auto\';NeonTournament.zoom=\'auto\';render()">'+available.map(v=>'<option value="'+v.id+'" '+(v.id===e.id?'selected':'')+'>'+esc(v.name)+'</option>').join('')+'</select><div class="neon-tournament-tabs">'+tabs+'</div></div>'+
 '<div class="neon-tournament-meta"><span class="tag">'+f.n+' КОМАНД</span><span class="tag">'+(f.kind==='swiss'?'SWISS':f.kind==='rr'?'КРУГОВЫЕ ГРУППЫ':f.kind==='gsl'?'GSL':'DOUBLE ELIMINATION')+'</span><span>Гранд-финал · BO5</span></div>'+
 (view.preview?'<div class="neon-format-note">Предварительная схема турнира. Посев и участники уточнятся при жеребьёвке; результаты не назначены.</div>':'')+
 board+'<details class="neon-format-details"><summary>Регламент и источник формата</summary><p>'+esc(f.label)+'</p><p>'+esc(f.note||'')+(e.pairingFallback?' Применён резервный посев в одном из раундов.':'')+'</p>'+(f.url?'<a href="'+f.url+'" target="_blank" rel="noopener">Источник формата ↗</a>':'')+'</details>'+
 (view.active?restPanel6():'');
};
