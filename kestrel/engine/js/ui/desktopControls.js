import St from 'gi://St';

import * as Config from '../misc/config.js';
import * as Volume from './status/volume.js';
import * as Brightness from './status/brightness.js';
import * as PowerProfiles from './status/powerProfiles.js';
import * as NightLight from './status/nightLight.js';
import * as DoNotDisturb from './status/doNotDisturb.js';
import * as Location from './status/location.js';
import * as Thunderbolt from './status/thunderbolt.js';

export class DesktopControls {
    constructor() {
        this.actor = new St.BoxLayout();
        this._volumeOutput = new Volume.OutputIndicator();
        this._brightness = new Brightness.Indicator();
        this._powerProfiles = new PowerProfiles.Indicator();
        this._nightLight = new NightLight.Indicator();
        this._doNotDisturb = new DoNotDisturb.Indicator();
        Location.getGeoclueAgent();
        this.actor.add_child(new Thunderbolt.Indicator());
        this._network = null;
        this._bluetooth = null;
        for (const indicator of [this._volumeOutput, this._brightness,
            this._powerProfiles, this._nightLight, this._doNotDisturb])
            this.actor.add_child(indicator);
        this.ready = this._loadDevices();
    }

    async _loadDevices() {
        if (Config.HAVE_NETWORKMANAGER) {
            const Network = await import('./status/network.js');
            this._network = new Network.Indicator();
            this.actor.add_child(this._network);
        }
        if (Config.HAVE_BLUETOOTH) {
            const Bluetooth = await import('./status/bluetooth.js');
            this._bluetooth = new Bluetooth.Indicator();
            this.actor.add_child(this._bluetooth);
        }
    }

    destroy() {
        this.actor.destroy();
    }
}
