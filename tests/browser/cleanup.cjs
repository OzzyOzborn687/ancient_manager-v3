'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,''),errors=[],failed=[],dir=process.env.BROWSER_RESULTS_DIR||'/tmp/am-cleanup-browser/audit';fs.mkdirSync(dir,{recursive:true});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url())});
  await page.route('**/*',route=>route.request().url().startsWith(base)||!route.request().url().startsWith('http')?route.continue():route.abort());
  await page.goto(base);await page.waitForFunction(()=>window.ancientStartup?.ready);
  assert(await page.evaluate(()=>S.teams.length===52&&validSave(S)));
  for(const key of await page.evaluate(()=>PAGES.map(p=>p[0]))){await page.evaluate(key=>go(key),key);assert((await page.locator('#app').innerText()).length>20,key);}
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});
   await page.evaluate(()=>{go('home');document.querySelector('#mobileNav33c').remove();document.querySelector('#broadcastStatus33c').remove();render();render();});
   assert.equal(await page.locator('#mobileNav33c').count(),1);assert.equal(await page.locator('#broadcastStatus33c').count(),1);
   assert.equal(await page.locator('#mobileNav33c button').count(),7);assert.equal(await page.locator('#mobileNav33c').locator('button').filter({hasText:'Команда'}).count(),1);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'navigation overflow '+width);
   await page.screenshot({path:dir+'/navigation-'+width+'.png',fullPage:true});
  }
  await page.evaluate(async()=>{S.budget=321000;save();await saveQueue;window.cleanupRaw=localStorage.getItem('ancient-manager-v1');window.cleanupFresh=fresh;fresh=()=>{throw Error('<img src=x onerror=alert(1)>')};await startFreshCareer();});
  assert.equal(await page.locator('#app img').count(),0,'error text is escaped');
  assert(await page.evaluate(()=>S.budget===321000&&localStorage.getItem('ancient-manager-v1')===cleanupRaw&&localStorage.getItem('ancient-manager-before-new-career')===cleanupRaw));
  await page.evaluate(async()=>{fresh=cleanupFresh;await startFreshCareer();});
  assert(await page.evaluate(()=>ancientStartup.ready&&validSave(S)&&S.budget===startingBudget(0)&&localStorage.getItem('ancient-manager-before-new-career')===cleanupRaw));
  await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);assert(await page.evaluate(()=>validSave(S)&&S.teams.length===52&&!!readSnapshot('ancient-manager-before-new-career')));
  await page.evaluate(()=>{S.calendar21.installedDay=100000;S.events=[{id:799,name:'Coach browser fixture',series:'FISSURE',day:0,pool:1000000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];startEvent();go('match')});
  assert.equal(await page.getByRole('button',{name:'Поручить турнир тренеру',exact:true}).count(),1);
  await page.evaluate(()=>{playMap();confirmDraftUpdate();go('match')});
  assert.equal(await page.getByRole('button',{name:'Поручить турнир тренеру',exact:true}).count(),1);
  assert(await page.locator('.coach-controls33').getByRole('button').isVisible());
  assert(await page.getByRole('button',{name:'Быстрая симуляция матча',exact:true}).isVisible());
  await page.evaluate(()=>{fresh();S.calendar21.installedDay=100000;S.events=[{id:799,name:'Quick browser fixture',series:'FISSURE',day:0,pool:1000000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];startEvent();go('match')});
  await page.getByRole('button',{name:'Быстрая симуляция матча',exact:true}).click();
  assert(await page.locator('#modal').evaluate(e=>e.open));assert.equal(await page.locator('#modal .draft-pick').count(),10);
  assert.equal(await page.evaluate(()=>S.active.live.clock),0);
  await page.evaluate(()=>skipMatch22());assert.equal(await page.evaluate(()=>S.active.live.clock),0);
  await page.evaluate(async()=>{save();await saveQueue});await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);
  assert(await page.evaluate(()=>S.active.live.draftUpdatePending&&S.active.live.quickSimulationPending&&S.active.live.clock===0));
  await page.getByRole('button',{name:'Начать быструю симуляцию',exact:true}).click();
  await page.waitForFunction(()=>S.active?.maps?.length===1&&!S.active.live&&!skipRunning22,{},{timeout:90000});
  assert(await page.evaluate(()=>S.active.maps[0].durationSec>0&&S.active.maps[0].modelVersion===8&&validSave(S)));
  await page.evaluate(async()=>{confirmDraftUpdate();await skipMatch22()});assert.equal(await page.evaluate(()=>S.active.maps.length),1);
  if(await page.evaluate(()=>!S.active.seriesDone)){
   await page.evaluate(()=>playMap());assert(await page.getByRole('button',{name:'Начать матч',exact:true}).isVisible());assert.equal(await page.evaluate(()=>S.active.live.clock),0);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS cleanup browser: every screen; recreated navigation without duplicates at 320/390/768/1440; visible bootcamp; escaped errors; failed/successful new-career backups; reload; one visible coach action; real quick simulation gated by a draft dialog, pending-map reload and single result.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
