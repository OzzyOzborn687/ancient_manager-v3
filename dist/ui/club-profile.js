(() => {
'use strict';

const number = new Intl.NumberFormat('ru-RU');
let selectedClub = null;

function startingProfile(id) {
 const seed = SEED_TEAMS[id];
 const skill = seed ? avg(seed[4]) : 64;
 const variation = (id * 73 + 31) % 101;
 return {
  fans: Math.round((700 + Math.max(0, skill - 60) ** 2 * 142 + variation * 43) / 100) * 100,
  reputation: Math.round(clamp((skill - 45) * 1.75 + variation / 12)),
  budget: startingBudget(id)
 };
}

function clubStats(team) {
 const initial = startingProfile(team.id);
 let fans = initial.fans;
 let budget = team.id === S.club ? S.budget : initial.budget;
 const history = [];
 const events = S.events.filter(e => e.done).sort((a, b) =>
  (a.completedDay20 ?? a.day) - (b.completedDay20 ?? b.day) || a.id - b.id);
 for (const event of events) {
  const place = event.placements6?.[team.id] ??
   (event.champion === team.id ? 1 : team.id === S.club ? event.place : null);
  if (!Number.isInteger(place) || place < 1) continue;
  const isRegional = Qualifiers.isRegional(event);
  const size = Math.min(2, Math.max(.45, Math.sqrt((event.pool || 25000) / 250000)));
  const rate = isRegional && event.inviteWinners?.includes(team.id) ? .047 :
   place === 1 ? .07 : place <= 3 ? .035 : place <= 5 ? .01 : -.022;
  const change = Math.max(100 - fans, Math.round(fans * rate * size / 10) * 10);
  fans += change;
  history.push({ name: event.name, place, change, fans });
  if (team.id !== S.club) {
   const share = (isRegional ? QUALIFIERS.regional.prizeShares :
    {1:.36, 2:.19, 3:.11, 4:.075, 5:.04, 7:.025, 9:.006})[place] || 0;
   budget += Math.round((event.pool || 0) * share);
  }
 }
 return { ...initial, initialFans: initial.fans, fans, budget, history };
}

function clubMetrics(info) {
 return `<div class="club-metrics">${stat('Фанбаза', number.format(info.fans), 'Текущая аудитория')}${stat('Репутация', info.reputation + '/100', 'Рейтинг клуба')}${stat('Бюджет', cash(info.budget), 'Средства клуба')}</div>`;
}

function fanChart(info) {
 const values = [info.initialFans, ...info.history.map(entry => entry.fans)].slice(-9);
 if (values.length < 2) return '<p>Динамика появится после первого турнира.</p>';
 const min = Math.min(...values);
 const max = Math.max(...values);
 const points = values.map((n, i) =>
  `${10 + i * 380 / (values.length - 1)},${95 - (n - min) * 76 / Math.max(1, max - min)}`);
 return `<svg class="club-fan-chart" viewBox="0 0 400 110" role="img" aria-label="Фанбаза от ${number.format(values[0])} до ${number.format(values.at(-1))}">
  <path d="M10 95H390 M10 57H390 M10 19H390" />
  <polyline points="${points.join(' ')}" />
  ${points.map(point => {
   const [x, y] = point.split(',');
   return `<circle cx="${x}" cy="${y}" r="3"/>`;
  }).join('')}
 </svg>`;
}

function profileView() {
 const team = S.teams.find(t => t.id === selectedClub) || my();
 const info = clubStats(team);
 const options = S.teams.map(t =>
  `<option value="${t.id}"${t.id === team.id ? ' selected' : ''}>${esc(t.name)}</option>`).join('');
 return `<div class="club-banner">${head('КЛУБ', esc(team.name), esc(team.region), clubAvatar12(team, true))}</div>
 <label class="club-picker">Выбрать клуб <select id="club-profile-select">${options}</select></label>
 ${amTeamCard(team)}
 ${clubMetrics(info)}
 <section class="panel club-history"><h2>Динамика фанбазы</h2>${fanChart(info)}
 ${info.history.slice(-6).reverse().map(entry =>
  `<div class="club-result"><span>${esc(entry.name)} · место ${entry.place}</span><b class="${entry.change < 0 ? 'red' : 'green'}">${entry.change > 0 ? '+' : ''}${number.format(entry.change)}</b></div>`).join('')}
 </section>`;
}

function sponsorsView() {
 const info = clubStats(my());
 const fixed = Math.max(1500, Math.round(info.fans * .14 / 500) * 500);
 return `${head('КОММЕРЦИЯ', 'Спонсорские предложения', esc(my().name))}
 <div class="club-offers">
  <article class="panel club-offer"><h2>Vector Gear</h2><strong>${cash(fixed)} / месяц</strong><p>3 месяца · фиксированная выплата</p><details><summary>Условия</summary><p>Фиксированная сумма в течение всего срока.</p></details></article>
  <article class="panel club-offer"><h2>Northline</h2><strong>${cash(Math.round(fixed * .6 / 500) * 500)} / месяц</strong><p>3 месяца · бонус ${cash(fixed * 2)} за выход на LAN</p><details><summary>Условия</summary><p>Бонус за первый выход на LAN в период действия контракта.</p></details></article>
 </div>`;
}

window.openClubProfile = id => {
 selectedClub = id;
 go('clubProfile');
};

PAGES.push(['clubProfile','◈','Профиль клуба'], ['sponsors','◇','Спонсоры']);
const previousHome = home;
home = function () {
 return `<section class="club-home-summary"><div class="section-head"><h2>${esc(my().name)}</h2>${btn('Профиль клуба', 'openClubProfile(S.club)')}</div>${clubMetrics(clubStats(my()))}</section>${previousHome()}`;
};

const previousRender = render;
render = function () {
 previousRender();
 if (!S || busy13 || S.practice13) return;
 const app = $('app');
 if (page === 'clubProfile') {
  app.innerHTML = profileView();
  $('club-profile-select').onchange = e => {
   selectedClub = Number(e.target.value);
   render();
   $('club-profile-select').focus();
  };
 }
 if (page === 'sponsors') app.innerHTML = sponsorsView();

};
})();
