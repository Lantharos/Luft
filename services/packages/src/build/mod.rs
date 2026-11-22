mod accounts;
mod declared;
mod install;
mod made;
mod plain;
mod resolve;
pub mod root;
pub mod selinux;
mod stage;
mod units;

use std::collections::{BTreeSet, HashSet};
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, anyhow};

use crate::changes::{Escalate, Step};
use crate::command::run;
use crate::state::manifest::{Build, Package};
use crate::state::requested::Requested;
use crate::state::sources::Sources;
use crate::state::{self, NAME};
use resolve::checks::{self, Place};
pub use resolve::download::provider;
use resolve::rpm::Rpm;
use resolve::{Choices, Installed, NotAdding, Refused, rpm};
use root::kept::{self, Kept};
use root::workspace::{Folders, Workspace};
use stage::Layout;

pub const CACHE: &str = "/var/cache/luft/system-packages";
const DNF_CACHE: &str = "/var/cache/luft/system-packages/dnf";
const DNF_STATE: &str = "/var/cache/luft/system-packages/dnf-state";
const LIBRARY_CACHE: &str = "/etc/ld.so.cache";
const RELEASE: &str = "usr/lib/extension-release.d";

struct OsRelease {
    id: String,
    version_id: String,
}

fn os_release(tree: &Path) -> Result<OsRelease> {
    let text = fs::read_to_string(tree.join("usr/lib/os-release"))?;
    let field = |key: &str| {
        text.lines()
            .find_map(|line| line.strip_prefix(key)?.strip_prefix('='))
            .map(|value| value.trim_matches('"').to_owned())
            .with_context(|| format!("The system names no {key}"))
    };
    Ok(OsRelease {
        id: field("ID")?,
        version_id: field("VERSION_ID")?,
    })
}

fn release(stage: &Path, os: &OsRelease) -> Result<()> {
    let folder = stage.join(RELEASE);
    fs::create_dir_all(&folder)?;
    fs::write(
        folder.join(format!("extension-release.{NAME}")),
        format!(
            "ID={}\nVERSION_ID={}\nEXTENSION_RELOAD_MANAGER=1\n",
            os.id, os.version_id
        ),
    )?;
    Ok(())
}

fn label(root: &Path, stage: &Path) -> Result<()> {
    let contexts = root.join(selinux::FILE_CONTEXTS);
    run(Command::new("setfiles")
        .args(["-F", "-r"])
        .arg(stage)
        .arg(contexts)
        .arg(stage))
    .context("Labelling the files for SELinux")
    .map(drop)
}

fn image(stage: &Path, at: &Path) -> Result<()> {
    run(Command::new("mkfs.erofs")
        .args(["--quiet", "-zlz4hc"])
        .arg(at)
        .arg(stage))
    .context("Making the extension image")
    .map(drop)
}

fn entries(folder: &Path, extension: &str) -> Vec<String> {
    let mut names: Vec<String> = fs::read_dir(folder)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| {
            entry
                .path()
                .extension()
                .is_some_and(|found| found == extension)
        })
        .filter_map(|entry| entry.file_name().into_string().ok())
        .collect();
    names.sort();
    names
}

/// Downloads what building `requested` for `digest` will, over the kept root when the build
/// could go on from it, so the build that follows finds every package in dnf's cache.
pub fn prepare(digest: &str, requested: &Requested, sources: &Sources) -> Result<()> {
    let kept = kept::usable(digest, requested, sources);
    let mut work = Workspace::new()?;
    let folders = work.mount(
        digest,
        kept.as_ref().map_or(&[][..], |kept| &kept.layers[..]),
        sources,
    )?;
    let os = os_release(&folders.tree)?;
    resolve::download::download(
        &folders.root,
        &os.version_id,
        requested,
        &BTreeSet::new(),
        sources,
        &folders.store,
    )
    .map(drop)
}

pub fn refresh_metadata() -> Result<()> {
    resolve::download::refresh(&os_release(Path::new("/"))?.version_id)
}

pub fn tidy() -> Result<()> {
    resolve::download::tidy(&HashSet::new())
}

/// The packages of the kept root's build, as its package database has them, from where the
/// build noted each came from.
fn installed_from(root: &Path, build: &Build) -> Result<Vec<Rpm>> {
    let labels: Vec<String> = build
        .packages
        .iter()
        .map(|package| format!("{}-{}.{}", package.name, package.version, package.arch))
        .collect();
    Ok(rpm::query_installed(root, &labels)?
        .into_iter()
        .zip(&build.packages)
        .map(|(rpm, package)| Rpm {
            origin: package.origin.clone(),
            ..rpm
        })
        .collect())
}

fn unchanged(current: &Build, rpms: &[rpm::Rpm]) -> bool {
    current.packages.len() == rpms.len()
        && rpms
            .iter()
            .all(|rpm| current.version_of(&rpm.name) == Some(rpm.version.as_str()))
}

/// What a change someone asked for holds the build to: the build the running system has
/// merged, to tell what the change brings and takes away, and who to ask when that isn't
/// plain.
pub struct Gate {
    pub current: Option<Build>,
    pub escalate: Escalate,
}

impl Gate {
    fn pass(&self, plain: bool, escalated: &mut bool) -> Result<()> {
        if !plain && !*escalated {
            (self.escalate)()?;
            *escalated = true;
        }
        Ok(())
    }
}

/// A build of the system packages in `requested` for the deployment `digest` into `image`.
/// Nothing is built when the newest packages are the versions `newer_than` already has. The
/// packages in `needed` fail the build when they can't be in it; anything else that can't
/// is left out. With `keep`, for the running system, the build root is kept, and a change
/// that only adds packages installs them over the one kept before.
pub struct Plan<'a> {
    pub digest: &'a str,
    pub requested: &'a Requested,
    pub sources: &'a Sources,
    pub image: &'a Path,
    pub newer_than: Option<&'a Build>,
    pub gate: Option<&'a Gate>,
    pub needed: &'a [String],
    pub keep: bool,
}

/// Builds the plan from Fedora's repositories for the deployment's version and the sources,
/// against the packages it has, leaving out what can't be built and trying again.
pub fn build(plan: &Plan, step: &dyn Fn(Step)) -> Result<Option<Build>> {
    let mut choices = Choices::needing(plan.needed);
    let mut escalated = false;
    let mut kept = (plan.keep && plan.newer_than.is_none())
        .then(|| kept::usable(plan.digest, plan.requested, plan.sources))
        .flatten();
    loop {
        let built = attempt(plan, kept.as_ref(), &mut choices, &mut escalated, step);
        let Err(error) = &built else {
            return built;
        };
        if error.is::<NotAdding>() {
            kept = None;
            continue;
        }
        match error.downcast_ref::<Refused>().cloned() {
            Some(refused) => choices.refuse(&refused, plan.requested)?,
            None => return built,
        }
    }
}

fn attempt(
    plan: &Plan,
    kept: Option<&Kept>,
    choices: &mut Choices,
    escalated: &mut bool,
    step: &dyn Fn(Step),
) -> Result<Option<Build>> {
    let requested = plan.requested;
    let kept_layers = kept.map_or(&[][..], |kept| &kept.layers[..]);
    let mut work = Workspace::new()?;
    let Folders {
        tree,
        upper,
        root,
        stage: stage_folder,
        store,
    } = work.mount(plan.digest, kept_layers, plan.sources)?;
    let rpms_folder = store.join("packages");
    let os = os_release(&tree)?;
    step(Step::Downloading);
    let base: BTreeSet<String> = rpm::installed(&tree)?.into_iter().collect();
    let installed = match kept {
        Some(kept) => installed_from(&root, &kept.build)?,
        None => Vec::new(),
    };
    let rpms = resolve::resolve(
        &root,
        &os.version_id,
        requested,
        plan.sources,
        &store,
        &Installed {
            base: &base,
            kept: &installed,
        },
        choices,
    )?;
    if plan
        .newer_than
        .is_some_and(|current| unchanged(current, &rpms))
    {
        return Ok(None);
    }
    if let Some(gate) = plan.gate {
        gate.pass(plain::change(gate.current.as_ref(), &rpms), escalated)?;
    }

    step(Step::Building);
    let made_before = state::footprint()?;
    let seeded = accounts::seed(&root, made_before.users(), made_before.groups())?;
    let policy_before = selinux::before(&tree, &root)?;
    let there: HashSet<(&str, &str)> = installed
        .iter()
        .map(|rpm| (rpm.name.as_str(), rpm.arch.as_str()))
        .collect();
    let adding: Vec<&Rpm> = rpms
        .iter()
        .filter(|rpm| !there.contains(&(rpm.name.as_str(), rpm.arch.as_str())))
        .collect();
    install::install(&root, &os.version_id, &rpms_folder, &adding)?;
    let accounts = accounts::collect(&root, &seeded)?;
    let layers: Vec<PathBuf> = std::iter::once(upper.clone())
        .chain(kept_layers.iter().rev().cloned())
        .collect();
    let layout = Layout {
        lower: &tree,
        root: &root,
        layers: &layers,
        stage: &stage_folder,
    };
    let enabled = stage::enable(&layout, &rpms, requested)?;
    stage::merged(&layout, &rpms)?;
    let placed = stage::placed(&layout, &rpms)?;
    made::made(&layout, &rpms)?;
    made::alternatives(&layout)?;
    accounts::settle(&stage_folder, &accounts, &seeded)?;
    let selinux_modules = selinux::ship(&policy_before, &root, &stage_folder, || {
        install::rebuild_policy(&root, &rpms_folder)
    })?;
    release(&stage_folder, &os)?;
    let names = rpms
        .iter()
        .map(|rpm| rpm.name.clone())
        .chain(enabled.units.values().flatten().cloned());
    let ghosts = rpms
        .iter()
        .flat_map(|rpm| &rpm.files)
        .filter(|file| file.ghost && matches!(checks::place(&file.path), Some(Place::Placed)))
        .map(|file| file.path.clone());
    let libraries = placed
        .iter()
        .any(|entry| entry.path.starts_with("/etc/ld.so.conf.d/"));
    let cache = libraries.then(|| LIBRARY_CACHE.to_owned());
    let declared = declared::read(
        &stage_folder,
        placed
            .iter()
            .map(|entry| entry.path.clone())
            .chain(ghosts)
            .chain(cache),
        names,
    );
    let privileges = plain::privileges(&stage_folder, &declared, &selinux_modules)?;
    if let Some(gate) = plan.gate {
        gate.pass(plain::same(gate.current.as_ref(), &privileges), escalated)?;
    }
    let build = Build {
        requested: requested.clone(),
        left_out: choices.left_out.clone(),
        packages: rpms
            .iter()
            .map(|rpm| Package {
                name: rpm.name.clone(),
                version: rpm.version.clone(),
                arch: rpm.arch.clone(),
                summary: rpm.summary.clone(),
                requested: requested.contains(&rpm.name),
                units: enabled.units.get(&rpm.name).cloned().unwrap_or_default(),
                apps: rpm.apps(),
                commands: rpm.commands(),
                origin: rpm.origin.clone(),
                plain: plain::package(rpm),
            })
            .collect(),
        enabled: enabled.enabled,
        tmpfiles: entries(&stage_folder.join("usr/lib/tmpfiles.d"), "conf"),
        udev_rules: !entries(&stage_folder.join("usr/lib/udev/rules.d"), "rules").is_empty(),
        libraries,
        selinux_modules,
        placed,
        declared,
        privileges,
    };
    label(&root, &stage_folder)?;
    image(&stage_folder, plan.image)?;
    if plan.keep {
        work.unmount()?;
        kept::keep(plan.digest, &upper, kept, &build, plan.sources)?;
    }
    Ok(Some(build))
}

fn make_private() -> io::Result<()> {
    if unsafe { libc::unshare(libc::CLONE_NEWNS) } != 0 {
        return Err(io::Error::last_os_error());
    }
    let flags = libc::MS_REC | libc::MS_PRIVATE;
    let changed = unsafe {
        libc::mount(
            std::ptr::null(),
            c"/".as_ptr(),
            std::ptr::null(),
            flags,
            std::ptr::null(),
        )
    };
    if changed != 0 {
        return Err(io::Error::last_os_error());
    }
    Ok(())
}

/// Runs `work` on a thread of its own in a private mount namespace, so whatever it mounts goes
/// away with the thread, even when a build stops halfway.
pub fn isolated<T: Send + 'static>(work: impl FnOnce() -> Result<T> + Send + 'static) -> Result<T> {
    std::thread::Builder::new()
        .name("system-packages".to_owned())
        .spawn(move || {
            make_private().context("Setting up a private mount namespace")?;
            work()
        })?
        .join()
        .map_err(|_| anyhow!("Building the system packages stopped unexpectedly."))?
}
