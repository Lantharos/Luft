use std::process::Child;
use std::time::Duration;

use sushi::drivers;
use sushi::scene::ease;

const DARKEN_SECONDS: f32 = 0.2;
const BRIGHTEN_SECONDS: f32 = 1.0;
const CARD_LIMIT_SECONDS: f32 = 20.0;
const EXPECT_LIMIT_SECONDS: f32 = 5.0;

pub enum Then {
    Load(Vec<String>),
    Modeset,
}

enum Step {
    Expecting {
        since: f32,
    },
    Darkening {
        since: f32,
        then: Then,
        content_shown: bool,
    },
    Dark(Then),
    AwaitingCard {
        since: f32,
    },
    Resyncing {
        since: f32,
    },
    Brightening {
        since: f32,
    },
}

pub enum Outcome {
    Modeset,
    Loaded,
    Finished,
}

/// Hands the screen to a graphics driver that switches it off: darkens the splash, loads the driver, sets the
/// final mode on a black frame, waits for the monitor to pick the signal back up, and brightens the splash again.
pub struct Takeover {
    step: Option<Step>,
    driver: Option<Child>,
    resync: f32,
}

impl Takeover {
    pub fn new(resync: Duration) -> Self {
        Self {
            step: None,
            driver: None,
            resync: resync.as_secs_f32(),
        }
    }

    pub fn expect_driver(&mut self, now: f32) {
        self.step = Some(Step::Expecting { since: now });
    }

    pub fn settle(&mut self) {
        self.step = None;
    }

    pub fn darken(&mut self, now: f32, then: Then, content_shown: bool) {
        self.step = Some(Step::Darkening {
            since: now,
            then,
            content_shown,
        });
    }

    pub fn resync(&mut self, now: f32) {
        eprintln!(
            "Waiting {:.1} s for the monitor to show the new mode",
            self.resync
        );
        self.step = Some(Step::Resyncing { since: now });
    }

    pub fn is_active(&self) -> bool {
        self.step.is_some()
    }

    pub fn will_load(&self) -> bool {
        self.driver.is_some()
            || matches!(
                self.step,
                Some(
                    Step::Darkening {
                        then: Then::Load(_),
                        ..
                    } | Step::Dark(Then::Load(_))
                )
            )
    }

    pub fn awaits_card(&self) -> bool {
        matches!(self.step, Some(Step::AwaitingCard { .. }))
    }

    pub fn hides_content(&self) -> bool {
        !matches!(
            self.step,
            None | Some(Step::Brightening { .. })
                | Some(Step::Darkening {
                    content_shown: true,
                    ..
                })
        )
    }

    pub fn curtain(&self, now: f32) -> f32 {
        match &self.step {
            None | Some(Step::Expecting { .. }) => 1.0,
            Some(Step::Darkening { since, .. }) => 1.0 - ease((now - since) / DARKEN_SECONDS),
            Some(Step::Dark(_) | Step::AwaitingCard { .. } | Step::Resyncing { .. }) => 0.0,
            Some(Step::Brightening { since }) => ease((now - since) / BRIGHTEN_SECONDS),
        }
    }

    pub fn advance(&mut self, now: f32) -> Option<Outcome> {
        if let Some(loaded) = self.driver_finished() {
            if !loaded && self.awaits_card() {
                self.step = Some(Step::Brightening { since: now });
            }
            return Some(Outcome::Loaded);
        }
        match self.step.take()? {
            Step::Darkening { since, then, .. } if now - since >= DARKEN_SECONDS => {
                self.step = Some(Step::Dark(then));
            }
            Step::Dark(Then::Load(modules)) => {
                if !self.start_loading(modules, now) {
                    return Some(Outcome::Loaded);
                }
            }
            Step::Dark(Then::Modeset) => {
                self.resync(now);
                return Some(Outcome::Modeset);
            }
            Step::Expecting { since } if now - since >= EXPECT_LIMIT_SECONDS => {
                eprintln!(
                    "The graphics driver didn't take the display over, showing the splash as it is"
                );
                return Some(Outcome::Finished);
            }
            Step::AwaitingCard { since } if now - since >= CARD_LIMIT_SECONDS => {
                eprintln!("The graphics driver didn't bring up a display, staying where we are");
                self.step = Some(Step::Brightening { since: now });
            }
            Step::Resyncing { since } if now - since >= self.resync => {
                self.step = Some(Step::Brightening { since: now });
            }
            Step::Brightening { since } if now - since >= BRIGHTEN_SECONDS => {
                return Some(Outcome::Finished);
            }
            step => self.step = Some(step),
        }
        None
    }

    fn start_loading(&mut self, modules: Vec<String>, now: f32) -> bool {
        eprintln!("Loading {}", modules.join(", "));
        match drivers::start_loading(&modules) {
            Ok(child) => {
                self.driver = Some(child);
                self.step = Some(Step::AwaitingCard { since: now });
                true
            }
            Err(error) => {
                eprintln!("Couldn't start modprobe: {error}");
                self.step = Some(Step::Brightening { since: now });
                false
            }
        }
    }

    fn driver_finished(&mut self) -> Option<bool> {
        let status = self.driver.as_mut()?.try_wait().ok()??;
        self.driver = None;
        if !status.success() {
            eprintln!("Loading the graphics driver failed: {status}");
        }
        Some(status.success())
    }
}
