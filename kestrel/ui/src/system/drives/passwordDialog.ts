import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Dialog from '../../shared/dialogs/dialog.js';
import * as KestrelUi from '../../kestrelUi.js';
import * as ShellEntry from '../../shared/widgets/shellEntry.js';
import { CheckBox } from '../../shared/widgets/checkBox.js';
import { ModalDialog, type ButtonInfo } from '../../shared/dialogs/modalDialog.js';
import { Spinner } from '../../shared/widgets/animation.js';
import { wiggle } from '../../core/runtime/animationUtils.js';

const WORK_SPINNER_ICON_SIZE = 16;
const REMEMBER_MOUNT_PASSWORD_KEY = 'remember-mount-password';

export namespace MountPasswordDialog {
  export interface Signals extends ModalDialog.Signals {
    'response': (choice: number, password: string, remember: boolean, hiddenVolume: boolean, systemVolume: boolean, pim: number) => void;
  }
}

interface TcryptFields {
  hiddenVolume: CheckBox;
  systemVolume: CheckBox;
  keyfiles: CheckBox;
  keyfilesLabel: St.Label;
  pimEntry: St.PasswordEntry;
}

function passwordEntry(): St.PasswordEntry {
  return new St.PasswordEntry({
    style_class: 'prompt-dialog-password-entry',
    can_focus: true,
    x_expand: true,
  });
}

function wrap(label: St.Label): St.Label {
  label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
  label.clutter_text.line_wrap = true;
  return label;
}

export class MountPasswordDialog extends ModalDialog {
  static [GObject.signals] = {
    'response': {
      param_types: [
        GObject.TYPE_INT,
        GObject.TYPE_STRING,
        GObject.TYPE_BOOLEAN,
        GObject.TYPE_BOOLEAN,
        GObject.TYPE_BOOLEAN,
        GObject.TYPE_UINT,
      ],
    },
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, MountPasswordDialog.Signals>['connect'];
  declare connect_after: GObject.SignalMethods<this, MountPasswordDialog.Signals>['connect_after'];
  declare emit: GObject.SignalMethods<this, MountPasswordDialog.Signals>['emit'];

  private readonly passwordEntry = passwordEntry();
  private readonly workSpinner = new Spinner(WORK_SPINNER_ICON_SIZE, { animate: true });
  private readonly errorMessageLabel = wrap(new St.Label({ style_class: 'prompt-dialog-error-label', visible: false }));
  private readonly tcrypt: TcryptFields | null = null;
  private readonly rememberChoice: CheckBox | null = null;
  private readonly defaultButtons: ButtonInfo[];
  private readonly usesKeyfilesButtons: ButtonInfo[];

  constructor(message: string, flags: Gio.AskPasswordFlags) {
    super({ styleClass: 'prompt-dialog' });

    const [title, description] = message.split('\n');
    const disksApp = Shell.AppSystem.get_default().lookup_app('com.lantharos.disks.desktop');

    const content = new Dialog.MessageDialogContent({
      title,
      description: description || null,
      iconName: 'channel-secure-symbolic',
    });

    const passwordFields = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'prompt-dialog-password-layout',
    });

    if (flags & Gio.AskPasswordFlags.TCRYPT) {
      this.tcrypt = {
        hiddenVolume: new CheckBox(KestrelUi.t('mount-hidden-volume')),
        systemVolume: new CheckBox(KestrelUi.t('mount-windows-system-volume')),
        keyfiles: new CheckBox(KestrelUi.t('mount-uses-keyfiles')),
        keyfilesLabel: wrap(new St.Label({ visible: false })),
        pimEntry: passwordEntry(),
      };
      const { hiddenVolume, systemVolume, keyfiles, keyfilesLabel, pimEntry } = this.tcrypt;
      content.add_child(hiddenVolume);
      content.add_child(systemVolume);

      keyfiles.connect('clicked', () => this.onKeyfilesCheckboxClicked());
      content.add_child(keyfiles);

      keyfilesLabel.clutter_text.set_markup(disksApp
        ? KestrelUi.t('mount-keyfiles-use-app', { appName: disksApp.get_name() })
        : KestrelUi.t('mount-keyfiles-need-app'));
      content.add_child(keyfilesLabel);

      pimEntry.clutter_text.connect('activate', () => this.onEntryActivate());
      ShellEntry.addContextMenu(pimEntry);

      passwordFields.add_child(new Dialog.EntryField(pimEntry, KestrelUi.t('mount-pim-number')));
    }

    this.passwordEntry.clutter_text.connect('activate', () => this.onEntryActivate());
    this.setInitialKeyFocus(this.passwordEntry);
    ShellEntry.addContextMenu(this.passwordEntry);

    passwordFields.add_child(new Dialog.EntryField(this.passwordEntry, KestrelUi.t('mount-password'), this.workSpinner));

    const warningBox = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      x_expand: true,
    });
    warningBox.add_child(new ShellEntry.CapsLockWarning());
    warningBox.add_child(this.errorMessageLabel);

    passwordFields.add_child(warningBox);
    content.add_child(passwordFields);

    if (flags & Gio.AskPasswordFlags.SAVING_SUPPORTED) {
      this.rememberChoice = new CheckBox(KestrelUi.t('mount-remember-password'));
      this.rememberChoice.checked = global.settings.get_boolean(REMEMBER_MOUNT_PASSWORD_KEY);
      content.add_child(this.rememberChoice);
    }

    this.contentLayout.add_child(content);

    const cancel: ButtonInfo = {
      label: KestrelUi.t('mount-cancel'),
      action: () => this.onCancelButton(),
      key: Clutter.KEY_Escape,
    };

    this.defaultButtons = [cancel, {
      label: KestrelUi.t('mount-unlock'),
      action: () => this.onEntryActivate(),
      default: true,
    }];

    this.usesKeyfilesButtons = [cancel];
    if (disksApp) {
      this.usesKeyfilesButtons.push({
        label: KestrelUi.t('mount-open-app', { appName: disksApp.get_name() }),
        action: () => {
          disksApp.activate();
          this.onCancelButton();
        },
        default: true,
      });
    }

    this.setButtons(this.defaultButtons);
  }

  reaskPassword(): void {
    this.workSpinner.stop();
    this.passwordEntry.set_text('');
    this.errorMessageLabel.text = KestrelUi.t('mount-wrong-password');
    this.errorMessageLabel.show();

    void wiggle(this.passwordEntry);
  }

  private onCancelButton(): void {
    this.emit('response', -1, '', false, false, false, 0);
  }

  private onEntryActivate(): void {
    let pim = 0;
    if (this.tcrypt) {
      const pimText = this.tcrypt.pimEntry.get_text();

      if (isNaN(Number(pimText))) {
        this.tcrypt.pimEntry.set_text('');
        this.errorMessageLabel.text = KestrelUi.t('mount-pim-invalid');
        this.errorMessageLabel.show();
        return;
      }

      this.errorMessageLabel.hide();
      pim = parseInt(pimText);
    }

    const remember = this.rememberChoice?.checked ?? false;
    global.settings.set_boolean(REMEMBER_MOUNT_PASSWORD_KEY, remember);

    this.workSpinner.play();
    this.emit('response', 1,
      this.passwordEntry.get_text(),
      remember,
      this.tcrypt?.hiddenVolume.checked ?? false,
      this.tcrypt?.systemVolume.checked ?? false,
      pim);
  }

  private onKeyfilesCheckboxClicked(): void {
    const { keyfiles, keyfilesLabel, pimEntry } = this.tcrypt!;
    const editable = !keyfiles.checked;
    for (const actor of [this.passwordEntry, pimEntry, this.rememberChoice]) actor?.set({ reactive: editable, can_focus: editable });
    keyfilesLabel.visible = !editable;
    this.setButtons(editable ? this.defaultButtons : this.usesKeyfilesButtons);
  }
}
