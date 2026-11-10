use sushi::ipc::control::Mode;
use sushi::scene::{Progress, Status};
use sushi::system;

use crate::screen::Fader;

const STEPS: [&str; 6] = [
    "Installing",
    "Upgrading",
    "Downgrading",
    "Reinstalling",
    "Removing",
    "Replacing",
];

pub struct Activity {
    mode: Mode,
    destination: String,
    title: Option<String>,
    progress: Option<u8>,
    detail: Option<String>,
    bar: Fader,
    alpha: Fader,
}

fn title(mode: Mode, destination: &str) -> Option<String> {
    match mode {
        Mode::Boot | Mode::Shutdown => None,
        Mode::Updates => Some("Installing updates".to_owned()),
        Mode::Upgrade => Some(
            system::name().map_or("Upgrading your system".to_owned(), |name| {
                format!("Upgrading {name}")
            }),
        ),
        Mode::Firmware => Some("Updating firmware".to_owned()),
        Mode::Encrypting => Some("Encrypting your computer".to_owned()),
        Mode::Moving => Some(format!("Moving Luft to {destination}")),
    }
}

fn readable(message: &str) -> Option<String> {
    let message = message.trim();
    let message = match message.strip_prefix('[') {
        Some(counted) => counted.split_once("] ")?.1,
        None => message,
    };
    let (step, package) = message.trim_end_matches("...").split_once(' ')?;
    let readable =
        STEPS.contains(&step) && !package.is_empty() && !package.contains(char::is_whitespace);
    readable.then(|| format!("{step} {package}"))
}

impl Activity {
    pub fn new() -> Self {
        Self {
            mode: Mode::Boot,
            destination: String::new(),
            title: None,
            progress: None,
            detail: None,
            bar: Fader::at(0.0),
            alpha: Fader::at(0.0),
        }
    }

    pub fn set_mode(&mut self, mode: Mode, now: f32) {
        if mode == self.mode {
            return;
        }
        eprintln!("Showing {}", mode.name());
        self.mode = mode;
        match title(mode, &self.destination) {
            Some(title) => {
                self.title = Some(title);
                self.alpha.fade_to(1.0, now);
            }
            None => self.alpha.fade_to(0.0, now),
        }
    }

    pub fn move_to(&mut self, destination: String, now: f32) {
        self.destination = destination;
        self.set_mode(Mode::Moving, now);
    }

    pub fn set_progress(&mut self, percent: u8, now: f32) {
        self.progress = Some(percent);
        self.bar.fade_to(f32::from(percent) / 100.0, now);
    }

    pub fn show_message(&mut self, message: &str) {
        self.detail = readable(message);
    }

    pub fn hide_message(&mut self, message: &str) {
        if self.detail.is_some() && self.detail == readable(message) {
            self.detail = None;
        }
    }

    pub fn is_starting(&self) -> bool {
        self.mode == Mode::Boot
    }

    pub fn is_showing(&self) -> bool {
        title(self.mode, &self.destination).is_some()
    }

    pub fn is_animating(&self, now: f32) -> bool {
        let waiting = self.progress.is_none() && self.alpha.value(now) > 0.0;
        waiting || !self.alpha.settled(now) || !self.bar.settled(now)
    }

    pub fn status(&self, now: f32) -> Option<(Status, f32)> {
        let alpha = self.alpha.value(now);
        let title = self.title.clone().filter(|_| alpha > 0.0)?;
        let keep_on = match self.mode {
            Mode::Moving => "Keep the computer on and plugged in.",
            _ => "Don't turn off your computer.",
        };
        let note = match self.progress {
            Some(percent) => format!("{percent}% complete. {keep_on}"),
            None => keep_on.to_owned(),
        };
        let status = Status {
            title,
            progress: match self.progress {
                Some(_) => Progress::Known(self.bar.value(now)),
                None => Progress::Waiting(now),
            },
            note,
            detail: self.detail.clone(),
        };
        Some((status, alpha))
    }
}

#[cfg(test)]
mod tests {
    use super::readable;

    #[test]
    fn keeps_only_package_steps_from_update_messages() {
        assert_eq!(
            readable("[3/10] Upgrading firefox..."),
            Some("Upgrading firefox".to_owned())
        );
        assert_eq!(
            readable("Installing kernel-core"),
            Some("Installing kernel-core".to_owned())
        );
        assert_eq!(
            readable("Running post-transaction scriptlet: kernel-core-0:7.2.8-300.fc45.x86_64..."),
            None
        );
        assert_eq!(
            readable("Transaction complete! Cleaning up and rebooting..."),
            None
        );
        assert_eq!(readable("Installing Updates – 34%"), None);
    }
}
