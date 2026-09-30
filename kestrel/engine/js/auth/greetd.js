import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as Config from '../misc/config.js';

Gio._promisify(Gio.InputStream.prototype, 'read_bytes_async');
Gio._promisify(Gio.OutputStream.prototype, 'write_all_async');
Gio._promisify(Gio.SocketClient.prototype, 'connect_async');

const HEADER_SIZE = 4;
const NATIVE_LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
const BUILD_DIRECTORY = GLib.getenv('GNOME_SHELL_BUILDDIR');
const AUTHENTICATOR = BUILD_DIRECTORY
    ? `${BUILD_DIRECTORY}/authenticate/kestrel-authenticate`
    : `${Config.LIBEXECDIR}/kestrel-authenticate`;

export class GreetdChannel {
    constructor(stream, abort = null) {
        this._input = stream.get_input_stream();
        this._output = stream.get_output_stream();
        this._stream = stream;
        this.abort = abort;
    }

    async request(message) {
        const payload = new TextEncoder().encode(JSON.stringify(message));
        const frame = new Uint8Array(HEADER_SIZE + payload.length);
        new DataView(frame.buffer).setUint32(0, payload.length, NATIVE_LITTLE_ENDIAN);
        frame.set(payload, HEADER_SIZE);
        payload.fill(0);
        try {
            await this._output.write_all_async(frame, GLib.PRIORITY_DEFAULT, null);
        } finally {
            frame.fill(0);
        }

        const header = await this._read(HEADER_SIZE);
        const size = new DataView(header.buffer).getUint32(0, NATIVE_LITTLE_ENDIAN);
        return JSON.parse(new TextDecoder().decode(await this._read(size)));
    }

    async _read(size) {
        const data = new Uint8Array(size);
        let filled = 0;
        while (filled < size) {
            const bytes = await this._input.read_bytes_async(size - filled, GLib.PRIORITY_DEFAULT, null);
            const chunk = bytes.toArray();
            if (chunk.length === 0)
                throw new Error('The authentication channel closed');
            data.set(chunk, filled);
            filled += chunk.length;
        }
        return data;
    }

    close() {
        this._stream.close_async(GLib.PRIORITY_DEFAULT, null, null);
    }
}

export async function connectGreetd() {
    const address = new Gio.UnixSocketAddress({path: GLib.getenv('GREETD_SOCK')});
    return new GreetdChannel(await new Gio.SocketClient().connect_async(address, null));
}

export function spawnAuthenticator() {
    const process = Gio.Subprocess.new([AUTHENTICATOR],
        Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE);
    const stream = Gio.SimpleIOStream.new(process.get_stdout_pipe(), process.get_stdin_pipe());
    return new GreetdChannel(stream, () => process.force_exit());
}
