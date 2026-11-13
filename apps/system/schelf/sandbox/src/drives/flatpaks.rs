//! `schelf --watch-drives`: keeps Flatpak apps' drives in step with where
//! they're mounted, and puts stand-ins for the drives they weren't given in
//! each running Flatpak sandbox.
//!
//! Flatpak builds its sandboxes itself, so the stand-ins are made after the
//! sandbox starts, in the folders Flatpak made for it alone, reached through
//! the sandbox's first process. The app owns those folders and could have
//! made anything there; the walk in [`super::plant`] follows nothing it made.

use std::collections::{HashMap, HashSet};
use std::mem::MaybeUninit;
use std::os::fd::{AsFd, AsRawFd, OwnedFd};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::Duration;

use futures_util::StreamExt;
use luft_dbus::objects;
use luft_software::apps::places::{self, Drive};
use rustix::fs::{Mode, OFlags, ResolveFlags, inotify, openat2};
use tokio::io::Interest;
use tokio::io::unix::AsyncFd;
use tokio::sync::mpsc;
use tokio::time::{Instant, sleep_until};
use zbus::Connection;

use super::{Trips, Turn, ask, due, pidfd, plant};
use crate::launch::{child_pid, runtime_dir};

const UDISKS: &str = "org.freedesktop.UDisks2";
const UDISKS_ROOT: &str = "/org/freedesktop/UDisks2";
const INSTANCES: &str = ".flatpak";
const OWN_SANDBOXES: &str = "schelf-";
const SANDBOX_INFO: &str = ".flatpak-info";
const SETTING_UP: Duration = Duration::from_millis(200);
const SETTLE: Duration = Duration::from_millis(150);
const SET_UP_TRIES: u32 = 50;

/// A running Flatpak sandbox the stand-ins were put in.
struct Sandbox {
    app: String,
    process: Arc<OwnedFd>,
    root: OwnedFd,
    planted: HashSet<String>,
    turns: HashMap<String, Turn>,
}

fn section_value(text: &str, section: &str, key: &str) -> Option<String> {
    let mut inside = false;
    for line in text.lines() {
        let line = line.trim();
        if line.starts_with('[') {
            inside = line == section;
        } else if inside
            && let Some(value) = line
                .strip_prefix(key)
                .and_then(|rest| rest.strip_prefix('='))
        {
            return Some(value.to_owned());
        }
    }
    None
}

fn alive(process: &OwnedFd) -> bool {
    let mut polled = libc::pollfd {
        fd: process.as_raw_fd(),
        events: libc::POLLIN,
        revents: 0,
    };
    unsafe { libc::poll(&mut polled, 1, 0) == 0 }
}

/// The sandbox of the Flatpak instance `name`, once it's set up: its first
/// process has moved into its own root, which holds the instance's info.
fn attach(instances: &Path, name: &str) -> Option<Sandbox> {
    let folder = instances.join(name);
    let app = section_value(
        &std::fs::read_to_string(folder.join("info")).ok()?,
        "[Application]",
        "name",
    )?;
    let pid = child_pid(&std::fs::read_to_string(folder.join("bwrapinfo.json")).ok()?)?;
    let process = pidfd(pid)?;
    let root = openat2(
        rustix::fs::CWD,
        format!("/proc/{pid}/root"),
        OFlags::PATH | OFlags::DIRECTORY | OFlags::CLOEXEC,
        Mode::empty(),
        ResolveFlags::empty(),
    )
    .ok()?;
    let info = openat2(
        &root,
        SANDBOX_INFO,
        OFlags::RDONLY | OFlags::CLOEXEC | OFlags::NOFOLLOW,
        Mode::empty(),
        ResolveFlags::BENEATH | ResolveFlags::NO_SYMLINKS | ResolveFlags::NO_MAGICLINKS,
    )
    .ok()?;
    let info = std::io::read_to_string(std::fs::File::from(info)).ok()?;
    let ours = section_value(&info, "[Instance]", "instance-id").as_deref() == Some(name)
        && section_value(&info, "[Application]", "name").as_deref() == Some(app.as_str());
    (ours && alive(&process)).then(|| Sandbox {
        app,
        process: Arc::new(process),
        root,
        planted: HashSet::new(),
        turns: HashMap::new(),
    })
}

/// Watches the folder Flatpak keeps its running instances in.
struct Instances {
    folder: PathBuf,
    watch: AsyncFd<OwnedFd>,
    folders: HashMap<i32, String>,
}

impl Instances {
    fn open() -> Result<Self, String> {
        let folder = runtime_dir()?.join(INSTANCES);
        std::fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
        let fd = inotify::init(inotify::CreateFlags::NONBLOCK | inotify::CreateFlags::CLOEXEC)
            .map_err(|error| error.to_string())?;
        inotify::add_watch(
            &fd,
            &folder,
            inotify::WatchFlags::CREATE
                | inotify::WatchFlags::MOVED_TO
                | inotify::WatchFlags::ONLYDIR,
        )
        .map_err(|error| error.to_string())?;
        Ok(Self {
            folder,
            watch: unsafe { AsyncFd::register_with_interest(fd, Interest::READABLE) }
                .map_err(|error| error.to_string())?,
            folders: HashMap::new(),
        })
    }

    fn follow(&mut self, name: &str) {
        if name.starts_with(OWN_SANDBOXES) {
            return;
        }
        if let Ok(watched) = inotify::add_watch(
            self.watch.get_ref(),
            self.folder.join(name),
            inotify::WatchFlags::CLOSE_WRITE
                | inotify::WatchFlags::MOVED_TO
                | inotify::WatchFlags::ONLYDIR,
        ) {
            self.folders.insert(watched, name.to_owned());
        }
    }

    fn running(&mut self) -> Vec<String> {
        let names: Vec<String> = std::fs::read_dir(&self.folder)
            .into_iter()
            .flatten()
            .flatten()
            .filter_map(|entry| entry.file_name().into_string().ok())
            .filter(|name| !name.starts_with(OWN_SANDBOXES))
            .collect();
        for name in &names {
            self.follow(name);
        }
        names
    }

    /// The instances that started or changed since the last call.
    fn changed(&mut self) -> Vec<String> {
        let mut buffer = [MaybeUninit::uninit(); 4096];
        let mut started = Vec::new();
        let mut changed = Vec::new();
        let mut reader = inotify::Reader::new(self.watch.get_ref(), &mut buffer);
        while let Ok(event) = reader.next() {
            match self.folders.get(&event.wd()) {
                Some(instance) => changed.push(instance.clone()),
                None => started.extend(
                    event
                        .file_name()
                        .and_then(|name| name.to_str().ok())
                        .map(str::to_owned),
                ),
            }
        }
        for name in &started {
            self.follow(name);
        }
        changed.extend(started);
        changed.retain(|name| !name.starts_with(OWN_SANDBOXES));
        changed
    }
}

/// What the watcher keeps while it runs.
struct Watcher {
    session: Connection,
    instances: Instances,
    trips: AsyncFd<Trips<(String, Drive)>>,
    sandboxes: HashMap<String, Sandbox>,
    setting_up: HashMap<String, u32>,
    mounted: Vec<Drive>,
    home: PathBuf,
    answered: mpsc::UnboundedSender<(String, String, Turn)>,
}

impl Watcher {
    /// Puts stand-ins in the sandbox for the mounted drives its app was
    /// never asked about.
    async fn plant(&mut self, name: &str) {
        let Some(sandbox) = self.sandboxes.get_mut(name) else {
            return;
        };
        let Ok(held) = places::held(&self.session, &sandbox.app).await else {
            return;
        };
        for drive in places::unasked(&held, &self.mounted) {
            if !sandbox.planted.insert(drive.uuid.clone()) {
                continue;
            }
            for point in drive
                .mount_points
                .iter()
                .filter(|point| !point.starts_with(&self.home))
            {
                if let Some(folder) = plant::stand_in(&sandbox.root, point) {
                    let watched = self
                        .trips
                        .get_mut()
                        .watch_opened(folder.as_fd(), (name.to_owned(), drive.clone()));
                    if let Err(error) = watched {
                        eprintln!(
                            "Couldn't watch the stand-in for {} in {name}: {error}",
                            point.display()
                        );
                    }
                }
            }
        }
    }

    async fn set_up(&mut self) {
        let waiting: Vec<String> = self.setting_up.keys().cloned().collect();
        for name in waiting {
            match attach(&self.instances.folder, &name) {
                Some(sandbox) => {
                    self.setting_up.remove(&name);
                    self.sandboxes.insert(name.clone(), sandbox);
                    self.plant(&name).await;
                }
                None => {
                    let tries = self.setting_up.entry(name.clone()).or_default();
                    *tries += 1;
                    if *tries > SET_UP_TRIES {
                        self.setting_up.remove(&name);
                    }
                }
            }
        }
    }

    fn wanted(&mut self) {
        for (name, drive) in self.trips.get_ref().tripped() {
            let Some(sandbox) = self.sandboxes.get_mut(&name) else {
                continue;
            };
            if !due(sandbox.turns.get(&drive.uuid)) {
                continue;
            }
            sandbox.turns.insert(drive.uuid.clone(), Turn::Asking);
            let (session, app, process, answered) = (
                self.session.clone(),
                sandbox.app.clone(),
                sandbox.process.clone(),
                self.answered.clone(),
            );
            tokio::spawn(async move {
                let asked = ask(&session, &app, process.as_fd(), &drive).await;
                let _ = answered.send((name, drive.uuid, Turn::after(Some(asked))));
            });
        }
    }

    async fn mounts_changed(&mut self) {
        self.mounted = places::mounted().await.unwrap_or_default();
        if let Err(error) = places::follow_mounts(&self.session).await {
            eprintln!(
                "Couldn't open the drives apps were given where they're mounted now: {error}"
            );
        }
        let names: Vec<String> = self.sandboxes.keys().cloned().collect();
        for name in names {
            self.plant(&name).await;
        }
    }

    fn forget_closed(&mut self) {
        self.sandboxes.retain(|_, sandbox| alive(&sandbox.process));
        let sandboxes = &self.sandboxes;
        self.trips
            .get_mut()
            .forget(|(name, _)| !sandboxes.contains_key(name));
    }
}

async fn run() -> Result<(), String> {
    let session = Connection::session()
        .await
        .map_err(|error| error.to_string())?;
    let mut changes = objects::signals(luft_dbus::system().await?, UDISKS, UDISKS_ROOT).await?;
    let (answered, mut answers) = mpsc::unbounded_channel();
    let mut watcher = Watcher {
        session,
        instances: Instances::open()?,
        trips: unsafe { AsyncFd::register_with_interest(Trips::new()?, Interest::READABLE) }
            .map_err(|error| error.to_string())?,
        sandboxes: HashMap::new(),
        setting_up: HashMap::new(),
        mounted: Vec::new(),
        home: dirs::home_dir().ok_or("There's no home folder.")?,
        answered,
    };
    watcher.mounts_changed().await;
    for name in watcher.instances.running() {
        watcher.setting_up.insert(name, 0);
    }
    let mut settling: Option<Instant> = None;
    loop {
        watcher.set_up().await;
        let waiting = !watcher.setting_up.is_empty();
        tokio::select! {
            ready = watcher.instances.watch.readable_mut() => {
                ready.map_err(|error| error.to_string())?.clear_ready();
                for name in watcher.instances.changed() {
                    if !watcher.sandboxes.contains_key(&name) {
                        watcher.setting_up.insert(name, 0);
                    }
                }
                watcher.forget_closed();
            }
            ready = watcher.trips.readable() => {
                ready.map_err(|error| error.to_string())?.clear_ready();
                watcher.wanted();
            }
            Some((name, uuid, turn)) = answers.recv() => {
                if let Some(sandbox) = watcher.sandboxes.get_mut(&name) {
                    sandbox.turns.insert(uuid, turn);
                }
            }
            change = changes.next() => {
                if change.is_none() {
                    return Err("UDisks stopped.".to_owned());
                }
                settling.get_or_insert_with(|| Instant::now() + SETTLE);
            }
            () = sleep_until(settling.unwrap_or_else(Instant::now)), if settling.is_some() => {
                settling = None;
                watcher.mounts_changed().await;
            }
            () = tokio::time::sleep(SETTING_UP), if waiting => {}
        }
    }
}

/// Runs the watcher until the session ends, and returns the exit status.
pub fn watch() -> i32 {
    let runtime = match tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
    {
        Ok(runtime) => runtime,
        Err(error) => {
            eprintln!("{error}");
            return 1;
        }
    };
    match runtime.block_on(run()) {
        Ok(()) => 0,
        Err(error) => {
            eprintln!("Luft stopped watching Flatpak apps for drives: {error}");
            1
        }
    }
}
