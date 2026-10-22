use std::io::{Read, Write};
use std::net::Shutdown;
use std::os::unix::net::UnixStream;

use anyhow::{Context, Result, anyhow, bail};

const SOCKET: &str = "/run/luft-system-packages/activate";
const DONE: &str = "done";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Request {
    BringIn,
    TakeAway,
}

impl Request {
    fn word(self) -> &'static str {
        match self {
            Self::BringIn => "bring-in",
            Self::TakeAway => "take-away",
        }
    }

    fn parse(word: &str) -> Result<Self> {
        match word.trim() {
            "bring-in" => Ok(Self::BringIn),
            "take-away" => Ok(Self::TakeAway),
            other => bail!("Unknown request {other}"),
        }
    }
}

/// Has the activation service, which runs with the rights to change the running system, bring
/// the build made for this version in or take the system packages away. Returns once it's done.
pub fn send(request: Request) -> Result<()> {
    let mut stream = UnixStream::connect(SOCKET)
        .context("Reaching the service that brings system packages into the system")?;
    stream.write_all(request.word().as_bytes())?;
    stream.shutdown(Shutdown::Write)?;
    let mut answer = String::new();
    stream.read_to_string(&mut answer)?;
    match answer.trim_end() {
        DONE => Ok(()),
        "" => Err(anyhow!(
            "Bringing the system packages into the system stopped unexpectedly."
        )),
        error => Err(anyhow!(error.to_owned())),
    }
}

/// Answers one request on the connection systemd hands over as standard input and output.
pub fn answer(handle: impl FnOnce(Request) -> Result<()>) -> Result<()> {
    let mut word = String::new();
    std::io::stdin().read_to_string(&mut word)?;
    let result = Request::parse(&word).and_then(handle);
    let mut output = std::io::stdout();
    match &result {
        Ok(()) => output.write_all(DONE.as_bytes())?,
        Err(error) => output.write_all(error.to_string().as_bytes())?,
    }
    output.flush()?;
    result
}
