#!/usr/bin/env python3
"""Starts the installed drives, types the disk's passphrase whenever the startup shows its prompt, and switches the
VM off at once the first time the serial console shows CUT, as a power cut would. With Secure Boot it can first add
Luft's key on shim's blue screen."""

import argparse
import os
import subprocess
import sys
import time
from pathlib import Path

luft = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(luft / "os" / "vm"))
from control import Machine, MachineError  # noqa: E402

FIELD = (0.578, 0.73)
ANSWERED_FOR = 15


def boot(arguments) -> subprocess.Popen:
    arguments.log.unlink(missing_ok=True)
    environment = os.environ | {
        "DISK": arguments.drive, "DRIVES": arguments.drives, "TPM": arguments.tpm, "NETWORK": "0",
        "HEADLESS": "1", "MEMORY": "4096", "SERIAL": str(arguments.log), "TIMEOUT": str(arguments.minutes * 60),
        "LUFT_VM": str(arguments.vm), "SECURE_BOOT": "1" if arguments.secure_boot else "0",
    }
    return subprocess.Popen([str(luft / "os" / "vm" / "qemu.sh")], env=environment)


def asking(machine: Machine) -> bool:
    width, height = machine.size()
    field = machine.pixel(int(width * FIELD[0]), int(height * FIELD[1]))
    corner = machine.pixel(8, 8)
    return corner == (0, 0, 0) and len(set(field)) == 1 and 30 <= field[0] <= 70


def add_key(arguments, qemu: subprocess.Popen):
    machine = Machine(arguments.vm, seconds=30)
    try:
        machine.enroll(arguments.enroll, 120)
    except MachineError as error:
        machine.qmp("quit")
        qemu.wait()
        sys.exit(f"{arguments.check}: FAIL Luft's key couldn't be added: {error}")
    print(f"{arguments.check}: added Luft's key on shim's blue screen", flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--vm", type=Path, required=True)
    parser.add_argument("--drive", default="", help="the drive to start from, as qemu.sh's DISK")
    parser.add_argument("--drives", default="", help="more drives, as qemu.sh's DRIVES")
    parser.add_argument("--tpm", default="0", help="as qemu.sh's TPM")
    parser.add_argument("--secure-boot", action="store_true", help="start with Secure Boot on")
    parser.add_argument("--enroll", default="", help="add Luft's key, queued with this code, on shim's blue screen first")
    parser.add_argument("--log", type=Path, required=True)
    parser.add_argument("--check", required=True, help="the prefix the check's lines start with")
    parser.add_argument("--passphrase", required=True)
    parser.add_argument("--cut", default="", help="switch off the first time this shows up on the console")
    parser.add_argument("--minutes", type=int, default=60)
    arguments = parser.parse_args()

    check = f"{arguments.check}: ".encode()
    qemu = boot(arguments)
    if arguments.enroll:
        add_key(arguments, qemu)
    machine = None
    answered = 0.0
    seen = 0
    cut = arguments.cut.encode()
    while qemu.poll() is None:
        time.sleep(2)
        text = arguments.log.read_bytes() if arguments.log.exists() else b""
        for line in text[seen:].splitlines(keepends=True):
            if line.endswith(b"\n") and check in line:
                print(line[line.index(check):].decode(errors="replace").rstrip(), flush=True)
        seen = text.rfind(b"\n") + 1
        try:
            machine = machine or Machine(arguments.vm, seconds=30)
            if cut and cut in text:
                print(f"{arguments.check}: cutting the power at “{arguments.cut}”", flush=True)
                machine.qmp("quit")
                cut = b""
            elif time.monotonic() - answered > ANSWERED_FOR and asking(machine):
                print(f"{arguments.check}: typing the passphrase at the startup's prompt", flush=True)
                machine.type(arguments.passphrase)
                machine.press("ret")
                answered = time.monotonic()
        except (MachineError, OSError, ValueError, IndexError):
            machine = None
    qemu.wait()


if __name__ == "__main__":
    main()
