import random
import socket
import sys
import time


def stream(port):
    sock = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(("::", port))
    sock.listen()
    return sock


def resolve():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(("0.0.0.0", random.randint(30000, 60000)))
    sock.connect(("10.0.2.3", 53))
    sock.close()


def flap():
    sock = stream(random.randint(30000, 60000))
    time.sleep(0.05)
    sock.close()


def settle():
    first = stream(8005)
    time.sleep(4)
    first.close()
    time.sleep(3)
    stream(8005)
    time.sleep(3600)


def repeat(action):
    end = time.monotonic() + 8
    while time.monotonic() < end:
        action()
        time.sleep(0.1)
    time.sleep(3600)


kind = sys.argv[1]
if kind == "settle":
    settle()
else:
    repeat({"resolve": resolve, "flap": flap}[kind])
