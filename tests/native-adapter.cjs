'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('native/adapter.js','utf8').replace(/^import .*;$/gm,'');
(async()=>{
 const calls=[],store=new Map([['ancient-manager-v1','original-packet']]);let stateHandler;
 const context=vm.createContext({
  Capacitor:{isNativePlatform:()=>true},App:{addListener:(name,handler)=>{stateHandler=handler}},
  Filesystem:{writeFile:async args=>{calls.push(args);return {uri:'file:///cache/'+args.path}}},Directory:{Cache:'CACHE'},Encoding:{UTF8:'utf8'},
  Share:{share:async args=>calls.push(args)},S:{day:7},my:()=>({name:'Test'}),date:()=>'',makePacket:state=>({state}),
  pauseLive4:()=>calls.push('pause'),save:async()=>calls.push('save'),toast:msg=>calls.push(msg),
  localStorage:{getItem:key=>store.get(key)},downloadCareer(){},downloadStartupSave(){}
 });
 vm.runInContext(source,context);await context.downloadCareer();
 assert.equal(calls[2].directory,'CACHE');assert.equal(JSON.parse(calls[2].data).state.day,7);
 assert.equal(calls[3].url,'file:///cache/Ancient-Manager-7.json');
 await stateHandler({isActive:false});assert(calls.includes('pause')&&calls.includes('save'));
 await context.downloadStartupSave();assert(calls.some(x=>x?.data==='original-packet'),'Recovery preserves original bytes');
 const web=vm.createContext({Capacitor:{isNativePlatform:()=>false},downloadCareer:'original'});
 vm.runInContext(source,web);assert.equal(web.downloadCareer,'original','Web export is unchanged');
 console.log('PASS native adapter: iOS share JSON, original recovery, lifecycle pause/save and unchanged browser behavior');
})().catch(error=>{console.error(error);process.exitCode=1;});
