'use strict';
/**
 * Restore clear access to autoTournament13 ("Поручить турнир тренеру").
 * match33c hid it inside a collapsed <details>; spectator/job panels had no entry.
 */
(function () {
  if (typeof matchView !== 'function') return;
  const prev = matchView;

  function coachBar() {
    const a = S.active;
    if (!a || a.autoCoach13) return '';
    if (!a.entrants || !a.entrants.includes(S.club)) return '';
    return (
      '<section class="panel" style="margin:12px 0">' +
      '<h2>Тренер</h2>' +
      '<p class="sub">Турнир можно полностью отдать тренеру: он досимулирует все серии, сохранит призовые и усталость. Вернуться к ручной игре можно между картами.</p>' +
      '<div class="actions">' +
      (typeof btn === 'function'
        ? btn('Поручить турнир тренеру', 'autoTournament13()', true)
        : '<button class="primary" onclick="autoTournament13()">Поручить турнир тренеру</button>') +
      '</div></section>'
    );
  }

  matchView = function (...args) {
    // autoCoach path keeps the job panel from world-v1.3
    if (S.active?.autoCoach13) return prev.apply(this, args);

    let html = prev.apply(this, args);
    const bar = coachBar();
    if (!bar) return html;

    // Avoid double-insert if already present
    if (html.includes('autoTournament13()') && html.includes('Поручить турнир тренеру')) {
      // Still ensure a top-level panel, not only buried details
      if (!html.includes('>Тренер</h2>')) {
        html = bar + html;
      }
      return html;
    }
    return bar + html;
  };

  // Safety: expose helper on window for debugging
  window.assignTournamentToCoach = function () {
    if (typeof autoTournament13 === 'function') return autoTournament13();
    toast?.('Функция тренера недоступна в этой сборке.');
  };
})();
