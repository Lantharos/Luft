import Clutter from 'gi://Clutter';
import type GLib from 'gi://GLib';
import St from 'gi://St';

import { createThumbnail } from '../../surfaces/clipboard/thumbnail.js';
import { t } from '../../shared/i18n/index.js';
import { appNames } from '../core/apps.js';
import { openDialog } from '../core/dialog.js';
import { ENDED, SUCCESS, type Dismissal } from '../core/request.js';

const PREVIEW_BOUNDS = { width: 392, height: 245, radius: 14 };

export async function confirmWallpaper(dismissal: Dismissal, appId: string, image: GLib.Bytes): Promise<number> {
  const preview = await createThumbnail(image, PREVIEW_BOUNDS);
  if (!preview) return ENDED;
  const [response] = await openDialog(dismissal, {
    title: t('portal-wallpaper-title'),
    description: t('portal-wallpaper-description', { appName: appNames(appId).subject }),
    icon: 'preferences-desktop-wallpaper-symbolic',
    askedBy: appId,
  }, dialog => {
    dialog.content.add_child(new St.Widget({ content: preview.content, width: preview.width, height: preview.height, x_align: Clutter.ActorAlign.CENTER }));
    dialog.buttons([
      { label: t('portal-cancel'), action: dialog.cancel },
      { label: t('portal-wallpaper-set'), action: () => dialog.finish(SUCCESS), default: true },
    ]);
  });
  return response;
}
