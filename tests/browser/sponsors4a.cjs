'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),errors=[],base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,''),dir=process.env.BROWSER_RESULTS_DIR||'/tmp/ancient-manager-browser/sponsors4a';fs.mkdirSync(dir,{recursive:true});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForFunction(()=>window.ancientStartup?.ready);
  await page.evaluate(()=>{fresh();S.calendar21.installedDay=100000;S.events=[{id:70000,name:'Future fixture',series:'ANCIENT',day:10000,duration:1,pool:1000}];S.trophies=0;clubState13(my()).seasonPoints=0;delete S.sponsors4a;Sponsor4A.install();go('sponsors')});
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert((await page.locator('#app').innerText()).includes('$120,000'));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.screenshot({path:dir+'/sponsors-'+width+'.png',fullPage:true});}
  const before=await page.evaluate(()=>S.budget);
  await page.evaluate(()=>{for(const id of [70001,70002]){const e={id,name:'Championship '+id,day:S.day,pool:1000000,done:true,champion:S.club};S.events.push(e);Sponsor4A.settle(e)}render()});
  assert.equal(await page.evaluate(()=>S.budget),before+200000);
  await page.getByRole('dialog').waitFor({state:'visible'});assert((await page.locator('#modal').innerText()).includes('$144,000'));
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>{const e=document.getElementById('modal');return e.getBoundingClientRect().width<=innerWidth&&e.scrollWidth<=e.clientWidth+2}));await page.screenshot({path:dir+'/raise-'+width+'.png'});}
  const paid=await page.evaluate(()=>S.budget);await page.getByRole('button',{name:'Понятно',exact:true}).click();assert.equal(await page.evaluate(()=>S.budget),paid);
  await page.evaluate(async()=>{save();await saveQueue});await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);assert.equal(await page.evaluate(()=>S.budget),paid);assert(await page.evaluate(()=>!Sponsor4A.pending()&&validSave(S)));
  await page.evaluate(()=>{go('sponsors');S.day=6;tick();render()});assert(await page.evaluate(()=>S.ledger.some(r=>r.day===7&&r.text==='Спонсоры'&&r.n===144000)));
  assert.deepEqual(errors,[]);console.log('PASS V4.0 A browser: sponsors/raise dialog at 320/390/768/1440, actual premiums, acknowledgement, save/reload, actual increased weekly payment');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
