use std::io::{BufRead, BufReader, Write};
use std::os::fd::AsFd;
use std::os::unix::net::{UnixListener, UnixStream};
use std::path::Path;
use std::time::{Duration, Instant};

use anyhow::{Context, Result};
use rustix::event::{PollFd, PollFlags, Timespec, poll};
use sushi::config::Config;
use sushi::control::{self, Command};
use sushi::display::{Card, Display, ModeHints};
use sushi::password::PasswordRequests;
use sushi::render::Logo;
use sushi::scene::Prompt;
use sushi::terminal::Terminal;
use sushi::uevent::{CardEvent, CardEvents};

use crate::screen::{Fader, Look, Screen};
use crate::signals::{Switch, VtSignals};
use crate::unlock::{Typed, Unlock};

const FRAME: Duration = Duration::from_micros(16_667);
const WATCH_INTERVAL: Duration = Duration::from_millis(16);
const CAPS_LOCK_INTERVAL: Duration = Duration::from_millis(250);
const WAIT_LIMIT: Duration = Duration::from_secs(30);

enum Phase {
    Splash,
    Leaving(UnixStream),
    Waiting(Instant),
    Holding,
}

pub struct Daemon {
    config: Config,
    hints: ModeHints,
    logo: Option<Logo>,
    firmware_size: Option<(u32, u32)>,
    screen: Option<Screen>,
    held: Option<Card>,
    terminal: Option<Terminal>,
    signals: VtSignals,
    away: bool,
    requests: PasswordRequests,
    events: CardEvents,
    listener: UnixListener,
    started: Instant,
    phase: Phase,
    look: Look,
    unlock: Option<Unlock>,
    fading_prompt: Option<Prompt>,
    last_answered: Option<String>,
    quit: bool,
}

fn listen() -> Result<UnixListener> {
    std::fs::create_dir_all(control::RUNTIME_DIR)?;
    let _ = std::fs::remove_file(control::SOCKET);
    let listener = UnixListener::bind(control::SOCKET).context("binding the control socket")?;
    listener.set_nonblocking(true)?;
    std::fs::write(control::PID_FILE, format!("{}\n", std::process::id()))?;
    Ok(listener)
}

impl Daemon {
    pub fn start() -> Result<Self> {
        let config = Config::load();
        let hints = hints(&config);
        let terminal = Terminal::open().ok();
        if let Some(terminal) = &terminal {
            terminal.hold();
        }
        let mut daemon = Self {
            logo: Logo::from_firmware(),
            firmware_size: None,
            screen: None,
            held: None,
            terminal,
            signals: VtSignals::catch().context("catching console switches")?,
            away: false,
            requests: PasswordRequests::watch().context("watching password requests")?,
            events: CardEvents::open().context("watching displays")?,
            listener: listen()?,
            started: Instant::now(),
            phase: Phase::Splash,
            look: Look {
                logo: Fader::at(1.0),
                loader: Fader::at(0.0),
                prompt: Fader::at(0.0),
            },
            unlock: None,
            fading_prompt: None,
            last_answered: None,
            quit: false,
            config,
            hints,
        };
        if let Some(display) = Display::find(&daemon.hints) {
            daemon.adopt(display);
        }
        daemon.look.loader.fade_to(1.0, daemon.now());
        Ok(daemon)
    }

    fn now(&self) -> f32 {
        self.started.elapsed().as_secs_f32()
    }

    fn adopt(&mut self, display: Display) {
        eprintln!(
            "Showing the splash on {} at {:?}",
            display.path().display(),
            display.sizes()
        );
        let size = *self.firmware_size.get_or_insert_with(|| display.sizes()[0]);
        let old = self
            .screen
            .replace(Screen::new(display, self.logo.as_ref(), size));
        if let Some(old) = old {
            drop(old.into_card());
        }
    }

    pub fn run(mut self) -> Result<()> {
        self.refresh_unlock();
        self.draw();
        notify_ready();
        while !self.quit {
            self.wait();
            self.handle_commands();
            self.handle_switches();
            self.handle_cards();
            self.requests.drain();
            self.refresh_unlock();
            self.handle_keys();
            self.advance();
            self.draw();
        }
        let _ = std::fs::remove_file(control::SOCKET);
        let _ = std::fs::remove_file(control::PID_FILE);
        Ok(())
    }

    fn next_wakeup(&self) -> Option<Duration> {
        let now = self.now();
        match &self.phase {
            Phase::Leaving(_) => Some(FRAME),
            Phase::Splash => {
                let prompt = self
                    .unlock
                    .as_ref()
                    .map(|unlock| &unlock.prompt)
                    .or(self.fading_prompt.as_ref());
                if self.screen.is_some() && self.look.is_animating(now, prompt) {
                    Some(FRAME)
                } else if self.unlock.is_some() {
                    Some(CAPS_LOCK_INTERVAL)
                } else {
                    None
                }
            }
            Phase::Waiting(_) => Some(WATCH_INTERVAL),
            Phase::Holding => None,
        }
    }

    fn wait(&self) {
        let timeout = self.next_wakeup().map(|wait| Timespec {
            tv_sec: wait.as_secs() as i64,
            tv_nsec: wait.subsec_nanos() as i64,
        });
        let mut fds = vec![
            PollFd::new(&self.listener, PollFlags::IN),
            PollFd::new(&self.events, PollFlags::IN),
            PollFd::new(&self.requests, PollFlags::IN),
            PollFd::new(&self.signals, PollFlags::IN),
        ];
        if let (Some(terminal), Some(_)) = (&self.terminal, &self.unlock) {
            fds.push(PollFd::from_borrowed_fd(terminal.as_fd(), PollFlags::IN));
        }
        let _ = poll(&mut fds, timeout.as_ref());
    }

    fn handle_commands(&mut self) {
        while let Ok((stream, _)) = self.listener.accept() {
            let _ = stream.set_nonblocking(false);
            let _ = stream.set_read_timeout(Some(Duration::from_secs(1)));
            let mut line = String::new();
            if BufReader::new(&stream).read_line(&mut line).is_err() {
                continue;
            }
            match Command::parse(&line) {
                Some(command) => self.handle(command, stream),
                None => reply(stream, "unknown command"),
            }
        }
    }

    fn handle(&mut self, command: Command, stream: UnixStream) {
        match command {
            Command::Deactivate => self.deactivate(stream),
            Command::Quit => {
                self.leave_to_text();
                reply(stream, "ok");
            }
            Command::UpdateRoot(root) => match enter_root(&root) {
                Ok(()) => {
                    self.config = Config::load();
                    self.hints = hints(&self.config);
                    eprintln!("Moved into {}", root.display());
                    reply(stream, "ok");
                }
                Err(error) => reply(stream, &error.to_string()),
            },
            Command::Status => reply(stream, self.status()),
        }
    }

    fn status(&self) -> &'static str {
        match self.phase {
            Phase::Splash => "showing",
            Phase::Leaving(_) => "leaving",
            Phase::Waiting(_) => "waiting",
            Phase::Holding => "holding",
        }
    }

    fn deactivate(&mut self, stream: UnixStream) {
        if !matches!(self.phase, Phase::Splash) {
            reply(stream, "ok");
            return;
        }
        eprintln!("Handing the display over");
        let now = self.now();
        self.unlock = None;
        self.look.loader.fade_to(0.0, now);
        self.look.prompt.fade_to(0.0, now);
        self.phase = Phase::Leaving(stream);
    }

    fn handle_switches(&mut self) {
        for switch in self.signals.drain() {
            let Some(terminal) = &self.terminal else {
                continue;
            };
            match switch {
                Switch::Leave => {
                    terminal.allow_leaving();
                    self.away = true;
                    if !matches!(self.phase, Phase::Splash) {
                        terminal.give_back();
                        self.terminal = None;
                    }
                }
                Switch::Return => {
                    terminal.accept_return();
                    self.away = false;
                    if let Some(screen) = &mut self.screen {
                        screen.invalidate();
                    }
                }
            }
        }
    }

    fn leave_to_text(&mut self) {
        eprintln!("Returning to the text console");
        if let Some(terminal) = self.terminal.take() {
            terminal.give_back();
        }
        drop(self.screen.take().map(Screen::into_card));
        self.held = None;
        self.quit = true;
    }

    fn handle_cards(&mut self) {
        for event in self.events.drain() {
            match (&self.phase, event) {
                (Phase::Splash | Phase::Leaving(_), CardEvent::Added(path)) => {
                    if let Ok(display) = Display::open(&path, &self.hints) {
                        self.adopt(display);
                    }
                }
                (Phase::Splash | Phase::Leaving(_), CardEvent::Changed(path))
                    if self.shows(&path) =>
                {
                    let size = self.firmware_size.unwrap_or_default();
                    self.screen = self.screen.take().and_then(|screen| {
                        screen.refresh(&self.hints, self.logo.as_ref(), size).ok()
                    });
                }
                (_, CardEvent::Removed(path)) => {
                    if self.shows(&path) {
                        eprintln!("{} went away", path.display());
                        self.screen = None;
                    }
                    if self.held.as_ref().is_some_and(|card| card.path() == path) {
                        self.held = None;
                    }
                }
                (Phase::Holding, CardEvent::Added(path)) if self.held.is_none() => {
                    self.held = Card::open(&path).ok();
                }
                _ => {}
            }
        }
    }

    fn shows(&self, path: &Path) -> bool {
        self.screen
            .as_ref()
            .is_some_and(|screen| screen.path() == path)
    }

    fn refresh_unlock(&mut self) {
        if !matches!(self.phase, Phase::Splash) {
            return;
        }
        if self.unlock.as_ref().is_some_and(|unlock| !unlock.is_live()) {
            self.close_prompt();
        }
        if self.unlock.is_none()
            && let Some(unlock) =
                Unlock::next(&self.requests, self.last_answered.as_deref(), self.now())
        {
            if let Some(terminal) = &self.terminal {
                let _ = terminal.listen();
            }
            let now = self.now();
            self.look.loader.fade_to(0.0, now);
            self.look.prompt.fade_to(1.0, now);
            self.fading_prompt = None;
            self.unlock = Some(unlock);
        }
    }

    fn close_prompt(&mut self) {
        let now = self.now();
        if let Some(terminal) = &self.terminal {
            terminal.stop_listening();
        }
        self.fading_prompt = self.unlock.take().map(|unlock| unlock.prompt);
        self.look.prompt.fade_to(0.0, now);
        self.look.loader.fade_to(1.0, now);
    }

    fn handle_keys(&mut self) {
        let (Some(terminal), Some(unlock)) = (&mut self.terminal, &mut self.unlock) else {
            return;
        };
        unlock.prompt.caps_lock = terminal.caps_lock();
        if let Typed::Answered = unlock.type_keys(terminal) {
            self.last_answered = Some(unlock.id().to_owned());
            self.close_prompt();
        }
    }

    fn advance(&mut self) {
        let now = self.now();
        if self.fading_prompt.is_some() && self.look.prompt.settled(now) {
            self.fading_prompt = None;
        }
        match std::mem::replace(&mut self.phase, Phase::Holding) {
            Phase::Leaving(stream) if self.look.settled(now) || self.screen.is_none() => {
                self.draw();
                if let Some(screen) = &self.screen {
                    screen.share_logo_placement();
                    screen.release_master();
                }
                if let Some(terminal) = &self.terminal {
                    terminal.clear();
                }
                let _ = std::fs::remove_file(control::PID_FILE);
                reply(stream, "ok");
                eprintln!("Released the display to the next program");
                self.phase = Phase::Waiting(Instant::now());
            }
            Phase::Waiting(since) => {
                let replaced = self
                    .screen
                    .as_ref()
                    .is_none_or(|screen| screen.display().replaced());
                if replaced || since.elapsed() > WAIT_LIMIT {
                    eprintln!(
                        "{} after {} ms",
                        if replaced {
                            "The next program showed its first frame"
                        } else {
                            "Stopped waiting for the next program to draw"
                        },
                        since.elapsed().as_millis()
                    );
                    let _ = std::fs::remove_file(control::LOGO_PLACEMENT);
                    self.terminal = None;
                    self.held = self.screen.take().map(Screen::into_card);
                    self.phase = Phase::Holding;
                } else {
                    self.phase = Phase::Waiting(since);
                }
            }
            phase => self.phase = phase,
        }
    }

    fn draw(&mut self) {
        if self.away || !matches!(self.phase, Phase::Splash | Phase::Leaving(_)) {
            return;
        }
        let now = self.now();
        let prompt = self
            .unlock
            .as_ref()
            .map(|unlock| &unlock.prompt)
            .or(self.fading_prompt.as_ref());
        if let Some(screen) = &mut self.screen
            && screen.draw(&self.look, now, prompt).is_err()
        {
            self.screen = None;
        }
    }
}

fn hints(config: &Config) -> ModeHints {
    let hints = config
        .monitors
        .as_deref()
        .map(ModeHints::load)
        .unwrap_or_default();
    if let Some(path) = config.monitors.as_deref().filter(|_| !hints.is_empty()) {
        eprintln!("Using the display modes saved in {}", path.display());
    }
    hints
}

fn notify_ready() {
    use std::os::linux::net::SocketAddrExt;
    use std::os::unix::net::{SocketAddr, UnixDatagram};

    let Some(socket) = std::env::var("NOTIFY_SOCKET").ok() else {
        return;
    };
    let address = match socket.strip_prefix('@') {
        Some(name) => SocketAddr::from_abstract_name(name),
        None => SocketAddr::from_pathname(&socket),
    };
    if let (Ok(sender), Ok(address)) = (UnixDatagram::unbound(), address) {
        let _ = sender.send_to_addr(b"READY=1", &address);
    }
}

fn reply(mut stream: UnixStream, message: &str) {
    let _ = stream.write_all(format!("{message}\n").as_bytes());
}

fn enter_root(root: &Path) -> std::io::Result<()> {
    rustix::process::chroot(root)?;
    std::env::set_current_dir("/")
}
