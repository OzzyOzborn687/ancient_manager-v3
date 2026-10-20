'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),harness=require('./harness22.cjs');
const {run,elements}=harness({modelVersion:8,renderReal:true});
run('go("home");go("home");');
const pages=Array.from(run('PAGES.map(p=>p[0])'));
for(const name of pages){
 run('go('+JSON.stringify(name)+')');
 assert(elements.app.innerHTML.length>100,name+' rendered');
 assert(!/NaN|undefined|null%/.test(elements.app.innerHTML),name+' valid values');
}
run('var player=S.players.find(p=>p.team===S.club&&p.active);player.skill=97;player.fatigue=27;go("squad");');
assert(elements.app.innerHTML.includes('97')&&elements.app.innerHTML.includes('73%'));
assert(elements.app.innerHTML.includes('profile('+run('player.id')+')'));
run('go("home");var before=JSON.stringify(S),beforeSeed=S.seed;developmentView21();squad();bracketView();');
assert(run('JSON.stringify(S)===before&&S.seed===beforeSeed'),'UI projections preserve state');
run('S.active=null;S.practice13=null;S.budget=10000000;development21().base=1;var cashBefore=S.budget;var cost=DEVELOPMENT21.base.cost[1];var upgraded=upgradeDevelopment21("base");');
assert(run('upgraded&&development21().base===2&&S.budget===cashBefore-cost&&validSave(S)'),'Existing upgrade handler still works');
const html=fs.readFileSync('dist/index.html','utf8');
assert(html.includes('id="advance"')&&html.includes('saves')&&html.includes('settings'),'Core navigation remains accessible');
for(const file of ['home-reference','development-reference','squad-reference','bracket-reference']){
 const bytes=fs.readFileSync('dist/assets/neon/'+file+'.jpg');
 assert(bytes.length>10000&&bytes[0]===255&&bytes[1]===216,file+' photo');
}
assert(fs.readFileSync('dist/assets/neon/fonts/fonts.css','utf8').includes('Russo One'));
assert(!fs.readFileSync('dist/style.css','utf8').includes('@import url'));
console.log('PASS neon UI: '+pages.length+' screens, live squad values/profile actions, pure rendering, actual upgrade costs/save validation, navigation and local assets/fonts');
