'use strict';
const fs=require('node:fs'),cp=require('node:child_process');
const files=fs.readdirSync('tests').filter(f=>/\.(cjs|cis)$/.test(f)&&!/^(run|harness22|mirror-fixture|fixtures-v8)\./.test(f));
const resultDir=process.env.RESULTS_DIR||'test-results';
let cursor=0;const results=[];
async function worker(){while(cursor<files.length){const file=files[cursor++],start=Date.now();
 const result=await new Promise(resolve=>cp.execFile(process.execPath,['tests/'+file],{timeout:600000,maxBuffer:4e6},(error,out,err)=>resolve({file,status:error?'FAIL':'PASS',seconds:Math.round((Date.now()-start)/100)/10,output:out+'\n'+err,...(error?{error:error.message}:{})})));
 results.push(result);fs.mkdirSync(resultDir,{recursive:true});fs.writeFileSync(resultDir+'/regressions-v8.json',JSON.stringify(results,null,2));console.log(result.status,file,result.seconds+'s');
}}
Promise.all(Array.from({length:2},worker)).then(()=>{console.table(results.map(({file,status,seconds})=>({file,status,seconds})));process.exitCode=results.some(r=>r.status!=='PASS')?1:0;});
