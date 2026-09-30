use std::collections::HashMap;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use luft_app::Events;

use super::{Control, Shared};
use crate::system::System;
use crate::tasks::apps::{self, AppSampler};
use crate::tasks::{Table, process_ids};

const WARM_UP: Duration = Duration::from_millis(300);

enum Wake {
    Changed(Control),
    WarmedUp(Control),
    Tick(Control),
}

struct Sampler<'a> {
    shared: &'a Shared,
    events: &'a Events,
    system: System,
    table: Table,
    apps: AppSampler,
    last: Instant,
    next: Instant,
    warm_up: Option<Instant>,
}

pub(super) fn run(shared: &Shared, events: &Events, system: System) {
    let now = Instant::now();
    let mut sampler = Sampler {
        shared,
        events,
        system,
        table: Table::new(),
        apps: AppSampler::new(),
        last: now,
        next: now + shared.control.lock().interval,
        warm_up: None,
    };
    let _ = sampler.system.sample(unix_time(), 1.0, None);
    loop {
        match sampler.wait() {
            Wake::Changed(control) => sampler.changed(&control),
            Wake::WarmedUp(control) => sampler.tasks(&control, true),
            Wake::Tick(control) => sampler.tick(&control),
        }
    }
}

impl Sampler<'_> {
    fn wait(&mut self) -> Wake {
        let mut control = self.shared.control.lock();
        loop {
            if control.changed {
                let snapshot = control.clone();
                control.changed = false;
                control.entering = false;
                control.reset = false;
                return Wake::Changed(snapshot);
            }
            let now = Instant::now();
            if let Some(at) = self.warm_up.filter(|at| *at < self.next)
                && now >= at
            {
                self.warm_up = None;
                return Wake::WarmedUp(control.clone());
            }
            if now >= self.next {
                return Wake::Tick(control.clone());
            }
            let until = self.warm_up.map_or(self.next, |at| at.min(self.next));
            self.shared.wake.wait_until(&mut control, until);
        }
    }

    fn changed(&mut self, control: &Control) {
        self.next = self.last + control.interval;
        if !shows_tasks(control) || !(control.entering || control.reset) {
            return;
        }
        if control.reset {
            self.table.reset();
        }
        self.tasks(control, false);
        self.warm_up = Some(Instant::now() + WARM_UP);
    }

    fn tick(&mut self, control: &Control) {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last).as_secs_f64();
        self.last = now;
        self.next = (self.next + control.interval).max(now + control.interval / 2);
        self.warm_up = None;
        if self.system.refresh() {
            let devices = self.system.devices();
            if control.visible {
                self.events.emit("barometer.devices", &devices);
            }
            *self.shared.devices.lock() = Some(devices);
        }
        let page = control.visible.then_some(control.page.as_str());
        let tick = self.system.sample(unix_time(), elapsed, page);
        self.tasks(control, true);
        if control.visible {
            self.events.emit("barometer.tick", &tick);
        }
        let mut history = self.shared.history.lock();
        let oldest = tick.time.saturating_sub(control.history.as_millis() as u64);
        while history.front().is_some_and(|first| first.time < oldest) {
            history.pop_front();
        }
        history.push_back(tick);
    }

    fn tasks(&mut self, control: &Control, emit: bool) {
        if !shows_tasks(control) {
            return;
        }
        let mut scopes = self.shared.scopes.lock();
        let (pids, gpu) = if control.page == "apps" {
            let (mut usage, members) = self.apps.sample(&mut scopes, &self.system.disks());
            let gpu = if control.gpu {
                let mut all: Vec<u32> = members.values().flatten().copied().collect();
                all.sort_unstable();
                self.system.gpus.processes(&all)
            } else {
                HashMap::new()
            };
            apps::attach_gpu(&mut usage, &members, &gpu);
            if emit {
                self.events.emit("barometer.apps", &usage);
            }
            let mut expanded: Vec<u32> = control
                .expanded
                .iter()
                .filter_map(|key| members.get(key))
                .flatten()
                .copied()
                .collect();
            expanded.sort_unstable();
            (expanded, gpu)
        } else {
            let pids = process_ids();
            let gpu = if control.gpu {
                self.system.gpus.processes(&pids)
            } else {
                HashMap::new()
            };
            (pids, gpu)
        };
        let (catalog, rows) = self.table.sample(&mut scopes, &pids, control.disk, &gpu);
        if !catalog.is_empty() {
            self.events.emit("barometer.catalog", &catalog);
        }
        if emit && (!rows.is_empty() || !catalog.is_empty()) {
            self.events.emit_bytes("barometer.processes", rows);
        }
    }
}

fn shows_tasks(control: &Control) -> bool {
    control.visible && (control.page == "apps" || control.page == "processes")
}

fn unix_time() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |elapsed| elapsed.as_millis() as u64)
}
