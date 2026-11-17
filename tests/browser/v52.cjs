'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});try{
 const page=await browser.newPage(),base=process.env.GAME_URL||'http://127.0.0.1:4173',errors=[],dir=process.env.BROWSER_RESULTS_DIR||'/tmp/am-v52-browser';fs.mkdirSync(dir,{recursive:true});page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith(base)||!/^https?:/.test(r.request().url())?r.continue():r.abort());
 await page.goto(base);await page.waitForFunction(()=>window.ancientStartup?.ready);assert.equal(await page.locator('.version-badge21').innerText(),'ANCIENT MANAGER / V6.0 A');
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  const fee=await page.evaluate(()=>{fresh();S.calendar21.installedDay=100000;S.events=[{id:990,name:'Next event',series:'ANCIENT',day:90,pool:100000}];S.budget=10000000;const p=S.players.find(p=>p.name==='Xxs'),old=roster(S.teams[3]).find(q=>q.role===p.role);old.team=null;old.active=false;p.team=3;p.active=true;clubState13(S.teams[3]).lastResults=[];go('market');offer(p.id,'starter');return transferTerms13(p,'starter').fee});
  await page.locator('#modal').getByRole('button',{name:'Подписать',exact:true}).click();
  const dialog=page.locator('#transferReveal52');assert(await dialog.isVisible());assert((await dialog.innerText()).includes('Xxs'));assert((await dialog.innerText()).includes('Team Yandex'));assert((await dialog.innerText()).includes(await page.evaluate(n=>cash(n),fee)));
  await dialog.locator('.t52-photo img').evaluate(i=>i.decode());
  await page.evaluate(()=>document.getAnimations().filter(a=>a.effect?.target?.closest?.('#transferReveal52')).forEach(a=>a.finish()));
  assert(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth+2),'dialog overflow '+width);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  await page.screenshot({path:dir+'/welcome-'+width+'.png',fullPage:true});
  await dialog.getByRole('button',{name:'К составу →',exact:true}).click();assert.equal(await dialog.count(),0);assert(await page.evaluate(()=>page==='squad'&&validSave(S)));
 }
 // New walkout identity, name-first timing and logos below the club names.
 for(const width of [1440,320]){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>{const p=S.players.find(p=>p.name==='Satanic');TransferReveal52.show({player:p,from:S.teams.find(t=>t.name==='PARIVISION'),to:my(),fee:234567})});
  assert.equal(await page.locator('.w6-intro .w6-first').textContent(),'Алан');assert.equal(await page.locator('.w6-intro .w6-nick').textContent(),'Satanic');assert.equal(await page.locator('.w6-intro .w6-last').textContent(),'Галлямов');
  await page.evaluate(()=>document.getAnimations().filter(a=>a.effect?.target?.closest?.('#transferReveal52')).forEach(a=>{a.pause();a.currentTime=1800}));
  assert.equal(await page.locator('.w6-photo').evaluate(e=>getComputedStyle(e).opacity),'0');
  await page.evaluate(()=>document.getAnimations().filter(a=>a.effect?.target?.closest?.('#transferReveal52')).forEach(a=>a.currentTime=7000));
  assert.equal(await page.locator('.w6-photo').evaluate(e=>getComputedStyle(e).opacity),'1');assert.equal(await page.locator('.w6-route .club-avatar12').count(),2);
  assert(await page.locator('.w6-route-club').evaluateAll(es=>es.every(e=>e.querySelector('.w6-club-logo').getBoundingClientRect().top>=e.querySelector('strong').getBoundingClientRect().bottom)));
  assert(await page.locator('#transferReveal52').evaluate(e=>e.scrollWidth<=e.clientWidth+2));await page.screenshot({path:dir+'/satanic-'+width+'.png',fullPage:true});await page.keyboard.press('Escape');
 }
 await page.evaluate(()=>{const p=S.players.find(p=>p.team===null&&!p.retired&&p.name!=='Xxs');S.budget=10000000;go('market');offer(p.id,'starter')});
 await page.locator('#modal').getByRole('button',{name:'Подписать',exact:true}).click();assert((await page.locator('#transferReveal52').innerText()).includes('Свободный агент'));await page.keyboard.press('Escape');assert.equal(await page.locator('#transferReveal52').count(),0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{const p=S.players.find(p=>p.team===null&&!p.retired);S.budget=10000000;buy(p.id,'starter')});
 assert(await page.locator('#transferReveal52').isVisible());assert.equal(await page.locator('.t52-intro').evaluate(e=>getComputedStyle(e).display),'none');await page.getByRole('button',{name:'Пропустить анимацию трансфера'}).click();
 // A missing photo must retain a usable silhouette and all controls.
 await page.evaluate(()=>{const p=owned()[0];TransferReveal52.show({player:{...p,name:'Без фото'},from:null,to:my(),fee:12345})});assert(await page.locator('#transferReveal52 .t52-silhouette').isVisible());
 await page.evaluate(async()=>{save();await saveQueue});await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);assert.equal(await page.locator('#transferReveal52').count(),0);assert(await page.evaluate(()=>validSave(S)));
 assert.deepEqual(errors,[]);console.log('PASS V5.2 browser: actual signing from Yandex and free agency; correct fee and photo; 320/390/768/1440; Escape/skip/squad; reduced motion; missing photo; no replay on reload.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
