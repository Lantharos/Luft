# Albanian review list

Strings in Luft's Albanian translation that a native speaker should check: terms with no settled equivalent, sentences built around a placeable that may not fit every value, and labels that may clip.

## Meet Luft

- `apps/meet/locales/sq/meet.ftl` `luft-title`: "Luft-i yt" — the only place Luft takes an Albanian ending, since “yt” needs the definite form; check whether that reads naturally or a rephrasing is better.
- `apps/meet/locales/sq/meet.ftl` `room-place-whole`: "I gjithë disku { $drive }" — check the agreement with drive names like “Samsung SSD 990 PRO”.
- `apps/meet/desktop/locales/sq/desktop.ftl` `helper-box-room-shortfall`: "Vendi i Luft mund të lirojë { $available } GB, ndërsa këto kanë nevojë për { $needed } GB." — "Luft’s room can spare" is the space already set aside for Luft; check that comes across.

## Kestrel and setup

- `kestrel/ui/locales/sq/system.ftl` `inhibit-shortcuts-titled-app`, `privacy-reported-app`: written without a fluent speaker; check that the window title reads naturally in the sentence and that the note after a name says Kestrel couldn't check it, not that the app is untrustworthy.
