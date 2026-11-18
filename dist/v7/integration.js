'use strict';
// Retirement replacements come from the signed reserve. New external contracts use the market.
const retirementCandidatesBefore7=retirementCandidates;
retirementCandidates=function(player){return retirementCandidatesBefore7(player).filter(p=>p.team===S.club);};
const patchBefore7=patchViewV1;
patchViewV1=function(...args){return '<section class="panel"><span class="eyebrow">V7.0 / TRANSFER CENTRE</span><h1>Каждый трансфер — решение двух сторон</h1><p>Новый рынок: кандидаты, избранное, переговоры и доступность собственных игроков. Сначала согласуйте переход с клубом, затем личный контракт. Ответы приходят по игровому календарю; предложения имеют срок действия. Оценка стоимости не гарантирует цену сделки.</p><p>Согласованные суммы резервируются для переговоров, но списываются только при подписании. Последний этап повторно проверяет бюджет, состав и доступность игрока. Тренировки и управление клубом продолжаются во время ожидания.</p></section>'+patchBefore7(...args);};
const alertsBefore7=alerts33C;
alerts33C=function(...args){const rows=alertsBefore7(...args),ready=(S.market7?.deals||[]).filter(d=>d.buyer===S.club&&['club_terms','player_counter','agreed'].includes(d.stage)).length,incoming=(S.market7?.incoming||[]).filter(d=>d.source===S.club&&d.stage==='offered').length;if(ready||incoming)rows.push({text:incoming?'Предложения по вашим игрокам: '+incoming:'Есть ответы по трансферам: '+ready,action:"MarketUI7.setTab('"+(incoming?'sales':'deals')+"');go('market')",label:'Открыть переговоры',kind:'info'});return rows;};
