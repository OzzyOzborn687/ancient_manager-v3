'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),base=process.env.GAME_URL||'http://127.0.0.1:4173',dir=process.env.BROWSER_RESULTS_DIR||'/tmp/am-v5-browser',errors=[],failed=[];fs.mkdirSync(dir,{recursive:true});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url())});
  await page.route('**/*',route=>route.request().url().startsWith(base)||!route.request().url().startsWith('http')?route.continue():route.abort());
  await page.goto(base);await page.waitForFunction(()=>window.ancientStartup?.ready);
  assert(await page.evaluate(()=>S.teams.length===51&&validSave(S)));
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});await page.evaluate(()=>{sceneRegion5='ALL';go('scene5')});
   assert.equal(await page.locator('.v5-club').count(),51);
   await page.evaluate(async()=>{const imgs=[...document.querySelectorAll('.v5-club img')];for(const img of imgs)img.loading='eager';await Promise.all(imgs.map(img=>img.decode()));});
   assert(await page.evaluate(()=>[...document.querySelectorAll('.v5-club img')].every(img=>img.naturalWidth>0&&getComputedStyle(img.parentElement).backgroundColor==='rgba(0, 0, 0, 0)')));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'horizontal overflow '+width);
   await page.screenshot({path:dir+'/scene-'+width+'.png',fullPage:true});
  }
  await page.getByRole('button',{name:'SA',exact:true}).click();assert.equal(await page.locator('.v5-club').count(),7);
  await page.evaluate(()=>{S.calendar21.installedDay=100000;const e=S.events.find(e=>circuitSeries(e)==='DREAMLEAGUE');S.events=[e];Qualifiers.freeze(e);openQualifiers(e.id)});
  assert.equal(await page.locator('.qualifier-invites>article').count(),6);assert((await page.locator('.v5-rules').innerText()).includes('4 TBC'));
  await page.screenshot({path:dir+'/dreamleague-admissions.png',fullPage:true});
  assert(await page.evaluate(()=>validSave(S)));
  const saved=await page.evaluate(async()=>{save();await saveQueue;return JSON.stringify({teams:S.teams,players:S.players,v5:S.v5,events:S.events})});
  await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);
  assert.equal(await page.evaluate(()=>JSON.stringify({teams:S.teams,players:S.players,v5:S.v5,events:S.events})),saved);assert(await page.evaluate(()=>validSave(S)));
  await page.evaluate(()=>{fresh();S.calendar21.installedDay=100000;const e=S.events.find(e=>circuitSeries(e)==='THE INTERNATIONAL');S.events=[e];Qualifiers.freeze(e);const child=S.events.find(e=>e.v5Qualifier&&e.qualifierRegion==='NA');S.club=child.entrants[0];S.day=child.day;showBracket(child.id)});
  assert((await page.locator('#app').innerText()).includes('Инвайт'));
  await page.evaluate(()=>startEvent());assert(await page.evaluate(()=>!!S.active&&S.active.formatKey6.startsWith('qualifier5n')&&S.active.entrants.length<=4&&validSave(S)));
  await page.screenshot({path:dir+'/small-na-qualifier.png',fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('PASS V5 browser: 51 loaded transparent club logos; 320/390/768/1440; region filter; published admissions; persistence; real small NA qualifier start.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
