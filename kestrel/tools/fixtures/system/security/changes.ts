import GLib from 'gi://GLib';

import type {Publish} from '../bus.js';

const CHANGES = `<node><interface name="com.lantharos.Changes1">
  <method name="Read"><arg name="settings" type="as" direction="in"/><arg type="a(sv)" direction="out"/></method>
  <method name="Apply"><arg name="changes" type="a(sv)" direction="in"/><arg type="a(sv)" direction="out"/><arg type="s" direction="out"/></method>
</interface></node>`;

export const CHANGES_NAME = 'com.lantharos.Changes1';

const INITIAL: Record<string, boolean | string> = {
  'developer-tools': false,
  'usb-protection': true,
  'update-channel': 'nightly',
  'update-schedule': 'daily',
  'download-updates': true,
  'time-zone': 'UTC',
  'automatic-time': true,
};

const variant = (value: boolean | string) => new GLib.Variant(typeof value === 'boolean' ? 'b' : 's', value);

export function publishChanges(publish: Publish, calls: string[]) {
  const values = {...INITIAL};
  publish(CHANGES, {
    Read: (names: string[]) => names.map(name => [name, variant(values[name])]),
    Apply: (changes: [string, GLib.Variant][]) => {
      const previous = changes.map(([name, value]) => {
        const before: [string, GLib.Variant] = [name, variant(values[name])];
        values[name] = value.unpack() as boolean | string;
        calls.push(`Changes1.Apply ${name} ${values[name]}`);
        return before;
      });
      return [previous, ''];
    },
  }, '/com/lantharos/Changes1');
}
