'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),base=process.env.GAME_URL||'http://127.0.0.1:4175',errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForFunction(()=>ancientStartup.ready);
  assert.equal(await page.locator('.version-badge21').innerText(),'ANCIENT MANAGER / V9.2');
  await page.evaluate(()=>{fresh();S.calendar21.installedDay=100000;S.events=[{id:990,name:'Form browser fixture',series:'ANCIENT',day:10,pool:100000,entrants:[S.club]}];S.v4.camps={};S.training='balanced';development21().staff=1;development21().recovery=1;S.budget=1000000;for(const p of roster()){p.form=80;p.fatigue=20;}Camp4.book(990,'elite');go('tactics');});
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});
   assert(await page.locator('.form92').isVisible());
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'form UI overflows '+width);
  }
  const before=await page.evaluate(()=>({skill:roster().map(p=>p.skill),form:roster().map(p=>p.form),prediction:trainingPreview33().map(p=>p.form)}));
  await page.getByRole('button',{name:'Провести тренировку',exact:true}).first().click();
  assert.deepEqual(await page.evaluate(()=>roster().map(p=>p.form)),before.prediction);
  assert.deepEqual(await page.evaluate(()=>roster().map(p=>p.skill)),before.skill);
  assert(before.prediction.every(f=>Math.abs(f-81.8)<1e-8));
  await page.evaluate(async()=>{save();await saveQueue;});
  await page.reload();await page.waitForFunction(()=>ancientStartup.ready);
  assert.deepEqual(await page.evaluate(()=>roster().map(p=>p.form)),before.prediction);
  assert(await page.evaluate(()=>validSave(S)));
  await page.evaluate(()=>{for(const p of roster()){p.form=99;p.fatigue=20;}S.training='rest';go('tactics');});
  await page.getByRole('button',{name:'Провести тренировку',exact:true}).first().click();
  assert(await page.evaluate(()=>roster().every(p=>Math.abs(p.form-98.7)<1e-8)));
  // Actual draft modal and match snapshot are created by the normal UI handlers.
  await page.evaluate(()=>{fresh();S.calendar21.installedDay=100000;S.events=[{id:990,name:'Form match fixture',series:'FISSURE',day:S.day,duration:6,pool:100000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];startEvent();playMap();});
  assert.equal(await page.locator('#modal .draft-pick').count(),10);
  assert(await page.evaluate(()=>S.active.live.formVersion92===1&&S.active.live.formBonuses92.length===2));
  await page.getByRole('button',{name:'Начать матч',exact:true}).click();
  assert(/влияние формы/i.test(await page.locator('#app').innerText()));
  await page.evaluate(()=>{const m=S.active.live;while(m.finishedSide==null&&m.clock<72000)simulateTick4(m,10);if(m.finishedSide==null)throw Error('map stalled');finishMap();});
  assert(await page.evaluate(()=>{const n=S.active.schedule[S.active.cursor];return Object.keys(n.formStats92).length===10&&Object.values(n.formStats92).every(v=>v.maps===1)&&validSave(S)}),'actual map records ten player performances once');
  assert.deepEqual(errors,[]);
  if(process.env.BROWSER_RESULTS_DIR){fs.mkdirSync(process.env.BROWSER_RESULTS_DIR,{recursive:true});await page.screenshot({path:process.env.BROWSER_RESULTS_DIR+'/form-match.png'});}
  console.log('PASS V9.2 browser: visible version/rules, four screen widths, camp training UI prediction, unchanged OVR, save/reload, 99-form rest, actual draft/modal/map and one-time per-player statistics.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
