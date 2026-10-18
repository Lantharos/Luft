import os
import socket
import sys

notify_path, *frontend = sys.argv[1:]

with socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM) as notify:
    notify.bind(notify_path)
    while b"READY=1" not in notify.recv(4096).splitlines():
        pass

os.unlink(notify_path)
os.execv(frontend[0], frontend)
