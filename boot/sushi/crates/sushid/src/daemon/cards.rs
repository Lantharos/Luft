use std::path::Path;

use sushi::display::{Card, Display};
use sushi::uevent::CardEvent;

use super::{Daemon, Firmware, Phase, Screen};

impl Daemon {
    pub(super) fn find_display(&mut self) {
        match Display::find(&self.hints) {
            Ok(display) => self.adopt(display),
            Err(busy) => self.held = busy,
        }
    }

    pub(super) fn retake(&mut self) {
        if !matches!(self.phase, Phase::Splash) || self.screen.is_some() {
            return;
        }
        let Some(card) = self.held.take() else {
            return;
        };
        match Display::take(card, &self.hints) {
            Ok(display) => self.adopt(display),
            Err(busy) => self.held = busy,
        }
    }

    fn adopt(&mut self, display: Display) {
        let firmware = self
            .firmware
            .get_or_insert_with(|| Firmware::left_on(&display, self.logo.take(), &self.hints));
        match firmware.stretched_over(&display) {
            Some((width, height)) => eprintln!(
                "Showing the splash on {} at {:?}, stretched by the monitor to {width}×{height}",
                display.path().display(),
                display.sizes()
            ),
            None => eprintln!(
                "Showing the splash on {} at {:?}",
                display.path().display(),
                display.sizes()
            ),
        }
        self.held = None;
        if let Some(old) = self.screen.take() {
            let (scene, card) = old.into_parts();
            drop(card);
            self.previous = scene;
        }
        self.screen = Some(Screen::new(display, firmware, self.previous.take()));
        self.take_terminal();
    }

    pub(super) fn forget_screen(&mut self) {
        if let Some(screen) = self.screen.take() {
            self.previous = screen.into_parts().0;
        }
    }

    pub(super) fn handle_cards(&mut self) {
        for event in self.events.drain() {
            match event {
                CardEvent::Added(path) if !self.knows(&path) => self.card_added(&path),
                CardEvent::Changed(path)
                    if self.shows(&path)
                        && matches!(self.phase, Phase::Splash | Phase::Leaving(_)) =>
                {
                    if let Some(firmware) = &self.firmware {
                        self.screen = self
                            .screen
                            .take()
                            .and_then(|screen| screen.refresh(&self.hints, firmware).ok());
                    }
                }
                CardEvent::Removed(path) => {
                    if self.shows(&path) {
                        eprintln!("{} went away", path.display());
                        self.forget_screen();
                    }
                    if self.held.as_ref().is_some_and(|card| card.path() == path) {
                        self.held = None;
                    }
                }
                _ => {}
            }
        }
    }

    fn card_added(&mut self, path: &Path) {
        let Ok(card) = Card::open(path) else {
            return;
        };
        match self.phase {
            Phase::Splash | Phase::Leaving(_)
                if self.screen.is_none() || card.is_boot_display() =>
            {
                match Display::take(card, &self.hints) {
                    Ok(display) => self.adopt(display),
                    Err(busy) => self.held = self.held.take().or(busy),
                }
            }
            Phase::Waiting(_) | Phase::Holding if self.held.is_none() => self.held = Some(card),
            _ => {}
        }
    }

    fn shows(&self, path: &Path) -> bool {
        self.screen
            .as_ref()
            .is_some_and(|screen| screen.path() == path)
    }

    fn knows(&self, path: &Path) -> bool {
        self.shows(path) || self.held.as_ref().is_some_and(|card| card.path() == path)
    }
}
