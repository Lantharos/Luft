mod ambient;
mod idle;
mod inhibitors;
mod keyboard;
mod manager;
mod proxies;
mod watches;

use std::sync::Arc;

use futures_util::StreamExt;
use tokio::sync::Mutex;
use tokio::time::{Instant, sleep_until};

use crate::context::Context;
use crate::shared::remote::{Endpoint, RemoteProperty};
use crate::shared::system::{HostnameProxy, LoginProxy, SystemdProxy};
use ambient::Ambient;
use idle::Action;
use inhibitors::Inhibitors;
use keyboard::{Backlight, Keyboard};
use manager::{LOW_WARNING_LEVEL, Mode, POWER, Power, SCREENSAVER, SESSION};
use proxies::{
    DisplayConfigProxy, ScreenSaverProxy, SensorProxyProxy, SessionManagerProxy,
    ShellBrightnessProxy,
};
use watches::Watches;

const NO_WARNING_CHASSIS: [&str; 2] = ["tablet", "handset"];
const SESSION_MANAGER: Endpoint = Endpoint {
    service: "org.gnome.SessionManager",
    path: "/org/gnome/SessionManager",
    interface: "org.gnome.SessionManager",
};
const UPOWER: Endpoint = Endpoint {
    service: "org.freedesktop.UPower",
    path: "/org/freedesktop/UPower",
    interface: "org.freedesktop.UPower",
};
const BATTERY: Endpoint = Endpoint {
    service: "org.freedesktop.UPower",
    path: "/org/freedesktop/UPower/devices/DisplayDevice",
    interface: "org.freedesktop.UPower.Device",
};
const PROFILES: Endpoint = Endpoint {
    service: "org.freedesktop.UPower.PowerProfiles",
    path: "/org/freedesktop/UPower/PowerProfiles",
    interface: "org.freedesktop.UPower.PowerProfiles",
};
const LOGIN: Endpoint = Endpoint {
    service: "org.freedesktop.login1",
    path: "/org/freedesktop/login1",
    interface: "org.freedesktop.login1.Manager",
};
const DISPLAYS: Endpoint = Endpoint {
    service: "org.gnome.Mutter.DisplayConfig",
    path: "/org/gnome/Mutter/DisplayConfig",
    interface: "org.gnome.Mutter.DisplayConfig",
};
const BRIGHTNESS: Endpoint = Endpoint {
    service: "org.gnome.Shell.Brightness",
    path: "/org/gnome/Shell/Brightness",
    interface: "org.gnome.Shell.Brightness",
};
const LIGHT_SENSOR: Endpoint = Endpoint {
    service: "net.hadess.SensorProxy",
    path: "/net/hadess/SensorProxy",
    interface: "net.hadess.SensorProxy",
};

pub async fn start(context: &Context) -> zbus::Result<()> {
    let Some(settings) = context.settings.watch(&[POWER, SESSION, SCREENSAVER]).await else {
        return Ok(());
    };
    let (session, system) = (&context.session, &context.system);
    let (
        mut session_active,
        mut inhibited,
        mut on_battery,
        mut warning_level,
        mut profile,
        mut lid_closed,
        mut external_monitor,
        mut brightness_control,
        mut light,
    ) = tokio::try_join!(
        RemoteProperty::<bool>::new(session, &SESSION_MANAGER, "SessionIsActive"),
        RemoteProperty::<u32>::new(session, &SESSION_MANAGER, "InhibitedActions"),
        RemoteProperty::<bool>::new(system, &UPOWER, "OnBattery"),
        RemoteProperty::<u32>::new(system, &BATTERY, "WarningLevel"),
        RemoteProperty::<String>::new(system, &PROFILES, "ActiveProfile"),
        RemoteProperty::<bool>::new(system, &LOGIN, "LidClosed"),
        RemoteProperty::<bool>::new(session, &DISPLAYS, "HasExternalMonitor"),
        RemoteProperty::<bool>::new(session, &BRIGHTNESS, "HasBrightnessControl"),
        RemoteProperty::<f64>::new(system, &LIGHT_SENSOR, "LightLevel"),
    )?;
    let (active, actions, battery, level, active_profile, closed, control) = tokio::join!(
        session_active.get(),
        inhibited.get(),
        on_battery.get(),
        warning_level.get(),
        profile.get(),
        lid_closed.get(),
        brightness_control.get(),
    );

    let shell = ShellBrightnessProxy::new(session).await?;
    let screensaver = ScreenSaverProxy::new(session).await?;
    let login = LoginProxy::new(system).await?;
    let chassis = HostnameProxy::new(system)
        .await?
        .chassis()
        .await
        .unwrap_or_default();
    let backlight = Backlight::connect(system)
        .await
        .map(|backlight| Arc::new(Mutex::new(backlight)));
    let server = session.object_server();
    let keyboard = match &backlight {
        Some(backlight) => {
            server
                .at(
                    keyboard::PATH,
                    Keyboard {
                        backlight: backlight.clone(),
                    },
                )
                .await?;
            Some(server.interface::<_, Keyboard>(keyboard::PATH).await?)
        }
        None => None,
    };
    session.request_name(keyboard::NAME).await?;

    let mut power = Power {
        settings,
        session: session.clone(),
        watches: Watches::connect(session).await?,
        mode: Mode::Normal,
        session_active: active.unwrap_or(true),
        inhibited: actions.unwrap_or(0),
        screen_locked: false,
        on_battery: battery.unwrap_or(false),
        battery_low: level.is_some_and(|level| level >= LOW_WARNING_LEVEL),
        profile: active_profile,
        lid_closed: closed.unwrap_or(false),
        screen_off: false,
        virtual_machine: SystemdProxy::new(system)
            .await?
            .virtualization()
            .await
            .is_ok_and(|kind| !kind.is_empty()),
        warn_before_sleeping: !NO_WARNING_CHASSIS.contains(&chassis.as_str()),
        warned_action: Action::Nothing,
        warning: 0,
        awake_until: None,
        mode_after_awake: Mode::Normal,
        backlight,
        keyboard,
        shell: shell.clone(),
        display: DisplayConfigProxy::new(session).await?,
        screensaver: screensaver.clone(),
        session_manager: SessionManagerProxy::new(session).await?,
        login: login.clone(),
        inhibitors: Inhibitors::new(login.clone(), system.clone()),
        ambient: Ambient::new(SensorProxyProxy::new(system).await?, shell.clone()),
        has_brightness_control: control.unwrap_or(false),
    };
    let mut fired = power.watches.fired().await?;
    let mut idle_owner = power.watches.owner_changes().await?;
    let mut lock_changes = screensaver.receive_active_changed().await?;
    let mut wake_ups = screensaver.receive_wake_up_screen().await?;
    let mut sleeps = login.receive_prepare_for_sleep().await?;
    let mut user_brightness = shell.receive_brightness_changed().await?;
    let mut hardware_keys = match &power.backlight {
        Some(backlight) => Some(
            backlight
                .lock()
                .await
                .proxy()
                .receive_brightness_changed_with_source()
                .await?,
        ),
        None => None,
    };

    power.inhibitors.hold_sleep().await;
    power.inhibitors.sync_lid().await;
    power.hold_power_saver().await;
    power.configure().await;
    power.claim_light().await;

    tokio::spawn(async move {
        loop {
            tokio::select! {
                (schema, key) = power.settings.changed() => power.setting_changed(schema, &key).await,
                Some(signal) = fired.next() => {
                    if let Ok(args) = signal.args() {
                        power.watch_fired(args.id).await;
                    }
                }
                Some(owner) = idle_owner.next() => {
                    power.watches.restart(owner.is_some());
                    power.configure().await;
                }
                active = session_active.changed() => {
                    power.session_active = active.unwrap_or(true);
                    if power.session_active {
                        power.set_mode(Mode::Normal).await;
                    }
                    power.claim_light().await;
                    power.inhibitors.sync_lid().await;
                    power.configure().await;
                }
                actions = inhibited.changed() => {
                    power.inhibited = actions.unwrap_or(0);
                    power.configure().await;
                }
                Some(signal) = lock_changes.next() => {
                    if let Ok(args) = signal.args() {
                        power.lock_changed(args.active).await;
                    }
                }
                Some(_) = wake_ups.next() => power.keep_awake_on_power().await,
                battery = on_battery.changed() => {
                    power.on_battery = battery.unwrap_or(false);
                    power.configure().await;
                    power.keep_awake_on_power().await;
                }
                level = warning_level.changed() => {
                    let low = level.is_some_and(|level| level >= LOW_WARNING_LEVEL);
                    if low != power.battery_low {
                        power.battery_low = low;
                        power.configure().await;
                        power.hold_power_saver().await;
                    }
                }
                active = profile.changed() => {
                    power.profile = active;
                    power.configure().await;
                }
                closed = lid_closed.changed() => {
                    let closed = closed.unwrap_or(false);
                    if closed != power.lid_closed {
                        power.lid_closed = closed;
                        if closed {
                            power.lid_closed_action(external_monitor.get().await.unwrap_or(false)).await;
                        }
                    }
                }
                _ = external_monitor.changed() => power.inhibitors.sync_lid().await,
                () = power.inhibitors.lid_check(), if power.inhibitors.lid_check_pending() => {
                    power.inhibitors.lid_check_due(external_monitor.get().await.unwrap_or(false), power.session_active);
                }
                Some(signal) = sleeps.next() => {
                    if let Ok(args) = signal.args() {
                        power.prepare_for_sleep(args.start).await;
                    }
                }
                () = sleep_until(power.awake_until.unwrap_or_else(Instant::now)), if power.awake_until.is_some() => {
                    power.awake_until = None;
                    power.set_mode(power.mode_after_awake).await;
                }
                control = brightness_control.changed() => {
                    power.has_brightness_control = control.unwrap_or(false);
                    power.claim_light().await;
                }
                Some(_) = user_brightness.next() => power.ambient.recalibrate(),
                level = light.changed() => {
                    if let Some(level) = level {
                        power.ambient.sample(level).await;
                    }
                }
                Some(signal) = async { hardware_keys.as_mut().expect("the keyboard backlight exists").next().await }, if hardware_keys.is_some() => {
                    power.backlight_changed_by_hardware(signal).await;
                }
            }
        }
    });
    Ok(())
}
