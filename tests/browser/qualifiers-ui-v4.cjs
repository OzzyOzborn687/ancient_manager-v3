'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),fixture=require('../helpers/wildcards.cjs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[],external=[],checks=[];
 const base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
 const dir=process.env.BROWSER_RESULTS_DIR||'/tmp/ancient-manager-browser/qualifiers-ui-v4';fs.mkdirSync(dir,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const url=r.request().url();if(/^https?:/.test(url)&&!url.startsWith(base)){external.push(url);return r.abort();}return r.continue();});
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
 for(const width of [390,590,1440]){
  await page.setViewportSize({width,height:1100});
  for(const [series,season] of [['PGL WALLACHIA',30],['BLAST SLAM',30],['ESL ONE',30],['DREAMLEAGUE',30],['DREAMLEAGUE',31]]){
   await page.evaluate(fixture.setup(series,season));await page.evaluate(()=>openQualifiers(0));
   const before=await page.evaluate(()=>JSON.stringify(S));
   for(const tab of ['Приглашения','Регионы','Мой путь']){
    await page.locator('.qualifier-tabs').getByRole('button',{name:tab,exact:true}).click();
    assert.equal(await page.locator('.qualifier-tabs button[aria-pressed="true"]').innerText(),tab);
    assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),width+' '+series+' '+tab);
    if(tab==='Приглашения'){
     assert.equal(await page.locator('[data-invited-team]').count(),6);
     const index=await page.locator('.qualifier-index4').innerText();
     const values=await page.evaluate(()=>{const p=S.events.find(e=>e.id===0).qualification.player;return [p.index.toFixed(4),p.cutoff.toFixed(4)];});assert(values.every(v=>index.includes(v)));
     await page.locator('[data-invited-team] summary').first().click();assert(await page.locator('[data-invited-team] details').first().evaluate(e=>e.open));
     await page.locator('.qualifier-index4').screenshot({path:dir+'/'+width+'-'+series.replaceAll(' ','-')+'-'+season+'-index.png'});
    }
    if(tab==='Регионы'){
     assert.equal(await page.locator('.qualifier-regions article').count(),5);
     for(const r of ['EEU','EU','CN','SEA','NA']){
      await page.locator('[data-region="'+r+'"]').click();assert.equal(await page.locator('[data-preview-region]').getAttribute('data-preview-region'),r);
      assert(await page.locator('.qualifier-region-preview4 .neon-node').count()>0);
     }
     if(series==='DREAMLEAGUE'&&season===30){
      const large=await page.evaluate(()=>S.events.find(e=>e.qualifierFor===0&&e.formatKey6==='qualifier16').qualifierRegion);
      await page.locator('[data-region="'+large+'"]').click();
      await page.locator('.qualifier-stage-tabs4').getByRole('button',{name:'Плей-офф',exact:true}).click();assert(await page.locator('.qualifier-region-preview4 .neon-node').count()>0);
      await page.locator('.qualifier-stage-tabs4').getByRole('button',{name:'Групповой этап',exact:true}).click();assert.equal(await page.locator('.qualifier-region-preview4 .neon-group-panel').count(),4);
      await page.locator('[data-region="NA"]').click();
     }
     await page.getByRole('button',{name:'Открыть полную сетку →',exact:true}).click();assert(await page.locator('.qualifier-prize').count());
     await page.getByRole('button',{name:'← Регионы и квоты',exact:true}).click();assert.equal(await page.locator('[data-preview-region]').getAttribute('data-preview-region'),'NA');
    }
    checks.push({width,series,season,tab});
   }
   assert(await page.evaluate(before=>JSON.stringify(S)===before,before),'UI changed career/RNG/results');
   const first=page.locator('[data-qualifier-tab="invitations"]');await first.focus();await page.keyboard.press('Home');
   assert(await first.evaluate(e=>document.activeElement===e));await page.keyboard.press('ArrowRight');
   assert(await page.locator('[data-qualifier-tab="regions"]').evaluate(e=>document.activeElement===e&&e.getAttribute('aria-pressed')==='true'));
   await page.screenshot({path:dir+'/'+width+'-'+series.replaceAll(' ','-')+'-'+season+'.png'});
  }
 }
 await page.evaluate(()=>{S.events.push({id:999,name:'History only',series:'ESL ONE',day:0,done:true,qualification:{qualVersion:1,status:'pending'}});selectedQualifierEvent=999;go('home');});
 assert(await page.locator('[data-qualification-event="0"]').count());assert.equal(await page.locator('[data-qualification-event="999"]').count(),0);
 await page.evaluate(fixture.setup('PGL WALLACHIA',30,1,false));await page.evaluate(()=>openQualifiers(0));assert.match(await page.locator('.qualifier-index4').innerText(),/Расчёт появится/);
 await page.evaluate(()=>{const q=S.events.find(e=>e.id===0).qualification;q.status='blocked';q.reason='Нет свободных дат';render();});
 for(const tab of ['Приглашения','Регионы','Мой путь']){await page.locator('.qualifier-tabs').getByRole('button',{name:tab,exact:true}).click();assert.match(await page.locator('.qualifier-warning4').innerText(),/Нет свободных дат/);}
 await page.evaluate(()=>{S.events=[];go('qualifiers');});assert.match(await page.locator('#app').innerText(),/События старой карьеры/);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(dir+'/report.json',JSON.stringify({checks,errors,external,keyboard:true,nearestHome:true,emptyLegacy:true,pending:true,blocked:true,exactWorldAfterViews:true,regionalNavigation:true},null,2));
 console.log('PASS P4 UI: 45 format/tab/width cases, five-region selection, GSL/DE, back navigation, keyboard, exact world/RNG and pending/blocked/legacy/home states');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
