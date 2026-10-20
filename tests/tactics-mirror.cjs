'use strict';
const assert=require('node:assert/strict'),{run}=require('./harness22.cjs')();
run(require('./mirror-fixture.cjs'));
const holdout=process.argv.includes('--holdout'),seeds=holdout?100:50,seedBase=holdout?880000:80000;
const results=run(`(()=>{
 const keys=Object.keys(BALANCE22.tactics),results=[];
 for(let a=0;a<keys.length;a++)for(let b=a+1;b<keys.length;b++){
  let wins=0,stalls=0,minutes=0;const seeds=${seeds};
  for(let i=0;i<seeds;i++)for(let swap=0;swap<2;swap++){
   const m=mirrorMap26(${seedBase}+i*431,swap?[keys[b],keys[a]]:[keys[a],keys[b]]);
   while(m.finishedSide==null&&m.minute<300)simulateTick4(m,60);
   stalls+=m.finishedSide==null;wins+=m.finishedSide===swap;minutes+=m.minute;
  }
  results.push({a:keys[a],b:keys[b],wins,maps:seeds*2,rate:wins/(seeds*2),stalls,meanMinutes:minutes/(seeds*2)});
 }
 return results;
})()`);
console.table(results);
for(const r of results){assert.equal(r.stalls,0,r.a+'/'+r.b+' must terminate');assert(r.rate>=.4&&r.rate<=.6,r.a+'/'+r.b+' outside 40–60%: '+r.wins+'/'+r.maps);}
console.log('PASS all six fixed-draft tactic mirrors, '+(seeds*2)+' maps per pair'+(holdout?' on holdout seeds':''));
