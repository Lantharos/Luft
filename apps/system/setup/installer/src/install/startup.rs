use std::path::Path;

use anyhow::{Context, Result};
use luft_i18n::t;

use super::drive::target::Mounted;
use crate::L10N;
use crate::system::command::Tool;

pub fn place(mounted: &Mounted, at: &Path) -> Result<()> {
    std::fs::create_dir_all(at)?;
    Tool::new("mount").arg(&mounted.esp).arg(at).run()?;
    let placed = Tool::new("trustctl")
        .args(["startup", "install", "--esp"])
        .arg(at)
        .run()
        .with_context(|| t!(L10N, "installer-boot-menu-failed"));
    let unmounted = Tool::new("umount").arg(at).run();
    placed.and(unmounted)
}
