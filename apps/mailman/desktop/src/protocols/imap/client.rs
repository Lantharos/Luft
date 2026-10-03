use std::io::{BufRead, BufReader, Read, Write};
use std::time::Duration;

use base64::Engine;
use base64::engine::general_purpose::STANDARD;

use super::response::{self, Response, Status, Untagged};
use crate::accounts::Login;
use crate::protocols::net::{Security, Server, Stream};

const READ_TIMEOUT: Duration = Duration::from_secs(90);

pub struct Client {
    reader: BufReader<Stream>,
    pending: Vec<u8>,
    next_tag: u32,
    pub capabilities: Vec<String>,
}

enum ReadError {
    Waiting,
    Failed(String),
}

impl From<ReadError> for String {
    fn from(error: ReadError) -> Self {
        match error {
            ReadError::Waiting => "the server stopped answering".into(),
            ReadError::Failed(error) => error,
        }
    }
}

pub struct Reply {
    pub untagged: Vec<Untagged>,
    pub code: Option<String>,
}

impl Client {
    pub fn connect(server: &Server) -> Result<Self, String> {
        let stream = Stream::connect(server)?;
        stream.set_timeout(Some(READ_TIMEOUT));
        let mut client = Self::over(stream);
        match client.read()? {
            Response::Untagged(Untagged::Status {
                status: Status::Ok | Status::PreAuth,
                ..
            }) => {}
            Response::Untagged(Untagged::Capability(capabilities)) => {
                client.capabilities = capabilities
            }
            _ => return Err(format!("{} didn't greet like a mail server", server.host)),
        }
        if server.security == Security::StartTls {
            client.run("STARTTLS")?;
            client = Self::over(client.reader.into_inner().secure(&server.host)?);
        }
        if client.capabilities.is_empty() {
            client.refresh_capabilities()?;
        }
        Ok(client)
    }

    fn over(stream: Stream) -> Self {
        Self {
            reader: BufReader::new(stream),
            pending: Vec::new(),
            next_tag: 0,
            capabilities: Vec::new(),
        }
    }

    pub fn has(&self, capability: &str) -> bool {
        self.capabilities
            .iter()
            .any(|known| known.eq_ignore_ascii_case(capability))
    }

    pub fn refresh_capabilities(&mut self) -> Result<(), String> {
        let reply = self.run("CAPABILITY")?;
        for untagged in reply.untagged {
            if let Untagged::Capability(capabilities) = untagged {
                self.capabilities = capabilities;
            }
        }
        Ok(())
    }

    pub fn login(&mut self, login: &Login) -> Result<(), String> {
        let reply = match login {
            Login::Password { username, password } => {
                if self.has("AUTH=PLAIN") {
                    let token = STANDARD.encode(format!("\0{username}\0{password}"));
                    self.run_sensitive(&format!("AUTHENTICATE PLAIN {token}"))
                } else {
                    self.run_sensitive(&format!(
                        "LOGIN {} {}",
                        super::quote(username),
                        super::quote(password)
                    ))
                }
            }
            Login::Bearer {
                username, token, ..
            } => {
                let token =
                    STANDARD.encode(format!("user={username}\x01auth=Bearer {token}\x01\x01"));
                self.run_sensitive(&format!("AUTHENTICATE XOAUTH2 {token}"))
            }
        }?;
        match reply
            .code
            .as_deref()
            .and_then(|code| code.strip_prefix("CAPABILITY "))
        {
            Some(capabilities) => {
                self.capabilities = capabilities.split_whitespace().map(str::to_owned).collect()
            }
            None => self.refresh_capabilities()?,
        }
        Ok(())
    }

    fn tag(&mut self) -> String {
        self.next_tag += 1;
        format!("m{}", self.next_tag)
    }

    pub fn read(&mut self) -> Result<Response, String> {
        let raw = self.read_raw()?;
        Ok(response::parse(&raw))
    }

    fn read_raw(&mut self) -> Result<Vec<u8>, ReadError> {
        loop {
            let read = self
                .reader
                .read_until(b'\n', &mut self.pending)
                .map_err(failure)?;
            if read == 0 {
                return Err(ReadError::Failed("the server closed the connection".into()));
            }
            if !self.pending.ends_with(b"\n") {
                continue;
            }
            let Some(length) = literal_length(&self.pending) else {
                return Ok(std::mem::take(&mut self.pending));
            };
            let start = self.pending.len();
            self.pending.resize(start + length, 0);
            if let Err(error) = self.reader.read_exact(&mut self.pending[start..]) {
                self.pending.truncate(start);
                return Err(failure(error));
            }
        }
    }

    fn send(&mut self, line: &[u8]) -> Result<(), String> {
        let stream = self.reader.get_mut();
        stream
            .write_all(line)
            .and_then(|_| stream.flush())
            .map_err(|error| error.to_string())
    }

    pub fn run(&mut self, command: &str) -> Result<Reply, String> {
        let tag = self.tag();
        self.send(format!("{tag} {command}\r\n").as_bytes())?;
        self.finish(&tag, command)
    }

    fn run_sensitive(&mut self, command: &str) -> Result<Reply, String> {
        let tag = self.tag();
        self.send(format!("{tag} {command}\r\n").as_bytes())?;
        self.finish(&tag, "sign in")
            .map_err(|error| format!("Signing in failed: {error}"))
    }

    fn finish(&mut self, tag: &str, command: &str) -> Result<Reply, String> {
        let mut untagged = Vec::new();
        loop {
            match self.read()? {
                Response::Tagged {
                    tag: done,
                    status,
                    code,
                    text,
                } if done == tag => {
                    return match status {
                        Status::Ok => Ok(Reply { untagged, code }),
                        _ => Err(if text.is_empty() {
                            format!("{command} was refused")
                        } else {
                            text
                        }),
                    };
                }
                Response::Untagged(Untagged::Status {
                    status: Status::Bye,
                    ..
                }) => {
                    return Err("the server closed the connection".into());
                }
                Response::Untagged(response) => untagged.push(response),
                Response::Continue => self.send(b"\r\n")?,
                Response::Tagged { .. } => {}
            }
        }
    }

    pub fn run_with_literal(&mut self, command: &str, literal: &[u8]) -> Result<Reply, String> {
        let tag = self.tag();
        if self.has("LITERAL+") {
            self.send(format!("{tag} {command} {{{}+}}\r\n", literal.len()).as_bytes())?;
        } else {
            self.send(format!("{tag} {command} {{{}}}\r\n", literal.len()).as_bytes())?;
            match self.read()? {
                Response::Continue => {}
                Response::Tagged { text, .. } => return Err(text),
                Response::Untagged(_) => return Err("the server didn't accept the message".into()),
            }
        }
        self.send(literal)?;
        self.send(b"\r\n")?;
        self.finish(&tag, command)
    }

    pub fn idle(&mut self, wait: Duration, mut wake: impl FnMut() -> bool) -> Result<bool, String> {
        let tag = self.tag();
        self.send(format!("{tag} IDLE\r\n").as_bytes())?;
        match self.read()? {
            Response::Continue => {}
            _ => return Err("the server doesn't wait for new mail".into()),
        }
        self.reader
            .get_ref()
            .set_timeout(Some(Duration::from_secs(1)));
        let started = std::time::Instant::now();
        let mut changed = false;
        while !changed && started.elapsed() < wait && !wake() {
            match self.read_raw() {
                Ok(raw) => {
                    changed = matches!(
                        response::parse(&raw),
                        Response::Untagged(
                            Untagged::Exists(_)
                                | Untagged::Expunge
                                | Untagged::Fetch(_)
                                | Untagged::Vanished(_)
                        )
                    );
                }
                Err(ReadError::Waiting) => {}
                Err(error) => return Err(error.into()),
            }
        }
        self.reader.get_ref().set_timeout(Some(READ_TIMEOUT));
        self.send(b"DONE\r\n")?;
        self.finish(&tag, "IDLE")?;
        Ok(changed)
    }

    pub fn logout(mut self) {
        let _ = self.run("LOGOUT");
    }
}

fn failure(error: std::io::Error) -> ReadError {
    match error.kind() {
        std::io::ErrorKind::WouldBlock | std::io::ErrorKind::TimedOut => ReadError::Waiting,
        _ => ReadError::Failed(error.to_string()),
    }
}

fn literal_length(raw: &[u8]) -> Option<usize> {
    let line = raw
        .strip_suffix(b"\r\n")
        .or_else(|| raw.strip_suffix(b"\n"))?;
    let line = line.strip_suffix(b"}")?;
    let open = line.iter().rposition(|&byte| byte == b'{')?;
    std::str::from_utf8(&line[open + 1..])
        .ok()?
        .trim_end_matches('+')
        .parse()
        .ok()
}
