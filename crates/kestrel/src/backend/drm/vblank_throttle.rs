use std::collections::HashMap;
use std::time::{Duration, Instant};

use smithay::reexports::drm::control::crtc;

const MIN_VBLANK_INTERVAL: Duration = Duration::from_micros(500);

#[derive(Debug, Default)]
pub struct VblankThrottle {
    last_vblank: HashMap<crtc::Handle, Instant>,
}

impl VblankThrottle {
    pub fn should_process(&mut self, crtc: crtc::Handle, refresh: Duration) -> bool {
        let min_interval = refresh.max(MIN_VBLANK_INTERVAL);
        let now = Instant::now();
        let accept = self
            .last_vblank
            .get(&crtc)
            .is_none_or(|last| now.duration_since(*last) >= min_interval);
        if accept {
            self.last_vblank.insert(crtc, now);
        }
        accept
    }

    pub fn reset(&mut self) {
        self.last_vblank.clear();
    }
}
