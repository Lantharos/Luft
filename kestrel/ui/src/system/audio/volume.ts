import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import type St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import { clamp } from '../../shared/math.js';
import { maxAmplified, mixer, type MixerStream } from '../mediaKeys/mixer.js';
import * as Main from '../../core/main.js';
import * as PopupMenu from '../../shared/popups/popupMenu.js';
import { QuickSlider, SystemIndicator } from '../toggles/quickSettings.js';

const ALLOW_AMPLIFIED_VOLUME_KEY = 'allow-volume-above-100-percent';
const UNMUTE_DEFAULT_VOLUME = 0.25;
const VOLUME_CHANGE_SETTLE_MS = 30;

const OUTPUT_ICONS = [
  'audio-volume-muted-symbolic',
  'audio-volume-low-symbolic',
  'audio-volume-medium-symbolic',
  'audio-volume-high-symbolic',
  'audio-volume-overamplified-symbolic',
];

const INPUT_ICONS = [
  'microphone-sensitivity-muted-symbolic',
  'microphone-sensitivity-low-symbolic',
  'microphone-sensitivity-medium-symbolic',
  'microphone-sensitivity-high-symbolic',
];

interface StreamSliderOptions {
  output: boolean;
  icons: string[];
}

interface StreamSliderSignals extends QuickSlider.Signals {
  'stream-updated': () => void;
}

class StreamSlider extends QuickSlider {
  static [GObject.signals] = {
    'stream-updated': {},
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, StreamSliderSignals>['connect'];
  declare emit: GObject.SignalMethods<this, StreamSliderSignals>['emit'];

  private readonly output: boolean;
  private readonly icons: string[];
  private readonly mixer = mixer();
  private readonly soundSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.sound' });
  private readonly deviceSection = new PopupMenu.PopupMenuSection();
  private readonly sliderChangedId: number;
  private inDrag = false;
  private notifyVolumeChangeId = 0;
  private allowAmplified = false;
  protected currentStream: MixerStream | null = null;

  constructor({ output, icons }: StreamSliderOptions) {
    super({ icon_reactive: true });
    this.output = output;
    this.icons = icons;

    const slider = this.slider;
    const menu = this.menu;
    this.soundSettings.connect(`changed::${ALLOW_AMPLIFIED_VOLUME_KEY}`, () => this.amplifySettingsChanged());
    this.amplifySettingsChanged();

    this.sliderChangedId = slider.connect('notify::value', () => this.sliderChanged());
    slider.connect('drag-begin', () => (this.inDrag = true));
    slider.connect('drag-end', () => {
      this.inDrag = false;
      this.notifyVolumeChange();
    });

    this.connect('icon-clicked', () => {
      const stream = this.currentStream;
      if (!stream) return;
      const { muted } = stream;
      if (muted && stream.volume === 0) stream.set_volume(UNMUTE_DEFAULT_VOLUME);
      stream.set_muted(!muted);
    });

    menu.addMenuItem(this.deviceSection);
    menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    KestrelUi.bindText(menu.addSettingsAction('', 'sound').label, 'volume-sound-settings');

    this.mixer.connectObject(
      `notify::${output ? 'output' : 'input'}`, () => (this.stream = this.defaultStream()),
      'devices-changed', (_mixer: unknown, changed: boolean) => {
        if (changed === output) this.showDevices();
      },
      this);
    this.showDevices();
    this.stream = this.defaultStream();
    KestrelUi.localized(this, () => this.syncIconLabel());
  }

  private defaultStream(): MixerStream | null {
    return this.output ? this.mixer.output : this.mixer.input;
  }

  get stream(): MixerStream | null {
    return this.currentStream;
  }

  set stream(stream: MixerStream | null) {
    if (stream === this.currentStream) return;
    this.currentStream?.disconnectObject(this);
    this.currentStream = stream;
    if (stream) {
      this.connectStream(stream);
      this.updateVolume();
    } else {
      this.emit('stream-updated');
    }
    this.visible = stream != null;
  }

  protected connectStream(stream: MixerStream): void {
    stream.connectObject('notify::muted', () => this.updateVolume(), 'notify::volume', () => this.updateVolume(), this);
  }

  private showDevices(): void {
    this.deviceSection.removeAll();
    const devices = this.mixer.get_devices(this.output);
    for (const device of devices) {
      const origin = device.get_origin();
      const name = origin ? `${device.get_description()} – ${origin}` : device.get_description();
      const item = new PopupMenu.PopupImageMenuItem(name, new Gio.ThemedIcon({ name: device.get_icon_name() }));
      item.setOrnament(device.get_active() ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);
      item.connect('activate', () => this.mixer.activate_device(device));
      this.deviceSection.addMenuItem(item);
    }
    this.menu_enabled = devices.length > 1;
  }

  private sliderChanged(): void {
    const stream = this.currentStream;
    if (!stream) return;

    const volume = this.slider.value;
    const previous = stream.volume;
    const prevMuted = stream.muted;
    stream.set_volume(volume);
    if (volume === 0 && !prevMuted) stream.set_muted(true);
    else if (volume > 0 && prevMuted) stream.set_muted(false);

    if (volume !== previous && !this.notifyVolumeChangeId && !this.inDrag) {
      this.notifyVolumeChangeId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, VOLUME_CHANGE_SETTLE_MS, () => {
        this.notifyVolumeChange();
        this.notifyVolumeChangeId = 0;
      });
      GLib.Source.set_name_by_id(this.notifyVolumeChangeId, '[kestrel] this._notifyVolumeChangeId');
    }
  }

  private notifyVolumeChange(): void {
    const stream = this.currentStream!;
    if (this.output && !stream.muted && !stream.running) KestrelUi.playSound('volume-tick');
  }

  private changeSlider(value: number): void {
    const slider = this.slider;
    slider.block_signal_handler(this.sliderChangedId);
    slider.value = value;
    slider.unblock_signal_handler(this.sliderChangedId);
  }

  private updateVolume(): void {
    const stream = this.currentStream!;
    this.changeSlider(stream.muted ? 0 : stream.volume);
    this.syncIconLabel();
    this.updateIcon();
    this.emit('stream-updated');
  }

  private syncIconLabel(): void {
    if (this.currentStream) this.icon_label = KestrelUi.t(this.currentStream.muted ? 'volume-unmute' : 'volume-mute');
  }

  private amplifySettingsChanged(): void {
    this.allowAmplified = this.soundSettings.get_boolean(ALLOW_AMPLIFIED_VOLUME_KEY);
    const slider = this.slider;
    slider.maximumValue = this.getMaxLevel();
    slider.clearMarks();
    if (this.allowAmplified) slider.addMark(1);
    if (this.currentStream) this.updateVolume();
  }

  protected updateIcon(): void {
    this.icon_name = this.getIcon();
  }

  getIcon(): string | null {
    const stream = this.currentStream;
    if (!stream) return null;
    const { volume } = stream;
    const level = stream.muted || volume <= 0 ? 0 : clamp(Math.ceil(3 * volume), 1, this.icons.length - 1);
    return this.icons[level];
  }

  getLevel(): number | null {
    return this.currentStream?.volume ?? null;
  }

  getMaxLevel(): number {
    return this.allowAmplified ? maxAmplified() : 1;
  }

  showOSD(): void {
    const gicon = new Gio.ThemedIcon({ name: this.getIcon()! });
    Main.osdWindowManager.showAll(gicon, null, this.getLevel(), this.getMaxLevel());
  }
}

const OutputStreamSlider = GObject.registerClass(class OutputStreamSlider extends StreamSlider {
  declare private hasHeadphones: boolean | undefined;

  constructor() {
    super({ output: true, icons: OUTPUT_ICONS });
    KestrelUi.localized(this, () => {
      this.slider.accessible_name = KestrelUi.t('volume-output-slider');
      this.menu.setHeader('audio-headphones-symbolic', KestrelUi.t('volume-output-title'));
      this.menu_button_accessible_name = KestrelUi.t('volume-output-open-menu');
    });
  }

  protected connectStream(stream: MixerStream): void {
    super.connectStream(stream);
    stream.connectObject('notify::port', () => this.portChanged(), this);
    this.portChanged();
  }

  private portChanged(): void {
    const sink = this.currentStream!;
    const formFactor = sink.form_factor;
    const hasHeadphones = formFactor === 'headset' || formFactor === 'headphone' || (sink.port?.toLowerCase().includes('headphone') ?? false);
    if (hasHeadphones === this.hasHeadphones) return;

    const initializing = this.hasHeadphones === undefined;
    this.hasHeadphones = hasHeadphones;
    this.updateIcon();
    if (!initializing) this.showOSD();
  }

  protected updateIcon(): void {
    this.icon_name = this.hasHeadphones ? 'audio-headphones-symbolic' : this.getIcon();
  }
});
type OutputStreamSlider = InstanceType<typeof OutputStreamSlider>;

const InputStreamSlider = GObject.registerClass(class InputStreamSlider extends StreamSlider {
  constructor() {
    super({ output: false, icons: INPUT_ICONS });
    this.icon_name = 'audio-input-microphone-symbolic';
    KestrelUi.localized(this, () => {
      this.slider.accessible_name = KestrelUi.t('volume-input-slider');
      this.menu.setHeader('audio-input-microphone-symbolic', KestrelUi.t('volume-input-title'));
      this.menu_button_accessible_name = KestrelUi.t('volume-input-open-menu');
    });
  }
});
export type InputStreamSlider = InstanceType<typeof InputStreamSlider>;

export const OutputIndicator = GObject.registerClass(class OutputIndicator extends SystemIndicator {
  private readonly indicator: St.Icon;
  private readonly output: OutputStreamSlider;

  constructor() {
    super();
    this.indicator = this._addIndicator();
    this.indicator.reactive = true;

    const scrollController = new Clutter.ScrollController({
      flags: Clutter.ScrollControllerFlags.SCROLL_VERTICAL | Clutter.ScrollControllerFlags.PHYSICAL_DIRECTION,
    });
    scrollController.connect('scroll', (_controller, _sprite, _source, _dx, dy) => {
      if (this.output.mapped || this.output.slider.step(-dy)) this.output.showOSD();
      return Clutter.EVENT_STOP;
    });
    this.indicator.add_action(scrollController);

    this.output = new OutputStreamSlider();
    this.output.connect('stream-updated', () => this.sync());
    this.sync();

    this.quickSettingsItems.push(this.output);
  }

  private sync(): void {
    const icon = this.output.getIcon();
    if (icon) this.indicator.icon_name = icon;
    this.indicator.visible = icon !== null;
  }
});

export function createInputSlider(): InputStreamSlider {
  return new InputStreamSlider();
}
