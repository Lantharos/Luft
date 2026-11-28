use std::io;
use std::os::fd::AsRawFd;
use std::os::unix::net::UnixStream;
use std::time::Duration;

use luft_sign_in_wire::{Notice, Question, Reply, Request, Secret, read, write};

const ANSWER_PATIENCE: Duration = Duration::from_secs(300);

/// The sign-in module on the other end, which relays questions to whoever
/// signs in.
pub struct Conversation {
    stream: UnixStream,
}

impl Conversation {
    pub fn new(stream: UnixStream) -> Self {
        Self { stream }
    }

    pub fn stream(&mut self) -> &mut UnixStream {
        &mut self.stream
    }

    pub fn raw_fd(&self) -> i32 {
        self.stream.as_raw_fd()
    }

    pub fn reply(&mut self, reply: &Reply) -> io::Result<()> {
        write(&mut self.stream, reply).map_err(io::Error::other)
    }

    pub fn tell(&mut self, notice: Notice) -> io::Result<()> {
        self.reply(&Reply::Tell(notice))
    }

    pub fn ask(&mut self, question: Question) -> io::Result<Secret> {
        self.reply(&Reply::Ask(question))?;
        self.stream.set_read_timeout(Some(ANSWER_PATIENCE))?;
        match read::<Request>(&mut self.stream).map_err(io::Error::other)? {
            Request::Answer(answer) => Ok(answer),
            _ => Err(io::Error::other("expected an answer")),
        }
    }

    /// Whether the module hung up, because the person gave up or chose
    /// another way.
    pub fn gone(&self) -> bool {
        hung_up(self.raw_fd(), 0)
    }
}

pub fn hung_up(fd: i32, timeout_ms: i32) -> bool {
    let mut poll = libc::pollfd {
        fd,
        events: libc::POLLRDHUP,
        revents: 0,
    };
    let ready = unsafe { libc::poll(&raw mut poll, 1, timeout_ms) };
    ready > 0 && poll.revents & (libc::POLLRDHUP | libc::POLLHUP | libc::POLLERR) != 0
}
