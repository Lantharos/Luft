import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { MessageDialogContent } from '../../shared/dialogs/dialog.js';
import { ModalDialog, type ButtonInfo } from '../../shared/dialogs/modalDialog.js';
import { promptAppeared } from '../../system/sounds/sounds.js';
import { CANCELLED, ENDED, type Dismissal, type Options, type Outcome } from './request.js';

interface DialogSpec {
  title: string;
  description?: string;
  icon: string;
  styleClass?: string;
  askedBy?: string;
}

export interface PortalDialog {
  readonly modal: ModalDialog;
  readonly content: St.BoxLayout;
  finish(response: number, results?: Options): void;
  cancel(): void;
  buttons(buttons: ButtonInfo[]): St.Button[];
}

export function openDialog(dismissal: Dismissal | null, spec: DialogSpec, build: (dialog: PortalDialog) => void): Promise<Outcome> {
  return new Promise(resolve => {
    const modal = new ModalDialog({ styleClass: `kestrel-portal-dialog ${spec.styleClass ?? ''}` });
    const content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-content', x_expand: true });
    modal.contentLayout.add_child(new MessageDialogContent({ title: spec.title, icon_name: spec.icon, ...spec.description && { description: spec.description } }));
    modal.contentLayout.add_child(content);

    let outcome: Outcome = [CANCELLED, {}];
    const finish = (response: number, results: Options = {}) => {
      outcome = [response, results];
      modal.close();
    };
    const stopListening = dismissal?.(() => finish(ENDED));
    build({
      modal,
      content,
      finish,
      cancel: () => finish(CANCELLED),
      buttons: buttons => {
        modal.clearButtons();
        return buttons.map((button, index) => modal.addButton({ key: index === 0 && !button.default ? Clutter.KEY_Escape : undefined, ...button }));
      },
    });
    modal.connect('closed', () => {
      stopListening?.();
      resolve(outcome);
    });
    if (!modal.open()) {
      stopListening?.();
      modal.destroy();
      resolve([ENDED, {}]);
    } else if (spec.askedBy !== undefined) {
      promptAppeared(spec.askedBy);
    }
  });
}
