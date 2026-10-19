'use strict';
const NICK_START12=['Neon','Ash','Velvet','Iron','Frost','Rune','Echo','Nova','Dusk','Void','Cinder','Flux','Lunar','Solar','Silent','Crimson','Onyx','Silver','Zen','Storm'];
const NICK_END12=['Vex','Pulse','Drift','Shard','Rift','Kite','Fang','Vale','Rook','Byte','Wave','Strike','Blink','Wisp','Hex','Spark','Blade','Mist','Orbit','Glint'];
const CLUB_START12=['Obsidian','Neon','Solar','Lunar','Crimson','Northern','Silent','Emerald','Iron','Midnight','Ivory','Azure'];
const CLUB_END12=['Wolves','Vanguard','Five','Reapers','Orbit','Union','Phoenix','Titans','Legion','Guard','Ravens','Dragons'];
let skipBusy12=false,skipProgress12='';
function randomNickname12(){let name;for(let i=0;i<1000;i++){name=NICK_START12[int(0,NICK_START12.length-1)]+NICK_END12[int(0,NICK_END12.length-1)]+(i>40?int(10,999):'');if(!S.players.some(p=>p.name.toLowerCase()===name.toLowerCase()))return name;}return 'Nomad'+S.players.length+'x'+int(1000,9999)}
function randomClub12(){for(let i=0;i<1000;i++){let name=CLUB_START12[int(0,CLUB_START12.length-1)]+' '+CLUB_END12[int(0,CLUB_END12.length-1)]+(i>40?' '+int(10,999):'');if(!S.teams.some(t=>t.name===name))return name;}return 'Frontier '+S.teams.length}
function updateLiveName12(oldName,newName){let m=S.active?.live;if(!m)return;for(let side of m.sides||[])for(let p of side.heroes)if(p.name===oldName)p.name=newName;for(let d of m.draft?.details?.flat()||[])if(d.player===oldName)d.player=newName;}
function signReplacement12(team,role,exclude=null){let choices=S.players.filter(p=>!p.retired&&p.team===null&&p.role===role&&p.id!==exclude).sort((a,b)=>Number(!!a.fiction)-Number(!!b.fiction)||b.skill-a.skill),p=choices[0];if(!p)return null;p.team=team;p.active=true;p.contract=365;if(S.transfersV1)transferEntryV1(p,null,team,'sign');return p;}
academy=function(team,role){if(team!==null){let p=signReplacement12(team,role);if(p)return p;}let skill=int(66,76),p={id:S.players.length,name:randomNickname12(),role,team,active:team!==null,skill,potential:int(83,96),form:75,morale:80,fatigue:4,salary:3000,contract:team===null?0:365,fiction:true,generatedV12:true};S.players.push(p);return p};
function nameFictionalClubs12(){for(let t of S.teams){if(!t.renamedV12&&/^Academy\b/i.test(t.name)){t.name=randomClub12();t.short=t.name.split(' ').map(x=>x[0]).join('').slice(0,4).toUpperCase();t.generatedV12=true;if(/^Academy\b/i.test(t.coach||''))t.coach='Штаб клуба';}}}
function replaceLegacyPlayers12(){if(S.active)return;for(let p of [...S.players]){if(!p.wasAcademy12||!p.active||p.team===null)continue;let team=p.team,candidate=S.players.filter(q=>!q.retired&&q.team===null&&q.role===p.role&&q.id!==p.id).sort((a,b)=>Number(!!a.fiction)-Number(!!b.fiction)||b.skill-a.skill)[0];if(candidate){if(S.transfersV1)releasePlayerV1(p);else{p.team=null;p.active=false;}signReplacement12(team,p.role,p.id);}}S.pendingReplacements12=false;}
function initV12(){if(S.worldV12)return;S.worldV12=true;S.gameVersion=GAME_VERSION_V1;for(let p of S.players)if(/^Academy\b/i.test(p.name)){let old=p.name;p.wasAcademy12=true;p.generatedV12=true;p.name=randomNickname12();updateLiveName12(old,p.name);}nameFictionalClubs12();S.pendingReplacements12=true;replaceLegacyPlayers12();}
const fieldBefore12=addField6;addField6=function(){fieldBefore12();nameFictionalClubs12()};
const migrateBefore12=migrate;migrate=function(){migrateBefore12();initV12();if(S.pendingReplacements12)replaceLegacyPlayers12();S.gameVersion=GAME_VERSION_V1;};
const finishBefore12=finishEvent6;finishEvent6=function(a){finishBefore12(a);if(S.pendingReplacements12)replaceLegacyPlayers12();render()};
function clubAvatar12(t,small=false){let initials=esc(t.short||t.name.slice(0,3)),size=small?' small-avatar12':'';return `<span class="club-avatar12${size}${t.id===0?' xtreme-avatar13':''}">${t.id<16&&!t.fiction?`<img src="assets/club-logos/${t.id===0?'0-square.png':t.id+'.webp'}" width="64" height="64" alt="Логотип ${esc(t.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><b hidden>${initials}</b>`:`<b>${initials}</b>`}</span>`}
teamDisplay=function(t){return `<div class="team-display">${clubAvatar12(t)}${esc(t.name)}</div>`};
clubs=function(){return head('МИР DOTA 2',S.teams.length+' клубов. Одна арена.','Логотипы клубов, составы соперников и команды игровой лиги.')+`<div class="cards">${S.teams.map(t=>`<article class="panel club-card"><div class="section-head">${clubAvatar12(t,true)}<span class="rating">${Math.round(strength(t))}</span></div><h2>${esc(t.name)}</h2><span class="tag dim">${esc(t.region)}${t.id===S.club?' · твой клуб':''}${t.fiction?' · игровая команда':''}</span><p>Тренер: ${esc(t.coach)}</p>${roster(t).map(p=>`<div class="club-player"><span class="sub">${ROLES[p.role]}</span><b>${esc(p.name)}</b><span class="green">${Math.round(p.skill)}</span></div>`).join('')}<div class="save-actions">${t.id===S.club?btn('Управлять составом',"go('squad')"):btn('Игроки на рынке',`clubFilter='${t.id}';search='';roleFilter='';go('market')`)}${t.fiction?btn('Переименовать клуб',`renameClub12(${t.id})`):''}</div></article>`).join('')}</div>`};
function renamePlayer12(id){let p=S.players[id];if(!p?.fiction)return;openModal(`<h2>Никнейм игрока</h2><label class="form-label" for="nickname12">От 2 до 24 символов</label><input id="nickname12" value="${esc(p.name)}" maxlength="24"><div class="actions">${btn('Отмена','closeModal()')}${btn('Сохранить',`savePlayerName12(${id})`,true)}</div>`)}
function validName12(name,max){return name.length>=2&&name.length<=max&&!/[<>"\r\n]/.test(name)&&!/^javascript:/i.test(name)}
function savePlayerName12(id){let p=S.players[id],name=$('nickname12').value.trim();if(!p?.fiction)return;if(!validName12(name,24)||S.players.some(q=>q.id!==id&&q.name.toLowerCase()===name.toLowerCase())){toast('Нужен уникальный никнейм от 2 до 24 символов без кавычек и угловых скобок.');return;}let old=p.name;p.name=name;p.renamedV12=true;updateLiveName12(old,name);closeModal();render();}
function renameClub12(id){let t=S.teams[id];if(!t?.fiction)return;openModal(`<h2>Название клуба</h2><label class="form-label" for="clubName12">От 2 до 40 символов</label><input id="clubName12" value="${esc(t.name)}" maxlength="40"><label class="form-label" for="clubTag12">Сокращение: 2–6 символов</label><input id="clubTag12" value="${esc(t.short)}" maxlength="6"><div class="actions">${btn('Отмена','closeModal()')}${btn('Сохранить',`saveClubName12(${id})`,true)}</div>`)}
function saveClubName12(id){let t=S.teams[id],name=$('clubName12').value.trim(),tag=$('clubTag12').value.trim();if(!t?.fiction)return;if(!validName12(name,40)||!validName12(tag,6)||S.teams.some(q=>q.id!==id&&q.name.toLowerCase()===name.toLowerCase())){toast('Проверь уникальность названия и длину сокращения.');return;}t.name=name;t.short=tag;t.renamedV12=true;closeModal();render();}
const profileBefore12=profile;profile=function(id){profileBefore12(id);if(S.players[id]?.fiction)$('modal').innerHTML+=`<div class="actions">${btn('Изменить никнейм',`renamePlayer12(${id})`)}</div>`};
const seekBefore12=seekMatch6;seekMatch6=function(){let a=S.active;if(a&&(a.withdrawnV12||S.pendingSkipV12===a.event)){a.withdrawnV12=true;a.stage='Пропуск турнира';return;}seekBefore12()};
function skipEvent12(){return S.events.find(e=>e.id===(S.active?.event??S.pendingSkipV12))||nextEvent()}
function skipPanel12(){let e=skipEvent12();if(!e||e.done)return '';return `<section class="panel skip-panel12"><h2>${skipBusy12?'Симуляция турнира':'Пропуск турнира'}</h2><p><b>${esc(e.name)}</b> · ${skipBusy12?esc(skipProgress12):'Твой клуб отказывается от участия и не получает призовых. Результаты других команд и чемпион сохраняются в сетке.'}</p>${skipBusy12?'<p class="sub">Можно перейти в другие разделы. При скрытии вкладки симуляция остановится; затем её можно продолжить.</p>':btn(e.skipRequestedV12?'Продолжить пропуск':'Пропустить без участия','skipTournament12()',false)}</section>`}
function finalizeSkipped12(a){let e=S.events.find(e=>e.id===a.event),last=a.schedule.at(-1);Object.assign(e,{done:true,skippedV12:true,skipRequestedV12:false,place:null,reward:0,champion:last.w,schedule6:structuredClone(a.schedule),placements6:a.placements,seeds6:a.seeds,groupIds6:a.groupIds,gsl6:a.gsl,pairingFallback:a.pairingFallback||false});S.teams[last.w].points+=100;S.active=null;selectedBracket=e.id;S.pendingSkipV12=null;log(my().name+' пропускает '+e.name+'. Чемпион: '+S.teams[last.w].name+'. Призовые клуба: $0.');ensureTournamentCalendar();if(S.pendingReplacements12)replaceLegacyPlayers12();}
async function yieldSkip12(state){render();await new Promise(resolve=>setTimeout(resolve,0));return S===state&&!document.hidden;}
async function skipTournament12(){
 if(skipBusy12)return;if(S.active?.seriesDone&&(S.active.format6?S.active.schedule[S.active.cursor]?.championship:isFinal(S.active))){finishSeries();return;}let state=S,e=skipEvent12();if(!e||e.done)return;pauseLive4(false);skipBusy12=true;S.pendingSkipV12=e.id;e.skipRequestedV12=true;skipProgress12='Подготовка';
 try{
  while(!S.active&&S.day<e.day){tick();if(S.day%14===0&&!await yieldSkip12(state))return;}
  if(S!==state)return;
  if(!S.active)startEvent();let a=S.active;if(!a)return;a.withdrawnV12=true;a.stage='Пропуск турнира';
  if(a.format6){
   // Preserve an already completed current series; unfinished series are forfeited.
   if(a.seriesDone){let n=a.schedule[a.cursor],pair=n.pair.map(v=>resolve6(a,v));recordNode6(a,n,(pair[0]===S.club?a.score:[...a.score].reverse()).join(':'));a.cursor++;a.seriesDone=false;}
   a.live=null;
   while(S.active===a){
    if(!await yieldSkip12(state))return;
    if(a.cursor>=a.schedule.length){if(phaseNext6(a))continue;finalizeSkipped12(a);break;}
    let n=a.schedule[a.cursor],pair=n.pair.map(v=>resolve6(a,v));if(pair.some(id=>!Number.isInteger(id)))throw Error('Неразрешённая пара при пропуске');
    skipProgress12='Серия '+(a.cursor+1)+' · '+n.label;
    let own=pair.includes(S.club),need=n.bo===5?3:2;
    recordNode6(a,n,own?(pair[0]===S.club?'0:'+need:need+':0'):aiSeries6(pair,n.bo).score);
    if(own){n.forfeitV12=S.club;for(let id of a.entrants)for(let p of roster(S.teams[id]))p.fatigue=clamp(p.fatigue-3);}
    a.cursor++;save();
   }
  }else{
   let beforePoints=my().points,guard=0;while(S.active&&guard++<20){if(!await yieldSkip12(state))return;a=S.active;a.live=null;if(!a.seriesDone){a.score=[0,isFinal(a)?3:2];a.seriesDone=true;}finishSeries();}
   if(S.active)throw Error('Не завершился старый турнир');let reward=e.reward||0;if(reward)money(-reward,'Отказ от призовых: пропуск турнира');S.prizes-=reward;my().points=beforePoints;e.reward=0;e.place=null;e.skippedV12=true;e.skipRequestedV12=false;S.pendingSkipV12=null;log('Турнир '+e.name+' пропущен без призовых.');
  }
  while(S.day<e.day+(e.duration||10)-1)tick();
  page='calendar';save();toast('Турнир пропущен. Результаты сохранены в сетке.');
 }catch(error){toast('Симуляция остановлена. Прогресс сохранён; можно продолжить.');console.error(error);save();}finally{skipBusy12=false;if(S===state)render();}
}
const calendarBefore12=calendar;calendar=function(){return calendarBefore12().replace('<div class="notice">',skipPanel12()+'<div class="notice">')};
const matchBefore12=matchView;matchView=function(){return S.active?.withdrawnV12?head('ТУРНИРНЫЙ ЦЕНТР','Турнир пропускается','Результаты уже сыгранных серий сохранены.')+skipPanel12():matchBefore12()+ (S.active?skipPanel12():'')};
const homeBefore12=home;home=function(){return homeBefore12()+skipPanel12()};
const renderBefore12=render;render=function(){if(S)initV12();renderBefore12();let t=my();$('club').innerHTML=`<div class="club-identity12">${clubAvatar12(t,true)}<b>${esc(t.name)}</b></div><small>${esc(t.region)} · Главный тренер: ${esc(t.coach)}</small>`;if(skipBusy12){$('app').innerHTML=skipPanel12();$('advance').disabled=true;}else $('advance').disabled=false;};
const settingsBefore12=settings;settings=function(){let note=`<section class="panel"><h2>v1.2 · клубы и календарь</h2><p>Логотипы клубов. Пополнение составов свободными агентами; если их нет — уникальные вымышленные никнеймы. Имена вымышленных игроков и названия команд можно менять. Пропуск турнира без участия и призовых с симуляцией остальных серий.</p><p class="sub">Логотипы используются для идентификации клубов; источники указаны в <a href="assets/club-logos/sources.json" target="_blank" rel="noopener">списке изображений</a>.</p></section>`;return settingsBefore12().replace('<section class="panel">',note+'<section class="panel">')};

const circuitTableBefore12=circuitTable6;circuitTable6=function(a,ids=a.entrants){let html=circuitTableBefore12(a,ids);for(let id of ids){let t=S.teams[id];html=html.replace('<td>'+esc(t.name)+'</td>','<td><span class="inline-club12">'+clubAvatar12(t,true)+esc(t.name)+'</span></td>');}return html;};
const bracketNameBefore12=bracketNameV1;bracketNameV1=function(a,v){let id=typeof v==='number'?v:v.seedLabel?null:a.schedule[v.id]?.[v.out],name=bracketNameBefore12(a,v);return id!=null?'<span class="inline-club12">'+clubAvatar12(S.teams[id],true)+name+'</span>':name;};
