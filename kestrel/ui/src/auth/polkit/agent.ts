import type GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';

import { promptGate } from '../../shared/dialogs/promptGate.js';
import { AuthenticationDialog, type Request } from './dialog.js';

class AuthenticationAgent extends Shell.PolkitAuthenticationAgent {
  static {
    GObject.registerClass(this);
  }

  private currentDialog: AuthenticationDialog | null = null;
  private stopWaiting: (() => void) | null = null;

  constructor() {
    super();
    this.connect('initiate', (_agent, actionId: string, message: string, iconName: string, cookie: string, uids: GLib.Variant, details: GLib.Variant) =>
      this.onInitiate({ actionId, message, iconName, cookie, uids: uids.deepUnpack<number[]>(), details: details.deepUnpack<Record<string, string>>() }));
    this.connect('cancel', () => this.completeRequest(false));
  }

  enable(): void {
    try {
      this.register();
    } catch {
      log('Failed to register AuthenticationAgent');
    }
  }

  disable(): void {
    try {
      this.unregister();
    } catch {
      log('Failed to unregister AuthenticationAgent');
    }
  }

  private onInitiate(request: Request): void {
    if (promptGate.locked) {
      this.stopWaiting = promptGate.watch(() => {
        this.stopWaiting!();
        this.stopWaiting = null;
        this.onInitiate(request);
      });
      return;
    }

    this.currentDialog = new AuthenticationDialog(request);
    this.currentDialog.connect('done', (_dialog, dismissed) => this.completeRequest(dismissed));
  }

  private completeRequest(dismissed: boolean): void {
    this.currentDialog?.close();
    this.currentDialog = null;

    this.stopWaiting?.();
    this.stopWaiting = null;

    this.complete(dismissed);
  }
}

export { AuthenticationAgent as Component };
