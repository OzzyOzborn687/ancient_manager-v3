'use strict';

const AM_RATING_KEYS = ['lane', 'mechanics', 'teamfight', 'macro', 'decisions', 'versatility'];
const AM_RATING_LABELS = ['Линия', 'Механика', 'Командный бой', 'Макро', 'Игровые решения', 'Пул героев'];
const AM_RATING_WEIGHTS = [[.20, .23, .22, .15, .15, .05], [.13, .15, .28, .21, .18, .05]];
// OpenDota, 2025-05-01 through 2026-11-12. Rows follow positions 1 through 5.
const AM_RATING_SEEDS = [
 {club:'TS', maps:45, pairs:[337,68,147,391,68,137,337,59,68,137], players:[
  ['Yatoro',321580662,'UA','ru',401,86.51871048,[84.8,87.4,85,86.9,85.7,97.4]],
  ['Larl',106305042,'RU','ru',337,85.23776837,[83.3,85.7,84.4,84.4,85.6,96]],
  ['Batyuk',140835095,'UA','ru',348,87.01671910,[85.7,89.7,85.9,87.3,84.5,96.8]],
  ['not me',218231587,'RU','ru',262,85.89115731,[83.6,88.2,84.6,88.3,82.2,95.6]],
  ['rue',847565596,'RU','ru',391,85.11080407,[83.8,87.4,85.4,79.8,86.7,96.5]]
 ]},
 {club:'XG', maps:15, pairs:[139,23,125,23,15,240,15,23,125,23], players:[
  ['Ame',898754153,'CN','zh',394,85.85384293,[85.2,85.6,84.3,86.4,84.9,97.4]],
  ['Xm',137129583,'CN','zh',331,85.65023545,[86.7,84.7,84.1,85.2,85,95.4]],
  ['zeal',147767183,'MY',null,235,84.28980543,[83,83.3,84,84.3,83.3,96.1]],
  ['XinQ',157475523,'CN','zh',248,84.92417641,[84.7,86,86.4,78.3,86.6,95.9]],
  ['BoBoKa',207829314,'CN','zh',283,84.68925854,[87.1,85.4,84.7,79.1,85.2,97.7]]
 ]}
];
const AM_SEED_BY_NAME = new Map(AM_RATING_SEEDS.flatMap(group =>
 group.players.map(row => [nameKey4(row[0]), row])));
const AM_COUNTRY_CODES = {'Россия':'RU','Китай':'CN','Украина':'UA','Малайзия':'MY'};
const AM_LANGUAGES = {RU:'ru', CN:'zh'};
const amRatingNumber = new Intl.NumberFormat('ru-RU',{minimumFractionDigits:1,maximumFractionDigits:1});
function amWeightedRating(values,role){
 const weights=AM_RATING_WEIGHTS[role<2?0:1];
 return values.reduce((total,value,i)=>total+value*weights[i],0);
}
function amPlayerRating(p){
 if(p.amRating)return p.amRating;
 const seed=p.fiction?null:AM_SEED_BY_NAME.get(nameKey4(p.name));
 const values=seed?seed[6].slice():AM_RATING_KEYS.map(()=>p.skill);
 const initial=seed&&S.amRatingHistory?.seedRatings?seed[5]:p.skill;
 p.skill=initial;
 p.potential=Math.max(initial,p.potential??initial);
 return p.amRating={values,offset:initial-amWeightedRating(values,p.role),focus:null,maps:seed?.[4]??0,initial};
}
function amPairKeys(ids){
 return ids.flatMap((a,i)=>ids.slice(i+1).map(b=>[a,b].sort((x,y)=>x-y).join(':')));
}
function amLineupKey(ids){return ids.slice().sort((a,b)=>a-b).join(':');}
function amRatingHistory(seedRatings=false){
 if(S.amRatingHistory)return S.amRatingHistory;
 const history=S.amRatingHistory={seedRatings,pairs:{},lineups:{}};
 for(const group of AM_RATING_SEEDS){
  const players=group.players.map(row=>S.players.find(p=>!p.fiction&&nameKey4(p.name)===nameKey4(row[0])));
  if(players.some(p=>!p))continue;
  const ids=players.map(p=>p.id);
  history.lineups[amLineupKey(ids)]=group.maps;
  amPairKeys(ids).forEach((key,i)=>{history.pairs[key]=group.pairs[i];});
 }
 return history;
}
function amSynergy(players){
 const history=amRatingHistory();
 if(players.length!==5)return {score:75,language:0,pairs:0,lineup:0,maps:0};
 const ids=players.map(p=>p.id);
 const pairKeys=amPairKeys(ids);
 const identity=players.map(p=>{
  const seed=p.fiction?null:AM_SEED_BY_NAME.get(nameKey4(p.name));
  const listed=p.profile13?.country??bio20(p)?.country;
  const country=seed?.[2]??AM_COUNTRY_CODES[listed]??listed;
  return {country,language:seed?.[3]??AM_LANGUAGES[country]};
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
  history.lineups[key]=(history.lineups[key]??0)+1;
  for(const pair of amPairKeys(ids))history.pairs[pair]=(history.pairs[pair]??0)+1;
 }
};
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
 return base*(1+clamp((m.amSynergy[side].score-75)*.0012,-.03,.03));
};

function amChangeFocus(id,focus){
 const p=S.players[id];
 if(!p||p.team!==S.club||p.retired||locked()||(focus&&!AM_RATING_KEYS.includes(focus)))return;
 amPlayerRating(p).focus=focus||null;
 render();
}
function amPlayerCard(p,detail=false){
 const rating=amPlayerRating(p),photo=photo20(p);
 const localPhoto=p.name==='Ame'&&!p.fiction?'assets/neon/players/ame.webp':photo;
 const format=value=>amRatingNumber.format(value);
 const change=(rating.recent??[]).filter(entry=>entry[0]>=S.day-30).reduce((total,entry)=>total+entry[1],0);
 const controls=detail&&p.team===S.club&&!p.retired
  ?'<label>Фокус тренировки <select '+(locked()?'disabled ':'')+'onchange="amChangeFocus('+p.id+',this.value)"><option value="">План команды</option>'+
   AM_RATING_KEYS.map((key,i)=>'<option value="'+key+'" '+(rating.focus===key?'selected':'')+'>'+AM_RATING_LABELS[i]+'</option>').join('')+'</select></label>'
  :'';
 return '<article class="panel am-player-card"><div class="am-card-head">'+
  (localPhoto?'<img src="'+esc(localPhoto)+'" alt="" loading="lazy">':'')+
  '<div><span class="sub">'+esc(ROLES[p.role]??'Игрок')+'</span><h3>'+esc(p.name)+'</h3></div>'+
  '<strong>'+format(p.skill)+' <small>OVR</small></strong></div>'+
  '<dl>'+rating.values.map((value,i)=>'<div><dt>'+AM_RATING_LABELS[i]+'</dt><dd>'+format(value)+'</dd></div>').join('')+'</dl>'+
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
