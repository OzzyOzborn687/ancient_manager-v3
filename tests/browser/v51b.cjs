'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,''),errors=[],failed=[],dir=process.env.BROWSER_RESULTS_DIR||'/tmp/am-v51b-browser';fs.mkdirSync(dir,{recursive:true});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url())});
  await page.route('**/*',r=>r.request().url().startsWith(base)||!/^https?:/.test(r.request().url())?r.continue():r.abort());
  await page.goto(base);await page.waitForFunction(()=>window.ancientStartup?.ready);
  assert.equal(await page.locator('.version-badge21').innerText(),'ANCIENT MANAGER / V6.0 A');
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:1000});
   await page.evaluate(()=>{fresh();S.calendar21.installedDay=100000;S.events=[{id:920,name:'FISSURE PLAYGROUND FIRST',series:'FISSURE',day:40,duration:3,pool:100000},{id:921,name:'FISSURE PLAYGROUND NEXT',series:'FISSURE',day:45,duration:3,pool:100000}];Admissions5.install();for(const e of [...S.events])Qualifiers.freeze(e);S.day=33;S.budget=1000000;S.v4.camps={};campEvent4=920;selectedQualifierEvent=920;Camp4.book(920,'elite');go('home')});
   const hero=page.locator('.md-feature');assert.equal((await hero.locator('h1').innerText()).replace(/\s+/g,' ').toUpperCase(),'FISSURE PLAYGROUND FIRST');
   const day=hero.locator('.md-next'),skip=hero.getByRole('button',{name:'ПРОПУСТИТЬ ТУРНИР',exact:true});
   assert(await skip.isVisible()&&await skip.isEnabled());
   assert(await skip.evaluate(e=>e.previousElementSibling.textContent.includes('ПОДГОТОВИТЬ КОМАНДУ')));
   if(width===1440){const d=await day.boundingBox(),s=await skip.boundingBox();assert(s.y>=d.y+d.height-1,'skip stays in the command panel below next day');}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'overflow before skip '+width);
   await page.screenshot({path:dir+'/before-'+width+'.png',fullPage:true});
   const before=await page.evaluate(()=>({day:S.day,seed:S.seed,budget:S.budget,players:JSON.stringify(S.players)}));
   await skip.click();
   assert.equal((await hero.locator('h1').innerText()).replace(/\s+/g,' ').toUpperCase(),'FISSURE PLAYGROUND NEXT');
   assert(await page.evaluate(before=>S.day===before.day&&S.seed===before.seed&&JSON.stringify(S.players)===before.players&&S.budget===before.budget+112000&&!S.active&&validSave(S),before));
   assert(await page.evaluate(()=>selectedQualifierEvent===921&&campEvent4===921&&CampUI4.selected().id===921));
   assert.equal(await hero.getByRole('button',{name:'ПРОПУСТИТЬ ТУРНИР',exact:true}).count(),1);
   assert.equal(await page.locator('.md-home [data-qualification-event="921"]').count(),1);
   assert.equal(await page.locator('.md-home [data-qualification-event="920"]').count(),0);
   assert(await page.evaluate(()=>!skipUpcomingTournament51B(920)&&nextEvent().id===921));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'overflow after skip '+width);
   await page.screenshot({path:dir+'/after-'+width+'.png',fullPage:true});
   await page.locator('.md-camp').getByRole('button',{name:'Открыть буткемп',exact:true}).click();
   assert.equal(await page.getByLabel('Турнир для буткемпа').inputValue(),'921');
   await page.locator('.v4-tier.elite').getByRole('button',{name:'Выбрать программу',exact:true}).click();
   assert((await page.locator('#modal').innerText()).includes('FISSURE PLAYGROUND NEXT'));
   await page.locator('#modal button.primary').click();
   assert(await page.evaluate(()=>Camp4.plans()[Camp4.key(921)].status==='active'&&Camp4.plans()[Camp4.key(920)].status==='cancelled'&&validSave(S)));
   await page.evaluate(async()=>{save();await saveQueue});await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);
   await page.evaluate(()=>go('home'));assert.equal((await page.locator('.md-feature h1').innerText()).replace(/\s+/g,' ').toUpperCase(),'FISSURE PLAYGROUND NEXT');
   assert(await page.evaluate(()=>nextEvent().id===921&&Camp4.plans()[Camp4.key(921)].status==='active'&&validSave(S)));
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS V5.1 B browser: home skip in the command panel; immediate successor card; no day/seed/player changes; old camp cancelled/refunded; real successor camp booking; stale click guard; reload; 320/390/768/1440.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
