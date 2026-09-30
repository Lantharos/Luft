use std::fs::{self, DirBuilder, OpenOptions};
use std::io::{self, Write};
use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
use std::path::Path;

pub fn write_atomically(path: &Path, contents: &[u8]) -> io::Result<()> {
    let directory = path.parent().expect("stored files live in a directory");
    DirBuilder::new()
        .recursive(true)
        .mode(0o755)
        .create(directory)?;
    let mut name = path
        .file_name()
        .expect("stored files have a name")
        .to_owned();
    name.push(".new");
    let staged = directory.join(name);
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .mode(0o644)
        .open(&staged)?;
    file.write_all(contents)?;
    file.sync_all()?;
    fs::rename(&staged, path)
}

pub fn remove(path: &Path) -> io::Result<()> {
    match fs::remove_file(path) {
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
        result => result,
    }
}
