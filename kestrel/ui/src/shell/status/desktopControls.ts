import St from 'gi://St';

import * as Bluetooth from './bluetooth/bluetooth.js';
import * as Volume from './devices/volume.js';
import * as Brightness from './devices/brightness.js';
import * as PowerProfiles from './powerProfiles.js';
import * as Caffeine from './caffeine.js';
import * as NightLight from './nightLight.js';
import * as DarkMode from './darkMode.js';
import * as Rain from './rain.js';
import * as DoNotDisturb from './doNotDisturb.js';
import * as Rfkill from './devices/rfkill.js';
import * as Backlight from './devices/backlight.js';
import * as AutoRotate from './autoRotate.js';
import * as Location from './location.js';
import * as Thunderbolt from './devices/thunderbolt.js';
import { Indicator as NetworkIndicator } from './network/indicator.js';

export class DesktopControls {
  readonly actor = new St.BoxLayout();
  readonly volumeOutput = new Volume.OutputIndicator();
  readonly brightness = new Brightness.Indicator();
  readonly powerProfiles = new PowerProfiles.Indicator();
  readonly caffeine = new Caffeine.Indicator();
  readonly nightLight = new NightLight.Indicator();
  readonly darkMode = new DarkMode.Indicator();
  readonly rain = new Rain.Indicator();
  readonly doNotDisturb = new DoNotDisturb.Indicator();
  readonly rfkill = new Rfkill.Indicator();
  readonly backlight = new Backlight.Indicator();
  readonly autoRotate = new AutoRotate.Indicator();
  readonly bluetooth: InstanceType<typeof Bluetooth.Indicator>;
  readonly network = new NetworkIndicator();

  constructor() {
    Location.getGeoclueAgent();
    this.actor.add_child(new Thunderbolt.Indicator());
    this.bluetooth = new Bluetooth.Indicator();
    for (const indicator of [this.volumeOutput, this.brightness, this.powerProfiles, this.caffeine, this.nightLight,
      this.darkMode, this.rain, this.doNotDisturb, this.rfkill, this.backlight, this.autoRotate, this.bluetooth, this.network])
      this.actor.add_child(indicator);
  }

  destroy(): void {
    this.actor.destroy();
  }
}
