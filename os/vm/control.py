#!/usr/bin/env python3
import argparse
import json
import os
import re
import socket
import subprocess
import tempfile
import time
from pathlib import Path

VM = Path(os.environ.get("LUFT_VM", Path(__file__).resolve().parent / "state"))
PASSWORD = os.environ.get("VM_PASSWORD", "luft-vm")
KEYS = {
    " ": "spc", "-": "minus", ".": "dot", "/": "slash", "\n": "ret", "_": "shift-minus", ":": "shift-semicolon",
    ";": "semicolon", "=": "equal", "+": "shift-equal", ",": "comma", "'": "apostrophe", '"': "shift-apostrophe",
    "$": "shift-4", "?": "shift-slash", "!": "shift-1", "@": "shift-2", "#": "shift-3", "&": "shift-7", "*": "shift-8",
    "(": "shift-9", ")": "shift-0", "|": "shift-backslash", "\\": "backslash", ">": "shift-dot", "<": "shift-comma",
}


def qmp(*commands: tuple[str, dict]) -> list[dict]:
    with socket.socket(socket.AF_UNIX) as connection:
        connection.connect(str(VM / "qmp.sock"))
        stream = connection.makefile("rwb")
        stream.readline()
        replies = []
        for name, arguments in (("qmp_capabilities", {}), *commands):
            stream.write(json.dumps({"execute": name, "arguments": arguments}).encode() + b"\n")
            stream.flush()
            while "event" in (reply := json.loads(stream.readline())):
                pass
            replies.append(reply)
        return replies[1:]


def screenshot(path: str):
    with tempfile.TemporaryDirectory() as directory:
        frame = Path(directory) / "frame.ppm"
        qmp(("screendump", {"filename": str(frame)}))
        subprocess.run(["magick", str(frame), path], check=True)


def pixel(x: int, y: int) -> tuple[int, int, int]:
    with tempfile.TemporaryDirectory() as directory:
        frame = Path(directory) / "frame.ppm"
        qmp(("screendump", {"filename": str(frame)}))
        data = frame.read_bytes()
    fields = data.split(maxsplit=4)
    width = int(fields[1])
    at = len(data) - len(fields[4]) + (y * width + x) * 3
    return tuple(data[at:at + 3])


def wait_for_shim_screen(timeout: float):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        red, green, blue = pixel(20, 200)
        if blue > 120 and red < 60 and green < 60:
            return
        time.sleep(0.3)
    raise SystemExit("shim's key management screen didn't appear")


def enroll(code: str, timeout: float):
    wait_for_shim_screen(timeout)
    for step in [["spc"], ["down", "ret"], ["down", "ret"], ["down", "ret"]]:
        for combo in step:
            press(combo)
            time.sleep(0.4)
        time.sleep(2)
    type_text(code + "\n")
    time.sleep(2)
    press("ret")


def enroll_from_disk(timeout: float):
    wait_for_shim_screen(timeout)
    last = ["down"] * 6 + ["ret"]
    steps = [["ret"], ["spc"], ["down", "ret"], ["ret"], ["ret"], last, last, ["down", "ret"], ["down", "ret"], ["ret"]]
    for step in steps:
        for combo in step:
            press(combo)
            time.sleep(0.4)
        time.sleep(2)


def press(combo: str):
    keys = [{"type": "qcode", "data": key} for key in combo.split("-")]
    qmp(("send-key", {"keys": keys}))


def click(x: int, y: int):
    width, height = int(os.environ.get("XRES", 1920)), int(os.environ.get("YRES", 1080))
    position = [
        {"type": "abs", "data": {"axis": "x", "value": x * 32767 // (width - 1)}},
        {"type": "abs", "data": {"axis": "y", "value": y * 32767 // (height - 1)}},
    ]
    button = [{"type": "btn", "data": {"down": down, "button": "left"}} for down in (True, False)]
    qmp(("input-send-event", {"events": position}))
    for event in button:
        time.sleep(0.05)
        qmp(("input-send-event", {"events": [event]}))


def type_text(text: str):
    for character in text:
        key = KEYS.get(character, character)
        press(f"shift-{character.lower()}" if character.isupper() else key)
        time.sleep(0.08)


def shell(command: str, timeout: float) -> str:
    with socket.socket(socket.AF_UNIX) as connection:
        connection.connect(str(VM / "serial.sock"))
        connection.settimeout(0.5)

        def read_until(marker: str, limit: float) -> str:
            heard, deadline = "", time.monotonic() + limit
            while not re.search(marker, heard) and time.monotonic() < deadline:
                try:
                    heard += connection.recv(65536).decode(errors="replace")
                except TimeoutError:
                    pass
            return heard

        connection.sendall(b"\n")
        heard = read_until("login:|# $", 3)
        if "login:" in heard:
            connection.sendall(b"root\n")
            read_until("Password:", 10)
            connection.sendall(PASSWORD.encode() + b"\n")
            read_until("#", 10)
        connection.sendall(f"{command}; echo LUFT-DONE-$?\n".encode())
        return read_until(r"LUFT-DONE-\d+", timeout)


def grow_disk(size: int):
    qmp(("block_resize", {"device": "virtio0", "size": size}))


def main():
    parser = argparse.ArgumentParser(description="Look at and use the Luft VM started by os/vm/run.sh")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("screenshot").add_argument("path")
    commands.add_parser("key").add_argument("combo", help="QEMU key names joined by '-', such as meta_l or ctrl-alt-f3")
    commands.add_parser("type").add_argument("text")
    pointer = commands.add_parser("click", help="click at a point on the screen")
    pointer.add_argument("x", type=int)
    pointer.add_argument("y", type=int)
    run = commands.add_parser("shell", help="run a command as root on the serial console")
    run.add_argument("line")
    run.add_argument("--timeout", type=float, default=60)
    queued = commands.add_parser("enroll", help="add the key queued with this code on shim's blue screen, then restart")
    queued.add_argument("code")
    queued.add_argument("--timeout", type=float, default=120)
    commands.add_parser("grow-disk", help="make the VM's disk bigger while it runs").add_argument("bytes", type=int)
    mok = commands.add_parser("enroll-from-disk", help="add EFI/luft/luft.cer on shim's blue screen, then restart")
    mok.add_argument("--timeout", type=float, default=120)
    arguments = parser.parse_args()
    if arguments.command == "screenshot":
        screenshot(arguments.path)
    elif arguments.command == "enroll":
        enroll(arguments.code, arguments.timeout)
    elif arguments.command == "enroll-from-disk":
        enroll_from_disk(arguments.timeout)
    elif arguments.command == "grow-disk":
        grow_disk(arguments.bytes)
    elif arguments.command == "key":
        press(arguments.combo)
    elif arguments.command == "type":
        type_text(arguments.text)
    elif arguments.command == "click":
        click(arguments.x, arguments.y)
    else:
        print(shell(arguments.line, arguments.timeout))


main()
