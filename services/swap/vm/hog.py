#!/usr/bin/env python3
import os
import struct
import sys
import threading
import time

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
SET_FULLSCREEN = 11
MIB = 1 << 20
PAGE = 4096
CHUNK = 64 * MIB
SWEEP_SECONDS = 2


def page_template():
    return os.urandom(PAGE // 2) + bytes(PAGE // 2)


def allocate(chunks, mebibytes):
    template = page_template()
    for _ in range(mebibytes * MIB // CHUNK):
        chunks.append(bytearray(template * (CHUNK // PAGE)))


def touch(chunks):
    started = time.monotonic()
    for chunk in list(chunks):
        for offset in range(0, len(chunk), PAGE):
            chunk[offset] ^= 1
    time.sleep(max(0.0, SWEEP_SECONDS - (time.monotonic() - started)))


def work(mode, mebibytes, rate):
    chunks = []
    allocate(chunks, mebibytes)
    print(f"holding {mebibytes} MiB", flush=True)
    while True:
        if mode == "idle":
            time.sleep(3600)
        elif mode == "grow":
            allocate(chunks, rate)
            time.sleep(1)
        else:
            touch(chunks)


def main():
    title, app_id, mode, mebibytes = sys.argv[1:5]
    rate = int(sys.argv[5]) if len(sys.argv) > 5 else 0
    connection = Connection()
    connection.bind(
        (
            ("wl_compositor", 4, IDS["compositor"]),
            ("wl_shm", 1, IDS["shm"]),
            ("xdg_wm_base", 1, IDS["wm_base"]),
        )
    )
    toplevel = Toplevel(connection, IDS)
    fullscreen = mode != "idle"
    toplevel.map(
        title, app_id, lambda: fullscreen and connection.send(IDS["toplevel"], SET_FULLSCREEN, struct.pack("=I", 0))
    )
    threading.Thread(target=work, args=(mode, int(mebibytes), rate), daemon=True).start()
    toplevel.run()


main()
