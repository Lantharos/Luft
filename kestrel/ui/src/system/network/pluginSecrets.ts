import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import NM from 'gi://NM';

import type { Field } from './vpnDialog.js';

Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');

export interface Plan {
  message: string;
  fields: Field[];
  known: Record<string, string>;
}

const UI_GROUP = 'VPN Plugin UI';
const MESSAGE_HINT = 'x-vpn-message:';
const FLAGS_SUFFIX = '-flags';
const ASKED_FLAGS = NM.SettingSecretFlags.AGENT_OWNED | NM.SettingSecretFlags.NOT_SAVED;
const LABELS: Record<string, string> = {
  'password': 'Password',
  'cert-pass': 'Certificate password',
  'http-proxy-password': 'Proxy password',
  'xauthpassword': 'Password',
  'pskvalue': 'Pre-shared key',
  'Xauth password': 'Password',
  'IPSec secret': 'Group password',
};

function label(key: string): string {
  const words = key.replace(/[-_]+/g, ' ').trim();
  return LABELS[key] ?? words.charAt(0).toUpperCase() + words.slice(1);
}

function secretField(key: string, value = ''): Field {
  return { key, label: label(key), value, secret: true };
}

function truthy(value: string | null): boolean {
  return ['true', 'yes', 'on', '1'].includes(value?.trim().toLowerCase() ?? '');
}

export function externalAuthDialog(plugin: NM.VpnPluginInfo | null): string | null {
  const program = plugin?.get_auth_dialog();
  if (!program || !GLib.file_test(program, GLib.FileTest.IS_EXECUTABLE)) return null;
  return truthy(plugin!.lookup_property('GNOME', 'supports-external-ui-mode')) ? program : null;
}

export function planFromSettings(setting: NM.SettingVpn, hints: string[], flags: NM.SecretAgentGetSecretsFlags): Plan {
  const message = hints.find(hint => hint.startsWith(MESSAGE_HINT))?.slice(MESSAGE_HINT.length) ?? '';
  const hinted = hints.filter(hint => !hint.startsWith('x-'));
  if (hinted.length) return { message, fields: hinted.map(key => secretField(key)), known: {} };

  const renew = (flags & NM.SecretAgentGetSecretsFlags.REQUEST_NEW) !== 0;
  const plan: Plan = { message, fields: [], known: {} };
  setting.foreach_data_item((item: string, value: string) => {
    if (!item.endsWith(FLAGS_SUFFIX)) return;
    const key = item.slice(0, -FLAGS_SUFFIX.length);
    const secretFlags = Number(value);
    if (secretFlags & NM.SettingSecretFlags.NOT_REQUIRED || !(secretFlags & ASKED_FLAGS)) return;
    const saved = setting.get_secret(key) ?? '';
    if (secretFlags & NM.SettingSecretFlags.NOT_SAVED || !saved || renew) plan.fields.push(secretField(key, renew ? '' : saved));
    else plan.known[key] = saved;
  });
  return plan;
}

function connectionInput(setting: NM.SettingVpn): string {
  const lines: string[] = [];
  setting.foreach_data_item((key: string, value: string) => lines.push(`DATA_KEY=${key}`, `DATA_VAL=${value ?? ''}`, ''));
  setting.foreach_secret((key: string, value: string) => lines.push(`SECRET_KEY=${key}`, `SECRET_VAL=${value ?? ''}`, ''));
  return `${lines.join('\n')}\nDONE\n\n`;
}

export async function planFromAuthDialog(program: string, connection: NM.Connection, hints: string[], flags: NM.SecretAgentGetSecretsFlags,
  cancellable: Gio.Cancellable): Promise<Plan> {
  const setting = connection.get_setting_vpn()!;
  const argv = [program, '-u', connection.get_uuid()!, '-n', connection.get_id()!, '-s', setting.service_type!, '--external-ui-mode'];
  if (flags & NM.SecretAgentGetSecretsFlags.ALLOW_INTERACTION) argv.push('-i');
  if (flags & NM.SecretAgentGetSecretsFlags.REQUEST_NEW) argv.push('-r');
  for (const hint of hints) argv.push('-t', hint);
  const helper = Gio.Subprocess.new(argv, Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE);
  const [output] = await helper.communicate_utf8_async(connectionInput(setting), cancellable);
  const plan: Plan = { message: '', fields: [], known: {} };
  if (!output?.trim()) return plan;

  const keyfile = new GLib.KeyFile();
  keyfile.load_from_bytes(new GLib.Bytes(new TextEncoder().encode(output)), GLib.KeyFileFlags.NONE);
  if (keyfile.get_integer(UI_GROUP, 'Version') !== 2) throw new Error(`${program} answered in a format Kestrel doesn’t know`);
  plan.message = keyfile.get_string(UI_GROUP, 'Description');
  for (const key of keyfile.get_groups()[0].filter(group => group !== UI_GROUP)) {
    const value = keyfile.get_string(key, 'Value');
    if (keyfile.get_boolean(key, 'ShouldAsk'))
      plan.fields.push({ key, label: keyfile.get_string(key, 'Label').replace(/:\s*$/, ''), value, secret: keyfile.get_boolean(key, 'IsSecret') });
    else if (value)
      plan.known[key] = value;
  }
  return plan;
}
