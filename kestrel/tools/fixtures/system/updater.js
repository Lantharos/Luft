import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const SYSTEM_PACKAGES = `<node><interface name="com.lantharos.Updater1.SystemPackages">
  <method name="List"><arg type="s" direction="out"/></method>
  <method name="DescribeRepository">
    <arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{ss}" direction="in"/><arg type="s" direction="out"/>
  </method>
</interface></node>`;

export const UPDATER_NAME = 'com.lantharos.Updater1';

function sources(text) {
  const found = [];
  let current = null;
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

function keyOf(armored) {
  const file = Gio.File.new_tmp('updater-key-XXXXXX.asc')[0];
  file.replace_contents(new TextEncoder().encode(armored), null, false, Gio.FileCreateFlags.NONE, null);
  const [, output] = GLib.spawn_command_line_sync(`gpg --show-keys --with-colons ${GLib.shell_quote(file.get_path())}`);
  file.delete(null);
  const lines = new TextDecoder().decode(output).split('\n').map(line => line.split(':'));
  return {fingerprint: lines.find(fields => fields[0] === 'fpr')?.[9] ?? '', user: lines.find(fields => fields[0] === 'uid')?.[9] ?? ''};
}

export function publishUpdater(publish) {
  publish(SYSTEM_PACKAGES, {
    List: () => JSON.stringify({requested: [], packages: [], services: [], pending: false, repositories: []}),
    DescribeRepository: (file, text, keys) => JSON.stringify({file, sources: sources(text), keys: Object.values(keys).map(keyOf)}),
  }, '/com/lantharos/Updater1');
}
