'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const fixture=require('../helpers/wildcards.cjs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[],external=[],checks=[];
 const base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
 const dir=process.env.BROWSER_RESULTS_DIR||'/tmp/ancient-manager-browser/qualifiers-wildcards';fs.mkdirSync(dir,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const url=route.request().url();if(/^https?:/.test(url)&&!url.startsWith(base)){external.push(url);return route.abort();}return route.continue();});
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
 async function prepare(series='PGL WALLACHIA',seed=1){
  await page.evaluate(fixture.setup(series,30,seed));
  await page.evaluate(()=>{selectedQualifierEvent=null;go('home');});
 }
 const request=()=>page.locator('.wildcard-request3b').getByRole('button',{name:'Запросить wildcard',exact:true});
 for(const width of [390,590,1440]){
  await page.setViewportSize({width,height:1100});await prepare();
  await page.getByRole('button',{name:'Запрос wildcard · 36%',exact:true}).click();
  assert.equal(await page.locator('.operator-card3b').count(),4);
  for(const tab of ['Приглашения','Регионы','Мой путь']){
   await page.locator('.qualifier-tabs').getByRole('button',{name:tab,exact:true}).click();
   assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),'Overflow '+width+' '+tab);
   assert.equal(await page.locator('.operator-card3b').count(),tab==='Мой путь'?4:0);checks.push({width,tab});
  }
  assert(await request().isEnabled());
  assert.match(await page.locator('.wildcard-request3b').innerText(),/36%.*40\/100/su);
  assert.match(await page.locator('.wildcard-request3b').innerText(),/−2.*0 \/ 1/su);
  await page.screenshot({path:dir+'/'+width+'-available.png'});
  await page.locator('.operator-section3b').screenshot({path:dir+'/'+width+'-operators.png'});
  await page.locator('.wildcard-request3b').screenshot({path:dir+'/'+width+'-request.png'});
  await request().click();
  assert(await request().isDisabled());
  assert.match(await page.locator('.wildcard-request3b').innerText(),/одобрил wildcard.*1 \/ 1/su);
  assert.equal(await page.evaluate(()=>Qualifiers.relationship3b('PGL WALLACHIA')),38);
  assert(await page.evaluate(()=>validSave(S)));
  await page.evaluate(async()=>{save();await saveQueue;});
  const before=await page.evaluate(()=>JSON.stringify({journal:S.qualifiers.operators3b,events:S.events,seed:S.seed}));
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
  assert(await page.evaluate(before=>JSON.stringify({journal:S.qualifiers.operators3b,events:S.events,seed:S.seed})===before,before),'Reload rerolled or changed an accepted request');
  await page.evaluate(()=>openQualifiers(0,'path'));
  assert(await request().isDisabled());
  assert.match(await page.locator('.wildcard-request3b').innerText(),/На момент запроса — шанс: 36%.*40\/100/su);
  await page.screenshot({path:dir+'/'+width+'-accepted.png'});
 }
 await prepare('ESL ONE',1000);await page.evaluate(()=>openQualifiers(0,'path'));await request().click();
 assert.match(await page.locator('.wildcard-request3b').innerText(),/отклонил запрос.*1 \/ 1/su);
 const rejected=await page.evaluate(()=>JSON.stringify(S.qualifiers.operators3b));
 await page.evaluate(async()=>{save();await saveQueue;});await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
 assert(await page.evaluate(rejected=>JSON.stringify(S.qualifiers.operators3b)===rejected,rejected));
 await page.evaluate(()=>openQualifiers(0,'path'));assert(await request().isDisabled());
 await page.screenshot({path:dir+'/refused.png'});
 await prepare('DREAMLEAGUE');await page.evaluate(()=>openQualifiers(0,'path'));await request().click();
 assert(await page.evaluate(()=>S.events.find(e=>e.wildcard3b).entrants.length===16));
 await page.getByRole('button',{name:'Открыть квалификацию →',exact:true}).click();
 await page.locator('.neon-tournament-tabs').getByRole('button',{name:'Групповой этап',exact:true}).click();
 assert.equal(await page.locator('.neon-group-panel').count(),4);
 await page.evaluate(()=>{S.day=nextEvent().day;render();});
 await page.getByRole('button',{name:'Начать квалификацию',exact:true}).click();
 await page.locator('#app').getByRole('button',{name:'Матч-центр →',exact:true}).first().click();
 await page.evaluate(async()=>{S.active.live=makeLive4(S.active,autoDraft([S.club,S.active.opponent]),[S.club,S.active.opponent]);save();await saveQueue;});
 const active=await page.evaluate(()=>JSON.stringify({active:S.active,journal:S.qualifiers.operators3b}));
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
 assert(await page.evaluate(active=>JSON.stringify({active:S.active,journal:S.qualifiers.operators3b})===active,active));
 assert(await page.evaluate(()=>S.active.live.modelVersion===8&&S.active.bo===3&&validSave(S)));
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(dir+'/report.json',JSON.stringify({checks,errors,external,acceptedReload:true,refusedReload:true,homeShortcut:true,gsl16Entry:true,exactLiveMapReload:true},null,2));
 console.log('PASS wildcard browser: 9 tab/width cases, four operator cards, home shortcut, accepted/refused real clicks and reload, GSL16 entry and exact active-map reload');await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
