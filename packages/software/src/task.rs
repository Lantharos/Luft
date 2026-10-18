use std::fs::{self, File, OpenOptions, TryLockError};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use crate::progress::{Progress, Report, Stage};

const LOCK: &str = "luft/software.lock";
const LOCK_RETRY: Duration = Duration::from_millis(250);

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
        self.start(hook).then(|| self.finish(run()))
    }

    pub async fn while_awaiting<T>(
        &self,
        hook: impl Fn() + Send + 'static,
        run: impl Future<Output = T>,
    ) -> Option<T> {
        if !self.start(hook) {
            return None;
        }
        Some(self.finish(run.await))
    }

    fn start(&self, hook: impl Fn() + Send + 'static) -> bool {
        let mut state = self.lock();
        if matches!(*state, State::Cancelled) {
            return false;
        }
        *state = State::Running(Box::new(hook));
        true
    }

    fn finish<T>(&self, result: T) -> T {
        let mut state = self.lock();
        if matches!(*state, State::Running(_)) {
            *state = State::Idle;
        }
        result
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

pub struct Exclusive {
    _file: File,
}

fn lock_file() -> Result<File, String> {
    let path: PathBuf = dirs::runtime_dir()
        .or_else(dirs::cache_dir)
        .ok_or("There's no folder to keep the software lock in.")?
        .join(LOCK);
    if let Some(folder) = path.parent() {
        fs::create_dir_all(folder).map_err(|error| error.to_string())?;
    }
    OpenOptions::new()
        .create(true)
        .truncate(false)
        .write(true)
        .open(path)
        .map_err(|error| error.to_string())
}

impl Task<'_> {
    pub fn progress(&self, stage: Stage, fraction: Option<f32>) {
        (self.report)(Progress::new(stage, fraction));
    }

    pub fn exclusive(&self) -> Result<Exclusive, String> {
        let file = lock_file()?;
        loop {
            match file.try_lock() {
                Ok(()) => return Ok(Exclusive { _file: file }),
                Err(TryLockError::WouldBlock) => {}
                Err(TryLockError::Error(error)) => return Err(error.to_string()),
            }
            if self.cancel.is_cancelled() {
                return Err(CANCELLED.into());
            }
            self.progress(Stage::Waiting, None);
            std::thread::sleep(LOCK_RETRY);
        }
    }
}

pub const CANCELLED: &str = "The operation was cancelled.";
