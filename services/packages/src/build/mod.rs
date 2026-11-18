mod accounts;
mod declared;
mod install;
mod made;
mod plain;
mod resolve;
pub mod selinux;
mod stage;
mod units;

use std::collections::BTreeSet;
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
use crate::state::{self, NAME, deployment};
use resolve::checks::{self, Place};
pub use resolve::download::provider;
use resolve::{Choices, Refused, rpm};
use stage::Layout;

pub const CACHE: &str = "/var/cache/luft/system-packages";
const DNF_CACHE: &str = "/var/cache/luft/system-packages/dnf";
const WORK: &str = "/var/cache/luft/system-packages/build";
const LIBRARY_CACHE: &str = "/etc/ld.so.cache";
const RELEASE: &str = "usr/lib/extension-release.d";

struct Workspace {
    path: PathBuf,
    mounts: Vec<PathBuf>,
}

impl Workspace {
    fn new() -> Result<Self> {
        state::remove_folder(Path::new(WORK))?;
        fs::create_dir(WORK).context("Making a folder to build in")?;
        Ok(Self {
            path: PathBuf::from(WORK),
            mounts: Vec::new(),
        })
    }

    fn folder(&self, name: &str) -> Result<PathBuf> {
        let path = self.path.join(name);
        fs::create_dir_all(&path)?;
        Ok(path)
    }

    fn mounted(&mut self, at: &Path) {
        self.mounts.push(at.to_path_buf());
    }
}

impl Drop for Workspace {
    fn drop(&mut self) {
        let unmounted = self.mounts.iter().rev().all(|at| {
            Command::new("umount")
                .arg(at)
                .status()
                .is_ok_and(|status| status.success())
        });
        if unmounted {
            let _ = fs::remove_dir_all(&self.path);
        }
    }
}

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
/// is left out.
pub struct Plan<'a> {
    pub digest: &'a str,
    pub requested: &'a Requested,
    pub sources: &'a Sources,
    pub image: &'a Path,
    pub newer_than: Option<&'a Build>,
    pub gate: Option<&'a Gate>,
    pub needed: &'a [String],
}

/// Builds the plan from Fedora's repositories for the deployment's version and the sources,
/// against the packages it has, leaving out what can't be built and trying again.
pub fn build(plan: &Plan, step: &dyn Fn(Step)) -> Result<Option<Build>> {
    let mut choices = Choices::needing(plan.needed);
    let mut escalated = false;
    loop {
        let built = attempt(plan, &mut choices, &mut escalated, step);
        let refused = match &built {
            Err(error) => error.downcast_ref::<Refused>().cloned(),
            Ok(_) => None,
        };
        match refused {
            Some(refused) => choices.refuse(&refused, plan.requested)?,
            None => return built,
        }
    }
}

fn attempt(
    plan: &Plan,
    choices: &mut Choices,
    escalated: &mut bool,
    step: &dyn Fn(Step),
) -> Result<Option<Build>> {
    let requested = plan.requested;
    let mut work = Workspace::new()?;
    let (tree, upper, overlay, root) = (
        work.folder("tree")?,
        work.folder("upper")?,
        work.folder("overlay")?,
        work.folder("root")?,
    );
    let stage_folder = work.folder("stage")?;
    let store = work.path.join("store");
    let rpms_folder = store.join("packages");
    deployment::mount(plan.digest, &tree)?;
    work.mounted(&tree);
    run(Command::new("mount")
        .args(["-t", "overlay", "overlay", "-o"])
        .arg(format!(
            "lowerdir={},upperdir={},workdir={}",
            tree.display(),
            upper.display(),
            overlay.display()
        ))
        .arg(&root))?;
    work.mounted(&root);
    let cache = root.join("var/cache/libdnf5");
    fs::create_dir_all(&cache)?;
    fs::create_dir_all(DNF_CACHE)?;
    run(Command::new("mount")
        .arg("--bind")
        .arg(DNF_CACHE)
        .arg(&cache))?;
    work.mounted(&cache);

    let os = os_release(&tree)?;
    resolve::download::offer(&root, plan.sources)?;
    step(Step::Downloading);
    let base: BTreeSet<String> = rpm::installed(&root)?.into_iter().collect();
    let rpms = resolve::resolve(
        &root,
        &os.version_id,
        requested,
        plan.sources,
        &store,
        &base,
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
    let policy_before = selinux::before(&root)?;
    install::install(&root, &os.version_id, &rpms_folder, &rpms)?;
    let accounts = accounts::collect(&root, &seeded)?;
    let layout = Layout {
        lower: &tree,
        root: &root,
        upper: &upper,
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
