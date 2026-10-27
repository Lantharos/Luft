import Gdk from 'gi://Gdk?version=4.0';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';

Gio._promisify(Gdk.Clipboard.prototype, 'read_async');
Gio._promisify(Gio.OutputStream.prototype, 'splice_async');

const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.WindowCapture' });

async function showPasted(window: Gtk.ApplicationWindow) {
  const clipboard = window.get_clipboard();
  const [stream, mimeType] = await clipboard.read_async(clipboard.get_formats().get_mime_types()!, GLib.PRIORITY_DEFAULT, null);
  const contents = Gio.MemoryOutputStream.new_resizable();
  await contents.splice_async(stream!, Gio.OutputStreamSpliceFlags.CLOSE_SOURCE | Gio.OutputStreamSpliceFlags.CLOSE_TARGET, GLib.PRIORITY_DEFAULT, null);
  window.title = `Kestrel paste: ${mimeType} ${GLib.compute_checksum_for_bytes(GLib.ChecksumType.SHA1, contents.steal_as_bytes())}`;
}

function acceptPastes(window: Gtk.ApplicationWindow) {
  const keys = new Gtk.EventControllerKey();
  keys.connect('key-pressed', (_controller, keyval, _keycode, state) => {
    if (keyval !== Gdk.KEY_v || !(state & Gdk.ModifierType.CONTROL_MASK)) return false;
    showPasted(window).catch(logError);
    return true;
  });
  window.add_controller(keys);
  window.set_child(new Gtk.Label({ label: 'Paste here' }));
}

function reportScrolling(window: Gtk.ApplicationWindow) {
  const scroller = new Gtk.ScrolledWindow({ child: new Gtk.Box({ height_request: 6000 }) });
  scroller.vadjustment.connect('value-changed', adjustment => { window.title = `Kestrel scrolled: ${adjustment.value}`; });
  window.set_child(scroller);
}

const HELD = Gdk.ModifierType.SHIFT_MASK | Gdk.ModifierType.CONTROL_MASK | Gdk.ModifierType.ALT_MASK | Gdk.ModifierType.SUPER_MASK | Gdk.ModifierType.META_MASK;

function reportInput(window: Gtk.ApplicationWindow) {
  const report = { scrolled: 0, scrollModifiers: 0, clicks: 0, clickModifiers: 0, typed: '', keyModifiers: 0, modifiers: 0 };
  const show = () => { window.title = `Kestrel input: ${JSON.stringify(report)}`; };
  const scroller = new Gtk.ScrolledWindow({ child: new Gtk.Box({ height_request: 6000 }) });
  scroller.vadjustment.connect('value-changed', adjustment => { report.scrolled = adjustment.value; show(); });
  const scroll = new Gtk.EventControllerScroll({ flags: Gtk.EventControllerScrollFlags.BOTH_AXES, propagation_phase: Gtk.PropagationPhase.CAPTURE });
  scroll.connect('scroll', controller => { report.scrollModifiers = controller.get_current_event_state() & HELD; show(); return false; });
  const click = new Gtk.GestureClick({ propagation_phase: Gtk.PropagationPhase.CAPTURE });
  click.connect('pressed', gesture => { report.clicks++; report.clickModifiers = gesture.get_current_event_state() & HELD; show(); });
  const keys = new Gtk.EventControllerKey();
  keys.connect('key-pressed', (_controller, keyval, _keycode, state) => { report.typed += Gdk.keyval_name(keyval); report.keyModifiers = state & HELD; show(); return false; });
  for (const controller of [scroll, click, keys]) window.add_controller(controller);
  const keyboard = window.get_display().get_default_seat()!.get_keyboard()!;
  keyboard.connect('notify::modifier-state', () => { report.modifiers = keyboard.modifier_state & HELD; show(); });
  window.set_child(scroller);
}

app.connect('activate', () => {
  for (let index = 0; index < (ARGV.includes('--multiple') ? 2 : 1); index++) {
    const window = new Gtk.ApplicationWindow({
      application: app,
      title: `Kestrel window check${ARGV.includes('--multiple') ? ` ${index + 1}` : ''}`,
      default_width: 680,
      default_height: 420,
  });
  if (ARGV.includes('--entry')) {
    const entry = new Gtk.Entry({ margin_top: 160, margin_start: 120, margin_end: 120, valign: Gtk.Align.START });
    let preedit = '';
    const show = () => { window.title = `Kestrel entry: ${entry.text}${preedit ? ` [${preedit}]` : ''}`; };
    entry.connect('changed', show);
    const delegate = entry.get_delegate();
    if (delegate instanceof Gtk.Text) delegate.connect('preedit-changed', (_text, text) => { preedit = text; show(); });
    window.set_child(entry);
  } else if (ARGV.includes('--form')) {
    const form = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 24, margin_top: 120, margin_start: 120, margin_end: 120 });
    form.append(new Gtk.Entry());
    form.append(new Gtk.Button({ label: 'Done', halign: Gtk.Align.START }));
    window.set_child(form);
  } else if (ARGV.includes('--paste')) {
    acceptPastes(window);
  } else if (ARGV.includes('--scroll')) {
    reportScrolling(window);
  } else if (ARGV.includes('--input')) {
    reportInput(window);
  } else {
    window.set_child(new Gtk.Label({ label: 'A window managed by Kestrel' }));
  }
  window.present();
  }
});

app.run([]);
