#!/usr/bin/env python3
import argparse
import base64
import codecs
import hashlib
import json
import os
import re
import socket
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

DEFAULT_VM = Path(__file__).resolve().parent / "state"
PASSWORD = os.environ.get("VM_PASSWORD", "luft-vm")
CHUNK = 1 << 20
BATCH = 0.05
KEYS = {
    " ": "spc", "-": "minus", ".": "dot", "/": "slash", "\n": "ret", "\t": "tab", "_": "shift-minus",
    ":": "shift-semicolon", ";": "semicolon", "=": "equal", "+": "shift-equal", ",": "comma", "'": "apostrophe",
    '"': "shift-apostrophe", "$": "shift-4", "?": "shift-slash", "!": "shift-1", "@": "shift-2", "#": "shift-3",
    "&": "shift-7", "*": "shift-8", "(": "shift-9", ")": "shift-0", "|": "shift-backslash", "\\": "backslash",
    ">": "shift-dot", "<": "shift-comma", "{": "shift-bracket_left", "}": "shift-bracket_right", "[": "bracket_left",
    "]": "bracket_right", "%": "shift-5", "~": "shift-grave_accent", "`": "grave_accent", "^": "shift-6",
}
NOISE = re.compile(r"\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)|\x1b\[[0-9;?]*[A-Za-z]|\r")
PROMPT = r"[#$\u203a] $"
FINISHED = re.compile(r"\nLUFT-BEGIN\n(.*?)\n*LUFT-END (\d+)\n", re.DOTALL)


class MachineError(Exception):
    pass


def connect(path: Path, seconds: float = 10) -> socket.socket:
    deadline = time.monotonic() + seconds
    while True:
        connection = socket.socket(socket.AF_UNIX)
        try:
            connection.connect(str(path))
            return connection
        except OSError:
            connection.close()
            if time.monotonic() > deadline:
                raise
            time.sleep(0.05)


class Channel:
    def __init__(self, path: Path, greeting: bool, seconds: float = 10):
        self.connection = connect(path, seconds)
        self.stream = self.connection.makefile("rwb")
        if greeting:
            self.stream.readline()
            self.call("qmp_capabilities")

    def send(self, message: dict):
        self.stream.write(json.dumps(message).encode() + b"\n")
        self.stream.flush()

    def call(self, name: str, arguments: dict | None = None):
        self.send({"execute": name} | ({"arguments": arguments} if arguments is not None else {}))
        while "event" in (reply := json.loads(self.stream.readline())):
            pass
        if "error" in reply:
            raise MachineError(f"{name}: {reply['error']['desc']}")
        return reply.get("return")


class Machine:
    def __init__(self, folder: Path, seconds: float = 10):
        self.folder = folder.resolve()
        name = hashlib.sha256(str(self.folder).encode()).hexdigest()[:12]
        self.sockets = Path(os.environ.get("XDG_RUNTIME_DIR", "/tmp")) / "luft-vm" / name
        self.monitor = Channel(self.sockets / "qmp.sock", greeting=True, seconds=seconds)
        self.lock = threading.Lock()

    def qmp(self, name: str, arguments: dict | None = None):
        with self.lock:
            return self.monitor.call(name, arguments)

    def frame(self) -> bytes:
        with tempfile.TemporaryDirectory() as directory:
            frame = Path(directory) / "frame.ppm"
            self.qmp("screendump", {"filename": str(frame)})
            return frame.read_bytes()

    def size(self) -> tuple[int, int]:
        fields = self.frame().split(maxsplit=3)
        return int(fields[1]), int(fields[2])

    def pixel(self, x: int, y: int) -> tuple[int, int, int]:
        data = self.frame()
        fields = data.split(maxsplit=4)
        at = len(data) - len(fields[4]) + (y * int(fields[1]) + x) * 3
        return tuple(data[at:at + 3])

    def screenshot(self, path: Path):
        if path.suffix == ".png":
            self.qmp("screendump", {"filename": str(path.resolve()), "format": "png"})
            return
        with tempfile.TemporaryDirectory() as directory:
            frame = Path(directory) / "frame.ppm"
            self.qmp("screendump", {"filename": str(frame)})
            subprocess.run(["magick", str(frame), str(path)], check=True)

    def press(self, combo: str):
        self.qmp("send-key", {"keys": [{"type": "qcode", "data": key} for key in combo.split("-")]})

    def type(self, text: str, pause: float = 0.06):
        for character in text:
            self.press(f"shift-{character.lower()}" if character.isupper() else KEYS.get(character, character))
            time.sleep(pause)

    def click(self, x: int, y: int):
        width, height = self.size()
        position = [
            {"type": "abs", "data": {"axis": "x", "value": x * 32767 // (width - 1)}},
            {"type": "abs", "data": {"axis": "y", "value": y * 32767 // (height - 1)}},
        ]
        self.qmp("input-send-event", {"events": position})
        for down in (True, False):
            time.sleep(0.06)
            self.qmp("input-send-event", {"events": [{"type": "btn", "data": {"down": down, "button": "left"}}]})

    def serial(self) -> socket.socket:
        return connect(self.sockets / "serial.sock")

    def shell(self, command: str, seconds: float) -> tuple[int, str]:
        with self.serial() as connection:
            connection.settimeout(BATCH)
            decoder = codecs.getincrementaldecoder("utf-8")(errors="replace")
            received = ""

            def heard() -> str:
                return NOISE.sub("", received)

            def listen(pattern: re.Pattern | str, limit: float) -> re.Match | None:
                nonlocal received
                deadline = time.monotonic() + limit
                while not (found := re.search(pattern, heard())) and time.monotonic() < deadline:
                    batch = time.monotonic() + BATCH
                    while time.monotonic() < batch:
                        try:
                            received += decoder.decode(connection.recv(65536))
                        except TimeoutError:
                            break
                return found

            deadline = time.monotonic() + seconds
            connection.sendall(b"\n")
            while not listen(f"login: $|{PROMPT}", 2):
                if time.monotonic() > deadline:
                    raise MachineError("The serial console didn't answer")
                connection.sendall(b"\n")
            if heard().endswith("login: "):
                connection.sendall(b"root\n")
                listen("Password: $", 10)
                connection.sendall(PASSWORD.encode() + b"\n")
                listen(PROMPT, 20)
            received = ""
            line = f"printf '\\n%s%s\\n' LUFT- BEGIN; {command}; printf '\\nLUFT-%s %s\\n' END $?\n"
            connection.sendall(line.encode())
            if not (found := listen(FINISHED, seconds)):
                raise MachineError(f"{command} didn't finish in {seconds} seconds")
            return int(found[2]), found[1]

    def agent(self, seconds: float = 5) -> Channel:
        channel = Channel(self.sockets / "agent.sock", greeting=False)
        channel.connection.settimeout(seconds)
        marker = int(time.time() * 1000) % 2**31
        channel.stream.write(b"\xff")
        channel.send({"execute": "guest-sync-delimited", "arguments": {"id": marker}})
        while True:
            line = channel.stream.readline().lstrip(b"\xff")
            if line.strip() and json.loads(line).get("return") == marker:
                break
        channel.connection.settimeout(60)
        return channel

    def wait_for_agent(self, seconds: float):
        deadline = time.monotonic() + seconds
        while time.monotonic() < deadline:
            try:
                self.agent(seconds=3).call("guest-ping")
                return
            except (OSError, TimeoutError, json.JSONDecodeError):
                time.sleep(3)
        raise MachineError("The guest agent didn't answer")

    def run(self, command: str, seconds: float) -> int:
        if self.agent().call("guest-get-osinfo").get("id") == "mswindows":
            powershell = ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command]
            program = {"path": "powershell.exe", "arg": powershell}
        else:
            program = {"path": "/bin/sh", "arg": ["-c", command]}
        started = self.agent().call("guest-exec", program | {"capture-output": True})
        deadline = time.monotonic() + seconds
        while time.monotonic() < deadline:
            time.sleep(0.5)
            try:
                status = self.agent().call("guest-exec-status", {"pid": started["pid"]})
            except (OSError, TimeoutError, json.JSONDecodeError):
                continue
            if status["exited"]:
                for stream, target in (("out-data", sys.stdout), ("err-data", sys.stderr)):
                    if stream in status:
                        target.write(base64.b64decode(status[stream]).decode("utf-8", "replace"))
                return status.get("exitcode", 0)
        raise MachineError(f"{command} didn't finish in {seconds} seconds")

    def push(self, source: Path, destination: str):
        channel = self.agent()
        handle = channel.call("guest-file-open", {"path": destination, "mode": "wb"})
        with source.open("rb") as file:
            while chunk := file.read(CHUNK):
                channel.call("guest-file-write", {"handle": handle, "buf-b64": base64.b64encode(chunk).decode()})
        channel.call("guest-file-close", {"handle": handle})

    def pull(self, source: str, destination: Path):
        channel = self.agent()
        handle = channel.call("guest-file-open", {"path": source, "mode": "rb"})
        with destination.open("wb") as file:
            while True:
                read = channel.call("guest-file-read", {"handle": handle, "count": CHUNK})
                file.write(base64.b64decode(read["buf-b64"]))
                if read["eof"]:
                    break
        channel.call("guest-file-close", {"handle": handle})

    def wait_for_shim_screen(self, seconds: float):
        deadline = time.monotonic() + seconds
        while time.monotonic() < deadline:
            red, green, blue = self.pixel(20, 200)
            if blue > 120 and red < 60 and green < 60:
                return
            time.sleep(0.3)
        raise MachineError("shim's key management screen didn't appear")

    def walk_shim_menu(self, steps: list[list[str]]):
        for step in steps:
            for combo in step:
                self.press(combo)
                time.sleep(0.4)
            time.sleep(2)

    def enroll(self, code: str, seconds: float):
        self.wait_for_shim_screen(seconds)
        self.walk_shim_menu([["spc"], ["down", "ret"], ["down", "ret"], ["down", "ret"]])
        self.type(code + "\n", pause=0.08)
        time.sleep(2)
        self.press("ret")


def main():
    parser = argparse.ArgumentParser(description="Look at and use a VM started by os/vm/qemu.sh")
    parser.add_argument("--vm", type=Path, default=Path(os.environ.get("LUFT_VM", DEFAULT_VM)),
                        help="the VM's folder, LUFT_VM when it was started (default os/vm/state)")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("screenshot").add_argument("path", type=Path)
    commands.add_parser("key").add_argument("combo", help="QEMU key names joined by '-', such as meta_l or ctrl-alt-f3")
    commands.add_parser("type").add_argument("text")
    pointer = commands.add_parser("click", help="click at a point on the screen")
    pointer.add_argument("x", type=int)
    pointer.add_argument("y", type=int)
    console = commands.add_parser("shell", help="run a command as root on the serial console and print its output")
    console.add_argument("line")
    console.add_argument("--timeout", type=float, default=60)
    agent = commands.add_parser("run", help="run a command as SYSTEM or root (PowerShell or sh) with the guest agent")
    agent.add_argument("line")
    agent.add_argument("--timeout", type=float, default=600)
    waiting = commands.add_parser("wait", help="wait until the guest agent answers")
    waiting.add_argument("--timeout", type=float, default=600)
    for name in ("push", "pull"):
        copy = commands.add_parser(name, help=f"{name} a file through the guest agent")
        copy.add_argument("source")
        copy.add_argument("destination")
    queued = commands.add_parser("enroll", help="add the key queued with this code on shim's blue screen, then restart")
    queued.add_argument("code", nargs="?", default=PASSWORD, help="the code it was queued with (default VM_PASSWORD)")
    queued.add_argument("--timeout", type=float, default=120)
    commands.add_parser("grow-disk", help="make the VM's disk bigger while it runs").add_argument("bytes", type=int)
    commands.add_parser("quit", help="switch the VM off at once")
    arguments = parser.parse_args()
    try:
        command(Machine(arguments.vm), arguments)
    except MachineError as error:
        sys.exit(str(error))


def command(machine: Machine, arguments: argparse.Namespace):
    match arguments.command:
        case "screenshot": machine.screenshot(arguments.path)
        case "key": machine.press(arguments.combo)
        case "type": machine.type(arguments.text)
        case "click": machine.click(arguments.x, arguments.y)
        case "shell":
            status, output = machine.shell(arguments.line, arguments.timeout)
            print(output)
            sys.exit(status)
        case "run": sys.exit(machine.run(arguments.line, arguments.timeout))
        case "wait": machine.wait_for_agent(arguments.timeout)
        case "push": machine.push(Path(arguments.source), arguments.destination)
        case "pull": machine.pull(arguments.source, Path(arguments.destination))
        case "enroll": machine.enroll(arguments.code, arguments.timeout)
        case "grow-disk": machine.qmp("block_resize", {"device": "drive0", "size": arguments.bytes})
        case "quit": machine.qmp("quit")


if __name__ == "__main__":
    main()
