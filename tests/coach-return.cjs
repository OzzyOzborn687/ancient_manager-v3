'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const files=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
const els={},doc={hidden:false,getElementById:id=>els[id]??={style:{},classList:{add(){},remove(){}},innerHTML:'',value:'',textContent:'',showModal(){},close(){}},addEventListener(){}};
const c=vm.createContext({console,structuredClone,URL,Blob,setTimeout,clearTimeout,setInterval,clearInterval,document:doc,localStorage:{getItem(){return null},setItem(){}},addEventListener(){}});
vm.runInContext('window=globalThis',c);for(let f of files)vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),c,{filename:f});const run=s=>vm.runInContext(s,c);
run(`save=()=>{};render=()=>{};toast=()=>{};
function fixtureCoach13(ai=false){fresh();S.seed=314159;S.events=[{id:0,name:'Coach fixture',series:'FISSURE',day:0,duration:3,pool:1000000}];let schedule=ai?[{id:0,pair:[2,3],bo:3,label:'Other clubs'},{id:1,pair:[0,1],bo:3,label:'Own series'}]:[{id:0,pair:[0,1],bo:3,label:'Own series'}];let a=S.active={event:0,format6:true,formatKey6:'fissure',phase:'circuit',stage6:'playoffs',stage:'Own series',schedule,cursor:0,round:0,totalRounds:1,pairs:[],bracket:[],entrants:[0,1,2,3,4,5,6,7],seeds:{},placements:{},score:[0,0],maps:[],live:null,seriesDone:false,opponent:1,bo:3,matchKey:ai?'old-key':'0-0',autoCoach13:true};return a;}
`);
(async()=>{
run(`(()=>{let a=fixtureCoach13();a.live=makeLive4(a,autoDraft([0,1]),[0,1]);simulateTick4(a.live,10);a.live.mode='live';a.live.autoCoach13=true;a.score=[1,0];let before=JSON.stringify({clock:a.live.clock,gold:a.live.gold,heroes:a.live.sides,score:a.score}),node=a.schedule[0];S=JSON.parse(JSON.stringify(S));migrate();a=S.active;if(!jobPanel13().includes('Вернуться к обычной симуляции'))throw Error('Button missing');if(!returnToManual13())throw Error('Cannot return');if(a.autoCoach13||a.manualRequested13||a.live.autoCoach13||a.live.mode!=='step'||S.matchMode!=='step'||liveRunning4)throw Error('Wrong mode');let after=JSON.stringify({clock:a.live.clock,gold:a.live.gold,heroes:a.live.sides,score:a.score});if(before!==after)throw Error('Progress changed');if(returnToManual13())throw Error('Duplicate handoff');if(!matchView().includes('Управление матчем'))throw Error('Default match UI missing');})()`);
console.log('Paused/saved own map: exact clock, gold, heroes and score retained; step mode restored PASS');
run(`fixtureCoach13();objectivesOriginalCoach13=objectives6;objectives6=()=>{};breatheOriginalCoach13=breathe13;breathe13=async state=>{let m=S.active?.live;if(m&&m.clock>0&&!S.active.manualRequested13){capturedCoach13={clock:m.clock,gold:m.gold};returnToManual13();}return true;};`);
await run('autoTournament13()');
assert(run(`!busy13&&!S.active.autoCoach13&&!S.active.manualRequested13&&S.active.live.clock===capturedCoach13.clock&&S.active.live.gold===capturedCoach13.gold&&S.active.maps.length===0&&S.active.score.join(':')==='0:0'&&S.active.live.mode==='step'`));
run('objectives6=objectivesOriginalCoach13;breathe13=breatheOriginalCoach13;');
console.log('Running trainer: request stops current own map at yield, no replay or duplicate result PASS');
run(`letOther13=fixtureCoach13(true);letOther13.sim13={cursor:0,pair:[2,3],score:[1,0],maps:[{winner:2,duration:1800,gold:4000}],live:makeLive4({opponent:3},autoDraft([2,3]),[2,3])};letOther13.sim13.live.clock=1000;letOther13.manualRequested13=true;S=JSON.parse(JSON.stringify(S));migrate();mapOriginalCoach13=finishSimMap13;finishCallsCoach13=0;finishSimMap13=async(m,state)=>{if(m!==S.active.sim13.live||m.clock!==1000)throw Error('Pending AI map was discarded');finishCallsCoach13++;m.finishedSide=0;return true;};`);
await run('autoTournament13()');
assert(run(`finishCallsCoach13===1&&!busy13&&!S.active.autoCoach13&&!S.active.sim13&&S.active.cursor===1&&S.active.schedule[0].score==='2:0'&&S.active.opponent===1&&S.active.matchKey==='0-1'&&S.active.score.join(':')==='0:0'&&validSave(S)`));
run('finishSimMap13=mapOriginalCoach13;');
console.log('Saved partial AI series: completes exactly once, then returns to next own series PASS');
assert(run(`(()=>{let a=fixtureCoach13();a.entrants=[1,2,3,4,5,6,7,8];a.spectator13=true;return !canReturnToManual13()&&!returnToManual13()&&!jobPanel13().includes('Вернуться к обычной симуляции');})()`));
console.log('Spectator and scrim modes are not converted into player participation PASS');
console.log('PASS coach return');
})().catch(e=>{console.error(e);process.exitCode=1;});

