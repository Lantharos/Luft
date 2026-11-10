import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup';

import type { ApiContext } from './context.js';
import type { Network, RequestOptions, Response } from './types.js';

Gio._promisify(Soup.Session.prototype, 'send_async');
Gio._promisify(Gio.InputStream.prototype, 'read_bytes_async');

const DEFAULT_TIMEOUT_S = 20;
const MEGABYTE = 1024 * 1024;
const MAX_BYTES = 4 * MEGABYTE;
const CHUNK_BYTES = 64 * 1024;
const MAX_REDIRECTS = 20;
const LOOPBACK = new Set(['localhost', '127.0.0.1']);
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'PROPFIND', 'TRACE']);
const KEPT_METHOD_REDIRECTS = new Set([301, 302, 307, 308]);
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

interface Request {
  method: string;
  uri: GLib.Uri;
  headers: Record<string, string>;
  body?: string;
}

function messageFor({ method, uri, headers, body }: Request): Soup.Message {
  const message = Soup.Message.new_from_uri(method, uri);
  message.add_flags(Soup.MessageFlags.NO_REDIRECT);
  const sent = message.get_request_headers();
  for (const [name, value] of Object.entries(headers)) sent.replace(name, value);
  if (body !== undefined) message.set_request_body_from_bytes(sent.get_one('content-type'), new GLib.Bytes(new TextEncoder().encode(body)));
  return message;
}

/**
 * Where a redirect sends a request, or `null` for an answer to hand back as it is. Each hop has to be a host the
 * manifest names, like the first, so a named host can't pass the extension on to another one or to the local network.
 * It follows what browsers follow: anything after a 303, a POST after a 301 and whatever isn't safe to repeat after a
 * 302 become a GET without the body, and other methods are only repeated when that's safe.
 */
function redirected(request: Request, message: Soup.Message, hosts: readonly string[]): Request | null {
  const status = message.get_status();
  const location = message.get_response_headers().get_one('Location');
  const safe = SAFE_METHODS.has(request.method);
  const asGet = status === 303 || (status === 302 && !safe) || (status === 301 && request.method === 'POST');
  if (!location || !(asGet || (safe && KEPT_METHOD_REDIRECTS.has(status)))) return null;
  const uri = allowed(GLib.Uri.resolve_relative(request.uri.to_string(), location, GLib.UriFlags.NONE), hosts);
  const elsewhere = uri.get_host() !== request.uri.get_host() || uri.get_port() !== request.uri.get_port();
  const headers = Object.fromEntries(Object.entries(request.headers).filter(([name]) => {
    const header = name.toLowerCase();
    return !(asGet && header.startsWith('content-')) && !(elsewhere && header === 'authorization');
  }));
  if (!asGet) return { ...request, uri, headers };
  return { method: request.method === 'HEAD' ? 'HEAD' : 'GET', uri, headers };
}

/** Sends a request and follows its redirects. Whoever gets the answer closes its stream. */
async function send(request: Request, hosts: readonly string[], cancellable: Gio.Cancellable): Promise<[Soup.Message, Gio.InputStream]> {
  for (let hops = 0; ; hops++) {
    const message = messageFor(request);
    const stream = await session().send_async(message, GLib.PRIORITY_DEFAULT, cancellable);
    try {
      const next = redirected(request, message, hosts);
      if (!next) return [message, stream];
      if (hops === MAX_REDIRECTS) throw new Error(`${request.uri.to_string()} redirects too many times`);
      request = next;
    } catch (error) {
      stream.close(null);
      throw error;
    }
    stream.close(null);
  }
}

export async function readAll(stream: Gio.InputStream, limit: number, cancellable: Gio.Cancellable | null): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const bytes = await stream.read_bytes_async(CHUNK_BYTES, GLib.PRIORITY_DEFAULT, cancellable);
    const chunk = bytes.toArray();
    if (!chunk.length) break;
    length += chunk.length;
    if (length > limit) throw new Error(`The response is larger than ${limit / MEGABYTE} MB`);
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
      const request: Request = { method: options.method ?? 'GET', uri: allowed(url, hosts), headers: options.headers ?? {}, body: options.body };
      const cancellable = new Gio.Cancellable();
      const cancel = scope.disposable(() => cancellable.cancel());
      let timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, options.timeout ?? DEFAULT_TIMEOUT_S, () => {
        timeout = 0;
        cancellable.cancel();
        return GLib.SOURCE_REMOVE;
      });
      try {
        const [message, stream] = await send(request, hosts, cancellable);
        const body = decoder.decode(await readAll(stream, MAX_BYTES, cancellable).finally(() => stream.close(null)));
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
