import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

Gio._promisify(Gio.InputStream.prototype, 'read_bytes_async');
Gio._promisify(Gio.OutputStream.prototype, 'write_all_async');
Gio._promisify(Gio.SocketClient.prototype, 'connect_async');

const HEADER_SIZE = 4;
const NATIVE_LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
const AUTHENTICATOR_SOCKET = '/run/kestrel/authenticate';

export interface SessionOptions {
  mode?: 'fingerprint';
}

export type GreetdRequest =
  | { type: 'create_session'; username: string } & SessionOptions
  | { type: 'post_auth_message_response'; response?: string }
  | { type: 'start_session'; cmd: string[]; env: string[] }
  | { type: 'cancel_session' };

export type GreetdReply =
  | { type: 'success' }
  | { type: 'error'; error_type: 'auth_error' | 'error'; description: string }
  | { type: 'auth_message'; auth_message_type: 'visible' | 'secret' | 'info' | 'error'; auth_message: string };

interface ChannelOptions {
  abortable?: boolean;
}

export class GreetdChannel {
  private readonly input: Gio.InputStream;
  private readonly output: Gio.OutputStream;
  private readonly cancellable = new Gio.Cancellable();
  readonly abortable: boolean;

  constructor(private readonly stream: Gio.SocketConnection, { abortable = false }: ChannelOptions = {}) {
    this.input = stream.get_input_stream();
    this.output = stream.get_output_stream();
    this.abortable = abortable;
  }

  async request(message: GreetdRequest): Promise<GreetdReply> {
    const payload = new TextEncoder().encode(JSON.stringify(message));
    const frame = new Uint8Array(HEADER_SIZE + payload.length);
    new DataView(frame.buffer).setUint32(0, payload.length, NATIVE_LITTLE_ENDIAN);
    frame.set(payload, HEADER_SIZE);
    payload.fill(0);
    try {
      await this.output.write_all_async(frame, GLib.PRIORITY_DEFAULT, this.cancellable);
    } finally {
      frame.fill(0);
    }

    const header = await this.read(HEADER_SIZE);
    const size = new DataView(header.buffer).getUint32(0, NATIVE_LITTLE_ENDIAN);
    return JSON.parse(new TextDecoder().decode(await this.read(size)));
  }

  private async read(size: number): Promise<Uint8Array> {
    const data = new Uint8Array(size);
    let filled = 0;
    while (filled < size) {
      const bytes = await this.input.read_bytes_async(size - filled, GLib.PRIORITY_DEFAULT, this.cancellable);
      const chunk = bytes.toArray();
      if (chunk.length === 0) throw new Error('The authentication channel closed');
      data.set(chunk, filled);
      filled += chunk.length;
    }
    return data;
  }

  close(): void {
    this.cancellable.cancel();
    this.stream.close_async(GLib.PRIORITY_DEFAULT, null, null);
  }
}

async function connect(path: string, options?: ChannelOptions): Promise<GreetdChannel> {
  const address = new Gio.UnixSocketAddress({ path });
  return new GreetdChannel(await new Gio.SocketClient().connect_async(address, null), options);
}

export function connectGreetd(): Promise<GreetdChannel> {
  return connect(GLib.getenv('GREETD_SOCK')!);
}

export function connectAuthenticator(): Promise<GreetdChannel> {
  return connect(GLib.getenv('KESTREL_AUTHENTICATE_SOCK') ?? AUTHENTICATOR_SOCKET, { abortable: true });
}
