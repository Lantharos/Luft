use std::os::fd::AsFd;
use std::path::Path;

use luft_identity::program;
use luft_shield::Process;
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::names::BusName;

use crate::daemon::Daemon;

const NAME: &str = "com.lantharos.Passkeys";
const PROGRAM: &str = "/usr/libexec/luft-passkeys";

pub async fn is_luft_passkeys(daemon: &Daemon, header: &Header<'_>) -> bool {
    daemon.sent_by_owner_of(header, NAME).await
        && (program::is_development_build() || started_shielded(daemon, header).await)
}

async fn started_shielded(daemon: &Daemon, header: &Header<'_>) -> bool {
    let Some(sender) = header.sender() else {
        return false;
    };
    let Ok(proxy) = DBusProxy::new(&daemon.connection).await else {
        return false;
    };
    let credentials = proxy
        .get_connection_credentials(BusName::Unique(sender.to_owned()))
        .await;
    let Some(pidfd) = credentials
        .as_ref()
        .ok()
        .and_then(|found| found.process_fd())
    else {
        return false;
    };
    let user = unsafe { libc::getuid() };
    match Process::pinned(pidfd.as_fd())
        .and_then(|process| process.started_shielded(Path::new(PROGRAM), user))
    {
        Ok(()) => true,
        Err(reason) => {
            eprintln!("Refused passkey requests from {sender}: {reason}");
            false
        }
    }
}
