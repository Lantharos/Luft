mod app;
pub mod interrupt;

use luft_app::block_on;
use luft_software::task::{CANCELLED, Cancel, Task};

use super::Exit;
use super::terminal::Ink;
use super::terminal::progress::{Status, Update};
use crate::operations::Request;
use crate::operations::bus::SchelfProxy;

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Verb {
    Install,
    AddSource,
    Remove,
    Update,
}

impl Verb {
    pub fn base(self) -> &'static str {
        match self {
            Self::Install => "install",
            Self::AddSource => "add",
            Self::Remove => "remove",
            Self::Update => "update",
        }
    }

    pub fn doing(self) -> &'static str {
        match self {
            Self::Install => "Installing",
            Self::AddSource => "Adding",
            Self::Remove => "Removing",
            Self::Update => "Updating",
        }
    }

    pub fn done(self) -> &'static str {
        match self {
            Self::Install => "Installed",
            Self::AddSource => "Added",
            Self::Remove => "Removed",
            Self::Update => "Updated",
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

impl Runner {
    fn connect() -> Self {
        block_on(app::connect()).map_or(Self::Here, Self::App)
    }

    fn announce(&self) {
        if matches!(self, Self::App(_)) {
            eprintln!(
                "{}",
                Ink::stderr().dim("Schelf is open, so it does this and shows it there.")
            );
        }
    }

    fn run(&self, plan: &Plan, status: &Status, cancel: &Cancel) -> Result<(), Failure> {
        match self {
            Self::App(proxy) => app::run(proxy, &plan.request, status, cancel),
            Self::Here => plan
                .request
                .job
                .run(Task {
                    report: &|progress| status.show(Update::Progress(progress)),
                    cancel,
                })
                .map_err(Failure::from),
        }
    }

    fn perform(&self, plan: &Plan) -> Result<(), Failure> {
        let status = Status::new(plan.verb, plan.name());
        let cancel = Cancel::default();
        let _interruptible = interrupt::cancels(cancel.clone());
        let result = self.run(plan, &status, &cancel);
        status.clear();
        result
    }
}

fn tell(plan: &Plan, result: &Result<(), Failure>) -> Exit {
    let name = plan.name();
    match result {
        Ok(()) => {
            let ink = Ink::stdout();
            let from = plan
                .from
                .as_ref()
                .map(|from| format!(" from {from}"))
                .unwrap_or_default();
            println!("{} {}{from}", ink.done(plan.verb.done()), ink.bold(name));
            Exit::Done
        }
        Err(Failure::Failed(error)) => {
            let ink = Ink::stderr();
            eprintln!(
                "{} {}: {error}",
                ink.failed(format!("Couldn't {}", plan.verb.base())),
                ink.bold(name)
            );
            Exit::Failed
        }
        Err(Failure::Cancelled) => {
            eprintln!("Stopped {} {name}.", plan.verb.doing().to_lowercase());
            Exit::Interrupted
        }
    }
}

pub fn carry_out(plans: &[Plan], after: impl Fn(&Plan)) -> Exit {
    if plans.is_empty() {
        return Exit::Done;
    }
    let runner = Runner::connect();
    runner.announce();
    let mut exit = Exit::Done;
    for plan in plans {
        let result = runner.perform(plan);
        let told = tell(plan, &result);
        if result.is_ok() {
            after(plan);
        }
        if told == Exit::Interrupted {
            return told;
        }
        exit = exit.max(told);
    }
    exit
}
