'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],failed=[];
  const base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,''),dir=process.env.BROWSER_RESULTS_DIR||'test-results/browser-arena33c';fs.mkdirSync(dir,{recursive:true});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url())});
  await page.route('**/*',r=>r.request().url().startsWith(base)||!/^https?:/.test(r.request().url())?r.continue():r.abort());
  await page.goto(base);await page.waitForFunction(()=>window.ancientStartup?.ready);await page.evaluate(()=>fresh());
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});
   for(const name of ['home','squad','tactics','calendar','market']){
    await page.evaluate(n=>go(n),name);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),name+' '+width);
   }
   await page.evaluate(()=>go('home'));
   if(width<=390){assert(await page.locator('#mobileNav33c').isVisible());await page.locator('#mobileNav33c').getByRole('button',{name:'Команда',exact:true}).click();assert(await page.evaluate(()=>page==='squad'));}
   await page.evaluate(()=>go('squad'));
   await page.getByRole('button',{name:'Таблица',exact:true}).click();assert(await page.locator('.neon-squad table').isVisible());
   await page.getByRole('button',{name:'Карточки',exact:true}).click();assert.equal(await page.locator('.c-player').count(),5);
   await page.locator('.c-player').first().getByRole('button',{name:'Сравнить',exact:true}).click();
   assert(await page.getByLabel('Кандидат для сравнения').isVisible());assert((await page.locator('#modal').innerText()).includes('SIN состава'));
   assert(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth+2));
   await page.getByRole('button',{name:'Закрыть',exact:true}).click();
   if(width===390||width===1440){await page.screenshot({path:dir+'/squad-'+width+'.png',fullPage:true});await page.evaluate(()=>go('home'));await page.screenshot({path:dir+'/home-'+width+'.png',fullPage:true});}
  }
  await page.evaluate(()=>{S.events=[{id:0,name:'FISSURE',series:'FISSURE',day:0,pool:1000000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];startEvent();playMap();});
  assert(await page.locator('#modal .c-draft-reasons').first().isVisible());assert.equal(await page.locator('#modal .draft-pick').count(),10);
  await page.waitForFunction(()=>[...document.querySelectorAll('#modal .draft-hero-portrait img')].every(i=>i.complete&&i.naturalWidth>0));
  await page.getByRole('button',{name:'Начать матч',exact:true}).click();
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});
   for(const label of ['Обзор','Команды','Карта','Драфт','События']){
    await page.getByRole('tab',{name:label,exact:true}).click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),label+' '+width);
   }
   await page.getByRole('tab',{name:'Карта',exact:true}).click();assert(await page.locator('.c-tactical-map').isVisible());
   if(width===390||width===1440)await page.screenshot({path:dir+'/map-'+width+'.png',fullPage:true});
  }
  await page.getByRole('tab',{name:'Обзор',exact:true}).click();
  await page.locator('[onclick="issueOrder4(\'farm\')"]').click();assert(await page.evaluate(()=>S.active.live.v8.orders[0].type==='farm'));
  await page.getByRole('button',{name:'Подробнее: Фарм керри',exact:true}).click();assert((await page.locator('#modal').innerText()).includes('Цена:'));
  await page.getByRole('button',{name:'Закрыть',exact:true}).click();
  await page.evaluate(()=>{const m=S.active.live;for(let n=0;n<6;n++)simulateTick4(m,10);save()});await page.evaluate(()=>saveQueue);
  const payload=await page.evaluate(()=>JSON.stringify(S.active.live));await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);
  assert.equal(await page.evaluate(()=>JSON.stringify(S.active.live)),payload,'save continuity');
  await page.evaluate(()=>{const m=S.active.live;while(m.finishedSide==null&&m.clock<21600)simulateTick4(m,10);if(m.finishedSide==null)throw Error('Map stalled');window.reportCopy33c={report13:structuredClone(buildReport13(m))};document.querySelector('#app').innerHTML=reportView13(reportCopy33c)});
  assert(await page.getByRole('heading',{name:'Хронология ключевых событий',exact:true}).isVisible());
  assert((await page.locator('.c-debrief').innerText()).includes('Δ золота'));
  for(const width of [390,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.screenshot({path:dir+'/debrief-'+width+'.png',fullPage:true});}
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log('PASS browser Arena 3.3 C: 320/390/768/1440, navigation, lineup modes, comparison, local portraits, draft, tabs, map, orders, reload and saved debrief');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
