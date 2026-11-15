mod app;
pub mod interrupt;

use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;

use luft_dbus::runtime::block_on;
use luft_i18n::t;
use luft_software::task::{CANCELLED, Cancel, Task};
use schelf_core::operations::Request;
use schelf_core::operations::bus::SchelfProxy;

use super::Exit;
use super::commands::list_of;
use super::terminal::Ink;
use super::terminal::board::{Board, Outcome, Update};
use crate::l10n::L10N;

const AT_ONCE: usize = 3;

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Verb {
    Install,
    AddSource,
    Remove,
    Update,
}

impl Verb {
    pub fn key(self) -> &'static str {
        match self {
            Self::Install => "install",
            Self::AddSource => "add",
            Self::Remove => "remove",
            Self::Update => "update",
        }
    }
}

pub struct Plan {
    pub request: Request,
    pub verb: Verb,
    pub from: Option<String>,
}

impl Plan {
    pub fn name(&self) -> &str {
        &self.request.title
    }
}

pub enum Failure {
    Failed(String),
    Cancelled,
}

impl From<String> for Failure {
    fn from(error: String) -> Self {
        if error == CANCELLED {
            Self::Cancelled
        } else {
            Self::Failed(error)
        }
    }
}

enum Runner {
    App(SchelfProxy<'static>),
    Here,
}

type Report<'a> = &'a (dyn Fn(Update) + Sync);

impl Runner {
    fn connect() -> Self {
        block_on(app::connect()).map_or(Self::Here, Self::App)
    }

    fn announce(&self) {
        if matches!(self, Self::App(_)) {
            eprintln!("{}", Ink::stderr().dim(t!(L10N, "cli-perform-in-app")));
        }
    }

    fn run(&self, plan: &Plan, report: Report, cancel: &Cancel) -> Result<(), Failure> {
        match self {
            Self::App(proxy) => app::run(proxy, &plan.request, report, cancel),
            Self::Here => plan
                .request
                .job
                .run(Task {
                    report: &|progress| report(Update::Progress(progress)),
                    cancel,
                })
                .map_err(Failure::from),
        }
    }

    fn perform(&self, plan: &Plan, report: Report) -> Result<(), Failure> {
        let cancel = Cancel::default();
        let _interruptible = interrupt::cancels(cancel.clone());
        if interrupt::stopped() {
            return Err(Failure::Cancelled);
        }
        self.run(plan, report, &cancel)
    }
}

/// Something that couldn't even be looked at before the rest started, and
/// already said why.
pub struct Missed {
    pub name: String,
    pub exit: Exit,
}

fn exit_of(result: &Result<(), Failure>) -> Exit {
    match result {
        Ok(()) => Exit::Done,
        Err(Failure::Failed(_)) => Exit::Failed,
        Err(Failure::Cancelled) => Exit::Interrupted,
    }
}

fn summarize(verb: Verb, total: usize, done: &[&str], failed: &[&str], stopped: &[&str]) {
    let verb = verb.key();
    if failed.is_empty() && stopped.is_empty() {
        println!(
            "{}",
            Ink::stdout().marked(&t!(L10N, "cli-summary-all", verb = verb, count = total))
        );
        return;
    }
    let ink = Ink::stderr();
    let names = |names: &[&str]| -> String {
        list_of(&names.iter().map(|name| ink.bold(name)).collect::<Vec<_>>())
    };
    let mut parts = Vec::new();
    if !done.is_empty() {
        parts.push(t!(
            L10N,
            "cli-summary-done",
            verb = verb,
            names = names(done)
        ));
    }
    if !failed.is_empty() {
        parts.push(ink.marked(&t!(
            L10N,
            "cli-summary-failed",
            verb = verb,
            names = names(failed)
        )));
    }
    if !stopped.is_empty() {
        parts.push(t!(
            L10N,
            "cli-summary-stopped",
            verb = verb,
            names = names(stopped)
        ));
    }
    eprintln!("{}", parts.join(" "));
}

/// Carries out `plans`, up to `AT_ONCE` at a time and the next as soon as one
/// finishes, each with a line of its own, then sums up how the whole set went
/// along with what was `missed` before it started.
pub fn carry_out(
    plans: &[Plan],
    missed: &[Missed],
    notes: impl Fn(&Plan) -> Vec<String> + Sync,
) -> Exit {
    let before = missed
        .iter()
        .map(|missed| missed.exit)
        .max()
        .unwrap_or(Exit::Done);
    if plans.is_empty() {
        return before;
    }
    let runner = Runner::connect();
    runner.announce();
    let board = Board::new(plans);
    let next = AtomicUsize::new(0);
    let results: Mutex<Vec<Option<Result<(), Failure>>>> =
        Mutex::new(plans.iter().map(|_| None).collect());
    thread::scope(|scope| {
        for _ in 0..AT_ONCE.min(plans.len()) {
            scope.spawn(|| {
                loop {
                    let index = next.fetch_add(1, Ordering::Relaxed);
                    let Some(plan) = plans.get(index) else {
                        return;
                    };
                    let result = runner.perform(plan, &|update| board.update(index, update));
                    board.finish(
                        index,
                        match &result {
                            Ok(()) => Outcome::Done(notes(plan)),
                            Err(Failure::Failed(error)) => Outcome::Failed(error.clone()),
                            Err(Failure::Cancelled) => Outcome::Stopped,
                        },
                    );
                    results
                        .lock()
                        .unwrap_or_else(|poisoned| poisoned.into_inner())[index] = Some(result);
                }
            });
        }
    });
    board.close();
    let results: Vec<Result<(), Failure>> = results
        .into_inner()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
        .into_iter()
        .flatten()
        .collect();
    let named = |wanted: fn(&Result<(), Failure>) -> bool| -> Vec<&str> {
        plans
            .iter()
            .zip(&results)
            .filter(|(_, result)| wanted(result))
            .map(|(plan, _)| plan.name())
            .collect()
    };
    let mut failed: Vec<&str> = missed.iter().map(|missed| missed.name.as_str()).collect();
    failed.extend(named(|result| matches!(result, Err(Failure::Failed(_)))));
    let total = plans.len() + missed.len();
    if total > 1 {
        summarize(
            plans[0].verb,
            total,
            &named(Result::is_ok),
            &failed,
            &named(|result| matches!(result, Err(Failure::Cancelled))),
        );
    }
    results.iter().map(exit_of).fold(before, Exit::max)
}
