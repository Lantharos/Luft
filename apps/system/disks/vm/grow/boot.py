#!/usr/bin/env python3
"""Starts the installed drive, types the disk's passphrase whenever the startup shows its prompt, and switches the
VM off at once the first time the serial console shows CUT, as a power cut would."""

import argparse
import os
import subprocess
import sys
import time
from pathlib import Path

luft = Path(__file__).resolve().parents[5]
sys.path.insert(0, str(luft / "os" / "vm"))
from control import Machine, MachineError  # noqa: E402

CHECK = b"luft-grow-check: "
FIELD = (0.578, 0.73)
ANSWERED_FOR = 15


def boot(vm: Path, drive: Path, log: Path, minutes: int) -> subprocess.Popen:
    log.unlink(missing_ok=True)
    environment = os.environ | {
        "DISK": str(drive), "TPM": "0", "NETWORK": "0", "HEADLESS": "1", "MEMORY": "4096",
        "SERIAL": str(log), "TIMEOUT": str(minutes * 60), "LUFT_VM": str(vm),
    }
    return subprocess.Popen([str(luft / "os" / "vm" / "qemu.sh")], env=environment)


def asking(machine: Machine) -> bool:
    width, height = machine.size()
    field = machine.pixel(int(width * FIELD[0]), int(height * FIELD[1]))
    corner = machine.pixel(8, 8)
    return corner == (0, 0, 0) and len(set(field)) == 1 and 30 <= field[0] <= 70


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--vm", type=Path, required=True)
    parser.add_argument("--drive", type=Path, required=True)
    parser.add_argument("--log", type=Path, required=True)
    parser.add_argument("--passphrase", required=True)
    parser.add_argument("--cut", default="", help="switch off the first time this shows up on the console")
    parser.add_argument("--minutes", type=int, default=60)
    arguments = parser.parse_args()

    qemu = boot(arguments.vm, arguments.drive, arguments.log, arguments.minutes)
    machine = None
    answered = 0.0
    seen = 0
    cut = arguments.cut.encode()
    while qemu.poll() is None:
        time.sleep(2)
        text = arguments.log.read_bytes() if arguments.log.exists() else b""
        for line in text[seen:].splitlines(keepends=True):
            if line.endswith(b"\n") and CHECK in line:
                print(line[line.index(CHECK):].decode(errors="replace").rstrip(), flush=True)
        seen = text.rfind(b"\n") + 1
        try:
            machine = machine or Machine(arguments.vm, seconds=30)
            if cut and cut in text:
                print(f"luft-grow-check: cutting the power at “{arguments.cut}”", flush=True)
                machine.qmp("quit")
                cut = b""
            elif time.monotonic() - answered > ANSWERED_FOR and asking(machine):
                print("luft-grow-check: typing the passphrase at the startup's prompt", flush=True)
                machine.type(arguments.passphrase)
                machine.press("ret")
                answered = time.monotonic()
        except (MachineError, OSError, ValueError, IndexError):
            machine = None
    qemu.wait()


if __name__ == "__main__":
    main()
