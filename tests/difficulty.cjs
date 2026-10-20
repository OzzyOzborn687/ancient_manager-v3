'use strict';
const assert=require('node:assert/strict'),{run,elements}=require('./harness22.cjs')({modelVersion:8,renderReal:true});
const levels={easy:[1.15,1],normal:[1,1],hard:[1,1.07],heavy:[1,1.15],impossible:[1,1.2]};
assert.equal(run('S.difficulty'),'normal');
run('function difficultyMap(level,ids=[S.club,1]){S.difficulty=level;S.seed=452191;return makeLive4({opponent:ids[1]},autoDraft(ids),ids);}');
for(const [level,expected] of Object.entries(levels)){
 for(const ids of [[0,1],[1,0],[1,2]]){
  run('var tested=difficultyMap('+JSON.stringify(level)+','+JSON.stringify(ids)+');');
  const factors=JSON.parse(run('JSON.stringify(tested.difficulty.multipliers)'));
  const want=ids.map(id=>id===0?expected[0]:level==='impossible'&&!ids.includes(0)?1:expected[1]);
  assert.deepEqual(factors,want,level+' IDs '+ids);
  const ratios=run('tested.sides.map((s,side)=>Match8.strength(tested,side)/s.heroes.reduce((n,p)=>n+unitBeforeDifficulty.call(Match8,tested,p),0))');
  ratios.forEach((r,i)=>assert(Math.abs(r-want[i])<1e-12,level+' strength multiplier once'));
  assert(run('tested.sides.every((s,side)=>s.heroes.every(p=>Math.abs(unitPower5(tested,p)/unitBeforeDifficulty.call(Match8,tested,p)-tested.difficulty.multipliers[side])<1e-12))'),level+' all combat units');
 }
}
run('var frozen=difficultyMap("easy");var frozenPower=Match8.strength(frozen,0);setCareerDifficulty("impossible");');
assert.equal(run('Match8.strength(frozen,0)'),run('frozenPower'),'Current map cannot change difficulty');
assert.equal(run('frozen.difficulty.level'),'easy');
assert(run('difficultyMap(S.difficulty).difficulty.multipliers[1]===1.2'),'Next map uses the new choice');
const probabilities=[];
for(const level of ['easy','normal','hard','heavy','impossible']){
 run('var encounter=difficultyMap('+JSON.stringify(level)+');for(const s of encounter.sides)for(const p of s.heroes){p.zone=1;p.destination=1;p.deadUntil=0;p.travelUntil=0;}var forecast=Match8.probability(encounter,{zone:1,attacker:null,highground:false,information:[0,0],ready:[{},{}],noise:0});');
 probabilities.push(run('forecast.p'));
 assert(run('forecast.powers.every((n,i)=>Math.abs(n-Match8.strength(encounter,i))<1e-10)'),'Real fight uses the adjusted strength');
}
for(let i=1;i<probabilities.length;i++)assert(probabilities[i]<probabilities[i-1],'Difficulty changes real encounter odds in order');
run('S.difficulty="heavy";var career=JSON.stringify(S);S=JSON.parse(career);migrate();');
assert(run('S.difficulty==="heavy"&&validSave(S)'),'Career choice survives serialization/migration');
assert(!run('setCareerDifficulty("prototype")'));
assert(!run('setCareerDifficulty("__proto__")'));
assert.equal(run('S.difficulty'),'heavy');
run('var backup=JSON.stringify(S);delete S.difficulty;migrate();');
assert.equal(run('S.difficulty'),'normal','Old careers default to normal');
run('S.difficulty="bad-value"');assert(!run('validSave(S)'));run('S=JSON.parse(backup);');
run('S.events=[{id:0,name:"FISSURE",series:"FISSURE",day:0,pool:1000000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];startEvent();playMap();var savedMap=JSON.stringify(S.active.live);var power=Match8.strength(S.active.live,1);save();S=JSON.parse(JSON.stringify(S));migrate();');
assert(run('S.active.live.difficulty.level==="heavy"&&Math.abs(Match8.strength(S.active.live,1)-power)<1e-12&&validSave(S)'),'Active map retains its frozen bonus after loading');
run('S.active.live.difficulty.multipliers[1]=9');assert(!run('validSave(S)'),'Reject tampered multiplier');
run('S.active.live=JSON.parse(savedMap);delete S.active.live.difficulty;var oldMap=JSON.stringify(S.active.live);S.difficulty="impossible";migrate();');
assert(run('JSON.stringify(S.active.live)===oldMap&&Difficulty.factor(S.active.live,1)===1&&validSave(S)'),'Existing maps without difficulty keep their original model and strength');
run('go("settings")');
assert.equal((elements.app.innerHTML.match(/onclick="setCareerDifficulty/g)||[]).length,5);
assert(elements.app.innerHTML.includes('Текущая карта: «Нормально»'));
run('setCareerDifficulty("easy");go("settings")');
assert(elements.app.innerHTML.includes('aria-pressed="true" onclick="setCareerDifficulty(\'easy\')"'));
run('fresh();');assert.equal(run('S.difficulty'),'normal','New career resets difficulty');
run('fresh(7);var differentClub=difficultyMap("easy",[1,7]);');
assert.deepEqual(JSON.parse(run('JSON.stringify(differentClub.difficulty.multipliers)')),[1,1.15],'Selected club is not hard-coded as team 0');
run('var otherMatch=difficultyMap("impossible",[0,1]);');
assert.deepEqual(JSON.parse(run('JSON.stringify(otherMatch.difficulty.multipliers)')),[1,1],'Impossible only boosts opponents facing the selected club');
console.log('PASS difficulty: exact 5-level factors, both sides/AI-only, one application, real fight odds, frozen maps, old saves, migration, validation and settings');
