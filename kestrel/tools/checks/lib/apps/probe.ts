import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {Point} from '../input/input.js';

export interface Query {
  role?: string;
  name?: string;
  text?: string;
  within?: Query;
  has?: Query;
  nth?: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Match extends Box {
  hit: boolean;
}

interface Answer {
  scale: number;
  matches: Match[];
  alike: string[];
  error?: string;
}

let opened = 0;

export const middle = ({x, y, width, height}: Box): Point => [Math.round(x + width / 2), Math.round(y + height / 2)];

export function describe({role, name, text, within, has, nth}: Query): string {
  const named = text !== undefined ? `“${text}”` : `the ${role}${name === undefined ? '' : ` “${name}”`}`;
  const what = has ? `${named} with ${describe(has)}` : named;
  const which = nth === undefined ? what : `${what} number ${nth + 1}`;
  return within ? `${which} in ${describe(within)}` : which;
}

const readLine = (lines: Gio.DataInputStream) => new Promise<string>((resolve, reject) =>
  lines.read_line_async(GLib.PRIORITY_DEFAULT, null, (_source, result) => {
    const [line] = lines.read_line_finish_utf8(result);
    if (line === null) reject(new Error('the app closed its probe'));
    else resolve(line);
  }));

export class Probe {
  readonly socket = `luft-probe-${new Gio.Credentials().get_unix_pid()}-${++opened}`;
  private _connection: Gio.SocketConnection | null = null;
  private _lines: Gio.DataInputStream | null = null;

  private connect() {
    const address = new Gio.UnixSocketAddress({path: this.socket, addressType: Gio.UnixSocketAddressType.ABSTRACT});
    this._connection = new Gio.SocketClient().connect(address, null);
    this._lines = new Gio.DataInputStream({base_stream: this._connection.get_input_stream()});
  }

  async ask(query: Query): Promise<Answer> {
    if (!this._connection) this.connect();
    this._connection!.get_output_stream().write_all(new TextEncoder().encode(`${JSON.stringify(query)}\n`), null);
    const answer: Answer = JSON.parse(await readLine(this._lines!));
    if (answer.error) throw new Error(answer.error);
    return answer;
  }

  close() {
    this._connection?.close(null);
  }
}
