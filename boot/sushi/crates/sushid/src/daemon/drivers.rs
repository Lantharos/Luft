use std::os::unix::net::UnixStream;
use std::path::PathBuf;

use sushi::drivers;

use crate::takeover::Outcome;

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
            self.takeover.load(&waiting.boot_display);
            self.settle_loader(self.now());
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

    pub(super) fn enter_root_after_loading(&mut self, root: PathBuf, waiter: Option<UnixStream>) {
        self.root_waiters.extend(waiter);
        if self.takeover.will_load() {
            if self.entering_root.is_none() {
                eprintln!(
                    "Holding the switch to {} until the graphics driver has loaded",
                    root.display()
                );
            }
            self.entering_root = Some(root);
        } else {
            self.answer_root(&root);
        }
    }

    fn answer_root(&mut self, root: &std::path::Path) {
        let answer = match self.enter_root(root) {
            Ok(()) => "ok".to_owned(),
            Err(error) => {
                eprintln!("Couldn't move into {}: {error}", root.display());
                error.to_string()
            }
        };
        self.root_waiters
            .drain(..)
            .for_each(|stream| reply(stream, &answer));
    }

    pub(super) fn advance_takeover(&mut self, now: f32) {
        match self.takeover.advance(now) {
            Some(Outcome::Loaded) => {
                self.handle_cards();
                if self.takeover.awaits_card() {
                    self.takeover.expect_driver(now);
                }
                self.driver_waiters
                    .drain(..)
                    .for_each(|stream| reply(stream, "ok"));
                if let Some(root) = self.entering_root.take() {
                    self.answer_root(&root);
                }
            }
            Some(Outcome::Finished) => self.settle_loader(now),
            None => {}
        }
    }
}
