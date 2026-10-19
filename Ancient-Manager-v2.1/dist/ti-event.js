'use strict';
// A fictional career event. No claims about the real TI 2027 schedule.
const TI_REWIND='ti-2027-recovery-1',TI_BACKUP='ancient-manager-before-ti-rewind',TI_CHECKPOINT='ancient-manager-ti-start';
function isTI(e){return !!e&&circuitSeries(e)==='THE INTERNATIONAL';}
function ti2027(s=S){return s.events.find(e=>isTI(e)&&(e.calendarKey?.startsWith('circuit-2027-')||/2027/.test(e.name)));}
function tiIdentity(s){return s.careerIdentityTI||JSON.stringify([s.club,s.players.slice(0,25).map(p=>[p.name,p.potential])]);}
function tiState(e){return e.tiEvent??={plan:null,prediction:null,mapWins:0,roshans:0,comebacks:0,claimed:{},chronicle:[],finished:false};}
const freshTI=fresh;fresh=function(id=0){freshTI(id);S.tiRecovery={request:TI_REWIND,mode:'new-career'};save();};
function tiExactSnapshot(target){return STORAGE_KEYS.map(readSnapshot).filter(Boolean).find(p=>{let s=p.state,e=ti2027(s);return tiIdentity(s)===tiIdentity(S)&&s.club===S.club&&e&&!e.done&&!s.active&&!s.practice13&&s.day===target.day&&e.day===target.day&&!s.history.some(h=>h.event===e.name);});}
async function applyTIRewind(source=null){
 if(S.tiRecovery?.request===TI_REWIND)return false;
 let e=ti2027();
 if(!e){let day=Math.round((Date.UTC(2027,8,7)-Date.UTC(2026,9,15))/86400000);if(S.day<day)return false;e={id:Math.max(...S.events.map(e=>e.id))+1,name:'THE INTERNATIONAL 2027',series:'THE INTERNATIONAL',calendarKey:'circuit-2027-3-1',day,duration:14,pool:30000000,modeled:true,venue:'Арена Aegis'};S.events.push(e);}
 if(S.day<e.day)return false;
 let original=structuredClone(source?.state||S),targetDay=e.day,exact=tiExactSnapshot(e),raw=JSON.stringify(makePacket(original,'До возврата к TI 2027'));
 await saveQueue;
 let protectedCopy=await persist(TI_BACKUP,raw);
 if(!protectedCopy.ok){S.tiRecoveryError='Возврат к TI отложен: не удалось записать резервную копию. Скачай карьеру в разделе «Сохранения» и освободи место в браузере.';return false;}
 if(exact){S=structuredClone(exact.state);migrate();e=ti2027();}
 else{
  let affected=S.events.filter(x=>x.day>=targetDay),names=new Set(affected.map(x=>x.name)),removed=S.history.filter(h=>names.has(h.event)||h.day>=targetDay);
  S.wins=Math.max(0,S.wins-removed.filter(h=>h.win&&!h.draw).length);S.losses=Math.max(0,S.losses-removed.filter(h=>!h.win&&!h.draw).length);
  for(let x of affected){if(x.done){let reward=x.reward||0;S.budget-=reward;S.prizes=Math.max(0,S.prizes-reward);if(x.place===1)S.trophies=Math.max(0,S.trophies-1);if(S.teams[x.champion])S.teams[x.champion].points=Math.max(0,S.teams[x.champion].points-100);if(x.place&&x.place!==1)my().points=Math.max(0,my().points-Math.max(5,70-x.place*7));
    for(let [id,place] of Object.entries(x.placements6||{})){let t=S.teams[+id];if(!t)continue;clubState13(t).seasonPoints=Math.max(0,clubState13(t).seasonPoints-Math.max(5,Math.round(120/place)));if(+id!==S.club){let shares={1:.36,2:.19,3:.11,4:.075,5:.04,7:.025,9:.006,13:.004,14:.003};clubState13(t).budget-=Math.round(x.pool*(shares[place]||.003));}}
   }
   for(let k of ['done','place','reward','champion','schedule6','placements6','seeds6','groupIds6','gsl6','pairingFallback','skippedV12','skipRequestedV12','notQualified13','qualification13','qualified13','entrants','format','formatKey6','groups','tiEvent'])delete x[k];
  }
  S.history=S.history.filter(h=>!removed.includes(h));S.news=S.news.filter(n=>n.day<targetDay);S.ledger=S.ledger.filter(n=>n.day<targetDay);S.day=targetDay;S.active=null;S.practice13=null;
  // Clear future dated effects; do not fabricate old player skills, transfers or finances.
  S.world13.scouting={};S.world13.scrims=S.world13.scrims.filter(x=>x.day<targetDay);S.world13.season=circuitYear(targetDay);
  for(let prior of S.events.filter(x=>x.day<targetDay&&!x.done)){prior.done=true;prior.skippedV12=true;prior.recoveryOmittedTI=true;}
 }
 S.tiRecovery={request:TI_REWIND,mode:exact?'exact':'restart',day:targetDay,fromDay:original.day};delete S.tiRecoveryError;
 pauseLive4(false);selectedBracket=null;lastAuto='';
 tiState(e).chronicle.push({text:exact?'Карьера восстановлена из точной копии старта TI.':'TI перезапущен. Сохранены нынешние составы, развитие, контракты, патч и прочие финансовые операции; результаты TI и следующих турниров и их известные призовые отменены.'});
 log(exact?'Восстановлена точная точка старта TI 2027.':'Возврат к старту TI 2027: реконструкция с текущими составами. Исходная карьера в отдельной резервной копии.');return true;
}
function currentTI(){let active=S.events.find(e=>e.id===S.active?.event);return isTI(active)?active:ti2027()||S.events.find(e=>isTI(e)&&!e.done);}
function tiBanner(){let e=currentTI();return (e?`<section class="panel ti-banner"><span class="tag">THE INTERNATIONAL · ОСОБЫЙ ИВЕНТ</span><h2>Дорога к Aegis</h2><p>${esc(e.name)} · ${cash(e.pool)} · ${date(e.day)}</p>${btn('Открыть ивент TI','openTIHub()',true)}</section>`:'')+(S.tiRecoveryError?'<div class="notice">'+esc(S.tiRecoveryError)+'</div>':'');}
const tiHome=home;home=function(){return tiBanner()+tiHome();};
const tiCalendar=calendar;calendar=function(){return tiBanner()+tiCalendar();};
const tiMatch=matchView;matchView=function(){return (isTI(S.events.find(e=>e.id===S.active?.event))?tiBanner():'')+tiMatch();};
function openTIHub(){let e=currentTI();if(!e)return;let t=tiState(e),started=!!e.done||S.active?.event===e.id,blocked=started||busy13||!!S.practice13,goals=[['wins','Выиграть 3 карты',t.mapWins,3,30000],['rosh','Забрать 3 Рошанов',t.roshans,3,25000],['comeback','Победить после −5 000 золота',t.comebacks,1,45000]];
 openModal(`<div class="ti-hub"><span class="tag">ИВЕНТ КАРЬЕРЫ · ${esc(e.name)}</span><h2>Один турнир. Целая история.</h2><p>Призовой фонд ${cash(e.pool)}. Титул разыгрывается в обычной сетке: ивент не гарантирует победу.</p>${S.tiRecovery?.mode==='restart'?'<div class="notice">Исторической копии старта не найдено. Это перезапуск турнира с нынешними составами и развитием, а не точное восстановление старых характеристик и бюджета. Исходная карьера доступна в «Сохранениях».</div>':''}<h3>Штаб перед ареной</h3><p>Выбери один план до старта. Он действует на все официальные карты твоего клуба на этом TI и фиксируется в начале карты.</p><div class="cards">${[['tempo','Штурм арены','+2% эффективности до 15-й минуты; −1% позже.'],['late','Холодная голова','−1% до 25-й минуты; +2% позже.'],['steady','Без перегруза','+1% эффективности всю карту.']].map(([id,name,desc])=>`<section class="panel"><h3>${name}</h3><p>${desc}</p>${btn(t.plan===id?'Выбрано':'Выбрать',`chooseTIPlan('${id}')`,t.plan===id,blocked||!!t.plan)}</section>`).join('')}</div><h3>Оракул Aegis</h3><p>Выбери чемпиона до жеребьёвки. Верный прогноз откроет памятный значок; деньги и силу команды он не меняет.</p><div class="filters">${S.teams.map(c=>btn(c.short,`chooseTIPrediction(${c.id})`,t.prediction===c.id,blocked||t.prediction!==null)).join('')}</div><h3>Контракты спонсора</h3><p>Награды выдаются один раз за TI, только за карты с участием твоего клуба. КВ не учитываются.</p>${goals.map(([id,name,n,target,reward])=>`<div class="news"><b>${name}</b><p>${Math.min(n,target)} / ${target} · ${cash(reward)}</p>${btn(t.claimed[id]?'Получено':'Получить',`claimTIReward('${id}')`,false,t.claimed[id]||n<target||busy13)}</div>`).join('')}<h3>Хроника арены</h3>${t.chronicle.map(c=>'<p>'+esc(c.text)+'</p>').join('')||'<p>Первый выход на сцену ещё впереди.</p>'}${t.oracleWon?'<p class="ti-medal">✦ Оракул Aegis — чемпион предсказан</p>':''}${t.championBadge?'<p class="ti-medal">♛ Хранитель Aegis — чемпион TI</p>':''}${btn('Закрыть','closeModal()',true)}</div>`);
}
function chooseTIPlan(plan){let e=currentTI();if(!e||e.done||S.active?.event===e.id||busy13||S.practice13||!['tempo','late','steady'].includes(plan))return;let t=tiState(e);if(t.plan)return;t.plan=plan;t.chronicle.push({text:'План штаба: '+{tempo:'Штурм арены',late:'Холодная голова',steady:'Без перегруза'}[plan]+'.'});save();openTIHub();}
function chooseTIPrediction(id){let e=currentTI();if(!e||!S.teams[id]||e.done||S.active?.event===e.id||busy13||S.practice13)return;let t=tiState(e);if(t.prediction!==null)return;t.prediction=id;save();openTIHub();}
function claimTIReward(id){let e=currentTI();if(!e||busy13)return;let t=tiState(e),g={wins:[t.mapWins,3,30000],rosh:[t.roshans,3,25000],comeback:[t.comebacks,1,45000]}[id];if(!g||t.claimed[id]||g[0]<g[1])return;t.claimed[id]=true;money(g[2],e.name+' · контракт '+id);t.chronicle.push({text:'Спонсор выплатил '+cash(g[2])+'.'});save();openTIHub();}
const tiStart=startEvent;startEvent=function(){let e=nextEvent();if(isTI(e)&&!S.active&&!S.practice13&&e.day<=S.day){S.careerIdentityTI??='career-'+Date.now()+'-'+S.seed;let packet=JSON.stringify(makePacket(S,'Точка старта '+e.name));saveQueue=saveQueue.then(()=>persist(TI_CHECKPOINT,packet));tiState(e).chronicle.push({text:'Свет софитов: турнир начался.'});}return tiStart();};
const tiMake=makeLive4;makeLive4=function(a,d,ids){let m=tiMake(a,d,ids),e=S.events.find(e=>e.id===a.event);if(isTI(e)&&a===S.active&&m.sides.some(s=>s.team===S.club))m.tiEvent={event:e.id,plan:tiState(e).plan};return m;};
const tiPower=unitPower5;unitPower5=function(m,p){let power=tiPower(m,p);if(!m.tiEvent||m.sides.find(s=>s.heroes.includes(p))?.team!==S.club)return power;let plan=m.tiEvent.plan;return power*(plan==='tempo'?(m.clock<900?1.02:.99):plan==='late'?(m.clock<1500?.99:1.02):plan==='steady'?1.01:1);};
const tiResult=recordResult6;recordResult6=function(m){tiResult(m);if(!m.tiEvent||m.tiCounted||m.finishedSide==null||m.scope13==='scrim')return;let e=S.events.find(e=>e.id===m.tiEvent.event);if(!e)return;let side=m.sides.findIndex(s=>s.team===S.club);if(side<0)return;m.tiCounted=true;let t=tiState(e),won=m.finishedSide===side;t.mapWins+=won?1:0;t.roshans+=m.sides[side].roshKills||0;let comeback=won&&m.goldTrail?.some(p=>p.gold*(side===0?1:-1)<=-5000); // full snapshots below cover earlier deficits too.
 comeback=comeback||won&&m.tiTrailed; if(comeback)t.comebacks++;t.chronicle.push({text:(won?'Победа':'Поражение')+' на карте против '+S.teams[m.sides[1-side].team].name+(comeback?' · камбэк после −5 000!':'.')});t.chronicle=t.chronicle.slice(-40);};
const tiTick=simulateTick4;simulateTick4=function(m,dt=10){if(m.tiEvent&&m.finishedSide==null){let side=m.sides.findIndex(s=>s.team===S.club);if(side>=0&&net4(m.sides[side])-net4(m.sides[1-side])<=-5000)m.tiTrailed=true;}return tiTick(m,dt);};
const tiFinish=finishEvent6;finishEvent6=function(a){let e=S.events.find(e=>e.id===a.event);if(isTI(e)&&!e.done){let t=tiState(e),champion=a.schedule.at(-1)?.w;t.finished=true;t.oracleWon=t.prediction!==null&&t.prediction===champion;t.championBadge=champion===S.club;t.chronicle.push({text:'Aegis поднимает '+(S.teams[champion]?.name||'чемпион турнира')+'.'});}return tiFinish(a);};
const tiSaves=savesView;savesView=function(){let backup=readSnapshot(TI_BACKUP),checkpoint=readSnapshot(TI_CHECKPOINT);return tiSaves()+(backup?snapshotCard(backup,'До возврата к TI 2027',btn('Восстановить исходную карьеру',`askLoad('${TI_BACKUP}')`)): '')+(checkpoint?snapshotCard(checkpoint,'Точка старта TI',btn('Загрузить',`askLoad('${TI_CHECKPOINT}')`)):'');};
// An explicit load of the protected original opts out of the one-time rollback.
const tiAskLoad=askLoad;askLoad=function(key){if(key!==TI_BACKUP)return tiAskLoad(key);let packet=readSnapshot(key);if(!packet)return toast('Резервная копия недоступна');let copy=structuredClone(packet);copy.state.tiRecovery={request:TI_REWIND,mode:'original-restored'};prepareLoad(copy);};
const tiPrepareLoad=prepareLoad;prepareLoad=function(packet){if(!packet?.state||!validSave(packet.state))return tiPrepareLoad(packet);let copy=structuredClone(packet);copy.state.tiRecovery??={request:TI_REWIND,mode:'manual-load'};return tiPrepareLoad(copy);};
