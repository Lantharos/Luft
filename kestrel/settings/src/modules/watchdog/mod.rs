mod proxies;
mod stall;

use std::time::Duration;

use futures_util::StreamExt;
use tokio::time::{Instant, MissedTickBehavior, interval, timeout};
use zbus::Connection;
use zbus::fdo::DBusProxy;
use zbus::names::BusName;
use zbus::zvariant::OwnedFd;

use crate::context::Context;
use crate::shared::system::LoginProxy;
use proxies::{HealthProxy, LoginSessionProxy, LoginUserProxy, WatchdogProxy};
use stall::Stall;

const KESTREL: &str = "com.lantharos.Kestrel";
const CHECK_INTERVAL: Duration = Duration::from_secs(3);
const ANSWER_LIMIT: Duration = Duration::from_secs(3);
const PRESENTATION_LIMIT: Duration = Duration::from_secs(10);
const POWER_KEYS_AFTER: Duration = Duration::from_secs(6);
const REPORT_AFTER: Duration = Duration::from_secs(15);
const REPORT_LIMIT: Duration = Duration::from_secs(5);

struct PowerKeys {
    login: LoginProxy<'static>,
    inhibitor: Option<OwnedFd>,
}

impl PowerKeys {
    async fn hold(&mut self) {
        if self.inhibitor.is_some() {
            return;
        }
        let who = glib::user_name().to_string_lossy().into_owned();
        self.inhibitor = self
            .login
            .inhibit(
                "handle-power-key:handle-suspend-key:handle-hibernate-key",
                &who,
                "The desktop decides what the power keys do",
                "block",
            )
            .await
            .inspect_err(|error| eprintln!("Couldn't take over the power keys: {error}"))
            .ok();
        if self.inhibitor.is_some() {
            eprintln!("The power keys go to the desktop");
        }
    }

    fn release(&mut self) {
        if self.inhibitor.take().is_some() {
            eprintln!(
                "Kestrel stopped responding, so the power button turns the computer off directly until it answers again"
            );
        }
    }
}

async fn display_session(
    system: &Connection,
    login: &LoginProxy<'static>,
) -> Option<LoginSessionProxy<'static>> {
    let user = login
        .get_user(rustix::process::getuid().as_raw())
        .await
        .ok()?;
    let user = LoginUserProxy::builder(system)
        .path(user)
        .ok()?
        .build()
        .await
        .ok()?;
    let (_, session) = user.display().await.ok()?;
    LoginSessionProxy::builder(system)
        .path(session)
        .ok()?
        .build()
        .await
        .ok()
}

enum Answer {
    Healthy,
    StalledSince(Instant),
}

async fn ask(health: &HealthProxy<'static>) -> Answer {
    let asked = Instant::now();
    match timeout(ANSWER_LIMIT, health.check()).await {
        Ok(Ok((waiting_ms, recovering))) => {
            let waiting = Duration::from_millis(waiting_ms);
            if recovering || waiting < PRESENTATION_LIMIT {
                Answer::Healthy
            } else {
                Answer::StalledSince(asked.checked_sub(waiting).unwrap_or(asked))
            }
        }
        Ok(Err(zbus::Error::MethodError(name, _, _)))
            if name.as_str() == "org.freedesktop.DBus.Error.ServiceUnknown"
                || name.as_str() == "org.freedesktop.DBus.Error.NameHasNoOwner" =>
        {
            Answer::Healthy
        }
        Ok(Err(_)) | Err(_) => Answer::StalledSince(asked),
    }
}

async fn report(session: &Connection, watchdog: &WatchdogProxy<'static>, stalled: Duration) {
    let reported = async {
        let compositor = DBusProxy::new(session)
            .await?
            .get_connection_unix_process_id(BusName::try_from(KESTREL)?)
            .await?;
        watchdog
            .report(stalled.as_millis() as u64, compositor)
            .await?;
        zbus::Result::Ok(())
    };
    match timeout(REPORT_LIMIT, reported).await {
        Ok(Ok(())) => {}
        Ok(Err(error)) => {
            eprintln!("Couldn't tell the system watchdog that Kestrel is stuck: {error}")
        }
        Err(_) => eprintln!("The system watchdog didn't answer"),
    }
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let login = LoginProxy::new(&context.system).await?;
    let health = HealthProxy::new(&context.session).await?;
    let watchdog = WatchdogProxy::new(&context.system).await?;
    let display = display_session(&context.system, &login).await;
    let mut sleeps = login.receive_prepare_for_sleep().await?;
    let mut power_keys = PowerKeys {
        login,
        inhibitor: None,
    };
    power_keys.hold().await;
    let session = context.session.clone();

    tokio::spawn(async move {
        let mut stall = Stall::default();
        let mut checks = interval(CHECK_INTERVAL);
        checks.set_missed_tick_behavior(MissedTickBehavior::Delay);
        loop {
            tokio::select! {
                Some(signal) = sleeps.next() => {
                    if let Ok(args) = signal.args() {
                        stall.sleeping(args.start);
                    }
                }
                _ = checks.tick() => {
                    let active = match &display {
                        Some(display) => display.active().await.unwrap_or(true),
                        None => true,
                    };
                    let answer = if active && stall.watching() {
                        ask(&health).await
                    } else {
                        Answer::Healthy
                    };
                    let stalled = match answer {
                        Answer::StalledSince(at) => stall.stalled_since(at),
                        Answer::Healthy => {
                            stall.clear();
                            Duration::ZERO
                        }
                    };
                    if stalled >= POWER_KEYS_AFTER {
                        power_keys.release();
                    } else {
                        power_keys.hold().await;
                    }
                    if stalled >= REPORT_AFTER {
                        report(&session, &watchdog, stalled).await;
                    }
                }
            }
        }
    });
    Ok(())
}
