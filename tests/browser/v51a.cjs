'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,''),errors=[],failed=[],dir=process.env.BROWSER_RESULTS_DIR||'/tmp/am-v51a-browser';fs.mkdirSync(dir,{recursive:true});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url())});
  await page.route('**/*',r=>r.request().url().startsWith(base)||!/^https?:/.test(r.request().url())?r.continue():r.abort());
  await page.goto(base);await page.waitForFunction(()=>window.ancientStartup?.ready);
  assert.equal(await page.locator('.version-badge21').innerText(),'ANCIENT MANAGER / V5.1 B');
  await page.evaluate(()=>{
   fresh();S.calendar21.installedDay=100000;S.events=[{id:900,name:'Background fixture',series:'FISSURE',day:0,duration:6,pool:100000,formatKey6:'eight5',qualified13:S.teams.slice(1,9).map(t=>t.id)},{id:901,name:'Later own fixture',series:'ANCIENT',day:80,pool:100000}];S.v4.camps={};S.budget=10000000;
   for(const p of roster()){p.form=70;p.fatigue=10;p.progress21.initialForm=70;p.progress21.results=[];}S.training='balanced';go('tactics');
  });
  const predict=await page.evaluate(()=>trainingPreview33().map(p=>p.form));
  await page.getByRole('button',{name:'Провести тренировку',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>roster().map(p=>p.form)),predict);
  assert(await page.evaluate(()=>!S.active&&!busy13&&!locked()&&S.events.find(e=>e.id===900).background51.status==='running'&&validSave(S)));
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});await page.evaluate(()=>go('home'));
   assert(await page.locator('.background51').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   await page.screenshot({path:dir+'/home-'+width+'.png',fullPage:true});
  }
  await page.locator('.background51').getByRole('button',{name:'Сетка и результаты'}).click();
  assert(await page.evaluate(()=>page==='bracket'&&!S.active));assert((await page.locator('#app').innerText()).includes('Background fixture'));
  await page.evaluate(()=>{go('market');offer(S.players.find(p=>p.team===null&&!p.retired).id)});
  assert(await page.locator('#modal').isVisible());assert((await page.locator('#modal').innerText()).includes('Подписать'));
  await page.evaluate(()=>closeModal());
  // A real transfer and upgrade must remain available, not merely their navigation tabs.
  const count=await page.evaluate(()=>owned().length);
  await page.evaluate(()=>{const p=S.players.find(p=>p.team===null&&!p.retired);buy(p.id,'rotation');upgradeDevelopment21('base')});
  assert.equal(await page.evaluate(()=>owned().length),count+1);assert.equal(await page.evaluate(()=>development21().base),2);
  const saved=await page.evaluate(async()=>{save();await saveQueue;return JSON.stringify({schedule:S.events.find(e=>e.id===900).schedule6,seed:S.seed,day:S.day})});
  await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);
  assert.equal(await page.evaluate(()=>JSON.stringify({schedule:S.events.find(e=>e.id===900).schedule6,seed:S.seed,day:S.day})),saved);
  await page.evaluate(()=>go('tactics'));assert(await page.getByRole('button',{name:'Провести тренировку',exact:true}).isEnabled());
  await page.getByRole('button',{name:'Провести тренировку',exact:true}).click();
  assert(await page.evaluate(()=>page==='tactics'&&!S.active&&!busy13&&validSave(S)));
  await page.evaluate(()=>{page='market';while(!S.events.find(e=>e.id===900).done)tick();render()});
  assert(await page.evaluate(()=>page==='market'&&!S.active&&S.events.find(e=>e.id===900).reward===0&&validSave(S)));
  // Loading a saved spectator session frees the club without the player pressing 'Continue'.
  await page.evaluate(async()=>{
   fresh();S.calendar21.installedDay=100000;S.events=[{id:902,name:'Saved spectator fixture',series:'FISSURE',day:0,duration:5,pool:100000,formatKey6:'eight5',qualified13:S.teams.slice(1,9).map(t=>t.id)}];
   const read=nextEvent;nextEvent=nextBeforeBackground51;try{startBeforeBackground51()}finally{nextEvent=read}save();await saveQueue;
  });
  await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);
  assert(await page.evaluate(()=>!S.active&&trainingAvailable33()&&S.events[0].background51&&validSave(S)));
  await page.evaluate(()=>go('tactics'));assert(await page.getByRole('button',{name:'Провести тренировку',exact:true}).isEnabled());
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS V5.1 A browser: actual training, transfer, upgrade, navigation, live background bracket, calendar results, no forced auto screen, saved progress, old spectator migration, 320/390/768/1440.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
