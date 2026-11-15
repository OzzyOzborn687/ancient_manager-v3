'use strict';
const assert=require('node:assert/strict'),h=require('./harness22.cjs')({modelVersion:8}),r=h.run;
r(`function fixture52(){fresh();S.calendar21.installedDay=100000;S.events=[{id:990,name:'Next event',series:'ANCIENT',day:90,pool:100000}];S.budget=10000000;return S.players.find(p=>p.name==='Xxs');}`);
r("var player52=fixture52(),before52=S.budget,fee52=transferTerms13(player52,'starter').fee;buy(player52.id,'starter');");
assert(r('TransferReveal52.current.player.name===\'Xxs\'&&TransferReveal52.current.from===null&&TransferReveal52.current.to.id===S.club&&TransferReveal52.current.fee===fee52&&S.budget===before52-fee52&&player52.paid===fee52&&validSave(S)'));
assert(r("TransferReveal52.markup(TransferReveal52.current).includes(cash(fee52))&&TransferReveal52.markup(TransferReveal52.current).includes('ПОДПИСНОЙ БОНУС')"));
r('var first52=TransferReveal52.current;buy(player52.id);');assert(r('TransferReveal52.current===first52'),'repeated buy must not replay');
r('S=JSON.parse(JSON.stringify(S));migrate();');assert(r('TransferReveal52.current===null&&validSave(S)'),'reload must not replay');
r("player52=fixture52();S.budget=0;buy(player52.id,'starter');");assert(r('!TransferReveal52.current&&player52.team===null'));
r("player52=fixture52();var prior52=roster(S.teams[3]).find(p=>p.role===player52.role);prior52.team=null;prior52.active=false;player52.team=3;player52.active=true;clubState13(S.teams[3]).lastResults=[];fee52=transferTerms13(player52,'starter').fee;var oldClub52=clubState13(S.teams[3]).budget,stateBefore52=structuredClone(S),id52=player52.id;buyBeforeReveal52(id52,'starter');var expectedState52=JSON.stringify(S);S=stateBefore52;player52=S.players[id52];buy(id52,'starter');");
assert(r("TransferReveal52.current.from.name==='Team Yandex'&&TransferReveal52.current.to.name==='Xtreme Gaming'&&TransferReveal52.current.fee===fee52&&JSON.stringify(S)===expectedState52&&validSave(S)"));
for(let role=0;role<5;role++){
 r(`var data52=structuredClone(TransferReveal52.current);data52.player.role=${role};data52.player.name='<img src=x onerror=alert(1)>';`);
 assert(r(`TransferReveal52.markup(data52).includes('POS ${String(role+1).padStart(2,'0')}')&&TransferReveal52.markup(data52).includes('&lt;img')&&!TransferReveal52.markup(data52).includes('<img src=x')`));
}
r('TransferReveal52.squad();');assert(r("!TransferReveal52.current&&page==='squad'"));
console.log('PASS V5.2: successful transfers only; real paid fee and original club; free agents; all roles; escaped nicknames; unchanged accounting; no duplicate or reload replay; close and squad.');
