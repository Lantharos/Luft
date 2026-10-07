import selectors
import signal
import socket
import sys
import threading

listen_port, target_port = int(sys.argv[1]), int(sys.argv[2])
generation = 0


def cut_off(*_):
    global generation
    generation += 1


def relay(client):
    born = generation
    try:
        server = socket.create_connection(('127.0.0.1', target_port))
    except OSError:
        client.close()
        return
    peers = {client: server, server: client}
    watching = selectors.DefaultSelector()
    for end in peers:
        watching.register(end, selectors.EVENT_READ)
    while born == generation:
        for key, _ in watching.select(timeout=0.1):
            if born != generation:
                break
            try:
                data = key.fileobj.recv(65536)
                peers[key.fileobj].sendall(data)
            except OSError:
                data = b''
            if not data:
                client.close()
                server.close()
                return
    threading.Event().wait()


signal.signal(signal.SIGUSR1, cut_off)
listener = socket.create_server(('127.0.0.1', listen_port))
while True:
    accepted, _ = listener.accept()
    threading.Thread(target=relay, args=(accepted,), daemon=True).start()
