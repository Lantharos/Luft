import Gio from 'gi://Gio';

export function freePorts(...names) {
  const listener = new Gio.SocketListener();
  const ports = Object.fromEntries(names.map(name => [name, listener.add_any_inet_port(null)]));
  listener.close();
  return ports;
}

export function listening(port) {
  try {
    new Gio.SocketClient().connect_to_host(`127.0.0.1:${port}`, 0, null).close(null);
    return true;
  } catch {
    return false;
  }
}
