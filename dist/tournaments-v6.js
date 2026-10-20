'use strict';
/* Temporary loader: known-good tournaments-v6 from commit 5baf96c (full local restore next). */
(function(){
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/gh/OzzyOzborn687/ancient_manager-v3@5baf96c47c37f7a91833ea70a9ba2a794428ded1/dist/tournaments-v6.js';
  s.onload=function(){ if(typeof restPanel6!=='function'){ window.restPanel6=function(){return '';}; } };
  s.onerror=function(){ console.error('Failed to load tournaments-v6 from jsDelivr'); };
  document.head.appendChild(s);
})();
