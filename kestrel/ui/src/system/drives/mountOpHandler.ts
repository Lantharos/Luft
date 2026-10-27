import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as KestrelUi from '../../kestrelUi.js';
import { MountPasswordDialog } from './passwordDialog.js';
import { MountProcessesDialog, MountQuestionDialog } from './choiceDialogs.js';

import { loadInterfaceXML } from '../../core/runtime/fileUtils.js';

const MountOpIface = loadInterfaceXML('org.Gtk.MountOperationHandler')!;

const RequestType = {
  NONE: 0,
  ASK_PASSWORD: 1,
  ASK_QUESTION: 2,
  SHOW_PROCESSES: 3,
} as const;
type RequestType = typeof RequestType[keyof typeof RequestType];

type Details = Record<string, GLib.Variant>;
type AskPasswordParams = [id: string, message: string, iconName: string, defaultUser: string, defaultDomain: string, flags: Gio.AskPasswordFlags];
type AskQuestionParams = [id: string, message: string, iconName: string, choices: string[]];
type ShowProcessesParams = [id: string, message: string, iconName: string, applicationPids: number[], choices: string[]];

function choiceResponse(choice: number): [Gio.MountOperationResult, Details] {
  if (choice === -1) return [Gio.MountOperationResult.ABORTED, {}];
  return [Gio.MountOperationResult.HANDLED, { choice: GLib.Variant.new('i', choice) }];
}

export class MountOperationHandler {
  private readonly dbusImpl = Gio.DBusExportedObject.wrapJSObject(MountOpIface, this);
  private dialog: MountPasswordDialog | MountQuestionDialog | MountProcessesDialog | null = null;
  private currentId: string | null = null;
  private currentInvocation: Gio.DBusMethodInvocation | null = null;
  private currentType: RequestType = RequestType.NONE;

  constructor() {
    this.dbusImpl.export(Gio.DBus.session, '/org/gtk/MountOperationHandler');
    Gio.bus_own_name_on_connection(Gio.DBus.session, 'org.gtk.MountOperationHandler', Gio.BusNameOwnerFlags.REPLACE, null, null);
  }

  private clearCurrentRequest(response: Gio.MountOperationResult, details: Details): void {
    this.currentInvocation?.return_value(GLib.Variant.new('(ua{sv})', [response, details]));

    this.currentId = null;
    this.currentInvocation = null;
    this.currentType = RequestType.NONE;
  }

  private setCurrentRequest(invocation: Gio.DBusMethodInvocation, id: string, type: RequestType): boolean {
    const oldId = this.currentId;
    const oldType = this.currentType;
    const requestId = `${id}@${invocation.get_sender()}`;

    this.clearCurrentRequest(Gio.MountOperationResult.UNHANDLED, {});

    this.currentInvocation = invocation;
    this.currentId = requestId;
    this.currentType = type;

    return !!this.dialog && oldId === requestId && oldType === type;
  }

  private closeDialog(): void {
    this.dialog?.close();
    this.dialog = null;
  }

  async AskPasswordAsync([id, message, , , , flags]: AskPasswordParams, invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (await KestrelUi.refuseSandboxed(invocation, 'ask for passwords')) return;

    if (this.setCurrentRequest(invocation, id, RequestType.ASK_PASSWORD)) {
      (this.dialog as MountPasswordDialog).reaskPassword();
      return;
    }

    this.closeDialog();

    const dialog = new MountPasswordDialog(message, flags);
    this.dialog = dialog;
    dialog.connect('response', (_dialog, choice, password, remember, hiddenVolume, systemVolume, pim) => {
      if (choice === -1) {
        this.clearCurrentRequest(Gio.MountOperationResult.ABORTED, {});
        return;
      }

      this.clearCurrentRequest(Gio.MountOperationResult.HANDLED, {
        password_save: GLib.Variant.new('u', remember ? Gio.PasswordSave.PERMANENTLY : Gio.PasswordSave.NEVER),
        password: GLib.Variant.new('s', password),
        hidden_volume: GLib.Variant.new('b', hiddenVolume),
        system_volume: GLib.Variant.new('b', systemVolume),
        pim: GLib.Variant.new('u', pim),
      });
    });
    dialog.open();
  }

  async AskQuestionAsync([id, message, , choices]: AskQuestionParams, invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (await KestrelUi.refuseSandboxed(invocation, 'ask questions for the system')) return;

    if (this.setCurrentRequest(invocation, id, RequestType.ASK_QUESTION)) {
      (this.dialog as MountQuestionDialog).update(message, choices);
      return;
    }

    this.closeDialog();

    const dialog = new MountQuestionDialog();
    this.dialog = dialog;
    dialog.connect('response', (_dialog, choice) => this.clearCurrentRequest(...choiceResponse(choice)));

    dialog.update(message, choices);
    dialog.open();
  }

  async ShowProcessesAsync([id, message, , applicationPids, choices]: ShowProcessesParams, invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (await KestrelUi.refuseSandboxed(invocation, 'ask to close apps')) return;

    if (this.setCurrentRequest(invocation, id, RequestType.SHOW_PROCESSES)) {
      (this.dialog as MountProcessesDialog).update(message, applicationPids, choices);
      return;
    }

    this.closeDialog();

    const dialog = new MountProcessesDialog();
    this.dialog = dialog;
    dialog.connect('response', (_dialog, choice) => this.clearCurrentRequest(...choiceResponse(choice)));

    dialog.update(message, applicationPids, choices);
    dialog.open();
  }

  Close(): void {
    this.clearCurrentRequest(Gio.MountOperationResult.UNHANDLED, {});
    this.closeDialog();
  }
}
