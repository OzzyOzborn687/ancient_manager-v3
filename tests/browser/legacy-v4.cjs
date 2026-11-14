'use strict';
// Isolate retained V4 qualification contracts. Current V5 pages are exercised by v5.cjs.
module.exports=async function(page,base){
 await page.route('**/*',async route=>{
  const request=route.request();
  if(request.resourceType()!=='document'||!request.url().startsWith(base))return route.fallback();
  const response=await route.fetch(),html=await response.text();
  await route.fulfill({response,body:html.replace(/<script src="v5\/[^\"]+"><\/script>/g,'').replace(/<link rel="stylesheet" href="v5\/[^\"]+">/g,'')});
 });
};
