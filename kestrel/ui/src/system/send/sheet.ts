import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import { appIcon } from '../../appearance/icons/appIcons.js';
import { openDialog, type PortalDialog } from '../../portal/core/dialog.js';
import { SUCCESS } from '../../portal/core/request.js';
import { list, row } from '../../portal/core/rows.js';
import { t } from '../../shared/i18n/index.js';
import { deviceIcon } from '../post/format.js';
import { currentPost, type Post } from '../post/post.js';
import type { Received } from './received.js';
import { receivingApps } from './targets.js';

const ICON = 'document-send-symbolic';
const LOOK_AGAIN_ICON = 'view-refresh-symbolic';
const DISABLED_OPACITY = 140;

interface Sheet {
  readonly dialog: PortalDialog;
  readonly files: Received[];
  readonly apps: Gio.AppInfo[];
  readonly sections: St.BoxLayout;
}

function heading(files: Received[]): { title: string; description: string } {
  return {
    title: files.length === 1 ? t('send-sheet-title-one', { name: files[0].name }) : t('send-sheet-title', { count: files.length }),
    description: t('send-sheet-description', { count: files.length }),
  };
}

function section(title: string, children: St.Widget[]): St.Widget {
  const box = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-send-section', x_expand: true });
  box.add_child(new St.Label({ text: title, style_class: 'kestrel-portal-label' }));
  for (const child of children) box.add_child(child);
  return box;
}

function still(button: St.Button): St.Button {
  button.reactive = button.can_focus = false;
  button.opacity = DISABLED_OPACITY;
  return button;
}

function note(text: string): St.Label {
  const label = new St.Label({ text, style_class: 'kestrel-portal-note kestrel-send-note', x_expand: true });
  label.clutter_text.line_wrap = true;
  return label;
}

/** The devices Post found nearby, or why there are none, and a way to look again. */
function devices(sheet: Sheet, post: Post): St.Widget {
  const { client } = post;
  const rows = client.devices.map(peer => {
    const button = row({ icon: deviceIcon(peer), title: peer.alias, subtitle: peer.model || undefined });
    button.name = `post:${peer.id}`;
    button.connect('clicked', () => {
      client.send(peer.id, sheet.files.map(file => file.path));
      sheet.dialog.finish(SUCCESS);
    });
    return button;
  });
  if (!rows.length) rows.push(still(row({ title: t(client.scanning ? 'post-looking' : 'post-nobody') })));
  const again = row({ icon: LOOK_AGAIN_ICON, title: t('post-look-again') });
  again.name = 'post:look-again';
  again.connect('clicked', () => client.scan());
  rows.push(client.scanning ? still(again) : again);
  const notes = [
    ...client.devices.length ? [] : [note(t('post-nobody-hint'))],
    ...client.open && post.network.public ? [note(t('post-public-network'))] : [],
  ];
  return section(t('post-devices-nearby'), [list(rows), ...notes]);
}

function appRow(sheet: Sheet, app: Gio.AppInfo): St.Button {
  const button = row({ icon: appIcon(app, 28, { style_class: 'kestrel-portal-row-icon' }), title: app.get_name() });
  button.name = `app:${app.get_id()}`;
  button.connect('clicked', () => {
    app.launch(sheet.files.map(file => Gio.File.new_for_path(file.path)), global.create_app_launch_context(0, -1));
    sheet.dialog.finish(SUCCESS);
  });
  return button;
}

/** Lays the sheet out again as devices come and go, keeping the focus on the row it was on. */
function fill(sheet: Sheet, post: Post | null): void {
  const focused = global.stage.key_focus;
  const kept = focused && sheet.sections.contains(focused) ? focused.name : null;
  sheet.sections.destroy_all_children();
  if (post) sheet.sections.add_child(devices(sheet, post));
  if (sheet.apps.length) sheet.sections.add_child(section(t('send-sheet-apps'), [list(sheet.apps.map(app => appRow(sheet, app)))]));
  const again = kept && findNamed(sheet.sections, kept);
  if (again) again.grab_key_focus();
}

function findNamed(root: Clutter.Actor, name: string): Clutter.Actor | null {
  for (const child of root.get_children()) {
    if (child.name === name && child.reactive) return child;
    const found = findNamed(child, name);
    if (found) return found;
  }
  return null;
}

let showing = false;

export const sendSheetOpen = (): boolean => showing;

/** Asks where files go: a device nearby through Post, or an app that opens them. */
export async function openSendSheet(files: Received[], from: Shell.App | null): Promise<void> {
  const post = currentPost();
  let unwatch = () => {};
  showing = true;
  try {
    await openDialog(null, { ...heading(files), icon: ICON, styleClass: 'kestrel-send-sheet' }, dialog => {
      const sections = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-send-sections', x_expand: true });
      const sheet: Sheet = { dialog, files, apps: receivingApps(files, from), sections };
      dialog.content.add_child(new St.ScrollView({
        child: sections, style_class: 'kestrel-portal-scroll', hscrollbar_policy: St.PolicyType.NEVER,
        vscrollbar_policy: St.PolicyType.AUTOMATIC, overlay_scrollbars: true,
      }));
      if (post) unwatch = post.client.onChanged(() => fill(sheet, post));
      fill(sheet, post);
      post?.client.scan();
      dialog.buttons([{ label: t('portal-cancel'), action: dialog.cancel }]);
    });
  } finally {
    showing = false;
    unwatch();
  }
}
