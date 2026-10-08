#!/usr/bin/env python3
import struct
import sys

from client import Connection, Toplevel

CONTENT_TYPES = {"none": 0, "photo": 1, "video": 2, "game": 3}
IDS = {
    "compositor": 4,
    "shm": 5,
    "wm_base": 6,
    "content_type_manager": 7,
    "surface": 8,
    "content_type": 9,
    "xdg_surface": 10,
    "toplevel": 11,
    "pool": 12,
    "buffer": 13,
}


def main():
    content_type = sys.argv[1]
    title = " ".join(sys.argv[1:])
    connection = Connection()
    connection.bind(
        (
            ("wl_compositor", 4, IDS["compositor"]),
            ("wl_shm", 1, IDS["shm"]),
            ("xdg_wm_base", 1, IDS["wm_base"]),
            ("wp_content_type_manager_v1", 1, IDS["content_type_manager"]),
        )
    )
    toplevel = Toplevel(connection, IDS)
    connection.send(IDS["content_type_manager"], 1, struct.pack("=II", IDS["content_type"], IDS["surface"]))
    connection.send(IDS["content_type"], 1, struct.pack("=I", CONTENT_TYPES[content_type]))
    toplevel.map(f"Kestrel content type: {title}", "com.lantharos.Kestrel.ContentType")
    toplevel.run()


main()
