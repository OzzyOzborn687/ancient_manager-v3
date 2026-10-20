const fs=require('node:fs'),vm=require('node:vm');
module.exports=function(options={}){
 const elements={};
 const c=vm.createContext({console,structuredClone,URL,Blob,setTimeout,clearTimeout,setInterval,clearInterval,
  document:{hidden:false,getElementById:id=>elements[id]??={style:{},classList:{add(){},remove(){}},innerHTML:'',textContent:'',showModal(){},close(){}},addEventListener(){}},
  localStorage:{getItem(){return null},setItem(){}},addEventListener(){}});
 vm.runInContext('window=globalThis',c);
 const root=options.distRoot||'dist';
 const html=fs.readFileSync(root+'/index.html','utf8');
 for(const [,src] of html.matchAll(/<script\s+src="([^"]+)"/g)){if(options.stopBefore&&src.split('?')[0]===options.stopBefore)break;if(src.startsWith('http'))throw Error('External runtime dependency '+src);vm.runInContext(fs.readFileSync(root+'/'+src.split('?')[0],'utf8'),c,{filename:src});}
 const run=code=>vm.runInContext(code,c);
 run('render=()=>{};save=()=>{};');
 if(options.modelVersion!==8)run('if(typeof Legacy26!=="undefined")makeLive4=Legacy26.make');
 run('fresh();S.seed=24680;');
 return {run,elements,c};
};
