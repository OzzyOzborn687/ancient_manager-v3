'use strict';
// V9 presentation state lives outside the saved career. All actions use existing entry points.
const Interface9={
 resultsSeen:new Set(), lastPage:null, motion:true, timer:null, introTimer:null, enterTimer:null, scene:0, layer:0, selectedFrom:null,
 groups:[
  {id:'home',label:'Главная',pages:['home','menu21']},
  {id:'match',label:'Матч-центр',pages:['match','history','pools','model']},
  {id:'squad',label:'Команда',pages:['squad','growth9','tactics','bootcamp','practice']},
  {id:'market',label:'Трансферы',pages:['market','players','reshuffles']},
  {id:'calendar',label:'Турниры',pages:['calendar','qualifiers','bracket','ranking','scene5']},
  {id:'news60a',label:'Новости',pages:['news60a','monthly60b']},
  {id:'finance',label:'Клуб',pages:['finance','sponsors','services8','development','trophies','clubs','clubProfile','settings','saves','patch']}
 ],
 group(key=page){return this.groups.find(g=>g.pages.includes(key))||(key==='player'?this.groups.find(g=>g.id===this.selectedFrom)||this.groups[2]:this.groups[6]);},
 title(key){return ({home:'Обзор',tactics:'Тренировки и тактика',growth9:'Развитие OVR',development:'База и штаб',scene5:'Клубы и регионы',monthly60b:'Итоги месяца',news60a:'Общая лента'})[key]||PAGES.find(p=>p[0]===key)?.[2]||'Клуб';},
 init(){
  if(!document.body?.classList||!document.createElement||typeof document.querySelector!=='function')return;
  if(document.getElementById('v9Backdrop'))return;
  try{this.motion=localStorage.getItem('ancient-v9-motion')!=='off';}catch(_){}
  const bg=document.createElement('div');bg.id='v9Backdrop';bg.setAttribute('aria-hidden','true');
  bg.innerHTML='<img class="is-visible" src="v9/assets/scene0.webp" alt="" decoding="async"><img src="v9/assets/scene1.webp" alt="" decoding="async"><div></div>';
  document.body.prepend(bg);
  const credits=document.createElement('a');credits.id='v9PhotoCredit';credits.href='v9/assets/ATTRIBUTION.md';credits.target='_blank';credits.rel='noopener';credits.textContent='PHOTO: Watbe / xReDeYe / a.canvas.of.light';document.body.append(credits);
  document.addEventListener('visibilitychange',()=>this.background());
  this.media=window.matchMedia?.('(prefers-reduced-motion: reduce)');this.media?.addEventListener?.('change',()=>this.background());
  document.body.classList.add('v9','v9-intro');this.introTimer=setTimeout(()=>document.body.classList.remove('v9-intro'),1500);
  this.background();
 },
 background(){
  if(this.timer!==null){clearInterval(this.timer);this.timer=null;}
  const off=!this.motion||!!this.media?.matches;document.body?.classList.toggle('v9-motion-off',off);
  document.body?.classList.toggle('v9-background-paused',!!document.hidden);
  if(off||document.hidden)return;
  this.timer=setInterval(()=>{
   const imgs=document.querySelectorAll('#v9Backdrop>img');if(imgs.length!==2)return;
   this.scene=(this.scene+1)%4;const next=1-this.layer;imgs[next].src='v9/assets/scene'+this.scene+'.webp';
   // Keep the current photo until the replacement is decoded; failed assets never blank the page.
   Promise.resolve(imgs[next].decode?.()).then(()=>{if(document.hidden||!this.motion||this.media?.matches)return;imgs[next].classList.add('is-visible');imgs[this.layer].classList.remove('is-visible');this.layer=next;}).catch(()=>{});
  },9000);
 },
 toggleMotion(){this.motion=!this.motion;try{localStorage.setItem('ancient-v9-motion',this.motion?'on':'off');}catch(_){}this.background();this.shell();},
 navigate(destination){go(destination);},
 shell(){
  const group=this.group(),nav=$('nav');
  const signature=page+'|'+this.motion;
  if(nav.dataset.v9Signature!==signature||!nav.querySelector('.v9-primary')){nav.dataset.v9Signature=signature;
   nav.innerHTML='<a class="v9-brand" href="#" onclick="go(\'home\');return false">ANCIENT<br>MANAGER<small>DOTA 2 / CLUB MANAGEMENT</small></a><div class="v9-primary">'+this.groups.map(g=>'<button type="button" '+(g===group?'aria-current="page"':'')+' onclick="go(\''+g.id+'\')">'+g.label+'</button>').join('')+'</div><div class="v9-utilities"><button onclick="go(\'menu21\')">Все разделы</button><button onclick="go(\'saves\')">Сохранения</button><button onclick="go(\'settings\')">Настройки</button><button type="button" aria-pressed="'+this.motion+'" onclick="Interface9.toggleMotion()">Анимации: '+(this.motion?'вкл.':'выкл.')+'</button><small>V9.0 BETA</small></div>';
  }
  let header=document.getElementById('v9Header');if(!header){header=document.createElement('header');header.id='v9Header';document.querySelector('.workspace21>main').prepend(header);}
  const keys=[...group.pages,...(group===this.groups[6]?PAGES.map(p=>p[0]).filter(k=>!this.groups.some(g=>g.pages.includes(k))):[])].filter(k=>k==='growth9'||PAGES.some(p=>p[0]===k));
  const html='<div class="v9-context"><span>'+esc(my().name)+' / '+group.label+'</span><span>'+esc(date(S.day))+' · '+esc(cash(S.budget))+'</span><button class="v9-day" type="button" onclick="advance()" '+($('advance').disabled?'disabled':'')+'>'+esc($('advance').textContent)+'</button></div><nav class="v9-subnav" aria-label="Вкладки раздела '+group.label+'">'+keys.map(k=>'<button type="button" '+(page===k?'aria-current="page"':'')+' onclick="go(\''+k+'\')">'+esc(this.title(k))+'</button>').join('')+'</nav>';
  if(header.innerHTML!==html){header.innerHTML=html;const current=header.querySelector('[aria-current=page]');if(current){const rail=current.parentElement;rail.scrollLeft=Math.max(0,current.offsetLeft-rail.offsetLeft-rail.clientWidth/2+current.clientWidth/2);}}
  const mobile=$('mobileNav33c');if(mobile){mobile.innerHTML=this.groups.map(g=>'<button '+(g===group?'aria-current="page"':'')+' onclick="go(\''+g.id+'\')">'+g.label+'</button>').join('');mobile.style.gridTemplateColumns='none';const current=mobile.querySelector('[aria-current=page]');if(current)mobile.scrollLeft=Math.max(0,current.offsetLeft-mobile.clientWidth/2+current.clientWidth/2);}
  const oldHeader=$('matchdayHeader6');if(oldHeader){oldHeader.hidden=true;oldHeader.setAttribute('aria-hidden','true');}
  const badge=document.querySelector('.version-badge21');if(badge)badge.textContent='ANCIENT MANAGER / V9.0 BETA';
 },
 decorate(){
  if(!S||typeof document.querySelector!=='function'||!document.body?.classList)return;
  this.init();this.shell();
  const app=$('app');app.classList.add('v9-view');document.body.dataset.v9Group=this.group().id;
  for(const el of app.querySelectorAll(':scope>.g6-context'))el.remove();
  if(page==='settings')app.insertAdjacentHTML('afterbegin','<section class="panel"><h2>Движение интерфейса</h2><p>Смена фоновых фотографий и короткие переходы между вкладками.</p><button type="button" aria-pressed="'+this.motion+'" onclick="Interface9.toggleMotion();render()">Анимации: '+(this.motion?'включены':'отключены')+'</button></section>');
  if(page==='growth9')app.innerHTML=head('PLAYER DEVELOPMENT','Развитие OVR','Опыт, тренировки и разбор ошибок. Все показатели берутся из текущей карьеры.')+'<div class="v9-growth-grid">'+roster().map(p=>Growth8.view(p)).join('')+'</div><div class="actions">'+btn('К тренировкам',"go('tactics')",true)+btn('База и штаб',"go('development')")+'</div>';
  if(this.lastPage!==page){
   app.classList.remove('v9-enter');void app.offsetWidth;app.classList.add('v9-enter');
   if(this.enterTimer!==null)clearTimeout(this.enterTimer);this.enterTimer=setTimeout(()=>app.classList.remove('v9-enter'),550);
   this.lastPage=page;
  }
  this.bracket();
 },
 bracket(){
  for(const node of $('app').querySelectorAll('.neon-node[data-match-id]')){
   node.classList.toggle('v9-final',node.dataset.championship==='true');
   const winner=node.querySelector('.is-winner');
   if(winner){const key=(selectedBracket??S.active?.event??'preview')+'|'+node.dataset.matchId+'|'+node.textContent;
    if(!this.resultsSeen.has(key)){this.resultsSeen.add(key);if(this.resultsSeen.size>128)this.resultsSeen.delete(this.resultsSeen.values().next().value);node.classList.add('v9-result-arrive');for(const edge of $('app').querySelectorAll('.neon-edge[data-source="'+node.dataset.matchId+'"]'))edge.classList.add('v9-edge-arrive');}
   }
   for(const row of node.querySelectorAll('.neon-match-team'))row.classList.toggle('v9-loser',!!node.querySelector('.is-winner')&&!row.classList.contains('is-winner'));
  }
 },
 reset(){this.lastPage=null;this.selectedFrom=null;this.resultsSeen.clear();},
 squad(){
  if(GlobalInterface6.tab!=='five'||Arena33C.squadMode==='table')return this.oldSquad();
  const ps=roster(),ownedPlayers=owned().filter(p=>!p.retired),selected=ownedPlayers.find(p=>p.id===GlobalInterface6.selected)||ps[0],r=readiness33C();
  const tabs='<nav class="g6-tabs" aria-label="Управление составом">'+[['five','Основная пятёрка'],['bench','Резерв'],['contracts','Контракты']].map(([key,label])=>'<button type="button" aria-pressed="'+(GlobalInterface6.tab===key)+'" onclick="GlobalInterface6.setTab(\''+key+'\')">'+label+'</button>').join('')+'</nav>';
  return '<div class="v9-squad g6-squad">'+tabs+'<div class="v9-roster-heading"><div><small>'+esc(my().name)+' / ROSTER</small><h1>Стартовая пятёрка</h1></div><div class="v9-roster-metrics">'+[['OVR',r.ovr],['SIN',r.sin],['Форма',r.form]].map(([label,n])=>'<div><small>'+label+'</small><b>'+Math.round(n)+'</b></div>').join('')+'</div></div><div class="actions v9-display">'+btn('Карточки',"setSquadMode33C('cards')")+btn('Таблица',"setSquadMode33C('table')")+'</div><section class="v9-five g6-five" aria-label="Основной состав">'+ps.map(p=>{
   const bio=bio20(p),name=bio?[bio.first,bio.last].filter(Boolean).join(' '):'';
   return '<article class="v9-player g6-player '+(selected?.id===p.id?'is-selected':'')+'"><button class="g6-select" type="button" aria-pressed="'+(selected?.id===p.id)+'" aria-label="Выбрать '+esc(p.name)+'" onclick="GlobalInterface6.select('+p.id+')"><span class="v9-position">'+String(p.role+1).padStart(2,'0')+'</span><b class="v9-rating">'+Math.round(p.skill)+'</b>'+portrait20(p)+'<span class="v9-player-caption"><b>'+esc(p.name)+'</b><small>'+esc(name)+'</small><em>'+esc(ROLES[p.role])+'</em></span></button></article>';
  }).join('')+'</section>'+(selected?'<section class="v9-player-summary g6-selected"><div><small>ВЫБРАННЫЙ ИГРОК</small><h2>'+esc(selected.name)+'</h2><p>'+esc(ROLES[selected.role])+' · '+selected.contract+' дн. · '+cash(selected.salary)+'/нед.</p></div><div class="v9-selected-vitals">'+[['Форма',selected.form],['Энергия',100-selected.fatigue],['Мораль',selected.morale]].map(([label,n])=>'<div><small>'+label+'</small><b>'+Math.round(n)+(label==='Энергия'?'%':'')+'</b><meter min="0" max="100" value="'+clamp(n)+'"></meter></div>').join('')+'</div><div class="actions">'+btn('Открыть профиль','profile('+selected.id+')',true)+btn('Сравнить','openCompare33C('+selected.id+')')+'</div></section>':'<p>В основной пятёрке пока нет игроков.</p>')+'<div class="v9-roster-foot"><span>Резерв: '+ownedPlayers.filter(p=>!p.active).length+' / 3</span>'+btn('Управление резервом',"GlobalInterface6.setTab('bench')")+btn('Поиск усиления',"go('market')")+btn('Подготовка команды',"go('tactics')")+'</div><details class="g6-legacy v9-roster-archive"><summary>Поддержка клуба и архив состава</summary>'+amTeamCard(my())+'<p>Болельщики: '+Math.round(Fans4.support(my()).fans).toLocaleString('ru-RU')+'</p>'+S.players.filter(p=>p.retired&&p.retiredFromTeam===S.club).map(p=>'<div class="news"><b>'+esc(p.name)+'</b><p>'+esc(ROLES[p.role])+' · '+date(p.retiredDay)+'</p>'+btn('Профиль','profile('+p.id+')')+'</div>').join('')+'</details></div>';
 }
};
if(!PAGES.some(p=>p[0]==='growth9'))PAGES.push(['growth9','↗','Развитие OVR']);
Interface9.oldSquad=squad;squad=function(){return Interface9.squad();};
const renderBefore9=render;render=function(...args){const r=renderBefore9(...args);Interface9.decorate();return r;};
const goBefore9=go;go=function(destination){if(destination==='player')Interface9.selectedFrom=Interface9.group().id;return goBefore9(destination);};
const freshBefore9=fresh,migrateBefore9=migrate;fresh=function(...args){Interface9.reset();return freshBefore9(...args);};migrate=function(...args){Interface9.reset();return migrateBefore9(...args);};
const patchBefore9=patchViewV1;patchViewV1=function(...args){return '<section class="panel"><div class="eyebrow">V9.0 BETA / GLOBAL INTERFACE UPDATE</div><h1>Живая киберспортивная сцена</h1><p>Семь разделов с внутренними вкладками, анимированный фон Dota-сцены, новая пятёрка, рынок с фотографиями и логотипами, белые победители сетки и золотой победитель гранд-финала. Анимации можно отключить. Все игровые действия и правила сохранены.</p></section>'+patchBefore9(...args);};
