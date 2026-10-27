import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const NAME = 'com.lantharos.Speech1';
const PATH = '/com/lantharos/Speech1';
const INTERFACE = `<node><interface name="${NAME}">
  <method name="Start"><arg name="layout" type="s" direction="in"/></method>
  <method name="Stop"><arg name="text" type="s" direction="out"/></method>
  <method name="Cancel"/>
  <signal name="Partial"><arg name="text" type="s"/></signal>
  <signal name="Quiet"/>
  <signal name="Level"><arg name="level" type="d"/></signal>
</interface></node>`;
const WORDS = 'Pick up some bread and coffee on the way home tonight'.split(' ');
const LEVEL_MS = 50;
const WORD_MS = 350;
const RECOGNIZING_MS = 4000;

let listening: {recorder: Gio.Subprocess; words: number; sources: number[]} | null = null;

function speechLevel(seconds: number) {
  const syllables = Math.sin(seconds * 9.5) ** 2 * (0.6 + 0.4 * Math.sin(seconds * 2.1));
  const pause = Math.sin(seconds * 0.9) > 0.85 ? 0.3 : 1;
  return 0.3 + 0.5 * syllables * pause;
}

function stopListening() {
  if (!listening) return '';
  for (const source of listening.sources) GLib.source_remove(source);
  listening.recorder.force_exit();
  const heard = WORDS.slice(0, listening.words).join(' ');
  listening = null;
  return heard;
}

const service = Gio.DBusExportedObject.wrapJSObject(INTERFACE, {
  Start() {
    stopListening();
    const started = GLib.get_monotonic_time();
    const recorder = Gio.Subprocess.new(['parecord', '--device=microphone', '--property=application.id=com.lantharos.Speech', '/dev/null'],
      Gio.SubprocessFlags.NONE);
    listening = {recorder, words: 0, sources: []};
    const state = listening;
    state.sources.push(GLib.timeout_add(GLib.PRIORITY_DEFAULT, LEVEL_MS, () => {
      service.emit_signal('Level', new GLib.Variant('(d)', [speechLevel((GLib.get_monotonic_time() - started) / 1e6)]));
      return GLib.SOURCE_CONTINUE;
    }));
    state.sources.push(GLib.timeout_add(GLib.PRIORITY_DEFAULT, WORD_MS, () => {
      state.words = Math.min(WORDS.length, state.words + 1);
      service.emit_signal('Partial', new GLib.Variant('(s)', [WORDS.slice(0, state.words).join(' ')]));
      return GLib.SOURCE_CONTINUE;
    }));
  },
  StopAsync(_parameters: [], invocation: Gio.DBusMethodInvocation) {
    const heard = stopListening();
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, RECOGNIZING_MS, () => {
      invocation.return_value(new GLib.Variant('(s)', [heard]));
      return GLib.SOURCE_REMOVE;
    });
  },
  Cancel() {
    stopListening();
  },
});

service.export(Gio.DBus.session, PATH);
Gio.bus_own_name_on_connection(Gio.DBus.session, NAME, Gio.BusNameOwnerFlags.NONE, null, () => {
  throw new Error(`Couldn't own ${NAME}`);
});
new GLib.MainLoop(null, false).run();
