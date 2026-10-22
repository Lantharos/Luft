use std::path::PathBuf;

pub const STATE: &str = "/var/lib/trustd";
pub const RUNTIME: &str = "/run/trustd";

pub fn state(name: &str) -> PathBuf {
    PathBuf::from(STATE).join(name)
}

pub fn ensure_private(path: impl AsRef<std::path::Path>) -> std::io::Result<()> {
    use std::os::unix::fs::{DirBuilderExt, PermissionsExt};
    let path = path.as_ref();
    std::fs::DirBuilder::new()
        .recursive(true)
        .mode(0o700)
        .create(path)?;
    std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o700))
}

pub fn write_private(path: &std::path::Path, contents: &[u8]) -> std::io::Result<()> {
    use std::io::Write;
    use std::os::unix::fs::OpenOptionsExt;
    let partial = path.with_extension("partial");
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .mode(0o600)
        .open(&partial)?;
    file.write_all(contents)?;
    file.sync_all()?;
    std::fs::rename(partial, path)
}
