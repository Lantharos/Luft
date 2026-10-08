import json
import os
import re
import socket
import subprocess
import threading
import time
from pathlib import Path

from PIL import Image

SUSHI = Path(__file__).resolve().parents[4] / "boot/sushi"
KEYS = {
    " ": "spc",
    "-": "minus",
    "=": "equal",
    ".": "dot",
    ",": "comma",
    "/": "slash",
    ";": "semicolon",
    "'": "apostrophe",
    "\n": "ret",
    "\t": "tab",
}
MARK = "__done__"
NOISE = re.compile(r"\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)|\x1b\[[0-9;?]*[A-Za-z]|\r")


class Machine:
    def __init__(self, folder: Path, tpm: bool):
        self.folder = folder
        self.heard = ""
        self.lock = threading.Lock()
        environment = dict(os.environ, HEADLESS="1", SUSHI_VM=str(folder))
        environment.pop("TPM", None)
        if tpm:
            environment["TPM"] = "2"
        self.qemu = subprocess.Popen([str(SUSHI / "scripts/vm/run.sh")], env=environment)
        self.qmp = self.connect(folder / "qmp.sock")
        self.qmp_file = self.qmp.makefile("rwb")
        self.reply()
        self.command("qmp_capabilities")
        self.serial = self.connect(folder / "serial.sock")
        threading.Thread(target=self.pump, daemon=True).start()

    def connect(self, path: Path) -> socket.socket:
        for _ in range(400):
            try:
                connection = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
                connection.connect(str(path))
                return connection
            except OSError:
                time.sleep(0.05)
        raise RuntimeError(f"{path} never appeared")

    def reply(self) -> dict:
        while True:
            message = json.loads(self.qmp_file.readline())
            if "event" not in message:
                return message

    def command(self, name: str, **arguments) -> dict:
        self.qmp_file.write(json.dumps({"execute": name, "arguments": arguments}).encode() + b"\n")
        self.qmp_file.flush()
        return self.reply()

    def pump(self):
        with open(self.folder / "serial.log", "wb") as log:
            while chunk := self.serial.recv(4096):
                log.write(chunk)
                log.flush()
                with self.lock:
                    self.heard += chunk.decode(errors="replace")

    def wait_for(self, pattern: str, seconds: float) -> str:
        deadline = time.monotonic() + seconds
        while time.monotonic() < deadline:
            with self.lock:
                match = re.search(pattern, self.heard)
                if match:
                    found = self.heard[: match.end()]
                    self.heard = self.heard[match.end() :]
                    return found
            time.sleep(0.1)
        raise TimeoutError(f"never saw {pattern!r}")

    def write(self, text: str):
        self.serial.sendall(text.encode())

    def sign_in_on_console(self, password: str):
        self.wait_for(r"login: ", 180)
        self.write("root\n")
        self.wait_for(r"Password: ", 20)
        self.write(password + "\n")
        self.wait_for(r"\]# ", 30)
        self.write("stty -echo; export PS1='' PS2=''; export SYSTEMD_PAGER= SYSTEMD_COLORS=0\n")
        time.sleep(1)
        with self.lock:
            self.heard = ""

    def run(self, command: str, seconds: float = 60) -> str:
        self.write(f"{command}; echo {MARK}$?\n")
        output = self.wait_for(rf"{MARK}\d+", seconds)
        return NOISE.sub("", output.rsplit(MARK, 1)[0]).strip()

    def as_user(self, command: str, seconds: float = 60) -> str:
        environment = "XDG_RUNTIME_DIR=/run/user/1000 WAYLAND_DISPLAY=wayland-0 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus"
        return self.run(f"runuser -u sushi -- env {environment} {command}", seconds)

    def type(self, text: str):
        for character in text:
            key = KEYS.get(character, character.lower())
            keys = [{"type": "qcode", "data": key}]
            if character.isupper():
                keys.insert(0, {"type": "qcode", "data": "shift"})
            self.command("send-key", keys=keys)
            time.sleep(0.04)

    def wake(self):
        self.command("send-key", keys=[{"type": "qcode", "data": "ctrl"}])
        time.sleep(2)

    def screenshot(self, path: Path):
        raw = self.folder / "screen.ppm"
        self.command("screendump", filename=str(raw))
        Image.open(raw).save(path)
        raw.unlink()

    def stop(self):
        try:
            self.write("systemctl poweroff\n")
            self.qemu.wait(timeout=60)
        except (OSError, subprocess.TimeoutExpired):
            self.command("quit")
            self.qemu.wait(timeout=20)
