'use strict';
// One renderer for navigation; late-loaded features register themselves in PAGES.
function renderMobileNavigation(){
 ensureCriticalDom();
 const nav=document.getElementById('mobileNav33c');
 if(!nav)return;
 const items=[['home','Главная','◈'],['squad','Команда','♙'],['match','Матч','▷']];
 if(PAGES.some(p=>p[0]==='bootcamp'))items.push(['bootcamp','Буткемп','⌂']);
 items.push(['menu21','Ещё','☰']);
 nav.style.gridTemplateColumns='repeat('+items.length+',1fr)';
 nav.innerHTML=items.map(([key,label,icon])=>'<button aria-current="'+(page===key?'page':'false')+'" onclick="go(\''+key+'\')"><span aria-hidden="true">'+icon+'</span>'+label+'</button>').join('');
}
