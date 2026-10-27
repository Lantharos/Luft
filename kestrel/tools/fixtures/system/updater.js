import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const SYSTEM_PACKAGES = `<node><interface name="com.lantharos.Updater1.SystemPackages">
  <method name="List"><arg type="s" direction="out"/></method>
  <method name="DescribeRepository">
    <arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{ss}" direction="in"/><arg type="s" direction="out"/>
  </method>
</interface></node>`;

const UPDATER = `<node><interface name="com.lantharos.Updater1">
  <property name="Downloading" type="b" access="read"/>
  <method name="Status"><arg type="s" direction="out"/></method>
</interface></node>`;

export const UPDATER_NAME = 'com.lantharos.Updater1';
const VERSION = '1.2-nightly.21';
const DIGEST = 'sha256:4c5f0f8a1b6e2d7c9a3e5b1f7d2c8a6e4b0f9d3c7a1e5b2f8d6c4a0e9b3f7d1c';

const status = () => JSON.stringify({
  host: {
    spec: {image: null},
    status: {
      booted: {image: {image: {image: 'ghcr.io/lantharos/luft:1-nightly', transport: 'registry'}, version: VERSION, imageDigest: DIGEST}},
      staged: null,
      rollback: null,
      rollbackQueued: false,
    },
  },
  configs: {[DIGEST]: {created: '2026-10-27T02:14:09Z', config: {Labels: {'org.opencontainers.image.version': VERSION}}}},
});

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
  publish(UPDATER, {Downloading: false, Status: status}, '/com/lantharos/Updater1');
  publish(SYSTEM_PACKAGES, {
    List: () => JSON.stringify({requested: [], packages: [], services: [], pending: false, repositories: []}),
    DescribeRepository: (file, text, keys) => JSON.stringify({file, sources: sources(text), keys: Object.values(keys).map(keyOf)}),
  }, '/com/lantharos/Updater1');
}
