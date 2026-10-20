use std::os::unix::net::UnixStream;
use std::path::Path;

use sushi::failure_file::FailureFile;
use sushi::terminal::Terminal;

use crate::failure::Shown;

use super::Daemon;
use super::requests::reply;

impl Daemon {
    pub(super) fn show_failure(&mut self, path: &Path, stream: UnixStream) {
        let file = match FailureFile::load(path) {
            Ok(file) => file,
            Err(error) => {
                reply(
                    stream,
                    &format!("Couldn't read {}: {error}", path.display()),
                );
                return;
            }
        };
        self.reclaim();
        if self.screen.is_none() && self.held.is_none() {
            reply(stream, "no display");
            return;
        }
        eprintln!("Showing why Luft couldn't start");
        self.dismiss_notice("ok");
        self.dismiss_failure("replaced");
        if self.unlock.is_some() {
            self.close_prompt();
        }
        self.take_terminal();
        if let Some(terminal) = &self.terminal {
            let _ = terminal.listen();
        }
        let now = self.now();
        self.look.loader.fade_to(0.0, now);
        self.look.logo.fade_to(0.0, now);
        self.look.failure.fade_to(1.0, now);
        self.fading_failure = None;
        self.failure = Some(Shown::new(file, stream));
    }

    pub(super) fn answer_failure(&mut self) {
        if self.failure.as_ref().is_some_and(Shown::abandoned) {
            eprintln!("Nothing waits for an answer to the failure any more");
            self.dismiss_failure("");
            return;
        }
        let keys = self
            .terminal
            .as_mut()
            .map(Terminal::keys)
            .unwrap_or_default();
        if keys.is_empty() {
            return;
        }
        let visible = self
            .screen
            .as_ref()
            .map_or(1, |screen| screen.details_lines());
        let chosen = self
            .failure
            .as_mut()
            .and_then(|shown| shown.press(&keys, visible));
        if let Some(id) = chosen {
            eprintln!("Chose {id} on the failure screen");
            self.dismiss_failure(&format!("choice {id}"));
        }
    }

    fn dismiss_failure(&mut self, answer: &str) {
        let Some(mut shown) = self.failure.take() else {
            return;
        };
        let now = self.now();
        if let Some(terminal) = &self.terminal {
            terminal.stop_listening();
        }
        self.look.failure.fade_to(0.0, now);
        self.look.logo.fade_to(1.0, now);
        self.settle_loader(now);
        self.fading_failure = Some(shown.failure.clone());
        if let Some(stream) = shown.dismiss() {
            reply(stream, answer);
        }
    }
}
