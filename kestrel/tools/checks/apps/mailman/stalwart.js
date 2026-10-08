import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {freePorts, listening} from '../../lib/ports.js';
import {scratch, spawn, stop} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';
import {removeTree, write} from '../lib/files.js';

const STARTUP = 20000;
export const USERS = {alice: 'alice-password', bob: 'bob-password'};

function config(ports, data) {
  const principals = Object.entries(USERS).map(([name, secret]) => `[[directory."memory".principals]]
name = "${name}"
class = "individual"
secret = "${secret}"
email = ["${name}@example.test"]
`).join('\n');
  return `[server]
hostname = "127.0.0.1"
[server.listener.smtp]
bind = ["127.0.0.1:${ports.smtp}"]
protocol = "smtp"
[server.listener.imap]
bind = ["127.0.0.1:${ports.imap}"]
protocol = "imap"
[server.listener.http]
bind = ["127.0.0.1:${ports.http}"]
protocol = "http"
[http]
url = "'http://127.0.0.1:${ports.http}'"
[storage]
data = "rocksdb"
fts = "rocksdb"
blob = "rocksdb"
lookup = "rocksdb"
directory = "memory"
[store."rocksdb"]
type = "rocksdb"
path = "${data}"
[directory."memory"]
type = "memory"
${principals}
[session.auth]
mechanisms = "[plain, login]"
allow-plain-text = true
[imap.auth]
allow-plain-text = true
[session.rcpt]
directory = "'memory'"
relay = false
`;
}

function readLine(process) {
  const lines = new Gio.DataInputStream({base_stream: process.get_stdout_pipe()});
  return () => new Promise((resolve, reject) => lines.read_line_async(GLib.PRIORITY_DEFAULT, null, (source, result) => {
    try {
      resolve(source.read_line_finish_utf8(result)[0]);
    } catch (error) {
      reject(error);
    }
  }));
}

export class MailServer {
  constructor(stalwart) {
    this.ports = freePorts('imap', 'smtp', 'http');
    this._stalwart = stalwart;
    this._config = scratch('mailman-delivery', 'config.toml');
    write(this._config, config(this.ports, scratch('mailman-delivery', 'data')));
  }

  async remove() {
    await stop(this._relay);
    await stop(this._server);
    removeTree(scratch('mailman-delivery'));
  }

  async start() {
    this._server = spawn([this._stalwart, '--config', this._config], {flags: Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE});
    const {imap, smtp, http} = this.ports;
    await waitUntil(() => [imap, smtp, http].every(listening), 'Stalwart starts', STARTUP);
  }

  async restart() {
    this._server.force_exit();
    await this._server.exited;
    await this.start();
  }

  async startRelay(relay) {
    this._relay = spawn(['python3', relay, `${this.ports.imap}`], {flags: Gio.SubprocessFlags.STDOUT_PIPE});
    this._relayLine = readLine(this._relay);
    this.ports.relay = Number(await this._relayLine());
  }

  async cutOff() {
    this._relay.send_signal(10);
    if (await this._relayLine() !== 'cut off') throw new Error('The relay did not cut its connections off');
  }

  deliver(from, to, subject) {
    const connection = new Gio.SocketClient().connect_to_host(`127.0.0.1:${this.ports.smtp}`, 0, null);
    const input = new Gio.DataInputStream({base_stream: connection.get_input_stream()});
    const reply = () => {
      let line;
      do [line] = input.read_line_utf8(null);
      while (line?.[3] === '-');
      if (!/^[23]/.test(line ?? '')) throw new Error(`Stalwart refused the message: ${line}`);
    };
    const say = text => {
      connection.get_output_stream().write_all(new TextEncoder().encode(`${text}\r\n`), null);
      reply();
    };
    reply();
    say('EHLO checks.example.test');
    say(`AUTH PLAIN ${GLib.base64_encode(new TextEncoder().encode(`\0${from}\0${USERS[from]}`))}`);
    say(`MAIL FROM:<${from}@example.test>`);
    say(`RCPT TO:<${to}@example.test>`);
    say('DATA');
    say(`From: ${from}@example.test\r\nTo: ${to}@example.test\r\nSubject: ${subject}\r\nMessage-ID: <${subject}@example.test>\r\n\r\nHello from the delivery check.\r\n.`);
    say('QUIT');
    connection.close(null);
    return GLib.get_monotonic_time();
  }
}
