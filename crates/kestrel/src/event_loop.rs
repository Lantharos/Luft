use crate::state::{Backend, KestrelState};
use rustix::process::{Pid, PidfdFlags, pidfd_open};
use smithay::reexports::calloop::{
    Interest, Mode, PostAction, RegistrationToken, generic::Generic,
};
use std::{
    collections::HashMap,
    time::{Duration, Instant},
};

#[derive(Default)]
pub(crate) struct ProcessWakeups {
    sources: HashMap<u32, RegistrationToken>,
}

impl ProcessWakeups {
    pub fn update<B: Backend + 'static>(&mut self, state: &KestrelState<B>) -> Result<(), String> {
        let pids = [
            state.shell_process.pid(),
            state.xwayland_process.pid(),
            state.portal_process.pid(),
            state.lock_process.pid(),
        ];
        self.sources.retain(|pid, token| {
            if pids.contains(&Some(*pid)) {
                true
            } else {
                state.handle.remove(*token);
                false
            }
        });
        for pid in pids.into_iter().flatten() {
            if self.sources.contains_key(&pid) {
                continue;
            }
            let fd = pidfd_open(
                Pid::from_raw(pid as i32).ok_or("invalid child PID")?,
                PidfdFlags::empty(),
            )
            .map_err(|error| format!("cannot watch child {pid}: {error}"))?;
            let token = state
                .handle
                .insert_source(Generic::new(fd, Interest::READ, Mode::Level), |_, _, _| {
                    Ok(PostAction::Disable)
                })
                .map_err(|error| format!("cannot register child {pid}: {error}"))?;
            self.sources.insert(pid, token);
        }
        Ok(())
    }
}

impl<B: Backend> KestrelState<B> {
    pub(crate) fn maintenance_timeout(&self) -> Option<Duration> {
        let now = Instant::now();
        let mut deadline = [
            self.shell_process.deadline(),
            self.xwayland_process.deadline(),
            self.portal_process.deadline(),
            self.capture_consent.deadline(),
            self.pending_settings
                .as_ref()
                .map(|pending| pending.deadline),
        ]
        .into_iter()
        .flatten()
        .min();
        if self.session_lock.needs_locker() {
            deadline = deadline
                .into_iter()
                .chain(self.lock_process.deadline())
                .min();
        }
        if !self.idle_inhibited {
            let lock = (!self.idle_lock_sent)
                .then_some(self.idle_lock_after)
                .flatten();
            let suspend = (!self.idle_suspend_sent)
                .then_some(self.idle_suspend_after)
                .flatten();
            for after in [lock, suspend].into_iter().flatten() {
                let idle_deadline = (self.last_activity + after).max(self.idle_action_retry_at);
                deadline =
                    Some(deadline.map_or(idle_deadline, |current| current.min(idle_deadline)));
            }
        }
        deadline
            .map(|deadline| deadline.saturating_duration_since(now))
            .into_iter()
            .chain(self.commit_timeout())
            .min()
    }
}
