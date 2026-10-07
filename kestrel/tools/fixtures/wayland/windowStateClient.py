#!/usr/bin/env python3
import signal
import struct
import sys

from client import Connection, Toplevel

IDS = {
    "compositor": 4, "shm": 5, "wm_base": 6, "window_manager": 7, "surface": 8,
    "xdg_surface": 9, "toplevel": 10, "pool": 11, "buffer": 12, "window_state": 13,
}
SET_SKIP_WINDOW_LIST, SET_KEEP_ABOVE = 1, 3


def main():
    requests = sys.argv[1:]
    connection = Connection()
    connection.bind((("wl_compositor", 4, IDS["compositor"]), ("wl_shm", 1, IDS["shm"]),
                     ("xdg_wm_base", 1, IDS["wm_base"]), ("kestrel_window_manager_v1", 1, IDS["window_manager"])))
    toplevel = Toplevel(connection, IDS)
    toplevel.map(f"Kestrel window state: {' '.join(requests)}", "com.lantharos.Kestrel.WindowState")
    connection.send(IDS["window_manager"], 1, struct.pack("=II", IDS["window_state"], IDS["toplevel"]))
    if "skip" in requests:
        connection.send(IDS["window_state"], SET_SKIP_WINDOW_LIST)
    if "above" in requests:
        connection.send(IDS["window_state"], SET_KEEP_ABOVE)
    signal.signal(signal.SIGUSR1, lambda *_: connection.send(IDS["window_state"], 0))
    toplevel.run()


main()
