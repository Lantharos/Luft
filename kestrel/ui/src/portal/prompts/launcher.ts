import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import { t } from '../../shared/i18n/index.js';
import { appNames } from '../core/apps.js';
import { openDialog } from '../core/dialog.js';
import { ENDED, SUCCESS, option, type Dismissal, type Options } from '../core/request.js';

const WEB_APPLICATION = 2;

function siteOf(target: string | undefined): string | null {
  return target ? GLib.Uri.parse(target, GLib.UriFlags.NONE).get_host() : null;
}

export async function addLauncher(dismissal: Dismissal, appId: string, name: string, icon: GLib.Variant, options: Options): Promise<[number, string]> {
  const gicon = Gio.Icon.deserialize(icon);
  if (!gicon) return [ENDED, ''];
  const site = option<number>(options, 'launcher_type') === WEB_APPLICATION ? siteOf(option<string>(options, 'target')) : null;
  let chosenName = '';
  const [response] = await openDialog(dismissal, {
    title: site ? t('portal-launcher-website-title') : t('portal-launcher-title'),
    description: site ? t('portal-launcher-website-description', { site }) : t('portal-launcher-description', { appName: appNames(appId).subject }),
    icon: 'list-add-symbolic',
    askedBy: appId,
  }, dialog => {
    const editable = option<boolean>(options, 'editable_name') ?? true;
    const entry = new St.Entry({ text: name, can_focus: editable, x_expand: true });
    entry.clutter_text.editable = editable;
    const label = new St.Label({ text: t('portal-launcher-name'), style_class: 'kestrel-entry-label' });
    entry.label_actor = label;
    const field = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-entry-field', x_expand: true });
    field.add_child(label);
    field.add_child(entry);
    const preview = new St.BoxLayout({ style_class: 'kestrel-portal-launcher' });
    preview.add_child(new St.Icon({ gicon, style_class: 'kestrel-portal-launcher-icon', y_align: Clutter.ActorAlign.END }));
    preview.add_child(field);
    dialog.content.add_child(preview);
    const add = () => {
      chosenName = entry.text.trim();
      if (chosenName) dialog.finish(SUCCESS);
    };
    const [, addButton] = dialog.buttons([
      { label: t('portal-cancel'), action: dialog.cancel },
      { label: t('portal-launcher-add'), action: add, default: true },
    ]);
    entry.clutter_text.connect('text-changed', () => { addButton.reactive = addButton.can_focus = !!entry.text.trim(); });
    entry.clutter_text.connect('activate', add);
    if (editable) dialog.modal.setInitialKeyFocus(entry);
  });
  return [response, chosenName];
}
