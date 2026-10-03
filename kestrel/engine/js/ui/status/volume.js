import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';

import * as Main from '../main.js';
import * as PopupMenu from '../popupMenu.js';

import {QuickSlider, SystemIndicator} from '../quickSettings.js';

const ALLOW_AMPLIFIED_VOLUME_KEY = 'allow-volume-above-100-percent';
const UNMUTE_DEFAULT_VOLUME = 0.25;

const StreamSlider = GObject.registerClass({
    Signals: {
        'stream-updated': {},
    },
}, class StreamSlider extends QuickSlider {
    _init(output) {
        super._init({
            icon_reactive: true,
        });

        this._output = output;
        this._mixer = Shell.Mixer.get_default();

        this._inDrag = false;
        this._notifyVolumeChangeId = 0;

        this._soundSettings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.sound',
        });
        this._soundSettings.connect(`changed::${ALLOW_AMPLIFIED_VOLUME_KEY}`,
            () => this._amplifySettingsChanged());
        this._amplifySettingsChanged();

        this._sliderChangedId = this.slider.connect('notify::value',
            () => this._sliderChanged());
        this.slider.connect('drag-begin', () => (this._inDrag = true));
        this.slider.connect('drag-end', () => {
            this._inDrag = false;
            this._notifyVolumeChange();
        });

        this.connect('icon-clicked', () => {
            if (!this._stream)
                return;

            const {muted} = this._stream;
            if (muted && this._stream.volume === 0)
                this._stream.set_volume(UNMUTE_DEFAULT_VOLUME);
            this._stream.set_muted(!muted);
        });

        this._deviceSection = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._deviceSection);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addSettingsAction(_('Sound Settings'), 'sound');

        this._stream = null;
        this._volumeCancellable = null;

        this._mixer.connectObject(
            `notify::${output ? 'output' : 'input'}`, () => (this.stream = this._defaultStream()),
            'devices-changed', (_mixer, changed) => {
                if (changed === output)
                    this._showDevices();
            },
            this);
        this._showDevices();
        this.stream = this._defaultStream();
    }

    _defaultStream() {
        return this._output ? this._mixer.output : this._mixer.input;
    }

    get stream() {
        return this._stream;
    }

    set stream(stream) {
        if (stream === this._stream)
            return;

        this._stream?.disconnectObject(this);

        this._stream = stream;

        if (this._stream) {
            this._connectStream(this._stream);
            this._updateVolume();
        } else {
            this.emit('stream-updated');
        }

        this._sync();
    }

    _connectStream(stream) {
        stream.connectObject(
            'notify::muted', this._updateVolume.bind(this),
            'notify::volume', this._updateVolume.bind(this), this);
    }

    _showDevices() {
        this._deviceSection.removeAll();

        const devices = this._mixer.get_devices(this._output);
        for (const device of devices) {
            const origin = device.get_origin();
            const name = origin
                ? `${device.get_description()} – ${origin}`
                : device.get_description();
            const item = new PopupMenu.PopupImageMenuItem(name, new Gio.ThemedIcon({name: device.get_icon_name()}));
            item.setOrnament(device.get_active() ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);
            item.connect('activate', () => this._mixer.activate_device(device));
            this._deviceSection.addMenuItem(item);
        }

        this.menuEnabled = devices.length > 1;
    }

    _sync() {
        this.visible = this._stream != null;
    }

    _sliderChanged() {
        if (!this._stream)
            return;

        const volume = this.slider.value;
        const previous = this._stream.volume;
        const prevMuted = this._stream.muted;
        this._stream.set_volume(volume);
        if (volume === 0 && !prevMuted)
            this._stream.set_muted(true);
        else if (volume > 0 && prevMuted)
            this._stream.set_muted(false);

        if (volume !== previous && !this._notifyVolumeChangeId && !this._inDrag) {
            this._notifyVolumeChangeId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, 30, () => {
                this._notifyVolumeChange();
                this._notifyVolumeChangeId = 0;
            });
            GLib.Source.set_name_by_id(this._notifyVolumeChangeId,
                '[kestrel] this._notifyVolumeChangeId');
        }
    }

    _notifyVolumeChange() {
        if (this._volumeCancellable)
            this._volumeCancellable.cancel();
        this._volumeCancellable = null;

        if (this._stream.running)
            return;

        this._volumeCancellable = new Gio.Cancellable();
        const player = global.display.get_sound_player();
        player.play_from_file(
            Gio.File.new_for_path(`${global.datadir}/sounds/audio-volume-change.oga`),
            _('Volume changed'), this._volumeCancellable);
    }

    _changeSlider(value) {
        this.slider.block_signal_handler(this._sliderChangedId);
        this.slider.value = value;
        this.slider.unblock_signal_handler(this._sliderChangedId);
    }

    _updateVolume() {
        const {muted} = this._stream;
        this._changeSlider(muted ? 0 : this._stream.volume);
        this.iconLabel = muted ? _('Unmute') : _('Mute');
        this._updateIcon();
        this.emit('stream-updated');
    }

    _amplifySettingsChanged() {
        this._allowAmplified = this._soundSettings.get_boolean(ALLOW_AMPLIFIED_VOLUME_KEY);

        this.slider.maximum_value = this.getMaxLevel();

        this.slider.clearMarks();
        if (this._allowAmplified)
            this.slider.addMark(1);

        if (this._stream)
            this._updateVolume();
    }

    _updateIcon() {
        this.iconName = this.getIcon();
    }

    getIcon() {
        if (!this._stream)
            return null;

        const {volume} = this._stream;
        let n;
        if (this._stream.muted || volume <= 0) {
            n = 0;
        } else {
            n = Math.ceil(3 * volume);
            n = Math.clamp(n, 1, this._icons.length - 1);
        }
        return this._icons[n];
    }

    getLevel() {
        return this._stream?.volume ?? null;
    }

    getMaxLevel() {
        return this._allowAmplified ? Shell.Mixer.get_max_amplified() : 1;
    }

    showOSD() {
        const gicon = new Gio.ThemedIcon({name: this.getIcon()});
        Main.osdWindowManager.showAll(gicon, null, this.getLevel(), this.getMaxLevel());
    }
});

const OutputStreamSlider = GObject.registerClass(
class OutputStreamSlider extends StreamSlider {
    _init() {
        this._icons = [
            'audio-volume-muted-symbolic',
            'audio-volume-low-symbolic',
            'audio-volume-medium-symbolic',
            'audio-volume-high-symbolic',
            'audio-volume-overamplified-symbolic',
        ];

        super._init(true);

        this.slider.accessible_name = _('Volume');
        this.menu.setHeader('audio-headphones-symbolic', _('Sound Output'));
        this.menuButtonAccessibleName = _('Open sound output menu');
    }

    _connectStream(stream) {
        super._connectStream(stream);
        stream.connectObject('notify::port',
            this._portChanged.bind(this), this);
        this._portChanged();
    }

    _findHeadphones(sink) {
        const formFactor = sink.form_factor;
        if (formFactor === 'headset' || formFactor === 'headphone')
            return true;

        return sink.port?.toLowerCase().includes('headphone') ?? false;
    }

    _portChanged() {
        const hasHeadphones = this._findHeadphones(this._stream);
        if (hasHeadphones === this._hasHeadphones)
            return;

        const initializing = this._hasHeadphones === undefined;
        this._hasHeadphones = hasHeadphones;
        this._updateIcon();
        if (!initializing)
            this.showOSD();
    }

    _updateIcon() {
        this.iconName = this._hasHeadphones
            ? 'audio-headphones-symbolic'
            : this.getIcon();
    }
});

const InputStreamSlider = GObject.registerClass(
class InputStreamSlider extends StreamSlider {
    _init() {
        this._icons = [
            'microphone-sensitivity-muted-symbolic',
            'microphone-sensitivity-low-symbolic',
            'microphone-sensitivity-medium-symbolic',
            'microphone-sensitivity-high-symbolic',
        ];

        super._init(false);

        this.slider.accessible_name = _('Microphone');
        this.iconName = 'audio-input-microphone-symbolic';
        this.menu.setHeader('audio-input-microphone-symbolic', _('Sound Input'));
        this.menuButtonAccessibleName = _('Open sound input menu');
    }
});

export const OutputIndicator = GObject.registerClass(
class OutputIndicator extends SystemIndicator {
    constructor() {
        super();

        this._indicator = this._addIndicator();
        this._indicator.reactive = true;

        const scrollController = new Clutter.ScrollController({
            flags: Clutter.ScrollControllerFlags.SCROLL_VERTICAL |
                Clutter.ScrollControllerFlags.PHYSICAL_DIRECTION,
        });
        scrollController.connect('scroll', (_controller, _sprite, _source, _dx, dy) => {
            if (this._output.mapped || this._output.slider.step(-dy))
                this._output.showOSD();
            return Clutter.EVENT_STOP;
        });
        this._indicator.add_action(scrollController);

        this._output = new OutputStreamSlider();
        this._output.connect('stream-updated', () => this._sync());
        this._sync();

        this.quickSettingsItems.push(this._output);
    }

    _sync() {
        const icon = this._output.getIcon();

        if (icon)
            this._indicator.icon_name = icon;
        this._indicator.visible = icon !== null;
    }
});

export function createInputSlider() {
    return new InputStreamSlider();
}
