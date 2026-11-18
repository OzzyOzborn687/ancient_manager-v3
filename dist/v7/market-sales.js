'use strict';
// Real club bids for players the manager has explicitly put on the transfer list.
const ensureBeforeSales7=Market7.ensure;Market7.ensure=function(){const m=ensureBeforeSales7.call(this);m.incoming??=[];m.lastSalesDay??=S.day;return m;};
Market7.incomingOffers=function(){return (S.market7?.incoming||[]).filter(d=>d.source===S.club).slice().reverse();};
Market7.sale=function(id){return (S.market7?.incoming||[]).find(d=>d.id===id&&d.source===S.club)||null;};
Market7.saleReplacement=function(p){return S.players.filter(q=>!q.retired&&q.team===p.team&&!q.active&&q.role===p.role&&q.id!==p.id).sort((a,b)=>b.skill-a.skill||a.id-b.id)[0]||null;};
Market7.saleReason=function(d){const p=S.players[d.player],buyer=S.teams[d.buyer];
 if(!p||p.retired||p.team!==d.source||d.source!==S.club)return 'Игрок сменил клуб или больше недоступен.';
 if(S.day>d.expires)return 'Срок предложения истёк.';
 if(!buyer||d.buyer===S.club)return 'Покупатель больше недоступен.';
 if(this.busy(d.source)||this.busy(d.buyer))return 'Один из клубов участвует в турнире. Подписание пока невозможно.';
 if(p.active&&!this.saleReplacement(p))return 'Для продажи основного игрока сначала нужна замена той же позиции из своего резерва.';
 const players=roster(buyer),starter=players.find(q=>q.role===p.role),budget=buyer.career13?.budget??0;
 if(!starter||p.skill<=starter.skill+.5)return 'Покупатель больше не нуждается в усилении этой позиции.';
 if(p.skill>avg(players.map(q=>q.skill))+5)return 'Игрок не готов переходить в клуб такого спортивного уровня.';
 if(S.players.filter(q=>q.team===buyer.id&&!q.active&&!q.retired).length>=3)return 'Покупатель больше не располагает местом в составе.';
 if(budget<d.fee+d.salary*12)return 'Покупателю больше не хватает средств на трансфер и зарплату.';
 return '';
};
Market7.rejectSale=function(id){const d=this.sale(id);if(!d||!['offered','player_pending'].includes(d.stage))return false;d.stage='rejected';d.due=null;d.closed=S.day;this.note(d,'Предложение отклонено менеджером. Игрок остаётся в клубе.');this.refresh();return true;};
Market7.acceptSale=function(id){const d=this.sale(id);if(!d||d.stage!=='offered'||locked())return false;const reason=this.saleReason(d);if(reason)return this.fail(reason);d.stage='player_pending';d.due=this.next(d);d.expires=Math.max(d.expires,d.due+3);this.note(d,'Условия продажи приняты. Игрок рассматривает контракт покупателя: '+cash(d.salary)+'/нед., 365 дней, основа.');this.refresh();return true;};
Market7.saleTick=function(){const m=this.ensure();let changed=false;
 for(const d of m.incoming){if(!['offered','player_pending'].includes(d.stage))continue;const p=S.players[d.player];
  if(!p||p.retired||p.team!==d.source||d.source!==S.club){d.stage='invalid';d.due=null;d.closed=S.day;this.note(d,'Игрок больше недоступен для этой сделки.');changed=true;continue;}
  if(S.day>d.expires){d.stage='expired';d.due=null;d.closed=S.day;this.note(d,'Срок предложения истёк. Продажа не состоялась.');changed=true;continue;}
  if(d.stage!=='player_pending'||d.due>S.day)continue;
  const reason=this.saleReason(d);if(reason){d.stage='invalid';d.due=null;d.closed=S.day;this.note(d,reason);changed=true;continue;}
  const buyer=S.teams[d.buyer],old=roster(buyer).find(q=>q.role===p.role),replacement=p.active?this.saleReplacement(p):null;
  pay13(d.buyer,-d.fee,'Трансфер: '+p.name);pay13(d.source,d.fee,'Продажа игрока: '+p.name);releasePlayerV1(p,{fee:d.fee});
  if(replacement)replacement.active=true;old.active=false;
  p.team=d.buyer;p.active=true;p.contract=d.days;p.salary=d.salary;p.paid=d.fee;p.promise13='starter';p.morale=clamp(p.morale+3);
  transferEntryV1(p,d.source,d.buyer,'sign',d.fee);buyer.career13.chem=clamp(buyer.career13.chem-8);if(replacement)S.chem=clamp(S.chem-8);
  d.stage='sold';d.due=null;d.closed=S.day;this.note(d,'Игрок принял контракт. Продажа завершена за '+cash(d.fee)+'.');log(p.name+' перешёл в '+buyer.name+' за '+cash(d.fee)+'.');changed=true;
 }
 if(S.day%7===0&&m.lastSalesDay<S.day){m.lastSalesDay=S.day;changed=true;let count=0;
  const listed=S.players.filter(p=>p.team===S.club&&!p.retired&&m.listings[p.id]==='listed').sort((a,b)=>a.id-b.id);
  for(const p of listed){if(count>=2)break;if(m.incoming.some(d=>d.player===p.id&&(['offered','player_pending'].includes(d.stage)||S.day-(d.closed??d.created)<14)))continue;
   const salary=Math.max(1000,Math.ceil(p.salary*1.12/100)*100),fee=Math.max(1000,Math.round(value(p)*.95/1000)*1000);
   const candidates=S.teams.filter(t=>t.id!==S.club&&!this.busy(t.id)).map(t=>({t,ps:roster(t),old:roster(t).find(q=>q.role===p.role)})).filter(x=>x.old&&p.skill>x.old.skill+.5&&p.skill<=avg(x.ps.map(q=>q.skill))+5&&(x.t.career13?.budget||0)>=fee+salary*12&&S.players.filter(q=>q.team===x.t.id&&!q.active&&!q.retired).length<3).sort((a,b)=>(p.skill-b.old.skill)-(p.skill-a.old.skill)||a.t.id-b.t.id);
   const buyer=candidates[0]?.t;if(!buyer)continue;
   const d={id:++m.serial,player:p.id,buyer:buyer.id,source:S.club,created:S.day,expires:S.day+7,due:null,stage:'offered',fee,salary,days:365,role:'starter',message:'',history:[]};
   this.note(d,buyer.name+' предлагает '+cash(fee)+' за игрока и контракт '+cash(salary)+'/нед.');m.incoming.push(d);count++;log('Предложение о покупке '+p.name+' от '+buyer.name+'.');
  }
 }if(changed)save();
};
const tickBeforeSales7=Market7.tick;Market7.tick=function(...args){const r=tickBeforeSales7.apply(this,args);this.saleTick();return r;};
const validBeforeSales7=validSave;validSave=function(x){if(!validBeforeSales7(x))return false;const m=x.market7;if(!m)return true;if(m.lastSalesDay!==undefined&&(!Number.isInteger(m.lastSalesDay)||m.lastSalesDay<0||m.lastSalesDay>x.day))return false;if(m.incoming===undefined)return true;if(!Array.isArray(m.incoming))return false;
 const ids=new Set(m.deals.map(d=>d.id)),active=new Set();return m.incoming.every(d=>{if(!d||!Number.isSafeInteger(d.id)||d.id<1||d.id>m.serial||ids.has(d.id)||!Number.isInteger(d.player)||!x.players[d.player]||!Number.isInteger(d.buyer)||!x.teams[d.buyer]||!Number.isInteger(d.source)||!x.teams[d.source]||d.buyer===d.source||!['offered','player_pending','sold','rejected','expired','invalid'].includes(d.stage)||!Number.isInteger(d.created)||d.created<0||d.created>x.day||!Number.isInteger(d.expires)||d.expires<d.created||!Number.isSafeInteger(d.fee)||d.fee<=0||d.fee>100000000||!Number.isSafeInteger(d.salary)||d.salary<1000||d.salary>1000000||d.days!==365||d.role!=='starter'||(d.due!==null&&(!Number.isInteger(d.due)||d.due<d.created||d.due>d.expires))||(d.stage==='player_pending')!==(d.due!==null)||typeof d.message!=='string'||!Array.isArray(d.history)||d.history.some(e=>!e||!Number.isInteger(e.day)||e.day<d.created||e.day>x.day||typeof e.text!=='string')||(d.closed!==undefined&&(!Number.isInteger(d.closed)||d.closed<d.created||d.closed>x.day)))return false;if(['offered','player_pending'].includes(d.stage)){const key=d.source+':'+d.player;if(active.has(key))return false;active.add(key);}else if(d.closed===undefined)return false;ids.add(d.id);return true;});};
