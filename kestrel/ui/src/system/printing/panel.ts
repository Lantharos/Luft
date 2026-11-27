import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';
import St from 'gi://St';

import { localized, t } from '../../shared/i18n/index.js';
import { blurSurface } from '../../shared/layout/surface.js';
import { pressable } from '../../shared/motion/motion.js';
import { InkBar, ProgressBar } from './bars.js';
import type { Job, Marker } from './client.js';
import type { Problem } from './reasons.js';

const SOME_LEFT = -3;
const ICON_SIZE = 16;

export type Look = 'printing' | 'done' | 'failed';

export interface View {
  look: Look;
  title: string;
  subtitle: string;
  progress: number | null;
  caption: string;
  current: Job | null;
  problems: Problem[];
  notes: string[];
  queue: Job[];
  markers: Marker[];
  printerOf(job: Job): string;
}

interface InkRow {
  name: string;
  level: St.Label;
  bar: InkBar;
}

export interface PanelActions {
  close(): void;
  cancel(job: Job): void;
}

const LOOK_ICONS: Record<Look, string> = { printing: 'printer-symbolic', done: 'object-select-symbolic', failed: 'dialog-error-symbolic' };

function label(style: string, text = ''): St.Label {
  const shown = new St.Label({ style_class: style, text, x_expand: true, y_align: Clutter.ActorAlign.CENTER });
  shown.clutter_text.ellipsize = Pango.EllipsizeMode.END;
  return shown;
}

function iconButton(icon: string, name: string, activate: () => void): St.Button {
  const button = new St.Button({
    style_class: 'kestrel-control-more', can_focus: true, track_hover: true, accessible_name: name, y_align: Clutter.ActorAlign.CENTER,
    child: new St.Icon({ icon_name: icon, icon_size: ICON_SIZE }),
  });
  button.connect('clicked', activate);
  pressable(button);
  return button;
}

function warning(text: string, serious: boolean): St.BoxLayout {
  const row = new St.BoxLayout({ style_class: `kestrel-print-warning${serious ? ' serious' : ''}` });
  row.add_child(new St.Icon({ icon_name: 'dialog-warning-symbolic', icon_size: ICON_SIZE, y_align: Clutter.ActorAlign.START }));
  const shown = new St.Label({ style_class: 'kestrel-print-warning-text', text, x_expand: true });
  shown.clutter_text.line_wrap = true;
  row.add_child(shown);
  return row;
}

function inkLevel(marker: Marker): string {
  if (marker.level >= 0) return `${marker.level}%`;
  return t(marker.level === SOME_LEFT ? 'printing-ink-some' : 'printing-ink-unknown');
}

export class PrintPanel {
  readonly actor = new St.BoxLayout({
    name: 'kestrel-print-panel', style_class: 'kestrel-popover kestrel-print-panel', orientation: Clutter.Orientation.VERTICAL, reactive: true,
  });
  private readonly badge = new St.Icon({ style_class: 'kestrel-print-icon', icon_size: ICON_SIZE });
  private readonly title = label('kestrel-print-title');
  private readonly subtitle = label('kestrel-print-subtitle');
  private readonly progress = new ProgressBar();
  private readonly caption = label('kestrel-print-caption');
  private readonly cancel: St.Button;
  private readonly status = new St.BoxLayout({ style_class: 'kestrel-print-status' });
  private readonly warnings = new St.BoxLayout({ style_class: 'kestrel-print-warnings', orientation: Clutter.Orientation.VERTICAL });
  private readonly queue = new St.BoxLayout({ style_class: 'kestrel-print-queue', orientation: Clutter.Orientation.VERTICAL });
  private readonly ink = new St.BoxLayout({ style_class: 'kestrel-print-ink', orientation: Clutter.Orientation.VERTICAL });
  private current: Job | null = null;
  private warningsKey = '';
  private queueKey = '';
  private inkRows: InkRow[] = [];

  constructor(private readonly actions: PanelActions) {
    blurSurface(this.actor);
    const header = new St.BoxLayout({ style_class: 'kestrel-print-header' });
    const titles = new St.BoxLayout({ style_class: 'kestrel-print-titles', orientation: Clutter.Orientation.VERTICAL, x_expand: true });
    titles.add_child(this.title);
    titles.add_child(this.subtitle);
    header.add_child(new St.Bin({ style_class: 'kestrel-print-badge', child: this.badge, y_align: Clutter.ActorAlign.CENTER }));
    header.add_child(titles);
    const close = iconButton('window-close-symbolic', '', () => actions.close());
    close.name = 'kestrel-print-close';
    localized(close, () => (close.accessible_name = t('printing-close')));
    header.add_child(close);
    this.cancel = new St.Button({ style_class: 'kestrel-print-button', can_focus: true, track_hover: true, y_align: Clutter.ActorAlign.CENTER });
    localized(this.cancel, () => (this.cancel.label = t('printing-cancel')));
    this.cancel.connect('clicked', () => this.current && actions.cancel(this.current));
    pressable(this.cancel);
    this.status.add_child(this.caption);
    this.status.add_child(this.cancel);
    for (const part of [header, this.progress.actor, this.status, this.warnings, this.queue, this.ink]) this.actor.add_child(part);
  }

  show(view: View): void {
    this.current = view.current;
    this.badge.icon_name = LOOK_ICONS[view.look];
    for (const look of Object.keys(LOOK_ICONS)) this.badge.remove_style_class_name(look);
    this.badge.add_style_class_name(view.look);
    this.title.text = view.title;
    this.subtitle.text = view.subtitle;
    this.progress.actor.visible = view.look === 'printing';
    this.progress.show(view.progress);
    this.caption.text = view.caption;
    this.status.visible = view.look === 'printing';
    this.showWarnings([...view.problems.map(({ text, serious }) => [t(text), serious] as const), ...view.notes.map(note => [note, true] as const)]);
    this.showQueue(view);
    this.showInk(view.markers);
  }

  private showWarnings(warnings: (readonly [string, boolean])[]): void {
    const key = warnings.map(([text, serious]) => `${text}\n${serious}`).join('\n');
    this.warnings.visible = warnings.length > 0;
    if (key === this.warningsKey) return;
    this.warningsKey = key;
    this.warnings.destroy_all_children();
    for (const [text, serious] of warnings) this.warnings.add_child(warning(text, serious));
  }

  private showQueue(view: View): void {
    const key = view.queue.map(job => `${job.id}\n${job.name}\n${view.printerOf(job)}`).join('\n');
    this.queue.visible = view.queue.length > 0;
    if (key === this.queueKey) return;
    this.queueKey = key;
    this.queue.destroy_all_children();
    for (const job of view.queue) {
      const name = job.name || t('printing-untitled');
      const row = new St.BoxLayout({ style_class: 'kestrel-print-row' });
      const titles = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true, y_align: Clutter.ActorAlign.CENTER });
      titles.add_child(label('kestrel-print-row-title', name));
      titles.add_child(label('kestrel-print-row-subtitle', view.printerOf(job)));
      row.add_child(titles);
      row.add_child(iconButton('window-close-symbolic', t('printing-cancel-job', { name }), () => this.actions.cancel(job)));
      this.queue.add_child(row);
    }
  }

  private showInk(markers: Marker[]): void {
    this.ink.visible = markers.length > 0;
    if (markers.map(marker => marker.name).join('\n') !== this.inkRows.map(row => row.name).join('\n')) {
      this.ink.destroy_all_children();
      this.inkRows = markers.map(marker => this.inkRow(marker.name));
    }
    markers.forEach((marker, index) => {
      const row = this.inkRows[index];
      row.level.text = inkLevel(marker);
      row.bar.show(marker.level, marker.colors);
    });
  }

  private inkRow(name: string): InkRow {
    const row = new St.BoxLayout({ style_class: 'kestrel-print-marker', orientation: Clutter.Orientation.VERTICAL });
    const top = new St.BoxLayout();
    const level = new St.Label({ style_class: 'kestrel-print-marker-level' });
    top.add_child(label('kestrel-print-marker-name', name));
    top.add_child(level);
    const bar = new InkBar();
    row.add_child(top);
    row.add_child(bar.actor);
    this.ink.add_child(row);
    return { name, level, bar };
  }
}
