#!/usr/bin/env python3
import argparse
import base64
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path

STATE = Path(os.environ.get("MEET_VM", Path(__file__).resolve().parent / "state"))
SOCKETS = Path(os.environ.get("XDG_RUNTIME_DIR", "/tmp")) / "meet-vm"
WIDTH, HEIGHT = 1600, 1000
CHUNK = 1 << 20
KEYS = {
    " ": "spc", "-": "minus", ".": "dot", "/": "slash", "\n": "ret", "_": "shift-minus", ":": "shift-semicolon",
    ";": "semicolon", "=": "equal", "+": "shift-equal", ",": "comma", "'": "apostrophe", '"': "shift-apostrophe",
    "$": "shift-4", "?": "shift-slash", "!": "shift-1", "@": "shift-2", "#": "shift-3", "&": "shift-7", "*": "shift-8",
    "(": "shift-9", ")": "shift-0", "|": "shift-backslash", "\\": "backslash", ">": "shift-dot", "<": "shift-comma",
    "{": "shift-bracket_left", "}": "shift-bracket_right", "[": "bracket_left", "]": "bracket_right", "%": "shift-5",
}


class Channel:
    def __init__(self, path: Path, greeting: bool):
        self.connection = socket.socket(socket.AF_UNIX)
        self.connection.connect(str(path))
        self.stream = self.connection.makefile("rwb")
        if greeting:
            self.stream.readline()
            self.call("qmp_capabilities")

    def call(self, name: str, arguments: dict | None = None):
        message = {"execute": name}
        if arguments is not None:
            message["arguments"] = arguments
        self.stream.write(json.dumps(message).encode() + b"\n")
        self.stream.flush()
        while True:
            reply = json.loads(self.stream.readline())
            if "event" in reply:
                continue
            if "error" in reply:
                raise SystemExit(f"{name}: {reply['error']['desc']}")
            return reply.get("return")


def machine(vm: Path) -> Channel:
    return Channel(SOCKETS / vm.name / "qmp.sock", greeting=True)


def agent(vm: Path, timeout: float = 5) -> Channel:
    channel = Channel(SOCKETS / vm.name / "agent.sock", greeting=False)
    channel.connection.settimeout(timeout)
    marker = int(time.time() * 1000) % 2**31
    channel.stream.write(b"\xff")
    channel.stream.flush()
    channel.stream.write(json.dumps({"execute": "guest-sync-delimited", "arguments": {"id": marker}}).encode() + b"\n")
    channel.stream.flush()
    while True:
        line = channel.stream.readline().lstrip(b"\xff")
        if line.strip() and json.loads(line).get("return") == marker:
            break
    channel.connection.settimeout(60)
    return channel


def screenshot(vm: Path, path: str):
    with tempfile.TemporaryDirectory() as directory:
        frame = Path(directory) / "frame.ppm"
        machine(vm).call("screendump", {"filename": str(frame)})
        subprocess.run(["magick", str(frame), path], check=True)


def press(vm: Path, combo: str):
    machine(vm).call("send-key", {"keys": [{"type": "qcode", "data": key} for key in combo.split("-")]})


def click(vm: Path, x: int, y: int):
    channel = machine(vm)
    position = [
        {"type": "abs", "data": {"axis": "x", "value": x * 32767 // (WIDTH - 1)}},
        {"type": "abs", "data": {"axis": "y", "value": y * 32767 // (HEIGHT - 1)}},
    ]
    channel.call("input-send-event", {"events": position})
    for down in (True, False):
        time.sleep(0.06)
        channel.call("input-send-event", {"events": [{"type": "btn", "data": {"down": down, "button": "left"}}]})


def type_text(vm: Path, text: str):
    for character in text:
        key = KEYS.get(character, character)
        press(vm, f"shift-{character.lower()}" if character.isupper() else key)
        time.sleep(0.05)


def wait_for_agent(vm: Path, timeout: float):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            agent(vm, timeout=3).call("guest-ping")
            return
        except (OSError, TimeoutError, json.JSONDecodeError):
            time.sleep(3)
    raise SystemExit("The guest agent didn't answer")


def run(vm: Path, command: str, timeout: float) -> int:
    channel = agent(vm)
    started = channel.call("guest-exec", {
        "path": "powershell.exe",
        "arg": ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
        "capture-output": True,
    })
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        status = channel.call("guest-exec-status", {"pid": started["pid"]})
        if status["exited"]:
            for stream, target in (("out-data", sys.stdout), ("err-data", sys.stderr)):
                if stream in status:
                    target.write(base64.b64decode(status[stream]).decode("utf-8", "replace"))
            return status.get("exitcode", 0)
        time.sleep(0.5)
    raise SystemExit(f"{command} didn't finish in {timeout} seconds")


def push(vm: Path, source: str, destination: str):
    channel = agent(vm)
    handle = channel.call("guest-file-open", {"path": destination, "mode": "wb"})
    with open(source, "rb") as file:
        while chunk := file.read(CHUNK):
            channel.call("guest-file-write", {"handle": handle, "buf-b64": base64.b64encode(chunk).decode()})
    channel.call("guest-file-close", {"handle": handle})


def pull(vm: Path, source: str, destination: str):
    channel = agent(vm)
    handle = channel.call("guest-file-open", {"path": source, "mode": "rb"})
    with open(destination, "wb") as file:
        while True:
            read = channel.call("guest-file-read", {"handle": handle, "count": CHUNK})
            file.write(base64.b64decode(read["buf-b64"]))
            if read["eof"]:
                break
    channel.call("guest-file-close", {"handle": handle})


def main():
    parser = argparse.ArgumentParser(description="Look at and use a Windows VM started by apps/meet/vm/run.sh")
    parser.add_argument("name", help="the VM, such as base or bitlocker")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("screenshot").add_argument("path")
    commands.add_parser("key").add_argument("combo", help="QEMU key names joined by '-', such as ret or ctrl-alt-delete")
    commands.add_parser("type").add_argument("text")
    pointer = commands.add_parser("click")
    pointer.add_argument("x", type=int)
    pointer.add_argument("y", type=int)
    commands.add_parser("wait", help="wait until Windows' guest agent answers").add_argument("--timeout", type=float, default=600)
    shell = commands.add_parser("run", help="run a PowerShell command as SYSTEM and print its output")
    shell.add_argument("line")
    shell.add_argument("--timeout", type=float, default=600)
    for name in ("push", "pull"):
        copy = commands.add_parser(name)
        copy.add_argument("source")
        copy.add_argument("destination")
    commands.add_parser("quit", help="switch the VM off at once")
    arguments = parser.parse_args()
    vm = STATE / arguments.name
    match arguments.command:
        case "screenshot": screenshot(vm, arguments.path)
        case "key": press(vm, arguments.combo)
        case "type": type_text(vm, arguments.text)
        case "click": click(vm, arguments.x, arguments.y)
        case "wait": wait_for_agent(vm, arguments.timeout)
        case "run": sys.exit(run(vm, arguments.line, arguments.timeout))
        case "push": push(vm, arguments.source, arguments.destination)
        case "pull": pull(vm, arguments.source, arguments.destination)
        case "quit": machine(vm).call("quit")


main()
