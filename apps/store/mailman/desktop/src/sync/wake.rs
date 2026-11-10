use std::io::{ErrorKind, Read};
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};

use futures_util::StreamExt;
use luft_app::dbus;
use zbus::message::Type;
use zbus::{MatchRule, MessageStream, Proxy};

use super::Engine;

const PORTAL: &str = "org.freedesktop.portal.Desktop";
const PORTAL_PATH: &str = "/org/freedesktop/portal/desktop";
const NETWORK_MONITOR: &str = "org.freedesktop.portal.NetworkMonitor";

fn clock() -> std::io::Result<std::fs::File> {
    let timer = unsafe { libc::timerfd_create(libc::CLOCK_REALTIME, libc::TFD_CLOEXEC) };
    if timer < 0 {
        return Err(std::io::Error::last_os_error());
    }
    Ok(std::fs::File::from(unsafe { OwnedFd::from_raw_fd(timer) }))
}

fn arm(clock: &std::fs::File) -> std::io::Result<()> {
    let never = libc::itimerspec {
        it_interval: libc::timespec {
            tv_sec: 0,
            tv_nsec: 0,
        },
        it_value: libc::timespec {
            tv_sec: libc::time_t::MAX,
            tv_nsec: 0,
        },
    };
    let armed = unsafe {
        libc::timerfd_settime(
            clock.as_raw_fd(),
            libc::TFD_TIMER_ABSTIME | libc::TFD_TIMER_CANCEL_ON_SET,
            &never,
            std::ptr::null_mut(),
        )
    };
    if armed < 0 {
        return Err(std::io::Error::last_os_error());
    }
    Ok(())
}

fn follow_clock(engine: &Engine) -> std::io::Result<()> {
    let mut clock = clock()?;
    let mut expirations = [0; 8];
    loop {
        arm(&clock)?;
        match clock.read(&mut expirations) {
            Err(error) if error.raw_os_error() == Some(libc::ECANCELED) => engine.refresh(),
            Err(error) if error.kind() == ErrorKind::Interrupted => {}
            Err(error) => return Err(error),
            Ok(_) => {}
        }
    }
}

async fn follow_network(engine: &Engine) -> Result<(), String> {
    let connection = dbus::session().await?;
    let monitor = Proxy::new(connection, PORTAL, PORTAL_PATH, NETWORK_MONITOR)
        .await
        .map_err(dbus::failed)?;
    let changed = MatchRule::builder()
        .msg_type(Type::Signal)
        .path(PORTAL_PATH)
        .interface(NETWORK_MONITOR)
        .member("changed")
        .build()
        .map_err(dbus::failed)?;
    let mut changes = MessageStream::for_match_rule(changed, connection, None)
        .await
        .map_err(dbus::failed)?;
    while changes.next().await.is_some() {
        if monitor.call("GetAvailable", &()).await.unwrap_or(false) {
            engine.refresh();
        }
    }
    Ok(())
}

pub fn start(engine: Engine) {
    let resumed = engine.clone();
    std::thread::spawn(move || {
        if let Err(error) = follow_clock(&resumed) {
            eprintln!("mailman: can't follow the computer waking up: {error}");
        }
    });
    luft_app::spawn(async move {
        if let Err(error) = follow_network(&engine).await {
            eprintln!("mailman: can't follow network changes: {error}");
        }
    });
}
