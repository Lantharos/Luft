mod configure;
mod copy;
pub mod drive;
mod startup;

use std::path::Path;
use std::sync::{Condvar, Mutex};

use anyhow::{Context, Result};

pub use configure::account::Account;
pub use configure::regional::Regional;

use crate::config::Image;
use configure::deployment::Deployment;
use configure::handoff;
use drive::partition;
use drive::plan::Plan;
use drive::target::Mounted;

const PREPARED: f64 = 0.04;
const COPIED: f64 = 0.96;

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Stage {
    Idle,
    Preparing,
    Copying,
    Waiting,
    Configuring,
    Finished,
    Failed,
}

impl Stage {
    pub fn name(self) -> &'static str {
        match self {
            Self::Idle => "idle",
            Self::Preparing => "preparing",
            Self::Copying => "copying",
            Self::Waiting => "waiting",
            Self::Configuring => "configuring",
            Self::Finished => "finished",
            Self::Failed => "failed",
        }
    }
}

#[derive(Clone)]
pub struct Status {
    pub stage: Stage,
    pub progress: f64,
    pub error: String,
    pub secure_boot_code: String,
}

impl Status {
    pub fn idle() -> Self {
        Self::at(Stage::Idle, 0.0)
    }

    fn at(stage: Stage, progress: f64) -> Self {
        Self {
            stage,
            progress,
            error: String::new(),
            secure_boot_code: String::new(),
        }
    }
}

#[derive(Default)]
struct Inputs {
    regional: Option<Regional>,
    account: Option<Account>,
}

#[derive(Default)]
pub struct Answers {
    inputs: Mutex<Inputs>,
    given: Condvar,
}

impl Answers {
    pub fn set_regional(&self, regional: Regional) {
        self.inputs.lock().expect("answers lock").regional = Some(regional);
        self.given.notify_all();
    }

    pub fn set_account(&self, account: Account) {
        self.inputs.lock().expect("answers lock").account = Some(account);
        self.given.notify_all();
    }

    fn wait(&self) -> (Regional, Account) {
        let mut inputs = self.inputs.lock().expect("answers lock");
        loop {
            if let (Some(regional), Some(_)) = (&inputs.regional, &inputs.account) {
                let regional = regional.clone();
                return (regional, inputs.account.take().expect("account was given"));
            }
            inputs = self.given.wait(inputs).expect("answers lock");
        }
    }
}

pub struct Job<'a> {
    pub image: &'a Image,
    pub plan: Plan,
    pub target: &'a Path,
    pub answers: &'a Answers,
}

pub fn run(job: Job, report: impl Fn(Status)) {
    if let Err(error) = install(&job, &report) {
        eprintln!("Installing failed: {error:#}");
        report(Status {
            stage: Stage::Failed,
            progress: 0.0,
            error: format!("{error:#}"),
            secure_boot_code: String::new(),
        });
    }
}

fn install(job: &Job, report: &impl Fn(Status)) -> Result<()> {
    report(Status::at(Stage::Preparing, 0.0));
    let parts = partition::apply(&job.plan)?;
    let mounted = Mounted::assemble(job.target, &job.plan.device, &parts)?;
    report(Status::at(Stage::Copying, PREPARED));
    copy::run(job.image, &mounted, |copied| {
        report(Status::at(
            Stage::Copying,
            PREPARED + (COPIED - PREPARED) * copied,
        ))
    })
    .context("Luft couldn't be copied")?;
    startup::place(&mounted, &job.target.with_extension("esp"))?;
    report(Status::at(Stage::Waiting, COPIED));
    let (regional, account) = job.answers.wait();
    report(Status::at(Stage::Configuring, COPIED));
    let deployment = Deployment::mount(mounted.root(), &job.target.with_extension("system"))?;
    regional.apply(&deployment)?;
    account.create(&deployment)?;
    handoff::prepare(&deployment, &account.name)?;
    drop(deployment);
    mounted.finish()?;
    let secure_boot_code = startup::ask_shim_to_trust_luft()?;
    report(Status {
        secure_boot_code,
        ..Status::at(Stage::Finished, 1.0)
    });
    Ok(())
}
