import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type St from 'gi://St';

import { appIcon } from '../../appearance/icons/appIcons.js';
import { t } from '../../shared/i18n/index.js';
import { openDialog, type PortalDialog } from '../core/dialog.js';
import { CANCELLED, SUCCESS, option, type Dismissal, type Options } from '../core/request.js';
import { choose, list, row } from '../core/rows.js';

const STORE = 'com.lantharos.schelf.desktop';
const SCROLL_AFTER = 6;

interface Chooser {
  dialog: PortalDialog;
  lastChoice: string | null;
  picked: string | null;
  chosen: string | null;
  contentType: string | null;
}

function installed(choices: string[]): GioUnix.DesktopAppInfo[] {
  return choices.map(id => GioUnix.DesktopAppInfo.new(`${id}.desktop`)).filter((info): info is GioUnix.DesktopAppInfo => !!info);
}

function appId(info: Gio.AppInfo): string {
  return info.get_id()!.replace(/\.desktop$/, '');
}

function heading(location: string | undefined, contentType: string | null): { title: string; description: string } {
  const kind = contentType ? Gio.content_type_get_description(contentType) : null;
  if (location) {
    const name = GLib.path_get_basename(GLib.uri_unescape_string(location, null) ?? location);
    return {
      title: t('portal-app-chooser-open-title', { name }),
      description: kind ? t('portal-app-chooser-open-kind', { kind }) : t('portal-app-chooser-open-description'),
    };
  }
  return { title: t('portal-app-chooser-title'), description: kind ? t('portal-app-chooser-kind', { kind }) : t('portal-app-chooser-description') };
}

function findInStore(store: GioUnix.DesktopAppInfo, contentType: string | null): void {
  const query = contentType ? Gio.content_type_get_description(contentType) : '';
  store.launch_uris([`schelf:search?${GLib.uri_escape_string(query, null, false)}`], global.create_app_launch_context(0, -1));
}

function nothingInstalled(): St.Widget {
  const notice = row({ title: t('portal-app-chooser-nothing-installed') });
  notice.reactive = notice.can_focus = false;
  return notice;
}

function fill(chooser: Chooser, apps: GioUnix.DesktopAppInfo[]): void {
  const { dialog, lastChoice, contentType } = chooser;
  apps.sort((a, b) => Number(appId(b) === lastChoice) - Number(appId(a) === lastChoice) || a.get_name().localeCompare(b.get_name()));
  chooser.chosen = [chooser.picked, lastChoice].find(id => apps.some(app => appId(app) === id)) ?? (apps[0] ? appId(apps[0]) : null);
  const confirm = () => dialog.finish(SUCCESS);
  const rows = apps.map(app => row({ icon: appIcon(app, 28, { style_class: 'kestrel-portal-row-icon' }), title: app.get_name(), checked: appId(app) === chooser.chosen }));
  choose(rows, index => {
    if (appId(apps[index]) === chooser.chosen) confirm();
    chooser.chosen = chooser.picked = appId(apps[index]);
  });
  dialog.content.destroy_all_children();
  dialog.content.add_child(apps.length ? list(rows, rows.length > SCROLL_AFTER) : nothingInstalled());
  const store = GioUnix.DesktopAppInfo.new(STORE);
  dialog.buttons([
    { label: t('portal-cancel'), action: dialog.cancel },
    ...store ? [{ label: t('portal-app-chooser-find'), action: () => { findInStore(store, contentType); dialog.finish(CANCELLED); } }] : [],
    { label: t('portal-app-chooser-open'), action: confirm, default: true, reactive: !!chooser.chosen },
  ]);
  const selected = rows.find(button => button.checked);
  if (selected) dialog.modal.setInitialKeyFocus(selected);
}

export class AppChoosers {
  private readonly open = new Map<string, Chooser>();

  async choose(handle: string, dismissal: Dismissal, choices: string[], options: Options): Promise<[number, string]> {
    const contentType = option<string>(options, 'content_type') || null;
    const location = option<string>(options, 'filename') || option<string>(options, 'uri');
    const [response] = await openDialog(dismissal, { ...heading(location, contentType), icon: 'application-x-executable-symbolic' }, dialog => {
      const chooser: Chooser = { dialog, lastChoice: option<string>(options, 'last_choice') || null, picked: null, chosen: null, contentType };
      this.open.set(handle, chooser);
      fill(chooser, installed(choices));
    });
    const chosen = this.open.get(handle)?.chosen ?? '';
    this.open.delete(handle);
    return [response, response === SUCCESS ? chosen : ''];
  }

  update(handle: string, choices: string[]): void {
    const chooser = this.open.get(handle);
    if (chooser) fill(chooser, installed(choices));
  }
}
