'use strict';
/**
 * Loads AFTER v5/admissions.js and hotfix-b.
 * Forces the fixed mandatory list (incl. Xtreme Gaming) into every
 * majorVersion-5 operator field, ignoring season rank and busy flags.
 */
(function () {
  if (typeof Admissions5 === 'undefined') return;

  const MANDATORY = [
    'Team Spirit', 'PARIVISION', 'BetBoom Team', 'Team Liquid', 'Xtreme Gaming',
    '1w Team', 'OG', 'Aurora Gaming', 'LGD Gaming', 'Natus Vincere', 'GamerLegion',
    'Team Yandex', 'Team Tidebound', 'Xipto Esports', 'PlayTime',
  ].map((n) => n.toLowerCase());

  function mandatoryIds() {
    const set = new Set(MANDATORY);
    return S.teams.filter((t) => set.has(String(t.name).toLowerCase())).map((t) => t.id);
  }

  function forceField(e, n) {
    const core = mandatoryIds();
    const strengthOf = (id) => (typeof strength === 'function' ? strength(S.teams[id]) : 0);
    const mandatorySet = new Set(core);
    let field = core.slice();
    if (!field.includes(S.club)) field.push(S.club);
    field = [...new Set(field)];
    field.sort((a, b) => strengthOf(b) - strengthOf(a));

    // Prefer non-fiction outsiders, then anyone.
    const rest = S.teams
      .map((t) => t.id)
      .filter((id) => !field.includes(id))
      .sort((a, b) => {
        const fa = S.teams[a].fiction ? 1 : 0;
        const fb = S.teams[b].fiction ? 1 : 0;
        return fa - fb || strengthOf(b) - strengthOf(a);
      });
    while (field.length < n && rest.length) field.push(rest.shift());
    field = field.slice(0, n);

    // Guarantee every mandatory team when n is large enough.
    if (n >= core.length) {
      for (const id of core) {
        if (field.includes(id)) continue;
        const swapIdx = field.findIndex((tid) => !mandatorySet.has(tid) && tid !== S.club);
        if (swapIdx >= 0) field[swapIdx] = id;
      }
    }
    // Guarantee player club if it is mandatory.
    if (mandatorySet.has(S.club) && !field.includes(S.club)) {
      const swapIdx = field.findIndex((tid) => !mandatorySet.has(tid));
      if (swapIdx >= 0) field[swapIdx] = S.club;
      else if (field.length) field[field.length - 1] = S.club;
    }
    return field.slice(0, n);
  }

  const prevFreeze = Admissions5.freeze.bind(Admissions5);
  Admissions5.freeze = function (e) {
    const q = e.qualification;
    if (!q || q.majorVersion !== 5) return prevFreeze(e);

    // Run original freeze first (creates regional children etc.).
    let result;
    try {
      result = prevFreeze(e);
    } catch (err) {
      result = q;
    }

    const rule = q.policy || Admissions5.policy?.(e) || { field: 16, direct: 16 };
    const n = rule.field || format6?.(e)?.n || 16;
    const core = mandatoryIds();
    const mandatorySet = new Set(core);
    const rows = q.rows || Admissions5.rows?.(e) || [];
    const byId = Object.fromEntries(rows.map((r) => [r.team, r]));

    // Rebuild direct invites: mandatory first (ignore busy), then previous invites.
    const invited = [];
    for (const id of core) {
      if (invited.length >= Math.min(rule.direct || n, n)) break;
      const row = byId[id] || {
        team: id,
        rank: 0,
        index: 1,
        region: typeof Qualifiers !== 'undefined' ? Qualifiers.region(S.teams[id]) : 'EU',
      };
      invited.push({
        ...row,
        team: id,
        reason: 'mandatory',
        text: 'Обязательный инвайт',
      });
    }
    for (const v of q.invited || []) {
      if (invited.length >= (rule.direct || n)) break;
      if (invited.some((x) => x.team === v.team)) continue;
      invited.push(v);
    }
    // Pad direct slots with strongest remaining if still short.
    if (invited.length < (rule.direct || 0)) {
      const strengthOf = (id) => (typeof strength === 'function' ? strength(S.teams[id]) : 0);
      const pad = S.teams
        .map((t) => t.id)
        .filter((id) => !invited.some((v) => v.team === id))
        .sort((a, b) => strengthOf(b) - strengthOf(a));
      while (invited.length < (rule.direct || 0) && pad.length) {
        const id = pad.shift();
        invited.push({
          team: id,
          reason: 'pad',
          text: 'Добор',
          region: typeof Qualifiers !== 'undefined' ? Qualifiers.region(S.teams[id]) : 'EU',
        });
      }
    }

    q.invited = invited;
    q.player = {
      team: S.club,
      index: rows.find((r) => r.team === S.club)?.index ?? 0,
      invited: invited.some((r) => r.team === S.club),
      reason: invited.some((r) => r.team === S.club) ? 'mandatory' : 'below-cutoff',
    };
    if (q.status === 'blocked' && invited.length >= Math.min(rule.direct || 1, n)) {
      q.status = 'frozen';
      q.reason = undefined;
    }

    // If all slots are direct (e.g. PGL direct:16), finalize field now.
    if ((rule.direct || 0) >= n && Object.keys(rule.quotas || {}).length === 0) {
      const field = forceField(e, n);
      q.status = 'complete';
      q.qualified = field;
      q.completedDay = S.day;
      e.qualified13 = field;
      e.qualification13 = {
        invited: field.filter((id) => mandatorySet.has(id) || id === S.club),
        matches: [],
        day: S.day,
        majorVersion: 5,
        mode: 'mandatory-hard-v5',
      };
      log(e.name + ' · обязательное поле из ' + field.length + ' команд (вкл. Xtreme / mandatory list).');
    }

    return result || q;
  };

  const prevComplete = Admissions5.complete.bind(Admissions5);
  Admissions5.complete = function (e) {
    const q = e.qualification;
    if (!q || q.majorVersion !== 5) return prevComplete(e);

    let ids = null;
    try {
      ids = prevComplete(e);
    } catch (err) {
      ids = null;
    }

    const n = q.fieldSize || q.policy?.field || format6?.(e)?.n || 16;
    const forced = forceField(e, n);
    const mandatorySet = new Set(mandatoryIds());

    // Merge: forced mandatory first, then original extras.
    const merged = [];
    for (const id of forced) if (!merged.includes(id)) merged.push(id);
    if (Array.isArray(ids)) {
      for (const id of ids) if (!merged.includes(id) && merged.length < n) merged.push(id);
    }
    while (merged.length < n) {
      const pad = S.teams.find((t) => !merged.includes(t.id));
      if (!pad) break;
      merged.push(pad.id);
    }
    const field = merged.slice(0, n);

    q.status = 'complete';
    q.qualified = field;
    q.completedDay = S.day;
    q.player = {
      team: S.club,
      invited: field.includes(S.club),
      reason: field.includes(S.club) ? 'mandatory' : 'below-cutoff',
      index: 1,
    };
    // Keep invited list reflecting mandatory membership.
    q.invited = field
      .filter((id) => mandatorySet.has(id) || id === S.club)
      .slice(0, q.policy?.direct || field.length)
      .map((id) => ({
        team: id,
        reason: mandatorySet.has(id) ? 'mandatory' : 'player',
        text: mandatorySet.has(id) ? 'Обязательный инвайт' : 'Клуб игрока',
      }));
    e.qualified13 = field;
    e.qualification13 = {
      invited: q.invited.map((v) => v.team),
      matches: e.qualification13?.matches || [],
      day: S.day,
      majorVersion: 5,
      mode: 'mandatory-hard-v5',
    };
    return [...field];
  };

  // Safety net on startEvent: never open spectator mode if club is mandatory.
  const prevStart = startEvent;
  startEvent = function (...args) {
    const e = typeof nextEvent === 'function' ? nextEvent() : null;
    if (e && e.qualification?.majorVersion === 5 && !e.done) {
      try {
        Admissions5.complete(e);
      } catch (_) {}
      const n = e.qualification?.fieldSize || format6?.(e)?.n || 16;
      if (!e.qualified13 || !e.qualified13.includes(S.club)) {
        e.qualified13 = forceField(e, n);
        e.qualification = e.qualification || { majorVersion: 5, status: 'complete' };
        e.qualification.status = 'complete';
        e.qualification.qualified = e.qualified13;
      }
    }
    const result = prevStart.apply(this, args);
    // If start still put us in spectator mode, tear it down and rebuild with forced field.
    if (S.active && (S.active.spectator13 || S.active.autoCoach13) && S.active.event != null) {
      const ev = S.events.find((x) => x.id === S.active.event);
      if (ev) {
        const n = format6?.(ev)?.n || S.active.entrants?.length || 16;
        const field = forceField(ev, n);
        if (field.includes(S.club)) {
          S.active.spectator13 = false;
          S.active.autoCoach13 = false;
          S.active.entrants = field;
          ev.entrants = field;
          ev.qualified13 = field;
          log(ev.name + ' · состав принудительно обновлён: клуб игрока в поле.');
          if (typeof seekMatch6 === 'function') seekMatch6();
        }
      }
    }
    return result;
  };

  log?.('hotfix-mandatory: обязательный список из 15 команд активен для v5-операторов.');
})();
