import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';

import type { ApiContext } from './context.js';
import type { Network, RequestOptions, Response } from './types.js';

Gio._promisify(Soup.Session.prototype, 'send_async');
Gio._promisify(Gio.InputStream.prototype, 'read_bytes_async');

const DEFAULT_TIMEOUT_S = 20;
const MAX_BYTES = 4 * 1024 * 1024;
const CHUNK_BYTES = 64 * 1024;
const LOOPBACK = new Set(['localhost', '127.0.0.1']);
const decoder = new TextDecoder();

let shared: Soup.Session | null = null;
const session = () => shared ??= new Soup.Session({ user_agent: 'Luft' });

function allowed(url: string, hosts: readonly string[]): GLib.Uri {
  const uri = GLib.Uri.parse(url, GLib.UriFlags.NONE);
  const host = uri.get_host() ?? '';
  const port = uri.get_port();
  const scheme = uri.get_scheme();
  const named = hosts.includes(port > 0 ? `${host}:${port}` : host);
  if (!named || (scheme !== 'https' && !(scheme === 'http' && LOOPBACK.has(host))))
    throw new Error(`${url} isn't on a host the manifest names under [network], over HTTPS`);
  return uri;
}

async function readAll(stream: Gio.InputStream, cancellable: Gio.Cancellable): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const bytes = await stream.read_bytes_async(CHUNK_BYTES, GLib.PRIORITY_DEFAULT, cancellable);
    const chunk = bytes.toArray();
    if (!chunk.length) break;
    length += chunk.length;
    if (length > MAX_BYTES) throw new Error('The response is larger than 4 MB');
    chunks.push(chunk);
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return body;
}

export function networkApi({ manifest, scope }: ApiContext): Network {
  const hosts = manifest.network!.hosts;
  return {
    fetch: async (url: string, options: RequestOptions = {}): Promise<Response> => {
      const message = Soup.Message.new_from_uri(options.method ?? 'GET', allowed(url, hosts));
      const headers = message.get_request_headers();
      for (const [name, value] of Object.entries(options.headers ?? {})) headers.replace(name, value);
      if (options.body !== undefined)
        message.set_request_body_from_bytes(headers.get_one('content-type'), new GLib.Bytes(new TextEncoder().encode(options.body)));
      const cancellable = new Gio.Cancellable();
      const cancel = scope.disposable(() => cancellable.cancel());
      let timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, options.timeout ?? DEFAULT_TIMEOUT_S, () => {
        timeout = 0;
        cancellable.cancel();
        return GLib.SOURCE_REMOVE;
      });
      try {
        const stream = await session().send_async(message, GLib.PRIORITY_DEFAULT, cancellable);
        const body = decoder.decode(await readAll(stream, cancellable).finally(() => stream.close(null)));
        const received: Record<string, string> = {};
        message.get_response_headers().foreach((name, value) => (received[name.toLowerCase()] = value));
        const status = message.get_status();
        return { status, ok: status >= 200 && status < 300, headers: received, text: body, json: () => JSON.parse(body) };
      } finally {
        if (timeout) GLib.source_remove(timeout);
        cancel.dispose();
      }
    },
  };
}
