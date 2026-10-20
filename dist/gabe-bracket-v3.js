function restPanel6(){return '';}
function gabeCrest(id){
  if(id==null||!Number.isInteger(id))return '<span class="gabe-unknown">?</span>';
  let t=S.teams[id];
  if(typeof clubAvatar12==='function')return clubAvatar12(t,true);
  return '<span class="gabe-crest">'+esc(t.short||'?')+'</span>';
}
function gabeMatchBox(n,a,active){
  let pair=n.pair.map(v=>resolve6(a,v));
  let live=active&&n.id===a.cursor;
  let sc=n.score||(live&&a.score?a.score.join(':'):null);
  let scores=sc?sc.split(':').map(Number):[null,null];
  let w=n.w;
  return '<div class="gabe-match '+(live?'gabe-live ':'')+(n.championship?'gabe-final':'')+'">'+ 
    '<div class="gabe-match-head">'+esc(n.label)+' · BO'+n.bo+'</div>'+
    '<div class="gabe-side '+(w!=null&&w===pair[0]?'gabe-winner ':'')+(pair[0]===S.club?'gabe-own':'')+'">'+ 
      gabeCrest(pair[0])+
      '<span class="gabe-name">'+(pair[0]==null?'Ожидание':esc(S.teams[pair[0]]?.short||S.teams[pair[0]]?.name||'?'))+'</span>'+
      '<b class="gabe-sc">'+(scores[0]!=null?scores[0]:'–')+'</b>'+
    '</div>'+
    '<div class="gabe-side '+(w!=null&&w===pair[1]?'gabe-winner ':'')+(pair[1]===S.club?'gabe-own':'')+'">'+ 
      gabeCrest(pair[1])+
      '<span class="gabe-name">'+(pair[1]==null?'Ожидание':esc(S.teams[pair[1]]?.short||S.teams[pair[1]]?.name||'?'))+'</span>'+
      '<b class="gabe-sc">'+(scores[1]!=null?scores[1]:'–')+'</b>'+
    '</div>'+
    (live?'<button class="gabe-play" onclick="go(\'match\')">Играть →</button>':'')+
  '</div>';
}
function gabeSwissBoard(a,active){
  let rows=ranks6(a);
  let buckets={};
  for(let r of rows){let key=r.w+'-'+r.l;(buckets[key]=buckets[key]||[]).push(r);}
  let order=['0-0','1-0','0-1','2-0','1-1','0-2','3-0','2-1','1-2','0-3','3-1','2-2','1-3','3-2','2-3'];
  let cols=order.filter(k=>buckets[k]&&buckets[k].length).map(k=>{
    let list=buckets[k];
    let tag='';
    if(list.every(r=>r.w>=3)&&!list.some(r=>r.l>=3))tag='QUALIFIED';
    if(list.every(r=>r.l>=3))tag='ELIMINATED';
    let done=a.schedule.filter(n=>n.groupMatch&&n.score).filter(n=>{
      let p=n.pair.map(v=>resolve6(a,v));
      return p.some(id=>list.some(r=>r.id===id));
    }).slice(-Math.max(2,list.length));
    return '<div class="gabe-col">'+
      '<div class="gabe-col-head '+(tag==='QUALIFIED'?'gabe-qual':tag==='ELIMINATED'?'gabe-elim':'')+'">'+(tag||k)+'</div>'+
      '<div class="gabe-col-body">'+
        list.map(r=>'<div class="gabe-team-row '+(r.id===S.club?'gabe-own':'')+'">'+gabeCrest(r.id)+'<span>'+esc(S.teams[r.id].short)+'</span><b>'+r.w+'-'+r.l+'</b></div>').join('')+
        done.map(n=>gabeMatchBox(n,a,active)).join('')+
      '</div></div>';
  }).join('');
  let pending=a.schedule.filter(n=>n.groupMatch&&!n.score&&n.swissRound===a.swissRound);
  let pendingHtml=pending.length?'<div class="gabe-pending"><div class="gabe-col-head">ТЕКУЩИЙ РАУНД</div>'+pending.map(n=>gabeMatchBox(n,a,active)).join('')+'</div>':'';
  return '<div class="gabe-swiss"><div class="gabe-swiss-scroll">'+cols+'</div>'+pendingHtml+'</div>';
}
function gabePlayoffBoard(a,active){
  let playoff=a.schedule.filter(n=>!n.groupMatch);
  let stages={};
  for(let n of playoff){
    let key=n.label.replace(/ \d+$/,'');
    if(n.championship)key='Гранд-финал';
    (stages[key]=stages[key]||[]).push(n);
  }
  for(let k of Object.keys(stages)){
    stages[k].sort((x,y)=>{
      let nx=+(String(x.label).match(/(\d+)\s*$/)||[])[1]||0;
      let ny=+(String(y.label).match(/(\d+)\s*$/)||[])[1]||0;
      return nx-ny||x.id-y.id;
    });
  }
  let order=[
    'Верхняя сетка · четвертьфинал','Верхняя сетка · полуфинал','Финал верхней сетки',
    'Нижняя сетка · раунд 1','Нижняя сетка · раунд 2','Нижняя сетка · раунд 3',
    'Полуфинал нижней сетки','Финал нижней сетки','Гранд-финал',
    'BLAST · посев за полуфинал','BLAST · Last Chance','TI · матч за выход'
  ];
  function stageRank(k){
    let i=order.findIndex(o=>k===o||k.startsWith(o)||o.startsWith(k));
    return i<0?99:i;
  }
  let keys=Object.keys(stages).sort((a,b)=>stageRank(a)-stageRank(b)||a.localeCompare(b));
  let upper=keys.filter(k=>/верхн|посев|Upper|Финал верхней/i.test(k)&&!/нижн/i.test(k));
  let lower=keys.filter(k=>/нижн|Last Chance|вылет|TI ·/i.test(k));
  let finals=keys.filter(k=>/Гранд|grand/i.test(k));
  function lane(title,ks){
    if(!ks.length)return '';
    return '<div class="gabe-lane"><div class="gabe-lane-title">'+esc(title)+'</div><div class="gabe-lane-stages">'+ks.map(k=>'<div class="gabe-stage"><div class="gabe-stage-head">'+esc(k)+'</div>'+stages[k].map(n=>gabeMatchBox(n,a,active)).join('')+'</div>').join('')+'</div></div>';
  }
  return '<div class="gabe-playoffs">'+lane('UPPER BRACKET',upper)+lane('LOWER BRACKET',lower)+lane('GRAND FINALS',finals)+'</div>';
}
function gabeGroupBoard(a,active){
  if(a.groupIds){
    return '<div class="gabe-groups">'+a.groupIds.map((ids,i)=>'<div class="gabe-col"><div class="gabe-col-head">Группа '+String.fromCharCode(65+i)+'</div><div class="gabe-col-body">'+ranks6(a,ids).map(r=>'<div class="gabe-team-row '+(r.id===S.club?'gabe-own':'')+'">'+gabeCrest(r.id)+'<span>'+esc(S.teams[r.id].short)+'</span><b>'+r.w+'-'+r.d+'-'+r.l+'</b></div>').join('')+'</div></div>').join('')+'</div>';
  }
  return gabeSwissBoard(a,active);
}

bracketView=function(){
  let available=S.events.filter(e=>e.done||e.id===S.active?.event);
  let e=available.find(e=>e.id===(selectedBracket??S.active?.event))||available.at(-1);
  if(!e||e.format!=='circuit-v6')return bracketLegacy6();
  let active=S.active?.event===e.id?S.active:null;
  let a=active||{schedule:e.schedule6||[],seeds:e.seeds6,entrants:e.entrants,groupIds:e.groupIds6,gsl:e.gsl6,swissRound:0,cursor:-1};
  let f=format6(e);
  let board='';
  if(a.stage6==='playoffs'||(a.schedule||[]).some(n=>!n.groupMatch)||f.kind==='de'){
    board=gabePlayoffBoard(a,active);
    if((a.schedule||[]).some(n=>n.groupMatch)) board=gabeGroupBoard(a,active)+board;
  } else {
    board=gabeGroupBoard(a,active);
  }
  return head('ТУРНИРНЫЙ ЦЕНТР',e.name,active?active.stage:(e.champion!=null?'Чемпион — '+S.teams[e.champion].name:'Сетка'),active?btn('Мой матч →',"go('match')",true):'')+
    '<div class="filters"><select aria-label="Турнир" onchange="selectedBracket=+this.value;render()">'+
    available.map(v=>'<option value="'+v.id+'" '+(v.id===e.id?'selected':'')+'>'+esc(v.name)+'</option>').join('')+
    '</select></div>'+
    '<section class="panel gabe-reg"><h2>Регламент</h2><p>'+f.label+'</p><p class="sub">'+f.note+(e.pairingFallback?' В одном из раундов применён резервный посев.':'')+'</p>'+
    (f.url?'<a href="'+f.url+'" target="_blank" rel="noopener">Источник формата ↗</a>':'')+'</section>'+
    '<div class="gabe-board">'+board+'</div>'+restPanel6();
};

/* Series / map report: player photos instead of hero icons */
report=function(i){
  let h=S.history[i],oppName=h.opponent;
  let oppTeam=S.teams.find(t=>t.short===oppName||t.name===oppName);
  function playerBlock(players){
    return (players||[]).map(p=>{
      let pl=S.players.find(x=>typeof nameKey4==='function'&&nameKey4(x.name)===nameKey4(p.name));
      let photo=(typeof portrait20==='function'&&pl)?portrait20(pl):'<span class="portrait20"></span>';
      return '<div class="gabe-player-row">'+photo+'<b>'+esc(p.name)+'</b><span class="gabe-kda">'+(p.k||0)+'-'+(p.d||0)+'-'+(p.a||0)+'</span></div>';
    }).join('')||'<div class="gabe-player-row"><b>—</b></div>';
  }
  let mapsHtml=(h.maps||[]).map((m,j)=>{
    let own=m.players||[];
    let enemy=m.enemyPlayers||m.enemy||[];
    return '<div class="round"><strong>Карта '+(j+1)+' · '+(m.win?'Победа':'Поражение')+'</strong>'+
      '<p>'+(m.duration||Math.round((m.durationSec||0)/60)||'?')+' мин · '+(m.kills||0)+':'+(m.deaths||0)+'</p>'+
      '<div class="gabe-series-result">'+
        '<div class="gabe-series-team">'+(typeof clubAvatar12==='function'?clubAvatar12(my()):'')+'<h3>'+esc(my().name)+'</h3>'+playerBlock(own)+'</div>'+
        '<div class="gabe-series-score">'+(m.win?'1':'0')+' – '+(m.win?'0':'1')+'<small>КАРТА</small></div>'+
        '<div class="gabe-series-team">'+(oppTeam&&typeof clubAvatar12==='function'?clubAvatar12(oppTeam):'')+'<h3>'+esc(oppName)+'</h3>'+playerBlock(enemy)+'</div>'+
      '</div></div>';
  }).join('');
  openModal('<h2>'+esc(my().name)+' — '+esc(oppName)+'</h2><div class="gabe-series-score" style="font-size:36px;margin:8px 0">'+(h.score||[]).join(' – ')+'<small>СЕРИЯ</small></div>'+mapsHtml+'<div class="actions">'+btn('Закрыть','closeModal()')+'</div>');
};
