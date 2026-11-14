use std::sync::Mutex;

use sabine::BridgeEvent;

use crate::EVENTS;

pub const SEARCHING: BridgeEvent<bool> = BridgeEvent::new("scanners.searching");

static LOOKUPS: Mutex<usize> = Mutex::new(0);

/// A search for scanners that's still going; Flatbed is searching while any is held.
pub struct Lookup;

impl Lookup {
    pub fn begin() -> Self {
        let mut lookups = LOOKUPS.lock().expect("lookups lock");
        *lookups += 1;
        if *lookups == 1 {
            EVENTS.emit(SEARCHING, true);
        }
        Lookup
    }
}

impl Drop for Lookup {
    fn drop(&mut self) {
        let mut lookups = LOOKUPS.lock().expect("lookups lock");
        *lookups -= 1;
        if *lookups == 0 {
            EVENTS.emit(SEARCHING, false);
        }
    }
}

pub fn active() -> bool {
    *LOOKUPS.lock().expect("lookups lock") > 0
}
