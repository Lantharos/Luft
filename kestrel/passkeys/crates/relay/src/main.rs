mod device;
mod seat;

use std::io::{self, Read, Write};
use std::os::fd::{AsFd, FromRawFd, OwnedFd};
use std::os::unix::net::UnixStream;
use std::process::ExitCode;

use rustix::event::{PollFd, PollFlags, poll};
use rustix::net::sockopt::socket_peercred;

use device::{Device, Event, REPORT};
use seat::Seat;

const REPORT_FRAME: u8 = 0;
const ATTACHED_FRAME: u8 = 1;
const DETACHED_FRAME: u8 = 2;
const CLOSED_FRAME: u8 = 3;

fn frame(kind: u8, payload: &[u8]) -> [u8; REPORT + 1] {
    let mut frame = [0; REPORT + 1];
    frame[0] = kind;
    frame[1..=payload.len()].copy_from_slice(payload);
    frame
}

fn uniq() -> io::Result<String> {
    let mut bytes = [0u8; 8];
    getrandom::fill(&mut bytes).map_err(io::Error::other)?;
    Ok(bytes.iter().map(|byte| format!("{byte:02x}")).collect())
}

fn readable(fd: &PollFd<'_>) -> bool {
    fd.revents()
        .intersects(PollFlags::IN | PollFlags::HUP | PollFlags::ERR)
}

fn relay(mut agent: UnixStream, seat: &Seat) -> io::Result<()> {
    let uniq = uniq()?;
    let mut device: Option<Device> = None;
    loop {
        match (seat.active(), device.is_some()) {
            (true, false) => {
                device = Some(Device::create(&uniq)?);
                agent.write_all(&frame(ATTACHED_FRAME, uniq.as_bytes()))?;
            }
            (false, true) => {
                device = None;
                agent.write_all(&frame(DETACHED_FRAME, &[]))?;
            }
            _ => {}
        }
        let mut fds = vec![
            PollFd::new(&agent, PollFlags::IN),
            PollFd::from_borrowed_fd(seat.fd(), PollFlags::IN),
        ];
        if let Some(device) = &device {
            fds.push(PollFd::from_borrowed_fd(device.as_fd(), PollFlags::IN));
        }
        poll(&mut fds, None)?;
        let (agent_ready, seat_changed) = (readable(&fds[0]), readable(&fds[1]));
        let device_ready = fds.get(2).is_some_and(readable);
        drop(fds);
        if seat_changed {
            seat.flush();
        }
        if agent_ready {
            let mut report = [0; REPORT];
            match agent.read_exact(&mut report) {
                Ok(()) => {
                    if let Some(device) = &mut device {
                        device.send(&report)?;
                    }
                }
                Err(error) if error.kind() == io::ErrorKind::UnexpectedEof => return Ok(()),
                Err(error) => return Err(error),
            }
        }
        if device_ready {
            match device.as_mut().map(Device::receive).transpose()?.flatten() {
                Some(Event::Report(report)) => agent.write_all(&frame(REPORT_FRAME, &report))?,
                Some(Event::Closed) => agent.write_all(&frame(CLOSED_FRAME, &[]))?,
                None => {}
            }
        }
    }
}

fn main() -> ExitCode {
    let agent = UnixStream::from(unsafe { OwnedFd::from_raw_fd(0) });
    let uid = match socket_peercred(agent.as_fd()) {
        Ok(credentials) => credentials.uid.as_raw(),
        Err(error) => {
            eprintln!("Couldn't identify who connected: {error}");
            return ExitCode::FAILURE;
        }
    };
    let seat = match Seat::watch(uid) {
        Ok(seat) => seat,
        Err(error) => {
            eprintln!("Couldn't watch the seat: {error}");
            return ExitCode::FAILURE;
        }
    };
    match relay(agent, &seat) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Passkey relay for user {uid} stopped: {error}");
            ExitCode::FAILURE
        }
    }
}
