import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Dialog from './dialog.js';
import * as KestrelUi from '../../kestrelUi.js';
import { CheckBox } from '../widgets/checkBox.js';
import { ModalDialog } from './modalDialog.js';

import { DBusSenderChecker } from '../runtime/util.js';
import { loadInterfaceXML } from '../runtime/fileUtils.js';

const RequestIface = loadInterfaceXML('org.freedesktop.impl.portal.Request')!;
const AccessIface = loadInterfaceXML('org.freedesktop.impl.portal.Access')!;

const DialogResponse = {
  OK: 0,
  CANCEL: 1,
  CLOSED: 2,
} as const;
type DialogResponse = typeof DialogResponse[keyof typeof DialogResponse];

const ALLOWED_SENDERS = ['org.freedesktop.portal.Desktop'];

type Choice = [id: string, name: string, options: [string, string][], selected: string];

interface AccessOptions {
  deny_label?: string;
  grant_label?: string;
  icon?: string;
  choices?: Choice[];
}

type AccessDialogParams = [
  handle: string,
  appId: string,
  parentWindow: string,
  title: string,
  description: string,
  body: string,
  options: Record<string, GLib.Variant>,
];

class AccessDialog extends ModalDialog {
  static {
    GObject.registerClass(this);
  }

  private readonly request = Gio.DBusExportedObject.wrapJSObject(RequestIface, this);
  private readonly choices = new Map<string, CheckBox>();
  private requestExported = false;

  constructor(private readonly invocation: Gio.DBusMethodInvocation, private readonly handle: string,
    title: string, description: string, body: string, options: Record<string, GLib.Variant>) {
    super({ styleClass: 'access-dialog' });

    const unpacked = Object.fromEntries(Object.entries(options).map(([key, value]) => [key, value.deepUnpack()])) as AccessOptions;
    this.buildLayout(title, description, body, unpacked);
  }

  private buildLayout(title: string, description: string, body: string, options: AccessOptions): void {
    const content = new Dialog.MessageDialogContent({
      title,
      description,
      iconName: options.icon || 'dialog-question-symbolic',
    });
    this.contentLayout.add_child(content);

    for (const [id, name, choiceOptions, selected] of options.choices || []) {
      if (choiceOptions.length > 0) continue;

      const check = new CheckBox();
      check.getLabelActor().text = name;
      check.checked = selected === 'true';
      content.add_child(check);

      this.choices.set(id, check);
    }

    if (body) {
      const bodyLabel = new St.Label({
        text: body,
        x_expand: true,
        style_class: 'message-dialog-description',
      });
      bodyLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
      bodyLabel.clutter_text.line_wrap = true;
      content.add_child(bodyLabel);
    }

    this.addButton({
      label: options.deny_label || KestrelUi.t('access-dialog-deny'),
      action: () => this.sendResponse(DialogResponse.CANCEL),
      key: Clutter.KEY_Escape,
    });
    this.addButton({
      label: options.grant_label || KestrelUi.t('access-dialog-allow'),
      action: () => this.sendResponse(DialogResponse.OK),
    });
  }

  override open(): boolean {
    if (!super.open()) return false;

    this.request.export(this.invocation.get_connection(), this.handle);
    this.requestExported = true;
    return true;
  }

  CloseAsync(_params: [], invocation: Gio.DBusMethodInvocation): void {
    if (this.invocation.get_sender() !== invocation.get_sender()) {
      invocation.return_error_literal(Gio.dbus_error_quark(), Gio.DBusError.ACCESS_DENIED, '');
      return;
    }

    this.sendResponse(DialogResponse.CLOSED);
  }

  private sendResponse(response: DialogResponse): void {
    if (this.requestExported) this.request.unexport();
    this.requestExported = false;

    const results: Record<string, GLib.Variant> = {};
    if (response === DialogResponse.OK) {
      for (const [id, check] of this.choices)
        results[id] = new GLib.Variant('s', check.checked ? 'true' : 'false');
    }

    this.connect('closed', () => {
      this.invocation.return_value(new GLib.Variant('(ua{sv})', [response, results]));
    });
    this.close();
  }
}

export class AccessDialogDBus {
  private accessDialog: AccessDialog | null = null;
  private readonly windowTracker = Shell.WindowTracker.get_default();
  private readonly senderChecker = new DBusSenderChecker(ALLOWED_SENDERS);
  private readonly dbusImpl = Gio.DBusExportedObject.wrapJSObject(AccessIface, this);

  constructor() {
    this.dbusImpl.export(Gio.DBus.session, '/org/freedesktop/portal/desktop');
  }

  async AccessDialogAsync(params: AccessDialogParams, invocation: Gio.DBusMethodInvocation): Promise<void> {
    try {
      await this.senderChecker.checkInvocation(invocation);
    } catch (error) {
      invocation.return_gerror(error as GLib.Error);
      return;
    }

    if (this.accessDialog) {
      invocation.return_error_literal(Gio.dbus_error_quark(), Gio.DBusError.LIMITS_EXCEEDED, 'Already showing a system access dialog');
      return;
    }

    const [handle, appId, , title, description, body, options] = params;
    if (appId && `${appId}.desktop` !== this.windowTracker.focus_app?.id) {
      invocation.return_error_literal(Gio.dbus_error_quark(), Gio.DBusError.ACCESS_DENIED,
        'Only the focused app is allowed to show a system access dialog');
      return;
    }

    const dialog = new AccessDialog(invocation, handle, title, description, body, options);
    dialog.open();

    dialog.connect('closed', () => (this.accessDialog = null));

    this.accessDialog = dialog;
  }
}
