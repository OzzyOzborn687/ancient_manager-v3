# Tournament recap animations — V5.2 D concept integrated into V6.0

Two new presentations use the current Matchday UI:
- CHAMPIONS after the user's club wins the tournament.
- ELIMINATED after its competitive elimination, with its actual place and the current tournament table.

Both show the actual event title/edition, participant logos and placements. A gold/silver/bronze podium highlights places 1/2/3. Unresolved medals remain unknown until decided; tied places derive from actual placements and scheduled knockout slots (for example 7–8 even before the second loser is known). No standings or winners are invented.

The early-exit recap pauses manual progression before remaining AI series are simulated. Continuing resumes the existing engine. Group-elimination broadcasts remain available and appear before the personal recap when both are pending. Delegated tournaments show their result once the simulation finishes; withdrawn/spectator/background events do not interrupt management.

Snapshots and acknowledgement are saved. Unclosed recaps reopen on reload; acknowledged ones do not auto-repeat. Final settlement updates an early recap to the completed table without a second interruption. The bracket offers replay. Old saves remain valid; the new optional snapshot schema validates IDs, positions, shared ranges and keys.

Validation: actual final win, playoff loss and group exit; shared and unresolved ranks; background/withdrawal guards; malformed snapshots; browser win/loss, map-action pause, save/reload, dismissal/replay, reduced motion and 1440/390/320 layouts. Existing elimination/startup/draft checks retained. Match formulas, prizes and progression mechanics unchanged.
