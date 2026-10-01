use std::path::PathBuf;

pub const STATE: &str = "/var/lib/luft-trust";
pub const RUNTIME: &str = "/run/luft-trust";
pub const STAGE: &str = "/var/lib/luft-trust/stage";
pub const INITRD_STAGE: &str = "/etc/luft-trust/stage";

pub fn state(name: &str) -> PathBuf {
    PathBuf::from(STATE).join(name)
}

pub fn stage(name: &str) -> PathBuf {
    PathBuf::from(STAGE).join(name)
}

pub fn ensure_private(path: &str) -> std::io::Result<()> {
    use std::os::unix::fs::{DirBuilderExt, PermissionsExt};
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
