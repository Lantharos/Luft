import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import NM from 'gi://NM';
import Shell from 'gi://Shell';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../../core/main.js';
import * as MessageTray from '../../surfaces/notifications/tray/messageTray.js';
import { NetworkSecretDialog } from './secretDialog.js';

Gio._promisify(Shell.NetworkAgent.prototype, 'init_async');

interface SecretsRequest {
  requestId: string;
  connection: NM.Connection;
  settingName: string;
  hints: string[];
  flags: NM.SecretAgentGetSecretsFlags;
}

function notificationText({ connection, hints }: SecretsRequest): [title: string, body: string] | null {
  const connectionSetting = connection.get_setting_connection()!;
  const networkName = connectionSetting.get_id()!;
  switch (connectionSetting.get_connection_type()) {
  case '802-11-wireless': {
    const ssid = NM.utils_ssid_to_utf8(connection.get_setting_wireless()!.get_ssid()!.get_data()!);
    return [KestrelUi.t('network-agent-auth-required'), KestrelUi.t('network-agent-wifi-secrets', { networkName: ssid })];
  }
  case '802-3-ethernet':
    return [KestrelUi.t('network-agent-wired-title'), KestrelUi.t('network-agent-password-required', { networkName: connection.get_id()! })];
  case 'pppoe':
    return [KestrelUi.t('network-agent-dsl-title'), KestrelUi.t('network-agent-password-required', { networkName: connection.get_id()! })];
  case 'gsm':
    if (hints.includes('pin')) return [KestrelUi.t('network-agent-pin-title'), KestrelUi.t('network-agent-pin-body')];
  // falls through
  case 'cdma':
  case 'bluetooth':
    return [KestrelUi.t('network-agent-auth-required'), KestrelUi.t('network-agent-password-required', { networkName })];
  case 'vpn':
    return [KestrelUi.t('network-agent-vpn-title'), KestrelUi.t('network-agent-password-required', { networkName })];
  default:
    log(`Invalid connection type: ${connectionSetting.get_connection_type()}`);
    return null;
  }
}

class NetworkAgent {
  native: Shell.NetworkAgent | null = new Shell.NetworkAgent({
    identifier: 'com.lantharos.Kestrel.NetworkAgent',
    capabilities: NM.SecretAgentCapabilities.VPN_HINTS,
    auto_register: false,
  });

  private dialogs = new Map<string, NetworkSecretDialog>();
  private vpnRequests = new Map<string, KestrelUi.VpnSecrets>();
  private notifications = new Map<string, MessageTray.Notification>();
  private initialized = false;

  constructor() {
    this.native!.connect('new-request', (_agent, requestId, connection, settingName, hints, flags) =>
      this.newRequest({ requestId, connection, settingName, hints, flags }));
    this.native!.connect('cancel-request', (_agent, requestId) => this.cancelRequest(requestId));

    void this.initNative();
  }

  private async initNative(): Promise<void> {
    try {
      await this.native!.init_async(GLib.PRIORITY_DEFAULT, null);
      this.initialized = true;
    } catch (error) {
      this.native = null;
      logError(error as Error, 'error initializing the NetworkManager Agent');
    }
  }

  enable(): void {
    if (!this.native) return;

    this.native.auto_register = true;
    if (this.initialized && !this.native.registered) this.native.register_async(null, null);
  }

  disable(): void {
    for (const dialog of this.dialogs.values()) dialog.cancel();
    this.dialogs = new Map();

    for (const request of this.vpnRequests.values()) request.cancel(true);
    this.vpnRequests = new Map();

    for (const notification of this.notifications.values()) notification.destroy();
    this.notifications = new Map();

    if (!this.native) return;

    this.native.auto_register = false;
    if (this.initialized && this.native.registered) this.native.unregister_async(null, null);
  }

  private showNotification(request: SecretsRequest): void {
    const text = notificationText(request);
    if (!text) {
      this.native!.respond(request.requestId, Shell.NetworkAgentResponse.INTERNAL_ERROR);
      return;
    }

    const [title, body] = text;
    const source = MessageTray.getSystemSource();
    const notification = new MessageTray.Notification({ source, title, body });
    notification.iconName = 'dialog-password-symbolic';

    let answered = false;
    notification.connect('activated', () => {
      answered = true;
      this.handleRequest(request);
    });

    this.notifications.set(request.requestId, notification);
    notification.connect('destroy', () => {
      if (!answered) this.native!.respond(request.requestId, Shell.NetworkAgentResponse.USER_CANCELED);
      this.notifications.delete(request.requestId);
    });

    source.addNotification(notification);
  }

  private newRequest(request: SecretsRequest): void {
    const userRequested = request.flags & NM.SecretAgentGetSecretsFlags.USER_REQUESTED;
    const rejected = request.flags & NM.SecretAgentGetSecretsFlags.REQUEST_NEW;
    if (userRequested || (rejected && !Main.sessionMode.isLocked))
      this.handleRequest(request);
    else
      this.showNotification(request);
  }

  private handleRequest({ requestId, connection, settingName, hints, flags }: SecretsRequest): void {
    if (settingName === 'vpn') {
      this.vpnRequests.set(requestId, new KestrelUi.VpnSecrets(this.native!, requestId, connection, hints, flags,
        () => this.vpnRequests.delete(requestId)));
      return;
    }

    const dialog = new NetworkSecretDialog(this.native!, requestId, connection, settingName, hints, flags);
    dialog.connect('destroy', () => this.dialogs.delete(requestId));
    this.dialogs.set(requestId, dialog);
    dialog.open();
  }

  private cancelRequest(requestId: string): void {
    const dialog = this.dialogs.get(requestId);
    if (dialog) {
      dialog.close();
      dialog.destroy();
      this.dialogs.delete(requestId);
      return;
    }

    const vpnRequest = this.vpnRequests.get(requestId);
    if (vpnRequest) {
      vpnRequest.cancel(false);
      this.vpnRequests.delete(requestId);
    }
  }
}

export { NetworkAgent as Component };
