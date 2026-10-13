use crate::progress::{Progress, Stage};

const LAYERS_NEEDED: &str = "layers needed: ";
const FETCHING: &str = "Fetching ";
const STAGING: &str = "Staging deployment";
const PREPARING: [&str; 3] = [
    "Updating metadata",
    "Importing rpm-md",
    "Resolving dependencies",
];

#[derive(Default)]
pub struct Tracker {
    total: u64,
    done: u64,
    fetching: u64,
}

pub enum Event<'a> {
    Message(&'a str),
    TaskBegin(&'a str),
    TaskEnd,
    Percent(&'a str, u32),
}

impl Tracker {
    pub fn update(&mut self, event: Event) -> Option<Progress> {
        match event {
            Event::Message(text) => {
                self.total += text
                    .split_once(LAYERS_NEEDED)
                    .and_then(|(_, needed)| size_in(needed))
                    .unwrap_or(0);
                None
            }
            Event::TaskBegin(text) if text.contains(FETCHING) => {
                self.fetching = size_in(text).unwrap_or(0);
                Some(self.downloading())
            }
            Event::TaskBegin(text) => Some(Progress::new(stage_of(text), None)),
            Event::TaskEnd if self.fetching > 0 => {
                self.done += std::mem::take(&mut self.fetching);
                Some(self.downloading())
            }
            Event::TaskEnd => None,
            Event::Percent(text, percentage) => Some(Progress::new(
                stage_of(text),
                Some(counted(text).unwrap_or(percentage as f32 / 100.0)),
            )),
        }
    }

    fn downloading(&self) -> Progress {
        let fraction = (self.total > 0).then(|| self.done as f32 / self.total as f32);
        Progress::new(Stage::Downloading, fraction)
    }
}

fn stage_of(text: &str) -> Stage {
    if text.starts_with("Downloading") {
        Stage::Downloading
    } else if PREPARING.iter().any(|step| text.starts_with(step)) {
        Stage::Preparing
    } else if text.starts_with(STAGING) {
        Stage::Finishing
    } else {
        Stage::Installing
    }
}

fn counted(text: &str) -> Option<f32> {
    let (done, total) = text
        .strip_suffix(')')?
        .rsplit_once('(')?
        .1
        .split_once('/')?;
    let total: f32 = total.trim().parse().ok()?;
    (total > 0.0).then_some(done.trim().parse::<f32>().ok()? / total)
}

fn size_in(text: &str) -> Option<u64> {
    let inside = text.strip_suffix(')')?.rsplit_once('(')?.1;
    let (number, unit) = inside.split_once(char::is_whitespace)?;
    let number: f64 = number.parse().ok()?;
    let scale = match unit {
        "bytes" | "byte" => 1.0,
        "kB" => 1e3,
        "MB" => 1e6,
        "GB" => 1e9,
        "TB" => 1e12,
        _ => return None,
    };
    Some((number * scale) as u64)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn follows_layer_downloads_by_size() {
        let mut tracker = Tracker::default();
        tracker.update(Event::Message("ostree chunk layers already present: 65"));
        tracker.update(Event::Message("custom layers needed: 2 (2.2\u{a0}kB)"));
        let started = tracker
            .update(Event::TaskBegin(
                "[1/2] Fetching layer 21e3c9f0cf29cfd0e47 (2.0\u{a0}kB)",
            ))
            .unwrap();
        assert_eq!(started, Progress::new(Stage::Downloading, Some(0.0)));
        let fetched = tracker.update(Event::TaskEnd).unwrap();
        assert_eq!(fetched.fraction, Some(2000.0 / 2200.0));
        tracker.update(Event::TaskBegin(
            "[2/2] Fetching layer 3c96a14a556fc04c188 (174 bytes)",
        ));
        assert_eq!(
            tracker.update(Event::TaskEnd).unwrap().fraction,
            Some(2174.0 / 2200.0)
        );
    }

    #[test]
    fn reads_counted_steps() {
        let progress = Tracker::default()
            .update(Event::Percent("Importing packages (1/2)", 0))
            .unwrap();
        assert_eq!(progress, Progress::new(Stage::Installing, Some(0.5)));
    }

    #[test]
    fn package_downloads_follow_their_percentage() {
        let progress = Tracker::default()
            .update(Event::Percent("Downloading from 'fedora'", 61))
            .unwrap();
        assert_eq!(progress, Progress::new(Stage::Downloading, Some(0.61)));
    }

    #[test]
    fn staging_is_the_last_step() {
        let progress = Tracker::default()
            .update(Event::TaskBegin("Staging deployment"))
            .unwrap();
        assert_eq!(progress, Progress::new(Stage::Finishing, None));
    }
}
