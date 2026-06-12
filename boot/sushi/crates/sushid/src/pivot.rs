//! Pivot from initramfs to the real root (production mount-move + exec).

use std::ffi::CString;
use std::fs;
use std::os::unix::ffi::OsStrExt;
use std::path::Path;
use std::thread;
use std::time::Duration;

use anyhow::{Context, Result};

const MS_MOVE: libc::c_ulong = 0x2000;

pub fn sysroot_ready() -> bool {
    if Path::new("/sysroot/sbin/init").exists() {
        return true;
    }
    ensure_sysroot_mounted().is_ok() && Path::new("/sysroot/sbin/init").exists()
}

/// Mount the block root from kernel cmdline (or VM default) onto `/sysroot`.
pub fn ensure_sysroot_mounted() -> Result<()> {
    if Path::new("/sysroot/sbin/init").exists() {
        return Ok(());
    }

    fs::create_dir_all("/sysroot").context("create /sysroot")?;
    let root_dev = root_device_from_cmdline().unwrap_or_else(|| "/dev/vda".to_string());
    wait_for_block_device(&root_dev)?;
    mount_root(&root_dev, "/sysroot")?;
    let init = Path::new("/sysroot/sbin/init");
    eprintln!("sushid: mounted {root_dev} on /sysroot");
    Ok(())
}

pub fn switch_root(new_root: &Path) -> Result<()> {
    ensure_sysroot_mounted()?;
    eprintln!("sushid: switching root to {}", new_root.display());

    let init = new_root.join("sbin/init");
    anyhow::ensure!(init.exists(), "sysroot missing sbin/init at {}", init.display());

    let croot = CString::new(new_root.as_os_str().as_bytes())
        .context("sysroot path contains NUL byte")?;
    let c_dot = CString::new(".")?;
    let c_slash = CString::new("/")?;
    let c_init = CString::new("/sbin/init")?;

    unsafe {
        if libc::chdir(croot.as_ptr()) != 0 {
            anyhow::bail!("chdir {}: {}", new_root.display(), std::io::Error::last_os_error());
        }
        if libc::mount(
            c_dot.as_ptr(),
            c_slash.as_ptr(),
            std::ptr::null(),
            MS_MOVE,
            std::ptr::null(),
        ) != 0
        {
            anyhow::bail!("mount MS_MOVE: {}", std::io::Error::last_os_error());
        }
        if libc::chroot(c_dot.as_ptr()) != 0 {
            anyhow::bail!("chroot: {}", std::io::Error::last_os_error());
        }
        if libc::chdir(c_slash.as_ptr()) != 0 {
            anyhow::bail!("chdir /: {}", std::io::Error::last_os_error());
        }

        detach_old_root_mounts();

        // Hand the visible console back to fbcon before PID 1 takes over.
        crate::enable_fbcon();

        let argv = [c_init.as_ptr(), std::ptr::null()];
        libc::execv(c_init.as_ptr(), argv.as_ptr());
        anyhow::bail!("exec /sbin/init: {}", std::io::Error::last_os_error());
    }
}

fn root_device_from_cmdline() -> Option<String> {
    let cmdline = fs::read_to_string("/proc/cmdline").ok()?;
    for token in cmdline.split_whitespace() {
        let Some(dev) = token.strip_prefix("root=") else {
            continue;
        };
        let dev = dev.trim_matches('"');
        if dev.starts_with("UUID=") || dev.starts_with("LABEL=") {
            return resolve_root_spec(dev);
        }
        return Some(dev.to_string());
    }
    None
}

fn resolve_root_spec(spec: &str) -> Option<String> {
    let by_uuid = Path::new("/dev/disk/by-uuid");
    let by_label = Path::new("/dev/disk/by-label");
    let dir = if spec.starts_with("UUID=") {
        by_uuid
    } else {
        by_label
    };
    let name = spec.split_once('=')?.1;
    let link = dir.join(name);
    for _ in 0..50 {
        if link.exists() {
            return fs::canonicalize(&link).ok().map(|p| p.to_string_lossy().into_owned());
        }
        thread::sleep(Duration::from_millis(20));
    }
    None
}

fn wait_for_block_device(path: &str) -> Result<()> {
    for attempt in 0..200 {
        if Path::new(path).exists() {
            return Ok(());
        }
        if attempt == 0 {
            eprintln!("sushid: waiting for root block device {path}");
        }
        thread::sleep(Duration::from_millis(25));
    }
    anyhow::bail!("root block device not found: {path}");
}

fn mount_root(source: &str, target: &str) -> Result<()> {
    let csource = CString::new(source).with_context(|| format!("root device path: {source}"))?;
    let ctarget = CString::new(target)?;
    let cext4 = CString::new("ext4")?;

    unsafe {
        if libc::mount(
            csource.as_ptr(),
            ctarget.as_ptr(),
            cext4.as_ptr(),
            0,
            std::ptr::null(),
        ) == 0
        {
            return Ok(());
        }
        let err = std::io::Error::last_os_error();
        anyhow::bail!("mount {source} -> {target} (ext4): {err}");
    }
}

fn detach_old_root_mounts() {
    let mounts = match fs::read_to_string("/proc/mounts") {
        Ok(m) => m,
        Err(_) => return,
    };

    let mut targets: Vec<String> = mounts
        .lines()
        .filter_map(|line| {
            let mut parts = line.split_whitespace();
            let mount_point = parts.nth(1)?;
            if mount_point == "/" || mount_point == "/sysroot" {
                return None;
            }
            Some(mount_point.to_string())
        })
        .collect();
    targets.sort_by(|a, b| b.len().cmp(&a.len()));

    for target in targets {
        let Ok(cpath) = CString::new(target.as_str()) else {
            continue;
        };
        unsafe {
            let _ = libc::umount2(cpath.as_ptr(), libc::MNT_DETACH);
        }
    }
}