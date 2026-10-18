#!/usr/bin/env python3
import mmap
import os
import struct
import sys

from client import Connection, Toplevel

IDS = {
    "compositor": 4,
    "shm": 5,
    "wm_base": 6,
    "decoration_manager": 7,
    "surface": 8,
    "xdg_surface": 9,
    "toplevel": 10,
    "decoration": 11,
    "pool": 12,
    "buffer": 13,
}
MODES = {"client": 1, "server": 2}
GET_TOPLEVEL_DECORATION, SET_MODE = 1, 1
TOPLEVEL_CONFIGURE, TOPLEVEL_CLOSE = 0, 1
POOL_DESTROY, BUFFER_DESTROY = 1, 0


class ResizingToplevel(Toplevel):
    """A toplevel that redraws its solid buffer at every size the compositor configures."""

    def __init__(self, connection, ids, pixel):
        super().__init__(connection, ids, pixel=pixel)
        self.pending_size = None
        self.next_id = max(ids.values()) + 1

    def resize(self, width, height):
        connection, ids = self.connection, self.ids
        connection.send(ids["buffer"], BUFFER_DESTROY)
        connection.send(ids["pool"], POOL_DESTROY)
        ids["pool"], ids["buffer"] = self.next_id, self.next_id + 1
        self.next_id += 2
        self.width, self.height = width, height
        size = width * height * 4
        fd = os.memfd_create("kestrel-toplevel")
        os.ftruncate(fd, size)
        with mmap.mmap(fd, size) as pixels:
            pixels.write(self.pixel * width * height)
        connection.send(ids["shm"], 0, struct.pack("=Ii", ids["pool"], size), fd)
        os.close(fd)
        connection.send(ids["pool"], 0, struct.pack("=IiiiiI", ids["buffer"], 0, width, height, width * 4, self.pixel_format))

    def handle(self, sender, opcode, payload):
        if sender == self.ids["toplevel"] and opcode == TOPLEVEL_CLOSE:
            raise SystemExit(0)
        if sender == self.ids["toplevel"] and opcode == TOPLEVEL_CONFIGURE:
            width, height = struct.unpack_from("=ii", payload)
            self.pending_size = (width, height) if width > 0 and height > 0 else None
            return
        if sender == self.ids["xdg_surface"] and opcode == 0 and self.pending_size:
            if self.pending_size != (self.width, self.height):
                self.resize(*self.pending_size)
            self.pending_size = None
        super().handle(sender, opcode, payload)


def main():
    mode, title, color = sys.argv[1], sys.argv[2], bytes.fromhex(sys.argv[3])
    if mode == "none":
        IDS["pool"], IDS["buffer"] = IDS.pop("decoration"), IDS["pool"]
    connection = Connection()
    connection.bind(
        (
            ("wl_compositor", 4, IDS["compositor"]),
            ("wl_shm", 1, IDS["shm"]),
            ("xdg_wm_base", 1, IDS["wm_base"]),
            ("zxdg_decoration_manager_v1", 1, IDS["decoration_manager"]),
        )
    )
    toplevel = ResizingToplevel(connection, IDS, bytes((color[2], color[1], color[0], 0xFF)))

    def decorate():
        if mode == "none":
            return
        connection.send(IDS["decoration_manager"], GET_TOPLEVEL_DECORATION, struct.pack("=II", IDS["decoration"], IDS["toplevel"]))
        if mode in MODES:
            connection.send(IDS["decoration"], SET_MODE, struct.pack("=I", MODES[mode]))

    toplevel.map(title, "com.lantharos.Kestrel.Decoration", decorate)
    toplevel.run()


main()
