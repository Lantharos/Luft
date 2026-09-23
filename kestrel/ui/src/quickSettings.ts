import Clutter from 'gi://Clutter';
import Gvc from 'gi://Gvc';
import NM from 'gi://NM';
import St from 'gi://St';
import { Slider } from 'resource:///org/gnome/shell/ui/slider.js';

import { blurSurface } from './surface.js';

interface BrightnessScale { value: number; }
export interface BrightnessManager { globalScale: BrightnessScale | null; }

export class QuickSettings {
  readonly actor: St.BoxLayout;
  private readonly network = NM.Client.new(null);
  private readonly mixer = new Gvc.MixerControl({ name: 'Kestrel Volume Control' });
  private readonly wirelessTitle = new St.Label({ style_class: 'kestrel-control-title' });
  private readonly wirelessDetail = new St.Label({ style_class: 'kestrel-muted' });
  private readonly wirelessButton: St.Button;
  private readonly volume = new Slider(0);
  private readonly brightnessSlider = new Slider(0);
  private readonly volumeValue = new St.Label({ style_class: 'kestrel-value' });
  private readonly brightnessValue = new St.Label({ style_class: 'kestrel-value' });
  private readonly brightnessRow: St.BoxLayout;
  private sink: Gvc.MixerStream | null = null;
  private sinkSignals: number[] = [];
  private syncing = false;
  private networkIcon = 'network-wired-symbolic';
  private volumeIcon = 'audio-volume-muted-symbolic';

  constructor(
    private readonly brightness: BrightnessManager,
    private readonly statusChanged: (network: string, volume: string) => void,
  ) {
    this.actor = new St.BoxLayout({
      name: 'kestrel-quick-settings',
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'kestrel-popover kestrel-quick-settings',
      visible: false, reactive: true,
    });
    blurSurface(this.actor, 28);
    this.actor.add_child(new St.Label({ text: 'Quick settings', style_class: 'kestrel-title' }));

    const tile = new St.BoxLayout({ style_class: 'kestrel-network-content', x_expand: true });
    tile.add_child(new St.Icon({ icon_name: 'network-wireless-symbolic', icon_size: 24, y_align: Clutter.ActorAlign.CENTER }));
    const networkText = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true, style_class: 'kestrel-network-text' });
    networkText.add_child(this.wirelessTitle);
    networkText.add_child(this.wirelessDetail);
    tile.add_child(networkText);
    this.wirelessButton = new St.Button({ style_class: 'kestrel-network-tile', child: tile, can_focus: true });
    this.wirelessButton.connect('clicked', () => this.network.wireless_set_enabled(!this.network.wireless_enabled));
    this.actor.add_child(this.wirelessButton);

    this.actor.add_child(this.control('Volume', 'audio-volume-high-symbolic', this.volume, this.volumeValue));
    this.brightnessRow = this.control('Brightness', 'display-brightness-symbolic', this.brightnessSlider, this.brightnessValue);
    this.actor.add_child(this.brightnessRow);
    this.volume.connect('notify::value', () => {
      if (this.syncing || !this.sink) return;
      this.sink.set_volume(Math.round(this.volume.value * this.mixer.get_vol_max_norm()));
      this.sink.push_volume();
      if (this.sink.is_muted && this.volume.value > 0) this.sink.change_is_muted(false);
      this.volumeValue.text = `${Math.round(this.volume.value * 100)}%`;
    });
    this.brightnessSlider.connect('notify::value', () => {
      if (this.syncing || !this.brightness.globalScale) return;
      this.brightness.globalScale.value = this.brightnessSlider.value;
      this.brightnessValue.text = `${Math.round(this.brightnessSlider.value * 100)}%`;
    });
    this.network.connect('notify::wireless-enabled', () => this.refreshWireless());
    this.network.connect('notify::primary-connection', () => this.refreshWireless());
    this.mixer.connect('default-sink-changed', () => this.watchSink());
    this.mixer.connect('state-changed', () => this.watchSink());
    this.mixer.open();
    this.refresh();
  }

  refresh(): void {
    this.refreshWireless();
    this.refreshVolume();
    const scale = this.brightness.globalScale;
    this.brightnessRow.visible = scale !== null;
    this.syncing = true;
    this.brightnessSlider.value = scale?.value ?? 0;
    this.brightnessValue.text = `${Math.round((scale?.value ?? 0) * 100)}%`;
    this.syncing = false;
  }

  private refreshWireless(): void {
    const enabled = this.network.wireless_enabled;
    const primary = this.network.primary_connection;
    this.networkIcon = primary?.get_connection_type() === '802-3-ethernet'
      ? 'network-wired-symbolic'
      : primary ? 'network-wireless-signal-excellent-symbolic' : 'network-wireless-offline-symbolic';
    this.statusChanged(this.networkIcon, this.volumeIcon);
    this.wirelessTitle.text = 'Wi-Fi';
    const connection = this.network.active_connections.find(active => active.get_connection_type() === '802-11-wireless');
    this.wirelessDetail.text = enabled ? connection?.get_id() ?? 'Not connected' : 'Off';
    if (enabled) this.wirelessButton.add_style_pseudo_class('checked');
    else this.wirelessButton.remove_style_pseudo_class('checked');
  }

  private watchSink(): void {
    for (const signal of this.sinkSignals) this.sink?.disconnect(signal);
    this.sink = this.mixer.get_default_sink();
    this.sinkSignals = this.sink ? [
      this.sink.connect('notify::volume', () => this.refreshVolume()),
      this.sink.connect('notify::is-muted', () => this.refreshVolume()),
    ] : [];
    this.refreshVolume();
  }

  private refreshVolume(): void {
    const sink = this.sink;
    const value = sink && !sink.is_muted ? Math.min(1, sink.volume / this.mixer.get_vol_max_norm()) : 0;
    this.syncing = true;
    this.volume.value = value;
    this.syncing = false;
    this.volumeValue.text = sink ? `${Math.round(value * 100)}%` : 'Unavailable';
    this.volume.reactive = sink !== null;
    this.volumeIcon = value === 0 ? 'audio-volume-muted-symbolic'
      : value < 0.33 ? 'audio-volume-low-symbolic'
        : value < 0.67 ? 'audio-volume-medium-symbolic' : 'audio-volume-high-symbolic';
    this.statusChanged(this.networkIcon, this.volumeIcon);
  }

  private control(title: string, icon: string, slider: Slider, value: St.Label): St.BoxLayout {
    const section = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-slider-section' });
    const header = new St.BoxLayout({ style_class: 'kestrel-slider-header' });
    header.add_child(new St.Icon({ icon_name: icon, icon_size: 16 }));
    header.add_child(new St.Label({ text: title, x_expand: true }));
    header.add_child(value);
    section.add_child(header);
    slider.add_style_class_name('kestrel-slider');
    slider.accessible_name = title;
    section.add_child(slider);
    return section;
  }
}
