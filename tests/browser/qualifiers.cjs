'use strict';
// P1 compatibility inspection. The new three-tab screen belongs to phase 4.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[],external=[],checks=[];
 const base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
 const dir=process.env.BROWSER_RESULTS_DIR||'/tmp/ancient-manager-browser/qualifiers';fs.mkdirSync(dir,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{
  const url=r.request().url();
  if(/^https?:/.test(url)&&!url.startsWith(base)){external.push(url);return r.abort();}
  return r.continue();
 });
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
 for(const width of [390,590,1440]){
  await page.setViewportSize({width,height:1000});
  for(const [series,season,n] of [['PGL WALLACHIA',30,16],['BLAST SLAM',30,16],['ESL ONE',30,16],['DREAMLEAGUE',30,24],['DREAMLEAGUE',31,16]]){
   await page.evaluate(({series,season})=>{
    fresh();addField6();Qualifiers.initFame();S.teams[0].career13.seasonPoints=10000;
    S.events.forEach(e=>e.done=true);const id=Math.max(...S.events.map(e=>e.id))+1;
    const e={id,name:'P1 '+series,series,season,day:S.day,pool:1000000};S.events.push(e);
    Qualifiers.mark(e);Qualifiers.complete(e);window.qualifierTestId=id;go('ranking');
   },{series,season});
   assert.equal(await page.evaluate(()=>S.events.find(e=>e.id===window.qualifierTestId).qualified13.length),n);
   assert(await page.locator('#app').innerText().then(t=>t.includes('Прямое приглашение')));
   const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+2,valid:validSave(S)}));
   assert(!metrics.overflow&&metrics.valid,JSON.stringify({series,width,metrics}));
   checks.push({series,season,width,n,...metrics});
  }
 }
 assert.deepEqual(external,[],'P1 ranking inspection requests only local assets');
 await page.evaluate(()=>go('calendar'));
 await page.locator('[onclick="startEvent()"]').first().click();
 assert(await page.evaluate(()=>S.active?.event===window.qualifierTestId));
 const saved=await page.evaluate(async()=>{save();await saveQueue;return JSON.stringify(S.events.find(e=>e.id===window.qualifierTestId).qualification);});
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
 assert(await page.evaluate(saved=>S.events.some(e=>JSON.stringify(e.qualification)===saved),saved));
 assert.deepEqual(errors,[]);
 fs.writeFileSync(dir+'/report.json',JSON.stringify({checks,errors,externalDuringRanking:[],calendarStart:true,reload:true},null,2));
 console.log('PASS qualifiers P1 browser: 15 operator/width checks, local ranking, start tournament and saved qualification reload');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
