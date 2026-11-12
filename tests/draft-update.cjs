'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),h=require('./harness22.cjs')({modelVersion:8}),{run,c,elements}=h;
assert.equal(run('DraftUpdate.audit().join("\\n")'),'');
assert.equal(run('Object.keys(DRAFT_HEROES).length'),116);
run(`const draftPicks=heroes=>heroes.map((hero,role)=>({hero,role}));
 const draftA=draftPicks(['Ursa','Puck','Axe','Lion','Oracle']);
 const draftB=draftPicks(['Drow Ranger','Storm Spirit','Tidehunter','Hoodwink','Dazzle']);`);
assert(run('DraftUpdate.evaluate(draftA,draftB).bonuses[0]>0'));
assert(run('JSON.stringify(DraftUpdate.evaluate(draftA,draftB).bonuses)===JSON.stringify(DraftUpdate.evaluate(draftB,draftA).bonuses.reverse())'));
assert(run('DraftUpdate.evaluate(draftA,draftA,{allowMirror:true}).bonuses.every(n=>n===0)'));
assert.throws(()=>run('DraftUpdate.evaluate(draftA,draftA)'),/обеими/);
assert.throws(()=>run('DraftUpdate.score(draftA.slice(1),draftB)'),/пять/);
assert.throws(()=>run('DraftUpdate.score(draftA.map(p=>({...p,role:0})),draftB)'),/позиция/);
assert.throws(()=>run('DraftUpdate.score(draftA.map((p,i)=>({...p,hero:i===0?"Unknown":p.hero})),draftB)'),/Нет данных/);
assert(run(`(()=>{const a=DraftUpdate.score(draftA,draftB),b=DraftUpdate.score(draftA.map(p=>({...p,role:(p.role+1)%5})),draftB);return a.parts.roles===0&&b.parts.roles<a.parts.roles})()`));
assert(run(`(()=>{const a=draftPicks(['Anti-Mage','Sniper','Broodmother','Bounty Hunter','Ancient Apparition']);const r=DraftUpdate.score(a,draftA);return r.details.gaps.some(g=>g.label==='Нет инициации')&&r.details.gaps.some(g=>g.label==='Нет контроля')&&r.details.gaps.some(g=>g.label.startsWith('Избыток'))})()`));
assert(run(`(()=>{const r=DraftUpdate.score(draftA,draftB);return r.details.counters.filter(c=>c.hero==='Ursa'&&c.target==='Tidehunter').length===1&&r.parts.counters===r.details.counters.length})()`));
assert(run(`(()=>{const a=draftPicks(['Anti-Mage','Sniper','Broodmother','Bounty Hunter','Ancient Apparition']),r=DraftUpdate.score(a,draftA);return r.parts.synergy===0})()`));
assert(run(`(()=>{const a=draftPicks(['Ursa','Puck','Axe','Lion','Oracle']),b=draftPicks(['Drow Ranger','Sniper','Tidehunter','Hoodwink','Dazzle']);const r=DraftUpdate.score(b,a);return r.details.conditional.some(p=>p.points===0)||DraftUpdate.score(a,b).details.conditional.some(p=>p.points===0)})()`));
// Runtime integration, exact power formula, no mutations of player/career inputs.
run(`S.events=[{id:0,name:'FISSURE',series:'FISSURE',day:0,pool:1000000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];startEvent();playMap();`);
assert(run('S.active.live.draftUpdatePending&&S.active.live.clock===0'));
assert(elements.modal.innerHTML.includes('Начать матч'));
assert(elements.modal.innerHTML.includes('Бафф')||elements.modal.innerHTML.includes('Равный драфт'));
run('advanceMap()');assert.equal(run('S.active.live.clock'),0);
run('confirmDraftUpdate()');assert.equal(run('S.active.live.draftUpdatePending'),false);
assert(run(`(()=>{const m=S.active.live,p=m.sides[0].heroes[0],players=JSON.stringify(S.players),chem=S.chem,bonus=m.draftUpdate.bonuses[0],adjusted=Match8.unit(m,p),d=m.draftUpdate;delete m.draftUpdate;const base=Match8.unit(m,p);m.draftUpdate=d;return Math.abs(adjusted/base-Math.exp(bonus*BALANCE8.power.skill))<1e-12&&players===JSON.stringify(S.players)&&chem===S.chem})()`));
assert(run(`(()=>{const m=S.active.live,d=JSON.stringify(m.draftUpdate),seed=S.seed,n=JSON.parse(JSON.stringify(m));simulateTick4(m,10);S.seed=seed;simulateTick4(n,10);return d===JSON.stringify(m.draftUpdate)&&JSON.stringify(n)===JSON.stringify(m)})()`));
// Generated drafts cover real roster positions; many seeds exercise bounds and reversal.
for(let seed=1;seed<=100;seed++){
 c.draftSeed=seed;
 assert(run(`(()=>{S.seed=draftSeed;const d=autoDraft([S.club,S.active.opponent]),a=draftPicks(d.own),b=draftPicks(d.enemy),r=DraftUpdate.evaluate(a,b),reverse=DraftUpdate.evaluate(b,a);return Number.isFinite(r.difference)&&r.bonuses.every(x=>Math.abs(x)<=5)&&r.bonuses[0]===-r.bonuses[1]&&r.bonuses[0]===-reverse.bonuses[0]})()`));
}
assert(run(`(()=>{const w=DraftUpdate.weights,old=w.conversion;w.conversion=100;const r=DraftUpdate.evaluate(draftA,draftB);w.conversion=old;return r.bonuses[0]===5&&r.bonuses[1]===-5})()`));
// Existing maps are not upgraded on load.
assert(run(`(()=>{const m=S.active.live;delete m.draftUpdate;const p=m.sides[0].heroes[0];return Match8.unit(m,p)===unitBeforeDraftUpdate.call(Match8,m,p)})()`));
console.log('PASS AM - Draft update: 116 heroes, roles, matchups, gaps, caps, reversal, 100 generated drafts, power integration, popup/start, deterministic save continuation, unchanged career inputs and legacy maps');
