import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { canonical, fromEvent, label, typesText } from './accelerators.js';
import type { AppShortcuts } from './store.js';

const NOT_SET = 'Not set';

export async function recordShortcuts(appId: string, current: AppShortcuts, unavailable: Set<string>): Promise<AppShortcuts | null> {
  const [{ MessageDialogContent }, { ModalDialog }] = await Promise.all([
    import('resource:///org/gnome/shell/ui/dialog.js'),
    import('resource:///org/gnome/shell/ui/modalDialog.js'),
  ]);
  return new Promise(resolve => {
    const edited: AppShortcuts = Object.fromEntries(Object.entries(current).map(([id, shortcut]) => [id, { ...shortcut, shortcuts: [...shortcut.shortcuts] }]));
    const app = Shell.AppSystem.get_default().lookup_app(`${appId}.desktop`);
    const dialog = new ModalDialog({ styleClass: 'kestrel-shortcuts-dialog' });
    dialog.contentLayout.add_child(new MessageDialogContent({
      title: `Shortcuts for ${app?.get_name() ?? appId}`,
      description: 'Choose a shortcut, then press the keys you want. Backspace clears it.',
      icon_name: 'preferences-desktop-keyboard-shortcuts-symbolic',
    }));
    const list = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-shortcut-list' });
    dialog.contentLayout.add_child(list);
    let recording: { id: string; key: St.Button } | null = null;
    const describe = (id: string) => edited[id].shortcuts.map(label).join(', ') || NOT_SET;

    for (const [id, shortcut] of Object.entries(edited)) {
      const row = new St.BoxLayout({ style_class: 'kestrel-shortcut-row' });
      row.add_child(new St.Label({ text: shortcut.description, x_expand: true, y_align: Clutter.ActorAlign.CENTER }));
      const key = new St.Button({ style_class: 'kestrel-shortcut-key', label: describe(id), can_focus: true });
      key.connect('clicked', () => {
        if (recording) recording.key.label = describe(recording.id);
        recording = { id, key };
        key.label = 'Press keys';
      });
      row.add_child(key);
      list.add_child(row);
    }

    dialog.connect('captured-event', (_actor, event) => {
      if (!recording || event.type() !== Clutter.EventType.KEY_PRESS) return Clutter.EVENT_PROPAGATE;
      const { id, key } = recording;
      const symbol = event.get_key_symbol();
      if (symbol === Clutter.KEY_BackSpace) edited[id].shortcuts = [];
      else if (symbol !== Clutter.KEY_Escape) {
        const accelerator = fromEvent(event);
        if (!accelerator) return Clutter.EVENT_STOP;
        const own = new Set(Object.entries(edited).filter(([other]) => other !== id).flatMap(([, entry]) => entry.shortcuts.map(canonical)));
        if (typesText(accelerator) || unavailable.has(canonical(accelerator)) || own.has(canonical(accelerator))) {
          key.label = `${label(accelerator)} is taken`;
          return Clutter.EVENT_STOP;
        }
        edited[id].shortcuts = [accelerator];
      }
      key.label = describe(id);
      recording = null;
      return Clutter.EVENT_STOP;
    });

    let result: AppShortcuts | null = null;
    dialog.setButtons([
      { label: 'Cancel', action: () => dialog.close(), key: Clutter.KEY_Escape },
      { label: 'Save', action: () => { result = edited; dialog.close(); }, default: true },
    ]);
    dialog.connect('closed', () => resolve(result));
    dialog.open();
  });
}
