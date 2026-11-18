'use strict';
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const safari=process.env.V9_WEBKIT==='1',browser=await(safari?webkit:chromium).launch({...(safari?{}:{executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']}),headless:true});
 const dir=process.env.BROWSER_RESULTS_DIR||'/tmp/am-v9-browser';fs.mkdirSync(dir,{recursive:true});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),base=process.env.GAME_URL||'http://127.0.0.1:4173',errors=[],failed=[],checks=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url())});
  await p.route('**/*',r=>r.request().url().startsWith(base)||!/^http/.test(r.request().url())?r.continue():r.abort());
  await p.goto(base);await p.waitForFunction(()=>window.ancientStartup?.ready);await p.evaluate(()=>{fresh();go('home')});
  assert(await p.locator('body').evaluate(e=>e.classList.contains('v9')));assert(await p.evaluate(()=>[...document.querySelectorAll('link[rel=stylesheet]')].every(e=>e.getAttribute('href').startsWith('v9/'))),'old theme styles must not load');assert.equal(await p.locator('#matchdayHeader6,#matchdayTools6,.md-feature,.club-top21').count(),0,'old shell must not be created');
  assert.equal(await p.locator('#nav .v9-primary button').count(),7);
  const pages=await p.evaluate(()=>PAGES.map(p=>p[0]));
  for(const width of [1440,768,390,320]){
   await p.setViewportSize({width,height:1000});
   for(const key of pages){
    await p.evaluate(k=>go(k),key);
    assert((await p.locator('#app').innerText()).length>10,key+' rendered');
    const overflow=await p.evaluate(()=>({document:document.documentElement.scrollWidth,width:innerWidth}));
    assert(overflow.document<=overflow.width+2,key+' overflow '+width+' '+JSON.stringify(overflow));
    if(key==='home')assert(!(await p.locator('#v9Header').isVisible()),'cinematic home without old toolbar');else{assert(await p.locator('#v9Header').isVisible(),key+' subnavigation');assert((await p.locator('#v9Header').boundingBox()).height<180,key+' compact header '+width);}
    if(key==='squad')assert(await p.locator('.v9-player').evaluateAll(es=>new Set(es.map(e=>Math.round(e.getBoundingClientRect().top))).size<=1),'single roster stage '+width);checks.push({key,width});
    if([1440,390].includes(width)&&['home','squad','market','calendar','tactics','news60a','finance','services8','growth9','bootcamp'].includes(key))await p.screenshot({path:dir+'/'+key+'-'+width+'.png',fullPage:true,animations:'disabled'});
   }
  }
  await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>go('squad'));
  const state=await p.evaluate(()=>JSON.stringify(S));await p.locator('.v9-player .g6-select').nth(2).click();
  assert.equal(await p.evaluate(()=>JSON.stringify(S)),state,'selection is view state');
  assert.equal(await p.evaluate(()=>GlobalInterface6.selected),await p.evaluate(()=>roster()[2].id));
  assert.equal(await p.locator('.v9-player').count(),5);assert.equal(await p.locator('.v9-player .portrait20').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');await p.locator('.v9-player-summary').getByRole('button',{name:'Открыть профиль',exact:true}).click();assert.equal(await p.evaluate(()=>page),'player');
  await p.evaluate(()=>go('squad'));await p.locator('.g6-tabs').getByRole('button',{name:'Резерв',exact:true}).click();assert(await p.locator('.g6-reserves').isVisible());await p.locator('.g6-tabs').getByRole('button',{name:'Контракты',exact:true}).click();assert(await p.locator('.v9-contracts table').isVisible());
  await p.evaluate(()=>{GlobalInterface6.tab='five';go('market')});
  assert(await p.locator('.m7-row .m7-portrait img').count()>0);assert(await p.locator('.v9-market-club img').count()>0);
  await p.getByLabel('Поиск игрока',{exact:true}).fill('zz-no-fixture');assert.equal(await p.locator('.m7-row').count(),0);await p.getByLabel('Поиск игрока',{exact:true}).fill('');await p.locator('.m7-row').nth(1).click();assert(await p.locator('.m7-dossier').isVisible());
  const winners=await p.evaluate(()=>{
   const a={schedule:[{id:0,label:'Upper',bo:3,pair:[0,1],w:0,l:1,score:'2:1'},{id:1,label:'Final',bo:5,championship:true,pair:[0,1],w:1,l:0,score:'1:3'}]};
   $('app').innerHTML=neonPlayoffGraph(a,a.schedule,false);Interface9.bracket();return true;
  });assert(winners);
  assert.equal(await p.locator('.neon-match-team.is-winner').count(),2);
  assert.equal(await p.locator('.v9-final .is-winner').count(),1);
  assert.equal(await p.locator('.neon-match-team.is-winner').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(243, 245, 238)');
  assert.equal(await p.locator('.v9-final .is-winner').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(229, 191, 105)');await p.screenshot({path:dir+'/winners.png',fullPage:true,animations:'disabled'});
  await p.evaluate(()=>go('home'));const before=await p.evaluate(()=>S.day);await p.locator('.v9-home-event .primary').click();assert.equal(await p.evaluate(()=>S.day),before+1);
  await p.evaluate(()=>Interface9.toggleMotion());assert(await p.evaluate(()=>!Interface9.motion&&Interface9.timer===null));await p.reload();await p.waitForFunction(()=>ancientStartup.ready);assert(await p.evaluate(()=>!Interface9.motion&&validSave(S)));
  await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>{Interface9.motion=true;Interface9.background()});assert(await p.evaluate(()=>Interface9.timer===null));
  await p.evaluate(async()=>{save();await saveQueue});const saved=await p.evaluate(()=>JSON.stringify({day:S.day,budget:S.budget,players:S.players}));await p.reload();await p.waitForFunction(()=>ancientStartup.ready);assert.equal(await p.evaluate(()=>JSON.stringify({day:S.day,budget:S.budget,players:S.players})),saved);
  assert.deepEqual(errors,[]);assert.deepEqual([...new Set(failed)],[]);fs.writeFileSync(dir+'/report.json',JSON.stringify({checks,errors,failed},null,2));console.log('PASS V9: '+checks.length+' page/viewport checks; real navigation, roster selection, profiles/reserves/contracts, market portraits/logos/filters/dossier, result-driven white/gold winners, advance day, motion preference, reduced motion and save reload.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
