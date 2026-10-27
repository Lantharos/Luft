import type St from 'gi://St';

import { t } from '../../../shared/i18n/index.js';
import { openDialog, type PortalDialog } from '../../core/dialog.js';
import { requested, SUCCESS } from '../../core/request.js';
import { list, row } from '../../core/rows.js';
import { KEYBOARD, POINTER, TOUCHSCREEN } from '../mutter.js';
import { PERSIST_UNTIL_REVOKED } from '../restore.js';
import type { Selection, Source } from '../sources.js';
import { appNames } from '../../core/apps.js';
import { clipboardRow, group, rememberRow } from './choices.js';
import { sourceList } from './sourceList.js';

const DEVICES = [
  { type: KEYBOARD, icon: 'input-keyboard-symbolic', title: 'screen-share-device-keyboard' },
  { type: POINTER, icon: 'input-mouse-symbolic', title: 'screen-share-device-pointer' },
  { type: TOUCHSCREEN, icon: 'tablet-symbolic', title: 'screen-share-device-touchscreen' },
];

interface ControlRequest {
  readonly devices: number;
  readonly selection: Selection | null;
  readonly clipboard: boolean;
  readonly persistMode: number;
}

export interface ControlChoice {
  readonly devices: number;
  readonly sources: Source[] | null;
  readonly clipboard: boolean;
  readonly remember: boolean;
}

export async function chooseControl(handle: string, appId: string, request: ControlRequest,
  opened: (dialog: PortalDialog) => void): Promise<[number, ControlChoice | null]> {
  const app = appNames(appId);
  let choice: ControlChoice | null = null;
  const [response] = await openDialog(requested(handle), {
    title: t('screen-share-remote-desktop-title', { appName: app.object }),
    description: request.selection
      ? t('screen-share-remote-desktop-with-screen', { appName: app.subject })
      : t('screen-share-remote-desktop-description', { appName: app.subject }),
    icon: 'preferences-desktop-remote-desktop-symbolic',
    askedBy: appId,
    styleClass: 'kestrel-portal-sharing',
  }, dialog => {
    opened(dialog);
    const devices = DEVICES.filter(device => request.devices & device.type)
      .map(device => ({ type: device.type, button: row({ icon: device.icon, title: t(device.title), checked: true }) }));
    if (devices.length) dialog.content.add_child(group(t('screen-share-devices'), devices.map(device => device.button)));
    const sources = request.selection ? sourceList(request.selection, count => { allow.reactive = count > 0; }, true) : null;
    if (sources) dialog.content.add_child(sources.actor);
    const extras: St.Button[] = [];
    const clipboard = request.clipboard ? clipboardRow() : null;
    if (clipboard) extras.push(clipboard);
    const remember = request.persistMode === PERSIST_UNTIL_REVOKED ? rememberRow(app.subject) : null;
    if (remember) extras.push(remember);
    if (extras.length) dialog.content.add_child(list(extras));
    const [, allow] = dialog.buttons([
      { label: t('portal-cancel'), action: dialog.cancel },
      { label: t('portal-allow'), default: true, action: () => {
        choice = {
          devices: devices.filter(device => device.button.checked).reduce((mask, device) => mask | device.type, 0),
          sources: sources?.selected() ?? null,
          clipboard: clipboard?.checked ?? false,
          remember: remember?.checked ?? true,
        };
        dialog.finish(SUCCESS);
      } },
    ]);
    allow.reactive = !sources || sources.selected().length > 0;
  });
  return [response, choice];
}
