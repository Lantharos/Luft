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
use zbus::Fd;

use cli::{Action, At, Cli};
use files::{Output, scratch_file};
use launch::{STUB, launch, start_program};
use service::{Failure, Peek, Window, connect_display, connect_session, windows};

async fn connection(handle: Option<&str>) -> Result<Peek, Failure> {
    match handle {
        Some(handle) if offscreen::is_running(handle) => {
            connect_display(&offscreen::bus(handle)?).await
        }
        _ => connect_session().await,
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

async fn list(handle: Option<&str>, json: bool) -> Result<(), Failure> {
    let windows = windows(&connection(handle).await?, handle.unwrap_or_default()).await?;
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

async fn capture(
    output: Option<PathBuf>,
    prefix: &str,
    shoot: impl AsyncFnOnce(Fd<'_>) -> zbus::Result<()>,
) -> Result<(), Failure> {
    let output = Output::create(output, prefix)?;
    let result = shoot(Fd::from(&output.file)).await.map_err(Failure::from);
    println!("{}", output.finish(result)?.display());
    Ok(())
}

async fn wait_for_window(handle: &str, timeout: u32) -> Result<Window, Failure> {
    connection(Some(handle))
        .await?
        .wait_for_window(handle, timeout)
        .await
        .map_err(Failure::from)
        .and_then(Window::try_from)
}

async fn run(
    here: bool,
    shared: bool,
    size: &str,
    wait: Option<u32>,
    log: Option<PathBuf>,
    command: &[OsString],
) -> Result<(), Failure> {
    let log = std::path::absolute(match log {
        Some(log) => log,
        None => scratch_file("run", "log")?,
    })?;
    let mut display = None;
    let handle = if here {
        launch(&connect_session().await?, command, &log).await?
    } else {
        let started = offscreen::start(command, size, shared, &log)?;
        display.insert(started).handle.clone()
    };
    let place = if here {
        "on the screen"
    } else {
        "on a hidden display"
    };
    eprintln!(
        "Started {} {place}. Its output goes to {}",
        command[0].to_string_lossy(),
        log.display()
    );
    if let Some(timeout) = wait {
        let window = wait_for_window(&handle, timeout)
            .await
            .map_err(|Failure(message)| {
                match display.as_mut().and_then(offscreen::Started::ending) {
                    Some(status) => Failure(format!(
                        "The program quit before opening a window ({status}). Its output is in {}",
                        log.display()
                    )),
                    None => Failure(format!(
                        "{message}. The program's output is in {}",
                        log.display()
                    )),
                }
            })?;
        eprintln!("{}", summary(&window));
    }
    println!("{handle}");
    Ok(())
}

async fn act(
    at: &At,
    action: impl AsyncFnOnce(&Peek, u64, f64, f64) -> zbus::Result<()>,
) -> Result<(), Failure> {
    let peek = connection(at.window.handle()).await?;
    let window = at.window.resolve(&peek).await?;
    Ok(action(&peek, window.id, at.x, at.y).await?)
}

async fn dispatch(action: Action) -> Result<(), Failure> {
    match action {
        Action::List { handle, json } => list(handle.as_deref(), json).await,
        Action::Window { window, output } => {
            let peek = connection(window.handle()).await?;
            let window = window.resolve(&peek).await?;
            capture(output, &format!("window-{}", window.id), async |fd| {
                peek.capture_window(window.id, fd).await
            })
            .await
        }
        Action::Screen { handle, output } => {
            let peek = connection(handle.as_deref()).await?;
            capture(output, "screen", async |fd| peek.capture_screen(fd).await).await
        }
        Action::Run {
            here,
            shared,
            size,
            wait_window,
            timeout,
            log,
            command,
        } => {
            run(
                here,
                shared,
                &size,
                wait_window.then_some(timeout * 1000),
                log,
                &command,
            )
            .await
        }
        Action::Stop { handle } => Ok(connection(Some(&handle)).await?.stop(&handle).await?),
        Action::Click { at, button, double } => {
            act(&at, async |peek, id, x, y| {
                peek.click(id, x, y, button.number(), if double { 2 } else { 1 })
                    .await
            })
            .await
        }
        Action::Move { at } => act(&at, async |peek, id, x, y| peek.move_to(id, x, y).await).await,
        Action::Drag {
            at,
            to_x,
            to_y,
            button,
        } => {
            act(&at, async |peek, id, x, y| {
                peek.drag(id, x, y, to_x, to_y, button.number()).await
            })
            .await
        }
        Action::Scroll { at, dy, dx } => {
            act(&at, async |peek, id, x, y| {
                peek.scroll(id, x, y, dx, dy).await
            })
            .await
        }
        Action::Type { window, text } => {
            let peek = connection(window.handle()).await?;
            Ok(peek
                .type_text(window.resolve(&peek).await?.id, &text)
                .await?)
        }
        Action::Key { window, combo } => {
            let peek = connection(window.handle()).await?;
            Ok(peek.key(window.resolve(&peek).await?.id, &combo).await?)
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
    match zbus::block_on(dispatch(Cli::parse().command)) {
        Ok(()) => ExitCode::SUCCESS,
        Err(Failure(message)) => {
            eprintln!("peek: {message}");
            ExitCode::FAILURE
        }
    }
}
