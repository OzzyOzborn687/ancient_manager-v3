const fs=require('node:fs'),vm=require('node:vm');
module.exports=function(){
 const elements={};
 const c=vm.createContext({console,structuredClone,URL,Blob,setTimeout,clearTimeout,setInterval,clearInterval,
  document:{hidden:false,getElementById:id=>elements[id]??={style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',showModal(){},close(){}},addEventListener(){}},
  localStorage:{getItem(){return null},setItem(){}},addEventListener(){}});
 vm.runInContext('window=globalThis',c);
 const html=fs.readFileSync('dist/index.html','utf8');
 for(const [,src] of html.matchAll(/<script\s+src="([^"]+)"/g)){if(src.startsWith('http'))throw Error('External runtime dependency '+src);vm.runInContext(fs.readFileSync('dist/'+src.split('?')[0],'utf8'),c,{filename:src});}
 const run=code=>vm.runInContext(code,c);
 run('render=()=>{};save=()=>{};fresh();S.seed=24680;');
 return {run,elements,c};
};
