'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,''),errors=[],failed=[],dir=process.env.BROWSER_RESULTS_DIR||'/tmp/am-v5c-browser';fs.mkdirSync(dir,{recursive:true});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url())});
  await page.route('**/*',r=>r.request().url().startsWith(base)||!/^https?:/.test(r.request().url())?r.continue():r.abort());
  await page.goto(base);await page.waitForFunction(()=>window.ancientStartup?.ready);
  assert.equal(await page.locator('.version-badge21').innerText(),'ANCIENT MANAGER / V8.0 BETA');
  assert((await page.locator('#broadcastStatus33c').innerText()).includes('V6.0'));
  // Offline from all external sites: inspect every actual core-club squad.
  for(const id of await page.evaluate(()=>S.teams.filter(t=>t.tier===1).map(t=>t.id))){
   await page.evaluate(id=>{S.club=id;go('squad')},id);
   assert.equal(await page.locator('.c-player .portrait20 img').count(),5);
   await page.locator('.c-player .portrait20 img').evaluateAll(async imgs=>{for(const i of imgs)i.loading='eager';await Promise.all(imgs.map(i=>i.decode()))});
   assert(await page.locator('.c-player .portrait20 img').evaluateAll(imgs=>imgs.every(i=>i.naturalWidth>100&&!i.hidden)));
  }
  await page.evaluate(()=>{const ps=S.players.filter(p=>!p.fiction&&p.team===null);document.getElementById('app').innerHTML=ps.map(p=>portrait20(p,true)).join('')});
  await page.locator('#app .portrait20 img').evaluateAll(async imgs=>Promise.all(imgs.map(i=>i.decode())));
  await page.evaluate(()=>{fresh();S.calendar21.installedDay=100000;S.events=[{id:800,name:'Training fixture',series:'ANCIENT',day:10,pool:100000,entrants:[S.club]}];S.v4.camps={};S.training='balanced';S.budget=1000000;for(const p of roster()){p.form=70;p.fatigue=20;p.progress21.initialForm=70;p.progress21.lastOfficialDay=null;p.progress21.results=[];}go('tactics')});
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   assert((await page.locator('.training-form33').innerText()).includes('Обычные тренировки повышают форму'));
   await page.screenshot({path:dir+'/training-'+width+'.png',fullPage:true});
  }
  const predicted=await page.evaluate(()=>trainingPreview33().map(p=>p.form));
  await page.getByRole('button',{name:'Провести тренировку',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>roster().map(p=>p.form)),predicted);assert(predicted.every(f=>f>70));
  await page.evaluate(()=>{Camp4.book(800,'elite');go('tactics')});
  assert((await page.locator('.training-form33').innerText()).includes('Championship Campus'));
  const before=await page.evaluate(()=>roster().map(p=>p.form)),campPrediction=await page.evaluate(()=>trainingPreview33().map(p=>p.form));
  await page.getByRole('button',{name:'Провести тренировку',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>roster().map(p=>p.form)),campPrediction);assert(campPrediction.every((f,i)=>f-before[i]>predicted[i]-70));
  const saved=await page.evaluate(async()=>{save();await saveQueue;return roster().map(p=>p.form)});
  await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);assert.deepEqual(await page.evaluate(()=>roster().map(p=>p.form)),saved);
  await page.evaluate(()=>profile(roster()[0].id));await page.locator('.profile-photo20 img').evaluate(i=>i.decode());
  assert(await page.evaluate(()=>validSave(S)));assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS V5.0 C browser: matching header and status versions; 70 core and 7 free-agent photos load with external networking blocked; training and camp predictions equal actual gains; responsive 320/390/768/1440; saved form and profile survive reload.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
