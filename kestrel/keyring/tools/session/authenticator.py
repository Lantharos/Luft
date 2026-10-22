import json
import os
import socket
import struct
import sys
import threading

socket_path, password, log_path = sys.argv[1], sys.argv[2], sys.argv[3]
HEADER = struct.Struct("=I")


def receive(connection):
    header = connection.recv(HEADER.size, socket.MSG_WAITALL)
    if len(header) < HEADER.size:
        return None
    (length,) = HEADER.unpack(header)
    return json.loads(connection.recv(length, socket.MSG_WAITALL))


def send(connection, message):
    payload = json.dumps(message).encode()
    connection.sendall(HEADER.pack(len(payload)) + payload)


def converse(connection):
    with connection:
        session = receive(connection)
        if session is None:
            return
        if session.get("mode") != "password":
            send(connection, {"type": "error", "error_type": "error", "description": "No fingerprint reader"})
            return
        send(connection, {"type": "auth_message", "auth_message_type": "secret", "auth_message": "Password:"})
        answer = receive(connection) or {}
        accepted = answer.get("response") == password
        with open(log_path, "a") as log:
            log.write(json.dumps({"user": session.get("username"), "accepted": accepted}) + "\n")
        if accepted:
            send(connection, {"type": "success"})
        else:
            send(connection, {"type": "error", "error_type": "auth_error", "description": "Wrong password"})


if os.path.exists(socket_path):
    os.remove(socket_path)
server = socket.socket(socket.AF_UNIX)
server.bind(socket_path)
server.listen()
while True:
    connection, _ = server.accept()
    threading.Thread(target=converse, args=(connection,), daemon=True).start()
