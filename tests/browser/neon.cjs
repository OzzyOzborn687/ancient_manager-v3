const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:590,height:1280},deviceScaleFactor:1});
 const resultDir=process.env.BROWSER_RESULTS_DIR||'test-results/browser-neon';fs.mkdirSync(resultDir,{recursive:true});
 const baseURL=process.env.GAME_URL||'http://127.0.0.1:4173';
 const errors=[],failures=[],checks=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(baseURL)&&r.status()>=400)failures.push(r.url())});
 await page.route('**/*',r=>r.request().url().startsWith(baseURL)||!/^https?:/.test(r.request().url())?r.continue():r.abort());
 await page.goto(baseURL,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready,null,{timeout:20000});
 await page.evaluate(()=>{pauseLive4(false);fresh();S.seed=314159;S.budget=2117490;development21().base=2;development21().staff=1;development21().preparation=1;go('home');});
 await page.evaluate(()=>document.fonts.ready);
 const pages=await page.evaluate(()=>PAGES.map(p=>p[0]));
 for(const width of [390,590,1440]){
  await page.setViewportSize({width,height:width===1440?1000:1280});
  for(const name of pages){
   await page.evaluate(name=>go(name),name);
   await page.waitForFunction(()=>[...document.querySelectorAll('.neon-scene img')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:20000});
   const result=await page.evaluate(()=>{
    const bright=[],overflow=[];
    for(const el of document.querySelectorAll('#app *')){
     const rect=el.getBoundingClientRect(),s=getComputedStyle(el),rgba=s.backgroundColor.match(/[\d.]+/g)?.map(Number);
     if(!rect.width||!rect.height||s.visibility==='hidden'||s.display==='none')continue;
     if(rgba&&rgba[0]*.2126+rgba[1]*.7152+rgba[2]*.0722>190&&(rgba[3]??1)>.85&&rect.width*rect.height>1000)bright.push(el.tagName+'.'+el.className);
     if(rect.right>innerWidth+3&&!el.closest('.table-wrap,.neon-bracket-viewport,.neon-rr-rounds,.scroll,.map-scroll,.draft-wrap'))overflow.push(el.tagName+'.'+el.className);
    }
    return {documentOverflow:document.documentElement.scrollWidth>innerWidth+2,bright:[...new Set(bright)].slice(0,8),overflow:[...new Set(overflow)].slice(0,8)};
   });
   checks.push({width,page:name,...result});
   if(['home','development','squad','match','saves','settings'].includes(name))await page.screenshot({path:resultDir+'/'+name+'-'+width+'-viewport.png'});
  }
 }
 await page.setViewportSize({width:590,height:1280});await page.evaluate(()=>go('squad'));
 await page.waitForFunction(()=>{const img=document.querySelector('.neon-title-art img');return img?.complete&&img.naturalWidth>0;},null,{timeout:20000});
 // Real profile, development purchase, navigation, save and bracket controls.
 await page.locator('.player-link20').first().click();assert(await page.evaluate(()=>page==='player'&&scrollY===0));
 await page.evaluate(()=>{S.budget=10000000;go('development');});
 const before=await page.evaluate(()=>({base:development21().base,cash:S.budget,cost:DEVELOPMENT21.base.cost[development21().base]}));
 await page.locator('[onclick="upgradeDevelopment21(\'base\')"]').click();
 assert(await page.evaluate(before=>development21().base===before.base+1&&S.budget===before.cash-before.cost,before));
 await page.evaluate(()=>{selectedBracket=S.events.find(e=>formatKey6(e)==='pgl').id;bracketTabV1='groups';go('bracket');});
 await page.getByRole('button',{name:'Вписать',exact:true}).first().click();
 const fit=await page.locator('.neon-graph').first().evaluate(e=>e.style.transform);
 await page.getByRole('button',{name:'100%',exact:true}).first().click();
 assert.notEqual(fit,await page.locator('.neon-graph').first().evaluate(e=>e.style.transform));
 await page.getByRole('button',{name:'Плей-офф',exact:true}).click();
 assert(await page.locator('.neon-graph-label.lower').count());
 // All eight bracket formats: readable cards and collision-free playoff nodes.
 const graphChecks=[];
 for(const key of ['pgl','blast','dreamSwiss','dreamGroup','ti','esl','fissure','cup']){
  for(const tab of ['groups','playoffs']){
   await page.setViewportSize({width:1440,height:1000});
   await page.evaluate(({key,tab})=>{
    S.events.push({id:99991,name:'UI bracket fixture',formatKey6:key,day:S.day+30});
    selectedBracket=99991;bracketTabV1=tab;NeonTournament.zoom=1;go('bracket');
   },{key,tab});
   await page.evaluate(()=>document.fonts.ready);
   const issues=await page.evaluate(()=>{
    const issues=[];
    for(const graph of document.querySelectorAll('.neon-graph')){
     const cards=[...graph.querySelectorAll('article.neon-node')];
     for(let i=0;i<cards.length;i++){
      const card=cards[i],rect=card.getBoundingClientRect(),rows=card.querySelectorAll('.neon-bucket-team,.neon-match-team');
      for(const row of rows)if(row.getBoundingClientRect().bottom>rect.bottom-2)issues.push('clipped '+(card.dataset.record||card.dataset.matchId));
      for(let j=i+1;j<cards.length;j++){
       const other=cards[j].getBoundingClientRect();
       if(Math.min(rect.right,other.right)-Math.max(rect.left,other.left)>2&&Math.min(rect.bottom,other.bottom)-Math.max(rect.top,other.top)>2)issues.push('overlapping '+card.dataset.matchId+'/'+cards[j].dataset.matchId);
      }
     }
    }
    return issues;
   });
   graphChecks.push({key,tab,issues});assert.equal(issues.length,0,key+' '+tab+' '+issues.join(', '));
   if(['pgl','dreamGroup','blast','esl'].includes(key)){
    const fitButton=page.getByRole('button',{name:'Вписать',exact:true}).first();
    if(await fitButton.count())await fitButton.click();
    const board=page.locator('.neon-bracket-shell,.neon-rr-groups').first();
    await board.screenshot({path:resultDir+'/'+key+'-'+tab+'.png'});
   }
   await page.evaluate(()=>{S.events=S.events.filter(e=>e.id!==99991);});
  }
 }
 // Actual model-8 controls keep changing the real match beneath the new skin.
 await page.evaluate(()=>{fresh();S.events=[{id:0,name:'FISSURE',series:'FISSURE',day:0,pool:1000000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];startEvent();playMap();go('match');});
 assert(await page.evaluate(()=>S.active.live.modelVersion===8));
 for(const width of [390,590,1440]){
  await page.setViewportSize({width,height:1000});
  await page.screenshot({path:resultDir+'/live-match-'+width+'.png'});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Active map width '+width);
 }
 await page.locator('[onclick="issueOrder4(\'farm\')"]').click();
 assert(await page.evaluate(()=>S.active.live.orders[0].type==='farm'));
 await page.locator('[onclick="changeMatchTactic22(\'late\')"]').click();
 assert(await page.evaluate(()=>S.active.live.tactics22[0]==='late'));
 await page.evaluate(()=>go('saves'));assert(await page.locator('#app button').count()>0);
 await page.evaluate(()=>{save();});await page.evaluate(()=>saveQueue);
 assert(await page.evaluate(()=>!!localStorage.getItem('ancient-manager-v1')));
 const beforeDay=await page.evaluate(()=>{fresh();S.events.forEach(e=>{if(e.day<=S.day)e.day=S.day+30});go('home');return S.day;});
 await page.locator('#advance').click();assert(await page.evaluate(day=>S.day>day,beforeDay));
 const report={baseURL,graphChecks,errors,failedLocalAssets:failures,checks,interactionChecks:['profile','upgrade and budget','bracket fit/100%','model-8 farm order and tactic','playoff tab','save persistence','next day'],fonts:await page.evaluate(()=>document.fonts.check('16px "Russo One"'))};
 fs.writeFileSync(resultDir+'/report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({...report,checks:checks.filter(c=>c.documentOverflow||c.bright.length)},null,2));
 assert.equal(errors.length,0);assert.equal(failures.length,0);assert(!checks.some(c=>c.documentOverflow),'No whole-page horizontal overflow');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
