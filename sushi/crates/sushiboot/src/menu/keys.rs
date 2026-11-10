use core::time::Duration;

use uefi::boot::{self, EventType, TimerTrigger, Tpl};
use uefi::proto::console::text::Key;
use uefi::{Event, system};

pub fn read() -> Option<Key> {
    system::with_stdin(|input| input.read_key().ok().flatten())
}

pub struct Wait {
    key: Event,
    timer: Event,
}

impl Wait {
    pub fn new() -> Option<Self> {
        let key = system::with_stdin(|input| input.wait_for_key_event().ok())?;
        let timer =
            unsafe { boot::create_event(EventType::TIMER, Tpl::APPLICATION, None, None) }.ok()?;
        Some(Self { key, timer })
    }

    pub fn for_a_key_or(&self, limit: Duration) {
        let _ = boot::set_timer(&self.timer, TimerTrigger::Relative(limit));
        let events = unsafe { [self.key.unsafe_clone(), self.timer.unsafe_clone()] };
        let _ = boot::wait_for_event(&events);
    }
}

impl Drop for Wait {
    fn drop(&mut self) {
        let _ = boot::close_event(unsafe { self.timer.unsafe_clone() });
    }
}
