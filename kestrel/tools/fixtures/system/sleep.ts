import GLib from 'gi://GLib';

import type {Publish} from './bus.js';

const SLEEP = `<node><interface name="com.lantharos.Sleep1">
  <property name="PowerOffAfter" type="u" access="read"/>
  <method name="SetPowerOffAfter"><arg type="u" direction="in"/></method>
</interface></node>`;
const DAY = 24 * 60 * 60;

export const SLEEP_NAME = 'com.lantharos.Sleep1';

export function publishSleep(publish: Publish, calls: string[]) {
  let after = DAY;
  const sleep = publish(SLEEP, {
    get PowerOffAfter() { return after; },
    SetPowerOffAfter(seconds: number) {
      calls.push(`SetPowerOffAfter ${seconds}`);
      after = seconds;
      sleep.emit_property_changed('PowerOffAfter', new GLib.Variant('u', seconds));
    },
  }, '/com/lantharos/Sleep1');
}
