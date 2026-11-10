use std::fs;
use std::io;
use std::os::fd::OwnedFd;

use luft_files::client::Process;
use rustix::io::Errno;
use rustix::process::{
    Pid, PidfdFlags, Signal, pidfd_open, pidfd_send_signal, setpriority_process,
};

const START_FIELD: usize = 19;
const NICEST: i32 = 19;
const LEAST_NICE: i32 = -20;

pub fn allowed(signal: i32) -> io::Result<Signal> {
    [Signal::TERM, Signal::KILL, Signal::STOP, Signal::CONT]
        .into_iter()
        .find(|allowed| allowed.as_raw() == signal)
        .ok_or_else(|| io::ErrorKind::InvalidInput.into())
}

pub fn signal(processes: &[Process], signal: Signal) -> io::Result<()> {
    for process in processes {
        let Some((_, handle)) = held(*process)? else {
            continue;
        };
        match pidfd_send_signal(handle, signal) {
            Ok(()) | Err(Errno::SRCH) => {}
            Err(error) => return Err(error.into()),
        }
    }
    Ok(())
}

pub fn set_priority(process: Process, nice: i32) -> io::Result<()> {
    let Some((pid, _handle)) = held(process)? else {
        return Ok(());
    };
    let nice = nice.clamp(LEAST_NICE, NICEST);
    let Ok(threads) = fs::read_dir(format!("/proc/{}/task", pid.as_raw_nonzero())) else {
        return Ok(());
    };
    for thread in threads
        .flatten()
        .filter_map(|thread| thread.file_name().to_str()?.parse().ok())
        .filter_map(Pid::from_raw)
    {
        match setpriority_process(Some(thread), nice) {
            Ok(()) | Err(Errno::SRCH) => {}
            Err(error) => return Err(error.into()),
        }
    }
    Ok(())
}

fn held((pid, started): Process) -> io::Result<Option<(Pid, OwnedFd)>> {
    let pid = i32::try_from(pid)
        .ok()
        .filter(|pid| *pid > 1)
        .and_then(Pid::from_raw)
        .ok_or(io::ErrorKind::InvalidInput)?;
    let handle = match pidfd_open(pid, PidfdFlags::empty()) {
        Ok(handle) => handle,
        Err(Errno::SRCH) => return Ok(None),
        Err(error) => return Err(error.into()),
    };
    let same = fs::read(format!("/proc/{}/stat", pid.as_raw_nonzero()))
        .ok()
        .and_then(|stat| start_of(&stat))
        .is_some_and(|start| start == started);
    Ok(same.then_some((pid, handle)))
}

fn start_of(stat: &[u8]) -> Option<u64> {
    let after_name = stat.iter().rposition(|byte| *byte == b')')? + 1;
    std::str::from_utf8(&stat[after_name..])
        .ok()?
        .split_ascii_whitespace()
        .nth(START_FIELD)?
        .parse()
        .ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_the_start_past_a_name_with_brackets_and_spaces() {
        let stat = b"4242 (tricky) name) S 1 4242 4242 0 -1 4194560 1 0 0 0 5 6 0 0 20 0 3 0 987654 1000 10 18446744073709551615";
        assert_eq!(start_of(stat), Some(987_654));
    }
}
