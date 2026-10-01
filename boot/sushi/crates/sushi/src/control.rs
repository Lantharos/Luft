use std::io::{self, BufRead, BufReader, Write};
use std::os::unix::net::UnixStream;
use std::path::PathBuf;
use std::time::Duration;

pub const RUNTIME_DIR: &str = "/run/sushi";
pub const SOCKET: &str = "/run/sushi/control";
pub const PID_FILE: &str = "/run/sushi/pid";
pub const LOGO_PLACEMENT: &str = "/run/sushi/logo";

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Command {
    Deactivate,
    Quit,
    UpdateRoot(PathBuf),
    Status,
}

impl Command {
    pub fn parse(line: &str) -> Option<Self> {
        let mut words = line.split_whitespace();
        let command = match words.next()? {
            "deactivate" => Self::Deactivate,
            "quit" => Self::Quit,
            "update-root" => Self::UpdateRoot(PathBuf::from(words.next()?)),
            "status" => Self::Status,
            _ => return None,
        };
        words.next().is_none().then_some(command)
    }

    pub fn encode(&self) -> String {
        match self {
            Self::Deactivate => "deactivate".into(),
            Self::Quit => "quit".into(),
            Self::UpdateRoot(root) => format!("update-root {}", root.display()),
            Self::Status => "status".into(),
        }
    }
}

pub fn send(command: &Command, timeout: Duration) -> io::Result<String> {
    let mut stream = UnixStream::connect(SOCKET)?;
    stream.set_read_timeout(Some(timeout))?;
    stream.write_all(format!("{}\n", command.encode()).as_bytes())?;
    let mut reply = String::new();
    BufReader::new(stream).read_line(&mut reply)?;
    Ok(reply.trim_end().to_owned())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn commands_round_trip() {
        for command in [
            Command::Deactivate,
            Command::Quit,
            Command::Status,
            Command::UpdateRoot("/sysroot".into()),
        ] {
            assert_eq!(Command::parse(&command.encode()), Some(command));
        }
        assert_eq!(Command::parse("update-root"), None);
        assert_eq!(Command::parse("quit now"), None);
    }
}
