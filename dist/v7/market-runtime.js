'use strict';
// V7.0: negotiation state belongs to the career; quotes never roll gameplay RNG.
const Market7={
 terminal:['signed','rejected','cancelled','expired','invalid'],reservedStages:['club_agreed','player_pending','player_counter','agreed'],
 ensure(){return S.market7??={version:1,serial:0,deals:[],watchlist:[],listings:{}};},
 active(d){return !!d&&!this.terminal.includes(d.stage);},
 deal(player){return (S.market7?.deals||[]).findLast(d=>d.player===player&&d.buyer===S.club&&this.active(d))||null;},
 get(id){return (S.market7?.deals||[]).find(d=>d.id===id&&d.buyer===S.club)||null;},
 reserved(exclude=null){return (S.market7?.deals||[]).filter(d=>d.buyer===S.club&&d.id!==exclude&&this.reservedStages.includes(d.stage)).reduce((n,d)=>n+d.fee,0);},
 available(){return Math.max(0,S.budget-this.reserved());},
 busy(team){if(team===null)return false;if(S.active?.entrants?.includes(team))return true;return S.events.some(e=>!e.done&&e.background51?.status==='running'&&e.background51.state?.entrants?.includes(team));},
 replacement(p){return S.players.filter(q=>!q.retired&&q.id!==p.id&&q.role===p.role&&((q.team===p.team&&!q.active)||q.team===null)).sort((a,b)=>Number(b.team===p.team)-Number(a.team===p.team)||a.skill-b.skill||a.id-b.id)[0]||null;},
 status(p){
  if(!p||p.retired)return {key:'keep',label:'Недоступен',reason:'Игрок завершил карьеру.'};
  if(p.team===null)return {key:'free',label:'Свободный агент',reason:''};
  const listing=p.team===S.club?S.market7?.listings[p.id]:null,c=S.teams[p.team]?.career13,ps=roster(S.teams[p.team]),key=p.active&&ps.slice().sort((a,b)=>b.skill-a.skill||a.id-b.id).slice(0,2).some(q=>q.id===p.id);
  if(listing==='keep')return {key:'keep',label:'Не продаётся',reason:'Клуб не рассматривает продажу этого игрока.'};
  if(this.busy(p.team))return {key:'keep',label:'Не продаётся сейчас',reason:'Клуб участвует в турнире. Вернитесь после его завершения.'};
  if(p.active&&!this.replacement(p))return {key:'keep',label:'Нет замены',reason:'Клуб не отпустит игрока без замены на его позиции.'};
  if(p.active&&key&&c?.lastResults?.slice(-3).length===3&&c.lastResults.slice(-3).every(Boolean))return {key:'keep',label:'Состав сохраняется',reason:'Клуб сохраняет успешный состав после трёх побед.'};
  if(listing==='listed'||!p.active||p.morale<55)return {key:'listed',label:'Трансферный список',reason:''};
  if(listing==='available'||p.contract<=90)return {key:'available',label:'Готов обсуждать',reason:''};
  return key?{key:'key',label:'Ключевой игрок',reason:'Клуб потребует повышенную компенсацию за лидера.'}:{key:'available',label:'Готов обсуждать',reason:''};
 },
 sportingReason(p){const teamOVR=avg(roster().map(q=>q.skill));return p.skill>teamOVR+5?'Спортивные амбиции игрока выше текущего уровня клуба. Деньги и обещание основы не меняют это решение.':'';},
 wants(p,role){if(!['starter','rotation'].includes(role))return 'Выберите роль в составе.';const current=roster().find(q=>q.role===p.role),teamOVR=avg(roster().map(q=>q.skill));const ambition=this.sportingReason(p);if(ambition)return ambition;
  if(role==='starter'&&!current)return 'Сначала восстановите основную пятёрку.';
  if(role==='starter'&&current&&p.skill<current.skill-3)return 'Обещание основы неубедительно: игрок заметно уступает текущему основному.';
  if(role==='rotation'&&(p.skill>teamOVR+.8||p.active&&p.skill>=(current?.skill??75)-.5))return 'Игрок согласится только на место в основном составе.';
  if(role==='rotation'&&p.skill>teamOVR+6)return 'Спортивные амбиции игрока выше предложенной роли.';
  return '';
 },
 quote(p){const status=this.status(p),role=this.wants(p,'rotation')?'starter':'rotation',contract=p.contract<=90?.68:p.contract<=180?.85:1,factor=status.key==='key'?1.55:status.key==='listed'?.9:1.15;
  return {fee:Math.max(0,Math.round(value(p)*(p.team===null?.15:factor*contract)/1000)*1000),salary:Math.max(1000,Math.ceil(p.salary*(role==='starter'?1.12:1.25)/100)*100),days:365,role,status:status.label,key:status.key,reason:status.key==='keep'?status.reason:''};
 },
 note(d,text){d.message=text;d.history.push({day:S.day,text});},
 refresh(){save();render();},
 fail(text){toast(text);return false;},
 next(d){return S.day+1+(d.player+d.id+S.day)%3;},
 close(d,stage,text){d.stage=stage;d.due=null;d.closed=S.day;d.cooldown=stage==='rejected'?S.day+7:S.day;this.note(d,text);},
 current(d){if(S.day>d.expires){this.close(d,'expired','Срок предложения истёк. Сумма освобождена.');this.refresh();return false;}return true;},
 check(d){const p=S.players[d.player];if(d.buyer!==S.club)return 'Клуб-покупатель изменился.';if(!p||p.retired||p.team!==d.source)return 'Игрок сменил клуб или больше недоступен.';if(p.team===S.club)return 'Игрок уже в вашем клубе.';return '';},
 request(player){if(locked())return this.fail('Переговоры доступны между турнирами и КВ.');const p=S.players[player];if(!p||p.retired||p.team===S.club)return false;const m=this.ensure(),existing=this.deal(player);if(existing)return existing;
  const last=m.deals.findLast(d=>d.player===player&&d.buyer===S.club);if(last?.cooldown>S.day)return this.fail('Повторный запрос доступен '+date(last.cooldown)+'.');
  const q=this.quote(p);if(q.reason)return this.fail(q.reason);
  const d={id:++m.serial,player,buyer:S.club,source:p.team,created:S.day,due:null,expires:S.day+14,stage:p.team===null?'club_agreed':'inquiry',initialFee:q.fee,minimumFee:Math.floor(q.fee*(q.key==='key'?.97:q.key==='listed'?.86:.9)/1000)*1000,fee:q.fee,salary:q.salary,days:q.days,role:q.role,offeredFee:null,offeredSalary:null,offeredDays:null,offeredRole:null,clubRounds:0,playerRounds:0,message:'',history:[]};
  if(d.source===null&&d.fee>this.available())return this.fail('Недостаточно свободного бюджета для подписного бонуса.');
  m.deals.push(d);if(d.source!==null)d.due=this.next(d);this.note(d,d.source===null?'Свободный агент: можно отправить предложение личного контракта.':'Запрос условий отправлен. Ответ клуба через 1–3 дня.');this.refresh();return d;
 },
 proposeClub(id,fee){const d=this.get(id);if(!d||d.stage!=='club_terms'||locked())return false;if(!this.current(d))return false;const problem=this.check(d);if(problem){this.close(d,'invalid',problem);this.refresh();return false;}
  if(!Number.isSafeInteger(fee)||fee<=0||fee>100000000)return this.fail('Введите корректную сумму предложения.');if(fee>Math.max(0,S.budget-this.reserved(id)))return this.fail('Предложение превышает свободный бюджет.');
  d.offeredFee=fee;d.clubRounds++;d.stage='club_pending';d.due=this.next(d);d.expires=Math.max(d.expires,d.due+3);this.note(d,'Предложение '+cash(fee)+' отправлено клубу.');this.refresh();return true;
 },
 acceptClub(id){const d=this.get(id);if(!d||d.stage!=='club_terms'||locked())return false;if(!this.current(d))return false;const reason=this.check(d)||this.status(S.players[d.player]).reason&&this.status(S.players[d.player]).key==='keep'&&this.status(S.players[d.player]).reason;if(reason){this.close(d,'invalid',reason);this.refresh();return false;}
  if(d.fee>Math.max(0,S.budget-this.reserved(id)))return this.fail('Недостаточно свободного бюджета для резервирования суммы.');d.stage='club_agreed';d.due=null;this.note(d,'Условия клуба приняты. '+cash(d.fee)+' зарезервировано до завершения переговоров.');this.refresh();return true;
 },
 proposeContract(id,salary,days,role){const d=this.get(id);if(!d||!['club_agreed','player_counter'].includes(d.stage)||locked())return false;if(!this.current(d))return false;const problem=this.check(d);if(problem){this.close(d,'invalid',problem);this.refresh();return false;}
  if(!Number.isSafeInteger(salary)||salary<1000||salary>1000000||![180,365,730,1095].includes(days)||!['starter','rotation'].includes(role))return this.fail('Проверьте зарплату, срок и роль контракта.');
  if(d.fee>Math.max(0,S.budget-this.reserved(id)))return this.fail('Для сделки больше не хватает свободного бюджета.');
  d.offeredSalary=salary;d.offeredDays=days;d.offeredRole=role;d.playerRounds++;d.stage='player_pending';d.due=this.next(d);d.expires=Math.max(d.expires,d.due+3);this.note(d,'Предложен контракт: '+cash(salary)+'/нед., '+days+' дней, '+(role==='starter'?'основа':'ротация')+'.');this.refresh();return true;
 },
 cancel(id){const d=this.get(id);if(!this.active(d))return false;this.close(d,'cancelled','Переговоры отменены. Зарезервированная сумма освобождена.');this.refresh();return true;},
 tick(){const m=S.market7;if(!m)return;let changed=false;for(const d of m.deals){if(!this.active(d))continue;const error=this.check(d);if(error){this.close(d,'invalid',error);changed=true;continue;}if(S.day>d.expires){this.close(d,'expired','Срок предложения истёк. Сумма освобождена.');changed=true;continue;}if(d.due===null||d.due>S.day)continue;
   const p=S.players[d.player],status=this.status(p);changed=true;
   if(['inquiry','club_pending'].includes(d.stage)){
    if(status.key==='keep'){this.close(d,'rejected',status.reason);continue;}
    if(d.stage==='inquiry'){d.stage='club_terms';d.due=null;this.note(d,'Клуб готов обсуждать переход за '+cash(d.fee)+'.');continue;}
    if(d.offeredFee>=d.fee){if(d.offeredFee>Math.max(0,S.budget-this.reserved(d.id))){this.close(d,'rejected','Свободного бюджета больше не хватает для сделки.');continue;}d.fee=d.offeredFee;d.stage='club_agreed';d.due=null;this.note(d,'Клуб согласовал сумму '+cash(d.fee)+'. Средства зарезервированы.');}
    else if(d.clubRounds>=3||d.offeredFee<d.fee*.55)this.close(d,'rejected','Клуб отклонил предложение: сумма не соответствует значимости игрока.');
    else{d.fee=Math.max(d.minimumFee,Math.round((d.offeredFee+d.fee)/2/1000)*1000);d.stage='club_terms';d.due=null;this.note(d,'Контрпредложение клуба: '+cash(d.fee)+'. Более низкая сумма не устраивает продавца.');}
   }else if(d.stage==='player_pending'){
    const ambition=this.sportingReason(p);if(ambition){this.close(d,'rejected',ambition);continue;}const wants=this.wants(p,d.offeredRole),minimum=d.salary*(d.offeredDays===180?1.08:d.offeredDays===1095?1.06:1);
    if(!wants&&d.offeredSalary>=minimum){d.salary=d.offeredSalary;d.days=d.offeredDays;d.role=d.offeredRole;d.stage='agreed';d.due=null;this.note(d,'Личный контракт согласован. Проверьте условия и подтвердите подписание.');}
    else if(d.playerRounds>=3)this.close(d,'rejected','Игрок отклонил условия после нескольких раундов переговоров.');
    else{d.role=wants?'starter':d.offeredRole;d.days=365;d.stage='player_counter';d.due=null;this.note(d,(wants?wants+' ':'')+'Запрос игрока: '+cash(d.salary)+'/нед., 365 дней, '+(d.role==='starter'?'основа':'ротация')+'.');}
   }
  }if(changed)save();
 },
 sign(id){const d=this.get(id);if(!d||d.stage!=='agreed'||locked())return false;const p=S.players[d.player],error=this.check(d);if(error){this.close(d,'invalid',error);this.refresh();return false;}if(S.day>d.expires){this.close(d,'expired','Срок согласования истёк.');this.refresh();return false;}
  const sourceStatus=this.status(p);if(sourceStatus.key==='keep'){this.close(d,'invalid',sourceStatus.reason);this.refresh();return false;}
  const wants=this.wants(p,d.role);if(wants)return this.fail(wants);if(d.fee>Math.max(0,S.budget-this.reserved(id)))return this.fail('Недостаточно свободных средств с учётом других согласованных сделок.');
  if(owned().filter(q=>!q.active&&!q.retired).length>=3)return this.fail('В резерве уже три игрока. Освободите место перед подписанием.');
  const from=p.team,wasActive=p.active,replacement=from!==null&&wasActive?this.replacement(p):null;
  if(from!==null&&wasActive&&!replacement)return this.fail('Продавец больше не располагает заменой. Сделка отложена.');
  const source=from===null?null:structuredClone(S.teams[from]);
  // All failure-prone negotiation checks precede financial and roster effects.
  pay13(S.club,-d.fee,(from===null?'Подписной бонус: ':'Трансфер: ')+p.name);if(from!==null)pay13(from,d.fee,'Продажа игрока: '+p.name);
  releasePlayerV1(p,{fee:d.fee});delete this.ensure().listings[p.id];
  if(replacement){if(replacement.team===from)replacement.active=true;else{replacement.team=from;replacement.active=true;replacement.contract=365;transferEntryV1(replacement,null,from,'sign',0);}}
  p.team=S.club;p.active=false;p.salary=d.salary;p.contract=d.days;p.paid=d.fee;p.promise13=d.role;p.morale=clamp(p.morale+3);
  transferEntryV1(p,from,S.club,'sign',d.fee);
  this.close(d,'signed','Переход завершён: '+cash(d.fee)+', зарплата '+cash(d.salary)+'/нед.');
  if(d.role==='starter')promote(p.id);else closeModal();save();render();
  if(typeof TransferReveal52!=='undefined')TransferReveal52.show({player:structuredClone(p),from:source,to:structuredClone(my()),fee:d.fee});return true;
 },
 toggleWatch(id){const p=S.players[id];if(!p||p.retired)return false;const m=this.ensure(),i=m.watchlist.indexOf(id);if(i<0)m.watchlist.push(id);else m.watchlist.splice(i,1);this.refresh();return true;},
 setListing(id,status){const p=S.players[id];if(!p||p.team!==S.club||p.retired||locked()||!['listed','available','keep'].includes(status))return false;this.ensure().listings[id]=status;this.refresh();return true;}
};
const tickBeforeMarket7=tick;tick=function(...args){const r=tickBeforeMarket7(...args);Market7.tick();return r;};
const freshBeforeMarket7=fresh,migrateBeforeMarket7=migrate;fresh=function(...args){const r=freshBeforeMarket7(...args);Market7.ensure();return r;};migrate=function(...args){const r=migrateBeforeMarket7(...args);Market7.ensure();Market7.tick();return r;};
// Legacy links can initiate negotiations, never bypass them by calling buy directly.
buy=function(id){if(typeof Market7.open==='function')return Market7.open(id);return Market7.request(id);};
const validBeforeMarket7=validSave;validSave=function(x){if(!validBeforeMarket7(x))return false;const m=x.market7;if(m===undefined)return true;if(!m||m.version!==1||!Number.isSafeInteger(m.serial)||m.serial<0||!Array.isArray(m.deals)||!Array.isArray(m.watchlist)||new Set(m.watchlist).size!==m.watchlist.length||m.watchlist.some(id=>!Number.isInteger(id)||!x.players[id])||!m.listings||typeof m.listings!=='object'||Array.isArray(m.listings)||Object.entries(m.listings).some(([id,v])=>!x.players[id]||!['listed','available','keep'].includes(v)))return false;
 const activeKeys=new Set();
 const stages=['inquiry','club_terms','club_pending','club_agreed','player_pending','player_counter','agreed',...Market7.terminal],ids=new Set();
 return m.deals.every(d=>{if(!d||!Number.isSafeInteger(d.id)||d.id<1||d.id>m.serial||ids.has(d.id)||!Number.isInteger(d.player)||!x.players[d.player]||!Number.isInteger(d.buyer)||!x.teams[d.buyer]||(d.source!==null&&(!Number.isInteger(d.source)||!x.teams[d.source]))||!stages.includes(d.stage)||!Number.isInteger(d.created)||d.created<0||d.created>x.day||!Number.isInteger(d.expires)||d.expires<d.created||(d.due!==null&&(!Number.isInteger(d.due)||d.due<d.created||d.due>d.expires))||!Number.isSafeInteger(d.initialFee)||d.initialFee<0||d.initialFee>100000000||!Number.isSafeInteger(d.minimumFee)||d.minimumFee<0||d.minimumFee>d.initialFee||!Number.isSafeInteger(d.fee)||d.fee<0||d.fee>100000000||!Number.isSafeInteger(d.salary)||d.salary<1000||d.salary>1000000||![180,365,730,1095].includes(d.days)||!['starter','rotation'].includes(d.role)||!Number.isInteger(d.clubRounds)||d.clubRounds<0||d.clubRounds>3||!Number.isInteger(d.playerRounds)||d.playerRounds<0||d.playerRounds>3||typeof d.message!=='string'||!Array.isArray(d.history)||d.history.some(e=>!e||!Number.isInteger(e.day)||e.day<d.created||e.day>x.day||typeof e.text!=='string')||(d.offeredFee!==null&&(!Number.isSafeInteger(d.offeredFee)||d.offeredFee<=0||d.offeredFee>100000000))||(d.offeredSalary!==null&&(!Number.isSafeInteger(d.offeredSalary)||d.offeredSalary<1000||d.offeredSalary>1000000))||(d.offeredDays!==null&&![180,365,730,1095].includes(d.offeredDays))||(d.offeredRole!==null&&!['starter','rotation'].includes(d.offeredRole))||(d.closed!==undefined&&(!Number.isInteger(d.closed)||d.closed<d.created||d.closed>x.day))||(d.cooldown!==undefined&&(!Number.isInteger(d.cooldown)||d.cooldown<d.created)))return false;const active=!Market7.terminal.includes(d.stage),pending=['inquiry','club_pending','player_pending'].includes(d.stage),key=d.buyer+':'+d.player;if(active&&(d.source===d.buyer||activeKeys.has(key)))return false;if(pending!==(d.due!==null))return false;if(d.stage==='club_pending'&&(d.offeredFee===null||d.clubRounds<1))return false;if(['player_pending','agreed'].includes(d.stage)&&(d.offeredSalary===null||d.offeredDays===null||d.offeredRole===null||d.playerRounds<1))return false;if(!active&&d.closed===undefined)return false;if(active)activeKeys.add(key);ids.add(d.id);return true;});};
const releaseBeforeMarket7=releasePlayerV1;releasePlayerV1=function(p,...args){const from=p?.team,r=releaseBeforeMarket7(p,...args);if(p&&p.team!==from&&S.market7)delete S.market7.listings[p.id];return r;};
