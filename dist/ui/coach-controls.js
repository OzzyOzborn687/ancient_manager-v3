'use strict';
// Visible between maps and during manual play; auto-coach keeps its progress panel.
const matchBeforeCoachControls=matchView;
matchView=function(...args){
 let html=matchBeforeCoachControls(...args);const a=S.active;
 if(!a||a.autoCoach13||!a.entrants?.includes(S.club))return html;
 html=html.replace(/<button\b[^>]*\bonclick="autoTournament13\(\)"[^>]*>[\s\S]*?<\/button>/g,'');
 return '<section class="panel coach-controls33"><h2>Тренер</h2><p class="sub">Тренер досимулирует серии с сохранением призовых и усталости. Вернуться к ручной игре можно между картами.</p><div class="actions">'+btn('Поручить турнир тренеру','autoTournament13()',true)+(!a.live&&!a.seriesDone?btn('Быстрая симуляция матча','quickMatch33C()'):'' )+'</div></section>'+html;
};
window.assignTournamentToCoach=()=>autoTournament13();

async function quickMatch33C(){
 const a=S.active;if(!a||a.autoCoach13||a.spectator13||a.seriesDone)return;
 if(!a.live)playMap();
 const m=a.live;if(!m)return;
 if(m.draftUpdatePending){m.quickSimulationPending=true;save();showDraftUpdate();return;}
 return skipMatch22();
}
