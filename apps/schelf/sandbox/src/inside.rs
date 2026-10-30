use std::collections::HashSet;
use std::os::unix::net::UnixListener;
use std::process::Command;
use std::sync::{Arc, Mutex};

use crate::request::Request;

/// Runs inside the sandbox: starts every launch of the app it is sent, and
/// ends when the last one quits, with the exit status of the first.
pub fn serve(arguments: Vec<String>) -> i32 {
    let [socket, command @ ..] = arguments.as_slice() else {
        eprintln!("The sandbox was started without an app");
        return 2;
    };
    let command = command.to_vec();
    let listener = match UnixListener::bind(socket) {
        Ok(listener) => listener,
        Err(error) => {
            eprintln!("The sandbox couldn't listen for launches: {error}");
            return 1;
        }
    };
    if let Err(error) = crate::confine::confine() {
        eprintln!("The sandbox couldn't be confined: {error}");
        return 1;
    }
    let running = Arc::new(Mutex::new(HashSet::new()));
    let first = listener
        .accept()
        .and_then(|(stream, _)| Request::receive(stream))
        .and_then(|request| match request {
            Request::Launch { arguments } => start(&command, &arguments, &running),
            Request::Quit => Err(std::io::ErrorKind::InvalidInput.into()),
        });
    let first = match first {
        Ok(pid) => pid,
        Err(error) => {
            eprintln!("{} couldn't start: {error}", command.join(" "));
            return 127;
        }
    };
    let accepting = running.clone();
    std::thread::spawn(move || {
        for stream in listener.incoming().flatten() {
            match Request::receive(stream) {
                Ok(Request::Launch { arguments }) => {
                    if let Err(error) = start(&command, &arguments, &accepting) {
                        eprintln!("Couldn't start another window of the app: {error}");
                    }
                }
                Ok(Request::Quit) => quit(&accepting),
                Err(error) => eprintln!("Couldn't read a launch: {error}"),
            }
        }
    });
    reap(first, &running)
}

fn start(
    command: &[String],
    arguments: &[String],
    running: &Mutex<HashSet<u32>>,
) -> std::io::Result<u32> {
    let [program, options @ ..] = command else {
        return Err(std::io::ErrorKind::InvalidInput.into());
    };
    let mut running = running.lock().expect("running apps");
    let child = Command::new(program)
        .args(options)
        .args(arguments)
        .spawn()?;
    running.insert(child.id());
    Ok(child.id())
}

fn quit(running: &Mutex<HashSet<u32>>) {
    for pid in running.lock().expect("running apps").iter() {
        unsafe { libc::kill(*pid as libc::pid_t, libc::SIGTERM) };
    }
}

fn exit_code(status: libc::c_int) -> u8 {
    if libc::WIFEXITED(status) {
        libc::WEXITSTATUS(status) as u8
    } else {
        128u8.saturating_add(libc::WTERMSIG(status) as u8)
    }
}

fn reap(first: u32, running: &Mutex<HashSet<u32>>) -> i32 {
    let mut code = 0;
    loop {
        let mut status = 0;
        let pid = unsafe { libc::waitpid(-1, &raw mut status, 0) };
        if pid < 0 {
            if std::io::Error::last_os_error().kind() == std::io::ErrorKind::Interrupted {
                continue;
            }
            return code.into();
        }
        if pid as u32 == first {
            code = exit_code(status);
        }
        let mut running = running.lock().expect("running apps");
        running.remove(&(pid as u32));
        if running.is_empty() {
            std::process::exit(code.into());
        }
    }
}
