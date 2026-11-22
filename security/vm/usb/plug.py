#!/usr/bin/env python3
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "os" / "vm"))
from control import Machine  # noqa: E402

vm, log, sticks = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
PREFIX = "portguard-check: "


def lines():
    seen = 0
    while True:
        if log.exists():
            complete = log.read_bytes().decode("utf-8", "replace").split("\n")[:-1]
            yield from complete[seen:]
            seen = len(complete)
        time.sleep(0.2)


def plug(machine: Machine, name: str, port: str, serial: str):
    device = {"bus": "check.0", "port": port, "id": name, "serial": serial}
    if name.startswith("keyboard"):
        machine.qmp("device_add", device | {"driver": "usb-kbd"})
        return
    image = sticks / f"{name}.img"
    machine.qmp("blockdev-add", {"driver": "raw", "node-name": name, "file": {"driver": "file", "filename": str(image)}})
    machine.qmp("device_add", device | {"driver": "usb-storage", "drive": name})


def unplug(machine: Machine, name: str):
    machine.qmp("device_del", {"id": name})
    if name.startswith("keyboard"):
        return
    for _ in range(50):
        time.sleep(0.2)
        try:
            machine.qmp("blockdev-del", {"node-name": name})
            return
        except Exception:
            continue


machine = None
for line in lines():
    start = line.find(PREFIX)
    if start < 0:
        continue
    words = line[start + len(PREFIX):].split()
    if not words or words[0] not in ("plug", "unplug"):
        if words[:1] == ["PASS"] or words[:1] == ["FAIL"]:
            break
        continue
    machine = machine or Machine(vm)
    if words[0] == "plug":
        plug(machine, *words[1:4])
    else:
        unplug(machine, words[1])
