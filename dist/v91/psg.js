'use strict';
// PSG is an empty career option, not a second copy of the LGD roster.
const PSG91={
 install(){if(!S?.v5?.sceneReady||Scene5.installing||Scene5.loading)return null;let t=S.teams.find(t=>t.psg91);if(t){t.logo5='assets/club-logos/psg.svg';return t;}
  // Preserve a user-created club already named PSG; a new-career selection still opens the empty PSG template.
  if(S.teams.some(t=>t.name.trim().toLowerCase()==='psg'))return null;
  if(S.teams.length>=QUALIFIERS.scene.maxTeams)return null;
  const id=S.teams.length;t={id,name:'PSG',short:'PSG',region:'EU',homeRegion:'EU',tier:3,coach:'Менеджер',tactic:'balanced',points:0,psg91:true,sceneClub:true,fiction:false,v5Key:'psg-career',logo5:'assets/club-logos/psg.svg'};
  S.teams.push(t);S.qualifiers.scene.generated.push(id);Object.assign(clubState13(t),{budget:2000000,elo:1200});return t;
 },
 playing(){return !!S?.teams[S.club]?.psg91;},
 policy(e,base){if(!this.playing()||Qualifiers.isRegional(e))return base;const f=base||{field:format6(e).n,format:formatKey6(e),source:'',mandatory:'regional'};return {...f,direct:f.field-1,quotas:{EU:1},psgPath91:true,label:'PSG · квалификация EU',note:'PSG участвует через квалификацию EU. Победитель получает одно место на основной турнир. Размер основного турнира сохранён.'};},
 configure(){if(!this.playing())return;for(const e of S.events){if(e.done||e.background51||Qualifiers.isRegional(e)||e.id===S.active?.event||e.qualification?.policy?.psgPath91)continue;
   const children=S.events.filter(c=>c.qualifierFor===e.id);if(children.some(c=>c.done||c.id===S.active?.event||c.background51||(c.regionalState?.schedule||[]).some(n=>n.score)))continue;
   const ids=new Set(children.map(c=>c.id));S.events=S.events.filter(c=>!ids.has(c.id));
   const policy=this.policy(e,Admissions5.policy(e));delete e.qualified13;delete e.qualification13;delete e.participationConfirmed5b;
   if(e.festivalInvitation){e.psgFestivalInvitation91=e.festivalInvitation;delete e.festivalInvitation;}
   e.formatKey6=policy.format;e.qualification={qualVersion:1,majorVersion:5,status:'pending',mode:'psg-eu-v91',policy};
  }
 }
};
const initBeforePSG91=init13;init13=function(...a){const r=initBeforePSG91(...a);PSG91.install();return r;};
const freshBeforePSG91=fresh;fresh=function(id=0,...a){const chosen=!!S?.teams[id]&&(S.teams[id].psg91||S.teams[id].name.trim().toLowerCase()==='psg');const r=freshBeforePSG91(chosen?0:id,...a),t=PSG91.install();if(chosen&&t){S.club=t.id;S.budget=2000000;S.chem=75;S.coach=75;S.facility=1;S.training='balanced';S.tactic='balanced';PSG91.configure();Sponsor4A.install();Fans4.cache=null;log('PSG · соберите пятёрку на рынке. Путь на турниры: квалификации EU.');}save();render();return r;};
const migrateBeforePSG91=migrate;migrate=function(...a){const r=migrateBeforePSG91(...a);PSG91.install();PSG91.configure();return r;};
const policyBeforePSG91=Admissions5.policy;Admissions5.policy=function(e){return PSG91.policy(e,policyBeforePSG91.call(this,e));};
const installBeforePSG91=Admissions5.install;Admissions5.install=function(...a){const r=installBeforePSG91.apply(this,a);if(!this.installing&&!Scene5.loading&&!Scene5.installing)PSG91.configure();return r;};
const rowsBeforePSG91=Admissions5.rows;Admissions5.rows=function(e){const rows=rowsBeforePSG91.call(this,e);if(e.qualification?.policy?.psgPath91&&!rows.some(r=>r.team===S.club)){const c=clubState13(my());rows.push({team:S.club,region:'EU',regionalRank:rows.filter(r=>r.region==='EU').length+1,season:c.seasonPoints,elo:c.elo,busy:null,rank:rows.length+1,index:0});}return rows;};
const invitesBeforePSG91=Admissions5.selectInvites;Admissions5.selectInvites=function(rule,rows){return invitesBeforePSG91.call(this,rule,rule.psgPath91?rows.filter(r=>r.team!==S.club):rows);};
const childBeforePSG91=Admissions5.child;Admissions5.child=function(e,group,...a){if(!e.qualification?.policy?.psgPath91||group!=='EU')return childBeforePSG91.call(this,e,group,...a);const rows=e.qualification.rows;e.qualification.rows=[...rows.filter(r=>r.team===S.club),...rows.filter(r=>r.team!==S.club)];try{return childBeforePSG91.call(this,e,group,...a);}finally{e.qualification.rows=rows;}};
// The calendar finds a separate free window for each player qualifier.
const busyBeforePSG91=Qualifiers.busy;Qualifiers.busy=function(e,id,...a){if(e?.qualification?.policy?.psgPath91&&id===S.club)return null;return busyBeforePSG91.call(this,e,id,...a);};
const careerViewBeforePSG91=Career91.view;Career91.view=function(){if(!PSG91.playing())return careerViewBeforePSG91.call(this);return Interface9.titleBlock('PSG / EU QUALIFIERS','Карьера PSG','Клуб без стартового состава')+'<section class="panel"><h2>Соберите новую пятёрку PSG</h2><p>Бюджет: '+cash(S.budget)+'. Основа: '+roster().length+'/5. Подписывайте свободных агентов и договаривайтесь с клубами через трансферный рынок. Матчи доступны после заполнения всех пяти позиций.</p><p>На все турниры PSG проходит через квалификации региона EU. Участие в отборе не гарантирует выход в основной турнир.</p>'+btn('Набрать состав',"go('market')",true)+btn('Квалификации',"go('qualifiers')")+'</section>';};
const validBeforePSG91=validSave;validSave=function(x){if(!validBeforePSG91(x))return false;const ts=x.teams.filter(t=>t.psg91);return ts.length===0||ts.length===1&&ts[0].psg91===true&&ts[0].name==='PSG'&&ts[0].homeRegion==='EU'&&ts[0].region==='EU'&&!ts[0].mix91;};
