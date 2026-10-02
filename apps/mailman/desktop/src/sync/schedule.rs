use std::sync::OnceLock;
use std::time::Duration;

use parking_lot::{Condvar, Mutex};

use super::Engine;
use crate::events::CHANGED;
use crate::store::now;

const TICK: i64 = 30;

struct Alarm {
    pending: Mutex<bool>,
    ring: Condvar,
}

fn alarm() -> &'static Alarm {
    static ALARM: OnceLock<Alarm> = OnceLock::new();
    ALARM.get_or_init(|| Alarm {
        pending: Mutex::new(false),
        ring: Condvar::new(),
    })
}

pub fn wake() {
    let alarm = alarm();
    *alarm.pending.lock() = true;
    alarm.ring.notify_one();
}

fn sleep_until(deadline: i64) {
    let alarm = alarm();
    let mut pending = alarm.pending.lock();
    if !*pending {
        let seconds = (deadline - now()).clamp(0, TICK) as u64;
        alarm
            .ring
            .wait_for(&mut pending, Duration::from_secs(seconds));
    }
    *pending = false;
}

fn tick(engine: &Engine) {
    let shared = &engine.shared;
    engine.send_due();
    let woken = shared.store.wake_snoozed().unwrap_or_default();
    if !woken.is_empty() {
        shared.events.emit(CHANGED, 0);
    }
    for reminder in shared.store.due_reminders().unwrap_or_default() {
        let Ok(Some(account)) = shared.store.account(reminder.account) else {
            continue;
        };
        if shared
            .store
            .has_reply(&reminder.message_id, &account.email)
            .unwrap_or(true)
        {
            continue;
        }
        if let Ok(thread) = shared.store.nudge(&reminder.message_id) {
            shared
                .notifier
                .show("No reply yet", &reminder.subject, thread);
            shared.events.emit(CHANGED, account.id);
        }
    }
}

pub fn start(engine: Engine) {
    std::thread::Builder::new()
        .name("schedule".into())
        .spawn(move || {
            loop {
                tick(&engine);
                let next = engine
                    .shared
                    .store
                    .next_outgoing()
                    .ok()
                    .flatten()
                    .unwrap_or(i64::MAX);
                sleep_until(next.min(now() + TICK));
            }
        })
        .ok();
}
