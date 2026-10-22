use std::io::Write;
use std::path::Path;

use anyhow::{Context, Result};
use luft_i18n::t;

use crate::L10N;

pub fn write(path: &Path, contents: &str) -> Result<()> {
    let parent = path.parent().context("A file needs a folder")?;
    std::fs::create_dir_all(parent)?;
    let staged = parent.join(format!(
        ".{}.new",
        path.file_name()
            .context("A file needs a name")?
            .to_string_lossy()
    ));
    let mut file = std::fs::File::create(&staged)?;
    file.write_all(contents.as_bytes())?;
    file.sync_all()?;
    std::fs::rename(&staged, path).with_context(|| {
        t!(
            L10N,
            "installer-write-failed",
            path = path.display().to_string()
        )
    })
}
