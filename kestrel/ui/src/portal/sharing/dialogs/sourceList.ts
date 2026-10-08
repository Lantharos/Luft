import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import { windowIcon } from '../../../appearance/icons/appIcons.js';
import { choose, list, row, type RowSpec } from '../../core/rows.js';
import { MONITOR, VIRTUAL, WINDOW, monitorSources, windowSources, type MonitorSource, type Selection, type Source, type WindowSource } from '../sources.js';

const THUMBNAIL_WIDTH = 64;
const THUMBNAIL_HEIGHT = 40;

interface SourceList {
  readonly actor: St.Widget;
  readonly selected: () => Source[];
}

function thumbnailBox(): St.Widget {
  const { scale_factor } = St.ThemeContext.get_for_stage((global as unknown as Shell.Global).stage);
  return new St.Widget({
    style_class: 'kestrel-portal-thumbnail', layout_manager: new Clutter.BinLayout(), clip_to_allocation: true,
    width: THUMBNAIL_WIDTH * scale_factor, height: THUMBNAIL_HEIGHT * scale_factor, y_align: Clutter.ActorAlign.CENTER,
  });
}

function symbolicThumbnail(iconName: string): St.Widget {
  const box = thumbnailBox();
  box.add_child(new St.Icon({ icon_name: iconName, style_class: 'kestrel-portal-thumbnail-icon', x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER }));
  return box;
}

function windowThumbnail({ window, app }: WindowSource): St.Widget {
  const box = thumbnailBox();
  const source = window.get_compositor_private() as Meta.WindowActor | null;
  if (source?.width && source.height) {
    const scale = Math.min(box.width / source.width, box.height / source.height);
    box.add_child(new Clutter.Clone({ source, width: source.width * scale, height: source.height * scale, x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER }));
  }
  const icon = app ? windowIcon(app, window, 18) : new St.Icon({ icon_name: 'application-x-executable-symbolic', icon_size: 18 });
  icon.x_align = Clutter.ActorAlign.END;
  icon.y_align = Clutter.ActorAlign.END;
  box.add_child(icon);
  return box;
}

function monitorRows(monitors: MonitorSource[]): [Source, RowSpec][] {
  const several = monitors.length > 1;
  return monitors.map(monitor => [monitor, {
    icon: symbolicThumbnail(monitor.builtin ? 'computer-symbolic' : 'video-display-symbolic'),
    title: monitor.name,
    subtitle: `${monitor.width} × ${monitor.height}${monitor.primary && several ? ' · Main screen' : ''}`,
  }]);
}

function windowRows(): [Source, RowSpec][] {
  return windowSources().map(source => {
    const appName = source.app?.get_name() ?? '';
    return [source, { icon: windowThumbnail(source), title: source.window.get_title() || appName, subtitle: appName }];
  });
}

function section(title: string | null, rows: St.Button[]): St.Widget {
  const box = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-field', x_expand: true });
  if (title) box.add_child(new St.Label({ text: title, style_class: 'kestrel-portal-label' }));
  box.add_child(list(rows));
  return box;
}

export function sourceList({ types, multiple }: Selection, changed: (count: number) => void, alwaysLabelled = false): SourceList {
  const screens = types & MONITOR ? monitorRows(monitorSources()) : [];
  if (types & VIRTUAL) screens.push([{ type: VIRTUAL }, { icon: symbolicThumbnail('list-add-symbolic'), title: 'New virtual screen', subtitle: 'An extra screen just for sharing' }]);
  const windows = types & WINDOW ? windowRows() : [];
  const labelled = alwaysLabelled || (screens.length > 0 && windows.length > 0);

  const entries = [...screens, ...windows].map(([source, spec]) => ({ source, button: row({ ...spec, checked: false }) }));
  const selected = () => entries.filter(entry => entry.button.checked).map(entry => entry.source);
  const buttons = entries.map(entry => entry.button);
  if (buttons.length === 1) buttons[0].checked = true;
  if (!multiple) choose(buttons, () => {});
  for (const button of buttons) button.connect('notify::checked', () => changed(selected().length));

  const sections = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-sources', x_expand: true });
  if (screens.length) sections.add_child(section(labelled ? 'Screens' : null, buttons.slice(0, screens.length)));
  if (windows.length) sections.add_child(section(labelled ? 'Windows' : null, buttons.slice(screens.length)));
  if (!entries.length) sections.add_child(new St.Label({ text: 'There are no open windows to share.', style_class: 'kestrel-portal-note' }));
  const actor = new St.ScrollView({ child: sections, style_class: 'kestrel-portal-scroll', hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.AUTOMATIC, overlay_scrollbars: true });
  return { actor, selected };
}
