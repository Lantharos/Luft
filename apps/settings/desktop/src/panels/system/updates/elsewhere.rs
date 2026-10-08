use std::ffi::OsStr;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::path::Path;

use inotify::{Inotify, WatchMask};
use luft_app::dbus;
use luft_software::packagekit::{
    self,
    running::{self, Change, Running},
};

use super::overview;
use super::state::{self, Activity, Elsewhere, Kind};

const RUN: &str = "/run";
const DNF_FOLDER: &str = "dnf";
const DNF_LOCK: &str = "rpmtransaction.lock";
const PACKAGEKIT_DAEMON: &str = "packagekitd";
const SETTINGS: &str = "settings";

pub fn watch() {
    std::thread::spawn(|| {
        scan();
        let _ = running::watch(scan);
    });
    std::thread::spawn(watch_dnf);
}

pub fn scan() {
    if state::busy() {
        return;
    }
    if let Some(transaction) = foreign_transaction() {
        follow(transaction);
    } else if let Some(pid) = dnf_holder() {
        wait_for(pid);
    }
}

fn finished() {
    overview::reload();
    scan();
}

fn foreign_transaction() -> Option<Running> {
    let own = dbus::system().ok()?.unique_name()?.to_string();
    running::running()
        .ok()?
        .into_iter()
        .find(|transaction| transaction.sender != own)
}

fn process_of(sender: &str) -> Option<u32> {
    dbus::system()
        .ok()?
        .call_method(
            Some("org.freedesktop.DBus"),
            "/org/freedesktop/DBus",
            Some("org.freedesktop.DBus"),
            "GetConnectionUnixProcessID",
            &(sender,),
        )
        .and_then(|reply| reply.body().deserialize())
        .ok()
}

fn command(pid: u32) -> Option<String> {
    std::fs::read_to_string(format!("/proc/{pid}/comm"))
        .ok()
        .map(|command| command.trim().to_owned())
}

fn display_name(command: &str) -> Option<String> {
    let name = match command {
        SETTINGS => return None,
        "schelf" => "Schelf",
        "dnf" | "dnf5" => "dnf",
        "pkcon" => "pkcon",
        "gnome-software" => "GNOME Software",
        "plasma-discover" => "Discover",
        _ => "another app",
    };
    Some(name.into())
}

fn follow(transaction: Running) {
    let by = process_of(&transaction.sender)
        .and_then(command)
        .and_then(|command| display_name(&command));
    let kind = match (&by, transaction.change) {
        (None, Change::Refresh) => Kind::Check,
        (None, Change::Download) => Kind::Download,
        _ => Kind::Elsewhere,
    };
    let activity = Activity {
        elsewhere: (kind == Kind::Elsewhere).then_some(Elsewhere {
            by,
            change: Some(transaction.change),
        }),
        ..Activity::new(kind)
    };
    let path = transaction.path;
    state::start(
        activity,
        move |task| packagekit::follow(&path, task),
        finished,
    );
}

fn dnf_holder() -> Option<u32> {
    let lock = std::fs::read_to_string(Path::new(RUN).join(DNF_FOLDER).join(DNF_LOCK)).ok()?;
    let pid = lock.lines().find_map(|line| {
        line.strip_prefix("pid")?
            .trim_start()
            .strip_prefix('=')?
            .trim()
            .parse()
            .ok()
    })?;
    (command(pid)? != PACKAGEKIT_DAEMON).then_some(pid)
}

fn wait_for(pid: u32) {
    let activity = Activity {
        elsewhere: Some(Elsewhere {
            by: command(pid).and_then(|command| display_name(&command)),
            change: None,
        }),
        ..Activity::new(Kind::Elsewhere)
    };
    state::start(
        activity,
        move |_| {
            exited(pid);
            Ok(())
        },
        finished,
    );
}

fn exited(pid: u32) {
    let descriptor = unsafe { libc::syscall(libc::SYS_pidfd_open, pid, 0) };
    if descriptor < 0 {
        return;
    }
    let process = unsafe { OwnedFd::from_raw_fd(descriptor as i32) };
    let mut poll = libc::pollfd {
        fd: process.as_raw_fd(),
        events: libc::POLLIN,
        revents: 0,
    };
    while unsafe { libc::poll(&mut poll, 1, -1) } < 0
        && std::io::Error::last_os_error().kind() == std::io::ErrorKind::Interrupted
    {}
}

fn watch_dnf() {
    let Ok(mut inotify) = Inotify::init() else {
        return;
    };
    let folder = Path::new(RUN).join(DNF_FOLDER);
    let lock = WatchMask::CREATE | WatchMask::MODIFY;
    if inotify.watches().add(&folder, lock).is_err()
        && inotify
            .watches()
            .add(RUN, WatchMask::CREATE | WatchMask::ONLYDIR)
            .is_err()
    {
        return;
    }
    let mut buffer = [0; 4096];
    while let Ok(events) = inotify.read_events_blocking(&mut buffer) {
        let names: Vec<_> = events
            .filter_map(|event| event.name.map(OsStr::to_owned))
            .collect();
        if names.iter().any(|name| name == DNF_FOLDER) {
            let _ = inotify.watches().add(&folder, lock);
        }
        if names.iter().any(|name| name == DNF_LOCK) {
            scan();
        }
    }
}
