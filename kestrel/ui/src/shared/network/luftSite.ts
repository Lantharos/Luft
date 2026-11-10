import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup';

Gio._promisify(Soup.Session.prototype, 'send_async');
Gio._promisify(Gio.InputStream.prototype, 'read_bytes_async');

const SITE = 'https://luft.computer';
const QUIET_FOR_S = 10;
const GIVE_UP_AFTER_S = 20;

let shared: Soup.Session | null = null;
let settings: Gio.Settings | null = null;

export function lookupsAllowed(): boolean {
  settings ??= new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  return settings.get_boolean('online-lookups');
}

async function read(stream: Gio.InputStream, maxBytes: number, cancellable: Gio.Cancellable): Promise<Uint8Array> {
  const body = new Uint8Array(maxBytes);
  let length = 0;
  for (;;) {
    const chunk = (await stream.read_bytes_async(maxBytes + 1 - length, GLib.PRIORITY_LOW, cancellable)).toArray();
    if (!chunk.length) return body.subarray(0, length);
    if (length + chunk.length > maxBytes) throw new Error(`The answer is larger than ${maxBytes} bytes`);
    body.set(chunk, length);
    length += chunk.length;
  }
}

export async function askLuft(path: string, maxBytes: number): Promise<Uint8Array> {
  if (!lookupsAllowed()) throw new Error('Online lookups are turned off');
  shared ??= new Soup.Session({ user_agent: 'Luft', timeout: QUIET_FOR_S });
  const message = Soup.Message.new('GET', `${SITE}${path}`)!;
  message.add_flags(Soup.MessageFlags.NO_REDIRECT);
  const cancellable = new Gio.Cancellable();
  let timeout = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, GIVE_UP_AFTER_S, () => {
    timeout = 0;
    cancellable.cancel();
    return GLib.SOURCE_REMOVE;
  });
  try {
    const stream = await shared.send_async(message, GLib.PRIORITY_LOW, cancellable);
    try {
      if (message.get_status() !== Soup.Status.OK) throw new Error(`${path} answered ${message.get_status()}`);
      return await read(stream, maxBytes, cancellable);
    } finally {
      stream.close(null);
    }
  } finally {
    if (timeout) GLib.source_remove(timeout);
  }
}
