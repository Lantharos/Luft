//! Ubuntu 26.04, kept as a folder in your account. apt runs in a user namespace that maps the account's
//! subordinate ids, so packages own their files as they would on Ubuntu, and apps start through bubblewrap
//! with Ubuntu's system in place of this computer's and the rest shared as it is for any other app.

mod apt;
mod base;
mod setup;
mod view;

use std::ffi::{OsStr, OsString};
use std::os::unix::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

pub use apt::{UNAVAILABLE, quietly};
pub use setup::ready;

use crate::progress::Stage;
use crate::task::Task;

pub const LAUNCH: &str = "--ubuntu";
pub const ORIGIN: &str = "Ubuntu 26.04";
const FOLDER: &str = "luft/ubuntu";
const HOST: &str = "/run/host";
const SEARCH_PATH: &str =
    "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/usr/local/games:/usr/games";

pub fn tree() -> PathBuf {
    dirs::data_dir().unwrap_or_default().join(FOLDER)
}

pub fn exists() -> bool {
    tree().is_dir()
}

fn home() -> PathBuf {
    dirs::home_dir()
        .and_then(|home| home.canonicalize().ok())
        .unwrap_or_default()
}

pub fn apt(arguments: &[&str], working: Stage, task: Task) -> Result<(), String> {
    apt::run(&tree(), arguments, working, task)
}

fn command(program: &[impl AsRef<OsStr>], search_path: OsString) -> Command {
    let mut command = Command::new("bwrap");
    command
        .args(view::arguments(&tree(), &home()))
        .args([
            OsStr::new("--setenv"),
            OsStr::new("PATH"),
            &search_path,
            OsStr::new("--"),
        ])
        .args(program);
    command
}

/// Runs one of Ubuntu's own programs as you, found only in Ubuntu's system folders, so
/// nothing in your own search path stands in for it.
pub fn tool(program: &[impl AsRef<OsStr>]) -> Command {
    command(program, SEARCH_PATH.into())
}

/// Starts an app from its menu entry, in place of this process, finding programs the
/// way its apps do.
pub fn launch(program: &[String]) -> i32 {
    let error = command(program, view::search_path()).exec();
    eprintln!("Couldn't start the app in Ubuntu: {error}");
    1
}

pub fn query(program: &[&str]) -> Result<String, String> {
    let output = tool(program)
        .stdin(Stdio::null())
        .output()
        .map_err(|_| UNAVAILABLE.to_owned())?;
    if !output.status.success() {
        return Err(apt::friendly(&String::from_utf8_lossy(&output.stderr)));
    }
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

/// Runs a program with the account's own id as root and its subordinate ids as everyone else.
fn namespaced(program: &str) -> Command {
    let mut command = Command::new("unshare");
    command.args(["--user", "--map-auto", "--map-root-user", "--", program]);
    command
}

/// Runs a program as Ubuntu's root, who owns its system, as apt needs to.
pub fn as_root(tree: &Path, program: &[&str]) -> Command {
    let home = home();
    let mut command = namespaced("bwrap");
    command
        .arg("--bind")
        .arg(tree)
        .arg("/")
        .args([
            "--unshare-pid",
            "--die-with-parent",
            "--proc",
            "/proc",
            "--dev",
            "/dev",
            "--perms",
            "1777",
            "--tmpfs",
            "/tmp",
            "--ro-bind",
            "/",
            HOST,
            "--ro-bind",
        ])
        .arg(&home)
        .arg(&home)
        .args([
            "--cap-add",
            "ALL",
            "--setenv",
            "HOME",
            "/root",
            "--setenv",
            "PATH",
            SEARCH_PATH,
            "--",
        ])
        .args(program);
    command
}

/// Where a file on this computer shows inside Ubuntu.
pub fn inside(path: &Path) -> PathBuf {
    let home = home();
    if path.starts_with(&home) {
        path.to_path_buf()
    } else {
        Path::new(HOST).join(path.strip_prefix("/").unwrap_or(path))
    }
}
