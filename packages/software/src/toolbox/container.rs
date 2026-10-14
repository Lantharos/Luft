use std::process::{Command, Stdio};
use std::sync::LazyLock;

use crate::progress::Stage;
use crate::task::Task;

use super::{pull, transaction};

const OS_RELEASE: &str = "/etc/os-release";
const DISTRO: &str = "fedora";
const IMAGES: &str = "registry.fedoraproject.org/fedora-toolbox";

static RELEASE: LazyLock<String> = LazyLock::new(|| {
    std::fs::read_to_string(OS_RELEASE)
        .unwrap_or_default()
        .lines()
        .find_map(|line| line.strip_prefix("VERSION_ID="))
        .map(|value| value.trim_matches('"').to_owned())
        .unwrap_or_default()
});

pub fn name() -> String {
    format!("{DISTRO}-toolbox-{}", *RELEASE)
}

pub fn exists() -> bool {
    Command::new("podman")
        .args(["container", "exists", &name()])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|status| status.success())
}

pub fn create(task: Task) -> Result<(), String> {
    task.progress(Stage::Preparing, None);
    pull::pull(&format!("{IMAGES}:{}", *RELEASE), task)?;
    task.progress(Stage::Preparing, None);
    transaction::run(
        Command::new("toolbox").args([
            "create",
            "--assumeyes",
            "--distro",
            DISTRO,
            "--release",
            &RELEASE,
        ]),
        Stage::Preparing,
        task,
    )
}

pub fn run(program: &[&str]) -> Command {
    let mut command = Command::new("toolbox");
    command.args(["run", "--container", &name()]).args(program);
    command
}

pub fn query(program: &[&str]) -> Result<String, String> {
    let output = run(program)
        .stdin(Stdio::null())
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(transaction::friendly(&String::from_utf8_lossy(
            &output.stderr,
        )));
    }
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}
