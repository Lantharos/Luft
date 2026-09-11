use crate::state::{Backend, KestrelState};
use smithay::reexports::calloop::{
    LoopHandle,
    channel::{self, Event},
};
use std::{
    sync::mpsc::{self, Receiver, Sender},
    thread,
};
use tracing::{error, warn};
use zbus::{
    blocking::{Connection, Proxy},
    zvariant::{OwnedFd, OwnedObjectPath},
};

const SERVICE: &str = "org.freedesktop.login1";
const MANAGER: &str = "/org/freedesktop/login1";
const MANAGER_INTERFACE: &str = "org.freedesktop.login1.Manager";

#[derive(Debug)]
enum SessionEvent {
    Lock,
    Sleep(bool),
    Ready,
    Failed(String),
}
#[derive(Debug)]
enum Command {
    Secure(bool),
    Suspend,
    Sleep(bool),
}

#[derive(Debug)]
pub struct SessionCoordinator {
    commands: Option<Sender<Command>>,
    secure: bool,
    ready: bool,
    suspend_pending: bool,
}

impl SessionCoordinator {
    pub fn install<B: Backend>(
        handle: &LoopHandle<'static, KestrelState<B>>,
        enabled: bool,
    ) -> Self {
        let mut coordinator = Self {
            commands: None,
            secure: false,
            ready: false,
            suspend_pending: false,
        };
        if !enabled {
            return coordinator;
        }
        let (events, source) = channel::channel();
        let (commands, receiver) = mpsc::channel();
        handle
            .insert_source(source, |event, _, state| match event {
                Event::Msg(SessionEvent::Lock | SessionEvent::Sleep(true)) => {
                    if let Err(error) = state.request_lock() {
                        error!(%error, "cannot start session locker");
                    }
                }
                Event::Msg(SessionEvent::Sleep(false)) => {
                    state.last_activity = std::time::Instant::now();
                    state.idle_lock_sent = false;
                    state.idle_suspend_sent = false;
                }
                Event::Msg(SessionEvent::Ready) => state.session.ready = true,
                Event::Msg(SessionEvent::Failed(error)) => {
                    state.session.ready = false;
                    error!(%error, "session power integration unavailable");
                }
                Event::Closed => state.session.ready = false,
            })
            .expect("session event source");
        let worker_commands = commands.clone();
        thread::spawn(move || {
            if let Err(error) = run(receiver, worker_commands, events.clone()) {
                let _ = events.send(SessionEvent::Failed(error.to_string()));
            }
        });
        coordinator.commands = Some(commands);
        coordinator
    }

    pub fn update(&mut self, secure: bool) {
        if self.secure != secure {
            self.secure = secure;
            if let Some(commands) = &self.commands {
                let _ = commands.send(Command::Secure(secure));
            }
        }
        if secure && self.suspend_pending {
            self.suspend_pending = false;
            if let Some(commands) = &self.commands {
                let _ = commands.send(Command::Suspend);
            }
        }
    }
}

impl<B: Backend> KestrelState<B> {
    pub(crate) fn request_suspend(&mut self) -> Result<(), String> {
        if !self.session.ready {
            return Err("logind session power service is unavailable".into());
        }
        self.request_lock().map_err(|error| error.to_string())?;
        self.session.suspend_pending = true;
        Ok(())
    }
}

fn run(
    commands: Receiver<Command>,
    sender: Sender<Command>,
    events: channel::Sender<SessionEvent>,
) -> zbus::Result<()> {
    let connection = Connection::system()?;
    let manager = Proxy::new(&connection, SERVICE, MANAGER, MANAGER_INTERFACE)?;
    let session_path: OwnedObjectPath = manager.call("GetSessionByPID", &(std::process::id(),))?;
    let session = Proxy::new(
        &connection,
        SERVICE,
        session_path.clone(),
        "org.freedesktop.login1.Session",
    )?;
    let mut sleep_signals = manager.receive_signal("PrepareForSleep")?;
    let mut lock_signals = session.receive_signal("Lock")?;
    let sleep_events = events.clone();
    thread::spawn(move || {
        for signal in &mut sleep_signals {
            if let Ok(sleeping) = signal.body().deserialize::<bool>() {
                let _ = sleep_events.send(SessionEvent::Sleep(sleeping));
                let _ = sender.send(Command::Sleep(sleeping));
            }
        }
    });
    let lock_events = events.clone();
    thread::spawn(move || {
        for _ in &mut lock_signals {
            let _ = lock_events.send(SessionEvent::Lock);
        }
    });
    let mut inhibitor = Some(inhibit(&manager)?);
    let _ = events.send(SessionEvent::Ready);
    let mut secure = false;
    loop {
        match commands.recv() {
            Ok(Command::Sleep(sleeping)) => {
                if sleeping && secure {
                    inhibitor.take();
                }
                if !sleeping {
                    inhibitor = Some(inhibit(&manager)?);
                }
            }
            Ok(Command::Secure(locked)) => {
                secure = locked;
                session.call::<_, _, ()>("SetLockedHint", &(locked,))?;
                if locked {
                    inhibitor.take();
                } else if inhibitor.is_none() {
                    inhibitor = Some(inhibit(&manager)?);
                }
            }
            Ok(Command::Suspend) => {
                if secure {
                    inhibitor.take();
                    if let Err(error) = manager.call::<_, _, ()>("Suspend", &(true,)) {
                        warn!(%error, "suspend request failed");
                        inhibitor = Some(inhibit(&manager)?);
                    }
                }
            }
            Err(_) => return Ok(()),
        }
    }
}

fn inhibit(manager: &Proxy<'_>) -> zbus::Result<OwnedFd> {
    manager.call(
        "Inhibit",
        &("sleep", "Luft", "Presenting a secure lock screen", "delay"),
    )
}
