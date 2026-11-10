import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';

import { appIcon } from '../../../appearance/icons/appIcons.js';
import { MessageDialogContent } from '../../../shared/dialogs/dialog.js';
import { ModalDialog } from '../../../shared/dialogs/modalDialog.js';
import { t } from '../../../shared/i18n/index.js';

export type Kind = 'app' | 'program';

export interface Listener {
  kind: Kind;
  id: string;
}

const ICON_SIZE = 44;
const PROGRAM_ICON = 'utilities-terminal-symbolic';

export const listenerKey = ({ kind, id }: Listener) => `${kind} ${id}`;

export function openAppDialog(listener: Listener, answer: (allowed: boolean) => void): ModalDialog | null {
  const app = listener.kind === 'app' ? Shell.AppSystem.get_default().lookup_app(`${listener.id}.desktop`) : null;
  const name = app?.get_name() ?? listener.id;
  const modal = new ModalDialog({ styleClass: 'access-dialog kestrel-firewall-dialog', prompt: true });
  const content = new MessageDialogContent({
    title: t('firewall-app-title', { app: name }),
    description: t('firewall-app-body', { app: name }),
  });
  if (app) content.insert_child_at_index(appIcon(app, ICON_SIZE, { style_class: 'kestrel-dialog-app-icon', x_align: Clutter.ActorAlign.START }), 0);
  else content.iconName = PROGRAM_ICON;
  modal.contentLayout.add_child(content);
  const respond = (allowed: boolean) => {
    answer(allowed);
    modal.close();
  };
  modal.addButton({ label: t('firewall-app-deny'), action: () => respond(false), default: true });
  modal.addButton({ label: t('firewall-app-allow'), action: () => respond(true) });
  if (modal.open()) return modal;
  modal.destroy();
  return null;
}
