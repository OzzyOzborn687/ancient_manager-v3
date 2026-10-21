'use strict';
// Optional chapter layered over the existing tournament, storage and match engines.
let tiFestivalTab='arena',tiFestivalOpeningPending=false;
const tiFestivalEvent=()=>ti2027();
function tiFestivalData(e=tiFestivalEvent()){
 if(!e)return null;
 const t=tiState(e);
 t.festival??={version:TI_FESTIVAL.version,openingSeen:false,announced:{},medals:[]};
 t.festival.announced??={};t.festival.medals??=[];
 return t.festival;
}
function tiFestivalRequested(){
 try{return new URLSearchParams(location.search).get(TI_FESTIVAL.query)===TI_FESTIVAL.entry;}catch(_){return false;}
}
function consumeTIFestivalLink(){
 try{const u=new URL(location.href);u.searchParams.delete(TI_FESTIVAL.query);window.ancientNavigationHistory.replaceState(null,'',u.pathname+u.search+u.hash);}catch(_){}
}
function tiFestivalNote(e,key,text,kind='moment'){
 const f=tiFestivalData(e);if(f.announced[key])return false;
 f.announced[key]=true;
 const t=tiState(e);t.chronicle.push({day:S.day,kind,text});t.chronicle=t.chronicle.slice(-TI_FESTIVAL.chronicleLimit);
 log('TI 2027 · '+text);return true;
}
const rewindBeforeFestival=applyTIRewind;
async function activateTIFestival(source=null){
 if(slotBusy||busy13){toast('Дождись завершения текущей симуляции.');return false;}
 slotBusy=true;pauseLive4(false);await saveQueue;
 const before=structuredClone(S);
 try{
  const changed=await rewindBeforeFestival(source,{force:true,allowAdvance:true,backupKey:TI_FESTIVAL.backup});
  if(!changed){const message=S.tiRecoveryError;S=before;if(message)S.tiRecoveryError=message;return false;}
  const e=tiFestivalEvent();e.pool=TI_FESTIVAL.pool;
  // A visible special invitation, not a hidden qualification win.
  e.qualified13=[S.club,...rankTeams13().filter(t=>t.id!==S.club).slice(0,TI_FESTIVAL.participants-1).map(t=>t.id)];
  e.qualification13={invited:[...e.qualified13],matches:[],day:S.day,festival:true};
  e.festivalInvitation=true;
  S.tiRecovery.festival=TI_FESTIVAL.version;
  S.tiRecovery.backupKey=TI_FESTIVAL.backup;
  tiFestivalNote(e,'invitation',my().name+' получает специальное приглашение. 16 клубов. Один Aegis.','opening');
  const packet=makePacket(S,'TI 2027 · Эпоха Aegis'),raw=JSON.stringify(packet);
  const written=await persist(KEY,raw);
  if(!written.ok)throw Error('Не удалось подтвердить запись новой точки карьеры.');
  // Once the main career is committed, a failed optional checkpoint is reported.
  const checkpoint=await persist(TI_FESTIVAL.checkpoint,raw);
  lastAuto=JSON.stringify(S);storageHealth=healthText(written);paintStorageStatus();
  if(!checkpoint.ok)toast('Карьера возвращена. Для отдельной точки старта скачай JSON: дополнительный слот не записался.');
  selectedBracket=null;dashboardEvent21=e.id;tiFestivalTab='arena';
  return true;
 }catch(error){
  S=before;lastAuto='';S.tiRecoveryError='Возврат отменён: '+error.message+' Исходная карьера сохранена.';
  return false;
 }finally{slotBusy=false;}
}
applyTIRewind=async function(source=null,options={}){
 if(!tiFestivalRequested())return rewindBeforeFestival(source,options);
 if(S.tiRecovery?.festival===TI_FESTIVAL.version){consumeTIFestivalLink();return false;}
 const changed=await activateTIFestival(source);
 if(changed){consumeTIFestivalLink();tiFestivalOpeningPending=true;}
 return changed;
};
async function returnToTI2027(){
 if(await activateTIFestival()){closeModal();go('home');showTICeremony();}
 else{toast(S.tiRecoveryError||'Карьера осталась без изменений.');}
}
const bootBeforeFestival=boot;
boot=async function(){
 await bootBeforeFestival();
 // A fresh browser has no career to rewind. The explicit link may open a new chapter.
 if(tiFestivalRequested()&&!recoveryBlocked&&S.tiRecovery?.festival!==TI_FESTIVAL.version){
  if(await activateTIFestival()){consumeTIFestivalLink();tiFestivalOpeningPending=true;}
 }
 if(tiFestivalOpeningPending){tiFestivalOpeningPending=false;go('home');showTICeremony();}
};
function tiAegisArt(){
 return '<svg class="ti-aegis" viewBox="0 0 240 280" fill="none" aria-hidden="true">'+
 '<ellipse cx="120" cy="132" rx="102" ry="116" stroke="currentColor" opacity=".2"/><ellipse cx="120" cy="132" rx="84" ry="98" stroke="currentColor" opacity=".25"/>'+
 '<path d="M120 26 187 64 177 160 120 217 63 160 53 64Z" fill="#15151b" stroke="currentColor" stroke-width="4"/>'+
 '<path d="M120 43 170 73 162 153 120 194 78 153 70 73Z" fill="#28202c" stroke="currentColor" stroke-width="2"/>'+
 '<path d="m120 64 31 39-31 65-31-65Z" fill="currentColor"/><path d="m120 78 17 26-17 35-17-35Z" fill="#17121b"/>'+
 '<path d="m93 163 27 31 27-31M66 61l-17-9m126 9 17-9M87 209l-5 22h76l-5-22M74 241h92v12H74" stroke="currentColor" stroke-width="4"/>'+
 '<path d="M51 196C13 167 13 109 31 79M189 196c38-29 38-87 20-117M31 161l-16-9m14-12-16-12m17-10-14-13m17-8-9-15m185 79 16-9m-14-12 16-12m-17-10 14-13m-17-8 9-15" stroke="currentColor" stroke-width="3"/>'+
 '<path d="m120 8 3 8 8 3-8 3-3 8-3-8-8-3 8-3ZM39 218l3 7 7 3-7 3-3 7-3-7-7-3 7-3Zm162 0 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="currentColor"/></svg>';
}
function tiFestivalPhase(e=tiFestivalEvent()){
 const a=S.active?.event===e?.id?S.active:null;
 if(e?.done)return {index:4,label:'История написана'};
 if(a?.schedule?.[a.cursor]?.bo===5)return {index:3,label:'Гранд-финал · BO5'};
 if(a?.stage6==='ti-elimination')return {index:1,label:'Матчи за выход · BO3'};
 if(a?.stage6==='playoffs')return {index:2,label:'Главная сцена'};
 if(a)return {index:1,label:'Испытание · Swiss'};
 return {index:0,label:S.day<e.day?'До открытия '+(e.day-S.day)+' дн.':'Арена ждёт'};
}
function tiFestivalHero(e,compact=false){
 const phase=tiFestivalPhase(e),winner=e.done?S.teams[e.champion]:null;
 const active=S.active?.event===e.id;
 const action=compact?btn('Войти на арену','openTIHub()',true):active?btn('Мой матч →',"closeModal();go('match')",true):e.done?btn('Итоговая сетка',"closeModal();showBracket("+e.id+")",true):e.day<=S.day&&nextEvent()?.id===e.id?btn('Начать TI 2027 →','startTIFestival()',true):btn('Открыть особую главу','returnToTI2027()',true);
 return '<section class="ti-festival-hero '+(compact?'is-compact':'')+'"><div class="ti-lights" aria-hidden="true"></div>'+
 '<div class="ti-festival-hero-copy"><span class="ti-kicker"><i></i> ОСОБАЯ ГЛАВА КАРЬЕРЫ</span>'+
 '<p class="ti-wordmark">THE INTERNATIONAL</p><h2>ЭПОХА <em>AEGIS</em><span>2027</span></h2>'+
 '<p class="ti-hero-story">'+esc(winner?'Aegis поднимает '+winner.name+'. Эта история останется в памяти арены.':'Пять игроков. Миллионы взглядов. Один шанс вписать своё имя в историю.')+'</p>'+
 '<div class="ti-hero-stats"><span><small>ПРИЗОВОЙ ФОНД</small><b>'+cash(e.pool)+'</b></span><span><small>НА ГЛАВНУЮ СЦЕНУ</small><b>16 клубов</b></span><span><small>'+esc(phase.label)+'</small><b>'+date(e.day)+'</b></span></div>'+
 '<div class="ti-hero-actions">'+action+(!compact?btn('Церемония открытия','showTICeremony()'):'')+'</div></div>'+
 '<div class="ti-aegis-stage" aria-hidden="true"><div class="ti-orbit"></div>'+tiAegisArt()+'<span>THE AEGIS OF CHAMPIONS</span><div class="ti-podium"></div></div></section>';
}
tiBanner=function(){
 const e=tiFestivalEvent();if(!e)return '';
 return '<div class="ti-festival ti-festival-banner">'+tiFestivalHero(e,true)+(S.tiRecoveryError?'<p class="notice">'+esc(S.tiRecoveryError)+'</p>':'')+'</div>';
};
const homeBeforeFestival=home;
home=function(){const body=homeBeforeFestival(),banner=tiBanner();return banner+body.replace(banner,'');};
function festivalModal(html){
 openModal('<div class="ti-festival">'+html+'</div>');$('modal').classList.add('ti-festival-dialog');
}
const modalBeforeFestival=openModal;
openModal=function(html){$('modal').classList.remove('ti-festival-dialog');return modalBeforeFestival(html);};
const closeBeforeFestival=closeModal;
closeModal=function(){$('modal').classList.remove('ti-festival-dialog');return closeBeforeFestival();};
function showTICeremony(){
 const e=tiFestivalEvent();if(!e)return;
 festivalModal('<div class="ti-opening"><button class="ti-close" onclick="closeModal()" aria-label="Закрыть церемонию">×</button>'+
 '<div class="ti-opening-sparks" aria-hidden="true"></div><span class="ti-kicker">СВЕТ СОФИТОВ. ТИШИНА ПЕРЕД ПЕРВОЙ КАРТОЙ.</span>'+
 tiAegisArt()+'<p class="ti-wordmark">THE INTERNATIONAL 2027</p><h2>ПУСТЬ АРЕНА<br><em>ЗАПОМНИТ ВАС.</em></h2>'+
 '<p>Сегодня '+esc(my().name)+' выходит за пределы обычного сезона. Впереди — лучшие клубы мира, путь через верхнюю и нижнюю сетки и последняя серия за Aegis.</p>'+
 '<div class="ti-opening-club">'+clubAvatar12(my())+'<span>'+esc(my().name)+'<small>ПЯТЬ РОЛЕЙ. ОДНА ИСТОРИЯ.</small></span></div>'+
 '<div class="ti-hero-actions">'+btn('Начать нашу историю →','enterTIArena()',true)+btn('Пропустить церемонию','enterTIArena()')+'</div><small class="ti-fiction">Специальный сценарий Ancient Manager. Игровые даты и призовой фонд.</small></div>');
}
function enterTIArena(){tiFestivalData().openingSeen=true;save();openTIHub();}
function tiJourney(e){
 const p=tiFestivalPhase(e);
 return '<div class="ti-journey">'+TI_FESTIVAL.acts.map((act,i)=>'<div class="ti-act '+(p.index>i?'is-done':p.index===i?'is-current':'')+'"><span>'+act.number+'</span><div><small>АКТ '+act.number+'</small><b>'+act.title+'</b></div></div>').join('')+'</div>';
}
function tiRecoveryNotice(){
 if(S.tiRecovery?.mode!=='restart')return '';
 return '<div class="ti-recovery-note"><b>Новая попытка с вашим клубом.</b> Исторического снимка не было: составы, развитие, контракты и патч сохранены нынешними. Результаты TI и следующих турниров и известные призовые отменены. Исходную карьеру можно восстановить в «Сохранениях».</div>';
}
function tiFestivalArena(e){
 const t=tiState(e),a=S.active?.event===e.id?S.active:null,blocked=!!e.done||!!a||busy13||!!S.practice13;
 const phase=tiFestivalPhase(e),act=TI_FESTIVAL.acts[Math.min(phase.index,TI_FESTIVAL.acts.length-1)];
 return '<div class="ti-arena-grid"><section class="ti-card ti-spotlight"><span class="ti-kicker">СЕЙЧАС НА АРЕНЕ</span><h3>'+esc(phase.label)+'</h3><p>'+act.text+'</p>'+
 (a?'<div class="ti-next-rival">'+miniClub21(S.club)+'<b>VS</b>'+miniClub21(a.opponent)+'</div><p>'+esc(a.stage||'Турнир идёт')+' · серия '+a.score.join(' : ')+'</p>':e.done?'<p class="ti-winner">'+miniClub21(e.champion)+'</p>':'<p>'+esc(my().name)+(e.festivalInvitation?' · специальное приглашение':' · участие определяется квалификацией')+'</p>')+
 '<div class="ti-hero-actions">'+(a?btn('Мой матч →',"closeModal();go('match')",true)+btn('Турнирная сетка',"closeModal();showBracket("+e.id+")"):e.done?btn('Итоговая сетка',"closeModal();showBracket("+e.id+")",true):e.day<=S.day&&nextEvent()?.id===e.id?btn('Начать TI 2027 →','startTIFestival()',true):btn('Вернуть карьеру к TI 2027','returnToTI2027()',true))+'</div></section>'+
 '<section class="ti-card"><span class="ti-kicker">ВАШ СЛЕД В ИСТОРИИ</span><div class="ti-records"><span><b>'+t.mapWins+'</b>побед на картах</span><span><b>'+t.roshans+'</b>Рошанов</span><span><b>'+t.comebacks+'</b>камбэков</span></div>'+
 '<div class="ti-medals">'+tiMedals(e)+'</div></section></div>'+
 '<section class="ti-card"><span class="ti-kicker">ШТАБ ЗА КУЛИСАМИ</span><h3>Каким будет ваш TI?</h3><p>План фиксируется до старта турнира. Действуют существующие небольшие бонусы подготовки.</p><div class="ti-plans">'+
 [['tempo','01','Штурм арены','+2% до 15-й минуты · −1% позже'],['late','02','Холодная голова','−1% до 25-й минуты · +2% позже'],['steady','03','Без перегруза','+1% всю карту']].map(([id,no,title,desc])=>'<article class="'+(t.plan===id?'is-selected':'')+'"><small>'+no+'</small><h4>'+title+'</h4><p>'+desc+'</p><button '+(blocked||t.plan?'disabled':'')+' aria-pressed="'+(t.plan===id)+'" onclick="chooseTIPlan(\''+id+'\')">'+(t.plan===id?'План выбран':'Выбрать план')+'</button></article>').join('')+'</div></section>'+tiRecoveryNotice();
}
function tiMedals(e){
 const t=tiState(e);
 const medals=[...(t.championBadge?['♛ Хранитель Aegis']:[]),...(t.oracleWon?['✦ Оракул Aegis']:[]),...(t.comebacks?['↗ Вопреки всему']:[]),...(t.mapWins?['✧ Голос арены']:[])];
 return medals.length?medals.map(text=>'<span>'+text+'</span>').join(''):'<p>Памятные знаки появятся после ваших первых достижений.</p>';
}
function tiFestivalClubs(e){
 const t=tiState(e),ids=e.entrants||e.qualified13||rankTeams13().slice(0,TI_FESTIVAL.participants).map(c=>c.id),blocked=!!e.done||S.active?.event===e.id||busy13||!!S.practice13||t.prediction!==null;
 return '<section class="ti-card"><span class="ti-kicker">ШЕСТНАДЦАТЬ ИСТОРИЙ. ОДНА ВЕРШИНА.</span><h3>Кто поднимет Aegis?</h3><p>Оракул закрывается перед жеребьёвкой. Верный прогноз даст памятный знак.</p><div class="ti-clubs">'+ids.map(id=>'<article class="'+(id===S.club?'own-club ':'')+(t.prediction===id?'is-selected':'')+'">'+clubAvatar12(S.teams[id])+'<b>'+esc(S.teams[id].name)+'</b><small>'+esc(S.teams[id].region||'Мировая сцена')+'</small><button '+(blocked?'disabled':'')+' aria-pressed="'+(t.prediction===id)+'" onclick="chooseTIPrediction('+id+')">'+(t.prediction===id?'Мой чемпион':'Предсказать')+'</button></article>').join('')+'</div></section>';
}
function tiFestivalContracts(e){
 const t=tiState(e);
 return '<section class="ti-card"><span class="ti-kicker">СПОНСОРЫ ВЕРЯТ В ВАШУ ИСТОРИЮ</span><h3>Контракты арены</h3><p>Только официальные карты вашего клуба на этом TI. Каждая награда выдаётся один раз.</p><div class="ti-contracts">'+TI_FESTIVAL.goals.map(g=>{
  const n=Math.min(t[g.field]||0,g.target),claimed=!!t.claimed[g.id];
  return '<article class="'+(claimed?'is-claimed':'')+'"><div class="ti-contract-heading"><span>'+g.name+'</span><b>'+cash(g.reward)+'</b></div><p>'+g.description+'</p><div class="ti-contract-progress" role="progressbar" aria-label="'+g.name+'" aria-valuenow="'+n+'" aria-valuemin="0" aria-valuemax="'+g.target+'"><i style="width:'+n/g.target*100+'%"></i></div><div class="ti-contract-foot"><small>'+n+' / '+g.target+'</small>'+btn(claimed?'Контракт закрыт':n>=g.target?'Забрать награду':'В процессе',"claimTIReward('"+g.id+"')",n>=g.target&&!claimed,claimed||n<g.target||busy13)+'</div></article>';
 }).join('')+'</div></section>';
}
function tiFestivalChronicle(e){
 const t=tiState(e);
 return '<section class="ti-card"><span class="ti-kicker">МОМЕНТЫ, КОТОРЫЕ ОСТАЮТСЯ</span><h3>Хроника Aegis</h3><div class="ti-chronicle">'+[...t.chronicle].reverse().map(n=>'<article><i></i><div><small>'+date(n.day??e.day)+'</small><p>'+esc(n.text)+'</p></div></article>').join('')+'</div>'+
 (!t.chronicle.length?'<p>Первая страница ждёт выхода вашей команды на сцену.</p>':'')+'</section>';
}
const hubBeforeFestival=openTIHub;
openTIHub=function(tab){
 const e=currentTI();if(!e||e.id!==tiFestivalEvent()?.id)return hubBeforeFestival();
 if(tab&&['arena','clubs','contracts','chronicle'].includes(tab))tiFestivalTab=tab;
 tiFestivalData(e);
 festivalModal('<div class="ti-hub-top"><span>ANCIENT MANAGER · THE INTERNATIONAL 2027</span><button onclick="closeModal()" aria-label="Закрыть ивент">×</button></div>'+
 tiFestivalHero(e)+tiJourney(e)+'<nav class="ti-tabs" aria-label="Разделы ивента">'+[['arena','Арена'],['clubs','Клубы и оракул'],['contracts','Контракты'],['chronicle','Хроника']].map(([id,label])=>'<button aria-pressed="'+(tiFestivalTab===id)+'" class="'+(tiFestivalTab===id?'is-active':'')+'" onclick="openTIHub(\''+id+'\')">'+label+'</button>').join('')+'</nav>'+
 ({arena:tiFestivalArena,clubs:tiFestivalClubs,contracts:tiFestivalContracts,chronicle:tiFestivalChronicle}[tiFestivalTab])(e)+
 '<p class="ti-fiction">Специальная глава Ancient Manager · формат TI 2025 адаптирован для карьеры · TI 2027 — игровой сценарий.</p>');
};
const claimBeforeFestival=claimTIReward;
claimTIReward=function(id){
 const e=currentTI(),g=TI_FESTIVAL.goals.find(g=>g.id===id);if(!e||busy13||!g)return;
 if(e.id!==tiFestivalEvent()?.id)return claimBeforeFestival(id);
 const t=tiState(e);if(t.claimed[id]||(t[g.field]||0)<g.target)return;
 t.claimed[id]=true;money(g.reward,e.name+' · контракт '+g.name);
 tiFestivalNote(e,'reward-'+id,'Закрыт контракт «'+g.name+'». Спонсор выплатил '+cash(g.reward)+'.','reward');
 save();openTIHub('contracts');
};
function startTIFestival(){closeModal();startEvent();}
function trackTIFestivalDeficit(m){
 if(!m.tiEvent||m.scope13==='scrim')return;
 const side=m.sides.findIndex(s=>s.team===S.club);
 if(side>=0&&net4(m.sides[side])-net4(m.sides[1-side])<=-TI_FESTIVAL.comebackGold)m.tiTrailed=true;
}
const stepBeforeFestival=simulateTick4;
simulateTick4=function(m,dt=10){
 if(m.finishedSide==null)trackTIFestivalDeficit(m);
 return stepBeforeFestival(m,dt);
};
const resultBeforeFestival=recordResult6;
recordResult6=function(m){
 if(m.tiEvent)trackTIFestivalDeficit(m);
 const counted=m.tiCounted;resultBeforeFestival(m);
 if(counted||!m.tiCounted||!m.tiEvent||m.scope13==='scrim')return;
 const e=S.events.find(e=>e.id===m.tiEvent.event);if(e?.id!==tiFestivalEvent()?.id)return;
 const t=tiState(e);
 for(const g of TI_FESTIVAL.goals)if((t[g.field]||0)>=g.target)tiFestivalNote(e,'goal-'+g.id,'Арена заметила вас: «'+g.name+'». Доступен контракт '+cash(g.reward)+'.','achievement');
};
const finishBeforeFestival=finishEvent6;
finishEvent6=function(a){
 const e=S.events.find(e=>e.id===a.event),wasDone=e?.done;
 finishBeforeFestival(a);
 if(!e||wasDone||e.id!==tiFestivalEvent()?.id||!e.done)return;
 tiFestivalNote(e,'closing',e.champion===S.club?'ВАШ AEGIS. '+my().name+' становится чемпионом The International 2027.':'Занавес опускается. Aegis поднимает '+S.teams[e.champion].name+'. Ваша история на арене сохранена.','closing');
 save();if(!busy13)openTIHub('chronicle');
};
const settingsBeforeFestival=settings;
settings=function(){return settingsBeforeFestival()+'<section class="panel ti-return-card"><span class="ti-kicker">ОСОБАЯ ГЛАВА КАРЬЕРЫ</span><h2>Вернуться на The International 2027</h2><p>Полная копия текущей карьеры сохраняется отдельно. При наличии точной точки старта восстанавливается она; иначе турнир перезапускается с нынешними составами и развитием, с отменой последующих результатов и известных призовых.</p>'+btn('Вернуть карьеру к TI 2027','returnToTI2027()',true,busy13||slotBusy)+'</section>';};
const savesBeforeFestival=savesView;
savesView=function(){
 const original=readSnapshot(TI_FESTIVAL.backup),checkpoint=readSnapshot(TI_FESTIVAL.checkpoint);
 return savesBeforeFestival()+'<div class="cards ti-festival-saves">'+(original?snapshotCard(original,'До «Эпохи Aegis»',btn('Восстановить исходную карьеру',"askLoad('"+TI_FESTIVAL.backup+"')")):'')+(checkpoint?snapshotCard(checkpoint,'TI 2027 · Начало особой главы',btn('Загрузить начало',"askLoad('"+TI_FESTIVAL.checkpoint+"')")):'')+'</div>';
};
const loadBeforeFestival=askLoad;
askLoad=function(key){
 if(key!==TI_FESTIVAL.backup)return loadBeforeFestival(key);
 const packet=readSnapshot(key);if(!packet)return toast('Резервная копия недоступна');
 const copy=structuredClone(packet);
 copy.state.tiRecovery={request:TI_REWIND,mode:'original-restored',festival:TI_FESTIVAL.version};
 prepareLoad(copy);
};
