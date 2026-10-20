'use strict';
// Preserve the complete 2.6 implementation and its unchanged BALANCE22 namespace.
const Legacy26={make:makeLive4,step:simulateTick4,unit:unitPower5,power:fightingPower4,position:positionScore4,
 income:income5,view:matchView,issue:issueOrder4,advance:advanceMap,toggle:toggleLive4,objectives:objectivesView4,
 assign:assign5,move:move5,fight:fight4,battle:battle5,objective:objectives4,objective6:objectives6,
 plan:choosePlan4,participants:participants5,kill:kill5,buyback:buyback4,glyph:glyph4};
const isModel8=m=>m?.modelVersion===8;
const isSpatial8=m=>m&&!m.simVersion;
const init6Before8=init6,init7Before8=init7;
init6=function(m){if(!isModel8(m))init6Before8(m);};
init7=function(m){if(!isModel8(m))init7Before8(m);};
const init22Before8=Match22.init;
Match22.init=function(m){if(isModel8(m)||m.legacyModel8==='spatial')return m;return init22Before8.call(this,m);};
makeLive4=function(...args){const m=Legacy26.make(...args);Match8.init(m);m.initialChance=positionScore4(m);return m;};
simulateTick4=function(m,dt=10){return isModel8(m)?Match8.step(m,dt):isSpatial8(m)?LegacySpatial8.step(m,dt):Legacy26.step(m,dt);};
unitPower5=function(m,p){return isModel8(m)?Match8.unit(m,p):isSpatial8(m)?LegacySpatial8.unit(m,p):Legacy26.unit(m,p);};
fightingPower4=function(m,side,context){return isModel8(m)?Match8.strength(m,side):isSpatial8(m)?LegacySpatial8.power(m,side,context):Legacy26.power(m,side,context);};
positionScore4=function(m){if(!isModel8(m))return isSpatial8(m)?LegacySpatial8.position(m):Legacy26.position(m);const a=Match8.strength(m,0),d=Match8.strength(m,1);return 100/(1+Math.exp(-Match8.B.combat.skillWeight*Math.log(Math.max(1,a)/Math.max(1,d))));};
income5=function(m,side,p,n,type){if(isModel8(m)){addGold4(p,n);p.totalEarned=(p.totalEarned||0)+n;m.accounting[side][type]+=n;}else if(isSpatial8(m))LegacySpatial8.income(m,side,p,n,type);else Legacy26.income(m,side,p,n,type);};
assign5=function(m,side){return isModel8(m)?Match8.assign(m,side):Legacy26.assign(m,side);};
move5=function(m,p,zone,defensive){return isModel8(m)?Match8.move(m,p,zone,defensive):Legacy26.move(m,p,zone,defensive);};
participants5=function(m,side,zone){return isModel8(m)?Match8.local(m,side,zone):Legacy26.participants(m,side,zone);};
choosePlan4=function(m,side){return isModel8(m)?Match8.choose(m,side):Legacy26.plan(m,side);};
fight4=function(m,attacker,highground,zone,extra){return isModel8(m)?Match8.startFight(m,attacker,highground,zone,extra):Legacy26.fight(m,attacker,highground,zone);};
battle5=function(m,dt){return isModel8(m)?Match8.battles(m,dt):Legacy26.battle(m,dt);};
objectives4=function(m,side,dt){return isModel8(m)?Match8.objectives(m,side,dt):Legacy26.objective(m,side,dt);};
objectives6=function(m,side,dt){return isModel8(m)?Match8.objectives(m,side,dt):Legacy26.objective6(m,side,dt);};
kill5=function(m,side,victim,participants){return isModel8(m)?Match8.kill(m,side,victim,participants):Legacy26.kill(m,side,victim,participants);};
const strength22Before8=Match22.strength;
Match22.strength=function(m,...args){return isModel8(m)?Match8.strength(m,...args):strength22Before8.call(this,m,...args);};
const migrateBefore8=migrate;
migrate=function(){
 const maps=[S.active?.live,S.active?.sim13?.live,S.practice13?.live];
 for(const m of maps)if(m?.sides&&!m.simVersion)m.legacyModel8='spatial';
 migrateBefore8();
 // Model is a property of the map. Loading never opts an active map into v8.
 for(const m of maps)if(isModel8(m))Match8.sync(m);
 S.newMatchModel=8;
};
const validBefore8=validSave;
validSave=function(x){
 if(!validBefore8(x))return false;
 for(const m of [x.active?.live,x.active?.sim13?.live,x.practice13?.live])if(m?.modelVersion===8){
  if(!m.v8||m.v8.schema!==8||!Array.isArray(m.v8.orders)||!Array.isArray(m.v8.intel)||!Array.isArray(m.v8.wards)||!Array.isArray(m.v8.battles)||!Array.isArray(m.v8.decisionLog)||!Number.isFinite(m.v8.accumulator))return false;
 }
 return true;
};

const buybackCostBefore8=buybackCost4;
Match8.buybackCost=p=>Math.round(BALANCE8.objectives.buybackBase+p.nw/BALANCE8.objectives.buybackNetDivisor);
buybackCost4=function(p){return p.modelVersion8===8?Match8.buybackCost(p):buybackCostBefore8(p);};
