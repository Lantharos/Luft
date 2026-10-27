import type St from 'gi://St';

import { t } from '../../../shared/i18n/index.js';
import { openDialog, type PortalDialog } from '../../core/dialog.js';
import { requested, SUCCESS } from '../../core/request.js';
import { list } from '../../core/rows.js';
import { PERSIST_UNTIL_REVOKED } from '../restore.js';
import { appNames } from '../../core/apps.js';
import { clipboardRow, rememberRow } from './choices.js';

export interface CaptureChoice {
  readonly clipboard: boolean;
  readonly remember: boolean;
}

export async function chooseCapture(handle: string, appId: string, clipboardRequested: boolean, persistMode: number,
  opened: (dialog: PortalDialog) => void): Promise<[number, CaptureChoice | null]> {
  const app = appNames(appId);
  let choice: CaptureChoice | null = null;
  const [response] = await openDialog(requested(handle), {
    title: t('screen-share-input-capture-title', { appName: app.object }),
    description: t('screen-share-input-capture-description', { appName: app.object }),
    icon: 'input-mouse-symbolic',
    askedBy: appId,
  }, dialog => {
    opened(dialog);
    const extras: St.Button[] = [];
    const clipboard = clipboardRequested ? clipboardRow() : null;
    if (clipboard) extras.push(clipboard);
    const remember = persistMode === PERSIST_UNTIL_REVOKED ? rememberRow(app.subject) : null;
    if (remember) extras.push(remember);
    if (extras.length) dialog.content.add_child(list(extras));
    else dialog.content.hide();
    dialog.buttons([
      { label: t('portal-cancel'), action: dialog.cancel },
      { label: t('portal-allow'), default: true, action: () => {
        choice = { clipboard: clipboard?.checked ?? false, remember: remember?.checked ?? true };
        dialog.finish(SUCCESS);
      } },
    ]);
  });
  return [response, choice];
}
