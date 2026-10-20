'use strict';
module.exports=require('./mirror-fixture.cjs')+`
function scenario8(seed,key){
 const m=mirrorMap26(seed,['control','control']),late=key.startsWith('late'),ahead=key.endsWith('ahead');
 m.clock=late?2700:540;m.roshan.alive=true;m.roshan.progress=[0,0];m.events=[];m.v8.counts={};
 m.v8.wards=[[],[]];m.v8.intel=[[],[]];m.v8.lastFight=Array(5).fill(-300);m.nextFight=0;
 for(let s=0;s<2;s++)for(const p of m.sides[s].heroes){
  const strong=s===(ahead?0:1);p.nw=late?(strong?25000:18000):(strong?5000:3000);p.bank=400;p.level=late?24:8;p.xp=(p.level-1)**2*42;
  p.health=100;p.ultUntil=0;p.deadUntil=0;p.combatUntil=0;p.travelUntil=0;p.retreat8=false;p.nextItem=6000;
  p.zone=late?1:laneZone6(s,p.role);p.destination=p.zone;
 }
 if(late){
  for(let side=0;side<2;side++)for(const t of m.sides[side].lanes[1].towers)t.hp=0;
  for(const p of m.sides[0].heroes){p.zone=1;p.destination=1;}
  if(ahead){for(const p of m.sides[1].heroes.slice(0,3)){p.deadUntil=m.clock+80;p.zone=5;p.destination=5;}m.v8.wards[0]=[{zone:4,expires:m.clock+360}];}
  else {m.sides[0].lanes[1].melee.hp=0;m.sides[0].lanes[1].ranged.hp=0;m.sides[0].ancient.hp=4500;m.v8.front[1][1]=1;}
 }else if(!ahead){
  m.sides[0].lanes[1].towers[0].hp=450;
  for(const p of m.sides[1].heroes){p.zone=1;p.destination=1;}
 }
 Match8.observe(m);
 Match8.issue(m,1,ahead?'farm':'siege',{manual:true,target:ahead?3:1});
 if(late&&!ahead){for(const p of m.sides[0].heroes)p.nw=23000;m.sides[0].heroes[0].health=20;m.sides[0].heroes[1].health=20;}
 if(ahead&&!late||late&&!ahead){Match8.issue(m,0,'rosh');m.v8.nextThink[0]=m.clock+60;}
 Match8.observe(m);Match8.sync(m);return m;
}
function finish8(m){
 while(m.finishedSide==null&&m.clock<21600)simulateTick4(m,10);
 if(m.finishedSide==null)throw Error('v8 stalled at '+m.clock+' / '+m.plans);
 return m;
}
`;
