use std::ffi::OsStr;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::path::Path;

use futures_util::StreamExt;
use inotify::{Inotify, WatchMask};
use luft_app::dbus;
use luft_software::packagekit::{
    self,
    running::{self, Running},
};

use super::super::elsewhere::finished;
use super::super::state;
use super::elsewhere::{self, command, display_name};

const RUN: &str = "/run";
const DNF_FOLDER: &str = "dnf";
const DNF_LOCK: &str = "rpmtransaction.lock";
const PACKAGEKIT_DAEMON: &str = "packagekitd";

pub fn watch() {
    luft_app::spawn(async {
        let changes = running::changes().await;
        scan().await;
        let Ok(changes) = changes else {
            return;
        };
        let mut changes = std::pin::pin!(changes);
        while changes.next().await.is_some() {
            scan().await;
        }
    });
    std::thread::spawn(watch_dnf);
}

pub async fn scan() {
    if state::busy() {
        return;
    }
    if let Some(transaction) = foreign_transaction().await {
        follow(transaction).await;
    } else if let Some(pid) = dnf_holder() {
        wait_for(pid);
    }
}

async fn foreign_transaction() -> Option<Running> {
    let own = dbus::system().await.ok()?.unique_name()?.to_string();
    running::running()
        .await
        .ok()?
        .into_iter()
        .find(|transaction| transaction.sender != own)
}

async fn follow(transaction: Running) {
    let activity = elsewhere::activity(
        elsewhere::sent_by(&transaction.sender).await,
        Some(transaction.change),
    );
    let path = transaction.path;
    state::start(
        activity,
        move |task| luft_app::block_on(packagekit::follow(&path, task)),
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
    let by = command(pid).and_then(|command| display_name(&command));
    state::start(
        elsewhere::activity(by, None),
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
            luft_app::spawn(scan());
        }
    }
}
