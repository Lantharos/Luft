import Clutter from 'gi://Clutter';
import Gvc from 'gi://Gvc';
import NM from 'gi://NM';
import Shell from 'gi://Shell';
import St from 'gi://St';

interface BrightnessScale {
  value: number;
  stepUp(): void;
  stepDown(): void;
}

export interface BrightnessManager {
  globalScale: BrightnessScale | null;
}

export class QuickSettings {
  readonly actor: St.BoxLayout;

  private readonly network = NM.Client.new(null);
  private readonly mixer = new Gvc.MixerControl({ name: 'Kestrel Volume Control' });
  private readonly wirelessButton: St.Button;
  private readonly volumeLabel = new St.Label({ style_class: 'kestrel-muted' });
  private readonly brightnessLabel = new St.Label({ style_class: 'kestrel-muted' });

  constructor(private readonly brightness: BrightnessManager) {
    this.actor = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'kestrel-popover',
      visible: false,
      reactive: true,
    });
    this.actor.add_effect_with_name('backdrop', new Shell.BlurEffect({
      mode: Shell.BlurMode.BACKGROUND,
      radius: 34,
      brightness: 0.76,
    }));
    this.actor.add_child(new St.Label({ text: 'Quick settings', style_class: 'kestrel-title' }));

    this.wirelessButton = this.action('network-wireless-symbolic', '', () => {
      this.network.wireless_set_enabled(!this.network.wireless_enabled);
    });
    this.actor.add_child(this.wirelessButton);

    const volume = new St.BoxLayout({ style_class: 'kestrel-control-row' });
    volume.add_child(new St.Icon({ icon_name: 'audio-volume-high-symbolic', icon_size: 20 }));
    volume.add_child(this.volumeLabel);
    volume.add_child(this.action('list-remove-symbolic', '', () => this.changeVolume(-0.08)));
    volume.add_child(this.action('list-add-symbolic', '', () => this.changeVolume(0.08)));
    this.actor.add_child(volume);

    const brightnessRow = new St.BoxLayout({ style_class: 'kestrel-control-row' });
    brightnessRow.add_child(new St.Icon({ icon_name: 'display-brightness-symbolic', icon_size: 20 }));
    brightnessRow.add_child(this.brightnessLabel);
    brightnessRow.add_child(this.action('list-remove-symbolic', '', () => {
      this.brightness.globalScale?.stepDown();
      this.refreshBrightness();
    }));
    brightnessRow.add_child(this.action('list-add-symbolic', '', () => {
      this.brightness.globalScale?.stepUp();
      this.refreshBrightness();
    }));
    this.actor.add_child(brightnessRow);

    this.network.connect('notify::wireless-enabled', () => this.refreshWireless());
    this.mixer.connect('default-sink-changed', () => this.refreshVolume());
    this.mixer.connect('state-changed', () => this.refreshVolume());
    this.mixer.open();

    this.refreshWireless();
    this.refreshVolume();
    this.refreshBrightness();
  }

  refresh(): void {
    this.refreshWireless();
    this.refreshVolume();
    this.refreshBrightness();
  }

  private refreshWireless(): void {
    this.wirelessButton.set_label(this.network.wireless_enabled ? 'Wi-Fi on' : 'Wi-Fi off');
  }

  private refreshVolume(): void {
    const sink = this.mixer.get_default_sink();
    const percent = sink ? Math.round(100 * sink.volume / this.mixer.get_vol_max_norm()) : 0;
    this.volumeLabel.text = `Volume  ${percent}%`;
  }

  private refreshBrightness(): void {
    const scale = this.brightness.globalScale;
    this.brightnessLabel.text = scale
      ? `Brightness  ${Math.round(scale.value * 100)}%`
      : 'Brightness unavailable';
  }

  private changeVolume(amount: number): void {
    const sink = this.mixer.get_default_sink();
    if (!sink)
      return;

    const max = this.mixer.get_vol_max_norm();
    sink.set_volume(Math.round(Math.max(0, Math.min(max, sink.volume + amount * max))));
    sink.push_volume();
    if (sink.is_muted && sink.volume > 0)
      sink.change_is_muted(false);
    this.refreshVolume();
  }

  private action(iconName: string, label: string, callback: () => void): St.Button {
    const content = new St.BoxLayout({ y_align: Clutter.ActorAlign.CENTER });
    content.add_child(new St.Icon({ icon_name: iconName, icon_size: 18 }));
    if (label)
      content.add_child(new St.Label({ text: label }));

    const button = new St.Button({
      style_class: 'kestrel-action',
      child: content,
      can_focus: true,
      x_expand: Boolean(label),
    });
    button.connect('clicked', callback);
    return button;
  }
}
