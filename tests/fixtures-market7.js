'use strict';
// Regression fixture: drive the real delayed negotiation state machine without simulating unrelated tournaments.
module.exports=`function finishNegotiation7(playerId, role='starter', sign=true){
 const p=S.players[playerId];let d=Market7.deal(playerId)||Market7.request(playerId);d=Market7.deal(playerId)||d;
 if(!d)throw Error('Negotiation was not opened for '+p.name);
 for(let i=0;i<30;i++){
  if(['inquiry','club_pending','player_pending'].includes(d.stage)){S.day=Math.max(S.day+1,d.due??S.day+1);Market7.tick();}
  else if(d.stage==='club_terms'){Market7.proposeClub(d.id,d.fee);}
  else if(d.stage==='club_agreed'||d.stage==='player_counter'){Market7.proposeContract(d.id,d.salary,d.days,role);}
  else if(d.stage==='agreed'){if(!sign)return d.fee;const fee=d.fee;Market7.sign(d.id);if(p.team!==S.club)throw Error('Signing failed: '+d.message);return fee;}
  else if(d.stage==='signed')return d.fee;
  else throw Error('Negotiation stopped at '+d.stage+': '+d.message);
 }
 throw Error('Negotiation did not settle: '+d.stage);
}`;
