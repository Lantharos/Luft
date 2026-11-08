use std::io;

pub fn read(path: &str) -> io::Result<String> {
    match std::fs::read_to_string(path) {
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(String::new()),
        read => read,
    }
}

pub fn replace(path: &str, text: &str) -> io::Result<()> {
    let staged = format!("{path}.new");
    std::fs::write(&staged, text)?;
    std::fs::rename(staged, path)
}
