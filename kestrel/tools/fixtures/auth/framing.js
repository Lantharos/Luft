import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

async function readExactly(input, size) {
  const data = new Uint8Array(size);
  for (let filled = 0; filled < size;) {
    const chunk = (await new Promise((resolve, reject) => input.read_bytes_async(size - filled, GLib.PRIORITY_DEFAULT, null,
      (stream, result) => {
        try {
          resolve(stream.read_bytes_finish(result));
        } catch (e) {
          reject(e);
        }
      }))).toArray();
    if (!chunk.length)
      return null;
    data.set(chunk, filled);
    filled += chunk.length;
  }
  return data;
}

async function serve(connection, respond) {
  const input = connection.get_input_stream();
  const output = connection.get_output_stream();
  for (;;) {
    const header = await readExactly(input, 4);
    if (!header)
      return;
    const size = new DataView(header.buffer).getUint32(0, LITTLE_ENDIAN);
    const request = JSON.parse(new TextDecoder().decode(await readExactly(input, size)));
    const reply = new TextEncoder().encode(JSON.stringify(await respond(request)));
    const frame = new Uint8Array(4 + reply.length);
    new DataView(frame.buffer).setUint32(0, reply.length, LITTLE_ENDIAN);
    frame.set(reply, 4);
    output.write_all(frame, null);
  }
}

export function listen(socketPath, name, conversation) {
  const service = new Gio.SocketService();
  service.add_address(new Gio.UnixSocketAddress({path: socketPath}), Gio.SocketType.STREAM, Gio.SocketProtocol.DEFAULT, null);
  service.connect('incoming', (_service, connection) => {
    serve(connection, conversation()).catch(e => console.error(`${name}: ${e.message}`));
    return true;
  });
  service.start();
}
