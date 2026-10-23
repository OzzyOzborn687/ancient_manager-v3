'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[],external=[],checks=[];
 const base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
 const dir=process.env.BROWSER_RESULTS_DIR||'/tmp/ancient-manager-browser/qualifiers-calendar';fs.mkdirSync(dir,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const url=route.request().url();if(/^https?:/.test(url)&&!url.startsWith(base)){external.push(url);return route.abort();}return route.continue();});
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
 for(const width of [390,590,1440]){
  await page.setViewportSize({width,height:1100});
  await page.evaluate(()=>{
   fresh();S.seed=551;S.calendar21.installedDay=100000;
   S.events=[{id:0,name:'Dense DreamLeague',series:'DREAMLEAGUE',season:30,day:30,duration:8,pool:1000000},{id:9,name:'Official commitment',series:'FISSURE',day:2,duration:16,entrants:[S.club]}];
   clubState13(my()).elo=200;my().fame=0;Qualifiers.markCareer(S.events[0]);Qualifiers.freeze(S.events[0]);go('home');
  });
  assert(await page.locator('#app').innerText().then(t=>t.includes('Плотный календарь')));
  assert(await page.evaluate(()=>S.events.find(e=>e.id===0).day===30));
  await page.locator('#nav').getByRole('button',{name:/Квалификации/}).click();
  for(const tab of ['Приглашения','Регионы','Мой путь']){
   await page.locator('.qualifier-tabs').getByRole('button',{name:tab,exact:true}).click();
   assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));checks.push({width,tab});
   await page.screenshot({path:dir+'/'+width+'-'+tab+'.png'});
  }
 }
 await page.locator('.qualifier-tabs').getByRole('button',{name:'Мой путь',exact:true}).click();
 await page.getByRole('button',{name:'Открыть квалификацию →',exact:true}).click();
 assert(await page.locator('#app').innerText().then(t=>/Календарь и заявки/iu.test(t)));
 await page.evaluate(()=>{S.events.find(e=>e.id===9).done=true;const child=S.events.find(e=>e.qualifierFor===0&&e.entrants.includes(S.club));S.day=child.day;Qualifiers.ensureRegistrations3();render();});
 await page.getByRole('button',{name:'Начать квалификацию',exact:true}).click();
 assert(await page.evaluate(()=>S.active?.formatKey6==='qualifier16'&&S.active.bo===3&&validSave(S)));
 await page.locator('#app').getByRole('button',{name:'Матч-центр →',exact:true}).first().click();
 await page.evaluate(async()=>{S.active.live=makeLive4(S.active,autoDraft([S.club,S.active.opponent]),[S.club,S.active.opponent]);save();await saveQueue;});
 const before=await page.evaluate(()=>JSON.stringify({active:S.active,registrations:S.events.filter(e=>e.registration3).map(e=>e.registration3)}));
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
 assert.equal(await page.evaluate(()=>JSON.stringify({active:S.active,registrations:S.events.filter(e=>e.registration3).map(e=>e.registration3)})),before);
 assert(await page.evaluate(()=>validSave(S)&&S.active.live.modelVersion===8));
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(dir+'/report.json',JSON.stringify({checks,errors,external,compressedMainUnmoved:true,gsl16ManualStart:true,exactMapAndRegistrationReload:true},null,2));
 console.log('PASS phase-3 browser: 9 tab/width cases, compressed timeline, real GSL16 entry and exact live-map/registration reload');await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
