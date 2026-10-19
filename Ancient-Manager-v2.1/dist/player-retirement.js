'use strict';
function canRetirePlayer(id){let p=S?.players[id];return !!p&&p.team===S.club&&!p.retired&&!locked();}
function retirementCandidates(p){return S.players.filter(q=>!q.retired&&q.id!==p.id&&q.role===p.role&&((q.team===S.club&&!q.active)||(q.team===null&&!transferTerms13(q,'starter').reason&&transferTerms13(q,'starter').fee<=S.budget))).sort((a,b)=>Number(b.team===S.club)-Number(a.team===S.club)||b.skill-a.skill);}
function askRetirePlayer(id){
 if(!canRetirePlayer(id))return toast('Завершение карьеры доступно для своих игроков между турнирами и КВ.');
 let p=S.players[id],candidates=p.active?retirementCandidates(p):[];
 openModal(`<div class="eyebrow">ЗАВЕРШЕНИЕ КАРЬЕРЫ</div><h2>${esc(p.name)} покинет профессиональную сцену</h2><p>Игрок останется в архиве клуба, перестанет получать зарплату и больше не появится на трансферном рынке. Выплаты за завершение карьеры нет. Решение действует в этой карьере.</p>${p.active?`<p>Выбери замену на позицию «${ROLES[p.role]}». Сыгранность снизится на 8.</p><div class="cards">${candidates.map(q=>{let own=q.team===S.club,terms=own?null:transferTerms13(q,'starter');return `<section class="panel"><h3>${esc(q.name)} · ${Math.round(q.skill)}</h3><p>${own?'Из своего резерва · без трансферной платы':`Свободный агент · ${cash(terms.fee)} · зарплата ${cash(terms.salary)}/нед.`}</p>${btn('Завершить карьеру и заменить',`retirePlayer(${id},${q.id})`,true)}</section>`;}).join('')}<section class="panel"><h3>Пригласить новичка</h3><p>Новый вымышленный игрок этой позиции: рейтинг 66–76, зарплата $3 000/нед., контракт на год. Без трансферной платы.</p>${btn('Завершить карьеру и пригласить новичка',`retirePlayer(${id},'rookie')`)}</section></div>`:btn('Подтвердить завершение карьеры',`retirePlayer(${id})`,true)}<div class="actions">${btn('Отмена',`profile(${id})`)}</div>`);
}
function retirePlayer(id,replacement=null){
 if(!canRetirePlayer(id))return false;
 let p=S.players[id],wasActive=p.active,next=null,terms=null;
 if(wasActive){
  if(replacement==='rookie'){if(S.players.length>=2000){toast('Лимит игроков: выбери замену из списка.');return false;}}
  else{next=retirementCandidates(p).find(q=>q.id===replacement);if(!next){toast('Замена больше недоступна. Выбери другого игрока.');askRetirePlayer(id);return false;}if(next.team===null)terms=transferTerms13(next,'starter');}
 }
 // Player IDs stay in place so old match reports keep their original references.
 p.retired=true;p.retiredDay=S.day;p.retiredFromTeam=S.club;p.team=null;p.active=false;p.contract=0;
 if(wasActive){
  if(replacement==='rookie'){next=academy(null,p.role);next.team=S.club;next.contract=365;transferEntryV1(next,null,S.club,'sign',0);}
  else if(terms){money(-terms.fee,'Замена завершившего карьеру '+p.name+': '+next.name);next.team=S.club;next.salary=terms.salary;next.contract=365;next.paid=terms.fee;transferEntryV1(next,null,S.club,'sign',terms.fee);}
  next.active=true;next.promise13='starter';S.chem=clamp(S.chem-8);
 }
 log(p.name+' завершил карьеру в '+my().name+'.'+(next?' Его позицию займёт '+next.name+'.':''));closeModal();render();toast('Карьера '+p.name+' завершена.');return true;
}
const retirementProfile=profile;profile=function(id){let p=S.players[id];if(!p)return;if(p.retired){openModal(`<div class="eyebrow">ЗАВЕРШИЛ КАРЬЕРУ · ${date(p.retiredDay)}</div><h1>${esc(p.name)}</h1><p>${ROLES[p.role]} · рейтинг на момент ухода ${Math.round(p.skill)}</p><p>Последний клуб: ${esc(S.teams[p.retiredFromTeam]?.name||'—')}. Игрок больше не участвует в матчах и трансферах.</p>${btn('Закрыть','closeModal()',true)}`);return;}retirementProfile(id);if(p.team===S.club)$('modal').innerHTML+=`<section class="profile13"><h2>Завершение карьеры</h2><p>Уход из профессиональной игры с записью в архиве клуба.${locked()?' Доступно после завершения турнира или КВ.':''}</p>${btn('Завершить карьеру игрока',`askRetirePlayer(${id})`,false,locked())}</section>`;};
const retirementSquad=squad;squad=function(){let retired=S.players.filter(p=>p.retired&&p.retiredFromTeam===S.club);return retirementSquad()+`<section class="panel" style="margin-top:20px"><h2>Архив · завершили карьеру</h2>${retired.map(p=>`<div class="news"><b>${esc(p.name)}</b><p>${ROLES[p.role]} · ${date(p.retiredDay)} · рейтинг ${Math.round(p.skill)}</p>${btn('Профиль',`profile(${p.id})`)}</div>`).join('')||'<p>Здесь будут игроки, завершившие карьеру в твоём клубе.</p>'}</section>`;};
const retirementOffer=offer;offer=function(id,...args){if(S.players[id]?.retired)return;return retirementOffer(id,...args);};
const retirementBuy=buy;buy=function(id,...args){if(S.players[id]?.retired)return;return retirementBuy(id,...args);};
const retirementRelease=releasePlayerV1;releasePlayerV1=function(p,...args){if(p.retired)return null;return retirementRelease(p,...args);};
const retirementSign=signReshuffle13;signReshuffle13=function(p,...args){if(p.retired)return;return retirementSign(p,...args);};
const retirementValid=validSave;validSave=function(x){return retirementValid(x)&&x.players.every(p=>p.retired===undefined||p.retired===false||p.retired===true&&p.team===null&&p.active===false&&p.contract===0&&Number.isInteger(p.retiredDay)&&p.retiredDay>=0&&Number.isInteger(p.retiredFromTeam)&&p.retiredFromTeam>=0&&p.retiredFromTeam<x.teams.length);};
