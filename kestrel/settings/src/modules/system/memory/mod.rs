pub mod cgroup;
mod growth;
mod notices;
mod policy;
pub mod pressure;
mod protection;
mod windows;

use std::collections::HashMap;
use std::sync::{Arc, Mutex, MutexGuard, PoisonError};
use std::time::Duration;

use tokio::time::{Instant, sleep_until};

use crate::context::Context;
use cgroup::{Unit, UserManager};
use growth::{Growth, SAMPLE_EVERY};
use notices::{Listing, Notices};
use policy::{App, Choice};
use pressure::Trigger;
use protection::Protection;
use windows::{Label, Window};

const BUILDING_STALL: Duration = Duration::from_millis(50);
const BUILDING_WINDOW: Duration = Duration::from_secs(1);
const CALM_AFTER: Duration = Duration::from_secs(30);
const BETWEEN_WARNINGS: Duration = Duration::from_secs(120);
const WARNING_HOLDS: Duration = Duration::from_secs(10 * 60);
const STARVED_SHARE: f64 = 10.0;
const SETTLE: Duration = Duration::from_secs(10);

#[derive(Default)]
struct State {
    windows: Vec<Window>,
    growth: Growth,
    asked: HashMap<String, Instant>,
    warned: HashMap<String, Instant>,
}

#[derive(Clone, Default)]
pub struct Board(Arc<Mutex<State>>);

struct Assessment {
    units: Vec<Unit>,
    apps: Vec<App>,
}

impl Assessment {
    fn unit(&self, app: &App) -> &Unit {
        self.units
            .iter()
            .find(|unit| unit.name == app.unit)
            .expect("every app comes from a unit")
    }
}

impl Board {
    fn state(&self) -> MutexGuard<'_, State> {
        self.0.lock().unwrap_or_else(PoisonError::into_inner)
    }

    fn assess(&self, manager: &UserManager, sampled: bool) -> Assessment {
        let units = manager.apps();
        let mut state = self.state();
        if sampled {
            state.growth.record(
                Instant::now(),
                units.iter().map(|unit| (unit.name.as_str(), unit.bytes)),
            );
        }
        let foreground = windows::foreground(&state.windows);
        let apps = units
            .iter()
            .map(|unit| App {
                unit: unit.name.clone(),
                bytes: unit.bytes,
                foreground: foreground.contains(unit.name.as_str()),
                growing: state.growth.growing(&unit.name),
            })
            .collect();
        Assessment { units, apps }
    }

    fn label(&self, unit: &Unit) -> Label {
        let biggest = unit.biggest_process();
        windows::label(&self.state().windows, &unit.name, biggest)
    }

    fn fullscreen(&self) -> bool {
        self.state().windows.iter().any(|window| window.fullscreen)
    }

    fn protected<'a>(&self, assessment: &'a Assessment, budget: u64) -> Option<&'a Unit> {
        let state = self.state();
        let unit = windows::protected(&state.windows)?;
        let app = assessment.apps.iter().find(|app| app.unit == unit)?;
        let runaway = app.growing && app.past_its_share(budget);
        (!runaway).then(|| assessment.unit(app))
    }

    fn ask(&self, unit: &str) -> bool {
        let mut state = self.state();
        let now = Instant::now();
        if state
            .asked
            .get(unit)
            .is_some_and(|at| now.duration_since(*at) < BETWEEN_WARNINGS)
        {
            return false;
        }
        state.asked.insert(unit.to_owned(), now);
        true
    }

    fn was_warned(&self, unit: &str) -> bool {
        self.state()
            .warned
            .get(unit)
            .is_some_and(|at| at.elapsed() < WARNING_HOLDS)
    }

    fn warned(&self, unit: &str) {
        self.state().warned.insert(unit.to_owned(), Instant::now());
    }
}

pub fn own_manager() -> zbus::Result<UserManager> {
    UserManager::own().ok_or_else(|| zbus::Error::Failure("This isn't a user's session".into()))
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let manager = own_manager()?;
    let board = context.memory.clone();
    let notices = Notices::new(&context.session, board.clone()).await?;
    let mut protection = Protection::new(&context.session, &manager).await?;
    let mut listing = Listing::follow(&context.session).await?;
    let trigger = Trigger::system(BUILDING_STALL, BUILDING_WINDOW)?;
    board.state().windows = listing.current().await;
    tokio::spawn(async move {
        let budget = protection.budget();
        let mut sampling: Option<Instant> = None;
        let mut pressed_at = Instant::now();
        loop {
            let sampled = tokio::select! {
                windows = listing.next() => {
                    board.state().windows = windows;
                    false
                }
                fired = trigger.fired() => {
                    if fired.is_err() {
                        break;
                    }
                    pressed_at = Instant::now();
                    sampling.get_or_insert(pressed_at);
                    continue;
                }
                () = sleep_until(sampling.unwrap_or_else(Instant::now)), if sampling.is_some() => {
                    sampling = (pressed_at.elapsed() < CALM_AFTER).then(|| Instant::now() + SAMPLE_EVERY);
                    if sampling.is_none() {
                        board.state().growth.forget();
                    }
                    true
                }
            };
            let assessment = board.assess(&manager, sampled);
            protection.give(board.protected(&assessment, budget)).await;
            if sampled && sampling.is_some() {
                warn_ahead(&board, &notices, &assessment, budget);
            }
        }
    });
    Ok(())
}

fn warn_ahead(board: &Board, notices: &Notices, assessment: &Assessment, budget: u64) {
    let Some(app) = policy::next(&assessment.apps, budget) else {
        return;
    };
    let blamed = app.blamed(budget);
    let worth_it = if blamed && app.foreground {
        true
    } else {
        pressure::running_low() && (app.foreground || !board.fullscreen())
    };
    if worth_it {
        notices.warn(assessment.unit(app), blamed);
    }
}

pub struct Relief {
    manager: UserManager,
    board: Board,
    notices: Notices,
    budget: u64,
    closed_at: Option<Instant>,
}

impl Relief {
    pub async fn new(context: &Context) -> zbus::Result<Self> {
        let manager = own_manager()?;
        Ok(Self {
            budget: manager.focus_budget(),
            notices: Notices::new(&context.session, context.memory.clone()).await?,
            board: context.memory.clone(),
            manager,
            closed_at: None,
        })
    }

    pub fn compositor_starved(&self) -> bool {
        self.manager.compositor_stall_share() >= STARVED_SHARE
    }

    pub async fn relieve(&mut self) {
        if self.closed_at.is_some_and(|at| at.elapsed() < SETTLE) {
            return;
        }
        let assessment = self.board.assess(&self.manager, true);
        match policy::choose(&assessment.apps, self.budget, |unit| {
            self.board.was_warned(unit)
        }) {
            Choice::Close(app) => {
                let unit = assessment.unit(app);
                let label = self.board.label(unit);
                if let Err(error) = unit.close() {
                    eprintln!("Couldn't close {} to free memory: {error}", unit.name);
                    return;
                }
                self.closed_at = Some(Instant::now());
                eprintln!("Kestrel was waiting on memory, so {} was closed", unit.name);
                self.notices.closed(unit, label).await;
            }
            Choice::Warn(app) => self
                .notices
                .warn(assessment.unit(app), app.blamed(self.budget)),
            Choice::Nothing => {}
        }
    }
}
