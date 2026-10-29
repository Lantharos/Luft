import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {Publish} from './bus.js';

const PACKAGES = `<node><interface name="com.lantharos.Packages1">
  <method name="List"><arg type="s" direction="out"/></method>
  <method name="DescribeRepository">
    <arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{ss}" direction="in"/><arg type="s" direction="out"/>
  </method>
  <property name="Busy" type="b" access="read"/>
</interface></node>`;

export const PACKAGES_NAME = 'com.lantharos.Packages1';

interface Source {
  id: string;
  name: string;
  url: string;
}

function sources(text: string) {
  const found: Source[] = [];
  let current: Source | null = null;
  for (const line of text.split('\n').map(entry => entry.trim())) {
    const section = /^\[(.+)\]$/.exec(line);
    if (section) {
      current = {id: section[1], name: section[1], url: ''};
      found.push(current);
    } else if (current && line.startsWith('name=')) {
      current.name = line.slice('name='.length);
    } else if (current && line.startsWith('baseurl=')) {
      current.url = line.slice('baseurl='.length);
    }
  }
  return found;
}

function keyOf(armored: string) {
  const file = Gio.File.new_tmp('packages-key-XXXXXX.asc')[0];
  file.replace_contents(new TextEncoder().encode(armored), null, false, Gio.FileCreateFlags.NONE, null);
  const [, output] = GLib.spawn_command_line_sync(`gpg --show-keys --with-colons ${GLib.shell_quote(file.get_path()!)}`);
  file.delete(null);
  const lines = new TextDecoder().decode(output!).split('\n').map(line => line.split(':'));
  return {fingerprint: lines.find(fields => fields[0] === 'fpr')?.[9] ?? '', user: lines.find(fields => fields[0] === 'uid')?.[9] ?? ''};
}

export function publishPackages(publish: Publish) {
  publish(PACKAGES, {
    List: () => JSON.stringify({requested: [], packages: [], services: [], pending: false, repositories: []}),
    DescribeRepository: (file: string, text: string, keys: Record<string, string>) => JSON.stringify({file, sources: sources(text), keys: Object.values(keys).map(keyOf)}),
    Busy: false,
  }, '/com/lantharos/Packages1');
}
