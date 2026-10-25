use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use crate::apps::toolbox::pull;
use crate::progress::Stage;
use crate::task::Task;

use super::apt;

pub const NAME: &str = "luft-ubuntu";
const IMAGE: &str = "quay.io/toolbx/ubuntu-toolbox:24.04";
// The host's files show inside a toolbox container here, besides the home folder, which shows as itself
const HOST: &str = "/run/host";
const SET_UP: &str = "/usr/local/share/luft-set-up";
// Graphics drivers for apps drawn with the GPU, and links and mail opened by the desktop rather than inside
const BASICS: [&str; 4] = [
    "libgl1-mesa-dri",
    "libegl1",
    "mesa-vulkan-drivers",
    "flatpak-xdg-utils",
];
const HAND_OFF: &str = "for tool in xdg-open xdg-email; do \
    [ -x /usr/libexec/flatpak-xdg-utils/$tool ] && ln -sf /usr/libexec/flatpak-xdg-utils/$tool /usr/local/bin/$tool; \
done";

pub fn exists() -> bool {
    Command::new("podman")
        .args(["container", "exists", NAME])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|status| status.success())
}

pub fn ready(task: Task) -> Result<(), String> {
    if !exists() {
        task.progress(Stage::Preparing, None);
        pull::pull(IMAGE, task)?;
        task.progress(Stage::Preparing, None);
        apt::run(
            Command::new("toolbox").args([
                "create",
                "--assumeyes",
                "--image",
                IMAGE,
                "--container",
                NAME,
            ]),
            Stage::Preparing,
            task,
        )?;
    }
    if query(&["test", "-e", SET_UP]).is_ok() {
        return Ok(());
    }
    apt::run(&mut apt::apt_get(&["update"]), Stage::Preparing, task)?;
    let mut basics = vec!["install", "--no-install-recommends", "--"];
    basics.extend(BASICS);
    apt::run(&mut apt::apt_get(&basics), Stage::Preparing, task)?;
    query(&["sudo", "sh", "-c", HAND_OFF])?;
    query(&["sudo", "touch", SET_UP]).map(drop)
}

pub fn run(program: &[&str]) -> Command {
    let mut command = Command::new("toolbox");
    command
        .args(["run", "--container", NAME, "--"])
        .args(program);
    command
}

pub fn query(program: &[&str]) -> Result<String, String> {
    let output = run(program)
        .stdin(Stdio::null())
        .output()
        .map_err(|_| "Toolbox isn't installed.".to_owned())?;
    if !output.status.success() {
        return Err(apt::friendly(&String::from_utf8_lossy(&output.stderr)));
    }
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

/// Where a file on this computer shows inside the container.
pub fn inside(path: &Path) -> PathBuf {
    let home = dirs::home_dir().unwrap_or_default();
    if path.starts_with(&home) {
        path.to_path_buf()
    } else {
        Path::new(HOST).join(path.strip_prefix("/").unwrap_or(path))
    }
}
