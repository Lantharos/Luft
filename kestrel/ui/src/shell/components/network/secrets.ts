import NM from 'gi://NM';

import * as KestrelUi from '../../../kestrelUi.js';

const CONNECTION_ICONS: Record<string, string> = {
  '802-11-wireless': 'network-wireless-symbolic',
  '802-3-ethernet': 'network-wired-symbolic',
  'pppoe': 'network-wired-symbolic',
  'gsm': 'network-cellular-symbolic',
  'cdma': 'network-cellular-symbolic',
  'bluetooth': 'bluetooth-active-symbolic',
};

export interface Secret {
  label: string;
  key: string | null;
  value: string;
  password: boolean;
  validate?: (value: string) => boolean;
}

export interface SecretContent {
  title?: string;
  message?: string;
  iconName: string | null;
  secrets: Secret[];
}

const isHex = (value: string) => /^[0-9a-fA-F]*$/.test(value);
const isAsciiLetters = (value: string) => /^[a-zA-Z]*$/.test(value);

function validateWpaPsk(value: string): boolean {
  if (value.length === 64) return isHex(value);
  return value.length >= 8 && value.length <= 63;
}

function staticWepValidator(keyType: NM.WepKeyType): (value: string) => boolean {
  return value => {
    if (keyType === NM.WepKeyType.KEY) {
      if (value.length === 10 || value.length === 26) return isHex(value);
      if (value.length === 5 || value.length === 13) return isAsciiLetters(value);
      return false;
    }
    if (keyType === NM.WepKeyType.PASSPHRASE) return value.length <= 64;
    return true;
  };
}

class SecretsRequest {
  readonly secrets: Secret[] = [];

  constructor(private readonly connection: NM.Connection, private readonly settingName: string,
    private readonly hints: string[], private readonly rejected: boolean) {}

  private push(label: string, key: string | null, value: string | null, password: boolean, validate?: (value: string) => boolean): void {
    this.secrets.push({ label, key, value: value || '', password, validate });
  }

  wireless(): void {
    if (this.settingName === '802-1x') {
      this.ieee8021x();
      return;
    }

    const security = this.connection.get_setting_wireless_security()!;
    switch (security.key_mgmt) {
    case 'wpa-none':
    case 'wpa-psk':
    case 'sae':
      this.push(KestrelUi.t('network-agent-password'), 'psk', this.rejected ? '' : security.psk, true, validateWpaPsk);
      break;
    case 'none':
      this.push(KestrelUi.t('network-agent-key'), `wep-key${security.wep_tx_keyidx}`,
        this.rejected ? '' : security.get_wep_key(security.wep_tx_keyidx), true, staticWepValidator(security.wep_key_type));
      break;
    case 'ieee8021x':
      if (security.auth_alg === 'leap')
        this.push(KestrelUi.t('network-agent-password'), 'leap-password', security.leap_password, true);
      else
        this.ieee8021x();
      break;
    case 'wpa-eap':
      this.ieee8021x();
      break;
    default:
      log(`Invalid wireless key management: ${security.key_mgmt}`);
    }
  }

  ieee8021x(): void {
    const setting = this.connection.get_setting_802_1x()!;

    if (this.settingName === '802-1x' && this.hints.length) {
      if (this.hints.includes('identity'))
        this.push(KestrelUi.t('network-agent-username'), 'identity', setting.identity, false);
      if (this.hints.includes('password'))
        this.push(KestrelUi.t('network-agent-password'), 'password', setting.password, true);
      if (this.hints.includes('private-key-password'))
        this.push(KestrelUi.t('network-agent-private-key-password'), 'private-key-password', setting.private_key_password, true);
      return;
    }

    switch (setting.get_eap_method(0)) {
    case 'md5':
    case 'leap':
    case 'ttls':
    case 'peap':
    case 'fast':
      this.push(KestrelUi.t('network-agent-username'), null, setting.identity, false);
      this.push(KestrelUi.t('network-agent-password'), 'password', setting.password, true);
      break;
    case 'tls':
      this.push(KestrelUi.t('network-agent-identity'), null, setting.identity, false);
      this.push(KestrelUi.t('network-agent-private-key-password'), 'private-key-password', setting.private_key_password, true);
      break;
    default:
      log(`Invalid EAP/IEEE802.1x method: ${setting.get_eap_method(0)}`);
    }
  }

  pppoe(): void {
    const setting = this.connection.get_setting_pppoe()!;
    this.push(KestrelUi.t('network-agent-username'), 'username', setting.username, false);
    this.push(KestrelUi.t('network-agent-service'), 'service', setting.service, false);
    this.push(KestrelUi.t('network-agent-password'), 'password', setting.password, true);
  }

  mobile(): void {
    this.push(KestrelUi.t('network-agent-password'), 'password', '', true);
  }
}

export function secretContent(connection: NM.Connection, settingName: string, hints: string[], rejected: boolean): SecretContent {
  const connectionSetting = connection.get_setting_connection()!;
  const connectionType = connectionSetting.get_connection_type()!;
  const request = new SecretsRequest(connection, settingName, hints, rejected);
  const content: SecretContent = { iconName: CONNECTION_ICONS[connectionType] ?? null, secrets: request.secrets };

  switch (connectionType) {
  case '802-11-wireless': {
    const ssid = NM.utils_ssid_to_utf8(connection.get_setting_wireless()!.get_ssid()!.get_data()!);
    content.title = KestrelUi.t('network-agent-auth-required');
    content.message = rejected
      ? KestrelUi.t('network-agent-wifi-rejected', { networkName: ssid })
      : KestrelUi.t('network-agent-wifi-secrets', { networkName: ssid });
    request.wireless();
    break;
  }
  case '802-3-ethernet':
    content.title = KestrelUi.t('network-agent-wired-title');
    request.secrets.push({ label: KestrelUi.t('network-agent-network-name'), key: null, value: connectionSetting.get_id()!, password: false });
    request.ieee8021x();
    break;
  case 'pppoe':
    content.title = KestrelUi.t('network-agent-dsl-title');
    request.pppoe();
    break;
  case 'gsm':
    if (hints.includes('pin')) {
      content.title = KestrelUi.t('network-agent-pin-title');
      content.message = KestrelUi.t('network-agent-pin-body');
      request.secrets.push({ label: KestrelUi.t('network-agent-pin'), key: 'pin', value: connection.get_setting_gsm()!.pin || '', password: true });
      break;
    }
  // falls through
  case 'cdma':
  case 'bluetooth':
    content.title = KestrelUi.t('network-agent-auth-required');
    content.message = KestrelUi.t('network-agent-password-required', { networkName: connectionSetting.get_id()! });
    request.mobile();
    break;
  default:
    log(`Invalid connection type: ${connectionType}`);
  }

  return content;
}
