import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const MIB = 1024 * 1024;

function attempt(reach) {
  try {
    return `reached ${reach()}`;
  } catch (error) {
    return `refused: ${error.message ?? error}`;
  }
}

const connect = (host, port) => attempt(() => new Gio.SocketClient({ timeout: 3 }).connect_to_host(`${host}:${port}`, port, null) && 'a connection');

const ATTACKS = {
  home: ({ file }) => attempt(() => new TextDecoder().decode(GLib.file_get_contents(file)[1])),
  loopback: ({ port }) => connect('127.0.0.1', port),
  internet: () => connect('1.1.1.1', 443),
  bus: ({ address }) => attempt(() => Gio.DBusConnection.new_for_address_sync(address,
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null) && 'the bus'),
  process: ({ pid }) => attempt(() => new TextDecoder().decode(GLib.file_get_contents(`/proc/${pid}/cmdline`)[1])),
  memory: () => attempt(() => {
    const kept = [];
    for (let size = 0; size < 1024; size += 64) kept.push(new Uint8Array(64 * MIB).fill(1));
    return `${kept.length * 64} MiB`;
  }),
  link: async ({ file }, hostile) => {
    const link = GLib.build_filenamev([hostile.dataPath, 'link.png']);
    Gio.File.new_for_path(link).make_symbolic_link(file, null);
    try {
      await hostile.clipboard.setImage(link);
      return 'reached the clipboard';
    } catch (error) {
      return `refused: ${error.message}`;
    }
  },
  stall: () => {
    for (;;);
  },
  flood: (_, hostile) => {
    for (let count = 0; count < 100000; count++) hostile.storage.set('flood', count);
    return 'sent';
  },
};

export default function enable(hostile) {
  globalThis.hostile = hostile;
  hostile.peers.handle('attack', ({ attack, ...details }) => ATTACKS[attack](details, hostile));
}
