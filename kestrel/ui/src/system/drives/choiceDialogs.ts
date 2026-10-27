import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Dialog from '../../shared/dialogs/dialog.js';
import * as KestrelUi from '../../kestrelUi.js';
import { ModalDialog } from '../../shared/dialogs/modalDialog.js';

const LIST_ITEM_ICON_SIZE = 48;

namespace ChoiceDialog {
  export interface Signals extends ModalDialog.Signals {
    'response': (choice: number) => void;
  }
}

function closeOnEscape(dialogClass: unknown): void {
  (dialogClass as typeof St.Widget).get_binding_pool().install_closure('close', Clutter.KEY_Escape, Clutter.ModifierType.RELEASE_MASK,
    ((dialog: ChoiceDialog) => {
      dialog.emit('response', -1);
      return Clutter.EVENT_STOP;
    }) as unknown as GObject.Closure);
}

class ChoiceDialog extends ModalDialog {
  static [GObject.signals] = {
    'response': { param_types: [GObject.TYPE_INT] },
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, ChoiceDialog.Signals>['connect'];
  declare connect_after: GObject.SignalMethods<this, ChoiceDialog.Signals>['connect_after'];
  declare emit: GObject.SignalMethods<this, ChoiceDialog.Signals>['emit'];

  private readonly messageContent = new Dialog.MessageDialogContent({ iconName: 'drive-harddisk-symbolic' });
  private oldChoices: string[] = [];

  constructor(styleClass: string) {
    super({ styleClass });
    this.contentLayout.add_child(this.messageContent);
  }

  protected updateChoices(message: string, choices: string[]): void {
    const [title, ...description] = message.split('\n');
    this.messageContent.title = title;
    this.messageContent.description = description.join('\n');

    if (this.oldChoices.length !== choices.length || choices.some((choice, index) => this.oldChoices[index] !== choice))
      this.setButtons(choices.map((label, choice) => ({ label, action: () => this.emit('response', choice) })).reverse());
    this.oldChoices = choices;
  }
}

export class MountQuestionDialog extends ChoiceDialog {
  static {
    GObject.registerClass(this);
    closeOnEscape(this);
  }

  constructor() {
    super('mount-question-dialog');
  }

  update(message: string, choices: string[]): void {
    this.updateChoices(message, choices);
  }
}

export class MountProcessesDialog extends ChoiceDialog {
  static {
    GObject.registerClass(this);
    closeOnEscape(this);
  }

  private readonly applicationSection = new Dialog.ListSection();

  constructor() {
    super('processes-dialog');
    this.applicationSection.hide();
    this.contentLayout.add_child(this.applicationSection);
  }

  private setAppsForPids(pids: number[]): void {
    this.applicationSection.list.destroy_all_children();

    const tracker = Shell.WindowTracker.get_default();
    for (const pid of pids) {
      const app = tracker.get_app_from_pid(pid);
      if (!app) continue;

      this.applicationSection.list.add_child(new Dialog.ListSectionItem({
        icon_actor: KestrelUi.appIcon(app, LIST_ITEM_ICON_SIZE),
        title: app.get_name(),
      }));
    }

    this.applicationSection.visible = this.applicationSection.list.get_n_children() > 0;
  }

  update(message: string, processes: number[], choices: string[]): void {
    this.setAppsForPids(processes);
    this.updateChoices(message, choices);
  }
}
