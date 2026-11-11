import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';

import type { ContextMenus } from '../../menus/contextMenus.js';
import { Tray } from '../../tray/tray.js';
import { ExtensionItems } from '../widgets/extensionItems.js';
import { PanelClock } from '../widgets/clock.js';
import { BatteryIndicator } from '../../../shared/battery/indicator.js';
import { PrivacyIndicator } from '../../../system/capture/privacy/indicator.js';
import { InputSourceIndicator } from '../../../system/input/inputSources/indicator.js';
import { PostIndicator } from '../../../system/connectivity/post/indicator.js';
import { currentPost } from '../../../system/connectivity/post/post.js';
import { localized, t } from '../../../shared/i18n/index.js';
import { isVertical, type Edge } from '../../../shared/layout/edge.js';
import type { Taskbar } from '../taskbar/taskbar.js';
import type { PanelElements } from '../islands/islandSet.js';
import { taskbarElements, type ElementActor, type ElementLayout } from './extensionElements.js';
import { launch } from '../../../shared/apps/launch.js';

const KEYS_APP = 'com.lantharos.keys.desktop';

function showLayout(keys: Shell.App, layout: string): void {
  launch(keys.get_app_info(), [`kestrel-keys:view/${encodeURIComponent(layout)}`]);
}

const orientationOf = (edge: Edge) => isVertical(edge) ? Clutter.Orientation.VERTICAL : Clutter.Orientation.HORIZONTAL;

interface ElementActions {
  quickSettings(): void;
  notifications(): void;
  stopScreencast(): void;
}

export class TaskbarElements implements PanelElements {
  readonly clock = new PanelClock();
  readonly clockButton: St.Button;
  readonly quickButton: St.Button | null = null;
  readonly post: PostIndicator | null = null;
  readonly tray: Tray | null = null;
  readonly privacy: PrivacyIndicator | null = null;
  readonly inputSource: InputSourceIndicator | null = null;
  private readonly trayBox: St.BoxLayout | null = null;
  private readonly statusGroup: St.BoxLayout | null = null;
  private readonly extensionItems: ExtensionItems | null = null;
  private readonly statusIcons = new St.BoxLayout({ style_class: 'kestrel-status-icons', x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER });
  private readonly edges = new Map<string, Edge>();
  private readonly extensions = new Map<string, ElementActor>();
  private readonly unwatchExtensions: () => void;

  constructor(private readonly start: St.Button, private readonly dock: Taskbar, menus: ContextMenus, actions: ElementActions,
    primary: boolean, private readonly layout: (edge: Edge) => ElementLayout) {
    this.unwatchExtensions = taskbarElements.watch((entry, added) => {
      if (added) return;
      this.extensions.get(entry.id)?.destroy();
      this.extensions.delete(entry.id);
      this.edges.delete(entry.id);
    });
    if (primary) {
      start.name = 'kestrel-taskbar-start';
      dock.actor.name = 'kestrel-taskbar-dock';
      const trayBox = this.trayBox = new St.BoxLayout({ name: 'kestrel-taskbar-tray', style_class: 'kestrel-panel-status' });
      this.privacy = new PrivacyIndicator(menus, actions.stopScreencast);
      trayBox.add_child(this.privacy.actor);
      this.inputSource = new InputSourceIndicator(menus, layout => {
        const keys = Shell.AppSystem.get_default().lookup_app(KEYS_APP);
        return [
          ...keys && layout ? [{ label: t('taskbar-show-keyboard-layout'), run: () => showLayout(keys, layout) }] : [],
          { label: t('taskbar-keyboard-settings'), run: () => menus.settings('input') },
        ];
      });
      trayBox.add_child(this.inputSource.actor);
      this.extensionItems = new ExtensionItems();
      trayBox.add_child(this.extensionItems.actor);
      this.tray = new Tray(menus);
      trayBox.add_child(this.tray.actor);
      this.statusIcons.add_child(new BatteryIndicator(16).actor);
      const quickButton = this.quickButton = new St.Button({
        name: 'kestrel-taskbar-status', style_class: 'kestrel-status-button kestrel-panel-status', child: this.statusIcons, can_focus: true,
      });
      localized(quickButton, () => (quickButton.accessible_name = t('taskbar-quick-settings')));
      quickButton.connect('clicked', actions.quickSettings);
      const statusGroup = this.statusGroup = new St.BoxLayout({ name: 'kestrel-taskbar-status-group', style_class: 'kestrel-status-group' });
      const post = currentPost();
      if (post) {
        this.post = new PostIndicator(post, menus);
        statusGroup.add_child(this.post.actor);
        const follow = () => (post.client.open ? quickButton.add_style_class_name('kestrel-after-post') : quickButton.remove_style_class_name('kestrel-after-post'));
        const stop = post.client.onChanged(follow);
        quickButton.connect('destroy', stop);
        follow();
      }
      statusGroup.add_child(quickButton);
      menus.bind(quickButton, () => [
        { label: t('taskbar-network-settings'), run: () => menus.settings('network') },
        { label: t('taskbar-sound-settings'), run: () => menus.settings('sound') },
      ]);
    }
    this.clockButton = new St.Button({
      name: primary ? 'kestrel-taskbar-clock' : null, style_class: 'kestrel-status-button kestrel-panel-status', child: this.clock.actor, can_focus: true,
    });
    localized(this.clockButton, () => (this.clockButton.accessible_name = t('taskbar-notifications-and-date')));
    this.clockButton.connect('clicked', actions.notifications);
    menus.bind(this.clockButton, () => [
      { label: t('taskbar-date-time-settings'), run: () => menus.settings('language') },
    ]);
  }

  actor(id: string): Clutter.Actor | null {
    switch (id) {
      case 'start': return this.start.visible ? this.start : null;
      case 'dock': return this.dock.actor;
      case 'tray': return this.trayBox;
      case 'status': return this.statusGroup;
      case 'clock': return this.clockButton;
      default: return this.extension(id)?.actor ?? null;
    }
  }

  private extension(id: string): ElementActor | null {
    let element = this.extensions.get(id);
    if (!element) {
      const entry = taskbarElements.items.find(shown => shown.id === id);
      if (!entry) return null;
      element = entry.create(this.layout(this.edges.get(id) ?? 'bottom'));
      this.extensions.set(id, element);
    }
    return element;
  }

  resize(): void {
    for (const [id, element] of this.extensions) element.relayout(this.layout(this.edges.get(id) ?? 'bottom'));
  }

  label(id: string): string {
    switch (id) {
      case 'start': return t('taskbar-start');
      case 'dock': return t('taskbar-arrange-dock');
      case 'tray': return t('tray-apps');
      case 'status': return t('taskbar-quick-settings');
      case 'clock': return t('taskbar-notifications-and-date');
      default: return taskbarElements.items.find(element => element.id === id)?.label ?? id;
    }
  }

  orient(id: string, edge: Edge): void {
    if (this.edges.get(id) === edge) return;
    this.edges.set(id, edge);
    const orientation = orientationOf(edge);
    switch (id) {
      case 'dock': return this.dock.reorient(edge);
      case 'tray':
        this.trayBox!.orientation = orientation;
        this.extensionItems!.actor.orientation = orientation;
        this.privacy!.orient(orientation);
        return;
      case 'status':
        this.statusIcons.orientation = orientation;
        this.statusGroup!.orientation = orientation;
        this.post?.orient(orientation);
        return;
      case 'clock': return this.clock.setNarrow(isVertical(edge));
      default: this.extensions.get(id)?.relayout(this.layout(edge));
    }
  }

  updateStatus(iconNames: string[]): void {
    const icons = this.statusIcons.get_children().filter(child => child instanceof St.Icon);
    iconNames.forEach((iconName, index) => {
      const icon = icons[index] ?? new St.Icon({ icon_size: 16 });
      if (!icon.get_parent()) this.statusIcons.insert_child_at_index(icon, index);
      icon.icon_name = iconName;
    });
    for (const icon of icons.slice(iconNames.length)) icon.destroy();
  }

  handlesScroll(actor: Clutter.Actor | null): boolean {
    return !!this.tray?.contains(actor) || !!this.inputSource?.contains(actor);
  }

  shutdown(): void {
    this.unwatchExtensions();
    for (const element of this.extensions.values()) element.destroy();
    this.extensions.clear();
    this.tray?.shutdown();
    this.extensionItems?.shutdown();
    this.privacy?.shutdown();
    this.inputSource?.shutdown();
    this.clock.destroy();
  }
}
