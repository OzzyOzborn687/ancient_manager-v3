'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),h=require('./harness22.cjs')({modelVersion:8}),r=h.run;
assert(fs.readFileSync('dist/index.html','utf8').includes('class="version-badge21">ANCIENT MANAGER / V5.2 C</span>'),'Header must display the current patch');
r(`function fixture5c(){fresh();S.calendar21.installedDay=100000;S.events=[{id:800,name:'Training fixture',series:'ANCIENT',day:10,pool:100000,entrants:[S.club]}];S.v4.camps={};S.training='balanced';S.budget=1000000;for(const p of roster()){p.form=70;p.fatigue=20;p.progress21.initialForm=70;p.progress21.lastOfficialDay=null;p.progress21.results=[];}return S.events[0];}`);
for(const mode of ['balanced','intensive']){
 r(`fixture5c();S.training=${JSON.stringify(mode)};var before5c=JSON.stringify(roster().map(p=>({skill:p.skill,rating:p.amRating}))),chem5c=S.chem,state5c=JSON.stringify(S),preview5c=trainingPreview33();`);
 assert.equal(r('JSON.stringify(S)'),r('state5c'),'preview must not mutate');
 assert(r('preview5c.every(p=>p.form>70)'),'form grows without wins '+mode);
 r('trainingDay33();');
 assert(r('roster().every((p,i)=>Math.abs(p.form-preview5c[i].form)<1e-10)'),'real day equals preview '+mode);
 assert.equal(r('JSON.stringify(roster().map(p=>({skill:p.skill,rating:p.amRating})))'),r('before5c'),'no OVR change without result-driven development');
 r('var once5c=roster()[0].form;playerGrowth13(roster()[0],S.training,S.facility,trainingFocus33());');assert.equal(r('roster()[0].form'),r('once5c'),'same-day idempotence');
}
const forms=[];
for(const tier of ['online','standard','advanced','elite']){
 r(`fixture5c();Camp4.book(800,${JSON.stringify(tier)});var preCamp5c=trainingPreview33();trainingDay33();`);
 assert(r('roster().every((p,i)=>Math.abs(p.form-preCamp5c[i].form)<1e-10)&&validSave(S)'));
 forms.push(r('avg(roster().map(p=>p.form))'));
}
for(let i=1;i<forms.length;i++)assert(forms[i]>forms[i-1],'higher camp tier must yield more form');
r(`fixture5c();Camp4.book(800,'elite');trainingDay33(true);`);assert(r('roster().every(p=>p.form===70)'),'skip gives neither normal nor camp form');
r(`fixture5c();S.training='rest';trainingDay33();`);assert(r('roster().every(p=>p.form<=70)'),'recovery is not form training');
r(`fixture5c();var p5c=roster()[0];for(let day=1;day<=120;day++){S.day=day;playerGrowth13(p5c,'balanced',1,'mechanics');}`);assert(r('p5c.form<=85&&p5c.form>84.9'),'training-only ceiling');
console.log('PASS V5.0 C: form grows without matches; preview equals actual day; online < standard < advanced < elite; same-day and skip gates; training ceiling; existing OVR development preserved.');
r('fresh();var photos5c=S.players.filter(p=>!p.fiction&&(p.team===null||(S.teams[p.team].tier??1)===1));');
assert.equal(r('photos5c.filter(p=>p.team!==null).length'),70);
for(const src of r('photos5c.map(p=>photo20(p))')){
 assert(src&&src.startsWith('assets/'),'Core/free-agent photo must be bundled: '+src);
 const bytes=fs.readFileSync('dist/'+src);assert(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP');
}
assert.equal(JSON.parse(fs.readFileSync('dist/assets/players/sources.json','utf8')).players.length,77);
console.log('PASS local photos: every player of 14 core clubs and seven available free agents; real WebP assets; source provenance retained.');
