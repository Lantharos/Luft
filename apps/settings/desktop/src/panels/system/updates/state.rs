use std::sync::{LazyLock, Mutex, MutexGuard, OnceLock};

use luft_app::Events;
use luft_software::progress::Progress;
use luft_software::task::{Cancel, Task};
use sabine::BridgeEvent;
use serde::Serialize;
use specta::Type;

use super::overview::UpdatesOverview;

pub const ACTIVITY: BridgeEvent<Activity> = BridgeEvent::new("updates.activity");
pub const OVERVIEW: BridgeEvent<UpdatesOverview> = BridgeEvent::new("updates.overview");

#[derive(Serialize, Clone, Copy, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub enum UpdateKind {
    Check,
    Download,
    Firmware,
    Rollback,
    Switch,
}

#[derive(Serialize, Clone, Default, Type)]
#[serde(rename_all = "camelCase")]
pub struct Activity {
    pub running: Option<UpdateKind>,
    pub target: Option<String>,
    pub progress: Option<Progress>,
    pub error: Option<String>,
}

impl Activity {
    pub fn new(kind: UpdateKind) -> Self {
        Self {
            running: Some(kind),
            ..Self::default()
        }
    }
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UpdatesStatus {
    overview: Option<UpdatesOverview>,
    activity: Activity,
}

#[derive(Default)]
struct State {
    overview: Option<UpdatesOverview>,
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

fn emit<T: Serialize>(event: BridgeEvent<T>, payload: T) {
    if let Some(events) = EVENTS.get() {
        events.emit(event, payload);
    }
}

fn emit_activity() {
    emit(ACTIVITY, state().activity.clone());
}

pub fn attach(events: &Events) {
    let _ = EVENTS.set(events.clone());
}

pub fn status() -> UpdatesStatus {
    let state = state();
    UpdatesStatus {
        overview: state.overview.clone(),
        activity: state.activity.clone(),
    }
}

pub fn overview() -> Option<UpdatesOverview> {
    state().overview.clone()
}

pub fn edit_overview(edit: impl FnOnce(&mut UpdatesOverview)) {
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

pub fn set_overview(overview: UpdatesOverview) {
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
