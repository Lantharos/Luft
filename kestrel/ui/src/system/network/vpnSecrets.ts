import Gio from 'gi://Gio';
import NM from 'gi://NM';
import Shell from 'gi://Shell';

import { loadDialogModules } from '../../auth/keyring/dialog.js';
import { OpenConnectSignIn } from './openconnect.js';
import { externalAuthDialog, planFromAuthDialog, planFromSettings, type Plan } from './pluginSecrets.js';
import { VpnDialog, type Step } from './vpnDialog.js';

Gio._promisify(Shell.NetworkAgent.prototype, 'search_vpn_plugin');

const OPENCONNECT = 'org.freedesktop.NetworkManager.openconnect';

type Answer = Record<string, string> | null;

export class VpnSecrets {
  private readonly cancellable = new Gio.Cancellable();
  private readonly title: string;
  private dialog: VpnDialog | null = null;
  private answer: ((values: Answer) => void) | null = null;
  private signIn: OpenConnectSignIn | null = null;
  private done = false;

  constructor(private readonly agent: Shell.NetworkAgent, private readonly requestId: string, private readonly connection: NM.Connection,
    private readonly hints: string[], private readonly flags: NM.SecretAgentGetSecretsFlags, private readonly finished: () => void) {
    this.title = `Sign in to ${connection.get_id()}`;
    this.start().catch(error => {
      if (!this.done) console.warn(`Kestrel could not ask for the secrets of ${connection.get_id()}: ${error}`);
      this.finish(Shell.NetworkAgentResponse.INTERNAL_ERROR);
    });
  }

  private get interactive(): boolean {
    return (this.flags & NM.SecretAgentGetSecretsFlags.ALLOW_INTERACTION) !== 0;
  }

  private async start(): Promise<void> {
    const setting = this.connection.get_setting_vpn()!;
    if (setting.service_type === OPENCONNECT) {
      await this.openConnect();
      return;
    }
    const plugin = await this.agent.search_vpn_plugin(setting.service_type!).catch(() => null);
    const program = externalAuthDialog(plugin);
    const plan = program
      ? await planFromAuthDialog(program, this.connection, this.hints, this.flags, this.cancellable)
      : planFromSettings(setting, this.hints, this.flags);
    await this.complete(plan);
  }

  private async complete({ message, fields, known }: Plan): Promise<void> {
    const values = fields.length && this.interactive ? await this.ask({ message, fields }) : {};
    if (values) this.respond({ ...known, ...values });
    else this.finish(Shell.NetworkAgentResponse.USER_CANCELED);
  }

  private async openConnect(): Promise<void> {
    if (!this.interactive) {
      this.respond({});
      return;
    }
    this.signIn = new OpenConnectSignIn(this.connection);
    const secrets = await this.signIn.run({
      ask: step => this.ask(step),
      wait: message => this.dialog?.wait(message),
    }, () => (global as unknown as Shell.Global).create_app_launch_context(0, -1));
    if (secrets) this.respond(secrets);
    else this.finish(Shell.NetworkAgentResponse.USER_CANCELED);
  }

  private async ask(step: Step): Promise<Answer> {
    this.dialog ??= VpnDialog.open(await loadDialogModules(), this.title, {
      submit: values => this.answer?.(values),
      cancel: () => {
        this.answer?.(null);
        this.finish(Shell.NetworkAgentResponse.USER_CANCELED);
      },
    });
    return new Promise(resolve => {
      this.answer = resolve;
      if (!this.dialog!.show(step)) resolve(null);
    });
  }

  private respond(secrets: Record<string, string>): void {
    if (this.done) return;
    for (const [key, value] of Object.entries(secrets)) this.agent.add_vpn_secret(this.requestId, key, value);
    this.finish(Shell.NetworkAgentResponse.CONFIRMED);
  }

  private finish(response: Shell.NetworkAgentResponse): void {
    if (this.done) return;
    this.done = true;
    this.agent.respond(this.requestId, response);
    this.stop();
  }

  private stop(): void {
    this.cancellable.cancel();
    this.signIn?.stop();
    this.dialog?.close();
    this.finished();
  }

  cancel(respond: boolean): void {
    if (respond) {
      this.finish(Shell.NetworkAgentResponse.USER_CANCELED);
    } else if (!this.done) {
      this.done = true;
      this.stop();
    }
  }
}
