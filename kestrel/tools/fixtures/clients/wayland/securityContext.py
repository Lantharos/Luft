#!/usr/bin/env python3
import os
import signal
import socket
import struct
import sys

from client import DISPLAY, Connection, read_string, string

IDS = {"manager": 4, "context": 5, "callback": 6}
CREATE_LISTENER = 1
SET_SANDBOX_ENGINE, SET_APP_ID, COMMIT = 1, 2, 4


def listen(path):
    if os.path.exists(path):
        os.unlink(path)
    listener = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    listener.bind(path)
    listener.listen()
    return listener


def main():
    """Opens a Wayland socket whose clients carry a sandbox engine and app ID, as Flatpak does for its apps."""
    path, engine, app_id = sys.argv[1:4]
    connection = Connection()
    try:
        connection.bind((("wp_security_context_manager_v1", 1, IDS["manager"]),))
    except KeyError:
        print("unavailable", flush=True)
        return
    listener = listen(path)
    close_read, close_write = os.pipe()
    connection.send(IDS["manager"], CREATE_LISTENER, struct.pack("=I", IDS["context"]), listener.fileno(), close_read)
    listener.close()
    os.close(close_read)
    connection.send(IDS["context"], SET_SANDBOX_ENGINE, string(engine))
    connection.send(IDS["context"], SET_APP_ID, string(app_id))
    connection.send(IDS["context"], COMMIT)
    connection.send(DISPLAY, 0, struct.pack("=I", IDS["callback"]))
    for sender, opcode, payload in connection.events():
        if sender == DISPLAY and opcode == 0:
            raise SystemExit(f"Protocol error: {read_string(payload, 8)[0]}")
        if sender == IDS["callback"]:
            break
    print("listening", flush=True)
    signal.pause()


main()
