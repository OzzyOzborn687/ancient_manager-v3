'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const root=path.resolve('dist');
  await page.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.origin!=='http://draft.test')return route.abort();
   const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
   if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
   return route.fulfill({path:file,contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream'});
  });
  await page.goto('http://draft.test/');await page.waitForFunction(()=>window.ancientStartup?.ready);
  await page.evaluate(()=>{fresh();S.events=[{id:0,name:'FISSURE',series:'FISSURE',day:0,pool:1000000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];startEvent();playMap();});
  assert(await page.locator('#modal').evaluate(e=>e.open));
  assert(await page.getByRole('button',{name:'Начать матч',exact:true}).isVisible());
  assert.equal(await page.evaluate(()=>S.active.live.clock),0);
  await page.keyboard.press('Escape');
  await page.evaluate(()=>advanceMap());
  assert(await page.locator('#modal').evaluate(e=>e.open));
  assert.equal(await page.evaluate(()=>S.active.live.clock),0);
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   assert(await page.getByRole('button',{name:'Начать матч',exact:true}).count());
   const overflow=await page.locator('#modal').evaluate(e=>e.scrollWidth>e.clientWidth+2);
   assert(!overflow,'draft dialog horizontal overflow at '+width);
  }
  await page.getByRole('button',{name:'Начать матч',exact:true}).click();
  assert.equal(await page.evaluate(()=>S.active.live.draftUpdatePending),false);
  assert.equal(await page.locator('#modal').evaluate(e=>e.open),false);
  await page.getByRole('button',{name:'Подробности драфта',exact:true}).click();
  assert(await page.getByRole('button',{name:'Закрыть',exact:true}).isVisible());
  await page.getByRole('button',{name:'Закрыть',exact:true}).click();
  await page.evaluate(()=>advanceMap());assert(await page.evaluate(()=>S.active.live.clock>0));
  assert.deepEqual(errors,[]);
  console.log('PASS browser draft update: real dialog, no simulation before confirmation, Escape/start gate, mobile/desktop layout, report reopening, match advance, no JS errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
