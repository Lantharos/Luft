use std::fs;
use std::io::ErrorKind;
use std::os::unix::fs::{PermissionsExt, symlink};
use std::path::Path;

use uzers::os::unix::UserExt;

use super::{HOST, apt, base, home, namespaced, view};
use crate::progress::Stage;
use crate::task::Task;

/// Graphics drivers for apps drawn with the GPU, links, mail and host commands handed to the desktop, and
/// what vendors' packages use to add their software sources
const BASICS: [&str; 5] = [
    "libgl1-mesa-dri",
    "libegl1",
    "mesa-vulkan-drivers",
    "flatpak-xdg-utils",
    "gpg",
];
const HANDED_OFF: [&str; 3] = ["xdg-open", "xdg-email", "flatpak-spawn"];
const HANDLERS: &str = "/usr/libexec/flatpak-xdg-utils";
const FROM_HOST: [&str; 4] = ["hosts", "localtime", "machine-id", "resolv.conf"];
const NO_SERVICES: &str = "#!/bin/sh\nexit 101\n";

fn failed(error: std::io::Error) -> String {
    error.to_string()
}

/// Sets Ubuntu up beside its place and moves it there once it's complete.
pub fn ready(task: Task) -> Result<(), String> {
    let tree = super::tree();
    if tree.is_dir() {
        return Ok(());
    }
    let staging = tree.with_extension("new");
    if staging.exists() {
        discard(&staging)?;
    }
    base::unpack(&staging, task)?;
    configure(&staging)?;
    apt::run(&staging, &["update"], Stage::Preparing, task)?;
    apt::run(&staging, &["upgrade"], Stage::Preparing, task)?;
    let mut basics = vec!["install", "--no-install-recommends", "--"];
    basics.extend(BASICS);
    apt::run(&staging, &basics, Stage::Preparing, task)?;
    for tool in HANDED_OFF {
        symlink(
            Path::new(HANDLERS).join(tool),
            staging.join("usr/local/bin").join(tool),
        )
        .map_err(failed)?;
    }
    fs::rename(&staging, &tree).map_err(failed)
}

fn discard(path: &Path) -> Result<(), String> {
    let removed = namespaced("rm")
        .args(["--recursive", "--force", "--"])
        .arg(path)
        .status()
        .map_err(failed)?;
    removed
        .success()
        .then_some(())
        .ok_or_else(|| format!("{} couldn't be removed.", path.display()))
}

/// Points the files Ubuntu shares with this computer, such as its time zone, at this computer's.
pub fn share_host_files(tree: &Path) -> Result<(), String> {
    let etc = tree.join("etc");
    for name in FROM_HOST {
        let file = etc.join(name);
        let linked = Path::new(HOST).join("etc").join(name);
        if fs::read_link(&file).is_ok_and(|target| target == linked) {
            continue;
        }
        match fs::remove_file(&file) {
            Err(error) if error.kind() != ErrorKind::NotFound => return Err(error.to_string()),
            _ => {}
        }
        symlink(linked, file).map_err(failed)?;
    }
    Ok(())
}

fn configure(tree: &Path) -> Result<(), String> {
    share_host_files(tree)?;
    let etc = tree.join("etc");
    add_yourself(&etc)?;
    for mount_point in [home(), view::FONTS.into()] {
        fs::create_dir_all(tree.join(mount_point.strip_prefix("/").unwrap_or(&mount_point)))
            .map_err(failed)?;
    }
    let policy = tree.join("usr/sbin/policy-rc.d");
    fs::write(&policy, NO_SERVICES).map_err(failed)?;
    fs::set_permissions(&policy, fs::Permissions::from_mode(0o755)).map_err(failed)
}

/// Gives your account a name inside, for the apps that look up who runs them.
fn add_yourself(etc: &Path) -> Result<(), String> {
    let you = uzers::get_user_by_uid(uzers::get_current_uid())
        .ok_or("Your account couldn't be found.")?;
    let name = you.name().to_string_lossy();
    let gid = you.primary_group_id();
    let group = uzers::get_group_by_gid(gid).map_or_else(
        || name.to_string(),
        |group| group.name().to_string_lossy().into_owned(),
    );
    let append = |file: &str, line: String| {
        let path = etc.join(file);
        let mut text = fs::read_to_string(&path).map_err(failed)?;
        text.push_str(&line);
        fs::write(path, text).map_err(failed)
    };
    append(
        "passwd",
        format!(
            "{name}:x:{}:{gid}::{}:/bin/bash\n",
            you.uid(),
            you.home_dir().display()
        ),
    )?;
    append("group", format!("{group}:x:{gid}:\n"))
}
