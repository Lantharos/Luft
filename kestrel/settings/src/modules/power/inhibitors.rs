use std::time::Duration;

use tokio::time::{Instant, sleep_until};
use zbus::Connection;
use zbus::zvariant::OwnedFd;

use super::proxies::PowerProfilesProxy;
use crate::shared::system::LoginProxy;

const LID_SETTLE: Duration = Duration::from_secs(8);
const APPLICATION: &str = "com.lantharos.Settings";

pub struct Inhibitors {
    login: LoginProxy<'static>,
    system: Connection,
    lid: Option<OwnedFd>,
    lid_check_at: Option<Instant>,
    sleep: Option<OwnedFd>,
    power_saver: Option<u32>,
}

impl Inhibitors {
    pub fn new(login: LoginProxy<'static>, system: Connection) -> Self {
        Self {
            login,
            system,
            lid: None,
            lid_check_at: None,
            sleep: None,
            power_saver: None,
        }
    }

    async fn inhibit(&self, what: &str, why: &str, mode: &str) -> Option<OwnedFd> {
        let who = glib::user_name().to_string_lossy().into_owned();
        self.login
            .inhibit(what, &who, why, mode)
            .await
            .inspect_err(|error| eprintln!("Couldn't hold off {what}: {error}"))
            .ok()
    }

    pub async fn hold_sleep(&mut self) {
        if self.sleep.is_none() {
            self.sleep = self
                .inhibit(
                    "sleep",
                    "The screen locks before the computer sleeps",
                    "delay",
                )
                .await;
        }
    }

    pub fn release_sleep(&mut self) {
        self.sleep = None;
    }

    pub async fn sync_lid(&mut self) {
        if self.lid.is_none() {
            self.lid = self
                .inhibit(
                    "handle-lid-switch",
                    "An external monitor is connected or the displays just changed",
                    "block",
                )
                .await;
        }
        self.lid_check_at = Some(Instant::now() + LID_SETTLE);
    }

    pub fn lid_check_pending(&self) -> bool {
        self.lid_check_at.is_some()
    }

    pub async fn lid_check(&self) {
        sleep_until(self.lid_check_at.unwrap_or_else(Instant::now)).await;
    }

    pub fn lid_check_due(&mut self, external_monitor: bool, session_active: bool) {
        self.lid_check_at = None;
        if !external_monitor || !session_active {
            self.lid = None;
        }
    }

    pub async fn hold_power_saver(&mut self, wanted: bool) {
        if wanted == self.power_saver.is_some() {
            return;
        }
        let changed = async {
            let profiles = PowerProfilesProxy::new(&self.system).await?;
            match self.power_saver.take() {
                Some(cookie) => profiles.release_profile(cookie).await,
                None => {
                    let cookie = profiles
                        .hold_profile("power-saver", "The battery is low", APPLICATION)
                        .await?;
                    self.power_saver = Some(cookie);
                    Ok(())
                }
            }
        };
        if let Err(error) = changed.await {
            eprintln!("Couldn't change the power mode for the battery: {error}");
        }
    }
}
