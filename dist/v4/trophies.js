'use strict';
// Visual references identify source editions. Future career editions do not claim a new real-world cup.
const TROPHIES4B={
 aegis:{atlas:0,col:0,row:0,label:'Aegis of Champions',reference:'The International 2024 · Aegis',source:'https://www.dota2.com/newsentry/4176605502427363584'},
 wallachia:{atlas:0,col:1,row:0,label:'PGL Wallachia',reference:'PGL Wallachia Season 8 · скульптурный трофей',source:'https://egamersworld.com/dota2/news/34336/betboom-team-wins-pgl-wallachia-season-8-after-def-F6WDj6r6E'},
 blast:{atlas:0,col:2,row:0,label:'BLAST Slam',reference:'BLAST Slam I · геометрический трофей',source:'https://esports.gg/news/dota-2/betboom-break-duck-against-tundra-to-secure-maiden-dota-2-blast-slam-victory/'},
 esl:{atlas:0,col:0,row:1,label:'ESL One',reference:'ESL One Birmingham 2024',source:'https://www.gosugamers.net/dota2/news/71198-esl-one-birmingham-is-down-to-the-top-3-teams'},
 ewc:{atlas:0,col:1,row:1,label:'Esports World Cup',reference:'Esports World Cup · Dota 2, 2025',source:'https://pt.egamersworld.com/blog/dota-2-esports-world-cup-2025-review-BuPL2G7MGb'},
 online:{atlas:0,col:2,row:1,label:'Онлайн-трофей',original:true},
 dachaDubai:{atlas:1,col:0,row:0,label:'BetBoom Dacha Dubai',reference:'BetBoom Dacha Dubai 2024 · изготовитель GESAMT',source:'https://gesamtproduction.com/betboom_dacha_dota_2_dubai_2024'},
 dachaBelgrade:{atlas:1,col:1,row:0,label:'BetBoom Dacha Belgrade',reference:'BetBoom Dacha Belgrade · Dota 2, 2024',source:'https://liquipedia.net/dota2/BetBoom_Dacha/Belgrade/2024'},
 fissure:{atlas:1,col:2,row:0,label:'FISSURE Playground',reference:'FISSURE Playground 1 · Dota 2, 2025',source:'https://liquipedia.net/commons/File:Tundra_Esports_win_FISSURE_PLAYGROUND_1_DOTA2.jpg'},
 riyadh:{atlas:1,col:3,row:0,label:'Riyadh Masters',reference:'Riyadh Masters · Dota 2, 2024',source:'https://www.spa.gov.sa/N2143441'},
 future:{atlas:1,col:0,row:1,label:'Games of the Future',reference:'Games of the Future · Dota 2, Казань 2024',source:'https://www.championat.com/cybersport/article-5459986-itogi-igr-buduschego-2024-rezultaty-obzor-vpechatleniya-sorevnovaniya-buduschee.html'},
 elite:{atlas:1,col:1,row:1,label:'Elite League LAN',reference:'Elite League Season 2 · Лима, 2024',source:'https://www.championat.com/cybersport/article-5711330-istoriya-team-liquid-eto-chempiony-the-international-2024-po-dote.html'},
 wallachiaAxes:{atlas:1,col:2,row:1,label:'PGL Wallachia · ранний кубок',reference:'PGL Wallachia Season 1 · скрещённые топоры',source:'https://escharts.com/pt/news/highest-earning-dota-2-esports-players'},
 onlineGreen:{atlas:1,col:3,row:1,label:'Онлайн-трофей',original:true},
 pending:{label:'Изображение кубка уточняется',pending:true}
};
const Trophy4B={
 atlases:[{file:'assets/trophies/championships.webp',cols:3,rows:2},{file:'assets/trophies/circuit.webp',cols:4,rows:2}],
 select(e){
  let series=circuitSeries(e).toUpperCase();const name=(e.name||'').toUpperCase(),venue=(e.venue||'').toUpperCase(),prototype=(e.sourceName21||'').toUpperCase();
  if(series==='ДРУГИЕ')series=['BETBOOM DACHA','RIYADH MASTERS','ESPORTS WORLD CUP','GAMES OF THE FUTURE','ELITE LEAGUE','1WIN SERIES','CLAVISION','ASIAN CHAMPIONS LEAGUE'].find(key=>name.includes(key))||series;
  if(Qualifiers.isRegional(e))return {key:'pending',kind:'invite'};
  const online=(/ОНЛАЙН|ONLINE/.test(venue)&&!venue.includes('/'))||series==='DREAMLEAGUE'||series==='1WIN SERIES'||(!venue&&series==='FISSURE'&&/UNIVERSE|SPECIAL/.test(name));
  if(online)return {key:series==='1WIN SERIES'?'onlineGreen':'online',kind:'online'};
  if(series==='THE INTERNATIONAL')return {key:'aegis',kind:'reference'};
  if(series==='PGL WALLACHIA'){
   const match=/PGL WALLACHIA(?: SEASON)?\s+(\d+)/.exec(prototype||name),edition=e.sourceYear21?Number(match?.[1]):e.season||Number(match?.[1]);
   return {key:edition>0&&edition<=6?'wallachiaAxes':'wallachia',kind:'reference'};
  }
  if(series==='BLAST SLAM')return {key:'blast',kind:'reference'};
  if(series==='ESL ONE')return {key:'esl',kind:'reference'};
  if(series==='BETBOOM DACHA')return {key:/DUBAI|ДУБАЙ/.test(name+' '+venue)?'dachaDubai':'dachaBelgrade',kind:'reference'};
  if(series==='FISSURE')return {key:'fissure',kind:'reference'};
  if(series==='RIYADH MASTERS')return {key:'riyadh',kind:'reference'};
  if(series==='ESPORTS WORLD CUP')return {key:'ewc',kind:'reference'};
  if(series==='GAMES OF THE FUTURE')return {key:'future',kind:'reference'};
  if(series==='ELITE LEAGUE')return {key:'elite',kind:'reference'};
  if(/ANCIENT/.test(series+' '+name))return {key:'onlineGreen',kind:'original'};
  return {key:'pending',kind:'pending'};
 },
 mark(){return '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M28 18h44v20c0 19-11 30-22 30S28 57 28 38V18zm0 7H15v9c0 12 7 18 17 18m40-27h13v9c0 12-7 18-17 18M50 68v13m-17 4h34M21 79l-9-15m67 15l9-15"/></svg>';},
 sprite(key){
  const t=TROPHIES4B[key];if(t.pending)return '<span class="trophy-unverified4b">'+this.mark()+'<span>Изображение<br>уточняется</span></span>';
  const a=this.atlases[t.atlas],x=t.col/(a.cols-1)*100,y=t.row/(a.rows-1)*100;
  return '<span class="trophy-sprite4b" role="img" aria-label="'+esc(t.label)+'" style="background-image:url('+a.file+');background-size:'+(a.cols*100)+'% '+(a.rows*100)+'%;background-position:'+x+'% '+y+'%"></span>';
 },
 art(e){const selected=this.select(e),t=TROPHIES4B[selected.key],badge=selected.kind==='online'?'АВТОРСКИЙ / ONLINE':selected.kind==='original'?'АВТОРСКИЙ КУБОК':t.pending?'ПАМЯТНАЯ ТАБЛИЧКА':'ТРОФЕЙ СЕРИИ';return '<button class="trophy-stage4b '+(t.pending?'unverified':'')+'" data-trophy="'+selected.key+'" onclick="openTrophy4B('+e.id+')" aria-label="Рассмотреть кубок: '+esc(e.name)+'">'+this.sprite(selected.key)+'<span class="trophy-plinth4b" aria-hidden="true"></span><span class="trophy-kind4b">'+badge+'</span></button>';},
 empty(){return '<div class="trophy-empty4b" aria-hidden="true">'+this.mark()+'</div>';}
};
function openTrophy4B(id){
 const e=S.events.find(e=>e.id===id);if(!e)return;
 const s=Trophy4B.select(e),t=TROPHIES4B[s.key];
 const note=t.pending?'Титул сохранён. Подтверждённое изображение кубка этого турнира пока не найдено; показана нейтральная памятная табличка.':t.original?'Авторский игровой трофей'+(s.kind==='online'?' для онлайн-серии.':'.'):'Игровая иллюстрация по фотографии реального трофея. Источник: '+t.reference+'. Для смоделированных выпусков используется этот подтверждённый образец серии.';
 openModal('<div class="trophy-detail4b"><span class="eyebrow">ЗАЛ НАГРАД</span><h2>'+esc(e.name)+'</h2><div class="trophy-stage4b detail">'+Trophy4B.sprite(s.key)+'<span class="trophy-plinth4b" aria-hidden="true"></span></div><p>'+date(awardDay20(e))+' · Чемпион: '+esc(S.teams[e.champion??S.club]?.name||my().name)+'</p><p class="sub">'+esc(note)+'</p>'+(t.source?'<a href="'+t.source+'" target="_blank" rel="noopener">Фотоисточник трофея ↗</a>':'')+'<div class="actions">'+btn('Закрыть','closeModal()')+btn('Открыть турнир',"closeModal();showBracket("+id+")",true)+'</div></div>');
}
const trophiesBefore4B=trophiesView20;
trophiesView20=function(){
 const club=awardClub20??S.club,year=awardYear20??year20(S.day),wins=wins20(club,year);let i=0;
 let html=trophiesBefore4B().replace('ДОСТИЖЕНИЯ КЛУБА','КОЛЛЕКЦИЯ КЛУБА / V4.0 B').replace('<div class="trophy-grid20">','<div class="trophy-grid20 trophy-gallery4b">');
 html=html.replace(/<div class="trophy-icon20">🏆<\/div>/g,()=>wins[i]?Trophy4B.art(wins[i++]):Trophy4B.empty());
 return '<div class="awards4b">'+html+'</div>';
};
const trophyMenu4B=PAGES.find(p=>p[0]==='trophies');if(trophyMenu4B)trophyMenu4B[1]=Trophy4B.mark();
const trophyRender4B=render;
render=function(...args){const r=trophyRender4B(...args);if(S)$('broadcastStatus33c').innerHTML=$('broadcastStatus33c').innerHTML.replace('V4.0 A / ARENA','V4.0 B / ARENA');return r;};
