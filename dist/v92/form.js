'use strict';
// Daily preparation and series performance are the only sources of form in V9.2.
const Form92={
 bonus(f){return .25*(f-75);},
 decay(f){return f>=97?.3:f>=92?.2:f>=85?.1:0;},
 rate(f){return f<70?2:f<85?1.2:f<92?.7:f<97?.4:.2;},
 energy(f){return f<=25?1:f<=45?.75:f<=65?.4:0;},
 multiplier(p){
  const d=p.team==null?null:development21(p.team),b=p.team==null?null:Camp4.current(p.team);
  return Math.min(1.5,DEVELOPMENT21.staff.form[(d?.staff||1)-1]*(b?1+V4_CONFIG.camp.tiers[b.tier].growth:1));
 },
 daily(p,mode,fatigue,program=null){
  if(p.retired||p.form92?.day===S.day)return;
  const f=p.form,gain=mode==='rest'?(program?.kind==='psych'?.1:program?.kind==='practice'?.15:0):
   this.rate(f)*(mode==='intensive'?1.25:1)*this.energy(fatigue)*this.multiplier(p),loss=this.decay(f);
  p.form=clamp(f+gain-loss,35,99);
  p.form92={...(p.form92||{}),day:S.day,gain,decay:loss};
  const b=p.team==null?null:Camp4.current(p.team),row=b?.days[S.day]?.players[p.id];
  if(row)row.form=Math.max(0,p.form-f);
 },
 observe(m){
  if(m.formObserved92)return;
  const background=Background51.simulating?Background51.jobs().find(e=>e.background51.state?.sim13?.live===m)?.background51.state:null;
  const a=m.scope13==='scrim'?S.practice13:background||S.active;
  const n=m.scope13==='scrim'?a:a?.schedule?.[a.cursor];
  if(!n)return;
  if(m.scope13!=='scrim'&&!n.pair.map(v=>resolve6(a,v)).every(id=>m.sides.some(s=>s.team===id)))return;
  m.formObserved92=true;
  const stats=n.formStats92??={};
  for(const [side,s] of m.sides.entries())for(const h of s.heroes){
   if(!Number.isInteger(h.playerId13))continue;
   const z=stats[h.playerId13]??={team:s.team,role:h.role,k:0,d:0,a:0,nw:0,kills:0,maps:0};
   z.k+=h.k||0;z.d+=h.d||0;z.a+=h.a||0;z.nw+=h.nw||0;
   z.kills+=side?m.deaths||0:m.kills||0;z.maps++;
  }
 },
 settle(ids,stats={},scrim=false){
  for(const team of ids)for(const p of roster(S.teams[team])){
   const mine=stats[p.id],other=Object.values(stats).find(q=>q.team!==team&&q.role===p.role);
   let score=0,quality='Обычное выступление';
   if(mine&&other){
    score=((mine.k+mine.a)/Math.max(1,mine.kills)-(other.k+other.a)/Math.max(1,other.kills))*.5+
     clamp((other.d-mine.d)/Math.max(1,mine.maps)*.08,-.3,.3)+
     (p.role<3?clamp(Math.log((mine.nw+1)/(other.nw+1))*.5,-.4,.4):0);
    quality=score>=.15?'Хорошее выступление':score<=-.15?'Слабое выступление':quality;
   }
   let delta=score>=.15?.4:score<=-.15?-.3:.1;
   const g=p.form92??={day:S.day,gain:0,decay:0};
   if(scrim){
    if(g.scrimDay!==S.day){g.scrimDay=S.day;g.scrimGain=0;}
    delta=delta>0?Math.max(0,Math.min(delta/2,.2-(g.scrimGain||0))):delta/2;
    g.scrimGain=(g.scrimGain||0)+Math.max(0,delta);
   }
   const old=p.form;p.form=clamp(old+delta,35,99);
   g.lastSeries={day:S.day,delta:p.form-old,quality,scrim,details:mine&&other?
    'Участие в убийствах '+Math.round(100*(mine.k+mine.a)/Math.max(1,mine.kills))+'% / '+Math.round(100*(other.k+other.a)/Math.max(1,other.kills))+'%; смертей за карту '+(mine.d/Math.max(1,mine.maps)).toFixed(1)+' / '+(other.d/Math.max(1,other.maps)).toFixed(1)+(p.role<3?'; экономика '+Math.round(mine.nw/Math.max(1,mine.maps))+' / '+Math.round(other.nw/Math.max(1,other.maps)):'')+'. Игрок / соперник своей позиции.':
    'Недостаточно личной статистики: нейтральная оценка.'};
  }
 },
 panel(preview=null){
  const f=avg(roster().map(p=>p.form));
  return '<section class="panel form92"><span class="eyebrow">FORM / V9.2</span><h2>Готовность к матчу</h2>'+
   '<p>Форма '+f.toFixed(1)+' / 99 → <b>'+Arena33C.signed(this.bonus(f))+' к силе</b>. Нейтральная форма — 75.</p>'+
   (preview?'<p>Следующая тренировка: прирост '+Arena33C.signed(avg(preview.map(p=>p.formGain)))+
    ', спад −'+avg(preview.map(p=>p.formDecay)).toFixed(2)+', итог '+Arena33C.signed(avg(preview.map(p=>p.form))-f)+
    ' формы (с учётом предела 99).</p>':'')+
   '<p>Усталость: до 25 — 100% прироста; до 45 — 75%; до 65 — 40%; выше 65 — 0%. Тренировка: +3 усталости, интенсивная: +6 (до улучшений восстановления).</p>'+
   '<p>Ежедневный спад: 85–91,99 → −0,1; 92–96,99 → −0,2; 97–99 → −0,3. Штаб: до +20% скорости. Буткемпы: +15% / +30% / +50%; общий множитель — до ×1,5. Отдых не даёт тренировочного прироста.</p>'+
   '<p>За серию: хорошее выступление +0,4; обычное +0,1; слабое −0,3. Для саппортов учитываются помощь команде и выживаемость, без требования фарма. КВ дают половину изменения, положительный прирост — до +0,2 за день.</p>'+
   roster().map(p=>'<div class="news"><b>'+esc(p.name)+' · '+p.form.toFixed(1)+'</b><p>'+
    (p.form92?.lastSeries?esc(p.form92.lastSeries.quality)+' · '+Arena33C.signed(p.form92.lastSeries.delta)+' · '+esc(p.form92.lastSeries.details):
     'Статистика формы появится после серии.')+'</p></div>').join('')+'</section>';
 },
 valid(p,day){
  const g=p.form92;if(g===undefined)return true;
  return !!g&&Number.isInteger(g.day)&&g.day>=0&&g.day<=day&&Number.isFinite(g.gain)&&g.gain>=0&&g.gain<=3.75+1e-8&&
   Number.isFinite(g.decay)&&g.decay>=0&&g.decay<=.3&&
   (g.scrimDay===undefined||Number.isInteger(g.scrimDay)&&g.scrimDay>=0&&g.scrimDay<=day&&Number.isFinite(g.scrimGain)&&g.scrimGain>=0&&g.scrimGain<=.2+1e-8)&&
   (g.lastSeries===undefined||g.lastSeries&&Number.isInteger(g.lastSeries.day)&&g.lastSeries.day>=0&&g.lastSeries.day<=day&&
    Number.isFinite(g.lastSeries.delta)&&g.lastSeries.delta>=-.3-1e-8&&g.lastSeries.delta<=.4+1e-8&&typeof g.lastSeries.scrim==='boolean');
 }
};

// Preserve OVR, morale, contracts, recovery and camp accounting around the form calculation.
const growthBeforeForm92=playerGrowth13;
playerGrowth13=function(p,mode,...a){
 const form=p.form,fatigue=p.fatigue,day=p.growth8?.lastDay,plan=S.v8?.plans[p.id],program=plan?.day===S.day?plan:null;
 const r=growthBeforeForm92(p,mode,...a);
 if(!p.retired&&day!==S.day){p.form=form;Form92.daily(p,program?'rest':mode,fatigue,program);}
 return r;
};
// Runs inside the existing tick, before its final save, including skipped days and free agents.
const campDailyBeforeForm92=Camp4.daily;
Camp4.daily=function(...a){for(const p of S.players)Form92.daily(p,'rest',p.fatigue);return campDailyBeforeForm92.apply(this,a);};
const impactBeforeForm92=resultImpact13;
resultImpact13=function(m){const counted=m.careerResult13,r=impactBeforeForm92(m);if(!counted)Form92.observe(m);return r;};
const nodeBeforeForm92=recordNode6;
recordNode6=function(a,n,...args){
 const had=!!n.score,r=nodeBeforeForm92(a,n,...args);
 if(!had&&n.score&&!n.formApplied92&&!n.forfeitV12){
  n.formApplied92=true;Form92.settle(n.pair.map(v=>resolve6(a,v)),n.formStats92);delete n.formStats92;
 }
 return r;
};
const stepBeforeForm92=simulateTick4;
simulateTick4=function(m,...a){const r=stepBeforeForm92(m,...a);if(m.finishedSide!=null)Form92.observe(m);return r;};
const scrimBeforeForm92=resumeScrim13;
resumeScrim13=async function(...a){
 const job=S.practice13,state=S,r=await scrimBeforeForm92(...a);
 if(S===state&&job?.maps.length===2&&!job.formApplied92){
  job.formApplied92=true;Form92.settle([S.club,job.team],job.formStats92,true);save();render();
 }
 return r;
};
// Snapshots opt into the new match rule. Already started maps keep their old formula.
const makeBeforeForm92=makeLive4;
makeLive4=function(...a){
 const m=makeBeforeForm92(...a);
 if(isModel8(m)){
  m.formVersion92=1;m.formBonuses92=m.sides.map(s=>Form92.bonus(avg(s.heroes.map(p=>p.form))));
  m.initialChance=positionScore4(m);
 }
 return m;
};
const unitBeforeForm92=Match8.unit;
Match8.unit=function(m,p){
 const result=unitBeforeForm92.call(this,m,p);if(!m.formVersion92)return result;
 return result/(1+((p.form??this.B.power.formReference)-this.B.power.formReference)*this.B.power.form)*
  Math.exp(this.B.power.skill*Form92.bonus(p.form??75));
};
const strengthBeforeForm92=strength;
strength=function(t=my()){
 const f=avg(roster(t).map(p=>p.form));
 return strengthBeforeForm92(t)+(.25-.15)*(f-75)*patchMultiplierV1(t.id);
};
const matchViewBeforeForm92=Interface9.match;
Interface9.match=function(...a){
 const m=S.active?.live;
 return matchViewBeforeForm92.apply(this,a)+(m?.formVersion92?'<section class="panel"><h2>Влияние формы</h2><p>'+
  m.sides.map((s,i)=>esc(S.teams[s.team].name)+': '+Arena33C.signed(m.formBonuses92[i])+' к силе').join(' · ')+
  '</p><p>Поправка каждой позиции: 0,25 × (форма − 75). Усталость учитывается отдельно.</p></section>':'');
};
const validBeforeForm92=validSave;
validSave=function(x){return validBeforeForm92(x)&&x.players.every(p=>Form92.valid(p,x.day));};

// Legacy player values above 99 are capped without changing an ongoing map snapshot.
const migrateBeforeForm92=migrate;
migrate=function(...a){const r=migrateBeforeForm92(...a);for(const p of S.players)p.form=Math.min(99,p.form);return r;};
