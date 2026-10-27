import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import NM from 'gi://NM';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Dialog from '../dialogs/dialog.js';
import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../main.js';
import * as MessageTray from '../notifications/messageTray.js';
import * as ModalDialog from '../dialogs/modalDialog.js';
import * as ShellEntry from '../widgets/shellEntry.js';

Gio._promisify(Shell.NetworkAgent.prototype, 'init_async');

const CONNECTION_ICONS = {
    '802-11-wireless': 'network-wireless-symbolic',
    '802-3-ethernet': 'network-wired-symbolic',
    'pppoe': 'network-wired-symbolic',
    'gsm': 'network-cellular-symbolic',
    'cdma': 'network-cellular-symbolic',
    'bluetooth': 'bluetooth-active-symbolic',
};

const NetworkSecretDialog = GObject.registerClass(
class NetworkSecretDialog extends ModalDialog.ModalDialog {
    _init(agent, requestId, connection, settingName, hints, flags) {
        super._init({styleClass: 'prompt-dialog'});

        this._agent = agent;
        this._requestId = requestId;
        this._connection = connection;
        this._settingName = settingName;
        this._hints = hints;
        this._rejected = Boolean(flags & NM.SecretAgentGetSecretsFlags.REQUEST_NEW);

        this._content = this._getContent();

        const contentBox = new Dialog.MessageDialogContent({
            title: this._content.title,
            description: this._content.message,
            iconName: this._content.iconName,
        });

        let initialFocusSet = false;
        for (let i = 0; i < this._content.secrets.length; i++) {
            const secret = this._content.secrets[i];
            const reactive = secret.key != null;

            const entryParams = {
                style_class: 'prompt-dialog-password-entry',
                text: secret.value,
                can_focus: reactive,
                reactive,
                x_expand: true,
            };
            if (secret.password)
                secret.entry = new St.PasswordEntry(entryParams);
            else
                secret.entry = new St.Entry(entryParams);
            ShellEntry.addContextMenu(secret.entry);
            contentBox.add_child(new Dialog.EntryField(secret.entry, secret.label));

            if (secret.validate)
                secret.valid = secret.validate(secret);
            else // no special validation, just ensure it's not empty
                secret.valid = secret.value.length > 0;

            if (reactive) {
                if (!initialFocusSet) {
                    this.setInitialKeyFocus(secret.entry);
                    initialFocusSet = true;
                }

                secret.entry.clutter_text.connect('activate', this._onOk.bind(this));
                secret.entry.clutter_text.connect('text-changed', () => {
                    secret.value = secret.entry.get_text();
                    if (secret.validate)
                        secret.valid = secret.validate(secret);
                    else
                        secret.valid = secret.value.length > 0;
                    this._updateOkButton();
                });
            } else {
                secret.valid = true;
            }
        }

        if (this._content.secrets.some(s => s.password)) {
            const capsLockWarning = new ShellEntry.CapsLockWarning();
            contentBox.add_child(capsLockWarning);
        }

        if (flags & NM.SecretAgentGetSecretsFlags.WPS_PBC_ACTIVE) {
            const descriptionLabel = new St.Label({
                text: KestrelUi.t('network-agent-wps-hint'),
                style_class: 'message-dialog-description',
            });
            descriptionLabel.clutter_text.line_wrap = true;
            descriptionLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

            contentBox.add_child(descriptionLabel);
        }

        this.contentLayout.add_child(contentBox);

        this._okButton = {
            label: KestrelUi.t('network-agent-connect'),
            action: this._onOk.bind(this),
            default: true,
        };

        this.setButtons([{
            label: KestrelUi.t('network-agent-cancel'),
            action: this.cancel.bind(this),
            key: Clutter.KEY_Escape,
        }, this._okButton]);

        this._updateOkButton();
    }

    _updateOkButton() {
        let valid = true;
        for (let i = 0; i < this._content.secrets.length; i++) {
            const secret = this._content.secrets[i];
            valid &&= secret.valid;
        }

        this._okButton.button.reactive = valid;
        this._okButton.button.can_focus = valid;
    }

    _onOk() {
        let valid = true;
        for (let i = 0; i < this._content.secrets.length; i++) {
            const secret = this._content.secrets[i];
            valid &&= secret.valid;
            if (secret.key !== null) {
                this._agent.set_password(this._requestId, secret.key, secret.value);
            }
        }

        if (valid) {
            this._agent.respond(this._requestId, Shell.NetworkAgentResponse.CONFIRMED);
            this.close();
        }
        // do nothing if not valid
    }

    cancel() {
        this._agent.respond(this._requestId, Shell.NetworkAgentResponse.USER_CANCELED);
        this.close();
    }

    _validateWpaPsk(secret) {
        const value = secret.value;
        if (value.length === 64) {
            // must be composed of hexadecimal digits only
            for (let i = 0; i < 64; i++) {
                if (!((value[i] >= 'a' && value[i] <= 'f') ||
                      (value[i] >= 'A' && value[i] <= 'F') ||
                      (value[i] >= '0' && value[i] <= '9')))
                    return false;
            }
            return true;
        }

        return value.length >= 8 && value.length <= 63;
    }

    _validateStaticWep(secret) {
        const value = secret.value;
        if (secret.wep_key_type === NM.WepKeyType.KEY) {
            if (value.length === 10 || value.length === 26) {
                for (let i = 0; i < value.length; i++) {
                    if (!((value[i] >= 'a' && value[i] <= 'f') ||
                          (value[i] >= 'A' && value[i] <= 'F') ||
                          (value[i] >= '0' && value[i] <= '9')))
                        return false;
                }
            } else if (value.length === 5 || value.length === 13) {
                for (let i = 0; i < value.length; i++) {
                    if (!((value[i] >= 'a' && value[i] <= 'z') ||
                          (value[i] >= 'A' && value[i] <= 'Z')))
                        return false;
                }
            } else {
                return false;
            }
        } else if (secret.wep_key_type === NM.WepKeyType.PASSPHRASE) {
            if (value.length < 0 || value.length > 64)
                return false;
        }
        return true;
    }

    _getWirelessSecrets(secrets, _wirelessSetting) {
        const wirelessSecuritySetting = this._connection.get_setting_wireless_security();

        if (this._settingName === '802-1x') {
            this._get8021xSecrets(secrets);
            return;
        }

        switch (wirelessSecuritySetting.key_mgmt) {
        // First the easy ones
        case 'wpa-none':
        case 'wpa-psk':
        case 'sae':
            secrets.push({
                label: KestrelUi.t('network-agent-password'),
                key: 'psk',
                value: this._rejected ? '' : wirelessSecuritySetting.psk || '',
                validate: this._validateWpaPsk,
                password: true,
            });
            break;
        case 'none': // static WEP
            secrets.push({
                label: KestrelUi.t('network-agent-key'),
                key: `wep-key${wirelessSecuritySetting.wep_tx_keyidx}`,
                value: this._rejected ? '' : wirelessSecuritySetting.get_wep_key(wirelessSecuritySetting.wep_tx_keyidx) || '',
                wep_key_type: wirelessSecuritySetting.wep_key_type,
                validate: this._validateStaticWep,
                password: true,
            });
            break;
        case 'ieee8021x':
            if (wirelessSecuritySetting.auth_alg === 'leap') { // Cisco LEAP
                secrets.push({
                    label: KestrelUi.t('network-agent-password'),
                    key: 'leap-password',
                    value: wirelessSecuritySetting.leap_password || '',
                    password: true,
                });
            } else { // Dynamic (IEEE 802.1x) WEP
                this._get8021xSecrets(secrets);
            }
            break;
        case 'wpa-eap':
            this._get8021xSecrets(secrets);
            break;
        default:
            log(`Invalid wireless key management: ${wirelessSecuritySetting.key_mgmt}`);
        }
    }

    _get8021xSecrets(secrets) {
        const ieee8021xSetting = this._connection.get_setting_802_1x();

        /* If hints were given we know exactly what we need to ask */
        if (this._settingName === '802-1x' && this._hints.length) {
            if (this._hints.includes('identity')) {
                secrets.push({
                    label: KestrelUi.t('network-agent-username'),
                    key: 'identity',
                    value: ieee8021xSetting.identity || '',
                    password: false,
                });
            }
            if (this._hints.includes('password')) {
                secrets.push({
                    label: KestrelUi.t('network-agent-password'),
                    key: 'password',
                    value: ieee8021xSetting.password || '',
                    password: true,
                });
            }
            if (this._hints.includes('private-key-password')) {
                secrets.push({
                    label: KestrelUi.t('network-agent-private-key-password'),
                    key: 'private-key-password',
                    value: ieee8021xSetting.private_key_password || '',
                    password: true,
                });
            }
            return;
        }

        switch (ieee8021xSetting.get_eap_method(0)) {
        case 'md5':
        case 'leap':
        case 'ttls':
        case 'peap':
        case 'fast':
            // TTLS and PEAP are actually much more complicated, but this complication
            // is not visible here since we only care about phase2 authentication
            // (and don't even care of which one)
            secrets.push({
                label: KestrelUi.t('network-agent-username'),
                key: null,
                value: ieee8021xSetting.identity || '',
                password: false,
            });
            secrets.push({
                label: KestrelUi.t('network-agent-password'),
                key: 'password',
                value: ieee8021xSetting.password || '',
                password: true,
            });
            break;
        case 'tls':
            secrets.push({
                label: KestrelUi.t('network-agent-identity'),
                key: null,
                value: ieee8021xSetting.identity || '',
                password: false,
            });
            secrets.push({
                label: KestrelUi.t('network-agent-private-key-password'),
                key: 'private-key-password',
                value: ieee8021xSetting.private_key_password || '',
                password: true,
            });
            break;
        default:
            log(`Invalid EAP/IEEE802.1x method: ${ieee8021xSetting.get_eap_method(0)}`);
        }
    }

    _getPPPoESecrets(secrets) {
        const pppoeSetting = this._connection.get_setting_pppoe();
        secrets.push({
            label: KestrelUi.t('network-agent-username'),
            key: 'username',
            value: pppoeSetting.username || '',
            password: false,
        });
        secrets.push({
            label: KestrelUi.t('network-agent-service'), key: 'service',
            value: pppoeSetting.service || '',
            password: false,
        });
        secrets.push({
            label: KestrelUi.t('network-agent-password'), key: 'password',
            value: pppoeSetting.password || '',
            password: true,
        });
    }

    _getMobileSecrets(secrets, connectionType) {
        let setting;
        if (connectionType === 'bluetooth')
            setting = this._connection.get_setting_cdma() || this._connection.get_setting_gsm();
        else
            setting = this._connection.get_setting_by_name(connectionType);
        secrets.push({
            label: KestrelUi.t('network-agent-password'),
            key: 'password',
            value: setting.value || '',
            password: true,
        });
    }

    _getContent() {
        const connectionSetting = this._connection.get_setting_connection();
        const connectionType = connectionSetting.get_connection_type();
        let wirelessSetting;
        let ssid;

        const content = {iconName: CONNECTION_ICONS[connectionType] ?? null};
        content.secrets = [];

        switch (connectionType) {
        case '802-11-wireless':
            wirelessSetting = this._connection.get_setting_wireless();
            ssid = NM.utils_ssid_to_utf8(wirelessSetting.get_ssid().get_data());
            content.title = KestrelUi.t('network-agent-auth-required');
            content.message = this._rejected
                ? KestrelUi.t('network-agent-wifi-rejected', {networkName: ssid})
                : KestrelUi.t('network-agent-wifi-secrets', {networkName: ssid});
            this._getWirelessSecrets(content.secrets, wirelessSetting);
            break;
        case '802-3-ethernet':
            content.title = KestrelUi.t('network-agent-wired-title');
            content.message = null;
            content.secrets.push({
                label: KestrelUi.t('network-agent-network-name'),
                key: null,
                value: connectionSetting.get_id(),
                password: false,
            });
            this._get8021xSecrets(content.secrets);
            break;
        case 'pppoe':
            content.title = KestrelUi.t('network-agent-dsl-title');
            content.message = null;
            this._getPPPoESecrets(content.secrets);
            break;
        case 'gsm':
            if (this._hints.includes('pin')) {
                const gsmSetting = this._connection.get_setting_gsm();
                content.title = KestrelUi.t('network-agent-pin-title');
                content.message = KestrelUi.t('network-agent-pin-body');
                content.secrets.push({
                    label: KestrelUi.t('network-agent-pin'),
                    key: 'pin',
                    value: gsmSetting.pin || '',
                    password: true,
                });
                break;
            }
            // fall through
        case 'cdma':
        case 'bluetooth':
            content.title = KestrelUi.t('network-agent-auth-required');
            content.message = KestrelUi.t('network-agent-password-required', {networkName: connectionSetting.get_id()});
            this._getMobileSecrets(content.secrets, connectionType);
            break;
        default:
            log(`Invalid connection type: ${connectionType}`);
        }

        return content;
    }
});

class NetworkAgent {
    constructor() {
        this._native = new Shell.NetworkAgent({
            identifier: 'com.lantharos.Kestrel.NetworkAgent',
            capabilities: NM.SecretAgentCapabilities.VPN_HINTS,
            auto_register: false,
        });

        this._dialogs = { };
        this._vpnRequests = { };
        this._notifications = { };

        this._native.connect('new-request', this._newRequest.bind(this));
        this._native.connect('cancel-request', this._cancelRequest.bind(this));

        this._initialized = false;
        this._initNative();
    }

    async _initNative() {
        try {
            await this._native.init_async(GLib.PRIORITY_DEFAULT, null);
            this._initialized = true;
        } catch (e) {
            this._native = null;
            logError(e, 'error initializing the NetworkManager Agent');
        }
    }

    enable() {
        if (!this._native)
            return;

        this._native.auto_register = true;
        if (this._initialized && !this._native.registered)
            this._native.register_async(null, null);
    }

    disable() {
        let requestId;

        for (requestId in this._dialogs)
            this._dialogs[requestId].cancel();
        this._dialogs = { };

        for (requestId in this._vpnRequests)
            this._vpnRequests[requestId].cancel(true);
        this._vpnRequests = { };

        for (requestId in this._notifications)
            this._notifications[requestId].destroy();
        this._notifications = { };

        if (!this._native)
            return;

        this._native.auto_register = false;
        if (this._initialized && this._native.registered)
            this._native.unregister_async(null, null);
    }

    _showNotification(requestId, connection, settingName, hints, flags) {
        let title, body;

        const connectionSetting = connection.get_setting_connection();
        const connectionType = connectionSetting.get_connection_type();
        switch (connectionType) {
        case '802-11-wireless': {
            const wirelessSetting = connection.get_setting_wireless();
            const ssid = NM.utils_ssid_to_utf8(wirelessSetting.get_ssid().get_data());
            title = KestrelUi.t('network-agent-auth-required');
            body = KestrelUi.t('network-agent-wifi-secrets', {networkName: ssid});
            break;
        }
        case '802-3-ethernet':
            title = KestrelUi.t('network-agent-wired-title');
            body = KestrelUi.t('network-agent-password-required', {networkName: connection.get_id()});
            break;
        case 'pppoe':
            title = KestrelUi.t('network-agent-dsl-title');
            body = KestrelUi.t('network-agent-password-required', {networkName: connection.get_id()});
            break;
        case 'gsm':
            if (hints.includes('pin')) {
                title = KestrelUi.t('network-agent-pin-title');
                body = KestrelUi.t('network-agent-pin-body');
                break;
            }
            // fall through
        case 'cdma':
        case 'bluetooth':
            title = KestrelUi.t('network-agent-auth-required');
            body = KestrelUi.t('network-agent-password-required', {networkName: connectionSetting.get_id()});
            break;
        case 'vpn':
            title = KestrelUi.t('network-agent-vpn-title');
            body = KestrelUi.t('network-agent-password-required', {networkName: connectionSetting.get_id()});
            break;
        default:
            log(`Invalid connection type: ${connectionType}`);
            this._native.respond(requestId, Shell.NetworkAgentResponse.INTERNAL_ERROR);
            return;
        }

        const source = MessageTray.getSystemSource();
        const notification = new MessageTray.Notification({source, title, body});
        notification.iconName = 'dialog-password-symbolic';

        notification.connect('activated', () => {
            notification.answered = true;
            this._handleRequest(requestId, connection, settingName, hints, flags);
        });

        this._notifications[requestId] = notification;
        notification.connect('destroy', () => {
            if (!notification.answered)
                this._native.respond(requestId, Shell.NetworkAgentResponse.USER_CANCELED);
            delete this._notifications[requestId];
        });

        source.addNotification(notification);
    }

    _newRequest(agent, requestId, connection, settingName, hints, flags) {
        const userRequested = flags & NM.SecretAgentGetSecretsFlags.USER_REQUESTED;
        const rejected = flags & NM.SecretAgentGetSecretsFlags.REQUEST_NEW;
        if (userRequested || (rejected && !Main.sessionMode.isLocked))
            this._handleRequest(requestId, connection, settingName, hints, flags);
        else
            this._showNotification(requestId, connection, settingName, hints, flags);
    }

    _handleRequest(requestId, connection, settingName, hints, flags) {
        if (settingName === 'vpn') {
            this._vpnRequest(requestId, connection, hints, flags);
            return;
        }

        const dialog = new NetworkSecretDialog(this._native, requestId, connection, settingName, hints, flags);
        dialog.connect('destroy', () => {
            delete this._dialogs[requestId];
        });
        this._dialogs[requestId] = dialog;
        dialog.open();
    }

    _cancelRequest(agent, requestId) {
        if (this._dialogs[requestId]) {
            this._dialogs[requestId].close();
            this._dialogs[requestId].destroy();
            delete this._dialogs[requestId];
        } else if (this._vpnRequests[requestId]) {
            this._vpnRequests[requestId].cancel(false);
            delete this._vpnRequests[requestId];
        }
    }

    _vpnRequest(requestId, connection, hints, flags) {
        this._vpnRequests[requestId] = new KestrelUi.VpnSecrets(this._native, requestId, connection, hints, flags,
            () => delete this._vpnRequests[requestId]);
    }
}

export {NetworkAgent as Component};
