'use strict';
(function () {
  // Ensure the mobile nav node exists (missing from index.html caused boot crash).
  if (!document.getElementById('mobileNav33c')) {
    const nav = document.createElement('nav');
    nav.id = 'mobileNav33c';
    nav.className = 'c-mobile-nav';
    nav.setAttribute('aria-label', 'Мобильная навигация');
    const status = document.getElementById('broadcastStatus33c');
    if (status && status.parentNode) status.parentNode.insertBefore(nav, status.nextSibling);
    else document.body.appendChild(nav);
  }

  const prev = typeof render === 'function' ? render : null;
  if (!prev) return;
  render = function (...args) {
    const result = prev.apply(this, args);
    try {
      if (!S) return result;
      const mobileNav = document.getElementById('mobileNav33c');
      if (mobileNav) {
        mobileNav.innerHTML = [
          ['home', 'Главная', '◈'],
          ['squad', 'Команда', '♙'],
          ['match', 'Матч', '▷'],
          ['menu21', 'Ещё', '☰'],
        ]
          .map(
            ([key, label, icon]) =>
              '<button aria-current="' +
              (page === key ? 'page' : 'false') +
              '" onclick="go(\'' +
              key +
              '\')"><span aria-hidden="true">' +
              icon +
              '</span>' +
              label +
              '</button>'
          )
          .join('');
      }
      const status = document.getElementById('broadcastStatus33c');
      if (status && typeof my === 'function') {
        status.innerHTML =
          '<span class="c-status-dot"></span><b>' +
          esc(my().short) +
          '</b><span>' +
          date(S.day) +
          '</span><span>' +
          esc(S.active ? 'Серия ' + S.active.score.join(' : ') : 'Подготовка к турниру') +
          '</span><strong>V5.0 B / ARENA</strong>';
      }
    } catch (err) {
      console.warn('mobileNav hotfix:', err);
    }
    return result;
  };

  // Patch the original crash site if broadcast33c already bound an unsafe render.
  try {
    const src = String(prev);
    if (src.includes('mobileNav33c') && src.includes('.innerHTML')) {
      // already wrapped above
    }
  } catch (_) {}
})();
