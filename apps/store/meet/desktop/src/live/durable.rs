use std::fs::{self, File};
use std::io::{self, Write};
use std::path::Path;

pub fn write(path: &Path, contents: &[u8]) -> io::Result<()> {
    let mut staged_name = path.as_os_str().to_owned();
    staged_name.push(".new");
    let staged = Path::new(&staged_name);
    let mut file = File::create(staged)?;
    file.write_all(contents)?;
    file.sync_all()?;
    drop(file);
    fs::rename(staged, path)
}
