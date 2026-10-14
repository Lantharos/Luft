use luft_software::image;

use super::super::elsewhere::finished;
use super::super::state::{self, Activity, Kind};

pub fn watch() {
    std::thread::spawn(|| {
        scan();
        let _ = image::watch(scan);
    });
}

pub fn scan() {
    if state::busy() || !image::downloading().unwrap_or(false) {
        return;
    }
    state::start(Activity::new(Kind::Download), super::follow, finished);
}
