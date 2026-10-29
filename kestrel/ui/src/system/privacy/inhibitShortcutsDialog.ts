import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Dialog from '../../shared/dialogs/dialog.js';
import * as KestrelUi from '../../kestrelUi.js';
import { ModalDialog } from '../../shared/dialogs/modalDialog.js';
import { isLuftAppWindow } from '../../shared/apps/luftApps.js';
import { lookup, setPermission, type Permission } from '../../shared/dbus/permissionStore.js';

const SHORTCUTS_INHIBITOR: Permission = { table: 'gnome', id: 'shortcuts-inhibitor' };
const GRANTED = 'GRANTED';
const DENIED = 'DENIED';

const DialogResponse = Meta.InhibitShortcutsDialogResponse;

export namespace InhibitShortcutsDialog {
  export interface Signals extends GObject.Object.SignalSignatures, Meta.InhibitShortcutsDialog.SignalSignatures {}
}

export const InhibitShortcutsDialog = GObject.registerClass({
  Implements: [Meta.InhibitShortcutsDialog],
  Properties: {
    'window': GObject.ParamSpec.override('window', Meta.InhibitShortcutsDialog),
  },
}, class InhibitShortcutsDialog extends GObject.Object {
  declare emit: GObject.SignalMethods<this, InhibitShortcutsDialog.Signals>['emit'];

  private readonly dialog = new ModalDialog();

  constructor(private currentWindow: Meta.Window) {
    super();
    this.buildLayout();
  }

  get window(): Meta.Window {
    return this.currentWindow;
  }

  set window(window: Meta.Window) {
    this.currentWindow = window;
  }

  private get app(): Shell.App | null {
    return Shell.WindowTracker.get_default().get_window_app(this.currentWindow);
  }

  private get permissionId(): string | null {
    const window = this.currentWindow;
    if (window.get_client_type() !== Meta.WindowClientType.WAYLAND) return null;
    const sandboxed = window.get_sandboxed_app_id();
    if (sandboxed) return `${sandboxed}.desktop`;
    return window.is_unsandboxed() && this.app && !this.app.is_window_backed() ? this.app.get_id() : null;
  }

  private async saveToPermissionStore(grant: string): Promise<void> {
    const appId = this.permissionId;
    if (!appId) return;

    try {
      await setPermission(SHORTCUTS_INHIBITOR, appId, [grant]);
    } catch (error) {
      log((error as Error).message);
    }
  }

  private buildLayout(): void {
    const name = this.app?.get_name() ?? this.currentWindow.title;

    const content = new Dialog.MessageDialogContent({
      title: KestrelUi.t('inhibit-shortcuts-title'),
      iconName: 'input-keyboard-symbolic',
      description: name
        ? KestrelUi.t('inhibit-shortcuts-app', { appName: name })
        : KestrelUi.t('inhibit-shortcuts-unknown-app'),
    });

    const restoreAccel = Meta.prefs_get_keybinding_label('restore-shortcuts');
    if (restoreAccel) {
      const restoreLabel = new St.Label({
        text: KestrelUi.t('inhibit-shortcuts-restore', { shortcut: restoreAccel }),
        style_class: 'message-dialog-description',
      });
      restoreLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
      restoreLabel.clutter_text.line_wrap = true;
      content.add_child(restoreLabel);
    }

    this.dialog.contentLayout.add_child(content);

    this.dialog.addButton({
      label: KestrelUi.t('inhibit-shortcuts-deny'),
      action: () => {
        void this.saveToPermissionStore(DENIED);
        this.emitResponse(DialogResponse.DENY);
      },
      key: Clutter.KEY_Escape,
    });

    this.dialog.addButton({
      label: KestrelUi.t('inhibit-shortcuts-allow'),
      action: () => {
        void this.saveToPermissionStore(GRANTED);
        this.emitResponse(DialogResponse.ALLOW);
      },
      default: true,
    });
  }

  private emitResponse(response: Meta.InhibitShortcutsDialogResponse): void {
    this.emit('response', response);
    this.dialog.close();
  }

  vfunc_show(): void {
    if (isLuftAppWindow(this.currentWindow)) {
      this.emitResponse(DialogResponse.ALLOW);
      return;
    }

    const appId = this.permissionId;
    if (!appId) {
      this.dialog.open();
      return;
    }

    lookup(Gio.DBus.session, SHORTCUTS_INHIBITOR).then(apps => {
      const permission = apps[appId];
      if (permission === undefined)
        this.dialog.open();
      else if (permission[0] === GRANTED)
        this.emitResponse(DialogResponse.ALLOW);
      else
        this.emitResponse(DialogResponse.DENY);
    }).catch((error: Error) => {
      this.dialog.open();
      log(error.message);
    });
  }

  vfunc_hide(): void {
    this.dialog.close();
  }
});
export type InhibitShortcutsDialog = InstanceType<typeof InhibitShortcutsDialog>;
