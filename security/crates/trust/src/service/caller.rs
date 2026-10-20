use std::ffi::CStr;
use std::path::Path;

use zbus::Connection;
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::names::BusName;

const SHELL: &str = "/usr/bin/kestrel";
const SHELL_UNITS: [&str; 2] = ["kestrel.service", "kestrel-setup.service"];
const GREETER: &CStr = c"greetd";

fn greeter_uid() -> Option<u32> {
    let entry = unsafe { libc::getpwnam(GREETER.as_ptr()) };
    (!entry.is_null()).then(|| unsafe { (*entry).pw_uid })
}

fn runs_the_shell(pid: u32) -> bool {
    std::fs::read_link(format!("/proc/{pid}/exe")).is_ok_and(|exe| exe == Path::new(SHELL))
}

fn in_a_shell_unit(pid: u32, uid: u32) -> bool {
    let Ok(cgroups) = std::fs::read_to_string(format!("/proc/{pid}/cgroup")) else {
        return false;
    };
    let manager = format!("user@{uid}.service");
    cgroups
        .lines()
        .filter_map(|line| line.strip_prefix("0::"))
        .any(|path| {
            let mut parts = path.split('/').skip_while(|part| *part != manager);
            parts.next().is_some() && parts.any(|part| SHELL_UNITS.contains(&part))
        })
}

pub async fn is_the_shell(connection: &Connection, header: &Header<'_>) -> zbus::Result<bool> {
    let Some(sender) = header.sender() else {
        return Ok(false);
    };
    let credentials = DBusProxy::new(connection)
        .await?
        .get_connection_credentials(BusName::Unique(sender.to_owned()))
        .await?;
    let (Some(pid), Some(uid)) = (credentials.process_id(), credentials.unix_user_id()) else {
        return Ok(false);
    };
    Ok(tokio::task::spawn_blocking(move || {
        runs_the_shell(pid) && (in_a_shell_unit(pid, uid) || greeter_uid() == Some(uid))
    })
    .await
    .unwrap_or(false))
}
