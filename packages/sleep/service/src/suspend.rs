use std::fs;
use std::os::fd::OwnedFd;
use std::os::unix::process::CommandExt;
use std::process::Command;
use std::time::Duration;

use anyhow::{Context, bail};
use rustix::io::Errno;
use rustix::time::{
    ClockId, Itimerspec, TimerfdClockId, TimerfdFlags, TimerfdTimerFlags, Timespec, clock_gettime,
    timerfd_create, timerfd_settime,
};

use crate::battery;
use crate::config;
use crate::plan::{Plan, Step};

const SYSTEMD_SLEEP: &str = "/usr/lib/systemd/systemd-sleep";
const LIDS: &str = "/proc/acpi/button/lid";
const POWER_OFF: &str = "luft-sleep-power-off.service";

struct Alarm(OwnedFd);

impl Alarm {
    fn new() -> rustix::io::Result<Self> {
        timerfd_create(
            TimerfdClockId::BoottimeAlarm,
            TimerfdFlags::CLOEXEC | TimerfdFlags::NONBLOCK,
        )
        .map(Self)
    }

    fn ring_in(&self, wait: Duration) -> rustix::io::Result<()> {
        let at = Itimerspec {
            it_interval: Timespec::default(),
            it_value: Timespec {
                tv_sec: wait.as_secs() as i64,
                tv_nsec: i64::from(wait.subsec_nanos()),
            },
        };
        timerfd_settime(&self.0, TimerfdTimerFlags::empty(), &at).map(|_| ())
    }

    fn rang(&self) -> rustix::io::Result<bool> {
        let mut expirations = [0; 8];
        match rustix::io::read(&self.0, &mut expirations) {
            Ok(_) => Ok(true),
            Err(Errno::AGAIN) => Ok(false),
            Err(error) => Err(error),
        }
    }
}

fn boot_time() -> Duration {
    let now = clock_gettime(ClockId::Boottime);
    Duration::new(now.tv_sec as u64, now.tv_nsec as u32)
}

fn lid_closed() -> Option<bool> {
    let lid = fs::read_dir(LIDS).ok()?.flatten().next()?;
    let state = fs::read_to_string(lid.path().join("state")).ok()?;
    Some(state.contains("closed"))
}

fn sleep() -> anyhow::Result<()> {
    let status = Command::new(SYSTEMD_SLEEP).arg("suspend").status()?;
    if !status.success() {
        bail!("The computer couldn't sleep ({status})");
    }
    Ok(())
}

fn power_off_after_waking() -> anyhow::Result<()> {
    let status = Command::new("systemctl")
        .args(["start", "--no-block", POWER_OFF])
        .status()?;
    if !status.success() {
        bail!("The computer couldn't be shut down ({status})");
    }
    Ok(())
}

pub fn run() -> anyhow::Result<()> {
    let (Some(limit), Some(reading)) = (config::power_off_after(), battery::read()) else {
        return Err(Command::new(SYSTEMD_SLEEP).arg("suspend").exec().into());
    };
    let alarm = Alarm::new().context("Couldn't set a wake-up alarm")?;
    let closed_lid = lid_closed() == Some(true);
    let (mut plan, mut wait) = Plan::start(limit, boot_time(), reading);
    loop {
        alarm.ring_in(wait)?;
        sleep()?;
        if !alarm.rang()? || (closed_lid && lid_closed() == Some(false)) {
            return Ok(());
        }
        let Some(reading) = battery::read() else {
            return Ok(());
        };
        match plan.woke(boot_time(), reading) {
            Step::SleepFor(next) => {
                eprintln!(
                    "Battery at {:.0}%, sleeping again for {} minutes",
                    reading.level,
                    next.as_secs() / 60
                );
                wait = next;
            }
            Step::PowerOff => {
                eprintln!(
                    "Battery at {:.0}%, shutting down instead of sleeping on",
                    reading.level
                );
                return power_off_after_waking();
            }
        }
    }
}
