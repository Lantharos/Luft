mod btrfs;
mod disk;
mod luks;
mod plan;
mod request;
mod space;
mod startup;
mod steps;
mod variables;

use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail};
use luft_meet::resize::{Request, STARTUP_TYPE};
use serde::{Deserialize, Serialize};

use crate::system::command::Tool;
use crate::system::files::write;
use crate::system::system_disk;
use plan::{Layout, Step};

const STATE: &str = "resize.json";
const ATTEMPTS: u32 = 3;

#[derive(Serialize, Deserialize)]
struct State {
    drive: String,
    steps: Vec<Step>,
    next: usize,
    attempts: u32,
}

fn state_file(state_dir: &Path) -> PathBuf {
    state_dir.join(STATE)
}

impl State {
    fn load(path: &Path) -> Option<Self> {
        serde_json::from_str(&std::fs::read_to_string(path).ok()?).ok()
    }

    fn save(&self, path: &Path) -> Result<()> {
        write(path, &serde_json::to_string_pretty(self)?)
    }
}

fn layout(request: &Request) -> Result<(String, Layout)> {
    let device = disk::root_device()?;
    let disk = disk::holding(&device)?;
    let root = disk
        .holding(&device)
        .context("Luft's partition isn't on its drive")?;
    if root.uuid != request.partition {
        bail!("The request is for another Luft");
    }
    if root.filesystem != "btrfs" {
        bail!("Luft's partition doesn't hold btrfs");
    }
    if root.luks_uuid.is_some() {
        luks::check(&root.device)?;
    }
    if btrfs::devices(&root.fs_uuid) != 1 {
        bail!("Luft's file system already spans more than one partition");
    }
    let startup = disk
        .before(root.span.offset)
        .filter(|part| part.kind == STARTUP_TYPE)
        .map(|part| (part.span, part.uuid.clone()));
    let block = startup
        .as_ref()
        .map_or(root.span.offset, |(span, _)| span.offset);
    let layout = Layout {
        root: root.span,
        root_uuid: root.uuid.clone(),
        luks_uuid: root.luks_uuid.clone(),
        free_before: disk.free_before(block),
        free_after: disk.free_after(root.span.end()),
        allocated: btrfs::allocated(&root.fs_uuid)?,
        startup,
    };
    Ok((disk.id.clone(), layout))
}

fn begin() -> Result<Option<State>> {
    let Some(request) = request::read()? else {
        return Ok(None);
    };
    let planned = layout(&request)
        .and_then(|(drive, layout)| Ok((drive, plan::plan(&layout, request.change)?)));
    match planned {
        Ok((drive, steps)) => Ok(Some(State {
            drive,
            steps,
            next: 0,
            attempts: 0,
        })),
        Err(error) => {
            request::clear()?;
            Err(error.context("Luft didn't change its size"))
        }
    }
}

fn resize(state_dir: &Path) -> Result<()> {
    if let Err(error) = space::report() {
        eprintln!("Luft couldn't tell Windows how full it is: {error:#}");
    }
    let Some(_change) = system_disk::change_unless_encrypting()? else {
        return Ok(());
    };
    let path = state_file(state_dir);
    let mut state = match State::load(&path) {
        Some(state) => state,
        None => match begin()? {
            Some(state) => state,
            None => return Ok(()),
        },
    };
    state.save(&path)?;
    while let Some(step) = state.steps.get(state.next) {
        eprintln!("Changing Luft's size: {step:?}");
        if let Err(error) = steps::run(&state.drive, step) {
            state.attempts += 1;
            if state.attempts >= ATTEMPTS {
                std::fs::remove_file(&path)?;
                request::clear()?;
                return Err(error.context("Luft gave up changing its size"));
            }
            state.save(&path)?;
            return Err(error);
        }
        state.next += 1;
        state.attempts = 0;
        state.save(&path)?;
    }
    std::fs::remove_file(&path)?;
    request::clear()?;
    Tool::new("systemctl").arg("daemon-reload").run()
}

pub fn run(state_dir: &Path) -> Result<()> {
    let state_dir = state_dir.to_owned();
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(async move { tokio::task::spawn_blocking(move || resize(&state_dir)).await })?
}
