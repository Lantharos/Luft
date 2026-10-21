mod accounts;
mod checks;
mod download;
mod install;
mod made;
mod rpm;
pub mod selinux;
mod stage;
mod units;

use std::collections::BTreeSet;
use std::ffi::CString;
use std::fs;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result};

use super::manifest::{Build, Package};
use super::requested::Requested;
use super::sources::Sources;
use super::{NAME, Step, declared, deployment};
use crate::command::run;
use stage::Layout;

pub const CACHE: &str = "/var/cache/luft/system-packages";
const WORK: &str = "/var/tmp/luft-system-packages.XXXXXX";
const WORK_PREFIX: &str = "luft-system-packages.";
pub const LIBRARY_CACHE: &str = "/etc/ld.so.cache";
const RELEASE: &str = "usr/lib/extension-release.d";

struct Workspace {
    path: PathBuf,
    mounts: Vec<PathBuf>,
}

/// Clears what a build that was stopped, by a restart for example, left behind. Builds never
/// overlap, and their mounts went away with their namespace.
fn clear_stopped() {
    let Some(parent) = Path::new(WORK).parent() else {
        return;
    };
    for entry in fs::read_dir(parent).into_iter().flatten().flatten() {
        if entry
            .file_name()
            .as_bytes()
            .starts_with(WORK_PREFIX.as_bytes())
        {
            let _ = fs::remove_dir_all(entry.path());
        }
    }
}

impl Workspace {
    fn new() -> Result<Self> {
        clear_stopped();
        let template = CString::new(WORK)?;
        let mut template = template.into_bytes_with_nul();
        let made = unsafe { libc::mkdtemp(template.as_mut_ptr().cast()) };
        if made.is_null() {
            return Err(std::io::Error::last_os_error()).context("Making a folder to build in");
        }
        template.pop();
        Ok(Self {
            path: PathBuf::from(String::from_utf8(template)?),
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

/// Builds the system packages in `requested` for the deployment `digest` into `image`, from
/// Fedora's repositories for that deployment's version and `sources`, against the packages it
/// has.
pub fn build(
    digest: &str,
    requested: &Requested,
    sources: &Sources,
    image_path: &Path,
    step: &dyn Fn(Step),
) -> Result<Build> {
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
    deployment::mount(digest, &tree)?;
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
    fs::create_dir_all(CACHE)?;
    fs::set_permissions(CACHE, fs::Permissions::from_mode(0o700))?;
    fs::create_dir_all(&cache)?;
    run(Command::new("mount").arg("--bind").arg(CACHE).arg(&cache))?;
    work.mounted(&cache);

    let os = os_release(&tree)?;
    download::offer(&root, sources)?;
    step(Step::Downloading);
    let origins = download::download(&root, &os.version_id, requested, sources, &store)?;
    let mut rpms = origins
        .into_iter()
        .map(|(path, origin)| rpm::query(&path).map(|rpm| rpm::Rpm { origin, ..rpm }))
        .collect::<Result<Vec<_>>>()?;
    rpms.sort_by(|left, right| left.name.cmp(&right.name));
    let base: BTreeSet<String> = rpm::installed(&root)?.into_iter().collect();
    checks::check(requested, &rpms, &base)?;

    step(Step::Building);
    let made_before = super::footprint()?;
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
        .filter(|file| {
            file.ghost && matches!(checks::place(&file.path), Some(checks::Place::Placed))
        })
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
    let build = Build {
        requested: requested.clone(),
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
                origin: rpm.origin.clone(),
            })
            .collect(),
        enabled: enabled.enabled,
        tmpfiles: entries(&stage_folder.join("usr/lib/tmpfiles.d"), "conf"),
        udev_rules: !entries(&stage_folder.join("usr/lib/udev/rules.d"), "rules").is_empty(),
        libraries,
        selinux_modules,
        placed,
        declared,
    };
    label(&root, &stage_folder)?;
    image(&stage_folder, image_path)?;
    Ok(build)
}
