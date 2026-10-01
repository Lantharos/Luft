use std::io::{self, BufRead, BufReader, Write};
use std::os::unix::net::UnixStream;
use std::path::PathBuf;
use std::str::FromStr;
use std::time::Duration;

pub const RUNTIME_DIR: &str = "/run/sushi";
pub const SOCKET: &str = "/run/sushi/control";
pub const PID_FILE: &str = "/run/sushi/pid";
pub const LOGO_PLACEMENT: &str = "/run/sushi/logo";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Mode {
    Boot,
    Shutdown,
    Updates,
    Upgrade,
    Firmware,
}

impl Mode {
    pub fn name(self) -> &'static str {
        match self {
            Self::Boot => "boot-up",
            Self::Shutdown => "shutdown",
            Self::Updates => "updates",
            Self::Upgrade => "system-upgrade",
            Self::Firmware => "firmware-upgrade",
        }
    }
}

impl FromStr for Mode {
    type Err = String;

    fn from_str(name: &str) -> Result<Self, Self::Err> {
        Ok(match name {
            "boot-up" => Self::Boot,
            "shutdown" | "reboot" => Self::Shutdown,
            "updates" => Self::Updates,
            "system-upgrade" => Self::Upgrade,
            "firmware-upgrade" => Self::Firmware,
            _ => return Err(format!("{name} isn't something the splash can show")),
        })
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Command {
    Deactivate,
    Quit,
    UpdateRoot(PathBuf),
    Show(Mode),
    Status,
}

impl Command {
    pub fn parse(line: &str) -> Option<Self> {
        let mut words = line.split_whitespace();
        let command = match words.next()? {
            "deactivate" => Self::Deactivate,
            "quit" => Self::Quit,
            "update-root" => Self::UpdateRoot(PathBuf::from(words.next()?)),
            "show" => Self::Show(words.next()?.parse().ok()?),
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
            Self::Show(mode) => format!("show {}", mode.name()),
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
            Command::Show(Mode::Updates),
        ] {
            assert_eq!(Command::parse(&command.encode()), Some(command));
        }
        assert_eq!(Command::parse("update-root"), None);
        assert_eq!(Command::parse("quit now"), None);
    }
}
