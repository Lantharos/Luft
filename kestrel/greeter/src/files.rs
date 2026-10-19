use std::fs::{self, DirBuilder, OpenOptions};
use std::io::{self, Write};
use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
use std::path::Path;

#[derive(Clone, Copy)]
pub enum Readers {
    Everyone,
    LoginScreen,
}

impl Readers {
    fn file_mode(self) -> u32 {
        match self {
            Self::Everyone => 0o644,
            Self::LoginScreen => 0o640,
        }
    }

    fn directory_mode(self) -> u32 {
        match self {
            Self::Everyone => 0o755,
            Self::LoginScreen => 0o750,
        }
    }
}

pub fn write_atomically(path: &Path, contents: &[u8], readers: Readers) -> io::Result<()> {
    let directory = path.parent().expect("stored files live in a directory");
    DirBuilder::new()
        .recursive(true)
        .mode(readers.directory_mode())
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
        .mode(readers.file_mode())
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
