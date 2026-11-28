use std::os::unix::fs::DirBuilderExt;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use luft_i18n::t;

use crate::L10N;
use crate::install::configure::deployment::{self, Deployment};
use crate::install::configure::setup_account;
use crate::phase;
use crate::system::command::Tool;
use crate::system::files::write;
use crate::system::greetd;
use crate::system::mount::Mounted;

const PHYSICAL_ROOT: &str = "/sysroot";
const STAGED: &str = "luft-next-start/erase";
const FIRST_PERSON: u32 = 1000;
const STATE: &str = "lib/installer";

fn system_drive() -> Result<String> {
    let source = Tool::new("findmnt")
        .args(["--noheadings", "--output", "SOURCE", PHYSICAL_ROOT])
        .output()?;
    Ok(source
        .trim()
        .split('[')
        .next()
        .unwrap_or_default()
        .to_owned())
}

fn copy(from: &Path, to: &Path) -> Result<()> {
    Tool::new("cp").arg("--archive").arg(from).arg(to).run()
}

fn forget_fingerprints() {
    let passwd = std::fs::read_to_string("/etc/passwd").unwrap_or_default();
    let people = passwd.lines().filter_map(|line| {
        let mut fields = line.split(':');
        let name = fields.next()?;
        (fields.nth(1)?.parse::<u32>().ok()? >= FIRST_PERSON).then_some(name)
    });
    for person in people {
        if let Err(error) = Tool::new("fprintd-delete").arg(person).run() {
            eprintln!("{person}'s fingerprints stay on the reader: {error:#}");
        }
    }
}

fn first_start(staged: &Path, root: &Path, contexts: &Path) -> Result<()> {
    let var = staged.join("var");
    let home = setup_account::make_home(root, &var)?;
    let initial_session = var.join(greetd::INITIAL_SESSION);
    greetd::start_setup_at_start(&initial_session, setup_account::NAME)?;
    let state = var.join(STATE);
    write(
        &phase::unclaimed_marker(&state),
        &format!("{}\n", phase::WAITING_FOR_OWNER),
    )?;
    let greeter = initial_session
        .parent()
        .map_or(initial_session.clone(), Path::to_owned);
    deployment::relabel_in(staged, contexts, &["-F"], &[home, greeter, state])
}

fn stage(top: &Path, staged: &Path, scratch: &Path) -> Result<()> {
    for state in deployment::installed(top)? {
        let image = Deployment::image(top, &state, &scratch.join("image"))?;
        let root = staged.join(state.file_name().unwrap_or_default());
        std::fs::create_dir(&root)?;
        copy(&image.root.join("etc"), &root)?;
        setup_account::create(&root)?;
        deployment::relabel_in(
            &root,
            &image.contexts(),
            &["-F"],
            &setup_account::FILES.map(|name| root.join("etc").join(name)),
        )?;
        if !staged.join("var").exists() {
            copy(&image.root.join("var"), staged)?;
            first_start(staged, &root, &image.contexts())?;
        }
    }
    Ok(())
}

fn staged_in(top: &Path) -> Result<PathBuf> {
    let staged = top.join(STAGED);
    if staged.exists() {
        std::fs::remove_dir_all(&staged)?;
    }
    std::fs::DirBuilder::new()
        .recursive(true)
        .mode(0o700)
        .create(&staged)?;
    Ok(staged)
}

/// Prepares what this computer starts with once it's erased, and asks for it
/// to be erased at the next start.
pub fn prepare(scratch: &Path) -> Result<()> {
    let top = Mounted::new(&system_drive()?, "subvolid=5", &scratch.join("top"))?;
    let staged = staged_in(top.path())?;
    let asked = stage(top.path(), &staged, scratch).and_then(|()| {
        Tool::new("trustctl")
            .args(["system-disk", "erase"])
            .run()
            .with_context(|| t!(L10N, "installer-erase-failed"))
    });
    if asked.is_err() {
        std::fs::remove_dir_all(&staged)?;
    } else {
        forget_fingerprints();
    }
    asked
}

pub fn restart() -> Result<()> {
    Tool::new("systemctl").args(["reboot", "--no-block"]).run()
}
