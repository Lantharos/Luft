use std::collections::VecDeque;
use std::sync::Weak;

use parking_lot::Mutex;

use super::output::Output;

const MAX_CHUNKS_IN_FLIGHT: usize = 48;

#[derive(Default)]
pub struct Budget {
    state: Mutex<State>,
}

#[derive(Default)]
struct State {
    in_flight: usize,
    waiting: VecDeque<Weak<Output>>,
}

impl Budget {
    pub fn take(&self, output: &Weak<Output>) -> bool {
        let mut state = self.state.lock();
        if state.in_flight < MAX_CHUNKS_IN_FLIGHT {
            state.in_flight += 1;
            return true;
        }
        if !state.waiting.iter().any(|waiting| waiting.ptr_eq(output)) {
            state.waiting.push_back(output.clone());
        }
        false
    }

    pub fn refund(&self) {
        self.state.lock().in_flight -= 1;
    }

    pub fn give_back(&self) {
        let next = {
            let mut state = self.state.lock();
            state.in_flight -= 1;
            state.waiting.pop_front()
        };
        if let Some(output) = next.as_ref().and_then(Weak::upgrade) {
            output.resume();
        }
    }
}
