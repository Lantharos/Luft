#!/usr/bin/env python3
import sys

from client import Connection, Toplevel

IDS = {
    "compositor": 4,
    "shm": 5,
    "wm_base": 6,
    "surface": 7,
    "xdg_surface": 8,
    "toplevel": 9,
    "pool": 10,
    "buffer": 11,
}


def main():
    title, app_id = sys.argv[1:3]
    connection = Connection()
    connection.bind(
        (
            ("wl_compositor", 4, IDS["compositor"]),
            ("wl_shm", 1, IDS["shm"]),
            ("xdg_wm_base", 1, IDS["wm_base"]),
        )
    )
    toplevel = Toplevel(connection, IDS)
    toplevel.map(title, app_id)
    toplevel.run()


main()
