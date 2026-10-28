#!/usr/bin/env python3
import argparse
import os
import subprocess
import sys
import threading
import time
from pathlib import Path

from control import DEFAULT_VM, Machine

HERE = Path(__file__).resolve().parent


class Recording:
    def __init__(self, frames: Path, script: list[tuple[str, str]]):
        self.frames = frames
        self.script = script
        self.heard = ""
        self.started = time.monotonic()
        vm = Path(os.environ.get("LUFT_VM", DEFAULT_VM))
        self.qemu = subprocess.Popen([str(HERE / "qemu.sh")], env=dict(os.environ, HEADLESS="1"))
        self.machine = Machine(vm, seconds=300)
        self.serial = self.machine.serial()
        threading.Thread(target=self.pump_serial, daemon=True).start()

    def now(self) -> float:
        return time.monotonic() - self.started

    def pump_serial(self):
        with open(self.frames / "serial.log", "wb") as serial_log:
            while chunk := self.serial.recv(4096):
                serial_log.write(chunk)
                serial_log.flush()
                self.heard += chunk.decode(errors="replace")
                while self.script and self.script[0][0] in self.heard:
                    pattern, command = self.script.pop(0)
                    self.heard = self.heard.split(pattern, 1)[1]
                    self.serial.sendall(command.encode() + b"\n")

    def type(self, text: str):
        self.machine.type(text, pause=0.03)

    def shoot(self):
        self.machine.screenshot(self.frames / f"{int(self.now() * 1000):07d}.png")

    def running(self) -> bool:
        return self.qemu.poll() is None

    def stop(self):
        if not self.running():
            return
        self.machine.qmp("system_powerdown")
        try:
            self.qemu.wait(timeout=60)
        except subprocess.TimeoutExpired:
            self.machine.qmp("quit")
            self.qemu.wait(timeout=30)


def main():
    parser = argparse.ArgumentParser(description="Boot the VM headless, type at set times, and keep every frame")
    parser.add_argument("frames", type=Path)
    parser.add_argument("--seconds", type=float, default=60)
    parser.add_argument("--interval", type=float, default=0.05)
    parser.add_argument("--type", action="append", default=[], help="SECONDS:TEXT, a trailing newline is added")
    parser.add_argument(
        "--serial",
        action="append",
        default=[],
        help="TEXT=>COMMAND: once TEXT appears on the serial console after the previous command, send COMMAND",
    )
    options = parser.parse_args()
    options.frames.mkdir(parents=True, exist_ok=True)

    typing = sorted(
        (float(at), text.replace("\\n", "\n") + "\n") for at, text in (item.split(":", 1) for item in options.type)
    )
    script = [tuple(item.split("=>", 1)) for item in options.serial]
    machine = Recording(options.frames, script)
    try:
        while machine.now() < options.seconds and machine.running():
            while typing and typing[0][0] <= machine.now():
                threading.Thread(target=machine.type, args=(typing.pop(0)[1],), daemon=True).start()
            try:
                machine.shoot()
            except (OSError, ValueError):
                break
            time.sleep(options.interval)
    finally:
        machine.stop()


if __name__ == "__main__":
    sys.exit(main())
