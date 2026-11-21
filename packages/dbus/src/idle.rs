use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Duration;
#[cfg(feature = "service")]
use std::{sync::Arc, time::Instant};

use tokio::sync::Notify;
use tokio::time::timeout;

static ASKING: AtomicUsize = AtomicUsize::new(0);

/// Keeps a service from counting as idle while polkit asks someone whether
/// one of its calls may go on, however long they take to answer.
pub(crate) struct Asking;

impl Asking {
    pub(crate) fn start() -> Self {
        ASKING.fetch_add(1, Ordering::SeqCst);
        Self
    }
}

impl Drop for Asking {
    fn drop(&mut self) {
        ASKING.fetch_sub(1, Ordering::SeqCst);
    }
}

fn asking() -> bool {
    ASKING.load(Ordering::SeqCst) > 0
}

#[derive(Default)]
pub struct Idle {
    active: AtomicUsize,
    changed: Notify,
}

pub struct Activity<'a>(&'a Idle);

impl Idle {
    pub fn hold(&self) -> Activity<'_> {
        self.active.fetch_add(1, Ordering::SeqCst);
        self.changed.notify_one();
        Activity(self)
    }

    pub async fn wait(&self, limit: Duration) {
        loop {
            let expired = timeout(limit, self.changed.notified()).await.is_err();
            if expired && self.active.load(Ordering::SeqCst) == 0 && !asking() {
                return;
            }
        }
    }
}

impl Drop for Activity<'_> {
    fn drop(&mut self) {
        self.0.active.fetch_sub(1, Ordering::SeqCst);
        self.0.changed.notify_one();
    }
}

#[cfg(feature = "service")]
const EXIT_WHEN_IDLE_FOR: Duration = Duration::from_secs(30);
#[cfg(feature = "service")]
const CHECK_EVERY: Duration = Duration::from_secs(5);

/// Serves one object of a system service started on demand, and gives its
/// name back once no call has run for half a minute.
#[cfg(feature = "service")]
pub async fn serve<I: zbus::object_server::Interface>(
    name: &'static str,
    path: &'static str,
    interface: impl FnOnce(Arc<Idle>) -> I,
) -> zbus::Result<()> {
    crate::panics::report();
    let idle = Arc::new(Idle::default());
    let connection = zbus::connection::Builder::system()
        .serve_at(path, interface(idle.clone()))
        .name(name)
        .build()
        .await?;
    idle.wait(EXIT_WHEN_IDLE_FOR).await;
    connection.release_name(name).await?;
    Ok(())
}

/// Returns once `busy` has said no for half a minute, or the service is told
/// to stop.
#[cfg(feature = "service")]
pub async fn until_idle(mut busy: impl FnMut() -> bool) -> std::io::Result<()> {
    use tokio::signal::unix::{SignalKind, signal};

    crate::panics::report();
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    let mut tick = tokio::time::interval(CHECK_EVERY);
    let mut idle_since = None;
    loop {
        tokio::select! {
            _ = terminate.recv() => return Ok(()),
            _ = interrupt.recv() => return Ok(()),
            _ = tick.tick() => {
                if busy() || asking() {
                    idle_since = None;
                } else if idle_since.get_or_insert_with(Instant::now).elapsed() >= EXIT_WHEN_IDLE_FOR {
                    return Ok(());
                }
            }
        }
    }
}
