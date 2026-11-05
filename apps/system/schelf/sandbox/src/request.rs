use std::io::{BufRead, BufReader, Write};
use std::os::unix::net::UnixStream;

use serde::{Deserialize, Serialize};

/// What a later launch, or Schelf, asks the app's running sandbox to do.
#[derive(Serialize, Deserialize)]
pub enum Request {
    Launch { arguments: Vec<String> },
    Quit,
}

impl Request {
    pub fn send(&self, mut stream: UnixStream) -> std::io::Result<()> {
        let mut line = serde_json::to_vec(self)?;
        line.push(b'\n');
        stream.write_all(&line)
    }

    pub fn receive(stream: UnixStream) -> std::io::Result<Self> {
        let mut line = String::new();
        BufReader::new(stream).read_line(&mut line)?;
        Ok(serde_json::from_str(&line)?)
    }
}
