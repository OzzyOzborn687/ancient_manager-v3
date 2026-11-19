'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),headless:true,args:['--no-sandbox']});
 const base=process.env.GAME_URL||'http://127.0.0.1:4175',dir=process.env.BROWSER_RESULTS_DIR||'/tmp/am-v9-presentation';fs.mkdirSync(dir,{recursive:true});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],failed=[],checks=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url())});
  await p.route('**/*',r=>r.request().url().startsWith(base)||!/^http/.test(r.request().url())?r.continue():r.abort());
  await p.goto(base);await p.waitForFunction(()=>ancientStartup.ready);
  await p.evaluate(()=>{
   fresh();S.calendar21.installedDay=100000;S.events=[{id:998,name:'FISSURE PLAYGROUND / INTERNATIONAL SEASON 8',series:'FISSURE',season:8,day:0,pool:1000000,qualified13:S.teams.slice(0,8).map(t=>t.id)}];startEvent();go('match');
  });
  for(const width of [1440,390,320]){
   await p.setViewportSize({width,height:900});
   assert.equal(await p.locator('.tactical-hero .team-display').count(),2);
   assert.equal(await p.locator('.tactical-hero .matchup').evaluate(e=>getComputedStyle(e).display),'grid');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'pre-map layout '+width);
   await p.screenshot({path:dir+'/prematch-'+width+'.png',fullPage:true,animations:'disabled'});
  }
  await p.evaluate(()=>{
   playMap();pauseLive4(false);
   window.presentationFixture9=kind=>{
    for(const d of document.querySelectorAll('dialog[open]'))d.close();for(const d of document.querySelectorAll('dialog[data-audit]'))d.remove();
    const e=S.events.find(e=>e.id===998),player=S.players.find(p=>p.name==='NothingToSay')||roster()[0];let d,html,cls,id;
    if(kind==='draft'){showDraftUpdate();return;}
    if(kind==='transfer'){id='transferReveal52';cls='t52-dialog';html=TransferReveal52.markup({player,from:S.teams[3],to:my(),fee:1800000});}
    if(kind==='intro'){id='tournamentIntro52A';cls='ta-dialog';html=TournamentIntro52A.markup(e);}
    if(kind==='eliminated'){id='eliminated52B';cls='el52-dialog';html=Elimination52B.markup({event:e.id,stage:'groups',teams:[8,16,5,15]});}
    if(kind==='final'){id='grandFinal52C';cls='gf52-dialog';html=GrandFinal52C.markup({e,n:{bo:5},pair:[S.club,15]});}
    if(kind==='results'){id='tournamentResultsD';cls='rd-dialog';html=TournamentResultsD.markup({event:e.id,club:S.club,final:true,kind:'champions',place:1,rows:S.teams.slice(0,16).map((t,i)=>({id:t.id,place:i+1})),spans:{}});}
    d=document.createElement('dialog');d.id=id;d.className=cls;d.dataset.audit='true';d.innerHTML=html;document.body.append(d);d.showModal();
   };
  });
  for(const size of [{width:1440,height:900},{width:1280,height:720},{width:768,height:1024},{width:390,height:844},{width:320,height:640},{width:844,height:390}]){
   await p.setViewportSize(size);
   for(const kind of ['draft','transfer','intro','eliminated','final','results']){
    await p.evaluate(k=>presentationFixture9(k),kind);const d=p.locator('dialog[open]');await d.waitFor({state:'visible'});
    for(const phase of [.35,.7,1]){
     await p.evaluate(phase=>{for(const a of document.getAnimations()){const el=a.effect?.target;if(!el?.closest?.('dialog[open]'))continue;const t=a.effect.getTiming();if(t.iterations===Infinity)continue;a.pause();a.currentTime=Number(t.delay||0)+Number(t.duration||0)*phase;}},phase);
     const result=await d.evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,right:r.right,y:r.y,bottom:r.bottom,sw:e.scrollWidth,cw:e.clientWidth,width:innerWidth,height:innerHeight}});
     assert(result.x>=-1&&result.right<=result.width+1,kind+' dialog bounds '+JSON.stringify({size,phase,result}));
     assert(result.y>=-1&&result.bottom<=result.height+1,kind+' viewport height '+JSON.stringify({size,phase,result}));
     assert(result.sw<=result.cw+2,kind+' horizontal content '+JSON.stringify({size,phase,result}));
     if(kind==='eliminated'){
      assert.equal(await d.locator('.el52-teams article').count(),4);
      const fit=await d.locator('.el52-teams article>strong').evaluateAll(es=>es.map(e=>{const range=document.createRange();range.selectNodeContents(e);const t=range.getBoundingClientRect(),r=e.getBoundingClientRect();return {text:e.textContent,fit:t.left>=r.left-1&&t.right<=r.right+1&&t.top>=r.top-1&&t.bottom<=r.bottom+1}}));
      assert(fit.every(x=>x.fit),'ELIMINATED text inside every badge '+JSON.stringify({size,phase,fit}));
     }
     checks.push({kind,...size,phase});
    }
    if(kind==='transfer'){
     const fit=await d.locator('.w6-copy .w6-nick').evaluate(e=>{const r=e.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(e);const t=range.getBoundingClientRect();return t.right<=r.right+1&&t.left>=r.left-1&&t.height<parseFloat(getComputedStyle(e).fontSize)*1.8});
     assert(fit,'long nickname fits a single title row '+size.width);
     const signed=await d.locator('.w6-signed').boundingBox(),skip=await d.locator('.w6-header button').boundingBox();
     assert(signed.y>=skip.y+skip.height||signed.x+signed.width<=skip.x,'contract label clear of skip control '+size.width);
     if(size.width<=650){const photo=await d.locator('.w6-photo').boundingBox(),role=await d.locator('.w6-role').boundingBox();assert(role.y+role.height<=photo.y,'identity and portrait have separate areas '+size.width);}
    }
    if(kind==='draft'){
     assert.equal(await d.locator('.draft-pick').count(),10);
     assert(await d.locator('.draft-hero-portrait').evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect(),im=e.querySelector('img').getBoundingClientRect();return Math.abs(r.x-im.x)<=2&&Math.abs(r.y-im.y)<=2&&im.width<=r.width+1})), 'hero image stays in portrait frame');
     const action=await d.locator('.draft-actions').boundingBox(),box=await d.boundingBox();assert(action.y>=box.y&&action.y+action.height<=box.y+box.height+2,'draft action stays visible');
    }
    await d.locator('button').last().scrollIntoViewIfNeeded();
    const last=await d.locator('button').last().boundingBox(),viewport=await d.boundingBox();
    assert(last.y>=viewport.y-1&&last.y+last.height<=viewport.y+viewport.height+1,kind+' final action reachable '+size.width);
    await d.evaluate(e=>e.scrollTop=0);
    if([1440,390,320].includes(size.width))await d.screenshot({path:dir+'/'+kind+'-'+size.width+'.png',animations:'disabled'});
   }
   await p.evaluate(()=>{for(const d of document.querySelectorAll('dialog[open]'))d.close();S.active.live.draftUpdatePending=false;go('match');pauseLive4(false)});
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'match document '+size.width);
   const playback=await p.locator('.c-playback').boundingBox(),board=await p.locator('.c-scoreboard').boundingBox();assert(playback.x>=board.x-1&&playback.x+playback.width<=board.x+board.width+1,'playback in scoreboard');
   assert.equal(await p.locator('.c-live-metrics').first().locator('.c-metric').count(),4);
   if([1440,390].includes(size.width))await p.screenshot({path:dir+'/match-'+size.width+'.png',fullPage:true,animations:'disabled'});
  }
  await p.evaluate(()=>{for(const d of document.querySelectorAll('dialog[open]'))d.close();S.history.unshift({opponent:S.teams[15].name,score:[2,1],maps:[{win:true,kills:28,deaths:14,duration:36,players:roster().map(p=>({name:p.name,k:5,d:2,a:11})),enemyPlayers:S.players.filter(p=>p.team===15).slice(0,5).map(p=>({name:p.name,k:2,d:5,a:7}))}]});report(0)});
  for(const width of [1440,390,320]){
   await p.setViewportSize({width,height:900});const d=p.locator('#modal');
   assert.equal(await d.locator('.gabe-series-team').count(),2);
   assert.equal(await d.locator('.gabe-series-result').evaluate(e=>getComputedStyle(e).display),'grid');
   assert(await d.evaluate(e=>e.scrollWidth<=e.clientWidth+2),'archived report '+width);
   await p.screenshot({path:dir+'/archive-'+width+'.png',fullPage:true,animations:'disabled'});
  }
  await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>presentationFixture9('eliminated'));assert.equal(await p.locator('.el52-teams article').first().evaluate(e=>getComputedStyle(e).animationName),'none');
  assert.deepEqual(errors,[]);assert.deepEqual([...new Set(failed)],[]);fs.writeFileSync(dir+'/report.json',JSON.stringify({checks,errors,failed},null,2));console.log('PASS presentation: '+checks.length+' phase/viewport checks, actual draft picks/frames/sticky actions, all six broadcasts, contained ELIMINATED text, match controls/metrics and reduced motion.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
