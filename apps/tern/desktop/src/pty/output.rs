use std::sync::{Arc, Weak};

use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use luft_app::Events;
use parking_lot::{Condvar, Mutex};
use serde_json::json;

use super::budget::Budget;
use crate::events::{EXITED, OUTPUT};

const CHUNK_BYTES: usize = 256 * 1024;
const MAX_CHUNKS_IN_FLIGHT: usize = 16;
const PENDING_LIMIT: usize = 1024 * 1024;

pub struct Output {
    id: u32,
    events: Events,
    budget: Arc<Budget>,
    this: Weak<Output>,
    state: Mutex<State>,
    space: Condvar,
}

#[derive(Default)]
pub struct State {
    pending: Vec<u8>,
    in_flight: usize,
    exit_code: Option<i32>,
    drained: bool,
    exit_sent: bool,
    attached: bool,
    closed: bool,
}

impl State {
    pub fn pending(&mut self) -> &mut Vec<u8> {
        &mut self.pending
    }

    pub fn has_room(&self) -> bool {
        self.pending.len() < PENDING_LIMIT
    }

    fn ready(&self) -> bool {
        match self.in_flight {
            0 => !self.pending.is_empty(),
            _ => self.pending.len() >= CHUNK_BYTES,
        }
    }
}

impl Output {
    pub fn new(id: u32, events: Events, budget: Arc<Budget>) -> Arc<Self> {
        Arc::new_cyclic(|this| Self {
            id,
            events,
            budget,
            this: this.clone(),
            state: Mutex::new(State {
                pending: Vec::with_capacity(CHUNK_BYTES),
                ..State::default()
            }),
            space: Condvar::new(),
        })
    }

    pub fn wait_for_room(&self) -> bool {
        let mut state = self.state.lock();
        while !state.closed && !state.has_room() {
            self.space.wait(&mut state);
        }
        !state.closed
    }

    pub fn fill(&self, read: impl FnOnce(&mut State)) {
        let mut state = self.state.lock();
        read(&mut state);
        self.flush(&mut state);
    }

    pub fn acknowledge(&self) {
        {
            let mut state = self.state.lock();
            if state.in_flight == 0 {
                return;
            }
            state.in_flight -= 1;
            self.flush(&mut state);
            self.space.notify_one();
        }
        self.budget.give_back();
    }

    pub fn attach(&self) {
        let mut state = self.state.lock();
        state.attached = true;
        self.flush(&mut state);
    }

    pub fn resume(&self) {
        let mut state = self.state.lock();
        self.flush(&mut state);
    }

    pub fn drained(&self) {
        let mut state = self.state.lock();
        state.drained = true;
        self.flush(&mut state);
    }

    pub fn exited(&self, code: i32) {
        let mut state = self.state.lock();
        state.exit_code = Some(code);
        self.flush(&mut state);
    }

    pub fn close(&self) {
        let released = {
            let mut state = self.state.lock();
            state.closed = true;
            std::mem::take(&mut state.in_flight)
        };
        self.space.notify_all();
        for _ in 0..released {
            self.budget.give_back();
        }
    }

    fn flush(&self, state: &mut State) {
        if !state.attached || state.closed {
            return;
        }
        while state.in_flight < MAX_CHUNKS_IN_FLIGHT
            && state.ready()
            && self.budget.take(&self.this)
        {
            let length = state.pending.len().min(CHUNK_BYTES);
            let data = STANDARD.encode(&state.pending[..length]);
            if !self
                .events
                .emit(OUTPUT, json!({ "id": self.id, "data": data }))
            {
                self.budget.refund();
                return;
            }
            state.pending.drain(..length);
            state.in_flight += 1;
        }
        if let (Some(code), true, true, false) = (
            state.exit_code,
            state.drained,
            state.pending.is_empty(),
            state.exit_sent,
        ) {
            state.exit_sent = self
                .events
                .emit(EXITED, json!({ "id": self.id, "code": code }));
        }
    }
}
