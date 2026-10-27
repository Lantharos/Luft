import Gio from 'gi://Gio';

const [eventsPath] = ARGV;

interface Event {
  type: string;
  [field: string]: unknown;
}

interface Started extends Event {
  username: string;
  cmd: string[];
  env: string[];
}

const require = (condition: boolean, label: string) => {
  if (!condition) throw new Error(`Kestrel login screen check failed: ${label}`);
  console.log(`Kestrel login screen check: ${label}`);
};

const events = new TextDecoder().decode(Gio.File.new_for_path(eventsPath).load_contents(null)[1])
  .trim().split('\n').map((line): Event => JSON.parse(line));
const started = events.filter((event): event is Started => event.type === 'start_session');
require(started.length === 1 && started[0].username === 'mara', 'signing in starts exactly one session for the chosen person');
require(started[0].cmd.join(' ') === 'systemd-cat --identifier=kestrel kestrel-session', 'the session starts the chosen session’s command with its output kept in the journal');
require(['XDG_SESSION_TYPE=wayland', 'XDG_SESSION_DESKTOP=kestrel', 'XDG_CURRENT_DESKTOP=Kestrel:GNOME']
  .every(variable => started[0].env.includes(variable)), 'the session gets its type and desktop names');
require(started[0].env.includes('LANG=de_DE.UTF-8'), 'the session starts in the person’s own language');
require(events.some(event => event.type === 'remembered-session' && event.user === 'mara' && event.session === 'kestrel'),
  'the chosen session is remembered for next time');
