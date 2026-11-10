use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use anyhow::{Context, Result};

use super::boot_files::{self, Mounted};
use super::copy::{self, Progress};
use super::request::{Request, Stage};
use crate::boot::esp;
use crate::disk::ROOT_PARTITION;
use crate::disk::unlock::luks::SYSTEMD_CRYPTSETUP;
use crate::paths;
use crate::system::host::blocks;
use crate::system::host::command::Tool;
use luft_disks::moving::layout::{ESP_TYPE, XBOOTLDR_TYPE};

const ROOT_MAPPING: &str = "/dev/mapper/root";
const MAPPING: &str = "luft-moving";
const TICK: Duration = Duration::from_secs(1);
const LOGGED_EVERY: u64 = 10;

struct Opened {
    device: PathBuf,
    mapped: bool,
}

impl Opened {
    fn new(request: &Request) -> Result<Self> {
        let partition = Path::new("/dev/disk/by-partuuid").join(&request.to.root);
        if !request.encrypted {
            return Ok(Self {
                device: partition,
                mapped: false,
            });
        }
        Tool::new(SYSTEMD_CRYPTSETUP)
            .args(["attach", MAPPING])
            .arg(&partition)
            .args(["none", "discard,tpm2-device=auto"])
            .status()
            .context("Luft's new partition couldn't be opened")?;
        Ok(Self {
            device: Path::new("/dev/mapper").join(MAPPING),
            mapped: true,
        })
    }
}

impl Drop for Opened {
    fn drop(&mut self) {
        if self.mapped {
            let _ = Tool::new(SYSTEMD_CRYPTSETUP)
                .args(["detach", MAPPING])
                .status();
        }
    }
}

struct Mount {
    path: PathBuf,
}

impl Mount {
    fn new(device: &Path, name: &str, options: &str) -> Result<Self> {
        let path = Path::new(paths::RUNTIME).join("moving").join(name);
        paths::ensure_private(&path)?;
        Tool::new("mount")
            .args(["-t", "btrfs", "-o", options])
            .arg(device)
            .arg(&path)
            .status()?;
        Ok(Self { path })
    }
}

impl Drop for Mount {
    fn drop(&mut self) {
        let _ = Tool::new("umount").arg(&self.path).status();
    }
}

fn sushi(arguments: &[&str]) {
    let _ = Tool::new("sushictl").args(arguments).status();
}

fn file_system_of(device: &Path) -> Option<String> {
    Tool::new("blkid")
        .args(["--output", "value", "--match-tag", "UUID"])
        .arg(device)
        .output()
        .ok()
        .map(|uuid| uuid.trim().to_owned())
}

fn make_file_system(device: &Path, uuid: &str) -> Result<()> {
    if file_system_of(device).as_deref() == Some(uuid) {
        return Ok(());
    }
    Tool::new("mkfs.btrfs")
        .args(["--force", "--label", "luft", "--uuid", uuid])
        .arg(device)
        .status()
        .context("Luft's new partition couldn't be formatted")
}

fn show_progress(progress: &Progress, copying: &AtomicBool) {
    let mut logged = None;
    while copying.load(Ordering::Relaxed) {
        std::thread::sleep(TICK);
        let total = progress.total.load(Ordering::Relaxed);
        if total == 0 {
            continue;
        }
        let percent = (progress.done.load(Ordering::Relaxed) * 100 / total).min(99);
        sushi(&["progress", &percent.to_string()]);
        let step = percent / LOGGED_EVERY * LOGGED_EVERY;
        if logged.is_none_or(|last| step > last) {
            eprintln!("Moving Luft: {step}%");
            logged = Some(step);
        }
    }
}

fn copy_system(request: &Request) -> Result<()> {
    let target = Opened::new(request)?;
    make_file_system(&target.device, &request.filesystem)?;
    let source_device = if request.encrypted {
        Path::new(ROOT_MAPPING)
    } else {
        Path::new(ROOT_PARTITION)
    };
    let from = Mount::new(source_device, "from", "ro,subvolid=5")?;
    let to = Mount::new(&target.device, "to", "subvolid=5,compress=zstd:1,noatime")?;
    let progress = Progress::default();
    let copying = AtomicBool::new(true);
    std::thread::scope(|scope| {
        scope.spawn(|| show_progress(&progress, &copying));
        let copied = copy::tree(&from.path, &to.path, &progress);
        copying.store(false, Ordering::Relaxed);
        copied
    })
}

fn mount_on(disk: &str, kind: &str, name: &str) -> Result<Option<Mounted>> {
    let Some(partition) = esp::on_disk(disk, kind) else {
        return Ok(None);
    };
    let partuuid = blocks::partuuid(&partition).context("A startup partition has no GUID")?;
    Mounted::partuuid(&partuuid, name).map(Some)
}

fn copy_startup(request: &Request, root: &str) -> Result<()> {
    let disk = blocks::disk_of(root).context("Luft's partition isn't on a disk")?;
    let old_esp = mount_on(&disk, ESP_TYPE, "old-esp")?
        .context("Luft's drive has no EFI system partition")?;
    let old_boot = mount_on(&disk, XBOOTLDR_TYPE, "old-startup")?.filter(Mounted::holds_entries);
    let new_esp = Mounted::partuuid(&request.to.esp, "new-esp")?;
    let new_boot = request
        .to
        .startup
        .as_deref()
        .map(|startup| Mounted::partuuid(startup, "new-startup"))
        .transpose()?;
    boot_files::copy(
        &old_esp,
        old_boot.as_ref().unwrap_or(&old_esp),
        &new_esp,
        new_boot.as_ref().unwrap_or(&new_esp),
    )
}

fn run(request: &Request, root: &str) -> Result<()> {
    sushi(&["moving", &request.to.name]);
    copy_system(request)?;
    copy_startup(request, root)
}

pub fn copy_at_start() -> Result<()> {
    let Some(request) = Request::load().filter(|request| request.stage == Stage::Waiting) else {
        return Ok(());
    };
    let root =
        blocks::kernel_name(Path::new(ROOT_PARTITION)).context("Luft's partition isn't there")?;
    if blocks::partuuid(&root).as_deref() != Some(request.from.as_str()) {
        return Ok(());
    }
    if let Err(error) = run(&request, &root) {
        eprintln!("Luft didn't move: {error:#}");
        sushi(&["show", "boot-up"]);
        request.fail(format!("{error:#}"))?;
        return Ok(());
    }
    sushi(&["progress", "100"]);
    let request = request.advance(Stage::Copied)?;
    boot_files::add_trial_entry(
        &Path::new("/dev/disk/by-partuuid").join(&request.to.esp),
        &request.to.name,
    )?;
    eprintln!(
        "Luft moved to {}, and starts from there next",
        request.to.name
    );
    Tool::new("systemctl").arg("reboot").status()
}
