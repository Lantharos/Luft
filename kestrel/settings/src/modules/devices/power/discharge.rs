use luft_i18n::t;

use super::battery::{Charge, Discharge, Ending};
use super::manager::{POWER, Power};
use crate::L10N;
use crate::shared::notify::{self, Notification, Sound, URGENCY_CRITICAL, URGENCY_NORMAL};

const UPS: u32 = 3;
const TURN_OFF_SAVER: &str = "turn-off-power-saver";
const WARNING_SOUND: &str = "battery-low";

impl Power {
    pub async fn battery_changed(&mut self) {
        if !self.on_battery {
            self.end_discharge().await;
            return;
        }
        if self.discharge.is_none() {
            let ups = self
                .battery_device
                .kind()
                .await
                .is_ok_and(|kind| kind == UPS);
            self.discharge = Some(Discharge::new(ups));
        }
        self.hold_power_saver().await;
        self.warn_about_battery().await;
    }

    pub fn power_saver_wanted(&self) -> bool {
        self.discharge
            .as_ref()
            .is_some_and(|discharge| discharge.saver_reached && !discharge.saver_declined)
            && self
                .settings
                .get::<bool>(POWER, "power-saver-profile-on-low-battery")
    }

    pub async fn power_saver_level_changed(&mut self) {
        if let Some(discharge) = &mut self.discharge {
            discharge.saver_reached = false;
        }
        self.hold_power_saver().await;
    }

    pub async fn hold_power_saver(&mut self) {
        let level = f64::from(self.settings.get::<i32>(POWER, "power-saver-battery-level"));
        if let Some(discharge) = &mut self.discharge {
            discharge.saver_reached |= self.battery.percentage <= level;
        }
        let wanted = self.power_saver_wanted();
        if wanted == self.inhibitors.wants_power_saver() {
            return;
        }
        self.inhibitors.hold_power_saver(wanted).await;
        self.configure().await;
        if !self.inhibitors.holds_power_saver() {
            self.withdraw_power_saver_notice().await;
        } else if self
            .discharge
            .as_ref()
            .is_some_and(|discharge| !discharge.saver_told)
        {
            self.tell_power_saver_on().await;
        }
    }

    pub async fn power_saver_released(&mut self, cookie: u32) {
        if !self.inhibitors.power_saver_released(cookie) {
            return;
        }
        if let Some(discharge) = &mut self.discharge {
            discharge.saver_declined = true;
        }
        self.withdraw_power_saver_notice().await;
        self.configure().await;
    }

    pub async fn notification_action(&mut self, id: u32, key: &str) {
        let Some(discharge) = &mut self.discharge else {
            return;
        };
        if id == discharge.saver_notice && key == TURN_OFF_SAVER {
            discharge.saver_declined = true;
            self.hold_power_saver().await;
        }
    }

    async fn tell_power_saver_on(&mut self) {
        let shown = Notification {
            app: "Power",
            icon: "power-profile-power-saver-symbolic",
            summary: &t!(L10N, "battery-saver-title"),
            body: &t!(L10N, "battery-saver-body"),
            actions: &[(TURN_OFF_SAVER, &t!(L10N, "battery-saver-turn-off"))],
            urgency: URGENCY_NORMAL,
            transient: false,
            sound: Sound::Silent,
            shows_when_locked: true,
        }
        .show(&self.session, 0)
        .await;
        match (shown, &mut self.discharge) {
            (Ok(id), Some(discharge)) => {
                discharge.saver_notice = id;
                discharge.saver_told = true;
            }
            (Err(error), _) => eprintln!("Couldn't tell that the power saver is on: {error}"),
            (Ok(_), None) => {}
        }
    }

    async fn withdraw_power_saver_notice(&mut self) {
        if let Some(discharge) = &mut self.discharge
            && discharge.saver_notice != 0
        {
            notify::close(&self.session, std::mem::take(&mut discharge.saver_notice)).await;
        }
    }

    async fn warn_about_battery(&mut self) {
        let Some(discharge) = &self.discharge else {
            return;
        };
        let charge = discharge.charge(self.battery);
        let notice = charge.min(Charge::Critical);
        let running_out = charge == Charge::Empty && !discharge.ran_out;
        if notice <= discharge.warned && !running_out {
            return;
        }
        let ending = match (discharge.ending, notice) {
            (Some(ending), _) => Some(ending),
            (None, Charge::Critical) => Some(discharge.ending(self.can_hibernate().await)),
            (None, _) => None,
        };
        let shown = if notice > discharge.warned {
            self.show_battery_warning(ending).await
        } else {
            None
        };
        let Some(discharge) = &mut self.discharge else {
            return;
        };
        discharge.ending = ending;
        if let Some(id) = shown {
            discharge.warning = id;
            discharge.warned = notice;
        }
        if running_out && let Some(ending) = ending {
            discharge.ran_out = true;
            let fallback = discharge.fallback();
            self.run_out(ending, fallback).await;
        }
    }

    async fn can_hibernate(&self) -> bool {
        self.login
            .can_hibernate()
            .await
            .is_ok_and(|answer| answer == "yes")
    }

    fn battery_left(&self, discharge: &Discharge) -> String {
        let level = self.battery.percentage.round() as i64;
        match discharge
            .seconds_left(self.battery)
            .map(|seconds| (seconds + 30) / 60)
        {
            Some(minutes) if minutes >= 60 => t!(
                L10N,
                "battery-left-hours",
                level = level,
                hours = minutes / 60,
                minutes = minutes % 60
            ),
            Some(minutes) => t!(
                L10N,
                "battery-left-minutes",
                level = level,
                minutes = minutes
            ),
            None => t!(L10N, "battery-left", level = level),
        }
    }

    async fn show_battery_warning(&self, ending: Option<Ending>) -> Option<u32> {
        let discharge = self.discharge.as_ref()?;
        let left = self.battery_left(discharge);
        let critical = ending.is_some();
        let summary = match (critical, discharge.ups) {
            (false, false) => t!(L10N, "battery-low-title"),
            (false, true) => t!(L10N, "battery-ups-low-title"),
            (true, false) => t!(L10N, "battery-critical-title"),
            (true, true) => t!(L10N, "battery-ups-critical-title"),
        };
        let body = match ending {
            None => left,
            Some(Ending::Hibernate) => t!(L10N, "battery-critical-hibernate", left = left),
            Some(Ending::Suspend) => t!(L10N, "battery-critical-suspend", left = left),
            Some(Ending::PowerOff) => t!(L10N, "battery-critical-power-off", left = left),
        };
        let shown = Notification {
            app: "Power",
            icon: if critical {
                "battery-caution-symbolic"
            } else {
                "battery-low-symbolic"
            },
            summary: &summary,
            body: &body,
            actions: &[],
            urgency: if critical {
                URGENCY_CRITICAL
            } else {
                URGENCY_NORMAL
            },
            transient: false,
            sound: Sound::Named(WARNING_SOUND),
            shows_when_locked: true,
        }
        .show(&self.session, discharge.warning)
        .await;
        shown
            .inspect_err(|error| eprintln!("Couldn't warn about the battery: {error}"))
            .ok()
    }

    async fn run_out(&self, ending: Ending, fallback: Ending) {
        if self.end_with(ending).await || ending == fallback {
            return;
        }
        self.end_with(fallback).await;
    }

    async fn end_with(&self, ending: Ending) -> bool {
        let ended = match ending {
            Ending::Hibernate => self.login.hibernate(false).await,
            Ending::Suspend => self.login.suspend(false).await,
            Ending::PowerOff => self.login.power_off(false).await,
        };
        ended
            .inspect_err(|error| eprintln!("Couldn't act on the empty battery: {error}"))
            .is_ok()
    }

    async fn end_discharge(&mut self) {
        let Some(discharge) = self.discharge.take() else {
            return;
        };
        for id in [discharge.warning, discharge.saver_notice] {
            if id != 0 {
                notify::close(&self.session, id).await;
            }
        }
        if self.inhibitors.wants_power_saver() {
            self.inhibitors.hold_power_saver(false).await;
            self.configure().await;
        }
    }
}
