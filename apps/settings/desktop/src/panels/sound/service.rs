use std::cell::{Cell, RefCell};
use std::io::{Read, Write};
use std::os::fd::AsRawFd;
use std::os::unix::net::UnixStream;
use std::rc::Rc;
use std::sync::Mutex;
use std::sync::mpsc::{self, Receiver, Sender};

use libpulse_binding::context::{self, Context};
use libpulse_binding::mainloop::api::Mainloop as _;
use libpulse_binding::mainloop::events::io::FlagSet as IoFlags;
use libpulse_binding::mainloop::standard::{IterateResult, Mainloop};
use libpulse_binding::proplist::{Proplist, properties};
use luft_app::Events;

use super::pulse::Pulse;
use super::{AlertVolume, Balance, DefaultDevice, Meter, MoveApp, Mute, Port, Profile, Volume};

const APP_ID: &str = "dev.lantharos.settings";
const UNAVAILABLE: &str = "Sound isn't available right now";

pub enum Command {
    Publish,
    SetDefault(DefaultDevice),
    SetVolume(Volume),
    SetMute(Mute),
    SetBalance(Balance),
    SetPort(Port),
    SetProfile(Profile),
    MoveApp(MoveApp),
    SetAlertVolume(AlertVolume),
    Meter(Meter),
}

struct Service {
    commands: Sender<Command>,
    wake: UnixStream,
}

static SERVICE: Mutex<Option<Service>> = Mutex::new(None);

impl Service {
    fn start(events: Events) -> Result<Self, String> {
        let (commands, receiver) = mpsc::channel();
        let (wake, woken) = UnixStream::pair().map_err(|error| error.to_string())?;
        woken
            .set_nonblocking(true)
            .map_err(|error| error.to_string())?;
        std::thread::Builder::new()
            .name("sound".into())
            .spawn(move || run(events, receiver, woken))
            .map_err(|error| error.to_string())?;
        Ok(Self { commands, wake })
    }

    fn send(&self, command: Command) -> Result<(), Command> {
        self.commands.send(command).map_err(|error| error.0)?;
        let _ = (&self.wake).write_all(&[0]);
        Ok(())
    }
}

pub fn send(events: &Events, command: Command) -> Result<(), String> {
    let mut slot = SERVICE.lock().map_err(|error| error.to_string())?;
    let command = match slot.as_ref() {
        Some(service) => match service.send(command) {
            Ok(()) => return Ok(()),
            Err(command) => command,
        },
        None => command,
    };
    let service = Service::start(events.clone())?;
    service.send(command).map_err(|_| UNAVAILABLE.to_owned())?;
    *slot = Some(service);
    Ok(())
}

fn client_properties() -> Option<Proplist> {
    let mut proplist = Proplist::new()?;
    proplist
        .set_str(properties::APPLICATION_NAME, "Settings")
        .ok()?;
    proplist.set_str(properties::APPLICATION_ID, APP_ID).ok()?;
    proplist
        .set_str(properties::APPLICATION_ICON_NAME, "preferences-system")
        .ok()?;
    Some(proplist)
}

fn drain(mut woken: &UnixStream) {
    let mut buffer = [0; 64];
    while matches!(woken.read(&mut buffer), Ok(read) if read > 0) {}
}

fn run(events: Events, commands: Receiver<Command>, woken: UnixStream) {
    let Some(mut mainloop) = Mainloop::new() else {
        return;
    };
    let Some(context) = client_properties()
        .and_then(|proplist| Context::new_with_proplist(&mainloop, "Settings", &proplist))
    else {
        return;
    };
    let context = Rc::new(RefCell::new(context));
    if context
        .borrow_mut()
        .connect(None, context::FlagSet::NOFLAGS, None)
        .is_err()
    {
        return;
    }

    let pulse = Pulse::new(Rc::clone(&context), events);
    let alive = Rc::new(Cell::new(true));
    context.borrow_mut().set_state_callback(Some(Box::new({
        let context = Rc::clone(&context);
        let pulse = pulse.clone();
        let alive = Rc::clone(&alive);
        move || {
            let state = context.borrow().get_state();
            match state {
                context::State::Ready => pulse.start(),
                context::State::Failed | context::State::Terminated => alive.set(false),
                _ => {}
            }
        }
    })));

    let _commands = mainloop.new_io_event(
        woken.as_raw_fd(),
        IoFlags::INPUT,
        Box::new(move |_, _, _| {
            drain(&woken);
            while let Ok(command) = commands.try_recv() {
                pulse.handle(command);
            }
        }),
    );

    while alive.get() {
        if let IterateResult::Quit(_) | IterateResult::Err(_) = mainloop.iterate(true) {
            break;
        }
    }
}
