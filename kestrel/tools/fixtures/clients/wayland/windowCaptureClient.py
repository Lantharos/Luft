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
OVERLAY, ANCHOR_TOP_RIGHT = 3, 1 | 8
OVERLAY_WIDTH, OVERLAY_HEIGHT, MARGIN = 200, 100, 24
LAYER_CONFIGURE = 0


def say(*words):
    print(*words, flush=True)


def shm_buffer(connection, ids, width, height, fill):
    size = width * height * 4
    fd = os.memfd_create("kestrel-window-capture")
    os.ftruncate(fd, size)
    pixels = mmap.mmap(fd, size)
    pixels.write(fill * width * height)
    connection.send(ids["shm"], 0, struct.pack("=Ii", ids["pool"], size), fd)
    os.close(fd)
    connection.send(ids["pool"], 0, struct.pack("=IiiiiI", ids["buffer"], 0, width, height, width * 4, ARGB8888))
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
    handles, size, pixels = {}, None, None
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
            pixels = shm_buffer(connection, IDS, *size, b"\0\0\0\0")
            connection.send(IDS["session"], 0, struct.pack("=I", IDS["frame"]))
            connection.send(IDS["frame"], 1, struct.pack("=I", IDS["buffer"]))
            connection.send(IDS["frame"], 2, struct.pack("=iiii", 0, 0, *size))
            connection.send(IDS["frame"], 3)
        elif sender == IDS["session"] and opcode == SESSION_STOPPED:
            say("stopped")
        elif sender == IDS["frame"] and opcode == FRAME_READY:
            width, height = size
            middle = ((height // 2) * width + width // 2) * 4
            say("ready", f"{width}x{height}", pixels[middle : middle + 4].hex(), pixels[0:4].hex())
        elif sender == IDS["frame"] and opcode == FRAME_FAILED:
            say("failed", struct.unpack_from("=I", payload)[0])


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
    shown = None
    for sender, opcode, payload in connection.events():
        protocol_error(sender, opcode, payload)
        if sender == IDS["layer_surface"] and opcode == LAYER_CONFIGURE:
            serial, width, height = struct.unpack_from("=III", payload)
            connection.send(IDS["layer_surface"], 6, struct.pack("=I", serial))
            if not shown:
                shown = shm_buffer(connection, IDS, width, height, b"\x20\x80\xe0\xff")
            connection.send(IDS["surface"], 1, struct.pack("=Iii", IDS["buffer"], 0, 0))
            connection.send(IDS["surface"], 2, struct.pack("=iiii", 0, 0, width, height))
            connection.send(IDS["surface"], 6)
            say("shown", f"{width}x{height}")


mode, *rest = sys.argv[1:]
IDS = {name: FIRST_ID + index for index, name in enumerate(CAPTURE_OBJECTS if mode == "capture" else OVERLAY_OBJECTS)}
connection = Connection()
capture(connection, *rest) if mode == "capture" else overlay(connection)
