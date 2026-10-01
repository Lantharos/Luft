import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Background from '../background.js';
import * as BackgroundStore from '../backgroundStore.js';
import * as Main from '../main.js';

const BLUR_BRIGHTNESS = 0.65;
const BLUR_RADIUS = 90;

function settled(container) {
    if (container.get_n_children() === 1)
        return Promise.resolve();
    return new Promise(resolve => {
        const id = container.connect('child-removed', () => {
            if (container.get_n_children() > 1)
                return;
            container.disconnect(id);
            resolve();
        });
    });
}

class MonitorBackdrop {
    constructor(parent, monitor, monitorIndex, offscreen) {
        const {scaleFactor} = St.ThemeContext.get_for_stage(global.stage);
        this._parent = parent;
        this._monitor = monitor;
        this._radius = BLUR_RADIUS * scaleFactor;
        this._cancellable = new Gio.Cancellable();
        this._generation = 0;
        this._stored = null;

        this._widget = new St.Widget({
            style_class: 'screen-shield-background',
            x: monitor.x,
            y: monitor.y,
            width: monitor.width,
            height: monitor.height,
            effect: new Shell.BlurEffect({brightness: BLUR_BRIGHTNESS, radius: this._radius}),
        });
        parent.add_child(this._widget);
        this._manager = new Background.BackgroundManager({
            container: this._widget,
            monitorIndex,
            controlPosition: false,
        });

        const live = new Promise(resolve => {
            const id = this._manager.connect('loaded', () => {
                this._manager.disconnect(id);
                resolve();
            });
        });
        if (offscreen) {
            this.shown = live.then(() => this._store());
            this._manager.connect('changed', () => this._store());
        } else {
            this.shown = this._show(live);
            this._manager.connect('changed', () => {
                this._widget.show();
                this._dropStored();
            });
        }
    }

    async _key() {
        try {
            const source = await this._manager.backgroundActor.content.background.storeKey(this._cancellable);
            const {x, y, width, height, geometry_scale: scale} = this._monitor;
            return source && `${source} backdrop ${x},${y} ${width}x${height}@${scale} ${this._radius} ${BLUR_BRIGHTNESS}`;
        } catch {
            return null;
        }
    }

    async _show(live) {
        const key = await this._key();
        const stored = key && await BackgroundStore.load(key, GLib.PRIORITY_DEFAULT, this._cancellable);
        if (!stored) {
            await live;
            return;
        }

        this._stored = new Clutter.Actor({
            x: this._monitor.x,
            y: this._monitor.y,
            width: this._monitor.width,
            height: this._monitor.height,
            content: Clutter.TextureContent.new_from_texture(stored.texture, null),
        });
        this._parent.add_child(this._stored);
        this._widget.hide();
        live.then(() => {
            this._widget.show();
            const id = global.stage.connect('after-paint', () => {
                global.stage.disconnect(id);
                this._dropStored();
            });
        });
    }

    _dropStored() {
        this._stored?.destroy();
        this._stored = null;
    }

    async _store() {
        const generation = ++this._generation;
        await settled(this._widget);
        const key = await this._key();
        if (!key || generation !== this._generation || BackgroundStore.has(key))
            return;
        BackgroundStore.store(key, () => generation === this._generation
            ? Shell.texture_file_paint_actor(this._widget)
            : null);
    }

    destroy() {
        this._generation++;
        this._cancellable.cancel();
        this._manager.destroy();
    }
}

export class LockBackdrop {
    constructor({offscreen = false} = {}) {
        this.actor = new Clutter.Actor({opacity: offscreen ? 0 : 255});
        this._offscreen = offscreen;
        this._monitors = [];

        St.ThemeContext.get_for_stage(global.stage).connectObject('notify::scale-factor',
            () => this._rebuild(), this.actor);
        Main.layoutManager.connectObject('monitors-changed', () => this._rebuild(), this.actor);
        this.actor.connect('destroy', () => this._destroyMonitors());

        this._rebuild();
    }

    _destroyMonitors() {
        for (const monitor of this._monitors)
            monitor.destroy();
        this._monitors = [];
    }

    _rebuild() {
        this._destroyMonitors();
        this.actor.destroy_all_children();
        this._monitors = Main.layoutManager.monitors.map((monitor, monitorIndex) =>
            new MonitorBackdrop(this.actor, monitor, monitorIndex, this._offscreen));
        this.loaded = Promise.all(this._monitors.map(monitor => monitor.shown));
    }
}
