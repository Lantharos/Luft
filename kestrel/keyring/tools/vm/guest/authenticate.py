import json
import socket
import struct
import sys

SOCKET = "/run/kestrel/authenticate"


def frame(connection, message):
    payload = json.dumps(message).encode()
    connection.sendall(struct.pack("=I", len(payload)) + payload)
    size = struct.unpack("=I", connection.recv(4, socket.MSG_WAITALL))[0]
    return json.loads(connection.recv(size, socket.MSG_WAITALL))


def authenticate(user, mode, password=None):
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as connection:
        connection.connect(SOCKET)
        reply = frame(connection, {"type": "create_session", "username": user, "mode": mode})
        while reply["type"] == "auth_message":
            secret = reply["auth_message_type"] in ("secret", "visible")
            if secret and password is None:
                return "asked"
            reply = frame(connection, {"type": "post_auth_message_response", "response": password if secret else None})
        if reply["type"] == "success":
            return "success"
        return reply.get("error_type", "error")


if __name__ == "__main__":
    print(authenticate(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None))
