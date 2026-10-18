import ctypes
import errno
import os
import signal
import stat
import struct
import subprocess
import sys
import tempfile

IN_HEADER = struct.Struct("<IIQQIIIHH")
OUT_HEADER = struct.Struct("<IiQ")
ATTR = struct.Struct("<QQQQQQIIIIIIIIII")
LOOKUP, FORGET, GETATTR, OPEN, READ, RELEASE, INIT, BATCH_FORGET = 1, 2, 3, 14, 15, 18, 26, 42
SILENT = {FORGET, BATCH_FORGET}
ROOT = 1
MS_RDONLY, MS_NOSUID, MS_NODEV, MS_REC, MS_PRIVATE = 1, 2, 4, 1 << 14, 1 << 18
CACHED = 3600


class Tree:
    def __init__(self, path, program):
        with open(program, "rb") as source:
            self.program = source.read()
        self.nodes = {ROOT: (stat.S_IFDIR | 0o555, {})}
        parent = ROOT
        parts = path.split("/")
        for index, name in enumerate(parts, start=ROOT + 1):
            last = index == len(parts) + ROOT
            self.nodes[parent][1][name] = index
            self.nodes[index] = (stat.S_IFREG | 0o755, None) if last else (stat.S_IFDIR | 0o555, {})
            parent = index

    def attributes(self, node):
        mode, _ = self.nodes[node]
        size = len(self.program) if stat.S_ISREG(mode) else 0
        return ATTR.pack(node, size, (size + 511) // 512, 0, 0, 0, 0, 0, 0, mode, 1, os.getuid(), os.getgid(), 0, 4096, 0)


def mount(point, name):
    uid, gid = os.getuid(), os.getgid()
    os.unshare(os.CLONE_NEWUSER | os.CLONE_NEWNS)
    for file, mapping in (("setgroups", "deny"), ("uid_map", f"{uid} {uid} 1"), ("gid_map", f"{gid} {gid} 1")):
        with open(f"/proc/self/{file}", "w") as output:
            output.write(mapping)
    libc = ctypes.CDLL(None, use_errno=True)
    libc.mount(None, b"/", None, MS_REC | MS_PRIVATE, None)
    device = os.open("/dev/fuse", os.O_RDWR | os.O_CLOEXEC)
    options = f"fd={device},rootmode=40555,user_id={uid},group_id={gid}"
    flags = MS_RDONLY | MS_NOSUID | MS_NODEV
    if libc.mount(name.encode(), point.encode(), f"fuse.{name}".encode(), flags, options.encode()) != 0:
        raise OSError(ctypes.get_errno(), "couldn't mount the image")
    return device


def answer(device, unique, payload=b"", error=0):
    os.write(device, OUT_HEADER.pack(OUT_HEADER.size + len(payload), -error, unique) + payload)


def serve(device, tree):
    while True:
        try:
            request = os.read(device, 1 << 20)
        except OSError:
            return
        _, opcode, unique, node, *_ = IN_HEADER.unpack_from(request)
        body = request[IN_HEADER.size :]
        if opcode in SILENT:
            continue
        if opcode == INIT:
            (readahead,) = struct.unpack_from("<8xI", body)
            answer(device, unique, struct.pack("<IIIIHHIIHHII24x", 7, 31, readahead, 0, 16, 12, 4096, 1, 0, 0, 0, 0))
        elif opcode == LOOKUP:
            name = body.split(b"\0", 1)[0].decode()
            children = tree.nodes[node][1] or {}
            if name not in children:
                answer(device, unique, error=errno.ENOENT)
                continue
            child = children[name]
            answer(device, unique, struct.pack("<QQQQII", child, 0, CACHED, CACHED, 0, 0) + tree.attributes(child))
        elif opcode == GETATTR:
            answer(device, unique, struct.pack("<QII", CACHED, 0, 0) + tree.attributes(node))
        elif opcode == OPEN:
            answer(device, unique, struct.pack("<QIi", 0, 0, 0))
        elif opcode == READ:
            _, offset, size = struct.unpack_from("<QQI", body)
            answer(device, unique, tree.program[offset : offset + size])
        elif opcode == RELEASE:
            answer(device, unique)
        else:
            answer(device, unique, error=errno.ENOSYS)


def main():
    folder, inside, program, *command = sys.argv[1:]
    point = tempfile.mkdtemp(prefix=".mount_Vault", dir=folder)
    device = mount(point, os.path.basename(sys.executable))
    tree = Tree(inside, program)
    server = os.fork()
    if server == 0:
        serve(device, tree)
        os._exit(0)
    os.close(device)
    launched = subprocess.run([os.path.join(point, inside), *command], capture_output=True, timeout=60, check=False)
    os.kill(server, signal.SIGKILL)
    os.waitpid(server, 0)
    sys.stdout.write(launched.stdout.decode())


if __name__ == "__main__":
    main()
