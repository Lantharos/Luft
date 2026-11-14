#!/usr/bin/env python3
import struct
import sys

from client import ARGB8888, Connection, Toplevel

OBJECTS = ("compositor", "shm", "wm_base", "effect_manager", "glass_manager", "surface", "region", "effect", "glass", "xdg_surface", "toplevel", "pool", "buffer")
TRANSLUCENT_PIXEL = b"\x30\x24\x18\x60"
CREATE_REGION, REGION_ADD = 1, 1
GET_BACKGROUND_EFFECT, SET_BLUR_REGION = 1, 1
GET_GLASS, SET_ROLE, SET_PREFERENCE = 1, 1, 2
MATERIAL = 0
ROLES = {"window": 0, "transient": 1}
PREFERENCES = {"user": 0, "luca": 1, "maris": 2}
MATERIALS = ("luca", "maris")


def main():
    title, width, height = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    glass = sys.argv[4:6]
    names = [name for name in OBJECTS if glass or name not in ("glass_manager", "glass")]
    ids = {name: index + 4 for index, name in enumerate(names)}
    connection = Connection()
    globals_ = [
        ("wl_compositor", 4, ids["compositor"]),
        ("wl_shm", 1, ids["shm"]),
        ("xdg_wm_base", 1, ids["wm_base"]),
        ("ext_background_effect_manager_v1", 1, ids["effect_manager"]),
    ]
    if glass:
        globals_.append(("kestrel_glass_manager_v1", 1, ids["glass_manager"]))
    connection.bind(globals_)
    toplevel = Toplevel(connection, ids, width, height, TRANSLUCENT_PIXEL, ARGB8888)
    connection.send(ids["compositor"], CREATE_REGION, struct.pack("=I", ids["region"]))
    connection.send(ids["region"], REGION_ADD, struct.pack("=iiii", 0, 0, width, height))
    connection.send(ids["effect_manager"], GET_BACKGROUND_EFFECT, struct.pack("=II", ids["effect"], ids["surface"]))
    connection.send(ids["effect"], SET_BLUR_REGION, struct.pack("=I", ids["region"]))
    if glass:
        role, preference = glass
        connection.send(ids["glass_manager"], GET_GLASS, struct.pack("=II", ids["glass"], ids["surface"]))
        connection.send(ids["glass"], SET_ROLE, struct.pack("=I", ROLES[role]))
        connection.send(ids["glass"], SET_PREFERENCE, struct.pack("=I", PREFERENCES[preference]))
    toplevel.map(title, "com.lantharos.Kestrel.Blur")
    for sender, opcode, payload in connection.events():
        if sender == ids.get("glass") and opcode == MATERIAL:
            print(MATERIALS[struct.unpack_from("=I", payload)[0]], flush=True)
        else:
            toplevel.handle(sender, opcode, payload)


main()
