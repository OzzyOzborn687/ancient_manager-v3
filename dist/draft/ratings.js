'use strict';

const AM_RATING_KEYS = ['lane', 'mechanics', 'teamfight', 'macro', 'decisions', 'versatility'];
const AM_RATING_LABELS = ['Линия', 'Механика', 'Командный бой', 'Макро', 'Игровые решения', 'Пул героев'];
const AM_RATING_WEIGHTS = [[.20, .23, .22, .15, .15, .05], [.13, .15, .28, .21, .18, .05]];
const AM_SEED_BY_NAME = new Map(AM_OPEN_DOTA_ROWS.map(row => [nameKey4(row[0]), row]));
const AM_LEGACY_LANGUAGE = new Map(AM_OPEN_DOTA_ROWS.slice(0,10)
 .filter(row=>row[0]!=='zeal').map((row,i)=>[nameKey4(row[0]),i<4?'zh':'ru']));
const amRatingNumber = new Intl.NumberFormat('ru-RU',{minimumFractionDigits:1,maximumFractionDigits:1});
function amWeightedRating(values,role){
 const weights=AM_RATING_WEIGHTS[role<2?0:1];
 return values.reduce((total,value,i)=>total+value*weights[i],0);
}
function amPlayerRating(p){
 const previous=p.amRating;
 const seed=p.fiction?null:AM_SEED_BY_NAME.get(nameKey4(p.name));
 if(previous&&(!seed||previous.maps))return previous;
 const values=seed?seed[4].map((value,i)=>clamp(value+(previous?previous.values[i]-previous.initial:0),40,99)):
  AM_RATING_KEYS.map(()=>p.skill);
 const initial=seed&&!previous&&S.amRatingHistory?.seedRatings?seed[3]:p.skill;
 p.skill=initial;
 p.potential=Math.max(initial,p.potential??initial);
 return p.amRating={...previous,values,offset:initial-amWeightedRating(values,p.role),focus:previous?.focus??null,maps:seed?.[2]??0,initial};
}
function amPairKeys(ids){
 return ids.flatMap((a,i)=>ids.slice(i+1).map(b=>[a,b].sort((x,y)=>x-y).join(':')));
}
function amLineupKey(ids){return ids.slice().sort((a,b)=>a-b).join(':');}
function amRatingHistory(seedRatings=false){
 const existing=S.amRatingHistory;
 if(existing?.version===2)return existing;
 const history=existing??{seedRatings,pairs:{},lineups:{}};
 const idsByName=new Map(S.players.filter(p=>!p.fiction).map(p=>[nameKey4(p.name),p.id]));
 const ids=AM_OPEN_DOTA_ROWS.map(row=>idsByName.get(nameKey4(row[0])));
 const isLegacyPair=(a,b)=>(a<5&&b<5)||(a>=5&&a<10&&b>=5&&b<10);
 for(let i=0;i<AM_OPEN_DOTA_PAIRS.length;i+=3){
  const [a,b,maps]=AM_OPEN_DOTA_PAIRS.slice(i,i+3);
  if(ids[a]==null||ids[b]==null||(existing&&isLegacyPair(a,b)))continue;
  const key=amLineupKey([ids[a],ids[b]]);
  history.pairs[key]=(history.pairs[key]??0)+maps;
 }
 for(const [a,b,c,d,e,maps] of AM_OPEN_DOTA_LINEUPS){
  if(existing&&(a===0&&e===4||a===5&&e===9))continue;
  const lineup=[a,b,c,d,e].map(i=>ids[i]);
  if(lineup.some(id=>id==null))continue;
  const key=amLineupKey(lineup);
  history.lineups[key]=(history.lineups[key]??0)+maps;
 }
 history.version=2;
 return S.amRatingHistory=history;
}
function amSynergy(players){
 const history=amRatingHistory();
 if(players.length!==5)return {score:75,language:0,pairs:0,lineup:0,maps:0};
 const ids=players.map(p=>p.id);
 const pairKeys=amPairKeys(ids);
 const identity=players.map(p=>{
  const country=p.profile13?.country??bio20(p)?.country;
  return {country,language:p.fiction?null:AM_LEGACY_LANGUAGE.get(nameKey4(p.name))};
 });
 const communications=identity.reduce((sum,a,i)=>sum+identity.slice(i+1).filter(b=>
  (a.country&&a.country===b.country)||(a.language&&a.language===b.language)).length,0);
 const pairMaps=pairKeys.map(key=>history.pairs[key]??0);
 const maps=history.lineups[amLineupKey(ids)]??0;
 const language=communications;
 const pairs=2.5*pairMaps.reduce((sum,n)=>sum+Math.min(1,Math.log1p(n)/Math.log1p(50)),0);
 const lineup=15*Math.min(1,Math.log1p(maps)/Math.log1p(50));
 return {score:50+language+pairs+lineup,language,pairs,lineup,maps};
}

let amStartingFresh=false;
const amFreshBase=fresh;
fresh=function(...args){
 amStartingFresh=true;
 try{return amFreshBase(...args);}finally{amStartingFresh=false;}
};
const amInitBase=init13;
init13=function(){
 amInitBase();
 if(!S)return;
 amRatingHistory(amStartingFresh);
 for(const player of S.players)amPlayerRating(player);
};
const amGrowthBase=playerGrowth13;
playerGrowth13=function(p,mode,facility,focus){
 const rating=amPlayerRating(p), before=p.skill;
 const selected=rating.focus??(focus==='teamwork'?'teamfight':focus);
 const index=AM_RATING_KEYS.indexOf(selected);
 amGrowthBase(p,mode,facility,selected==='teamfight'?'teamwork':selected);
 if(index<0||p.skill<=before)return;
 const previousWeighted=amWeightedRating(rating.values,p.role);
 const expected=Math.min(p.potential,previousWeighted+rating.offset);
 if(Math.abs(before-expected)>1e-8)rating.offset=before-previousWeighted;
 const recent=rating.recent??=[];
 while(recent.length&&recent[0][0]<S.day-30)recent.shift();
 const weight=AM_RATING_WEIGHTS[p.role<2?0:1][index];
 const officialRecently=S.day-(p.progress21.lastOfficialDay??-Infinity)<=21;
 const modifier=(selected==='teamfight'||selected==='macro')?(officialRecently?.95:.4):selected==='decisions'?.65:1;
 rating.values[index]=clamp(rating.values[index]+(p.skill-before)*modifier/weight,40,99);
 p.skill=Math.min(p.potential,amWeightedRating(rating.values,p.role)+rating.offset);
 if(p.skill>before)recent.push([S.day,p.skill-before]);
};
const amResultBase=resultImpact13;
resultImpact13=function(m){
 const count=!m.careerResult13&&m.scope13!=='scrim';
 amResultBase(m);
 if(!count)return;
 const history=amRatingHistory(), counted=new Set();
 for(const side of m.sides){
  const ids=side.heroes.map(p=>p.playerId13);
  if(ids.length!==5||!ids.every(Number.isInteger)||new Set(ids).size!==5)continue;
  const key=amLineupKey(ids);
  if(counted.has(key))continue;
  counted.add(key);
  amRecordLineup(ids,1,history);
 }
};
function amRecordLineup(ids,maps,history=amRatingHistory()){
 if(ids.length!==5||new Set(ids).size!==5||!ids.every(Number.isInteger))return;
 const key=amLineupKey(ids);
 history.lineups[key]=(history.lineups[key]??0)+maps;
 for(const pair of amPairKeys(ids))history.pairs[pair]=(history.pairs[pair]??0)+maps;
}
function amSynergyFactor(score){return 1+clamp((score-75)*.0012,-.03,.03);}
const amMakeMapBase=makeLive4;
makeLive4=function(...args){
 const m=amMakeMapBase(...args);
 if(m.modelVersion===8){
  m.amSynergy=m.sides.map(side=>amSynergy(side.heroes.map(hero=>S.players[hero.playerId13]).filter(Boolean)));
  m.initialChance=positionScore4(m);
 }
 return m;
};
const amCareerFactorBase=Match8.careerFactor;
Match8.careerFactor=function(m,p){
 const base=amCareerFactorBase.call(this,m,p);
 if(!m.amSynergy)return base;
 const side=m.sides.findIndex(s=>s.heroes.includes(p));
 return base*amSynergyFactor(m.amSynergy[side].score);
};

function amChangeFocus(id,focus){
 const p=S.players[id];
 if(!p||p.team!==S.club||p.retired||locked()||(focus&&!AM_RATING_KEYS.includes(focus)))return;
 amPlayerRating(p).focus=focus||null;
 render();
}
function amPlayerCard(p,detail=false){
 const rating=amPlayerRating(p);
 const format=value=>amRatingNumber.format(value);
 const change=(rating.recent??[]).filter(entry=>entry[0]>=S.day-30).reduce((total,entry)=>total+entry[1],0);
 const controls=detail&&p.team===S.club&&!p.retired
  ?'<label>Фокус тренировки <select '+(locked()?'disabled ':'')+'onchange="amChangeFocus('+p.id+',this.value)"><option value="">План команды</option>'+
   AM_RATING_KEYS.map((key,i)=>'<option value="'+key+'" '+(rating.focus===key?'selected':'')+'>'+AM_RATING_LABELS[i]+'</option>').join('')+'</select></label>'
  :'';
 return '<article class="panel am-player-card arena-player-card"><div class="am-card-head">'+
  portrait20(p)+
  '<div><span class="sub">'+esc(ROLES[p.role]??'Игрок')+'</span><h3>'+esc(p.name)+'</h3></div>'+
  '<strong>'+format(p.skill)+' <small>OVR</small></strong></div>'+
  '<dl>'+rating.values.map((value,i)=>'<div><dt>'+AM_RATING_LABELS[i]+'</dt><dd>'+format(value)+'</dd><span aria-hidden="true" class="arena-skill-track"><i style="width:'+clamp(value)+'%"></i></span></div>').join('')+'</dl>'+
  '<p class="sub">'+(rating.maps?'OpenDota · '+rating.maps+' карт':'Стартовый рейтинг игры')+'</p>'+
  (detail?'<p>Потенциал '+format(p.potential)+' · За 30 дней '+(change>=0?'+':'')+format(change)+'</p>':btn('Профиль','profile('+p.id+')'))+controls+'</article>';
}
function amTeamCard(team){
 const players=roster(team);
 if(players.length!==5)return '';
 const d=amSynergy(players),f=value=>amRatingNumber.format(value);
 return '<section class="panel am-team-rating"><div class="section-head"><h2>'+esc(team.name)+'</h2></div>'+
  '<div class="am-team-metrics"><strong>'+f(avg(players.map(p=>p.skill)))+' <small>OVR</small></strong>'+
  '<strong>'+f(d.score)+' <small>SIN</small></strong></div>'+
  '<p class="sub">Общение +'+f(d.language)+' · Опыт пар +'+f(d.pairs)+' · Опыт пятёрки +'+f(d.lineup)+' · Совместных карт '+d.maps+'</p></section>';
}
const amSquadBase=squad;
squad=function(...args){
 return amTeamCard(my())+'<section class="am-player-grid" aria-label="Карточки игроков">'+roster().map(p=>amPlayerCard(p)).join('')+'</section>'+amSquadBase(...args);
};
const amPlayerViewBase=playerView20;
playerView20=function(...args){
 const player=S.players[selectedPlayer20];
 return amPlayerViewBase(...args)+(player?amPlayerCard(player,true):'');
};
