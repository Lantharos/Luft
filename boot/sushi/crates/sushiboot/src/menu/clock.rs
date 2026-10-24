use core::arch::x86_64::_rdtsc;
use core::time::Duration;

use uefi::boot;

const CALIBRATION: Duration = Duration::from_millis(10);

// Drawing a frame takes time of its own, so the menu reads the processor's
// cycle counter, measured once against a short wait, instead of adding up
// frame lengths.
pub struct Clock {
    start: u64,
    per_second: f64,
}

fn cycles() -> u64 {
    unsafe { _rdtsc() }
}

impl Clock {
    pub fn start() -> Self {
        let before = cycles();
        boot::stall(CALIBRATION);
        let start = cycles();
        Self {
            start,
            per_second: (start - before) as f64 / CALIBRATION.as_secs_f64(),
        }
    }

    pub fn seconds(&self) -> f32 {
        (cycles().wrapping_sub(self.start) as f64 / self.per_second) as f32
    }
}
