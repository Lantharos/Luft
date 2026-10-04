#!/usr/bin/env python3
import array
import mmap
import os
import socket
import struct
import sys

CONTENT_TYPES = {"none": 0, "photo": 1, "video": 2, "game": 3}
WIDTH, HEIGHT = 320, 240
DISPLAY, REGISTRY, SYNC = 1, 2, 3
COMPOSITOR, SHM, WM_BASE, CONTENT_TYPE_MANAGER = 4, 5, 6, 7
SURFACE, CONTENT_TYPE, XDG_SURFACE, TOPLEVEL, POOL, BUFFER = 8, 9, 10, 11, 12, 13


def string(value):
    encoded = value.encode() + b"\0"
    return struct.pack("=I", len(encoded)) + encoded + b"\0" * (-len(encoded) % 4)


class Connection:
    def __init__(self):
        path = os.path.join(os.environ["XDG_RUNTIME_DIR"], os.environ.get("WAYLAND_DISPLAY", "wayland-0"))
        self.socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.socket.connect(path)
        self.pending = b""

    def send(self, target, opcode, payload=b"", fd=None):
        message = struct.pack("=II", target, (8 + len(payload)) << 16 | opcode) + payload
        ancillary = [(socket.SOL_SOCKET, socket.SCM_RIGHTS, array.array("i", [fd]))] if fd is not None else []
        self.socket.sendmsg([message], ancillary)

    def events(self):
        while True:
            while len(self.pending) >= 8:
                sender, header = struct.unpack_from("=II", self.pending)
                size = header >> 16
                if len(self.pending) < size:
                    break
                payload, self.pending = self.pending[8:size], self.pending[size:]
                yield sender, header & 0xFFFF, payload
            data = self.socket.recv(65536)
            if not data:
                raise SystemExit("The compositor closed the connection")
            self.pending += data


def read_string(payload, offset):
    (length,) = struct.unpack_from("=I", payload, offset)
    value = payload[offset + 4:offset + 4 + length - 1].decode()
    return value, offset + 4 + length + (-length % 4)


def globals_of(connection):
    connection.send(DISPLAY, 1, struct.pack("=I", REGISTRY))
    connection.send(DISPLAY, 0, struct.pack("=I", SYNC))
    found = {}
    for sender, opcode, payload in connection.events():
        if sender == REGISTRY and opcode == 0:
            (name,) = struct.unpack_from("=I", payload)
            interface, _ = read_string(payload, 4)
            found[interface] = name
        elif sender == SYNC:
            return found


def shared_buffer(connection):
    size = WIDTH * HEIGHT * 4
    fd = os.memfd_create("kestrel-content-type")
    os.ftruncate(fd, size)
    with mmap.mmap(fd, size) as pixels:
        pixels.write(b"\x40\x30\x20\xff" * WIDTH * HEIGHT)
    connection.send(SHM, 0, struct.pack("=Ii", POOL, size), fd)
    os.close(fd)
    connection.send(POOL, 0, struct.pack("=IiiiiI", BUFFER, 0, WIDTH, HEIGHT, WIDTH * 4, 1))


def main():
    content_type = sys.argv[1]
    title = " ".join(sys.argv[1:])
    connection = Connection()
    found = globals_of(connection)
    for interface, version, new_id in (("wl_compositor", 4, COMPOSITOR), ("wl_shm", 1, SHM),
                                       ("xdg_wm_base", 1, WM_BASE), ("wp_content_type_manager_v1", 1, CONTENT_TYPE_MANAGER)):
        connection.send(REGISTRY, 0, struct.pack("=I", found[interface]) + string(interface) + struct.pack("=II", version, new_id))
    connection.send(COMPOSITOR, 0, struct.pack("=I", SURFACE))
    connection.send(CONTENT_TYPE_MANAGER, 1, struct.pack("=II", CONTENT_TYPE, SURFACE))
    connection.send(CONTENT_TYPE, 1, struct.pack("=I", CONTENT_TYPES[content_type]))
    connection.send(WM_BASE, 2, struct.pack("=II", XDG_SURFACE, SURFACE))
    connection.send(XDG_SURFACE, 1, struct.pack("=I", TOPLEVEL))
    connection.send(TOPLEVEL, 2, string(f"Kestrel content type: {title}"))
    connection.send(TOPLEVEL, 3, string("com.lantharos.Kestrel.ContentType"))
    connection.send(SURFACE, 6)
    shared_buffer(connection)

    for sender, opcode, payload in connection.events():
        if sender == DISPLAY and opcode == 0:
            _, code = struct.unpack_from("=II", payload)
            message, _ = read_string(payload, 8)
            raise SystemExit(f"Protocol error {code}: {message}")
        if sender == WM_BASE and opcode == 0:
            connection.send(WM_BASE, 3, payload[:4])
        elif sender == XDG_SURFACE and opcode == 0:
            connection.send(XDG_SURFACE, 4, payload[:4])
            connection.send(SURFACE, 1, struct.pack("=Iii", BUFFER, 0, 0))
            connection.send(SURFACE, 2, struct.pack("=iiii", 0, 0, WIDTH, HEIGHT))
            connection.send(SURFACE, 6)


main()
