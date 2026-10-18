#!/usr/bin/env python3
import struct
import sys

from client import DISPLAY, Connection, read_string

IDS = {"seat": 4, "notifier": 5, "notification": 6}
GET_IDLE_NOTIFICATION, GET_INPUT_IDLE_NOTIFICATION = 1, 2
EVENTS = {0: "idled", 1: "resumed"}


def main():
    timeout = int(sys.argv[1])
    request = GET_INPUT_IDLE_NOTIFICATION if "--input" in sys.argv else GET_IDLE_NOTIFICATION
    connection = Connection()
    connection.bind((("wl_seat", 1, IDS["seat"]), ("ext_idle_notifier_v1", 2, IDS["notifier"])))
    connection.send(IDS["notifier"], request, struct.pack("=III", IDS["notification"], timeout, IDS["seat"]))
    print("watching", flush=True)
    for sender, opcode, payload in connection.events():
        if sender == DISPLAY and opcode == 0:
            message, _ = read_string(payload, 8)
            raise SystemExit(f"Protocol error: {message}")
        if sender == IDS["notification"]:
            print(EVENTS[opcode], flush=True)


main()
