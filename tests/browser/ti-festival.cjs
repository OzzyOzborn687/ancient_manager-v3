'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const resultDir=process.env.BROWSER_RESULTS_DIR||'test-results/browser-ti-festival';fs.mkdirSync(resultDir,{recursive:true});
 const base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
 const errors=[],failed=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url());});
 await page.route('**/*',r=>r.request().url().startsWith(base)||!/^https?:/.test(r.request().url())?r.continue():r.abort());
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ancientStartup?.ready);
 const original=await page.evaluate(async()=>{
  fresh();const e=ti2027();S.day=e.day+50;e.done=true;e.place=1;e.champion=S.club;e.reward=10800000;
  S.budget=20000000;S.prizes=e.reward;S.trophies=1;S.history=[{day:e.day,event:e.name,win:true,maps:[]}];
  save();await saveQueue;return JSON.parse(JSON.stringify(S));
 });
 await page.goto(base+'/?ti2027=aegis',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ancientStartup?.ready);
 assert(await page.evaluate(()=>S.day===ti2027().day&&!ti2027().done&&S.tiRecovery.festival===TI_FESTIVAL.version));
 assert.deepEqual(await page.evaluate(()=>readSnapshot(TI_FESTIVAL.backup).state),original);
 assert.equal(new URL(page.url()).search,'');
 await page.locator('#modal').waitFor({state:'visible'});
 await page.screenshot({path:resultDir+'/opening-390.png'});
 await page.locator('[onclick="enterTIArena()"]').first().click();
 await page.evaluate(()=>document.fonts.ready);
 for(const width of [320,390,590,1440]){
  await page.setViewportSize({width,height:width===1440?1000:1000});
  for(const tab of ['arena','clubs','contracts','chronicle']){
   await page.evaluate(tab=>openTIHub(tab),tab);
   const metrics=await page.evaluate(()=>{
    const modal=document.querySelector('#modal'),bad=[];
    for(const el of modal.querySelectorAll('*')){
     const r=el.getBoundingClientRect(),style=getComputedStyle(el);
     if(!r.width||!r.height||style.display==='none'||style.visibility==='hidden'||el.closest('[aria-hidden="true"]'))continue;
     if(r.right>innerWidth+2||r.left< -2)bad.push(el.tagName+'.'+el.className);
    }
    return {pageOverflow:document.documentElement.scrollWidth>innerWidth+2,modalOverflow:modal.scrollWidth>modal.clientWidth+2,bad:[...new Set(bad)]};
   });
   checks.push({width,tab,...metrics});
   assert(!metrics.pageOverflow&&!metrics.modalOverflow&&!metrics.bad.length,JSON.stringify(checks.at(-1)));
   if(width!==320)await page.screenshot({path:resultDir+'/'+tab+'-'+width+'.png'});
  }
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>openTIHub('arena'));
 await page.locator('[onclick="chooseTIPlan(\'tempo\')"]').click();
 assert.equal(await page.locator('.ti-plans [aria-pressed="true"]').count(),1);
 await page.locator('[onclick="openTIHub(\'clubs\')"]').click();
 assert.equal(await page.locator('.ti-clubs article').count(),16);
 const club=await page.evaluate(()=>S.club);
 await page.locator('[onclick="chooseTIPrediction('+club+')"]').click();
 assert.equal(await page.locator('.ti-clubs [aria-pressed="true"]').count(),1);
 await page.evaluate(()=>openTIHub('arena'));
 await page.locator('[onclick="startTIFestival()"]').first().click();
 await page.evaluate(()=>{playMap();const m=S.active.live;m.finishedSide=0;m.tiTrailed=true;recordResult6(m);openTIHub('contracts');});
 const cash=await page.evaluate(()=>S.budget);
 await page.locator('[onclick="claimTIReward(\'first\')"]').click();
 assert.equal(await page.evaluate(()=>S.budget),cash+10000);
 assert(await page.locator('[onclick="claimTIReward(\'first\')"]').isDisabled());
 await page.evaluate(()=>{closeModal();go('saves');});
 await page.locator('.ti-festival-saves [onclick="askLoad(\'ancient-manager-before-ti-festival\')"]').click();
 await page.locator('#confirmLoad').click();
 await page.waitForFunction(day=>S.day===day&&!slotBusy,original.day);
 await page.evaluate(()=>saveQueue);
 assert.equal(await page.evaluate(()=>S.day),original.day);
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
 assert.equal(await page.evaluate(()=>S.day),original.day);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>showTICeremony());
 assert.equal(await page.locator('.ti-opening>.ti-aegis').evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 fs.writeFileSync(resultDir+'/report.json',JSON.stringify({checks,errors,failed,deepLink:true,originalRestored:true,rewards:true,reducedMotion:true},null,2));
 console.log('PASS TI browser: 16 responsive views, explicit return, ceremony, plan, oracle, sponsor reward, original restore and reduced motion');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
