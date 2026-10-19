import array
import collections
import mmap
import os
import socket
import struct

WIDTH, HEIGHT = 320, 240
OPAQUE_PIXEL = b"\x40\x30\x20\xff"
ARGB8888, XRGB8888 = 0, 1
DISPLAY, REGISTRY, SYNC = 1, 2, 3


def string(value):
    encoded = value.encode() + b"\0"
    return struct.pack("=I", len(encoded)) + encoded + b"\0" * (-len(encoded) % 4)


def read_string(payload, offset):
    (length,) = struct.unpack_from("=I", payload, offset)
    value = payload[offset + 4 : offset + 4 + length - 1].decode()
    return value, offset + 4 + length + (-length % 4)


class Connection:
    def __init__(self):
        path = os.path.join(os.environ["XDG_RUNTIME_DIR"], os.environ.get("WAYLAND_DISPLAY", "wayland-0"))
        self.socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.socket.connect(path)
        self.pending = b""
        self.fds = []
        self.queue = collections.deque()

    def send(self, target, opcode, payload=b"", *fds):
        message = struct.pack("=II", target, (8 + len(payload)) << 16 | opcode) + payload
        ancillary = [(socket.SOL_SOCKET, socket.SCM_RIGHTS, array.array("i", fds))] if fds else []
        self.socket.sendmsg([message], ancillary)

    def read(self):
        data, fds, _, _ = socket.recv_fds(self.socket, 65536, 16)
        if not data:
            raise SystemExit("The compositor closed the connection")
        self.pending += data
        self.fds += fds
        while len(self.pending) >= 8:
            sender, header = struct.unpack_from("=II", self.pending)
            size = header >> 16
            if len(self.pending) < size:
                break
            payload, self.pending = self.pending[8:size], self.pending[size:]
            self.queue.append((sender, header & 0xFFFF, payload))

    def events(self):
        while True:
            while self.queue:
                yield self.queue.popleft()
            self.read()

    def bind(self, interfaces):
        self.send(DISPLAY, 1, struct.pack("=I", REGISTRY))
        self.send(DISPLAY, 0, struct.pack("=I", SYNC))
        found = {}
        for sender, opcode, payload in self.events():
            if sender == REGISTRY and opcode == 0:
                (name,) = struct.unpack_from("=I", payload)
                interface, _ = read_string(payload, 4)
                found[interface] = name
            elif sender == SYNC:
                break
        for interface, version, new_id in interfaces:
            self.send(
                REGISTRY,
                0,
                struct.pack("=I", found[interface]) + string(interface) + struct.pack("=II", version, new_id),
            )


class Toplevel:
    """A mapped xdg_toplevel showing a solid shared-memory buffer."""

    def __init__(self, connection, ids, width=WIDTH, height=HEIGHT, pixel=OPAQUE_PIXEL, pixel_format=XRGB8888):
        self.connection = connection
        self.ids = ids
        self.width, self.height, self.pixel, self.pixel_format = width, height, pixel, pixel_format
        connection.send(ids["compositor"], 0, struct.pack("=I", ids["surface"]))

    def map(self, title, app_id, prepare=lambda: None):
        connection, ids = self.connection, self.ids
        connection.send(ids["wm_base"], 2, struct.pack("=II", ids["xdg_surface"], ids["surface"]))
        connection.send(ids["xdg_surface"], 1, struct.pack("=I", ids["toplevel"]))
        connection.send(ids["toplevel"], 2, string(title))
        connection.send(ids["toplevel"], 3, string(app_id))
        prepare()
        connection.send(ids["surface"], 6)
        size = self.width * self.height * 4
        fd = os.memfd_create("kestrel-toplevel")
        os.ftruncate(fd, size)
        with mmap.mmap(fd, size) as pixels:
            pixels.write(self.pixel * self.width * self.height)
        connection.send(ids["shm"], 0, struct.pack("=Ii", ids["pool"], size), fd)
        os.close(fd)
        connection.send(ids["pool"], 0, struct.pack("=IiiiiI", ids["buffer"], 0, self.width, self.height, self.width * 4, self.pixel_format))

    def handle(self, sender, opcode, payload):
        connection, ids = self.connection, self.ids
        if sender == DISPLAY and opcode == 0:
            _, code = struct.unpack_from("=II", payload)
            message, _ = read_string(payload, 8)
            raise SystemExit(f"Protocol error {code}: {message}")
        if sender == ids["wm_base"] and opcode == 0:
            connection.send(ids["wm_base"], 3, payload[:4])
        elif sender == ids["xdg_surface"] and opcode == 0:
            connection.send(ids["xdg_surface"], 4, payload[:4])
            connection.send(ids["surface"], 1, struct.pack("=Iii", ids["buffer"], 0, 0))
            connection.send(ids["surface"], 2, struct.pack("=iiii", 0, 0, self.width, self.height))
            connection.send(ids["surface"], 6)

    def run(self):
        for event in self.connection.events():
            self.handle(*event)
