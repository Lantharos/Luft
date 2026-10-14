#!/usr/bin/env python3
"""Writes a registry hive with only a root key, enough for the installer to see Windows."""
import struct
import sys

BLOCK = 4096
NO_CELL = 0xFFFFFFFF
ROOT_KEY_ASCII = 0x0004 | 0x0020

name = b"ROOT"
node = (
    b"nk"
    + struct.pack("<H", ROOT_KEY_ASCII)
    + bytes(16)
    + struct.pack("<IIIIIIII", 0, 0, NO_CELL, NO_CELL, 0, NO_CELL, NO_CELL, NO_CELL)
    + bytes(20)
    + struct.pack("<HH", len(name), 0)
    + name
)
size = (4 + len(node) + 7) // 8 * 8
cell = struct.pack("<i", -size) + node + bytes(size - 4 - len(node))
root = 32
bin_ = bytearray(b"hbin" + bytes(4) + struct.pack("<I", BLOCK) + bytes(20) + cell)
free = BLOCK - len(bin_)
bin_ += struct.pack("<i", free) + bytes(free - 4)

base = bytearray(BLOCK)
for offset, value in [(0, int.from_bytes(b"regf", "little")), (4, 1), (8, 1), (20, 1), (24, 5), (28, 0),
                      (32, 1), (36, root), (40, BLOCK), (44, 1)]:
    struct.pack_into("<I", base, offset, value)
checksum = 0
for (dword,) in struct.iter_unpack("<I", bytes(base[:508])):
    checksum ^= dword
struct.pack_into("<I", base, 508, {0: 1, 0xFFFFFFFF: 0xFFFFFFFE}.get(checksum, checksum))

with open(sys.argv[1], "wb") as hive:
    hive.write(bytes(base) + bytes(bin_))
