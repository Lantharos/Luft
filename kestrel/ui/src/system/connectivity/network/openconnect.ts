import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type NM from 'gi://NM';

import { t } from '../../../shared/i18n/index.js';
import { helperLauncher, luftProgram } from '../../../shared/apps/programs.js';
import { openUri } from '../../../shared/apps/launch.js';
import type { Field, Step } from './vpnDialog.js';

Gio._promisify(Gio.DataInputStream.prototype, 'read_line_async');
Gio._promisify(Gio.OutputStream.prototype, 'write_all_async');

const HELPER = luftProgram('kestrel-openconnect');

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

interface SignInSteps {
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
    this.helper = helperLauncher(Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE).spawnv([HELPER]);
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

  async run(steps: SignInSteps): Promise<Record<string, string> | null> {
    for (let message = await this.next(); message; message = await this.next()) {
      switch (message.type) {
      case 'form': {
        const values = await steps.ask({ message: message.message, warning: message.error, fields: message.fields.map(field) });
        if (!values) return null;
        steps.wait(t('vpn-signing-in'));
        await this.send({ values });
        break;
      }
      case 'certificate': {
        const accepted = await steps.ask({
          message: t('vpn-certificate-untrusted', { host: message.host, reason: message.reason, fingerprint: message.fingerprint }),
          warning: t('vpn-certificate-warning'),
          fields: [],
          action: t('vpn-certificate-connect'),
        });
        if (!accepted) return null;
        steps.wait(t('vpn-signing-in'));
        await this.send({ accept: true });
        break;
      }
      case 'browse':
        if (GLib.Uri.peek_scheme(message.uri) !== 'https') throw new Error(`The VPN asked to open ${message.uri}, which isn't an HTTPS page`);
        openUri(message.uri);
        steps.wait(t('vpn-finish-in-browser'));
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
