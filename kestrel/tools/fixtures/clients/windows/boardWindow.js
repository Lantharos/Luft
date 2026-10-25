import Gdk from 'gi://Gdk?version=4.0';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

const [title, width, height, state] = ARGV;
const MOVE_HANDLE = 32;
const GESTURES = {[Gdk.EventType.TOUCHPAD_PINCH]: 'p', [Gdk.EventType.TOUCHPAD_SWIPE]: 's'};
const PHASES = {
  [Gdk.TouchpadGesturePhase.BEGIN]: 'b',
  [Gdk.TouchpadGesturePhase.UPDATE]: 'u',
  [Gdk.TouchpadGesturePhase.END]: 'e',
  [Gdk.TouchpadGesturePhase.CANCEL]: 'c',
};
const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.BoardWindow', flags: Gio.ApplicationFlags.NON_UNIQUE });

app.connect('activate', () => {
  const window = new Gtk.ApplicationWindow({ application: app, title, default_width: Number(width), default_height: Number(height) });
  const body = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
  const entry = new Gtk.Entry({ margin_top: 40, margin_start: 40, margin_end: 40, valign: Gtk.Align.START });
  const click = new Gtk.GestureClick();
  let clicked = '';
  let scale = '';
  const gestures = [];
  const show = () => { window.title = `${title}${entry.text ? `: ${entry.text}` : ''}${clicked}${scale}${gestures.length ? ` ~${gestures.join(',')}` : ''}`; };
  const touchpad = new Gtk.EventControllerLegacy();
  touchpad.connect('event', (_controller, event) => {
    const gesture = GESTURES[event.get_event_type()];
    if (!gesture) return false;
    const step = gesture + PHASES[event.get_gesture_phase()];
    if (gestures.at(-1) !== step) {
      gestures.push(step);
      show();
    }
    return true;
  });
  window.add_controller(touchpad);
  click.connect('pressed', (_gesture, _count, x, y) => {
    clicked = ` @${Math.round(x)},${Math.round(y)}`;
    show();
  });
  body.add_controller(click);
  const handle = new Gtk.GestureClick();
  handle.connect('pressed', (gesture, _count, x, y) => {
    if (y < body.get_height() - MOVE_HANDLE) return;
    window.get_surface().begin_move(gesture.get_current_event_device(), gesture.get_current_button(), x, y, gesture.get_current_event_time());
  });
  body.add_controller(handle);
  entry.connect('changed', show);
  body.append(entry);
  window.set_child(body);
  window.connect('realize', () => window.get_surface().connect('notify::scale', surface => {
    scale = surface.scale === 1 ? '' : ` x${surface.scale.toFixed(2)}`;
    show();
  }));
  if (state === 'maximized') window.maximize();
  window.present();
});

app.run([]);
