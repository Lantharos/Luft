mod color;
mod schedule;

use std::time::Duration;

use futures_util::StreamExt;
use tokio::sync::mpsc;
use tokio::time::{Instant, MissedTickBehavior, interval, sleep_until};
use zbus::Connection;
use zbus::object_server::InterfaceRef;

use crate::context::Context;
use crate::shared::location::{self, Coordinates};
use crate::shared::settings::Schemas;
use crate::shared::system::LoginProxy;
use color::{Color, Command};
use schedule::{NEUTRAL, Sun, Window};

const SCHEMA: &str = "com.lantharos.kestrel.night-light";
const LOCATION: &str = "org.gnome.system.location";
const DESKTOP_ID: &str = "gnome-color-panel";
const CHECK_INTERVAL: Duration = Duration::from_secs(60);
const TRANSITION: Duration = Duration::from_secs(5);
const TRANSITION_STEP: Duration = Duration::from_millis(50);
const UNNOTICEABLE: f64 = 10.0;
const DAY_MICROSECONDS: i64 = 24 * 60 * 60 * 1_000_000;

struct Transition {
    from: f64,
    to: f64,
    started: Instant,
}

struct NightLight {
    settings: Schemas,
    system: Connection,
    located: mpsc::UnboundedSender<Coordinates>,
    active: bool,
    temperature: f64,
    sun: Option<Sun>,
    zone: Option<(String, Option<Coordinates>)>,
    paused_at: Option<glib::DateTime>,
    preview_until: Option<Instant>,
    transition: Option<Transition>,
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let Some(settings) = context.settings.watch(&[SCHEMA, LOCATION]).await else {
        return Ok(());
    };
    let (located, mut locations) = mpsc::unbounded_channel();
    let mut light = NightLight {
        settings,
        system: context.system.clone(),
        located,
        active: false,
        temperature: NEUTRAL,
        sun: None,
        zone: None,
        paused_at: None,
        preview_until: None,
        transition: None,
    };
    let (active, temperature) = light.target(&schedule::now());
    light.active = active;
    light.temperature = temperature;
    let (commands, mut requests) = mpsc::unbounded_channel();
    let server = context.session.object_server();
    server.at(color::PATH, light.published(commands)).await?;
    context.session.request_name(color::NAME).await?;
    let color = server.interface::<_, Color>(color::PATH).await?;
    let mut resumes = LoginProxy::new(&context.system)
        .await?
        .receive_prepare_for_sleep()
        .await?;
    light.locate();
    tokio::spawn(async move {
        let mut check = interval(CHECK_INTERVAL);
        let mut step = interval(TRANSITION_STEP);
        step.set_missed_tick_behavior(MissedTickBehavior::Delay);
        loop {
            let smooth = tokio::select! {
                _ = check.tick() => true,
                (schema, key) = light.settings.changed() => {
                    if schema == LOCATION || key == "enabled" || key == "schedule-automatic" {
                        light.locate();
                    }
                    true
                }
                Some(signal) = resumes.next() => {
                    if signal.args().is_ok_and(|args| !args.start) {
                        light.locate();
                    }
                    false
                }
                Some(coordinates) = locations.recv() => {
                    light.settings.set(SCHEMA, "last-coordinates", (coordinates.latitude, coordinates.longitude));
                    true
                }
                Some(request) = requests.recv() => {
                    light.handle(request);
                    true
                }
                () = sleep_until(light.preview_until.unwrap_or_else(Instant::now)), if light.preview_until.is_some() => {
                    light.preview_until = None;
                    true
                }
                _ = step.tick(), if light.transition.is_some() => {
                    light.advance();
                    light.publish(&color).await;
                    continue;
                }
            };
            let (active, temperature) = light.target(&schedule::now());
            light.active = active;
            light.retarget(temperature, smooth);
            light.publish(&color).await;
        }
    });
    Ok(())
}

impl NightLight {
    fn coordinates(&mut self) -> Option<Coordinates> {
        let (latitude, longitude): (f64, f64) = self.settings.get(SCHEMA, "last-coordinates");
        if latitude.abs() <= 90.0 && longitude.abs() <= 180.0 {
            return Some(Coordinates {
                latitude,
                longitude,
            });
        }
        let zone = location::timezone()?;
        if self.zone.as_ref().is_none_or(|(known, _)| *known != zone) {
            let coordinates = location::zone_coordinates(&zone);
            self.zone = Some((zone, coordinates));
        }
        self.zone.as_ref().and_then(|(_, coordinates)| *coordinates)
    }

    fn locate(&self) {
        let wanted = self.settings.get::<bool>(SCHEMA, "enabled")
            && self.settings.get::<bool>(SCHEMA, "schedule-automatic")
            && self.settings.get::<bool>(LOCATION, "enabled");
        if !wanted {
            return;
        }
        let (system, located) = (self.system.clone(), self.located.clone());
        tokio::spawn(async move {
            match location::locate(&system, DESKTOP_ID).await {
                Ok(coordinates) => {
                    let _ = located.send(coordinates);
                }
                Err(error) => {
                    eprintln!("Couldn't find the location for the night light schedule: {error}")
                }
            }
        });
    }

    fn handle(&mut self, request: Command) {
        match request {
            Command::Preview(seconds) => {
                self.preview_until = Some(Instant::now() + Duration::from_secs(seconds.into()));
            }
            Command::PauseUntilTomorrow(paused) => {
                self.paused_at = paused.then(schedule::now);
            }
        }
    }

    fn window(&self) -> Window {
        match &self.sun {
            Some(sun) if self.settings.get(SCHEMA, "schedule-automatic") => Window {
                from: sun.sunset,
                to: sun.sunrise,
            },
            _ => Window {
                from: self.settings.get(SCHEMA, "schedule-from"),
                to: self.settings.get(SCHEMA, "schedule-to"),
            },
        }
    }

    fn target(&mut self, now: &glib::DateTime) -> (bool, f64) {
        let warm = f64::from(self.settings.get::<u32>(SCHEMA, "temperature"));
        self.sun = self.coordinates().and_then(|at| schedule::sun(now, at));
        if self.preview_until.is_some() {
            return (self.active, warm);
        }
        if !self.settings.get::<bool>(SCHEMA, "enabled") {
            return (false, NEUTRAL);
        }
        let window = self.window();
        self.resume_after_night(now, &window);
        match schedule::temperature(schedule::hours(now), &window, warm) {
            None => (false, NEUTRAL),
            Some(_) if self.paused_at.is_some() => (true, NEUTRAL),
            Some(temperature) => (true, temperature),
        }
    }

    fn resume_after_night(&mut self, now: &glib::DateTime, window: &Window) {
        let Some(paused_at) = &self.paused_at else {
            return;
        };
        let elapsed = now.difference(paused_at).as_microseconds();
        let (paused_hour, hour) = (schedule::hours(paused_at), schedule::hours(now));
        if elapsed > DAY_MICROSECONDS
            || (elapsed > 0
                && paused_hour != hour
                && schedule::is_between(window.to, paused_hour, hour))
        {
            self.paused_at = None;
        }
    }

    fn retarget(&mut self, target: f64, smooth: bool) {
        if !smooth || (target - self.temperature).abs() < UNNOTICEABLE {
            self.temperature = target;
            self.transition = None;
        } else if self
            .transition
            .as_ref()
            .is_none_or(|transition| transition.to != target)
        {
            self.transition = Some(Transition {
                from: self.temperature,
                to: target,
                started: Instant::now(),
            });
        }
    }

    fn advance(&mut self) {
        let Some(transition) = &self.transition else {
            return;
        };
        let progress = transition.started.elapsed().as_secs_f64() / TRANSITION.as_secs_f64();
        if progress >= 1.0 {
            self.temperature = transition.to;
            self.transition = None;
        } else {
            self.temperature = transition.from + (transition.to - transition.from) * progress;
        }
    }

    fn published(&self, commands: mpsc::UnboundedSender<Command>) -> Color {
        Color {
            active: self.active,
            temperature: self.temperature.round() as u32,
            paused: self.paused_at.is_some(),
            sunrise: self.sun.as_ref().map_or(-1.0, |sun| sun.sunrise),
            sunset: self.sun.as_ref().map_or(-1.0, |sun| sun.sunset),
            commands,
        }
    }

    async fn publish(&self, color: &InterfaceRef<Color>) {
        let emitter = color.signal_emitter();
        let mut current = color.get_mut().await;
        let next = self.published(current.commands.clone());
        let emitted = async {
            if current.active != next.active {
                current.active = next.active;
                current.night_light_active_changed(emitter).await?;
            }
            if current.temperature != next.temperature {
                current.temperature = next.temperature;
                current.temperature_changed(emitter).await?;
            }
            if current.paused != next.paused {
                current.paused = next.paused;
                current.disabled_until_tomorrow_changed(emitter).await?;
            }
            if current.sunrise != next.sunrise {
                current.sunrise = next.sunrise;
                current.sunrise_changed(emitter).await?;
            }
            if current.sunset != next.sunset {
                current.sunset = next.sunset;
                current.sunset_changed(emitter).await?;
            }
            zbus::Result::Ok(())
        };
        if let Err(error) = emitted.await {
            eprintln!("Couldn't announce the night light state: {error}");
        }
    }
}
