#!/usr/bin/python3

import os
import struct
import subprocess
import sys
import threading
from pathlib import Path

GADGET = Path("/sys/kernel/config/usb_gadget/printer")
MOUNT = Path("/run/luft-printers-check/ffs")
DEVICE_ID = b"MFG:Canon;CMD:BJL,BJRaster3,BSCCe,NCCe,IVEC,IVECPLI;MDL:MX490 series;CLS:PRINTER;DES:Canon MX490 series;VER:1.000;"

DESCRIPTORS_MAGIC_V2 = 3
STRINGS_MAGIC = 2
HAS_FS_DESC = 1
HAS_HS_DESC = 2
ALL_CTRL_RECIP = 64
SETUP = 4
ENABLE = 2
GET_DEVICE_ID = 0
GET_PORT_STATUS = 1
SELECTED_NO_ERROR = 0x18


def write(path: Path, value: str):
    path.write_text(value)


def descriptors() -> bytes:
    def interface():
        return struct.pack("<BBBBBBBBB", 9, 4, 0, 0, 2, 7, 1, 2, 1)

    def endpoints(size: int):
        return struct.pack("<BBBBHB", 7, 5, 0x01, 2, size, 0) + struct.pack("<BBBBHB", 7, 5, 0x82, 2, size, 0)

    full = interface() + endpoints(64)
    high = interface() + endpoints(512)
    body = struct.pack("<II", 3, 3) + full + high
    return struct.pack("<III", DESCRIPTORS_MAGIC_V2, 12 + len(body), HAS_FS_DESC | HAS_HS_DESC | ALL_CTRL_RECIP) + body


def strings() -> bytes:
    body = struct.pack("<II", 1, 1) + struct.pack("<H", 0x0409) + b"Printer\0"
    return struct.pack("<II", STRINGS_MAGIC, 8 + len(body)) + body


def set_up():
    subprocess.run(["modprobe", "dummy_hcd"], check=True)
    subprocess.run(["modprobe", "libcomposite"], check=True)
    subprocess.run(["modprobe", "usb_f_fs"], check=True)
    if not Path("/sys/kernel/config/usb_gadget").exists():
        subprocess.run(["mount", "-t", "configfs", "none", "/sys/kernel/config"], check=True)
    GADGET.mkdir()
    write(GADGET / "idVendor", "0x04a9")
    write(GADGET / "idProduct", "0x1787")
    strings_dir = GADGET / "strings/0x409"
    strings_dir.mkdir(parents=True)
    write(strings_dir / "manufacturer", "Canon")
    write(strings_dir / "product", "MX490 series")
    write(strings_dir / "serialnumber", "585EF4")
    config = GADGET / "configs/c.1"
    config.mkdir(parents=True)
    function = GADGET / "functions/ffs.printer"
    function.mkdir(parents=True)
    os.symlink(function, config / "ffs.printer")
    MOUNT.mkdir(parents=True, exist_ok=True)
    subprocess.run(["mount", "-t", "functionfs", "printer", str(MOUNT)], check=True)


def receive(output: Path):
    with open(MOUNT / "ep1", "rb", buffering=0) as endpoint, open(output, "ab", buffering=0) as received:
        while True:
            data = endpoint.read(512)
            if data:
                received.write(data)


def answer(control, request_type: int, request: int, length: int):
    if request_type & 0x80 == 0:
        control.read(0)
        return
    if request == GET_DEVICE_ID:
        reply = struct.pack(">H", len(DEVICE_ID) + 2) + DEVICE_ID
    elif request == GET_PORT_STATUS:
        reply = bytes([SELECTED_NO_ERROR])
    else:
        reply = b""
    control.write(reply[:length])


def main():
    output = Path(sys.argv[1])
    set_up()
    control = open(MOUNT / "ep0", "r+b", buffering=0)
    control.write(descriptors())
    control.write(strings())
    udc = os.listdir("/sys/class/udc")[0]
    write(GADGET / "UDC", udc)
    started = False
    while True:
        event = control.read(12)
        request_type, request, _, _, length = struct.unpack("<BBHHH", event[:8])
        kind = event[8]
        if kind == ENABLE and not started:
            started = True
            threading.Thread(target=receive, args=(output,), daemon=True).start()
        elif kind == SETUP:
            answer(control, request_type, request, length)


if __name__ == "__main__":
    main()
