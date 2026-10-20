'use strict';
// Presentation only. Crop photographic regions in CSS; every label and control stays live HTML.
const NEON_SCENES={
 room:{file:'home',x:0,y:0,w:590,h:145},
 training:{file:'development',x:36,y:235,w:240,h:137},
 staff:{file:'development',x:311,y:235,w:243,h:137},
 recovery:{file:'development',x:36,y:864,w:519,h:164},
 squad:{file:'squad',x:386,y:178,w:171,h:136},
 audience:{file:'home',x:343,y:539,w:210,h:52},
 arena:{file:'home',x:351,y:249,w:196,h:91},
 city:{file:'home',x:405,y:746,w:157,h:76}
};
function neonScene(kind){
 const p=NEON_SCENES[kind]||NEON_SCENES.room;
 return '<span class="neon-scene" style="aspect-ratio:'+p.w+'/'+p.h+'"><img src="assets/neon/'+p.file+'-reference.jpg" alt="" draggable="false" style="width:'+(590/p.w*100)+'%;left:'+(-p.x/p.w*100)+'%;top:'+(-p.y/p.h*100)+'%"></span>';
}
function neonTitleArt(kind){return '<span class="neon-title-art" aria-hidden="true">'+neonScene(kind)+'</span>';}
head=function(k,title,desc,right){
 const art=page==='squad'?'squad':page==='development'?'staff':page==='calendar'||page==='bracket'||page==='trophies'?'city':'room';
 return '<div class="title-row neon-title-row">'+neonTitleArt(art)+'<div class="neon-title-copy"><div class="eyebrow">'+k+'</div><h1>'+title+'</h1><p>'+desc+'</p></div>'+(right?'<div class="neon-title-actions">'+right+'</div>':'')+'</div>';
};
function cycleNewsNeon(step){
 const size=Math.min(5,S.news.length);if(!size)return;
 newsIndex21=(newsIndex21+step+size)%size;render();
}
home=function(){
 const e=dashboardEventObject21(),d=development21(),news=S.news.slice(0,5),index=news.length?newsIndex21%news.length:0;
 return '<div class="home-tools21"><div class="home-facts-neon"><span>Бюджет <b>'+cash(S.budget)+'</b></span><span>Подготовка <b class="neon-preparation">'+Math.round(d.preparation)+'%</b></span><span>База '+d.base+'/5 · штаб '+d.staff+'/5</span></div>'+
 '<div class="home-tools-art" aria-hidden="true">'+neonScene('arena')+'</div>'+
 '<div class="home-quick-links">'+btn('Зал наград',"go('trophies')")+btn('Тактика',"go('tactics')",true)+'</div></div>'+
 '<div class="reference-dashboard21"><div class="reference-center21"><section class="news-board21"><div class="white-heading21"><span class="heading-photo-neon" aria-hidden="true">'+neonScene('audience')+'</span><h2>Новости</h2></div>'+
 '<div class="news-content21"><p>'+esc(news[index]?.text||'Новый сезон. Новая история твоего клуба.')+'</p><button class="news-control-neon prev" aria-label="Предыдущая новость" onclick="cycleNewsNeon(-1)">‹</button><div class="news-dots21">'+news.map((_,i)=>'<button class="'+(i===index?'selected':'')+'" aria-label="Новость '+(i+1)+'" aria-pressed="'+(i===index)+'" onclick="newsIndex21='+i+';render()"></button>').join('')+'</div><button class="news-control-neon next" aria-label="Следующая новость" onclick="cycleNewsNeon(1)">›</button></div></section>'+
 overviewGroups21(e)+'</div>'+scheduleRail21(e)+'</div>'+(typeof tiBanner==='function'?tiBanner():'');
};
const developmentBeforeNeon=developmentView21;
developmentView21=function(){
 let i=0,j=0;const kinds=['base','staff','recovery'],scenes=['training','staff','recovery'];
 let html=developmentBeforeNeon()
  .replace(/class="panel development-card21"/g,()=> 'class="panel development-card21 kind-'+kinds[i++]+'"')
  .replace(/<div class="building-icon21">[\s\S]*?<\/div>/g,()=>'<div class="neon-building-visual" aria-hidden="true">'+neonScene(scenes[j++])+'</div>')
  .replace('Снижает усталость от карт в ручном режиме, автосимуляции и КВ','Снижает усталость от официальных серий в ручном режиме и автосимуляции, а также от карт КВ');
 const marker='<section class="panel progress-rules21">',at=html.indexOf(marker);if(at>=0)html=html.slice(0,at)+'<details class="neon-development-more"><summary>Форма, потенциал и развитие игроков</summary>'+html.slice(at)+'</details>';return html;
};
function neonSquadTable(players){
 return '<div class="table-wrap"><table><thead><tr><th>ИГРОК</th><th>ПОЗИЦИЯ</th><th>РЕЙТИНГ</th><th>ФОРМА</th><th>ЭНЕРГИЯ</th></tr></thead><tbody>'+
 players.map(p=>'<tr><td><span class="player-cell20">'+portrait20(p)+playerLink20(p)+'</span></td><td>'+ROLES[p.role]+'</td><td><span class="rating">'+Math.round(p.skill)+'</span></td><td>'+Math.round(p.form)+'</td><td class="neon-energy">'+Math.round(100-p.fatigue)+'%</td></tr>').join('')+'</tbody></table></div>';
}
squad=function(){
 const reserve=owned().filter(p=>!p.active),retired=S.players.filter(p=>p.retired&&p.retiredFromTeam===S.club);
 const empty='<div class="neon-empty"><span class="neon-empty-icon">'+icon21('team')+'</span><p>Подпиши игрока на рынке: он попадёт в резерв.<br>Затем переведи его в основу на своей позиции.</p>'+neonTitleArt('training')+'</div>';
 return head('ЛЮДИ РЕШАЮТ','Твоя пятёрка','Пять ролей. Одна цель. Трансферы доступны между турнирами.')+
 '<section class="panel neon-squad"><h2>Основной состав</h2>'+neonSquadTable(roster())+'</section>'+
 '<section class="panel neon-squad"><h2>Скамейка запасных · '+reserve.length+'/3</h2>'+(reserve.length?neonSquadTable(reserve):empty)+'</section>'+
 '<section class="panel"><h2>Архив · завершили карьеру</h2>'+(retired.length?retired.map(p=>'<div class="news"><b>'+esc(p.name)+'</b><p>'+ROLES[p.role]+' · '+date(p.retiredDay)+' · рейтинг '+Math.round(p.skill)+'</p>'+btn('Профиль','profile('+p.id+')')+'</div>').join(''):'<div class="neon-empty neon-archive-empty"><span class="neon-empty-icon">'+icon21('database')+'</span>'+neonTitleArt('recovery')+'</div>')+'</section>';
};
const renderBeforeNeon=render;
render=function(){
 renderBeforeNeon();if(!S)return;
 if(document.body?.setAttribute)document.body.setAttribute('data-page',page);
 if(typeof requestAnimationFrame==='function'&&typeof fitNeonBracket==='function')requestAnimationFrame(fitNeonBracket);
};

const NEON_PORTRAITS={"Ame": "assets/neon/players/ame.webp", "Xm": "assets/neon/players/xm.webp", "zeal": "assets/neon/players/zeal.webp", "XinQ": "assets/neon/players/xinq.webp", "BoBoKa": "assets/neon/players/boboka.webp"};
const photoBeforeNeon=photo20;
photo20=function(p){return NEON_PORTRAITS[p.name]||photoBeforeNeon(p);};

playerLink20=function(p){return '<button class="player-link20" onclick="profile('+p.id+')"><span class="neon-club-tag">'+tag20(p)+'</span>'+esc(p.name)+'</button>';};

// A tab opened from the mobile navigation starts at its header.
const goBeforeNeon=go;
go=function(destination){
 const previous=page;goBeforeNeon(destination);
 if(page!==previous&&typeof window.scrollTo==='function')window.scrollTo({top:0,left:0,behavior:'instant'});
};
