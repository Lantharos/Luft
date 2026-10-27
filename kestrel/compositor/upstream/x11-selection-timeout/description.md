# x11/selection: Stop waiting on X11 selection owners that don't answer

Based on main at b48811767.

## Description

Reading an X11 selection for a Wayland client waits for the owner's `SelectionNotify` and for every INCR chunk without a time limit, and the input stream ignores its cancellable. When an X11 client drops its selection while a paste is being requested, or just stops answering, the Wayland requestor waits forever.

With this change a conversion fails:

- after five seconds without an answer or the next INCR chunk, as ICCCM requestors do;
- when its cancellable is cancelled;
- as soon as the selection loses its owner, or the X11 display shuts down.

The requestor then gets an error and its file descriptor is closed.
