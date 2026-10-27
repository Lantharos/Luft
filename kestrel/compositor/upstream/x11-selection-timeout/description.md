# x11/selection: Stop waiting forever on X11 selection owners

Based on main at b48811767.

## Description

Reading an X11 selection waits for the owner's `SelectionNotify` and for each INCR chunk, and `MetaX11SelectionInputStream` ignores the cancellable it's given. When the owner never answers, because it's frozen or exits while a request is in flight, the read stays pending forever. `MetaSelection` already cancels transfers after 15 seconds, and the clipboard manager cancels its transfer when the selection changes, but neither reaches X11 selections, so a Wayland client pasting from such an owner never gets its data or an end of file.

To reproduce: copy something in an X11 client, stop it with `kill -STOP`, then paste in a Wayland client. The paste never finishes.

The series:

- frees the INCR size property, which leaked for every INCR transfer;
- clears the pending read before returning it, since the callback can start the next read right away, which was then dropped without ever returning (`GTask ... finalized without ever returning` in the new test);
- fails pending reads when the X11 display shuts down;
- fails a conversion, or a read waiting for the next INCR chunk, when its cancellable is cancelled, which makes the existing 15 second transfer timeout work for X11 selections too;
- adds an X11 test client that owns the clipboard and either never answers or stops after the first INCR chunk, and tests that cancelling a transfer from it finishes the transfer. Both tests hang without the series.
