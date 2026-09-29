use std::fs;
use std::io;
use std::os::fd::{AsFd, OwnedFd};
use std::process::{Child, Command};
use std::sync::Arc;
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;

use luft_app::Events;
use rustix::event::{PollFd, PollFlags, poll};
use rustix::io::Errno;
use rustix::process::Pid;

use super::budget::Budget;
use super::output::{Output, State};
use super::spawn::{Size, spawn};

const READ_BYTES: usize = 64 * 1024;
const WAKE_EXITED: u8 = 1;
const WAKE_CLOSED: u8 = 2;

pub struct Session {
    master: Arc<OwnedFd>,
    shell: Pid,
    input: Sender<Vec<u8>>,
    wake: Arc<OwnedFd>,
    output: Arc<Output>,
}

impl Session {
    pub fn start(
        id: u32,
        command: Command,
        size: Size,
        events: Events,
        budget: Arc<Budget>,
    ) -> io::Result<Self> {
        let spawned = spawn(command, size)?;
        let master = Arc::new(spawned.master);
        let shell = Pid::from_child(&spawned.child);
        let (wake_reader, wake_writer) = rustix::pipe::pipe_with(rustix::pipe::PipeFlags::CLOEXEC)?;
        let wake = Arc::new(wake_writer);
        let output = Output::new(id, events, budget);
        let (input, queue) = mpsc::channel();

        let reader = (master.clone(), output.clone());
        thread::spawn(move || read(&reader.0, &wake_reader, &reader.1));
        let writer = master.clone();
        thread::spawn(move || write(&writer, &queue));
        let waiter = (wake.clone(), output.clone());
        thread::spawn(move || wait(spawned.child, &waiter.0, &waiter.1));

        Ok(Self {
            master,
            shell,
            input,
            wake,
            output,
        })
    }

    pub fn output(&self) -> &Output {
        &self.output
    }

    pub fn write(&self, bytes: Vec<u8>) {
        let _ = self.input.send(bytes);
    }

    pub fn resize(&self, size: Size) -> io::Result<()> {
        size.apply(&self.master)
    }

    pub fn foreground(&self) -> Option<String> {
        let group = rustix::termios::tcgetpgrp(self.master.as_fd()).ok()?;
        if group == self.shell {
            return None;
        }
        let name = fs::read_to_string(format!("/proc/{}/comm", group.as_raw_nonzero())).ok()?;
        Some(name.trim_end().to_string())
    }
}

impl Drop for Session {
    fn drop(&mut self) {
        self.output.close();
        let _ = rustix::io::write(&*self.wake, &[WAKE_CLOSED]);
    }
}

fn read(master: &OwnedFd, wake: &OwnedFd, output: &Output) {
    loop {
        if !output.wait_for_room() {
            return;
        }
        let mut fds = [
            PollFd::new(master, PollFlags::IN),
            PollFd::new(wake, PollFlags::IN),
        ];
        match poll(&mut fds, None) {
            Ok(_) | Err(Errno::INTR) => {}
            Err(_) => return,
        }
        let (readable, woken) = (fds[0].revents(), fds[1].revents());
        if !woken.is_empty() {
            let mut signal = [0];
            if rustix::io::read(wake, &mut signal).is_ok_and(|count| count == 1)
                && signal[0] == WAKE_EXITED
            {
                output.fill(|state| {
                    drain(master, state);
                });
                output.drained();
            }
            return;
        }
        if readable.is_empty() {
            continue;
        }
        let mut open = true;
        output.fill(|state| open = drain(master, state));
        if !open {
            output.drained();
            return;
        }
    }
}

fn drain(master: &OwnedFd, state: &mut State) -> bool {
    while state.has_room() {
        let pending = state.pending();
        pending.reserve(READ_BYTES);
        match rustix::io::read(master, rustix::buffer::spare_capacity(pending)) {
            Ok(0) => return false,
            Ok(_) => {}
            Err(Errno::AGAIN | Errno::INTR) => return true,
            Err(_) => return false,
        }
    }
    true
}

fn write(master: &OwnedFd, queue: &Receiver<Vec<u8>>) {
    for bytes in queue {
        let mut written = 0;
        while written < bytes.len() {
            match rustix::io::write(master, &bytes[written..]) {
                Ok(count) => written += count,
                Err(Errno::AGAIN) => {
                    let mut fds = [PollFd::new(master, PollFlags::OUT)];
                    if poll(&mut fds, None).is_err_and(|error| error != Errno::INTR) {
                        return;
                    }
                }
                Err(Errno::INTR) => {}
                Err(_) => return,
            }
        }
    }
}

fn wait(mut child: Child, wake: &OwnedFd, output: &Output) {
    let code = child
        .wait()
        .ok()
        .and_then(|status| status.code())
        .unwrap_or(-1);
    output.exited(code);
    let _ = rustix::io::write(wake, &[WAKE_EXITED]);
}
