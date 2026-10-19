#!/usr/bin/env python3
import ctypes
import os
import selectors
import struct
import sys
import time

from client import DISPLAY, Connection, read_string, string

IDS = {"seat": 4, "manager": 5, "device": 6}
TEXT = "text/plain;charset=utf-8"
SECRET_HINT = "x-kde-passwordManagerHint"
CREATE_DATA_SOURCE, GET_DATA_DEVICE = 0, 1
SET_SELECTION = 0
SOURCE_OFFER = 0
OFFER_RECEIVE = 0
DATA_OFFER, SELECTION = 0, 1
SOURCE_SEND, SOURCE_CANCELLED = 0, 1
HANDOFF_DELAY = 0.5
PR_SET_DUMPABLE = 4


def hand_off():
    """Leaves the connection to a child, so the process that connected is gone when the child uses it."""
    if os.fork():
        os._exit(0)
    time.sleep(HANDOFF_DELAY)


class DataControl:
    """Reads, replaces and clears the clipboard through ext-data-control-v1 without a window."""

    def __init__(self, handoff):
        self.connection = Connection()
        if handoff:
            hand_off()
        self.connection.bind((("wl_seat", 1, IDS["seat"]), ("ext_data_control_manager_v1", 1, IDS["manager"])))
        self.connection.send(IDS["manager"], GET_DATA_DEVICE, struct.pack("=II", IDS["device"], IDS["seat"]))
        self.offers = {}
        self.selection = None
        self.contents = {}
        self.source = None
        self.next_id = max(IDS.values()) + 1

    def new_id(self):
        self.next_id += 1
        return self.next_id - 1

    def copy(self, text, secret):
        self.contents = {TEXT: text.encode()}
        if secret:
            self.contents[SECRET_HINT] = b"secret"
        self.source = self.new_id()
        self.connection.send(IDS["manager"], CREATE_DATA_SOURCE, struct.pack("=I", self.source))
        for mime_type in self.contents:
            self.connection.send(self.source, SOURCE_OFFER, string(mime_type))
        self.connection.send(IDS["device"], SET_SELECTION, struct.pack("=I", self.source))

    def clear(self):
        self.connection.send(IDS["device"], SET_SELECTION, struct.pack("=I", 0))

    def roundtrip(self):
        callback = self.new_id()
        self.connection.send(DISPLAY, 0, struct.pack("=I", callback))
        for event in self.connection.events():
            if event[0] == callback:
                return
            self.handle(*event)

    def paste(self):
        if self.selection is None or TEXT not in self.offers[self.selection]:
            return ""
        read_end, write_end = os.pipe()
        self.connection.send(self.selection, OFFER_RECEIVE, string(TEXT), write_end)
        os.close(write_end)
        with os.fdopen(read_end, "rb") as pipe:
            return pipe.read().decode()

    def handle(self, sender, opcode, payload):
        if sender == DISPLAY and opcode == 0:
            message, _ = read_string(payload, 8)
            raise SystemExit(f"Protocol error: {message}")
        if sender == IDS["device"] and opcode == DATA_OFFER:
            (offer,) = struct.unpack_from("=I", payload)
            self.offers[offer] = []
        elif sender == IDS["device"] and opcode == SELECTION:
            (offer,) = struct.unpack_from("=I", payload)
            self.selection = offer or None
        elif sender in self.offers:
            self.offers[sender].append(read_string(payload, 0)[0])
        elif sender == self.source and opcode == SOURCE_SEND:
            mime_type, _ = read_string(payload, 0)
            with os.fdopen(self.connection.fds.pop(0), "wb") as pipe:
                pipe.write(self.contents.get(mime_type, b""))
        elif sender == self.source and opcode == SOURCE_CANCELLED:
            print("cancelled", flush=True)

    def serve(self):
        selector = selectors.DefaultSelector()
        selector.register(self.connection.socket, selectors.EVENT_READ)
        selector.register(sys.stdin, selectors.EVENT_READ)
        while True:
            for key, _ in selector.select():
                if key.fileobj is sys.stdin:
                    self.command(sys.stdin.readline().strip())
                    continue
                self.connection.read()
                while self.connection.queue:
                    self.handle(*self.connection.queue.popleft())

    def command(self, line):
        if line == "paste":
            self.roundtrip()
            print(f"pasted {self.paste()}", flush=True)
        elif line == "clear":
            self.clear()
            self.roundtrip()
            print("cleared", flush=True)
        elif line.startswith("copy "):
            _, kind, text = line.split(" ", 2)
            self.copy(text, kind == "secret")
            self.roundtrip()
            print("copied", flush=True)
        elif line == "":
            raise SystemExit(0)


def main():
    handoff = "--handoff" in sys.argv
    if "--undumpable" in sys.argv:
        ctypes.CDLL(None).prctl(PR_SET_DUMPABLE, 0, 0, 0, 0)
    try:
        data_control = DataControl(handoff)
    except KeyError:
        print("unavailable", flush=True)
        return
    data_control.roundtrip()
    print("ready", flush=True)
    if not handoff:
        data_control.serve()


main()
