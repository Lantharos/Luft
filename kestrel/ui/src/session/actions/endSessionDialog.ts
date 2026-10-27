import AccountsService from 'gi://AccountsService';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Dialog from '../../shared/dialogs/dialog.js';
import * as GnomeSession from './gnomeSession.js';
import * as KestrelUi from '../../kestrelUi.js';
import * as LoginManager from './loginManager.js';
import * as UserWidget from '../../shared/widgets/userWidget.js';
import { CheckBox } from '../../shared/widgets/checkBox.js';
import { ModalDialog, State } from '../../shared/dialogs/modalDialog.js';
import { DIALOG_CONTENT, DialogType, roundSecondsToInterval, type ConfirmSignal, type EndSessionContent } from './endSessionContent.js';

import { ModalDialogErrors, ModalDialogError } from '../../core/runtime/dbusErrors.js';

import { loadInterfaceXML } from '../../core/runtime/fileUtils.js';
import { loadStagedImage, type StagedImage } from './stagedImage.js';

const ITEM_ICON_SIZE = 64;
const LOW_BATTERY_THRESHOLD = 30;
const MAX_USERS_IN_SESSION_DIALOG = 5;
const COUNTDOWN_INTERVAL = 10;
const BATTERY_CHARGING = 1;
const BATTERY_FULLY_CHARGED = 4;
const NIGHTLY = '-nightly.';

const EndSessionDialogIface = loadInterfaceXML('org.gnome.SessionManager.EndSessionDialog')!;

interface LogindSessionRemote {
  readonly Id: string;
  readonly Class: string;
  readonly State: string;
  readonly Type: string;
  readonly Remote: boolean;
}

interface UPowerDeviceRemote {
  readonly IsPresent: boolean;
  readonly State: number;
  readonly Percentage: number;
}

type Inhibitor = GnomeSession.InhibitorProxy;
type OpenParams = [type: number, timestamp: number, totalSecondsToStayOpen: number, inhibitorObjectPaths: string[]];

const LogindSession = Gio.DBusProxy.makeProxyWrapper<LogindSessionRemote>(loadInterfaceXML('org.freedesktop.login1.Session'));
const UPowerProxy = Gio.DBusProxy.makeProxyWrapper<UPowerDeviceRemote>(loadInterfaceXML('org.freedesktop.UPower.Device'));

function findAppFromInhibitor(inhibitor: Inhibitor): Shell.App | null {
  let desktopFile: string;
  try {
    [desktopFile] = inhibitor.GetAppIdSync();
  } catch {
    log(`gnome-session gave us a dead inhibitor: ${inhibitor.get_object_path()}`);
    return null;
  }

  if (!desktopFile.endsWith('.desktop')) desktopFile += '.desktop';

  return Shell.AppSystem.get_default().lookup_heuristic_basename(desktopFile);
}

function setCheckBoxLabel(checkBox: CheckBox, text: string): void {
  checkBox.getLabelActor().set_text(text);
  checkBox.visible = !!text;
}

export class EndSessionDialog extends ModalDialog {
  static {
    GObject.registerClass(this);
  }

  readonly checkBox = new CheckBox();
  private readonly loginManager = LoginManager.getLoginManager();
  private readonly userManager = AccountsService.UserManager.get_default();
  private readonly user = this.userManager.get_user(GLib.get_user_name());
  private readonly powerProxy = UPowerProxy(Gio.DBus.system, 'org.freedesktop.UPower', '/org/freedesktop/UPower/devices/DisplayDevice',
    (_proxy, error) => {
      if (error) {
        log((error as Error).message);
        return;
      }
      this.powerProxy.connect('g-properties-changed', () => this.sync());
      this.sync();
    });

  private readonly messageDialogContent = new Dialog.MessageDialogContent();
  private readonly batteryWarning = new St.Label({ style_class: 'end-session-dialog-battery-warning' });
  private readonly applicationSection = new Dialog.ListSection();
  private readonly sessionSection = new Dialog.ListSection();
  private readonly dbusImpl = Gio.DBusExportedObject.wrapJSObject(EndSessionDialogIface, this);
  private readonly altCapture = new Clutter.KeyController({ enabled: false });

  private canRebootToBootLoaderMenu = false;
  private stagedImage: StagedImage | null = null;
  private updateScheduled = false;
  private updatePrepared = false;
  private type: number = DialogType.LOGOUT;
  private secondsLeft = 0;
  private totalSecondsToStayOpen = 0;
  private timerId = 0;
  private applications: Inhibitor[] = [];
  private sessions = 0;
  private rebootButton: St.Button | null = null;
  private rebootButtonAlt: St.Button | null = null;

  constructor() {
    super({
      styleClass: 'end-session-dialog',
      destroyOnClose: false,
    });

    this.loginManager.canRebootToBootLoaderMenu()
      .then(({ canRebootToBootLoaderMenu }) => (this.canRebootToBootLoaderMenu = canRebootToBootLoaderMenu))
      .catch(logError);

    this.connect('opened', () => this.sync());

    this.user.connectObject(
      'notify::is-loaded', () => this.sync(),
      'changed', () => this.sync(), this);

    this.checkBox.connect('clicked', () => this.sync());
    this.messageDialogContent.add_child(this.checkBox);

    KestrelUi.bindText(this.batteryWarning, 'end-session-low-battery');
    this.batteryWarning.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
    this.batteryWarning.clutter_text.line_wrap = true;
    this.messageDialogContent.add_child(this.batteryWarning);

    this.contentLayout.add_child(this.messageDialogContent);

    KestrelUi.localized(this.applicationSection, () => (this.applicationSection.title = KestrelUi.t('end-session-busy-apps')));
    this.contentLayout.add_child(this.applicationSection);

    KestrelUi.localized(this.sessionSection, () => (this.sessionSection.title = KestrelUi.t('end-session-other-users')));
    this.contentLayout.add_child(this.sessionSection);

    this.dbusImpl.export(Gio.DBus.session, '/org/gnome/SessionManager/EndSessionDialog');

    this.altCapture.connectObject(
      'key-press', () => this.onKeyCaptured(true),
      'key-release', () => this.onKeyCaptured(false),
      this);
    this.add_action_full('alt-capture-controller', Clutter.EventPhase.CAPTURE, this.altCapture);
  }

  private get dialogContent(): EndSessionContent {
    return DIALOG_CONTENT[this.type];
  }

  private updatesCheckBoxText(): string {
    const { checkBoxText } = this.dialogContent;
    if (!checkBoxText) return '';

    const version = this.stagedImage?.version;
    if (!version) return checkBoxText();
    const [release, number] = version.split(NIGHTLY);
    const label = number ? KestrelUi.t('end-session-version-nightly', { release, number }) : version;
    return KestrelUi.t('end-session-install-version', { version: label });
  }

  private isBatteryLow(): boolean {
    const { IsPresent, State: state, Percentage } = this.powerProxy;
    const discharging = IsPresent && state !== BATTERY_CHARGING && state !== BATTERY_FULLY_CHARGED;
    return discharging && Percentage < LOW_BATTERY_THRESHOLD;
  }

  private shouldShowLowBatteryWarning(): boolean {
    if (!this.dialogContent.showBatteryWarning || !this.isBatteryLow()) return false;
    return this.checkBox.checked || this.updateScheduled;
  }

  private sync(): void {
    if (this.state !== State.OPENING && this.state !== State.OPENED) return;

    const content = this.dialogContent;
    let subject = content.subjectWithUpdates && this.checkBox.checked ? content.subjectWithUpdates() : content.subject();
    let description: string | undefined;

    this.batteryWarning.visible = this.shouldShowLowBatteryWarning();

    const displayTime = roundSecondsToInterval(this.totalSecondsToStayOpen, this.secondsLeft, COUNTDOWN_INTERVAL);

    if (this.user.is_loaded) {
      const realName = this.user.get_real_name();
      if (realName != null) {
        if (content.subjectWithUser) subject = content.subjectWithUser(realName);
        if (content.descriptionWithUser) description = content.descriptionWithUser(realName, displayTime);
      }
    }

    this.messageDialogContent.iconName = content.iconName;
    this.messageDialogContent.title = subject;
    this.messageDialogContent.description = description || content.description(displayTime);

    this.applicationSection.visible = this.applications.length > 0;
    this.sessionSection.visible = this.sessions > 0;
  }

  private onKeyCaptured(pressed: boolean): boolean {
    const [, key] = this.altCapture.get_key();
    if (key !== Clutter.KEY_Alt_L && key !== Clutter.KEY_Alt_R) return Clutter.EVENT_PROPAGATE;

    this.rebootButton!.visible = !pressed;
    this.rebootButtonAlt!.visible = pressed;

    return Clutter.EVENT_PROPAGATE;
  }

  private afterClosing(callback: () => void): void {
    const signalId = this.connect('closed', () => {
      this.disconnect(signalId);
      callback();
    });
  }

  private updateButtons(): void {
    this.stopAltCapture();
    this.clearButtons();

    this.addButton({
      action: () => this.cancel(),
      label: KestrelUi.t('end-session-cancel'),
      key: Clutter.KEY_Escape,
    });

    const { confirmSignal } = this.dialogContent;
    const button = this.addButton({
      action: () => {
        this.afterClosing(() => this.confirm(confirmSignal).catch(logError));
        this.close(true);
      },
      label: this.dialogContent.confirmLabel(),
    });

    if (!this.canRebootToBootLoaderMenu || confirmSignal !== 'ConfirmedReboot') return;

    this.rebootButton = button;
    this.rebootButtonAlt = this.addButton({
      action: () => {
        this.close(true);
        this.afterClosing(() => this.confirmRebootToBootLoaderMenu());
      },
      label: KestrelUi.t('end-session-boot-options'),
    });
    this.rebootButtonAlt.visible = false;
    this.altCapture.enabled = true;
  }

  private stopAltCapture(): void {
    this.altCapture.enabled = false;
    this.rebootButton = null;
    this.rebootButtonAlt = null;
  }

  override close(skipSignal = false): void {
    super.close();

    if (!skipSignal) this.dbusImpl.emit_signal('Closed', null);
  }

  private cancel(): void {
    this.stopTimer();
    this.stopAltCapture();
    this.dbusImpl.emit_signal('Canceled', null);
    this.close();
  }

  private confirmRebootToBootLoaderMenu(): void {
    this.loginManager.setRebootToBootLoaderMenu();
    this.confirm('ConfirmedReboot').catch(logError);
  }

  private async confirm(signal: ConfirmSignal): Promise<void> {
    if (this.installsStagedImage(signal)) await this.applyStagedImage();

    this.fadeOutDialog();
    this.stopTimer();
    this.stopAltCapture();
    this.dbusImpl.emit_signal(signal, null);
  }

  private installsStagedImage(signal: ConfirmSignal): boolean {
    if (!this.checkBox.visible) return this.type === DialogType.UPDATE_RESTART;
    return this.checkBox.checked && (signal === 'ConfirmedReboot' || signal === 'ConfirmedShutdown');
  }

  private async applyStagedImage(): Promise<void> {
    try {
      await this.stagedImage!.apply();
    } catch (error) {
      log((error as Error).message);
    }
  }

  private startTimer(): void {
    const startTime = GLib.get_monotonic_time();
    this.secondsLeft = this.totalSecondsToStayOpen;

    this.timerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
      const secondsElapsed = (GLib.get_monotonic_time() - startTime) / 1000000;

      this.secondsLeft = this.totalSecondsToStayOpen - secondsElapsed;
      if (this.secondsLeft > 0) {
        this.sync();
        return GLib.SOURCE_CONTINUE;
      }

      this.confirm(this.dialogContent.confirmSignal).catch(logError);
      this.timerId = 0;

      return GLib.SOURCE_REMOVE;
    });
    GLib.Source.set_name_by_id(this.timerId, '[kestrel] this._confirm');
  }

  private stopTimer(): void {
    if (this.timerId > 0) {
      GLib.source_remove(this.timerId);
      this.timerId = 0;
    }

    this.secondsLeft = 0;
  }

  private onInhibitorLoaded(inhibitor: Inhibitor): void {
    if (!this.applications.includes(inhibitor)) return;

    const app = findAppFromInhibitor(inhibitor);
    const [flags] = app ? inhibitor.GetFlagsSync() : [0];

    if (app && flags & GnomeSession.InhibitFlags.LOGOUT) {
      const [description] = inhibitor.GetReasonSync();
      this.applicationSection.list.add_child(new Dialog.ListSectionItem({
        icon_actor: KestrelUi.appIcon(app, ITEM_ICON_SIZE),
        title: app.get_name(),
        description,
      }));
    } else {
      this.applications.splice(this.applications.indexOf(inhibitor), 1);
    }

    this.sync();
  }

  private async loadSessions(): Promise<void> {
    const sessionId = GLib.getenv('XDG_SESSION_ID') || (await this.loginManager.getCurrentSessionProxy())!.Id;

    for (const [, , userName, , sessionPath] of await this.loginManager.listSessions()) {
      const proxy = LogindSession(Gio.DBus.system, 'org.freedesktop.login1', sessionPath);

      if (proxy.Class !== 'user' || proxy.State === 'closing' || proxy.Id === sessionId) continue;

      const user = this.userManager.get_user(userName);
      this.sessions++;

      const userAvatar = new UserWidget.Avatar(user, { iconSize: ITEM_ICON_SIZE });
      userAvatar.update();

      const displayUserName = user.get_real_name() ?? userName;

      let title = userName;
      if (proxy.Remote)
        title = KestrelUi.t('end-session-remote-user', { userName: displayUserName });
      else if (proxy.Type === 'tty')
        title = KestrelUi.t('end-session-console-user', { userName: displayUserName });

      this.sessionSection.list.add_child(new Dialog.ListSectionItem({ icon_actor: userAvatar, title }));

      if (this.sessions === MAX_USERS_IN_SESSION_DIALOG) break;
    }

    this.sync();
  }

  async OpenAsync([type, , totalSecondsToStayOpen, inhibitorObjectPaths]: OpenParams, invocation: Gio.DBusMethodInvocation): Promise<void> {
    if (await KestrelUi.refuseSandboxed(invocation, 'ask to end the session')) return;

    this.totalSecondsToStayOpen = totalSecondsToStayOpen;
    this.type = type;

    const staged = await loadStagedImage();
    this.stagedImage = staged?.switching ? null : staged;
    this.updateScheduled = this.stagedImage?.scheduled ?? false;
    this.updatePrepared = this.stagedImage?.prepared ?? false;

    if (this.updateScheduled && this.type === DialogType.RESTART) this.type = DialogType.UPDATE_RESTART;

    this.applications = [];
    this.applicationSection.list.destroy_all_children();

    this.sessions = 0;
    this.sessionSection.list.destroy_all_children();

    if (!(this.type in DIALOG_CONTENT)) {
      invocation.return_error_literal(ModalDialogErrors, ModalDialogError.UNKNOWN_TYPE, 'Unknown dialog type requested');
      return;
    }

    const content = this.dialogContent;

    for (const path of inhibitorObjectPaths) {
      const inhibitor = GnomeSession.Inhibitor(path, proxy => this.onInhibitorLoaded(proxy));
      this.applications.push(inhibitor);
    }

    if (content.showOtherSessions) this.loadSessions().catch(logError);

    setCheckBoxLabel(this.checkBox, this.updatesCheckBoxText());
    this.checkBox.visible = !!content.checkBoxText && (this.updatePrepared || this.updateScheduled);
    this.checkBox.checked = this.checkBox.visible && !this.isBatteryLow();

    this.batteryWarning.visible = this.shouldShowLowBatteryWarning();

    this.updateButtons();

    if (!this.open()) {
      invocation.return_error_literal(ModalDialogErrors, ModalDialogError.GRAB_FAILED, 'Cannot grab pointer and keyboard');
      return;
    }

    this.startTimer();
    this.sync();

    invocation.return_value(null);
  }

  Close(): void {
    this.close();
  }
}
