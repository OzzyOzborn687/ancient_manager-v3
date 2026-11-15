# BETA V6.0 — Matchday interface

## Changes

- Black/ivory/lime Matchday layout is enabled by default; no preview URL flag required.
- The home hero replaces the large carry portrait with the current club crest, outlined club initials and a typographic composition. Photos in the roster strip remain.
- Shared top navigation, scrollable access to all registered tabs, save status, date, budget and the BETA V6.0 badge.
- The same bundled Roboto Condensed regular/extra-bold fonts on all tabs, flat rectangular panels and buttons, lime primary actions, readable tables, editorial headings and responsive spacing.
- Specific layouts for squad/player cards, training, bootcamp tiers, calendar, tournament brackets, trophies and live match controls.
- Existing homescreen tournament withdrawal, qualification information, bootcamp entry, background events and player profiles remain accessible. All actions call existing engine handlers.

## Preserved

No changes to match formulas, player/club data, OVR/SIN, form/fatigue dynamics, economics or save format. Existing careers continue to load.

The transfer, tournament-intro, eliminated-team and grand-final animation files in `dist/v52` are unchanged. Theme tokens are scoped to app views; dialog animation typography, colours, durations and triggers are preserved. V5.2 D remains the separate planned tournament-results animation update and is not implemented here.

## Validation

- All 28 registered screens rendered on desktop and phone, including narrow 320px layouts; no whole-page horizontal overflow or JavaScript errors.
- `tests/browser/beta6.cjs`: shared fonts/navigation, real club emblem, no hero portrait, read-only home rendering, real profile/bootcamp/day actions, save/reload, and identical computed styles for all four existing animations with the new theme enabled/disabled.
- Existing browser checks for V5.1 B withdrawal/refunds/successor camp, V5.2 transfer, V5.2 A tournament intro, V5.2 B elimination, V5.2 C grand final and Arena match/draft/tactical controls.
- Updated interface assertions for new class names, uppercase typography, navigation and current release label. Gameplay expectations remain intact.
