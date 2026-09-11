use rustix::{
    event::{PollFd, PollFlags, Timespec, poll},
    fd::OwnedFd,
    process::{Pid, PidfdFlags, pidfd_open},
};

pub(super) struct ProcessWatch(OwnedFd);

impl ProcessWatch {
    pub fn new(pid: u32) -> std::io::Result<Self> {
        let pid = Pid::from_raw(pid as i32)
            .ok_or_else(|| std::io::Error::other("invalid shell host PID"))?;
        Ok(Self(pidfd_open(pid, PidfdFlags::empty())?))
    }

    pub fn exited(&self) -> bool {
        let mut descriptors = [PollFd::new(&self.0, PollFlags::IN)];
        poll(
            &mut descriptors,
            Some(&Timespec {
                tv_sec: 0,
                tv_nsec: 0,
            }),
        )
        .is_ok_and(|ready| ready > 0)
    }
}
