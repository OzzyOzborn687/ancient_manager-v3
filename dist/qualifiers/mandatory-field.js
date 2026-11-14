'use strict';
/**
 * HARD guarantee:
 * - Operator events (Blast / PGL / ESL / DreamLeague): every team from
 *   QUALIFIERS.mandatoryTeamNames is ALWAYS in the field when the slot count allows.
 * - The player's club is ALWAYS in the field if it is in that list (or if space remains).
 * - busy / schedule conflicts are IGNORED for mandatory teams.
 * - Non-operator events: same mandatory core + closed regional fill.
 */
(function () {
  function mandatoryIds() {
    const names = new Set((QUALIFIERS.mandatoryTeamNames || []).map((n) => n.toLowerCase()));
    return S.teams.filter((t) => names.has(String(t.name).toLowerCase())).map((t) => t.id);
  }

  function forceMandatoryField(e, n) {
    const core = mandatoryIds();
    // Player club always stays if it is part of the mandatory list, otherwise fill if space.
    let field = core.filter((id, i, arr) => arr.indexOf(id) === i);
    if (!field.includes(S.club)) field.push(S.club);

    // Prefer strength order but keep every mandatory team before any outsider.
    const strengthOf = (id) => (typeof strength === 'function' ? strength(S.teams[id]) : 0);
    const mandatorySet = new Set(core);
    const kept = field.filter((id) => mandatorySet.has(id) || id === S.club);
    kept.sort((a, b) => strengthOf(b) - strengthOf(a));

    // Truncate only if field is smaller than the mandatory list (e.g. 8-team FISSURE-style).
    let invited = kept.slice(0, n);

    // Fill remaining slots by strength from the rest of the world.
    const rest = S.teams
      .map((t) => t.id)
      .filter((id) => !invited.includes(id) && !S.teams[id].fiction)
      .sort((a, b) => strengthOf(b) - strengthOf(a));
    while (invited.length < n && rest.length) invited.push(rest.shift());

    // Last resort: allow fiction academies.
    if (invited.length < n) {
      const fiction = S.teams
        .map((t) => t.id)
        .filter((id) => !invited.includes(id))
        .sort((a, b) => strengthOf(b) - strengthOf(a));
      while (invited.length < n && fiction.length) invited.push(fiction.shift());
    }

    invited = invited.slice(0, n);

    // Absolute guarantee: if player is mandatory and still missing, swap weakest outsider.
    if (mandatorySet.has(S.club) && !invited.includes(S.club)) {
      const outsiders = invited
        .map((id, idx) => ({ id, idx, s: strengthOf(id), mandatory: mandatorySet.has(id) }))
        .filter((x) => !x.mandatory);
      if (outsiders.length) {
        outsiders.sort((a, b) => a.s - b.s);
        invited[outsiders[0].idx] = S.club;
      } else if (invited.length) {
        invited[invited.length - 1] = S.club;
      } else {
        invited = [S.club];
      }
    }

    // Absolute guarantee for every mandatory team when n is large enough.
    if (n >= core.length) {
      for (const id of core) {
        if (invited.includes(id)) continue;
        const outsiders = invited
          .map((tid, idx) => ({ id: tid, idx, s: strengthOf(tid), mandatory: mandatorySet.has(tid) }))
          .filter((x) => !x.mandatory && x.id !== S.club);
        if (outsiders.length) {
          outsiders.sort((a, b) => a.s - b.s);
          invited[outsiders[0].idx] = id;
        }
      }
    }

    return invited.slice(0, n);
  }

  // Patch invitations so mandatory teams ignore busy conflicts.
  const prevInvitations = Qualifiers.invitations.bind(Qualifiers);
  Qualifiers.invitations = function (e, n, allRows, champion, rules) {
    const plan = prevInvitations(e, n, allRows, champion, rules);
    const core = mandatoryIds();
    const mandatorySet = new Set(core);
    const rows = (allRows || this.rows(e));
    const byId = Object.fromEntries(rows.map((r) => [r.team, r]));

    // Rebuild invited: every free-or-busy mandatory team first.
    const invited = [];
    for (const id of core) {
      if (invited.length >= n) break;
      const row = byId[id] || {
        team: id,
        region: this.region(S.teams[id]),
        elo: 0,
        form: 0,
        index: 0,
        busy: null,
      };
      invited.push({
        ...row,
        reason: 'mandatory',
        text: 'Обязательный инвайт оператора',
      });
    }
    // Keep previous non-mandatory invites to fill budget if needed.
    if (plan?.invited) {
      for (const v of plan.invited) {
        if (invited.length >= Math.min(n, (rules && rules.invites) || n)) break;
        if (invited.some((x) => x.team === v.team)) continue;
        if (mandatorySet.has(v.team)) continue;
        invited.push(v);
      }
    }

    const own = rows.find((s) => s.team === S.club);
    return {
      ok: true,
      invited,
      rows: rows,
      skipped: plan?.skipped || [],
      champion: plan?.champion ?? champion ?? null,
      championUnavailable: false,
      player: {
        team: S.club,
        index: own?.index ?? 0,
        cutoff: null,
        invited: invited.some((s) => s.team === S.club),
        reason: invited.some((s) => s.team === S.club) ? 'mandatory' : 'below-cutoff',
      },
    };
  };

  // Patch complete so the final field always contains mandatory teams.
  const prevComplete = Qualifiers.complete.bind(Qualifiers);
  Qualifiers.complete = function (e) {
    let qualified = null;
    try {
      qualified = prevComplete(e);
    } catch (err) {
      qualified = null;
    }
    const n = (typeof format6 === 'function' ? format6(e).n : null) || e.qualification?.fieldSize || 16;
    const forced = forceMandatoryField(e, n);
    if (!qualified || qualified.length !== n || forced.some((id) => !qualified.includes(id))) {
      qualified = forced;
    }
    // Merge: mandatory first, then previous extras.
    const mandatorySet = new Set(mandatoryIds());
    const merged = [];
    for (const id of forced) if (!merged.includes(id)) merged.push(id);
    if (Array.isArray(qualified)) {
      for (const id of qualified) if (!merged.includes(id) && merged.length < n) merged.push(id);
    }
    while (merged.length < n) {
      const pad = S.teams.find((t) => !merged.includes(t.id));
      if (!pad) break;
      merged.push(pad.id);
    }
    const finalField = merged.slice(0, n);
    e.qualified13 = finalField;
    if (e.qualification) {
      e.qualification.status = 'complete';
      e.qualification.qualified = finalField;
      e.qualification.completedDay = S.day;
      e.qualification.invited = finalField
        .filter((id) => mandatorySet.has(id) || id === S.club)
        .map((id) => ({
          team: id,
          reason: mandatorySet.has(id) ? 'mandatory' : 'player',
          text: mandatorySet.has(id) ? 'Обязательный инвайт оператора' : 'Клуб игрока',
          region: Qualifiers.region(S.teams[id]),
        }));
      e.qualification.player = {
        team: S.club,
        invited: finalField.includes(S.club),
        reason: finalField.includes(S.club) ? 'mandatory' : 'below-cutoff',
        index: 1,
        cutoff: null,
      };
    }
    e.qualification13 = {
      invited: (e.qualification?.invited || []).map((v) => v.team),
      matches: e.qualification13?.matches || [],
      day: S.day,
      qualVersion: QUALIFIERS.version,
      mode: 'mandatory-hard',
    };
    return [...finalField];
  };

  // qualify13: operators go through complete (now hard-guaranteed); others use mandatory core.
  const legacyQualify = typeof qualify13 === 'function' ? qualify13 : null;
  qualify13 = function (e, f) {
    if (typeof Qualifiers !== 'undefined' && Qualifiers.supports?.(e)) {
      // Ensure qualification object exists even on old saves.
      if (!e.qualification) {
        e.qualification = {
          qualVersion: QUALIFIERS.version,
          status: 'pending',
          mode: 'mandatory-hard',
        };
      }
      e.qualification.qualVersion = QUALIFIERS.version;
      const qualified = Qualifiers.complete(e);
      if (qualified && qualified.length) return [...qualified];
      return forceMandatoryField(e, f.n);
    }
    if (e.qualified13 && e.qualified13.length === f.n && e.qualified13.includes(S.club)) {
      // Still re-assert mandatory membership.
      const forced = forceMandatoryField(e, f.n);
      if (forced.every((id) => e.qualified13.includes(id))) return e.qualified13;
    }
    const field = forceMandatoryField(e, f.n);
    e.qualification13 = {
      invited: field.filter((id) => mandatoryIds().includes(id) || id === S.club),
      matches: [],
      day: S.day,
      mode: 'mandatory-closed',
    };
    e.qualified13 = field;
    return field;
  };
})();
