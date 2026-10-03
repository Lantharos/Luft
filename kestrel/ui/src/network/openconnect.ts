import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type NM from 'gi://NM';
import { LIBEXECDIR } from 'resource:///com/lantharos/kestrel/misc/config.js';

import type { Field, Step } from './vpnDialog.js';

Gio._promisify(Gio.DataInputStream.prototype, 'read_line_async');
Gio._promisify(Gio.OutputStream.prototype, 'write_all_async');

const BUILD_DIRECTORY = GLib.getenv('KESTREL_BUILDDIR');
const HELPER = BUILD_DIRECTORY ? `${BUILD_DIRECTORY}/../../openconnect/target/release/kestrel-openconnect` : `${LIBEXECDIR}/kestrel-openconnect`;

interface HelperField {
  name: string;
  label: string;
  kind: 'text' | 'password' | 'choice';
  value: string;
  choices?: { name: string; label: string }[];
}

type Message =
  | { type: 'form'; message: string; error: string; fields: HelperField[] }
  | { type: 'certificate'; host: string; reason: string; fingerprint: string }
  | { type: 'browse'; uri: string }
  | { type: 'done'; secrets: Record<string, string> }
  | { type: 'failed'; message: string };

export interface SignInSteps {
  ask(step: Step): Promise<Record<string, string> | null>;
  wait(message: string): void;
}

function field({ name, label, kind, value, choices }: HelperField): Field {
  return { key: name, label, value, secret: kind === 'password', choices: kind === 'choice' ? choices : undefined };
}

export class OpenConnectSignIn {
  private readonly helper: Gio.Subprocess;
  private readonly lines: Gio.DataInputStream;

  constructor(connection: NM.Connection) {
    this.helper = Gio.Subprocess.new([HELPER], Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE);
    this.lines = new Gio.DataInputStream({ base_stream: this.helper.get_stdout_pipe()! });
    const setting = connection.get_setting_vpn()!;
    const data: Record<string, string> = {};
    const secrets: Record<string, string> = {};
    setting.foreach_data_item((key: string, value: string) => (data[key] = value ?? ''));
    setting.foreach_secret((key: string, value: string) => (secrets[key] = value ?? ''));
    void this.send({ data, secrets });
  }

  private async send(message: object): Promise<void> {
    const bytes = new TextEncoder().encode(`${JSON.stringify(message)}\n`);
    await this.helper.get_stdin_pipe()!.write_all_async(bytes, GLib.PRIORITY_DEFAULT, null);
  }

  private async next(): Promise<Message | null> {
    const [line] = await this.lines.read_line_async(GLib.PRIORITY_DEFAULT, null);
    return line ? JSON.parse(new TextDecoder().decode(line)) as Message : null;
  }

  async run(steps: SignInSteps, launch: () => Gio.AppLaunchContext): Promise<Record<string, string> | null> {
    for (let message = await this.next(); message; message = await this.next()) {
      switch (message.type) {
      case 'form': {
        const values = await steps.ask({ message: message.message, warning: message.error, fields: message.fields.map(field) });
        if (!values) return null;
        steps.wait('Signing in…');
        await this.send({ values });
        break;
      }
      case 'certificate': {
        const accepted = await steps.ask({
          message: `${message.host} presented a certificate that can’t be verified (${message.reason}). Its fingerprint is ${message.fingerprint}.`,
          warning: 'Someone could be pretending to be this server. Only connect if you expected this.',
          fields: [],
          action: 'Connect Anyway',
        });
        if (!accepted) return null;
        steps.wait('Signing in…');
        await this.send({ accept: true });
        break;
      }
      case 'browse':
        Gio.AppInfo.launch_default_for_uri(message.uri, launch());
        steps.wait('Finish signing in with your browser.');
        break;
      case 'done':
        return message.secrets;
      case 'failed':
        throw new Error(message.message);
      }
    }
    return null;
  }

  stop(): void {
    this.helper.force_exit();
  }
}
