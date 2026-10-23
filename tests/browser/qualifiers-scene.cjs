'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 const page=await browser.newPage(),errors=[],external=[],checks=[];
 const base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
 const dir=process.env.BROWSER_RESULTS_DIR||'/tmp/ancient-manager-browser/qualifiers-scene';fs.mkdirSync(dir,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const url=route.request().url();if(/^https?:/.test(url)&&!url.startsWith(base)){external.push(url);return route.abort();}return route.continue();});
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
 async function fixture(invited,large=false){
  await page.evaluate(({invited,large})=>{
   fresh();S.seed=555;S.calendar21.installedDay=100000;S.events=[{id:0,name:large?'DreamLeague invitation':'PGL invitation',series:large?'DREAMLEAGUE':'PGL WALLACHIA',season:30,day:50,duration:8,pool:1000000}];
   clubState13(my()).elo=invited?2000:200;clubState13(my()).seasonPoints=invited?100000:0;my().fame=invited?100:0;
   Qualifiers.markCareer(S.events[0]);Qualifiers.freeze(S.events[0]);selectedQualifierEvent=null;go('home');
  },{invited,large});
 }
 for(const width of [390,590,1440]){
  await page.setViewportSize({width,height:1100});await fixture(true);
  assert(await page.locator('#app').innerText().then(t=>t.includes('Ваш клуб приглашён на турнир')));
  await page.screenshot({path:dir+'/invitation-'+width+'.png'});
  await fixture(false);
  assert(await page.locator('#app').innerText().then(t=>t.includes('Ваш путь — региональная квалификация')));
  await page.locator('#nav').getByRole('button',{name:/Квалификации/}).click();
  for(const tab of ['Приглашения','Регионы','Мой путь']){
   await page.locator('.qualifier-tabs').getByRole('button',{name:tab,exact:true}).click();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
   assert(!overflow,'Qualifier tab overflow '+width+' '+tab);checks.push({width,tab,overflow});
   await page.screenshot({path:dir+'/'+width+'-'+tab+'.png'});
  }
  await page.locator('.qualifier-tabs').getByRole('button',{name:'Мой путь',exact:true}).click();
  await page.getByRole('button',{name:'Открыть квалификацию →',exact:true}).click();
  assert(await page.locator('#app').innerText().then(t=>t.includes('ТРОФЕЙ КВАЛИФИКАЦИИ')));
  assert.equal(await page.locator('.neon-node').count(),14);
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2));
  await page.screenshot({path:dir+'/bracket-'+width+'.png'});
 }
 await page.evaluate(()=>{S.day=nextEvent().day;render();});
 await page.getByRole('button',{name:'Начать квалификацию',exact:true}).click();
 assert(await page.evaluate(()=>Number.isInteger(S.active?.qualifierFor)&&S.active.bo===3));
 await page.locator('#app').getByRole('button',{name:'Матч-центр →',exact:true}).first().click();
 assert(await page.evaluate(()=>page==='match'));
 await page.evaluate(async()=>{S.active.live=makeLive4(S.active,autoDraft([S.club,S.active.opponent]),[S.club,S.active.opponent]);save();await saveQueue;});
 const before=await page.evaluate(()=>JSON.stringify(S.active));
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ancientStartup?.ready);
 assert(await page.evaluate(before=>JSON.stringify(S.active)===before,before),'Active qualifier map must survive reload exactly');
 assert(await page.evaluate(()=>validSave(S)&&S.active.live.modelVersion===8));
 await page.evaluate(()=>{
  const a=S.active;while(true){if(a.cursor>=a.schedule.length){if(phaseNext6(a))continue;break;}const n=a.schedule[a.cursor];if(!n.score){const ids=n.pair.map(v=>resolve6(a,v));recordNode6(a,n,ids[0]===S.club?'2:0':ids[1]===S.club?'0:2':Qualifiers.fastRegionalSeries(a,n));}a.cursor++;}Qualifiers.finishRegional(a);go('trophies');
 });
 assert(await page.locator('#app').innerText().then(t=>t.includes('ИНВАЙТ ЗАВОЁВАН')));
 await page.screenshot({path:dir+'/invite-trophy.png'});
 await fixture(true,true);await page.evaluate(()=>openQualifiers(0,'regions'));
 assert.equal(await page.locator('.qualifier-regions article').count(),5);
 await page.locator('.qualifier-regions article').first().getByRole('button',{name:'Сетка турнира →',exact:true}).click();
 await page.locator('.neon-tournament-tabs').getByRole('button',{name:'Групповой этап',exact:true}).click();
 assert.equal(await page.locator('.neon-group-panel').count(),4);
 await page.locator('.neon-tournament-tabs').getByRole('button',{name:'Плей-офф',exact:true}).click();
 assert(await page.locator('.neon-node').count()>0);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(dir+'/report.json',JSON.stringify({checks,errors,external,manualStart:true,exactActiveMapReload:true,inviteTrophy:true,gsl16:true},null,2));
 console.log('PASS scene browser: 9 tab/width checks, home invitations, real DE/GSL navigation, manual start, exact live-map reload and invite trophy');await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
