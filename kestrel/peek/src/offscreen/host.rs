use std::ffi::OsString;
use std::fs::{self, DirBuilder, File};
use std::io::{self, BufRead, BufReader, Read, Write};
use std::os::fd::{AsFd, AsRawFd, OwnedFd};
use std::os::unix::fs::DirBuilderExt;
use std::os::unix::net::UnixStream;
use std::os::unix::process::ExitStatusExt;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, ExitCode, ExitStatus, Stdio};
use std::time::Duration;

use rustix::event::{PollFd, PollFlags, Timespec, poll};
use rustix::io::{FdFlags, fcntl_setfd};
use rustix::pipe::pipe;
use rustix::process::{Pid, PidfdFlags, Signal, getppid, pidfd_open, pidfd_send_signal, setsid};

use super::cgroup::{Cgroup, populated};
use super::isolation::Isolation;
use super::paths::{display, runtime, wayland_socket};
use crate::launch::STUB;

pub const HOST: &str = "hidden-display";
pub const ISOLATED: &str = "isolated";
pub const SHARED: &str = "shared";
pub const ENDED: &str = "ended";

const STOP_GRACE: Duration = Duration::from_secs(3);
const PROGRAM_DISPLAY: [&str; 3] = ["WAYLAND_DISPLAY", "DISPLAY", "XAUTHORITY"];

fn bus_config(directory: &Path) -> String {
    format!(
        r#"<!DOCTYPE busconfig PUBLIC "-//freedesktop//DTD D-Bus Bus Configuration 1.0//EN"
 "http://www.freedesktop.org/standards/dbus/1.0/busconfig.dtd">
<busconfig>
  <type>session</type>
  <listen>unix:path={}/bus</listen>
  <auth>EXTERNAL</auth>
  <policy context="default">
    <allow send_destination="*" eavesdrop="true"/>
    <allow eavesdrop="true"/>
    <allow own="*"/>
  </policy>
</busconfig>
"#,
        directory.display()
    )
}

fn compositor() -> io::Result<PathBuf> {
    match std::env::var_os("KESTREL_BUILDDIR") {
        Some(build) => Ok(PathBuf::from(build).join("kestrel")),
        None => Ok(std::env::current_exe()?.with_file_name("kestrel")),
    }
}

fn inherited(fd: &impl AsFd) -> io::Result<()> {
    fcntl_setfd(fd, FdFlags::empty())?;
    Ok(())
}

struct Display {
    stopping: UnixStream,
    directory: PathBuf,
    handle: String,
    scope: Cgroup,
    compositor: Option<(Child, OwnedFd)>,
    isolation: Option<Isolation>,
}

impl Display {
    fn start_bus(&self) -> io::Result<String> {
        let config = self.directory.join("bus.conf");
        fs::write(&config, bus_config(&self.directory))?;
        let mut daemon = Command::new("dbus-daemon")
            .arg(format!("--config-file={}", config.display()))
            .args(["--nofork", "--print-address=1"])
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .spawn()?;
        let mut address = String::new();
        BufReader::new(daemon.stdout.take().expect("the bus address is piped"))
            .read_line(&mut address)?;
        Ok(address.trim().to_owned())
    }

    fn start_compositor(
        &mut self,
        size: &str,
        bus: &str,
        owner: &OwnedFd,
    ) -> io::Result<Vec<(String, String)>> {
        let (ready, announce) = pipe()?;
        inherited(&announce)?;
        inherited(owner)?;
        let child = Command::new(compositor()?)
            .args([
                "--headless",
                "--peek",
                "--virtual-monitor",
                size,
                "--wayland-display",
            ])
            .arg(wayland_socket(&self.handle))
            .env("DBUS_SESSION_BUS_ADDRESS", bus)
            .env("PEEK_HANDLE", &self.handle)
            .env("PEEK_OWNER_FD", owner.as_raw_fd().to_string())
            .env("PEEK_READY_FD", announce.as_raw_fd().to_string())
            .stdin(Stdio::null())
            .stdout(io::stderr().as_fd().try_clone_to_owned()?)
            .spawn()?;
        drop(announce);
        let pidfd = pidfd_open(Pid::from_child(&child), PidfdFlags::empty())?;
        self.compositor = Some((child, pidfd));
        let mut environment = String::new();
        File::from(ready).read_to_string(&mut environment)?;
        if environment.is_empty() {
            return Err(io::Error::other(
                "Kestrel couldn't start the hidden display",
            ));
        }
        Ok(environment
            .lines()
            .filter_map(|line| line.split_once('='))
            .map(|(name, value)| (name.to_owned(), value.to_owned()))
            .collect())
    }

    fn wait(&self, group: &Cgroup) -> io::Result<bool> {
        let mut events = group.events()?;
        let (_, compositor) = self
            .compositor
            .as_ref()
            .expect("the compositor runs while the program does");
        while populated(&mut events)? {
            let mut fds = [
                PollFd::new(&events, PollFlags::PRI),
                PollFd::new(compositor, PollFlags::IN),
                PollFd::new(&self.stopping, PollFlags::IN),
            ];
            poll(&mut fds, None)?;
            if fds[1..].iter().any(|fd| !fd.revents().is_empty()) {
                return Ok(false);
            }
        }
        Ok(true)
    }

    fn stop(mut self) -> io::Result<()> {
        if let Some((mut child, pidfd)) = self.compositor.take() {
            pidfd_send_signal(&pidfd, Signal::TERM)?;
            let grace = Timespec::try_from(STOP_GRACE).expect("the grace period fits a timespec");
            poll(&mut [PollFd::new(&pidfd, PollFlags::IN)], Some(&grace))?;
            let _ = child.try_wait();
        }
        let _ = fs::remove_dir_all(&self.directory);
        if let Some(isolation) = &self.isolation {
            isolation.remove();
        }
        let socket = runtime()?.join(wayland_socket(&self.handle));
        let _ = fs::remove_file(socket.with_extension("lock"));
        let _ = fs::remove_file(socket);
        self.scope.kill()
    }
}

fn start_program(
    command: &[OsString],
    environment: &[(String, String)],
    isolation: Option<&Isolation>,
    group: &Cgroup,
) -> io::Result<Child> {
    let mut program = Command::new(std::env::current_exe()?);
    program
        .arg(STUB)
        .args(command)
        .stdin(Stdio::piped())
        .stdout(io::stderr().as_fd().try_clone_to_owned()?);
    for name in PROGRAM_DISPLAY {
        program.env_remove(name);
    }
    program.envs(environment.iter().map(|(name, value)| (name, value)));
    if let Some(isolation) = isolation {
        isolation.apply(&mut program);
    }
    let mut child = program.spawn()?;
    group.adopt(child.id())?;
    child
        .stdin
        .take()
        .expect("the program's input is piped")
        .write_all(b"\n")?;
    Ok(child)
}

fn stop_requests() -> io::Result<UnixStream> {
    let (requests, signals) = UnixStream::pair()?;
    signals.set_nonblocking(true)?;
    signal_hook::low_level::pipe::register(signal_hook::consts::SIGTERM, signals)?;
    Ok(requests)
}

fn report(message: &str) {
    let mut output = io::stdout();
    let _ = writeln!(output, "{message}").and_then(|()| output.flush());
}

fn ending(status: ExitStatus) -> String {
    match (status.code(), status.signal()) {
        (Some(code), _) => format!("{ENDED} exit status {code}"),
        (None, Some(signal)) => format!("{ENDED} killed by signal {signal}"),
        (None, None) => format!("{ENDED} {status}"),
    }
}

fn serve(
    display: &mut Display,
    size: &str,
    isolated: bool,
    command: &[OsString],
) -> io::Result<(Cgroup, Child)> {
    setsid()?;
    let parent =
        getppid().ok_or_else(|| io::Error::other("peek run ended before the display started"))?;
    let owner = pidfd_open(parent, PidfdFlags::empty())?;
    if getppid() != Some(parent) {
        return Err(io::Error::other(
            "peek run ended before the display started",
        ));
    }
    display.scope.child("host")?.adopt(std::process::id())?;
    let program = display.scope.child("program")?;
    DirBuilder::new().mode(0o700).create(&display.directory)?;
    if isolated {
        display.isolation = Some(Isolation::prepare(&display.handle, &display.directory)?);
    }
    let bus = display.start_bus()?;
    let environment = display.start_compositor(size, &bus, &owner)?;
    drop(owner);
    let child = start_program(command, &environment, display.isolation.as_ref(), &program)?;
    Ok((program, child))
}

fn watch(display: &Display, program: &Cgroup, mut child: Child) -> io::Result<()> {
    if display.wait(program)? {
        report(&ending(child.wait()?));
    }
    Ok(())
}

pub fn host(arguments: &[OsString]) -> ExitCode {
    let [handle, size, sharing, command @ ..] = arguments else {
        return ExitCode::FAILURE;
    };
    let handle = handle.to_string_lossy().into_owned();
    let (Ok(directory), Ok(scope)) = (display(&handle), Cgroup::own()) else {
        report("peek couldn't find a private place for the display");
        return ExitCode::FAILURE;
    };
    let Ok(stopping) = stop_requests() else {
        report("peek couldn't listen for requests to stop");
        return ExitCode::FAILURE;
    };
    let mut display = Display {
        stopping,
        directory,
        handle,
        scope,
        compositor: None,
        isolation: None,
    };
    let exit = match serve(
        &mut display,
        &size.to_string_lossy(),
        sharing == ISOLATED,
        command,
    ) {
        Ok((program, child)) => {
            report("ready");
            if let Err(error) = watch(&display, &program, child) {
                eprintln!("peek: lost track of the program: {error}");
            }
            ExitCode::SUCCESS
        }
        Err(error) => {
            report(&format!("The hidden display couldn't start: {error}"));
            ExitCode::FAILURE
        }
    };
    if let Err(error) = display.stop() {
        eprintln!("peek: couldn't close the hidden display: {error}");
    }
    exit
}
