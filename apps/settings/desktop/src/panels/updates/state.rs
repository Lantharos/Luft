use std::sync::{LazyLock, Mutex, MutexGuard, OnceLock};

use luft_app::Events;
use luft_software::packagekit::running::Change;
use luft_software::progress::Progress;
use luft_software::task::{Cancel, Task};
use serde::Serialize;

use super::overview::Overview;

const ACTIVITY: &str = "updates.activity";
const OVERVIEW: &str = "updates.overview";

#[derive(Serialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Kind {
    Check,
    Download,
    Firmware,
    Elsewhere,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Elsewhere {
    pub by: Option<String>,
    pub change: Option<Change>,
}

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct Activity {
    pub running: Option<Kind>,
    pub target: Option<String>,
    pub elsewhere: Option<Elsewhere>,
    pub progress: Option<Progress>,
    pub error: Option<String>,
}

impl Activity {
    pub fn new(kind: Kind) -> Self {
        Self {
            running: Some(kind),
            ..Self::default()
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    overview: Option<Overview>,
    activity: Activity,
}

#[derive(Default)]
struct State {
    overview: Option<Overview>,
    activity: Activity,
    cancel: Cancel,
}

static STATE: LazyLock<Mutex<State>> = LazyLock::new(Mutex::default);
static EVENTS: OnceLock<Events> = OnceLock::new();

fn state() -> MutexGuard<'static, State> {
    STATE
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

fn emit(name: &str, payload: impl Serialize) {
    if let Some(events) = EVENTS.get() {
        events.emit(name, payload);
    }
}

fn emit_activity() {
    emit(ACTIVITY, state().activity.clone());
}

pub fn attach(events: &Events) {
    let _ = EVENTS.set(events.clone());
}

pub fn status() -> Status {
    let state = state();
    Status {
        overview: state.overview.clone(),
        activity: state.activity.clone(),
    }
}

pub fn overview() -> Option<Overview> {
    state().overview.clone()
}

pub fn edit_overview(edit: impl FnOnce(&mut Overview)) {
    let overview = {
        let mut state = state();
        let Some(overview) = state.overview.as_mut() else {
            return;
        };
        edit(overview);
        overview.clone()
    };
    emit(OVERVIEW, overview);
}

pub fn set_overview(overview: Overview) {
    state().overview = Some(overview.clone());
    emit(OVERVIEW, overview);
}

pub fn fail(error: String) {
    state().activity.error = Some(error);
    emit_activity();
}

pub fn busy() -> bool {
    state().activity.running.is_some()
}

pub fn cancel() {
    let cancel = state().cancel.clone();
    cancel.cancel();
}

pub fn start(
    activity: Activity,
    work: impl FnOnce(Task) -> Result<(), String> + Send + 'static,
    then: impl FnOnce() + Send + 'static,
) -> bool {
    let cancel = {
        let mut state = state();
        if state.activity.running.is_some() {
            return false;
        }
        state.cancel = Cancel::default();
        state.activity = activity;
        state.cancel.clone()
    };
    emit_activity();
    std::thread::spawn(move || {
        let report = |progress: Progress| {
            state().activity.progress = Some(progress);
            emit_activity();
        };
        let result = work(Task {
            report: &report,
            cancel: &cancel,
        });
        {
            let mut state = state();
            state.activity = Activity {
                error: result.err().filter(|_| !cancel.is_cancelled()),
                ..Activity::default()
            };
        }
        emit_activity();
        then();
    });
    true
}
