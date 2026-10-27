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
import { lookup, setPermission, type Permission } from '../../shared/dbus/permissionStore.js';

const LUFT_APP_PREFIX = 'com.lantharos.';
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

  private get trusted(): boolean {
    const appId = this.app?.get_id();
    return [appId, this.currentWindow.get_wm_class()].some(id => id?.startsWith(LUFT_APP_PREFIX));
  }

  private shouldUsePermStore(): boolean {
    return !!this.app && !this.app.is_window_backed();
  }

  private async saveToPermissionStore(grant: string): Promise<void> {
    if (!this.shouldUsePermStore()) return;

    try {
      await setPermission(SHORTCUTS_INHIBITOR, this.app!.get_id(), [grant]);
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
    if (this.trusted) {
      this.emitResponse(DialogResponse.ALLOW);
      return;
    }

    if (!this.shouldUsePermStore()) {
      this.dialog.open();
      return;
    }

    const appId = this.app!.get_id();
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
