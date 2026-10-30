use std::process::{Command, Stdio};

const SET_UP: &str = "/usr/local/share/luft-set-up";
const HAND_OFF: &str = "for tool in xdg-open xdg-email; do \
    for handler in /usr/libexec/flatpak-xdg-utils/$tool /usr/bin/flatpak-$tool; do \
        [ -x $handler ] && ln -sf $handler /usr/local/bin/$tool && break; \
    done; \
done";

/// Runs a program as root inside a toolbox container. Toolbx only lets
/// people without a password use sudo there, so this goes through podman,
/// which maps the container's root to the person running it.
pub fn command(container: &str, program: &[&str]) -> Command {
    let _ = Command::new("podman")
        .args(["start", container])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status();
    let mut command = Command::new("podman");
    command
        .args(["exec", "--user", "root", container])
        .args(program);
    command
}

fn succeeds(container: &str, program: &[&str]) -> Result<(), String> {
    let output = command(container, program)
        .stdin(Stdio::null())
        .output()
        .map_err(|_| "Podman isn't installed.".to_owned())?;
    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_owned())
    }
}

pub fn set_up(container: &str) -> bool {
    succeeds(container, &["test", "-e", SET_UP]).is_ok()
}

/// Lets links and mail opened inside the container open on the desktop,
/// through the portal, once the distribution's flatpak-xdg-utils is in.
pub fn finish_setting_up(container: &str) -> Result<(), String> {
    succeeds(container, &["sh", "-c", HAND_OFF])?;
    succeeds(container, &["touch", SET_UP])
}
