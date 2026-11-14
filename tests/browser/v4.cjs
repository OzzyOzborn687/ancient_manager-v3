'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),errors=[],failures=[];
  const base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,''),dir=process.env.BROWSER_RESULTS_DIR||'/tmp/ancient-manager-browser/v4';fs.mkdirSync(dir,{recursive:true});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failures.push(r.url())});
  await page.route('**/*',r=>r.request().url().startsWith(base)||!/^https?:/.test(r.request().url())?r.continue():r.abort());
  await page.goto(base);await page.waitForFunction(()=>window.ancientStartup?.ready);
  await page.setViewportSize({width:390,height:1000});
  await page.locator('#mobileNav33c').getByRole('button',{name:'Буткемп',exact:true}).click();
  assert(await page.evaluate(()=>page==='bootcamp'));
  await page.evaluate(()=>{fresh();S.calendar21.installedDay=100000;S.events=[{id:800001,name:'Bootcamp browser fixture',series:'ANCIENT',day:10,duration:5,pool:100000,entrants:[S.club]}];S.v4.camps={};S.budget=1000000;for(const p of roster()){p.form=70;p.fatigue=50;p.progress21.initialForm=70;}campEvent4=800001;go('bootcamp');});
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});assert.equal(await page.locator('.v4-tier').count(),4);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'camp width '+width);await page.screenshot({path:dir+'/camp-'+width+'.png',fullPage:true});
  }
  const budget=await page.evaluate(()=>S.budget);
  await page.locator('.v4-tier.elite').getByRole('button',{name:'Выбрать программу',exact:true}).click();
  assert((await page.locator('#modal').innerText()).includes('$140,000'));await page.getByRole('button',{name:'Оплатить $140,000',exact:true}).click();
  assert.equal(await page.evaluate(()=>S.budget),budget-140000);
  assert(await page.locator('.v4-tier.elite').getByRole('button',{name:'Выбрано',exact:true}).isDisabled());
  assert(await page.evaluate(()=>roster().every(p=>p.form===70)),'no instant gain');
  await page.locator('.v4-camp-calendar').getByRole('button',{name:'Следующий день',exact:true}).click();
  assert.equal(await page.evaluate(()=>Object.keys(Camp4.plans()['800001:0'].days).length),1);
  assert(await page.evaluate(()=>roster().every(p=>p.v4FanSupport.applied>0)));
  const saved=await page.evaluate(async()=>{save();await saveQueue;return JSON.stringify(S.v4.camps)});
  await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);assert.equal(await page.evaluate(()=>JSON.stringify(S.v4.camps)),saved);assert(await page.evaluate(()=>validSave(S)));
  await page.evaluate(()=>{campEvent4=800001;go('bootcamp')});
  await page.getByRole('button',{name:'Отменить оставшиеся дни',exact:true}).click();const beforeRefund=await page.evaluate(()=>S.budget);
  await page.getByRole('button',{name:'Отменить программу',exact:true}).click();assert.equal(await page.evaluate(()=>S.budget),beforeRefund+96000);
  await page.evaluate(()=>{S.events.push({id:800002,name:'Online fixture',series:'ANCIENT',day:S.day+10,duration:5,pool:100000,entrants:[S.club]});campEvent4=800002;go('bootcamp')});
  // The paid camp is blocked by the earlier event; online preparation remains free.
  await page.locator('.v4-tier.online').getByRole('button',{name:'Готовиться онлайн',exact:true}).click();const beforeOnline=await page.evaluate(()=>S.budget);
  await page.getByRole('button',{name:'Подтвердить онлайн',exact:true}).click();assert.equal(await page.evaluate(()=>S.budget),beforeOnline);
  await page.evaluate(()=>go('squad'));assert((await page.locator('#app').innerText()).includes('Поддержка болельщиков'));
  await page.evaluate(()=>{S.v4.camps={};S.events=[{id:900001,name:'Major browser fixture',series:'PGL WALLACHIA',day:S.day+40,duration:8,pool:1000000}];V4.install();Qualifiers.freeze(S.events[0]);openQualifiers(900001)});
  assert.equal(await page.locator('.qualifier-invites>article').count(),15);
  assert(await page.evaluate(()=>{const q=S.events.find(e=>e.id===900001).qualification;return JSON.stringify(q.invited.map(v=>v.team))===JSON.stringify(rankTeams13().slice(0,15).map(t=>t.id))&&validSave(S)}));
  await page.screenshot({path:dir+'/major-invitations.png',fullPage:true});
  await page.getByRole('button',{name:'Регионы',exact:true}).click();assert((await page.locator('#app').innerText()).includes('Международная квалификация'));
  await page.getByRole('button',{name:'Сетка турнира →',exact:true}).click();assert.equal(await page.locator('.neon-node').count(),14);
  await page.evaluate(()=>{const e=S.events.find(e=>e.id===900001);S.day=e.day-7;Qualifiers.backgroundRegionals();Qualifiers.complete(e)});
  assert(await page.evaluate(()=>S.events.find(e=>e.id===900001).qualified13.length===16&&validSave(S)));
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);console.log('PASS V4 browser: 320/390/768/1440, paid booking, daily effect, fan support, JSON restore, cancellation refund, free online, top-15 invites and real qualifier bracket');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
