use std::fs::File;
use std::io::{self, Write};

pub fn read(path: &str) -> io::Result<String> {
    match std::fs::read_to_string(path) {
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(String::new()),
        read => read,
    }
}

pub fn replace(path: &str, text: &str) -> io::Result<()> {
    let staged = format!("{path}.new");
    let mut file = File::create(&staged)?;
    file.write_all(text.as_bytes())?;
    file.sync_all()?;
    std::fs::rename(staged, path)
}
