#!/usr/bin/env python3
import argparse
import json
import os
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VM = ROOT / "vm"

KEYS = {
    " ": "spc", "-": "minus", "=": "equal", ".": "dot", ",": "comma", "/": "slash", ";": "semicolon",
    "'": "apostrophe", "[": "bracket_left", "]": "bracket_right", "\\": "backslash", "\n": "ret",
}


class Machine:
    def __init__(self, frames: Path):
        self.frames = frames
        self.started = time.monotonic()
        self.lock = threading.Lock()
        self.serial_log = open(frames / "serial.log", "wb")
        environment = dict(os.environ, HEADLESS="1")
        self.qemu = subprocess.Popen([str(ROOT / "scripts/vm/run.sh")], env=environment)
        self.qmp = self.connect(VM / "qmp.sock")
        self.qmp_file = self.qmp.makefile("rwb")
        self.read_reply()
        self.command("qmp_capabilities")
        self.serial = self.connect(VM / "serial.sock")
        threading.Thread(target=self.pump_serial, daemon=True).start()

    def connect(self, path: Path) -> socket.socket:
        for _ in range(200):
            try:
                connection = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
                connection.connect(str(path))
                return connection
            except OSError:
                time.sleep(0.05)
        raise RuntimeError(f"{path} never appeared")

    def now(self) -> float:
        return time.monotonic() - self.started

    def read_reply(self) -> dict:
        while True:
            message = json.loads(self.qmp_file.readline())
            if "event" not in message:
                return message

    def command(self, name: str, **arguments) -> dict:
        with self.lock:
            self.qmp_file.write(json.dumps({"execute": name, "arguments": arguments}).encode() + b"\n")
            self.qmp_file.flush()
            return self.read_reply()

    def pump_serial(self):
        while chunk := self.serial.recv(4096):
            self.serial_log.write(chunk)
            self.serial_log.flush()

    def type(self, text: str):
        for character in text:
            key = KEYS.get(character, character.lower())
            keys = [{"type": "qcode", "data": key}]
            if character.isupper():
                keys.insert(0, {"type": "qcode", "data": "shift"})
            self.command("send-key", keys=keys)
            time.sleep(0.03)

    def shoot(self):
        path = self.frames / f"{int(self.now() * 1000):07d}.png"
        self.command("screendump", filename=str(path), format="png")

    def serial_run(self, line: str):
        self.serial.sendall(line.encode() + b"\n")

    def stop(self):
        self.command("system_powerdown")
        try:
            self.qemu.wait(timeout=60)
        except subprocess.TimeoutExpired:
            self.command("quit")
            self.qemu.wait(timeout=30)


def main():
    parser = argparse.ArgumentParser(description="Boot the VM headless, type at set times, and keep every frame")
    parser.add_argument("frames", type=Path)
    parser.add_argument("--seconds", type=float, default=60)
    parser.add_argument("--interval", type=float, default=0.05)
    parser.add_argument("--type", action="append", default=[], help="SECONDS:TEXT, a trailing newline is added")
    parser.add_argument("--serial", action="append", default=[], help="SECONDS:COMMAND for the serial console")
    options = parser.parse_args()
    options.frames.mkdir(parents=True, exist_ok=True)

    actions = sorted(
        [(float(at), "type", text.replace("\\n", "\n") + "\n") for at, text in (item.split(":", 1) for item in options.type)]
        + [(float(at), "serial", command) for at, command in (item.split(":", 1) for item in options.serial)]
    )
    machine = Machine(options.frames)
    try:
        while machine.now() < options.seconds:
            while actions and actions[0][0] <= machine.now():
                _, kind, payload = actions.pop(0)
                threading.Thread(target=machine.type if kind == "type" else machine.serial_run, args=(payload,), daemon=True).start()
            machine.shoot()
            time.sleep(options.interval)
    finally:
        machine.stop()


if __name__ == "__main__":
    sys.exit(main())
