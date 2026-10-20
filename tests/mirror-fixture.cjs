'use strict';
// Use the exact same draft and player/club conditions across seeds and sides.
// Seed only match execution, action choice and encounter outcomes.
module.exports=`
function mirrorMap26(seed,tactics,heroes=['Juggernaut','Puck','Mars','Rubick','Oracle']){
 const random=Math.random;
 try{Math.random=()=>seed/4294967296;fresh();}finally{Math.random=random;}
 S.seed=seed;
 for(const id of [0,6])for(const p of roster(S.teams[id])){
  p.skill=85;p.form=80;p.morale=80;p.fatigue=10;
  p.attributes13={lane:85,mechanics:85,decisions:85,teamwork:85,versatility:85};
 }
 const details=[0,6].map(id=>roster(S.teams[id]).map((p,i)=>({player:p.name,hero:heroes[i],games:100,observed:true,mastery:1})));
 const draft={own:[...heroes],enemy:[...heroes],bans:[],details,trace:[]};
 const m=makeLive4({opponent:6},draft,[0,6]);m.tactics22=[...tactics];m.scope13='scrim';
 for(let role=0;role<5;role++){
  const common=structuredClone(m.sides[0].heroes[role]);
  Object.assign(m.sides[1].heroes[role],common,{zone:laneZone6(1,role),destination:laneZone6(1,role)});
 }
 m.teamRating=[85,85];m.cohesion6=[80,80];m.preparation21=[0,0];m.scout13=[0,0];
 S.seed=seed+73;
 return m;
}
`;
