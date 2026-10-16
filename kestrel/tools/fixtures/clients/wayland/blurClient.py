#!/usr/bin/env python3
import struct
import sys

from client import ARGB8888, Connection, Toplevel

IDS = {
    "compositor": 4,
    "shm": 5,
    "wm_base": 6,
    "effect_manager": 7,
    "surface": 8,
    "region": 9,
    "effect": 10,
    "xdg_surface": 11,
    "toplevel": 12,
    "pool": 13,
    "buffer": 14,
}
TRANSLUCENT_PIXEL = b"\x30\x24\x18\x60"
CREATE_REGION, REGION_ADD = 1, 1
GET_BACKGROUND_EFFECT, SET_BLUR_REGION = 1, 1


def main():
    title, width, height = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    connection = Connection()
    connection.bind(
        (
            ("wl_compositor", 4, IDS["compositor"]),
            ("wl_shm", 1, IDS["shm"]),
            ("xdg_wm_base", 1, IDS["wm_base"]),
            ("ext_background_effect_manager_v1", 1, IDS["effect_manager"]),
        )
    )
    toplevel = Toplevel(connection, IDS, width, height, TRANSLUCENT_PIXEL, ARGB8888)
    connection.send(IDS["compositor"], CREATE_REGION, struct.pack("=I", IDS["region"]))
    connection.send(IDS["region"], REGION_ADD, struct.pack("=iiii", 0, 0, width, height))
    connection.send(IDS["effect_manager"], GET_BACKGROUND_EFFECT, struct.pack("=II", IDS["effect"], IDS["surface"]))
    connection.send(IDS["effect"], SET_BLUR_REGION, struct.pack("=I", IDS["region"]))
    toplevel.map(title, "com.lantharos.Kestrel.Blur")
    toplevel.run()


main()
