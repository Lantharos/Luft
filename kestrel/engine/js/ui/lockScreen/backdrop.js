import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Background from '../background.js';
import * as Main from '../main.js';

const BLUR_BRIGHTNESS = 0.65;
const BLUR_RADIUS = 90;

export class LockBackdrop {
    constructor() {
        this.actor = new Clutter.Actor();
        this._managers = [];

        St.ThemeContext.get_for_stage(global.stage).connectObject('notify::scale-factor',
            () => this._updateEffects(), this.actor);
        Main.layoutManager.connectObject('monitors-changed', () => this._rebuild(), this.actor);
        this.actor.connect('destroy', () => this._destroyManagers());

        this._rebuild();
    }

    _destroyManagers() {
        for (const manager of this._managers)
            manager.destroy();
        this._managers = [];
    }

    _rebuild() {
        this._destroyManagers();
        this.actor.destroy_all_children();

        Main.layoutManager.monitors.forEach((monitor, monitorIndex) => {
            const widget = new St.Widget({
                style_class: 'screen-shield-background',
                x: monitor.x,
                y: monitor.y,
                width: monitor.width,
                height: monitor.height,
                effect: new Shell.BlurEffect({name: 'blur'}),
            });
            this._managers.push(new Background.BackgroundManager({
                container: widget,
                monitorIndex,
                controlPosition: false,
            }));
            this.actor.add_child(widget);
        });
        this._updateEffects();
        this.loaded = Promise.all(this._managers.map(manager => new Promise(resolve => {
            const id = manager.connect('loaded', () => {
                manager.disconnect(id);
                resolve();
            });
        })));
    }

    _updateEffects() {
        const {scaleFactor} = St.ThemeContext.get_for_stage(global.stage);
        for (const widget of this.actor) {
            widget.get_effect('blur').set({
                brightness: BLUR_BRIGHTNESS,
                radius: BLUR_RADIUS * scaleFactor,
            });
        }
    }
}
