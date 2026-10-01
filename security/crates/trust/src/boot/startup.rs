use std::path::{Path, PathBuf};

use anyhow::{Result, bail};

use crate::disk;
use crate::keys::{self, Unsealed, mok};
use crate::paths;
use crate::system::efi;

use super::esp::{self, Esp};
use super::kernels::{self, Kernel};
use super::uki::{self, Lines};
use super::{cmdline, entries, images, sign};

const BOOT_MENU: &str = "/usr/lib/sushi/efi/SushiBoot.efi";
const SIGNED_MENU: &str = "EFI/sushi/SushiBoot.efi";
const CERTIFICATE: &str = "EFI/sushi/luft-secure-boot.cer";
const LOADER_CONF: &str = "loader/loader.conf";
const TRIAL: &str = "trial";

pub fn installed() -> bool {
    esp::find().is_ok_and(|esp| esp.file(SIGNED_MENU).exists())
}

fn is_sushiboot(path: &Path) -> bool {
    std::fs::read(path).is_ok_and(|data| {
        data.windows(b"\nsushiboot,".len())
            .any(|window| window == b"\nsushiboot,")
    })
}

pub fn grub_removed(esp: &Esp) -> bool {
    esp.shim_second_stage()
        .is_some_and(|stage| !stage.exists() || is_sushiboot(&stage))
}

pub fn unavailable_reason() -> Option<&'static str> {
    if !Path::new(BOOT_MENU).exists() {
        return Some("Luft's boot menu isn't installed.");
    }
    let Ok(esp) = esp::find() else {
        return Some("This computer doesn't start from an EFI system partition.");
    };
    if let Some(newest) = images::wanted().first()
        && !images::room_for(&esp, images::estimate(newest, &newest.initrd()))
    {
        return Some("The EFI system partition is too full for the signed startup files.");
    }
    match mok::enrollment() {
        mok::Enrollment::Enrolled => None,
        _ => Some("Add Luft's Secure Boot key first."),
    }
}

fn lines(trial: Option<String>) -> Lines {
    let main = cmdline::read();
    let encrypted = disk::status().is_some_and(|disk| disk.encrypted);
    Lines {
        rescue: cmdline::rescue(&main, encrypted),
        main,
        trial,
    }
}

fn initrd_for(
    esp: &Esp,
    keys: &Unsealed,
    kernel: &Kernel,
    built: Option<&Path>,
) -> Result<PathBuf> {
    if let Some(built) = built.filter(|path| path.exists()) {
        return Ok(built.to_owned());
    }
    if kernel.initrd().exists() {
        return Ok(kernel.initrd());
    }
    let image = images::path(esp, &kernel.version);
    if image.exists() {
        let extracted = keys.scratch(&format!("initrd-{}", kernel.version));
        uki::extract_initrd(&image, &extracted)?;
        return Ok(extracted);
    }
    kernel.rebuild_initrd()?;
    Ok(kernel.initrd())
}

fn build(
    esp: &Esp,
    keys: &Unsealed,
    kernel: &Kernel,
    built: Option<&Path>,
    lines: &Lines,
) -> Result<()> {
    let initrd = initrd_for(esp, keys, kernel, built)?;
    images::make_room(esp, &kernel.version, images::estimate(kernel, &initrd))?;
    uki::build(
        kernel,
        &initrd,
        &images::path(esp, &kernel.version),
        keys,
        lines,
    )
}

pub fn add(kernel: &Kernel, built: Option<&Path>) -> Result<()> {
    if !installed() {
        return Ok(());
    }
    let wanted = images::wanted();
    if !wanted.iter().any(|kept| kept.version == kernel.version) {
        return Ok(());
    }
    let esp = esp::find()?;
    let keys = keys::unseal()?;
    images::keep_only(&esp, &wanted);
    build(&esp, &keys, kernel, built, &lines(None))?;
    rustix::fs::sync();
    Ok(())
}

pub fn remove(version: &str) -> Result<()> {
    if let Ok(esp) = esp::find() {
        images::remove(&esp, version);
    }
    let _ = std::fs::remove_file(Kernel::named(version).initrd());
    Ok(())
}

pub fn rebuild_images(rebuild_initrds: bool) -> Result<()> {
    let esp = esp::find()?;
    let keys = keys::unseal()?;
    rebuild_with(&esp, &keys, rebuild_initrds)
}

pub fn rebuild_boot_files() -> Result<()> {
    let rebuilt = if installed() {
        rebuild_images(true)
    } else {
        kernels::rebuild_all_initrds()
    };
    rustix::fs::sync();
    rebuilt
}

fn rebuild_with(esp: &Esp, keys: &Unsealed, rebuild_initrds: bool) -> Result<()> {
    let wanted = images::wanted();
    images::keep_only(esp, &wanted);
    let lines = lines(None);
    for kernel in &wanted {
        if rebuild_initrds {
            kernel.rebuild_initrd()?;
        }
        build(esp, keys, kernel, None, &lines)?;
    }
    let _ = std::fs::remove_file(paths::state(TRIAL));
    rustix::fs::sync();
    Ok(())
}

pub fn install() -> Result<()> {
    if let Some(reason) = unavailable_reason() {
        bail!(reason);
    }
    let esp = esp::find()?;
    let Some(shim) = esp.shim() else {
        bail!("Fedora's shim isn't on the EFI system partition.");
    };
    let keys = keys::unseal()?;
    rebuild_with(&esp, &keys, true)?;
    sign::efi_binary(Path::new(BOOT_MENU), &esp.file(SIGNED_MENU), &keys)?;
    esp::write(
        &esp.file(CERTIFICATE),
        &std::fs::read(keys::certificate_der())?,
    )?;
    if grub_removed(&esp)
        && let Some(stage) = esp.shim_second_stage()
    {
        sign::efi_binary(Path::new(BOOT_MENU), &stage, &keys)?;
    }
    esp::write(&esp.file(LOADER_CONF), loader_conf(&esp).as_bytes())?;
    rustix::fs::sync();
    entries::create(&esp, &shim)
}

fn loader_conf(esp: &Esp) -> String {
    let existing = std::fs::read_to_string(esp.file(LOADER_CONF)).unwrap_or_default();
    let mut lines: Vec<String> = existing
        .lines()
        .filter(|line| !line.trim_start().starts_with("default"))
        .map(str::to_owned)
        .collect();
    if !lines
        .iter()
        .any(|line| line.trim_start().starts_with("timeout"))
    {
        lines.push("timeout 0".to_owned());
    }
    lines.push("default luft-*".to_owned());
    lines.join("\n") + "\n"
}

pub fn uninstall() -> Result<()> {
    let esp = esp::find()?;
    if grub_removed(&esp) {
        bail!(
            "GRUB has been removed, so Luft's startup is how this computer starts. Put GRUB back before removing it."
        );
    }
    entries::remove()?;
    let _ = std::fs::remove_file(esp.file(SIGNED_MENU));
    let _ = std::fs::remove_file(esp.file(CERTIFICATE));
    images::keep_only(&esp, &[]);
    Ok(())
}

pub fn arguments(add: &[String], remove: &[String], once: bool) -> Result<String> {
    let line = cmdline::with(&cmdline::read(), add, remove);
    if add.is_empty() && remove.is_empty() {
        return Ok(line);
    }
    if once {
        try_once(&line)?;
    } else {
        cmdline::write(&line)?;
        if installed() {
            rebuild_images(false)?;
        }
    }
    Ok(line)
}

fn try_once(line: &str) -> Result<()> {
    if !efi::boot_loader().is_some_and(|loader| loader.starts_with("SushiBoot")) {
        bail!(
            "Trying a command line once needs the computer to have started through Luft's startup."
        );
    }
    let Some(kernel) = images::wanted().into_iter().next() else {
        bail!("No kernel is installed.");
    };
    let esp = esp::find()?;
    let keys = keys::unseal()?;
    build(&esp, &keys, &kernel, None, &lines(Some(line.to_owned())))?;
    paths::write_private(&paths::state(TRIAL), kernel.version.as_bytes())?;
    efi::set_oneshot_entry(&format!("{}@{}", images::name(&kernel.version), uki::TRIAL))?;
    rustix::fs::sync();
    Ok(())
}

fn finish_trial(esp: &Esp) -> Result<()> {
    let Ok(version) = std::fs::read_to_string(paths::state(TRIAL)) else {
        return Ok(());
    };
    let kernel = Kernel::named(version.trim());
    if images::path(esp, &kernel.version).exists() && kernel.image.exists() {
        let keys = keys::unseal()?;
        build(esp, &keys, &kernel, None, &lines(None))?;
        rustix::fs::sync();
    }
    std::fs::remove_file(paths::state(TRIAL))?;
    Ok(())
}

pub fn follow_up() -> Result<()> {
    if !installed() {
        return Ok(());
    }
    let esp = esp::find()?;
    finish_trial(&esp)?;
    if entries::luft().is_none()
        && let Some(shim) = esp.shim()
    {
        entries::create(&esp, &shim)?;
    }
    Ok(())
}
