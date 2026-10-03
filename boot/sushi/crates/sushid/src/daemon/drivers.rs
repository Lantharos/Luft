use std::os::unix::net::UnixStream;
use std::path::PathBuf;

use sushi::drivers;

use crate::takeover::{Outcome, Then};

use super::requests::reply;
use super::{Daemon, Phase};

impl Daemon {
    pub(super) fn load_waiting_drivers(&mut self, content_shown: bool) {
        let waiting = drivers::waiting();
        drivers::load_in_background(waiting.others);
        if waiting.boot_display.is_empty() {
            if !content_shown && self.on_firmware && drivers::boot_display_awaits_driver() {
                eprintln!("Waiting for the graphics driver before showing more than the logo");
                self.takeover.expect_driver(self.now());
            }
            return;
        }
        let shown = matches!(self.phase, Phase::Splash) && self.screen.is_some();
        if shown && !self.takeover.is_active() {
            eprintln!(
                "Handing the display to {} in the dark",
                waiting.boot_display.join(", ")
            );
            self.takeover
                .darken(self.now(), Then::Load(waiting.boot_display), content_shown);
        } else {
            drivers::load_in_background(waiting.boot_display);
        }
    }

    pub(super) fn load_drivers(&mut self, stream: UnixStream) {
        if !self.takeover.will_load() {
            self.load_waiting_drivers(true);
        }
        if self.takeover.will_load() {
            self.driver_waiters.push(stream);
        } else {
            reply(stream, "ok");
        }
    }

    pub(super) fn enter_root_after_loading(&mut self, root: PathBuf, stream: UnixStream) {
        if self.takeover.will_load() {
            eprintln!(
                "Holding the switch to {} until the graphics driver has loaded",
                root.display()
            );
            self.entering_root = Some((root, stream));
        } else {
            self.answer_root(&root, stream);
        }
    }

    fn answer_root(&mut self, root: &std::path::Path, stream: UnixStream) {
        match self.enter_root(root) {
            Ok(()) => reply(stream, "ok"),
            Err(error) => reply(stream, &error.to_string()),
        }
    }

    pub(super) fn advance_takeover(&mut self, now: f32) {
        match self.takeover.advance(now) {
            Some(Outcome::Loaded) => {
                self.driver_waiters
                    .drain(..)
                    .for_each(|stream| reply(stream, "ok"));
                if let Some((root, stream)) = self.entering_root.take() {
                    self.answer_root(&root, stream);
                }
            }
            Some(Outcome::Modeset) => {
                if let (Some(screen), Some(firmware)) = (self.screen.take(), &self.firmware) {
                    self.screen = screen
                        .switch_to_planned_modes(&self.hints, firmware)
                        .inspect_err(|error| {
                            eprintln!("Couldn't switch to the saved mode: {error}")
                        })
                        .ok();
                }
            }
            Some(Outcome::Finished) => self.settle_loader(now),
            None => {}
        }
    }
}
