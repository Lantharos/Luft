use std::fs;
use std::os::fd::{AsFd, AsRawFd};

use zbus::proxy::CacheProperties;
use zbus::{Connection, proxy};
use zbus::{OwnedFd, OwnedObjectPath};

use crate::error::Error;

const GREETER_CLASS: &str = "greeter";

#[proxy(
    interface = "org.freedesktop.login1.Manager",
    default_service = "org.freedesktop.login1",
    default_path = "/org/freedesktop/login1"
)]
trait Manager {
    #[zbus(name = "GetSessionByPID")]
    fn get_session_by_pid(&self, pid: u32) -> zbus::Result<OwnedObjectPath>;
}

#[proxy(
    interface = "org.freedesktop.login1.Session",
    default_service = "org.freedesktop.login1"
)]
trait Session {
    #[zbus(property)]
    fn class(&self) -> zbus::Result<String>;
}

fn pid_of(pidfd: &OwnedFd) -> Option<u32> {
    fs::read_to_string(format!("/proc/self/fdinfo/{}", pidfd.as_fd().as_raw_fd()))
        .ok()?
        .lines()
        .find_map(|line| line.strip_prefix("Pid:"))?
        .trim()
        .parse()
        .ok()
}

pub async fn require_greeter(connection: &Connection, pidfd: OwnedFd) -> Result<(), Error> {
    let pid = pid_of(&pidfd).ok_or_else(Error::not_authorized)?;
    let Ok(path) = ManagerProxy::new(connection)
        .await?
        .get_session_by_pid(pid)
        .await
    else {
        return Err(Error::not_authorized());
    };
    let class = SessionProxy::builder(connection)
        .path(path)
        .cache_properties(CacheProperties::No)
        .build()
        .await?
        .class()
        .await?;
    if class == GREETER_CLASS && pid_of(&pidfd) == Some(pid) {
        Ok(())
    } else {
        Err(Error::not_authorized())
    }
}
