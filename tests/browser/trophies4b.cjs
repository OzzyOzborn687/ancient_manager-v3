'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),errors=[],failed=[],base=(process.env.GAME_URL||'http://127.0.0.1:4173').replace(/\/$/,''),dir=process.env.BROWSER_RESULTS_DIR||'/tmp/ancient-manager-browser/trophies4b';fs.mkdirSync(dir,{recursive:true});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url())});
  await page.route('**/*',r=>r.request().url().startsWith(base)||!/^https?:/.test(r.request().url())?r.continue():r.abort());
  await page.goto(base);await page.waitForFunction(()=>window.ancientStartup?.ready);
  await page.evaluate(()=>{
   fresh();S.calendar21.installedDay=100000;S.v4.camps={};S.events=[];
   const fixtures=[
    ['THE INTERNATIONAL','THE INTERNATIONAL 2026','Гамбург','aegis'],
    ['PGL WALLACHIA','PGL Wallachia Season 8','Бухарест','wallachia'],
    ['BLAST SLAM','BLAST Slam IV','Онлайн / Сингапур','blast'],
    ['ESL ONE','ESL One Bangkok','Бангкок','esl'],
    ['ESPORTS WORLD CUP','Esports World Cup 2026','Эр-Рияд','ewc'],
    ['DREAMLEAGUE','DreamLeague Season 30','Онлайн','online'],
    ['BETBOOM DACHA','BetBoom Dacha Dubai 2026','Дубай','dachaDubai'],
    ['BETBOOM DACHA','BetBoom Dacha Belgrade 2026','Белград','dachaBelgrade'],
    ['FISSURE','FISSURE Playground 1','Белград','fissure'],
    ['RIYADH MASTERS','Riyadh Masters 2026','Эр-Рияд','riyadh'],
    ['GAMES OF THE FUTURE','Games of the Future 2026','Казань','future'],
    ['ELITE LEAGUE','Elite League Season 2','Лима','elite'],
    ['PGL WALLACHIA','PGL Wallachia Season 1','Бухарест','wallachiaAxes'],
    ['1WIN SERIES','1win Series Fall 2026','Онлайн','onlineGreen'],
    ['FISSURE','FISSURE Universe: Episode 8','Онлайн','online'],
    ['ELITE LEAGUE','Elite League Season 1','Онлайн','online'],
    ['CLAVISION','Clavision Snow Ruyi 2026','Чжанцзякоу','pending'],
    ['ASIAN CHAMPIONS LEAGUE','Asian Champions League 2026','Шанхай','pending']
   ];
   for(const [series,name,venue,key] of fixtures){const e={id:80000+S.events.length,name,series,venue,day:0,duration:1,pool:1000000,done:true,champion:S.club};if(Trophy4B.select(e).key!==key)throw Error('Wrong trophy: '+name);S.events.push(e)}
   if(Trophy4B.select({name:'BetBoom Dacha Dubai 2026'}).key!=='dachaDubai')throw Error('Legacy title lookup');
   if(Trophy4B.select({series:'PGL WALLACHIA',name:'PGL Wallachia Season 7',sourceYear21:2024,sourceName21:'PGL Wallachia 1'}).key!=='wallachiaAxes')throw Error('Historical prototype lookup');
   S.events.push({id:90000,name:'Other club title',series:'THE INTERNATIONAL',day:0,duration:1,pool:1000000,done:true,champion:1});
   S.events.push({id:90001,name:'Other year title',series:'THE INTERNATIONAL',day:100,duration:1,pool:1000000,done:true,champion:S.club});
   S.events.push({id:90002,name:'Qualifier fixture',series:'QUALIFICATION',qualifierFor:80000,qualifierRegion:'EU',day:0,pool:10000,done:true,champion:S.club,inviteWinners:[S.club]});
   awardClub20=S.club;awardYear20=2026;go('trophies');
  });
  assert.equal(await page.locator('.trophy-gallery4b>article').count(),18);
  assert((await page.locator('#app').innerText()).toLowerCase().includes('завоёванные инвайты · 1'));
  assert(!(await page.locator('#app').innerText()).includes('🏆'));
  assert.equal(await page.locator('[data-trophy="pending"]').count(),2);
  const before=await page.evaluate(()=>JSON.stringify(S));await page.evaluate(()=>render());assert.equal(await page.evaluate(()=>JSON.stringify(S)),before,'visual rendering is read-only');
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'overflow '+width);
   for(const file of ['assets/trophies/championships.webp','assets/trophies/circuit.webp'])assert(await page.evaluate(async url=>{const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return img.naturalWidth>1000&&ctx.getImageData(0,0,1,1).data[3]===0},file),'local atlas loads');
   await page.screenshot({path:dir+'/hall-'+width+'.png',fullPage:width===1440});
   await page.locator('[data-trophy="aegis"]').click();await page.getByRole('dialog').waitFor({state:'visible'});
   assert((await page.locator('#modal').innerText()).includes('Фотоисточник трофея'));
   assert(await page.evaluate(()=>{const e=document.getElementById('modal');return e.getBoundingClientRect().width<=innerWidth&&e.scrollWidth<=e.clientWidth+2}),'modal fits '+width);
   await page.screenshot({path:dir+'/detail-'+width+'.png'});await page.getByRole('button',{name:'Закрыть',exact:true}).click();
  }
  await page.locator('[data-trophy="pending"]').first().click();assert((await page.locator('#modal').innerText()).includes('пока не найдено'));assert.equal(await page.locator('#modal a').count(),0);await page.getByRole('button',{name:'Закрыть',exact:true}).click();
  await page.locator('[data-trophy="onlineGreen"]').click();assert((await page.locator('#modal').innerText()).includes('Авторский игровой трофей'));await page.getByRole('button',{name:'Закрыть',exact:true}).click();
  await page.locator('select[aria-label="Команда"]').selectOption('1');assert.equal(await page.locator('.trophy-gallery4b>article').count(),1);
  await page.locator('select[aria-label="Команда"]').selectOption('0');await page.locator('select[aria-label="Год наград"]').selectOption('2027');assert.equal(await page.locator('.trophy-gallery4b>article').count(),1);
  await page.locator('select[aria-label="Год наград"]').selectOption('2026');await page.locator('[data-trophy="aegis"]').click();await page.getByRole('button',{name:'Открыть турнир',exact:true}).click();assert(await page.evaluate(()=>selectedBracket===80000));
  await page.evaluate(()=>{S.events=S.events.filter(e=>!Qualifiers.isRegional(e));save()});await page.evaluate(()=>saveQueue);await page.reload();await page.waitForFunction(()=>window.ancientStartup?.ready);await page.evaluate(()=>{awardYear20=2026;go('trophies')});assert.equal(await page.locator('.trophy-gallery4b>article').count(),18);assert(await page.evaluate(()=>validSave(S)));
  await page.evaluate(()=>{awardClub20=2;go('trophies')});assert((await page.locator('#app').innerText()).toLowerCase().includes('трофеи впереди'));assert.equal(await page.locator('.trophy-empty4b').count(),1);
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log('PASS V4.0 B browser: 18 trophy mappings, transparent local assets, 320/390/768/1440, read-only render, zoom/source, honest pending/online labels, club/year filters, invites, bracket, save/reload and empty hall');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
