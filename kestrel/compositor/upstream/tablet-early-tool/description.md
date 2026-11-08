# wayland/tablet-seat: Add a tablet when its first tool comes near

Based on main at b766717ac. I found no existing issue or merge request for it.

## Description

`ClutterSeat::device-added` is only emitted once the stage processes its queued events on the next frame, but `MetaWaylandSeat` sees input events from the display's event filter as they arrive. Until the signal, `is_tablet_event()` doesn't count a new tablet's events as tablet events, so they are dropped. When a tool enters proximity in that window, it never gets a current tablet, and its proximity-out, which arrives after the tablet is known, calls `meta_wayland_tablet_update_sprite()` with a NULL tablet:

```
#0 meta_wayland_tablet_update_sprite
#1 meta_wayland_tablet_tool_update
#2 event_callback
#3 _clutter_event_process_filters
#4 clutter_stage_handle_event
```

A pen that is near the screen when its digitizer appears, after resume or on hotplug, can hit this. It is easy to reproduce with a virtual tablet device that sends a proximity-in, a motion and a proximity-out right after it is created.

This routes every event of a device with tablet tools to the tablet seat, creates the `MetaWaylandTablet` when a tool enters proximity on a tablet the seat hasn't seen yet, and makes `device_added` skip devices it already has. Since the tablet seat stops events it doesn't handle, it now lets `CLUTTER_DEVICE_ADDED` through like `CLUTTER_DEVICE_REMOVED`, so the signal is still emitted for a tablet it already knows.
