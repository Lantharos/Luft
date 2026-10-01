use std::f64::consts::PI;
use std::time::Duration;

use tokio::time::Instant;

use super::proxies::{SensorProxyProxy, ShellBrightnessProxy};

const BANDWIDTH_HZ: f64 = 0.1;
const SEND_INTERVAL: Duration = Duration::from_millis(100);
const HEADROOM: f64 = 1.5;

pub struct Ambient {
    sensor: SensorProxyProxy<'static>,
    shell: ShellBrightnessProxy<'static>,
    claimed: bool,
    calibrate: bool,
    full_scale: f64,
    smoothed: f64,
    sampled_at: Option<Instant>,
    sent_at: Option<Instant>,
}

impl Ambient {
    pub fn new(sensor: SensorProxyProxy<'static>, shell: ShellBrightnessProxy<'static>) -> Self {
        Self {
            sensor,
            shell,
            claimed: false,
            calibrate: true,
            full_scale: -1.0,
            smoothed: -1.0,
            sampled_at: None,
            sent_at: None,
        }
    }

    pub fn claimed(&self) -> bool {
        self.claimed
    }

    pub fn recalibrate(&mut self) {
        self.calibrate = true;
    }

    pub async fn claim(&mut self, wanted: bool) {
        if wanted == self.claimed {
            return;
        }
        self.claimed = wanted;
        let changed = if wanted {
            self.sensor.claim_light().await
        } else {
            match self.sensor.release_light().await {
                Ok(()) => self.shell.set_auto_brightness_target(-1.0).await,
                Err(error) => Err(error),
            }
        };
        if let Err(error) = changed {
            eprintln!(
                "Couldn't {} the light sensor: {error}",
                if wanted { "use" } else { "release" }
            );
        }
    }

    pub async fn sample(&mut self, level: f64) {
        if !self.claimed || level <= 0.0 {
            return;
        }
        if self.calibrate {
            self.full_scale = level * HEADROOM;
            if self.smoothed <= 0.0 {
                self.smoothed = 100.0 / HEADROOM;
            }
            self.calibrate = false;
        }
        let now = Instant::now();
        let alpha = self.sampled_at.map_or(0.0, |previous| {
            let time_constant = 1.0 / (2.0 * PI * BANDWIDTH_HZ);
            1.0 / (1.0 + time_constant / (now - previous).as_secs_f64())
        });
        self.sampled_at = Some(now);
        let brightness = (level * 100.0 / self.full_scale).clamp(0.0, 100.0);
        self.smoothed = alpha * brightness + (1.0 - alpha) * self.smoothed;
        if self.smoothed < 0.0 || self.sent_at.is_some_and(|sent| now - sent < SEND_INTERVAL) {
            return;
        }
        self.sent_at = Some(now);
        if let Err(error) = self
            .shell
            .set_auto_brightness_target(self.smoothed / 100.0)
            .await
        {
            eprintln!("Couldn't follow the ambient light: {error}");
        }
    }
}
