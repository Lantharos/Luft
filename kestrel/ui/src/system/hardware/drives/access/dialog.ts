import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';

import { appIcon } from '../../../../appearance/icons/appIcons.js';
import { MessageDialogContent } from '../../../../shared/dialogs/dialog.js';
import { ModalDialog } from '../../../../shared/dialogs/modalDialog.js';
import { t } from '../../../../shared/i18n/index.js';
import type { MountedDrive } from './mounted.js';

const ICON_SIZE = 44;

/**
 * Asks whether an app may use a drive, naming both the way the asker can't
 * choose. Don't allow is what Enter picks.
 */
export function openDriveDialog(name: string, app: Shell.App | null, drive: MountedDrive, answer: (allowed: boolean) => void): ModalDialog | null {
  const size = GLib.format_size(drive.size);
  const modal = new ModalDialog({ styleClass: 'access-dialog kestrel-drive-access-dialog', prompt: true });
  const content = new MessageDialogContent({
    title: drive.label ? t('drive-access-title', { app: name, drive: drive.label }) : t('drive-access-title-unnamed', { app: name }),
    description: t('drive-access-body', { app: name, size }),
  });
  if (app) content.insert_child_at_index(appIcon(app, ICON_SIZE, { style_class: 'kestrel-dialog-app-icon', x_align: Clutter.ActorAlign.START }), 0);
  else content.iconName = 'drive-harddisk-symbolic';
  modal.contentLayout.add_child(content);
  const respond = (allowed: boolean) => {
    answer(allowed);
    modal.close();
  };
  modal.addButton({ label: t('drive-access-deny'), action: () => respond(false), default: true });
  modal.addButton({ label: t('drive-access-allow'), action: () => respond(true) });
  if (modal.open()) return modal;
  modal.destroy();
  return null;
}
