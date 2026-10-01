import Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { ButtonInfo, ModalDialog } from 'resource:///org/gnome/shell/ui/modalDialog.js';
import { CANCELLED, ENDED, PortalRequest, type Options, type Outcome } from './request.js';

export interface DialogSpec {
  title: string;
  description?: string;
  icon: string;
  styleClass?: string;
}

export interface PortalDialog {
  readonly modal: ModalDialog;
  readonly content: St.BoxLayout;
  finish(response: number, results?: Options): void;
  cancel(): void;
  buttons(buttons: ButtonInfo[]): St.Button[];
}

export async function openDialog(handle: string, spec: DialogSpec, build: (dialog: PortalDialog) => void): Promise<Outcome> {
  const [{ MessageDialogContent }, { ModalDialog }] = await Promise.all([
    import('resource:///org/gnome/shell/ui/dialog.js'),
    import('resource:///org/gnome/shell/ui/modalDialog.js'),
  ]);
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
    const request = new PortalRequest(handle, () => finish(ENDED));
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
      request.finish();
      resolve(outcome);
    });
    if (!modal.open()) {
      request.finish();
      modal.destroy();
      resolve([ENDED, {}]);
    }
  });
}
