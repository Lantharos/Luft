use std::io::{self, BufRead, BufReader, Write};
use std::os::unix::process::CommandExt;
use std::process::{Child, ChildStdout, Command, Stdio};

use crate::worker::{ARGUMENT, Reply, Request};

const NICE: libc::c_int = 10;
const IOPRIO_WHO_PROCESS: libc::c_long = 1;
const IOPRIO_CLASS_BEST_EFFORT: libc::c_long = 2;
const IOPRIO_LOWEST: libc::c_long = 7;
const IOPRIO_CLASS_SHIFT: libc::c_long = 13;

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Priority {
    Background,
    Interactive,
}

fn lower_priority() {
    unsafe {
        libc::setpriority(libc::PRIO_PROCESS, 0, NICE);
        libc::syscall(
            libc::SYS_ioprio_set,
            IOPRIO_WHO_PROCESS,
            0,
            (IOPRIO_CLASS_BEST_EFFORT << IOPRIO_CLASS_SHIFT) | IOPRIO_LOWEST,
        );
    }
}

pub struct Worker {
    child: Child,
    lines: BufReader<ChildStdout>,
}

impl Worker {
    pub fn start(request: &Request, priority: Priority) -> io::Result<Self> {
        let mut command = Command::new(std::env::current_exe()?);
        command
            .arg(ARGUMENT)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .process_group(0);
        unsafe {
            command.pre_exec(move || {
                libc::prctl(libc::PR_SET_PDEATHSIG, libc::SIGTERM);
                if priority == Priority::Background {
                    lower_priority();
                }
                Ok(())
            });
        }
        let mut child = command.spawn()?;
        let mut stdin = child.stdin.take().expect("stdin was piped");
        let mut line = serde_json::to_vec(request).map_err(io::Error::other)?;
        line.push(b'\n');
        stdin.write_all(&line)?;
        let stdout = child.stdout.take().expect("stdout was piped");
        Ok(Self {
            child,
            lines: BufReader::new(stdout),
        })
    }

    pub fn group(&self) -> i32 {
        self.child.id() as i32
    }

    pub fn next_reply(&mut self) -> Option<Reply> {
        let mut line = String::new();
        match self.lines.read_line(&mut line) {
            Ok(count) if count > 0 => serde_json::from_str(&line).ok(),
            _ => None,
        }
    }

    pub fn wait(mut self) {
        let _ = self.child.wait();
    }
}

pub fn signal_group(group: i32, signal: libc::c_int) {
    unsafe {
        libc::kill(-group, signal);
    }
}
