use std::sync::Arc;
use std::time::Duration;

use tokio::sync::Mutex;
use tokio::time::Instant;
use zbus::Connection;
use zbus::object_server::InterfaceRef;

use super::ambient::Ambient;
use super::idle::{self, Action, SCREEN_OFF_AFTER_LOCK, Situation};
use super::inhibitors::Inhibitors;
use super::keyboard::{self, Backlight, IdleChange, Keyboard};
use super::proxies::{
    self, DisplayConfigProxy, ScreenSaverProxy, SessionManagerProxy, ShellBrightnessProxy,
};
use super::watches::{Watch, Watches};
use crate::shared::notify::{self, Notification, URGENCY_CRITICAL};
use crate::shared::settings::Schemas;
use crate::shared::system::LoginProxy;

pub const POWER: &str = "com.lantharos.kestrel.power";
pub const SESSION: &str = "org.gnome.desktop.session";
pub const SCREENSAVER: &str = "org.gnome.desktop.screensaver";
const IDLE_INHIBITED: u32 = 8;
const SUSPEND_INHIBITED: u32 = 4;
pub const LOW_WARNING_LEVEL: u32 = 3;
const SCREEN_ON: i32 = 0;
const SCREEN_OFF: i32 = 3;
const AWAKE_AFTER_PLUGGING_IN: Duration = Duration::from_secs(15);
const FORCED_LOGOUT: u32 = 2;

#[derive(Clone, Copy, PartialEq, PartialOrd, Debug)]
pub enum Mode {
    Normal,
    Dim,
    Blank,
    Sleep,
}

pub struct Power {
    pub settings: Schemas,
    pub session: Connection,
    pub watches: Watches,
    pub mode: Mode,
    pub session_active: bool,
    pub inhibited: u32,
    pub screen_locked: bool,
    pub on_battery: bool,
    pub battery_low: bool,
    pub profile: Option<String>,
    pub lid_closed: bool,
    pub screen_off: bool,
    pub virtual_machine: bool,
    pub warn_before_sleeping: bool,
    pub warned_action: Action,
    pub warning: u32,
    pub awake_until: Option<Instant>,
    pub mode_after_awake: Mode,
    pub backlight: Option<Arc<Mutex<Backlight>>>,
    pub keyboard: Option<InterfaceRef<Keyboard>>,
    pub shell: ShellBrightnessProxy<'static>,
    pub display: DisplayConfigProxy<'static>,
    pub screensaver: ScreenSaverProxy<'static>,
    pub session_manager: SessionManagerProxy<'static>,
    pub login: LoginProxy<'static>,
    pub inhibitors: Inhibitors,
    pub ambient: Ambient,
    pub has_brightness_control: bool,
}

impl Power {
    fn sleep_action(&self) -> Action {
        let key = if self.on_battery {
            "sleep-inactive-battery-type"
        } else {
            "sleep-inactive-ac-type"
        };
        Action::named(&self.settings.get::<String>(POWER, key))
    }

    fn allows(&self, action: Action) -> bool {
        self.inhibited & action.inhibitors() == 0
    }

    fn saving_power(&self) -> bool {
        match &self.profile {
            Some(profile) => profile == "power-saver",
            None => self.battery_low,
        }
    }

    pub async fn setting_changed(&mut self, schema: &str, key: &str) {
        match key {
            "power-saver-profile-on-low-battery" => self.hold_power_saver().await,
            "ambient-enabled" => self.claim_light().await,
            _ if schema == SESSION || key.starts_with("sleep-inactive") || key == "idle-dim" => {
                self.configure().await
            }
            _ => {}
        }
    }

    pub async fn configure(&mut self) {
        let idle_inhibited = self.inhibited & IDLE_INHIBITED != 0;
        self.watches.clear(Watch::Blank).await;
        if self.screen_locked {
            self.watches.add(Watch::Blank, SCREEN_OFF_AFTER_LOCK).await;
        }
        if !self.session_active || (idle_inhibited && !self.screen_locked) {
            self.set_mode(Mode::Normal).await;
            for watch in [Watch::Sleep, Watch::Dim, Watch::Warning] {
                self.watches.clear(watch).await;
            }
            self.withdraw_warning().await;
            self.awake_until = None;
            return;
        }
        let action = self.sleep_action();
        let delay_key = if self.on_battery {
            "sleep-inactive-battery-timeout"
        } else {
            "sleep-inactive-ac-timeout"
        };
        let timeouts = idle::timeouts(&Situation {
            screen_locked: self.screen_locked,
            saving_power: self.saving_power(),
            dim_when_idle: self.settings.get(POWER, "idle-dim"),
            screen_off_delay: self.settings.get(SESSION, "idle-delay"),
            action,
            action_delay: self.settings.get::<i32>(POWER, delay_key).max(0) as u32,
            action_allowed: self.allows(action),
            virtual_machine: self.virtual_machine,
        });
        for (watch, seconds) in [
            (Watch::Sleep, timeouts.act),
            (Watch::Warning, timeouts.warn),
            (Watch::Dim, timeouts.dim),
        ] {
            self.watches.clear(watch).await;
            if seconds != 0 {
                self.watches.add(watch, seconds).await;
            }
        }
        self.warned_action = action;
        if timeouts.warn == 0 {
            self.withdraw_warning().await;
        }
    }

    pub async fn watch_fired(&mut self, id: u32) {
        match self.watches.which(id) {
            Some(Watch::Dim) => self.set_mode_unless_awake(Mode::Dim).await,
            Some(Watch::Blank) => self.set_mode_unless_awake(Mode::Blank).await,
            Some(Watch::Sleep) => self.set_mode_unless_awake(Mode::Sleep).await,
            Some(Watch::Warning) => {
                if self.warn_before_sleeping {
                    self.warn_about_sleep().await;
                }
                self.watches.watch_activity().await;
            }
            Some(Watch::Activity) => {
                self.watches.forget_activity();
                self.awake_until = None;
                self.withdraw_warning().await;
                self.set_mode(Mode::Normal).await;
            }
            None => {}
        }
    }

    pub async fn set_mode_unless_awake(&mut self, mode: Mode) {
        if self.awake_until.is_some() {
            self.mode_after_awake = mode;
        } else {
            self.set_mode(mode).await;
        }
    }

    pub async fn set_mode(&mut self, mode: Mode) {
        if (mode <= self.mode && mode != Mode::Normal) || !self.session_active {
            return;
        }
        if mode != Mode::Normal {
            self.watches.watch_activity().await;
        }
        match mode {
            Mode::Dim => {
                self.dim_screen(true).await;
                let percentage = self.settings.get(POWER, "idle-brightness");
                self.change_backlight(IdleChange::Dim(percentage)).await;
            }
            Mode::Blank => {
                self.screen(false).await;
                self.change_backlight(IdleChange::Off).await;
            }
            Mode::Sleep => {
                let action = self.sleep_action();
                if !self.allows(action) {
                    return;
                }
                self.act(action).await;
            }
            Mode::Normal => {
                self.screen(true).await;
                self.dim_screen(false).await;
                self.change_backlight(IdleChange::Restore).await;
            }
        }
        self.mode = mode;
    }

    pub async fn change_backlight(&self, change: IdleChange) {
        let (Some(backlight), Some(keyboard)) = (&self.backlight, &self.keyboard) else {
            return;
        };
        let changed = backlight.lock().await.idle(change).await;
        match changed {
            Ok(()) => keyboard::announce(keyboard, "idle").await,
            Err(error) => eprintln!("Couldn't change the keyboard backlight: {error}"),
        }
    }

    pub async fn backlight_changed_by_hardware(
        &mut self,
        signal: proxies::BrightnessChangedWithSource,
    ) {
        let (Ok(args), Some(backlight), Some(keyboard)) =
            (signal.args(), &self.backlight, &self.keyboard)
        else {
            return;
        };
        if args.source == "external" {
            return;
        }
        backlight.lock().await.follow(args.value);
        keyboard::announce(keyboard, &args.source).await;
    }

    pub async fn dim_screen(&mut self, dim: bool) {
        match self.shell.set_dimming(dim).await {
            Ok(()) => self.ambient.recalibrate(),
            Err(error) => eprintln!(
                "Couldn't {} the screen: {error}",
                if dim { "dim" } else { "brighten" }
            ),
        }
    }

    pub async fn screen(&mut self, on: bool) {
        if on != self.screen_off {
            return;
        }
        self.screen_off = !on;
        if let Err(error) = self
            .display
            .set_power_save_mode(if on { SCREEN_ON } else { SCREEN_OFF })
            .await
        {
            eprintln!(
                "Couldn't turn the screens {}: {error}",
                if on { "on" } else { "off" }
            );
        }
        self.claim_light().await;
    }

    pub async fn claim_light(&mut self) {
        let wanted = self.has_brightness_control
            && self.session_active
            && !self.screen_off
            && self.settings.get::<bool>(POWER, "ambient-enabled");
        if wanted != self.ambient.claimed() {
            self.ambient.claim(wanted).await;
        }
    }

    pub async fn act(&mut self, action: Action) {
        let acted = match action {
            Action::Blank => {
                self.screen(false).await;
                Ok(())
            }
            Action::Suspend => self.login.suspend(false).await,
            Action::Hibernate => self.login.hibernate(false).await,
            Action::Shutdown => self.login.power_off(false).await,
            Action::Interactive => self.session_manager.shutdown().await,
            Action::Logout => self.session_manager.logout(FORCED_LOGOUT).await,
            Action::Nothing => Ok(()),
        };
        if let Err(error) = acted {
            eprintln!("Couldn't act on inactivity: {error}");
        }
    }

    pub async fn lock_changed(&mut self, locked: bool) {
        if locked == self.screen_locked {
            return;
        }
        self.screen_locked = locked;
        self.configure().await;
        if locked {
            self.set_mode(Mode::Blank).await;
            self.inhibitors.release_sleep();
        } else {
            self.inhibitors.hold_sleep().await;
        }
    }

    pub async fn keep_awake_on_power(&mut self) {
        let wanted = !self.lid_closed
            && self.session_active
            && (self.awake_until.is_some() || matches!(self.mode, Mode::Blank | Mode::Dim));
        if !wanted {
            self.awake_until = None;
            return;
        }
        if self.awake_until.is_none() {
            self.mode_after_awake = self.mode;
            self.set_mode(Mode::Normal).await;
        }
        self.awake_until = Some(Instant::now() + AWAKE_AFTER_PLUGGING_IN);
    }

    pub async fn lid_closed_action(&self, external_monitor: bool) {
        let suspends = !external_monitor || !self.session_active;
        if suspends && self.inhibited & SUSPEND_INHIBITED != 0 {
            self.lock_screen().await;
        }
    }

    pub async fn lock_screen(&self) {
        let locked = if self.settings.get(SCREENSAVER, "lock-enabled") {
            self.screensaver.lock().await
        } else {
            self.screensaver.set_active(true).await
        };
        if let Err(error) = locked {
            eprintln!("Couldn't lock the screen: {error}");
        }
    }

    pub async fn prepare_for_sleep(&mut self, sleeping: bool) {
        if sleeping {
            self.withdraw_warning().await;
            if !self.settings.get::<bool>(SCREENSAVER, "lock-enabled") || self.screen_locked {
                self.screen(false).await;
                self.inhibitors.release_sleep();
            }
        } else {
            self.screen(true).await;
            self.inhibitors.hold_sleep().await;
        }
    }

    pub async fn hold_power_saver(&mut self) {
        let wanted = self.battery_low
            && self
                .settings
                .get::<bool>(POWER, "power-saver-profile-on-low-battery");
        self.inhibitors.hold_power_saver(wanted).await;
    }

    pub async fn warn_about_sleep(&mut self) {
        let (summary, body) = match self.warned_action {
            Action::Logout => (
                "Logging out soon",
                "You'll be logged out because the computer isn't being used.",
            ),
            Action::Hibernate => (
                "Hibernating soon",
                "The computer will hibernate because it isn't being used.",
            ),
            _ => (
                "Suspending soon",
                "The computer will suspend because it isn't being used.",
            ),
        };
        let shown = Notification {
            app: "Power",
            icon: "system-suspend-symbolic",
            summary,
            body,
            actions: &[],
            urgency: URGENCY_CRITICAL,
            transient: false,
        }
        .show(&self.session, self.warning)
        .await;
        match shown {
            Ok(id) => self.warning = id,
            Err(error) => eprintln!("Couldn't warn about suspending: {error}"),
        }
    }

    pub async fn withdraw_warning(&mut self) {
        if self.warning != 0 {
            notify::close(&self.session, self.warning).await;
            self.warning = 0;
        }
    }
}
