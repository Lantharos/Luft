pub mod cost;
pub mod items;
pub mod worker;

use std::sync::Arc;
use std::time::{Duration, Instant};
use std::{fs, thread};

use luft_app::Events;
use parking_lot::{Condvar, Mutex};
use sabine::BridgeEvent;

use self::cost::{Budget, Cost};
use self::items::{ItemState, ItemUpdate, NewItem};
use self::worker::{Priority, Worker, signal_group};
use crate::engine::job::Job;
use crate::worker::{Reply, Request};

pub const UPDATED: BridgeEvent<ItemUpdate> = BridgeEvent::new("convertible.queue");

const NO_WORK: Cost = Cost {
    processors: 0,
    memory: 0,
};

struct Item {
    id: u32,
    job: Job,
    state: ItemState,
    fraction: f32,
    cost: Cost,
    group: Option<i32>,
    active: Duration,
    resumed: Option<Instant>,
    output: Option<String>,
    error: Option<String>,
}

impl Item {
    fn elapsed(&self) -> Duration {
        self.active
            + self
                .resumed
                .map_or(Duration::ZERO, |moment| moment.elapsed())
    }

    fn remaining(&self) -> Option<f64> {
        (self.state == ItemState::Running && self.fraction > 0.02).then(|| {
            let spent = self.elapsed().as_secs_f64();
            spent / f64::from(self.fraction) * f64::from(1.0 - self.fraction)
        })
    }

    fn update(&self) -> ItemUpdate {
        ItemUpdate {
            id: self.id,
            name: self
                .job
                .destination
                .file_name()
                .map_or_else(String::new, |name| name.to_string_lossy().into_owned()),
            target: self.job.format.clone(),
            state: self.state,
            fraction: self.fraction,
            remaining: self.remaining(),
            output: self.output.clone(),
            error: self.error.clone(),
        }
    }

    fn hold(&mut self) {
        self.active = self.elapsed();
        self.resumed = None;
    }

    fn reset(&mut self) {
        self.state = ItemState::Waiting;
        self.fraction = 0.0;
        self.active = Duration::ZERO;
        self.resumed = None;
        self.error = None;
        self.output = None;
    }
}

#[derive(Default)]
struct State {
    items: Vec<Item>,
    next_id: u32,
    held: bool,
    scheduling: bool,
}

struct Shared {
    events: Events,
    state: Mutex<State>,
    wake: Condvar,
}

#[derive(Clone)]
pub struct Queue(Arc<Shared>);

impl Queue {
    pub fn new(events: Events) -> Self {
        Self(Arc::new(Shared {
            events,
            state: Mutex::default(),
            wake: Condvar::new(),
        }))
    }

    fn emit(&self, update: ItemUpdate) {
        self.0.events.emit(UPDATED, update);
    }

    pub fn add(&self, new_items: Vec<NewItem>) -> Result<Vec<u32>, String> {
        let budget = cost::budget();
        let mut state = self.0.state.lock();
        let mut ids = Vec::with_capacity(new_items.len());
        for new_item in new_items {
            state.next_id += 1;
            let id = state.next_id;
            let job = items::build_job(new_item, id);
            if let Some(folder) = job.destination.parent() {
                fs::create_dir_all(folder).map_err(|error| error.to_string())?;
            }
            let item = Item {
                id,
                cost: cost::cost(&job.inputs[0], &job.format, budget),
                job,
                state: ItemState::Waiting,
                fraction: 0.0,
                group: None,
                active: Duration::ZERO,
                resumed: None,
                output: None,
                error: None,
            };
            self.emit(item.update());
            state.items.push(item);
            ids.push(id);
        }
        let needs_scheduler = !state.scheduling;
        state.scheduling = true;
        drop(state);
        if needs_scheduler {
            let queue = self.clone();
            thread::spawn(move || queue.schedule());
        } else {
            self.0.wake.notify_all();
        }
        Ok(ids)
    }

    fn next_ready(state: &mut State, budget: Budget) -> Option<usize> {
        if state.held {
            return None;
        }
        let running: Vec<&Item> = state
            .items
            .iter()
            .filter(|item| matches!(item.state, ItemState::Running | ItemState::Paused))
            .collect();
        let used = running.iter().fold(NO_WORK, |total, item| Cost {
            processors: total.processors + item.cost.processors,
            memory: total.memory.saturating_add(item.cost.memory),
        });
        let count = running.len();
        let index = state
            .items
            .iter()
            .position(|item| item.state == ItemState::Waiting)?;
        cost::fits(used, state.items[index].cost, budget, count).then_some(index)
    }

    fn schedule(self) {
        let mut state = self.0.state.lock();
        loop {
            let budget = cost::budget();
            match Self::next_ready(&mut state, budget) {
                Some(index) => {
                    let item = &mut state.items[index];
                    item.state = ItemState::Running;
                    item.resumed = Some(Instant::now());
                    let (id, job) = (item.id, item.job.clone());
                    self.emit(item.update());
                    let queue = self.clone();
                    thread::spawn(move || queue.run(id, job));
                }
                None => self.0.wake.wait(&mut state),
            }
        }
    }

    fn with_item(&self, id: u32, change: impl FnOnce(&mut Item)) {
        let mut state = self.0.state.lock();
        if let Some(item) = state.items.iter_mut().find(|item| item.id == id) {
            change(item);
            self.emit(item.update());
        }
    }

    fn run(self, id: u32, job: Job) {
        let request = Request::Convert {
            job: Box::new(job.clone()),
        };
        let outcome = match Worker::start(&request, Priority::Background) {
            Ok(mut worker) => {
                self.with_item(id, |item| item.group = Some(worker.group()));
                let outcome = self.follow(id, &mut worker);
                worker.wait();
                outcome
            }
            Err(error) => Err(error.to_string()),
        };
        self.finish(id, &job, outcome);
    }

    fn follow(&self, id: u32, worker: &mut Worker) -> Result<String, String> {
        while let Some(reply) = worker.next_reply() {
            match reply {
                Reply::Progress(fraction) => self.with_item(id, |item| item.fraction = fraction),
                Reply::Converted(path) => return Ok(path.to_string_lossy().into_owned()),
                Reply::Failed(message) => return Err(message),
                _ => {}
            }
        }
        Err(String::new())
    }

    fn finish(&self, id: u32, job: &Job, outcome: Result<String, String>) {
        let mut canceled = false;
        self.with_item(id, |item| {
            item.hold();
            item.group = None;
            canceled = item.state == ItemState::Canceled;
            if canceled {
                return;
            }
            match outcome {
                Ok(path) => {
                    item.state = ItemState::Finished;
                    item.fraction = 1.0;
                    item.output = Some(path);
                }
                Err(message) => {
                    item.state = ItemState::Failed;
                    item.error = Some(message);
                }
            }
        });
        if canceled || job.temp.exists() {
            crate::engine::publish::discard(job);
        }
        self.0.wake.notify_all();
    }

    pub fn pause(&self, id: u32) {
        self.with_item(id, |item| {
            if let (ItemState::Running, Some(group)) = (item.state, item.group) {
                signal_group(group, libc::SIGSTOP);
                item.hold();
                item.state = ItemState::Paused;
            }
        });
    }

    pub fn resume(&self, id: u32) {
        self.with_item(id, |item| {
            if let (ItemState::Paused, Some(group)) = (item.state, item.group) {
                signal_group(group, libc::SIGCONT);
                item.resumed = Some(Instant::now());
                item.state = ItemState::Running;
            }
        });
    }

    pub fn cancel(&self, id: u32) {
        self.with_item(id, |item| {
            let was = item.state;
            if was.is_over() {
                return;
            }
            item.state = ItemState::Canceled;
            if let Some(group) = item.group {
                signal_group(group, libc::SIGKILL);
                signal_group(group, libc::SIGCONT);
            }
        });
        self.0.wake.notify_all();
    }

    pub fn retry(&self, id: u32) {
        self.with_item(id, |item| {
            if matches!(item.state, ItemState::Failed | ItemState::Canceled) {
                item.reset();
            }
        });
        self.0.wake.notify_all();
    }

    pub fn hold_all(&self, held: bool) {
        let ids: Vec<u32> = {
            let mut state = self.0.state.lock();
            state.held = held;
            let wanted = if held {
                ItemState::Running
            } else {
                ItemState::Paused
            };
            state
                .items
                .iter()
                .filter(|item| item.state == wanted)
                .map(|item| item.id)
                .collect()
        };
        for id in ids {
            if held {
                self.pause(id)
            } else {
                self.resume(id)
            }
        }
        self.0.wake.notify_all();
    }

    pub fn clear_finished(&self) {
        self.0
            .state
            .lock()
            .items
            .retain(|item| !item.state.is_over());
    }
}
