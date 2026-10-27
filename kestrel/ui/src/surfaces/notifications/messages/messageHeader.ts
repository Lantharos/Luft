import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Graphene from 'gi://Graphene';
import St from 'gi://St';

import * as KestrelUi from '../../../kestrelUi.js';
import { formatTimeSpan } from '../../../shared/time/dateUtils.js';
import { HeaderLayout } from '../../../shared/widgets/headerLayout.js';
import type { MessageSource } from './source.js';

const TimeLabel = GObject.registerClass(
class TimeLabel extends St.Label {
  private datetimeValue: GLib.DateTime | null = null;

  constructor() {
    super({
      style_class: 'event-time',
      x_expand: true,
      y_expand: true,
      x_align: Clutter.ActorAlign.START,
      y_align: Clutter.ActorAlign.END,
      visible: false,
    });
  }

  get datetime(): GLib.DateTime | null {
    return this.datetimeValue;
  }

  set datetime(datetime: GLib.DateTime | null) {
    if (datetime && this.datetimeValue?.equal(datetime)) return;

    this.datetimeValue = datetime;
    this.visible = !!datetime;

    if (this.mapped)
      this.updateText();
  }

  private updateText(): void {
    if (this.datetimeValue)
      this.text = formatTimeSpan(this.datetimeValue);
  }

  vfunc_map(): void {
    this.updateText();
    super.vfunc_map();
  }
});

export const MessageHeader = GObject.registerClass(
class MessageHeader extends St.BoxLayout {
  readonly expandButton: St.Button;
  readonly closeButton: St.Button;
  readonly timeLabel = new TimeLabel();

  constructor(source: MessageSource) {
    const layout = new HeaderLayout();
    super({
      style_class: 'message-header',
      x_expand: true,
      layout_manager: layout,
    });

    const sourceIcon = new St.Icon({
      style_class: 'message-source-icon',
      y_align: Clutter.ActorAlign.CENTER,
      fallback_icon_name: 'application-x-executable-symbolic',
    });
    this.add_child(sourceIcon);

    const headerContent = new St.BoxLayout({
      style_class: 'message-header-content',
      y_align: Clutter.ActorAlign.CENTER,
      x_expand: true,
    });
    this.add_child(headerContent);

    this.expandButton = new St.Button({
      style_class: 'message-expand-button',
      icon_name: 'notification-expand-symbolic',
      y_align: Clutter.ActorAlign.CENTER,
      pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 }),
    });
    this.add_child(this.expandButton);

    this.closeButton = new St.Button({
      style_class: 'message-close-button',
      icon_name: 'window-close-symbolic',
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.add_child(this.closeButton);
    layout.overhang(this.expandButton);
    layout.overhang(this.closeButton);

    const sourceTitle = new St.Label({
      style_class: 'message-source-title',
      y_align: Clutter.ActorAlign.END,
    });
    headerContent.add_child(sourceTitle);

    source.bind_property_full('title',
      sourceTitle,
      'text',
      GObject.BindingFlags.SYNC_CREATE,
      (_binding, value: string | null) => [true, value === null || value === '' ? KestrelUi.t('messages-unknown-app') : value],
      null);
    const app = KestrelUi.sourceApp(source);
    if (app)
      KestrelUi.appIcons.bind(sourceIcon, app);
    else
      source.bind_property('icon', sourceIcon, 'gicon', GObject.BindingFlags.SYNC_CREATE);

    headerContent.add_child(this.timeLabel);
  }
});
export type MessageHeader = InstanceType<typeof MessageHeader>;
