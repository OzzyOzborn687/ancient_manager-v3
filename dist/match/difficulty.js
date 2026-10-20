'use strict';
const Difficulty={
 known:key=>Object.hasOwn(CAREER_DIFFICULTY.levels,key),
 current(state=S){return this.known(state?.difficulty)?state.difficulty:CAREER_DIFFICULTY.default;},
 multipliers(level,club,teams){
  const config=CAREER_DIFFICULTY.levels[level],hasClub=teams.includes(club);
  return teams.map(id=>id===club?config.own:config.againstClubOnly&&!hasClub?1:config.rival);
 },
 freeze(m){
  const level=this.current(),club=S.club;
  m.difficulty={level,club,multipliers:this.multipliers(level,club,m.sides.map(s=>s.team))};
 },
 factor:(m,side)=>m.difficulty?.multipliers?.[side]??1,
 validMap(m,state){
  if(!m||m.difficulty===undefined)return true;
  const d=m.difficulty;
  if(!d||!this.known(d.level)||d.club!==state.club||!Array.isArray(d.multipliers)||d.multipliers.length!==2||!Array.isArray(m.sides)||m.sides.length!==2)return false;
  const expected=this.multipliers(d.level,d.club,m.sides.map(s=>s.team));
  return d.multipliers.every((value,i)=>value===expected[i]);
 },
 panel(){
  const level=this.current(),live=[S.active?.live,S.practice13?.live].find(m=>m?.finishedSide==null&&m?.sides);
  return '<section class="panel difficulty-panel"><h2>Сложность карьеры</h2><p>Выберите бонус к силе команд. Уровень сохраняется в карьере и применяется при старте каждой новой карты, включая КВ.</p>'+
   '<div class="difficulty-options" role="group" aria-label="Сложность карьеры">'+Object.entries(CAREER_DIFFICULTY.levels).map(([key,value])=>
    '<button class="'+(key===level?'primary':'')+'" aria-pressed="'+(key===level)+'" onclick="setCareerDifficulty(\''+key+'\')"><b>'+value.label+'</b><small>'+value.description+'</small><span>'+(key===level?'✓ Выбрано':'Выбрать')+'</span></button>').join('')+'</div>'+
   '<p class="sub">'+(live?'Текущая карта: «'+CAREER_DIFFICULTY.levels[live.difficulty?.level||CAREER_DIFFICULTY.default].label+'». Новый выбор вступит в силу со следующей карты.':'Начатые карты сохраняют сложность, с которой стартовали.')+'</p></section>';
 }
};
function setCareerDifficulty(level){
 if(!Difficulty.known(level))return false;
 if(S.difficulty===level)return true;
 S.difficulty=level;save();render();toast('Сложность: '+CAREER_DIFFICULTY.levels[level].label+'. Применится к новым картам.');return true;
}
const initBeforeDifficulty=Match8.init;
Match8.init=function(m){
 const first=m.modelVersion!==8||!m.v8;
 if(first)Difficulty.freeze(m);
 const result=initBeforeDifficulty.call(this,m);
 if(first&&m.difficulty.level!==CAREER_DIFFICULTY.default)this.event(m,'Сложность «'+CAREER_DIFFICULTY.levels[m.difficulty.level].label+'»: коэффициенты силы '+m.sides.map((s,i)=>S.teams[s.team].short+' ×'+m.difficulty.multipliers[i]).join(' / ')+'.','difficulty');
 return result;
};
const unitBeforeDifficulty=Match8.unit;
Match8.unit=function(m,p){
 const side=m.sides.findIndex(s=>s.heroes.includes(p));
 return unitBeforeDifficulty.call(this,m,p)*Difficulty.factor(m,side);
};
const freshBeforeDifficulty=fresh;
fresh=function(...args){freshBeforeDifficulty(...args);S.difficulty=CAREER_DIFFICULTY.default;save();render();};
const migrateBeforeDifficulty=migrate;
migrate=function(){
 if(S.difficulty===undefined)S.difficulty=CAREER_DIFFICULTY.default;
 return migrateBeforeDifficulty();
};
const validBeforeDifficulty=validSave;
validSave=function(state){
 return validBeforeDifficulty(state)&&(state.difficulty===undefined||Difficulty.known(state.difficulty))&&
  [state.active?.live,state.active?.sim13?.live,state.practice13?.live].every(m=>Difficulty.validMap(m,state));
};
const settingsBeforeDifficulty=settings;
settings=function(){return Difficulty.panel()+settingsBeforeDifficulty();};
const matchViewBeforeDifficulty=matchView;
matchView=function(){
 const html=matchViewBeforeDifficulty(),m=S.active?.live,d=m?.difficulty;
 return d?'<div class="notice difficulty-match">Сложность карты: <b>'+CAREER_DIFFICULTY.levels[d.level].label+'</b> · '+m.sides.map((s,i)=>esc(S.teams[s.team].short)+' ×'+d.multipliers[i]).join(' / ')+'</div>'+html:html;
};
