mod cli;
mod files;
mod launch;
mod offscreen;
mod service;
mod target;

use std::ffi::OsString;
use std::path::PathBuf;
use std::process::ExitCode;

use clap::Parser;
use zbus::zvariant::Fd;

use cli::{Action, At, Cli};
use files::{Output, scratch_file};
use launch::{STUB, launch, start_program};
use service::{Failure, Peek, Window, connect_display, connect_session, windows};

fn connection(handle: Option<&str>) -> Result<Peek, Failure> {
    match handle {
        Some(handle) if offscreen::is_running(handle) => connect_display(&offscreen::bus(handle)?),
        _ => connect_session(),
    }
}

fn summary(window: &Window) -> String {
    let size = format!("{}x{}", window.width, window.height);
    let state = if window.focused { "focused" } else { "-" };
    let title = if window.access == "ask" {
        "(hidden until you may see it)"
    } else {
        &window.title
    };
    format!(
        "{:<8} {:<6} {:<11} {:<8} {:<36} {}",
        window.id, window.access, size, state, window.app, title
    )
}

fn list(handle: Option<&str>, json: bool) -> Result<(), Failure> {
    let windows = windows(&connection(handle)?, handle.unwrap_or_default())?;
    if json {
        let entries: Vec<_> = windows
            .iter()
            .map(|window| {
                serde_json::json!({
                    "id": window.id, "app": window.app, "name": window.name, "title": window.title,
                    "width": window.width, "height": window.height, "scale": window.scale,
                    "focused": window.focused, "access": window.access, "handle": window.handle,
                })
            })
            .collect();
        println!("{}", serde_json::Value::Array(entries));
        return Ok(());
    }
    println!(
        "{:<8} {:<6} {:<11} {:<8} {:<36} TITLE",
        "ID", "ACCESS", "SIZE", "STATE", "APP"
    );
    for window in &windows {
        println!("{}", summary(window));
    }
    Ok(())
}

fn capture(
    output: Option<PathBuf>,
    prefix: &str,
    shoot: impl FnOnce(Fd<'_>) -> zbus::Result<()>,
) -> Result<(), Failure> {
    let output = Output::create(output, prefix)?;
    let result = shoot(Fd::from(&output.file)).map_err(Failure::from);
    println!("{}", output.finish(result)?.display());
    Ok(())
}

fn run(
    here: bool,
    size: &str,
    wait: Option<u32>,
    log: Option<PathBuf>,
    command: &[OsString],
) -> Result<(), Failure> {
    let log = match log {
        Some(log) => log,
        None => scratch_file("run", "log")?,
    };
    let handle = if here {
        launch(&connect_session()?, command, &log)?
    } else {
        offscreen::start(command, size, &log)?
    };
    let place = if here {
        "on the screen"
    } else {
        "on a hidden display"
    };
    eprintln!(
        "Started {} {place}. Its output goes to {}",
        command[0].to_string_lossy(),
        std::path::absolute(&log)?.display()
    );
    if let Some(timeout) = wait {
        let window = connection(Some(&handle))?
            .wait_for_window(&handle, timeout)
            .map_err(Failure::from)
            .and_then(Window::try_from)
            .map_err(|Failure(message)| {
                Failure(format!(
                    "{message}. The program's output is in {}",
                    log.display()
                ))
            })?;
        eprintln!("{}", summary(&window));
    }
    println!("{handle}");
    Ok(())
}

fn act(
    at: &At,
    action: impl FnOnce(&Peek, u64, f64, f64) -> zbus::Result<()>,
) -> Result<(), Failure> {
    let peek = connection(at.window.handle())?;
    let window = at.window.resolve(&peek)?;
    Ok(action(&peek, window.id, at.x, at.y)?)
}

fn dispatch(action: Action) -> Result<(), Failure> {
    match action {
        Action::List { handle, json } => list(handle.as_deref(), json),
        Action::Window { window, output } => {
            let peek = connection(window.handle())?;
            let window = window.resolve(&peek)?;
            capture(output, &format!("window-{}", window.id), |fd| {
                peek.capture_window(window.id, fd)
            })
        }
        Action::Screen { handle, output } => {
            let peek = connection(handle.as_deref())?;
            capture(output, "screen", |fd| peek.capture_screen(fd))
        }
        Action::Run {
            here,
            size,
            wait_window,
            timeout,
            log,
            command,
        } => run(
            here,
            &size,
            wait_window.then_some(timeout * 1000),
            log,
            &command,
        ),
        Action::Stop { handle } => Ok(connection(Some(&handle))?.stop(&handle)?),
        Action::Click { at, button, double } => act(&at, |peek, id, x, y| {
            peek.click(id, x, y, button.number(), if double { 2 } else { 1 })
        }),
        Action::Move { at } => act(&at, Peek::move_to),
        Action::Drag {
            at,
            to_x,
            to_y,
            button,
        } => act(&at, |peek, id, x, y| {
            peek.drag(id, x, y, to_x, to_y, button.number())
        }),
        Action::Scroll { at, dy, dx } => act(&at, |peek, id, x, y| peek.scroll(id, x, y, dx, dy)),
        Action::Type { window, text } => {
            let peek = connection(window.handle())?;
            Ok(peek.type_text(window.resolve(&peek)?.id, &text)?)
        }
        Action::Key { window, combo } => {
            let peek = connection(window.handle())?;
            Ok(peek.key(window.resolve(&peek)?.id, &combo)?)
        }
    }
}

fn main() -> ExitCode {
    let arguments: Vec<OsString> = std::env::args_os().collect();
    match arguments.get(1).and_then(|argument| argument.to_str()) {
        Some(STUB) => return start_program(&arguments[2..]),
        Some(offscreen::HOST) => return offscreen::host(&arguments[2..]),
        _ => {}
    }
    match dispatch(Cli::parse().command) {
        Ok(()) => ExitCode::SUCCESS,
        Err(Failure(message)) => {
            eprintln!("peek: {message}");
            ExitCode::FAILURE
        }
    }
}
