mod cards;
mod requests;

use std::os::fd::AsFd;
use std::os::unix::net::{UnixListener, UnixStream};
use std::path::PathBuf;
use std::time::{Duration, Instant};

use anyhow::{Context, Result};
use rustix::event::{PollFd, PollFlags, Timespec, poll};
use sushi::config::Config;
use sushi::control;
use sushi::display::{Card, ModeHints};
use sushi::password::PasswordRequests;
use sushi::plymouth::{self, Client};
use sushi::render::Logo;
use sushi::scene::Prompt;
use sushi::terminal::Terminal;
use sushi::uevent::CardEvents;

use crate::activity::Activity;
use crate::notice::Shown;
use crate::screen::{Fader, Look, Screen};
use crate::signals::{Switch, VtSignals};
use crate::unlock::{Answered, Typed, Unlock};

const FRAME: Duration = Duration::from_micros(16_667);
const WATCH_INTERVAL: Duration = Duration::from_millis(16);
const CAPS_LOCK_INTERVAL: Duration = Duration::from_millis(250);
const WAIT_LIMIT: Duration = Duration::from_secs(30);

enum Phase {
    Splash,
    Leaving(Vec<Pending>),
    Waiting(Instant),
    Holding,
}

enum Pending {
    Control(UnixStream),
    Plymouth(Client),
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
    plymouth: Option<plymouth::Server>,
    started: Instant,
    phase: Phase,
    look: Look,
    activity: Activity,
    unlock: Option<Unlock>,
    fading_prompt: Option<Prompt>,
    answered: Answered,
    enrollment_code: Option<String>,
    notice: Option<Shown>,
    fading_notice: Option<sushi::scene::Notice>,
    root: Option<PathBuf>,
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

fn listen_for_plymouth_clients() -> Option<plymouth::Server> {
    plymouth::Server::listen()
        .inspect_err(|error| eprintln!("Plymouth clients can't reach the splash: {error}"))
        .ok()
}

impl Daemon {
    pub fn start() -> Result<Self> {
        let config = Config::load();
        let hints = hints(&config);
        let mut daemon = Self {
            logo: Logo::from_firmware(),
            firmware_size: None,
            screen: None,
            held: None,
            terminal: None,
            signals: VtSignals::catch().context("catching console switches")?,
            away: false,
            requests: PasswordRequests::watch().context("watching password requests")?,
            events: CardEvents::open().context("watching displays")?,
            listener: listen()?,
            plymouth: listen_for_plymouth_clients(),
            started: Instant::now(),
            phase: Phase::Splash,
            look: Look {
                logo: Fader::at(1.0),
                loader: Fader::at(0.0),
                prompt: Fader::at(0.0),
                notice: Fader::at(0.0),
            },
            activity: Activity::new(),
            unlock: None,
            fading_prompt: None,
            answered: Answered::default(),
            enrollment_code: None,
            notice: None,
            fading_notice: None,
            root: None,
            quit: false,
            config,
            hints,
        };
        daemon.find_display();
        if daemon.held.is_none() {
            daemon.take_terminal();
        }
        daemon.settle_loader(daemon.now());
        Ok(daemon)
    }

    fn now(&self) -> f32 {
        self.started.elapsed().as_secs_f32()
    }

    pub fn run(mut self) -> Result<()> {
        self.refresh_unlock();
        self.draw();
        notify_ready();
        while !self.quit {
            if self.wait() {
                self.reopen_terminal();
            }
            self.handle_commands();
            self.handle_plymouth();
            self.handle_switches();
            self.handle_cards();
            self.retake();
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
            Phase::Splash if self.screen.is_none() => self.held.as_ref().map(|_| WATCH_INTERVAL),
            Phase::Splash => {
                let prompt = shown_prompt(&self.unlock, &self.fading_prompt);
                if self.look.is_animating(now, prompt) || self.activity.is_animating(now) {
                    Some(FRAME)
                } else if self.unlock.is_some() || self.notice.is_some() {
                    Some(CAPS_LOCK_INTERVAL)
                } else {
                    None
                }
            }
            Phase::Waiting(_) => Some(WATCH_INTERVAL),
            Phase::Holding => None,
        }
    }

    fn wait(&self) -> bool {
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
        let typing = self.terminal.is_some() && (self.unlock.is_some() || self.notice.is_some());
        if let Some(terminal) = self.terminal.as_ref().filter(|_| typing) {
            fds.push(PollFd::from_borrowed_fd(terminal.as_fd(), PollFlags::IN));
        }
        if let Some(server) = &self.plymouth {
            fds.extend(
                server
                    .fds()
                    .map(|fd| PollFd::from_borrowed_fd(fd, PollFlags::IN)),
            );
        }
        let _ = poll(&mut fds, timeout.as_ref());
        typing
            && fds[4]
                .revents()
                .intersects(PollFlags::HUP | PollFlags::ERR | PollFlags::NVAL)
    }

    fn reopen_terminal(&mut self) {
        eprintln!("The console hung up, opening it again");
        self.terminal = None;
        self.take_terminal();
        if let Some(terminal) = &self.terminal {
            let _ = terminal.listen();
        }
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
                        self.away = false;
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

    fn take_terminal(&mut self) {
        if self.terminal.is_none() && matches!(self.phase, Phase::Splash) {
            self.terminal = Terminal::open().ok();
            if let Some(terminal) = &self.terminal {
                terminal.hold();
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
        self.plymouth = None;
        self.quit = true;
    }

    fn refresh_unlock(&mut self) {
        if !matches!(self.phase, Phase::Splash) {
            return;
        }
        if self.unlock.as_ref().is_some_and(|unlock| !unlock.is_live()) {
            self.close_prompt();
        }
        if self.unlock.is_none()
            && self.notice.is_none()
            && let Some(unlock) = Unlock::next(&self.requests, &self.answered, self.now())
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
        self.settle_loader(now);
    }

    fn settle_loader(&mut self, now: f32) {
        let covered = self.unlock.is_some() || self.notice.is_some() || self.activity.is_showing();
        self.look.loader.fade_to(if covered { 0.0 } else { 1.0 }, now);
    }

    fn handle_keys(&mut self) {
        if self.notice.is_some() {
            let pressed_enter = self
                .terminal
                .as_mut()
                .is_some_and(|terminal| terminal.keys().contains(&sushi::terminal::Key::Enter));
            if pressed_enter || self.notice.as_ref().is_some_and(Shown::expired) {
                self.dismiss_notice();
            }
            return;
        }
        let (Some(terminal), Some(unlock)) = (&mut self.terminal, &mut self.unlock) else {
            return;
        };
        unlock.set_caps_lock(terminal.caps_lock());
        if let Typed::Answered = unlock.type_keys(terminal, &mut self.answered) {
            self.close_prompt();
        }
    }

    fn advance(&mut self) {
        let now = self.now();
        if self.fading_prompt.is_some() && self.look.prompt.settled(now) {
            self.fading_prompt = None;
        }
        if self.fading_notice.is_some() && self.look.notice.settled(now) {
            self.fading_notice = None;
        }
        match std::mem::replace(&mut self.phase, Phase::Holding) {
            Phase::Leaving(pending) if self.look.settled(now) || self.screen.is_none() => {
                self.draw();
                if let Some(screen) = &self.screen {
                    screen.share_logo_placement();
                    screen.release_master();
                }
                if let Some(terminal) = &self.terminal {
                    terminal.clear();
                }
                let _ = std::fs::remove_file(control::PID_FILE);
                pending.into_iter().for_each(|waiter| self.finish(waiter));
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
                    self.plymouth = None;
                    if let Some(screen) = self.screen.take() {
                        self.held = Some(screen.into_card());
                    }
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
        let status = self.activity.status(now);
        let prompt = shown_prompt(&self.unlock, &self.fading_prompt);
        let notice = self
            .notice
            .as_ref()
            .map(|shown| &shown.notice)
            .or(self.fading_notice.as_ref());
        if let Some(screen) = &mut self.screen
            && let Err(error) = screen.draw(&self.look, now, prompt, status, notice)
        {
            eprintln!("Lost {}: {error}", screen.path().display());
            self.screen = None;
        }
    }
}

fn shown_prompt<'a>(unlock: &'a Option<Unlock>, fading: &'a Option<Prompt>) -> Option<&'a Prompt> {
    unlock
        .as_ref()
        .map(|unlock| &unlock.prompt)
        .or(fading.as_ref())
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
