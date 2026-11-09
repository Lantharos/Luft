import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import { appIcon } from '../../appearance/icons/appIcons.js';
import type { FileActionChoiceShape, FileActionEntry } from '../../extensions/fileActions/actions.js';
import { fileActions } from '../../extensions/fileActions/actions.js';
import { openDialog, type PortalDialog } from '../../portal/core/dialog.js';
import { SUCCESS } from '../../portal/core/request.js';
import { list, row } from '../../portal/core/rows.js';
import { t } from '../../shared/i18n/index.js';
import type { Received } from './received.js';
import { receivingApps, sendingActions } from './targets.js';

const ICON = 'document-send-symbolic';
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

function section(title: string, rows: St.Widget[]): St.Widget {
  const box = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-send-section', x_expand: true });
  box.add_child(new St.Label({ text: title, style_class: 'kestrel-portal-label' }));
  box.add_child(list(rows));
  return box;
}

function choiceRow(sheet: Sheet, entry: FileActionEntry, choice: FileActionChoiceShape): St.Button {
  const button = row({ title: choice.label, ...choice.icon && { icon: new Gio.FileIcon({ file: Gio.File.new_for_path(choice.icon) }) } });
  button.name = `${entry.id}:${choice.key}`;
  if (choice.disabled) {
    button.reactive = button.can_focus = false;
    button.opacity = DISABLED_OPACITY;
    return button;
  }
  button.connect('clicked', () => {
    entry.activate(sheet.files.map(file => file.path), choice.key);
    if (!choice.keepsMenuOpen) sheet.dialog.finish(SUCCESS);
  });
  return button;
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

function nothing(): St.Widget {
  const notice = row({ title: t('send-sheet-nothing') });
  notice.reactive = notice.can_focus = false;
  return list([notice]);
}

/** Lays the sheet out again as devices come and go, keeping the focus on the row it was on. */
function fill(sheet: Sheet): void {
  const focused = global.stage.key_focus;
  const kept = focused && sheet.sections.contains(focused) ? focused.name : null;
  sheet.sections.destroy_all_children();
  const actions = sendingActions(sheet.files);
  const plain = actions.filter(({ shape }) => !shape.items).map(({ entry, shape }) =>
    choiceRow(sheet, entry, { key: '', label: shape.label, icon: shape.icon, disabled: false, keepsMenuOpen: false, separator: false }));
  if (plain.length) sheet.sections.add_child(list(plain));
  for (const { entry, shape } of actions) {
    if (shape.items) sheet.sections.add_child(section(shape.label, shape.items.filter(choice => !choice.separator).map(choice => choiceRow(sheet, entry, choice))));
  }
  if (sheet.apps.length) sheet.sections.add_child(section(t('send-sheet-apps'), sheet.apps.map(app => appRow(sheet, app))));
  if (!sheet.sections.get_n_children()) sheet.sections.add_child(nothing());
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

/** Asks where files an app handed over go: the devices and other destinations extensions offer, and apps that open them. */
export async function openSendSheet(files: Received[], from: Shell.App | null): Promise<void> {
  const unwatched: (() => void)[] = [];
  await openDialog(null, { ...heading(files), icon: ICON, styleClass: 'kestrel-send-sheet' }, dialog => {
    const sections = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-send-sections', x_expand: true });
    const sheet: Sheet = { dialog, files, apps: receivingApps(files, from), sections };
    dialog.content.add_child(new St.ScrollView({
      child: sections, style_class: 'kestrel-portal-scroll', hscrollbar_policy: St.PolicyType.NEVER,
      vscrollbar_policy: St.PolicyType.AUTOMATIC, overlay_scrollbars: true,
    }));
    const refill = () => fill(sheet);
    const follow = (entry: FileActionEntry) => unwatched.push(entry.watch(refill));
    for (const entry of fileActions.items) follow(entry);
    unwatched.push(fileActions.watch((entry, added) => {
      if (added) follow(entry);
      refill();
    }));
    fill(sheet);
    for (const { entry } of sendingActions(files)) entry.opened();
    dialog.buttons([{ label: t('portal-cancel'), action: dialog.cancel }]);
  });
  for (const unwatch of unwatched) unwatch();
}
