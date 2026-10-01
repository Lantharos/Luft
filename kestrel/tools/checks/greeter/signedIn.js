import Gio from 'gi://Gio';

const [eventsPath] = ARGV;

const require = (condition, label) => {
  if (!condition) throw new Error(`Kestrel login screen check failed: ${label}`);
  console.log(`Kestrel login screen check: ${label}`);
};

const events = new TextDecoder().decode(Gio.File.new_for_path(eventsPath).load_contents(null)[1])
  .trim().split('\n').map(line => JSON.parse(line));
const started = events.filter(event => event.type === 'start_session');
require(started.length === 1 && started[0].username === 'ayesha', 'signing in starts exactly one session for the chosen person');
require(started[0].cmd.join(' ') === 'systemd-cat --identifier=kestrel kestrel-session', 'the session starts the chosen session’s command with its output kept in the journal');
require(['XDG_SESSION_TYPE=wayland', 'XDG_SESSION_DESKTOP=kestrel', 'XDG_CURRENT_DESKTOP=Kestrel:GNOME']
  .every(variable => started[0].env.includes(variable)), 'the session gets its type and desktop names');
require(events.some(event => event.type === 'remembered-session' && event.user === 'ayesha' && event.session === 'kestrel'),
  'the chosen session is remembered for next time');
