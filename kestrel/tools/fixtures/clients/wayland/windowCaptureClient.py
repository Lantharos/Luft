#!/usr/bin/env python3
import mmap
import os
import struct
import sys

from client import ARGB8888, DISPLAY, Connection, read_string, string

CAPTURE_OBJECTS = ("shm", "list", "sources", "capture", "source", "session", "pool", "buffer", "frame")
OVERLAY_OBJECTS = ("compositor", "shm", "layer_shell", "surface", "layer_surface", "pool", "buffer")
FIRST_ID = 4
LIST_TOPLEVEL, HANDLE_DONE, HANDLE_APP_ID, HANDLE_IDENTIFIER = 0, 1, 3, 4
SESSION_BUFFER_SIZE, SESSION_DONE, SESSION_STOPPED = 0, 4, 5
FRAME_READY, FRAME_FAILED = 3, 4
FAILED_BUFFER_CONSTRAINTS = 1
OVERLAY, ANCHOR_TOP_RIGHT = 3, 1 | 8
OVERLAY_WIDTH, OVERLAY_HEIGHT, MARGIN = 200, 100, 24
LAYER_CONFIGURE = 0


def say(*words):
    print(*words, flush=True)


def shm_buffer(connection, pool, buffer, width, height, fill):
    size = width * height * 4
    fd = os.memfd_create("kestrel-window-capture")
    os.ftruncate(fd, size)
    pixels = mmap.mmap(fd, size)
    pixels.write(fill * width * height)
    connection.send(IDS["shm"], 0, struct.pack("=Ii", pool, size), fd)
    os.close(fd)
    connection.send(pool, 0, struct.pack("=IiiiiI", buffer, 0, width, height, width * 4, ARGB8888))
    return pixels


def protocol_error(sender, opcode, payload):
    if sender == DISPLAY and opcode == 0:
        _, code = struct.unpack_from("=II", payload)
        message, _ = read_string(payload, 8)
        say("error", code, message)
        raise SystemExit(1)


def capture(connection, app_id):
    try:
        connection.bind(
            (
                ("wl_shm", 1, IDS["shm"]),
                ("ext_foreign_toplevel_list_v1", 1, IDS["list"]),
                ("ext_foreign_toplevel_image_capture_source_manager_v1", 1, IDS["sources"]),
                ("ext_image_copy_capture_manager_v1", 1, IDS["capture"]),
            )
        )
    except KeyError:
        say("unavailable")
        return
    handles, size = {}, None
    ids = iter(range(max(IDS.values()) + 1, 1 << 24))
    frame, pool, buffer, buffer_size, pixels = IDS["frame"], IDS["pool"], IDS["buffer"], None, None

    def capture_frame():
        nonlocal frame, pool, buffer, buffer_size, pixels
        if buffer_size != size:
            if pixels:
                connection.send(buffer, 0)
                connection.send(pool, 1)
                pool, buffer = next(ids), next(ids)
            pixels, buffer_size = shm_buffer(connection, pool, buffer, *size, b"\0\0\0\0"), size
        frame = frame or next(ids)
        connection.send(IDS["session"], 0, struct.pack("=I", frame))
        connection.send(frame, 1, struct.pack("=I", buffer))
        connection.send(frame, 2, struct.pack("=iiii", 0, 0, *size))
        connection.send(frame, 3)

    def next_frame():
        nonlocal frame
        connection.send(frame, 0)
        frame = None
        capture_frame()

    for sender, opcode, payload in connection.events():
        protocol_error(sender, opcode, payload)
        if sender == IDS["list"] and opcode == LIST_TOPLEVEL:
            handles[struct.unpack_from("=I", payload)[0]] = {}
        elif sender in handles and opcode in (HANDLE_APP_ID, HANDLE_IDENTIFIER):
            handles[sender]["app_id" if opcode == HANDLE_APP_ID else "identifier"] = read_string(payload, 0)[0]
        elif sender in handles and opcode == HANDLE_DONE:
            say("toplevel", handles[sender].get("app_id"))
        if sender in handles and opcode == HANDLE_DONE and handles[sender].get("app_id") == app_id and "source" not in handles[sender]:
            handles[sender]["source"] = True
            say("listed", handles[sender]["identifier"])
            connection.send(IDS["sources"], 0, struct.pack("=II", IDS["source"], sender))
            connection.send(IDS["capture"], 0, struct.pack("=III", IDS["session"], IDS["source"], 0))
        elif sender == IDS["session"] and opcode == SESSION_BUFFER_SIZE:
            size = struct.unpack_from("=II", payload)
        elif sender == IDS["session"] and opcode == SESSION_DONE and not pixels:
            capture_frame()
        elif sender == IDS["session"] and opcode == SESSION_STOPPED:
            say("stopped")
        elif sender == frame and opcode == FRAME_READY:
            width, height = buffer_size
            middle = ((height // 2) * width + width // 2) * 4
            say("ready", f"{width}x{height}", pixels[middle : middle + 4].hex(), pixels[0:4].hex())
            next_frame()
        elif sender == frame and opcode == FRAME_FAILED:
            reason = struct.unpack_from("=I", payload)[0]
            say("failed", reason)
            if reason == FAILED_BUFFER_CONSTRAINTS:
                next_frame()


def overlay(connection):
    try:
        connection.bind(
            (
                ("wl_compositor", 4, IDS["compositor"]),
                ("wl_shm", 1, IDS["shm"]),
                ("zwlr_layer_shell_v1", 4, IDS["layer_shell"]),
            )
        )
    except KeyError:
        say("unavailable")
        return
    connection.send(IDS["compositor"], 0, struct.pack("=I", IDS["surface"]))
    connection.send(
        IDS["layer_shell"],
        0,
        struct.pack("=III", IDS["layer_surface"], IDS["surface"], 0) + struct.pack("=I", OVERLAY) + string("kestrel-checks"),
    )
    connection.send(IDS["layer_surface"], 0, struct.pack("=II", OVERLAY_WIDTH, OVERLAY_HEIGHT))
    connection.send(IDS["layer_surface"], 1, struct.pack("=I", ANCHOR_TOP_RIGHT))
    connection.send(IDS["layer_surface"], 3, struct.pack("=iiii", MARGIN, MARGIN, 0, 0))
    connection.send(IDS["surface"], 6)
    shown, hidden = None, False
    for sender, opcode, payload in connection.events():
        protocol_error(sender, opcode, payload)
        if sender == IDS["layer_surface"] and opcode == LAYER_CONFIGURE:
            serial, width, height = struct.unpack_from("=III", payload)
            connection.send(IDS["layer_surface"], 6, struct.pack("=I", serial))
            if not shown:
                shown = shm_buffer(connection, IDS["pool"], IDS["buffer"], width, height, b"\x20\x80\xe0\xff")
            connection.send(IDS["surface"], 1, struct.pack("=Iii", IDS["buffer"], 0, 0))
            connection.send(IDS["surface"], 2, struct.pack("=iiii", 0, 0, width, height))
            connection.send(IDS["surface"], 6)
            say("shown", f"{width}x{height}")
            if not hidden:
                hidden = True
                connection.send(IDS["surface"], 1, struct.pack("=Iii", 0, 0, 0))
                connection.send(IDS["surface"], 6)
                say("hidden")


mode, *rest = sys.argv[1:]
IDS = {name: FIRST_ID + index for index, name in enumerate(CAPTURE_OBJECTS if mode == "capture" else OVERLAY_OBJECTS)}
connection = Connection()
capture(connection, *rest) if mode == "capture" else overlay(connection)
