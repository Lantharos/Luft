#!/usr/bin/env python3
"""Takes the emulated card reader out and puts it back when the guest asks."""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "os" / "vm"))
from control import Machine  # noqa: E402

vm, log, card = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
PREFIX = "sign-in-check: "
READER = {"driver": "usb-ccid", "bus": "check.0", "port": "2", "id": "reader"}
CARD = {"driver": "ccid-card-emulated", "backend": "certificates", "db": f"sql:{card}",
        "cert1": "authentication", "cert2": "signing", "cert3": "encryption", "id": "card", "bus": "reader.0"}


def lines():
    seen = 0
    while True:
        if log.exists():
            complete = log.read_bytes().decode("utf-8", "replace").split("\n")[:-1]
            yield from complete[seen:]
            seen = len(complete)
        time.sleep(0.2)


machine = None
for line in lines():
    start = line.find(PREFIX)
    if start < 0:
        continue
    words = line[start + len(PREFIX):].split()
    if words[:1] == ["DONE"]:
        break
    machine = machine or Machine(vm)
    if words == ["replug", "reader"]:
        machine.qmp("device_del", {"id": "reader"})
        time.sleep(2)
        machine.qmp("device_add", READER)
        machine.qmp("device_add", CARD)
    elif words == ["remove", "card"]:
        machine.qmp("device_del", {"id": "card"})
