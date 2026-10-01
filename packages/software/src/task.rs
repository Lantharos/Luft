use std::sync::{Arc, Mutex};

use crate::progress::{Progress, Report, Stage};

type Hook = Box<dyn Fn() + Send>;

#[derive(Default)]
enum State {
    #[default]
    Idle,
    Running(Hook),
    Cancelled,
}

#[derive(Clone, Default)]
pub struct Cancel(Arc<Mutex<State>>);

impl Cancel {
    pub fn cancel(&self) {
        let previous = std::mem::replace(&mut *self.lock(), State::Cancelled);
        if let State::Running(hook) = previous {
            hook();
        }
    }

    pub fn is_cancelled(&self) -> bool {
        matches!(*self.lock(), State::Cancelled)
    }

    pub fn while_running<T>(
        &self,
        hook: impl Fn() + Send + 'static,
        run: impl FnOnce() -> T,
    ) -> Option<T> {
        {
            let mut state = self.lock();
            if matches!(*state, State::Cancelled) {
                return None;
            }
            *state = State::Running(Box::new(hook));
        }
        let result = run();
        let mut state = self.lock();
        if matches!(*state, State::Running(_)) {
            *state = State::Idle;
        }
        Some(result)
    }

    fn lock(&self) -> std::sync::MutexGuard<'_, State> {
        self.0
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }
}

#[derive(Clone, Copy)]
pub struct Task<'a> {
    pub report: Report<'a>,
    pub cancel: &'a Cancel,
}

impl Task<'_> {
    pub fn progress(&self, stage: Stage, fraction: Option<f32>) {
        (self.report)(Progress::new(stage, fraction));
    }
}

pub const CANCELLED: &str = "The operation was cancelled.";
