mod capture;
mod devices;
mod display;
pub mod fds;
mod folder;
mod mount;
mod profile;
mod proxy;
pub mod seccomp;
mod stand_ins;
mod unsandboxed;
mod wait;
mod wanted;

use std::process::Command;
use std::time::{Duration, Instant};

use luft_software::apps::appimage;
use zbus::Connection;

use crate::app::{App, Grants};
use crate::escalate::{self, Offers, Reason};
use crate::files;
use crate::portal::Bus;
use crate::request::Request;
use capture::Kind;
use display::{wayland, x11};
pub use folder::runtime_dir;
use folder::{Folder, Lock};
pub use profile::INSIDE_LAUNCHER;
use profile::Profile;
use stand_ins::StandIns;
use wait::{Event, Watched};
use wanted::Wanted;

pub const BWRAP: &str = "bwrap";
const QUICK_EXIT: Duration = Duration::from_secs(8);

pub fn run(id: &str, arguments: Vec<String>) -> i32 {
    match start(id, arguments) {
        Ok(code) => code,
        Err(error) => {
            eprintln!("{id} couldn't start: {error}");
            1
        }
    }
}

/// Shows why schelf.store pulled the app in Schelf, which offers to remove it.
fn refuse_pulled(store_id: &str) -> String {
    if let Ok(schelf) = std::env::current_exe() {
        let _ = Command::new(schelf)
            .arg(format!("schelf:app/{store_id}"))
            .spawn();
    }
    "schelf.store pulled it, so it can't start.".to_owned()
}

fn start(id: &str, arguments: Vec<String>) -> Result<i32, String> {
    if let Some(store_id) = appimage::blocked().get(id) {
        return Err(refuse_pulled(store_id));
    }
    let app = App::find(id)?;
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .map_err(|error| error.to_string())?;
    let session = runtime
        .block_on(Connection::session())
        .map_err(|error| error.to_string())?;
    let grants = runtime.block_on(Grants::of(&session, id))?;
    let folder = Folder::of(id)?;
    let lock = folder.lock()?;
    let unsandboxed = (matches!(lock, Lock::Running) && folder.unsandboxed().is_some())
        || (matches!(lock, Lock::Ours(_)) && grants.full_access);
    if unsandboxed {
        let yours = runtime
            .block_on(luft_dbus::environment::yours(&session))
            .unwrap_or_default();
        let arguments = files::unmarked(arguments);
        return match lock {
            Lock::Running => Err(unsandboxed::hand_over(&app, &folder, arguments, &yours)),
            Lock::Ours(_) => unsandboxed::run(&app, &folder, arguments, &yours),
        };
    }
    runtime.block_on(files::mount_point(&session));
    let arguments = runtime.block_on(files::forward(&session, id, arguments))?;
    match lock {
        Lock::Running => {
            folder.wait_for_server()?;
            Request::Launch { arguments }
                .send(folder.connect()?)
                .map_err(|error| error.to_string())?;
            Ok(0)
        }
        Lock::Ours(lock) => {
            let outcome = sandbox(&app, &grants, &folder, arguments);
            folder.clean();
            drop(lock);
            let Ended {
                code,
                reason,
                restart,
            } = outcome?;
            if restart {
                start_again(id);
            } else if let Some(reason) = reason {
                runtime.block_on(escalate::offer(&session, &app.asking(), reason));
            }
            Ok(code)
        }
    }
}

/// Whether a copy of the AppImage is running, in its sandbox or not.
pub fn running(id: &str) -> Result<bool, String> {
    Ok(matches!(Folder::of(id)?.lock()?, Lock::Running))
}

/// Asks the running app to quit, as closing it would, and waits until it
/// has. Returns whether it was running.
pub fn quit(id: &str) -> Result<bool, String> {
    let folder = Folder::of(id)?;
    if !matches!(folder.lock()?, Lock::Running) {
        return Ok(false);
    }
    match folder.unsandboxed() {
        Some(pid) => {
            unsafe { libc::kill(pid, libc::SIGTERM) };
        }
        None => Request::Quit
            .send(folder.connect()?)
            .map_err(|error| error.to_string())?,
    }
    folder.wait_until_closed()?;
    Ok(true)
}

/// How the app's sandbox ended: its exit code, what it may have needed, and
/// whether you asked for it to open again.
struct Ended {
    code: i32,
    reason: Option<Reason>,
    restart: bool,
}

/// Opens the app again, in a sandbox that shows what it was given since.
fn start_again(id: &str) {
    if let Ok(launcher) = std::env::current_exe() {
        let _ = Command::new(launcher)
            .arg(appimage::SANDBOX)
            .arg(id)
            .spawn();
    }
}

fn sandbox(
    app: &App,
    grants: &Grants,
    folder: &Folder,
    arguments: Vec<String>,
) -> Result<Ended, String> {
    folder.prepare()?;
    let talk = proxy::TALK
        .into_iter()
        .chain(grants.bus.iter().map(String::as_str));
    let info = folder.write_sandbox_info(&app.id, talk)?;
    let mounted = mount::Image::mount(&app.image, &folder.mount_point())?;
    let proxy = proxy::Proxy::start(folder, &info, &app.id, &grants.bus)?;
    let display = wayland::SecurityContext::create(&folder.wayland_socket(), &app.id)?;
    profile::write_accounts(&folder.accounts())?;
    let x11 = if grants.x11 {
        x11::Display::of_session(&folder.x11_authority())
    } else {
        Some(x11::Display::stand_in(&folder.x11_socket())?)
    };
    let decoys = devices::Decoys::plant(&folder.decoys(), grants)?;
    let stand_ins = StandIns::plant(&folder.drives(), &profile::home()?, grants)?;
    let filter = seccomp::filter()?;
    let relay = folder.relay();
    let profile = Profile {
        app,
        grants,
        folder,
        info: &info,
        mount: mounted.path(),
        bus: &relay,
        wayland: display.as_ref().map(|_| folder.wayland_socket()),
        x11: x11.as_ref(),
        decoys: &decoys,
        stand_ins: &stand_ins,
    };
    let bus = Bus::start(relay.clone(), proxy.socket(), profile.layout()?)?;
    let instance = folder.instance()?;
    std::fs::create_dir_all(&instance).map_err(|error| error.to_string())?;
    let info_file = std::fs::File::create(instance.join("bwrapinfo.json"))
        .map_err(|error| error.to_string())?;
    let mut command = Command::new(BWRAP);
    command.args(profile.arguments()?);
    filter.pass_to(&mut command);
    fds::pass(&mut command, &info_file, profile::INFO_FD);
    let started = Instant::now();
    let mut child = command.spawn().map_err(|error| error.to_string())?;
    folder.wait_for_server_or(&mut child);
    let pid = sandbox_pid(&instance);
    if let Some(pid) = pid {
        bus.sandbox_started(pid);
    }
    decoys.opened();
    stand_ins.wanted();
    let wanted = Wanted::new(
        app.asking(),
        pid.and_then(crate::drives::pidfd),
        folder.server().join(folder::SERVER_SOCKET),
    );
    let Ok(server) = folder.connect() else {
        let _ = child.kill();
        let _ = child.wait();
        return Err("The sandbox couldn't be set up.".into());
    };
    Request::Launch { arguments }
        .send(server)
        .map_err(|error| error.to_string())?;
    let streams = capture::Watch::start(std::fs::read(&info).map_err(|error| error.to_string())?)?;
    let watched = Watched {
        decoys: &decoys,
        display: x11.as_ref(),
        streams: &streams,
        stand_ins: &stand_ins,
    };
    let mut offers = Offers::new(app.asking());
    let mut display_wanted = false;
    let status = 'running: loop {
        for event in wait::next(&mut child, watched)? {
            match event {
                Event::Exited(status) => break 'running status,
                Event::DisplayWanted => display_wanted = true,
                Event::DeviceOpened => offers.make(Reason::Device),
                Event::CameraOpened | Event::StreamOpened(Kind::Video) => {
                    offers.make(Reason::Camera);
                }
                Event::StreamOpened(Kind::Sound) => offers.make(Reason::Microphone),
                Event::DriveWanted(drive) => wanted.ask(drive),
            }
        }
    };
    drop(display);
    drop(bus);
    drop(proxy);
    drop(mounted);
    let _ = std::fs::remove_dir_all(&instance);
    let quick = started.elapsed() < QUICK_EXIT;
    let reason = if quick && display_wanted {
        Some(Reason::Display)
    } else if quick && !status.success() {
        Some(Reason::Closed)
    } else {
        None
    };
    Ok(Ended {
        code: status.code().unwrap_or(1),
        reason,
        restart: wanted.ended(),
    })
}

/// The sandbox's first process, from what bubblewrap wrote about it.
fn sandbox_pid(instance: &std::path::Path) -> Option<u32> {
    child_pid(&std::fs::read_to_string(instance.join("bwrapinfo.json")).ok()?)
}

/// The first process of a sandbox, as bubblewrap's `--info-fd` names it.
pub fn child_pid(info: &str) -> Option<u32> {
    let (_, rest) = info.split_once("\"child-pid\"")?;
    rest.trim_start_matches([':', ' ', '\t', '\n'])
        .split(|character: char| !character.is_ascii_digit())
        .next()?
        .parse()
        .ok()
}
