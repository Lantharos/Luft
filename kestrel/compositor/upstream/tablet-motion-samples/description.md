# clutter/stage: Keep every motion event of tablet tools

Based on main at b766717ac.

## Description

`_clutter_stage_process_queued_events()` drops all but the last of consecutive motion events from a device. That is right for pointers, but pens usually report their position several times per frame, and anything drawing strokes in the compositor's own UI, such as a shell's screenshot annotation or handwriting input, only sees one of them per frame, with the pressure in between lost. Wayland clients aren't affected, since the event filter hands every event to the Wayland seat before it is queued.

Tablet tool motion was never merged anyway: `clutter_stage_compress_motion()` gives up on events without relative motion, which absolute tablet events are, so the earlier event was simply dropped. This processes every motion event that carries a device tool and keeps compressing the rest. The wheel axis merging in `clutter_stage_compress_motion()` only applied to relative tool motion, so it goes away.

The extra events only reach the actors under the tool, and painting still happens once per frame.
