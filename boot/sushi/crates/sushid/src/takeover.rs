use std::process::Child;

use sushi::drivers;
use sushi::scene::{FADE_SECONDS, ease};

const EXPECT_LIMIT_SECONDS: f32 = 5.0;

enum Step {
    Expecting { since: f32 },
    Loading,
}

pub enum Outcome {
    Loaded,
    Finished,
}

/// Keeps everything but the logo and spinner back until the graphics driver for the boot display has taken it over,
/// so nothing that needs reading is on screen when the driver switches the display off.
pub struct Takeover {
    step: Option<Step>,
    driver: Option<Child>,
    settled: f32,
}

impl Takeover {
    pub fn new() -> Self {
        Self {
            step: None,
            driver: None,
            settled: f32::NEG_INFINITY,
        }
    }

    pub fn expect_driver(&mut self, now: f32) {
        self.step = Some(Step::Expecting { since: now });
    }

    pub fn load(&mut self, modules: &[String]) {
        eprintln!("Loading {} while the splash shows", modules.join(", "));
        match drivers::start_loading(modules) {
            Ok(child) => {
                self.driver = Some(child);
                self.step = Some(Step::Loading);
            }
            Err(error) => eprintln!("Couldn't start modprobe: {error}"),
        }
    }

    pub fn settle(&mut self, now: f32) {
        if self.step.take().is_some() {
            self.settled = now;
        }
    }

    pub fn is_active(&self) -> bool {
        self.step.is_some()
    }

    pub fn is_animating(&self, now: f32) -> bool {
        self.is_active() || now - self.settled < FADE_SECONDS
    }

    pub fn will_load(&self) -> bool {
        self.driver.is_some()
    }

    pub fn awaits_card(&self) -> bool {
        matches!(self.step, Some(Step::Loading))
    }

    pub fn revealed(&self, now: f32) -> f32 {
        if self.is_active() {
            0.0
        } else {
            ease((now - self.settled) / FADE_SECONDS)
        }
    }

    pub fn advance(&mut self, now: f32) -> Option<Outcome> {
        if self.driver_finished() {
            return Some(Outcome::Loaded);
        }
        match self.step {
            Some(Step::Expecting { since }) if now - since >= EXPECT_LIMIT_SECONDS => {
                eprintln!(
                    "The graphics driver didn't take the display over, showing the splash as it is"
                );
                self.settle(now);
                Some(Outcome::Finished)
            }
            _ => None,
        }
    }

    fn driver_finished(&mut self) -> bool {
        let Some(Ok(Some(status))) = self.driver.as_mut().map(Child::try_wait) else {
            return false;
        };
        self.driver = None;
        if !status.success() {
            eprintln!("Loading the graphics driver failed: {status}");
        }
        true
    }
}
