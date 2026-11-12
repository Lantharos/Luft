import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

Gio._promisify(Gio.InputStream.prototype, 'read_bytes_async');
Gio._promisify(Gio.OutputStream.prototype, 'write_all_async');

const CHUNK = 64 * 1024;
const NEWLINE = 10;

export interface Limits {
  longestLine: number;
  mostQueued: number;
}

export interface ChannelEvents {
  line(text: string, bytes: number): void;
  closed(reason: string | null): void;
}

export class Channel {
  private readonly cancellable = new Gio.Cancellable();
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();
  private pending: Uint8Array[] = [];
  private pendingBytes = 0;
  private queue: Uint8Array[] = [];
  private queuedBytes = 0;
  private writing = false;
  private open = true;

  constructor(private readonly input: Gio.InputStream, private readonly output: Gio.OutputStream, private readonly limits: Limits, private readonly events: ChannelEvents) {
    this.read().catch(error => this.close((error as Error).message));
  }

  send(message: object): void {
    if (!this.open) return;
    const bytes = this.encoder.encode(`${JSON.stringify(message)}\n`);
    this.queuedBytes += bytes.length;
    if (this.queuedBytes > this.limits.mostQueued) {
      this.close('it stopped reading what the desktop sent it');
      return;
    }
    this.queue.push(bytes);
    if (!this.writing) void this.flush();
  }

  close(reason: string | null = null): void {
    if (!this.open) return;
    this.open = false;
    this.cancellable.cancel();
    this.queue = [];
    this.pending = [];
    this.events.closed(reason);
  }

  private async flush(): Promise<void> {
    this.writing = true;
    try {
      while (this.open && this.queue.length) {
        const batch = this.queue.splice(0);
        const bytes = batch.length === 1 ? batch[0] : concatenate(batch);
        await this.output.write_all_async(bytes, GLib.PRIORITY_DEFAULT, this.cancellable);
        this.queuedBytes -= bytes.length;
      }
    } catch (error) {
      this.close((error as Error).message);
    } finally {
      this.writing = false;
    }
  }

  private async read(): Promise<void> {
    while (this.open) {
      const chunk = (await this.input.read_bytes_async(CHUNK, GLib.PRIORITY_DEFAULT, this.cancellable)).toArray();
      if (!chunk.length) {
        this.close(null);
        return;
      }
      this.take(chunk);
    }
  }

  private take(chunk: Uint8Array): void {
    let start = 0;
    for (let end = chunk.indexOf(NEWLINE); end >= 0 && this.open; end = chunk.indexOf(NEWLINE, start)) {
      const piece = chunk.subarray(start, end);
      const line = this.pending.length ? concatenate([...this.pending, piece]) : piece;
      const bytes = this.pendingBytes + piece.length;
      this.pending = [];
      this.pendingBytes = 0;
      start = end + 1;
      if (bytes > this.limits.longestLine) this.close('it sent a message that is too long');
      else this.events.line(this.decoder.decode(line), bytes);
    }
    if (!this.open || start === chunk.length) return;
    this.pending.push(chunk.slice(start));
    this.pendingBytes += chunk.length - start;
    if (this.pendingBytes > this.limits.longestLine) this.close('it sent a message that is too long');
  }
}

function concatenate(parts: Uint8Array[]): Uint8Array {
  const joined = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  return joined;
}
