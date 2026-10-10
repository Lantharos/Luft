mod files;
mod launch;
mod service;
mod target;

use std::ffi::OsString;
use std::path::PathBuf;
use std::process::ExitCode;

use clap::{Parser, Subcommand, ValueEnum};
use zbus::zvariant::Fd;

use files::Output;
use launch::{STUB, launch, start_program};
use service::{Failure, Look, Window, connect, windows};
use target::Target;

const ABOUT: &str = "See and use windows on Luft";

const DETAILS: &str = "\
WINDOW picks a window:
  42           the id that luft-look list shows
  focused      the focused window
  launched     the top-most window of a program started with luft-look run
  app:ID       the top-most window of an app, such as app:org.gnome.TextEditor
  title:TEXT   the top-most window whose title contains TEXT

X and Y are pixels of the window's picture, the PNG that luft-look window saves: 0 0 is its top left corner.

Windows of programs started with luft-look run can be seen and used right away. Anything else asks the person at the computer first, and they can take access back from the privacy menu in the panel. Nothing works while the screen is locked or a system prompt is open.

Examples:
  luft-look run --wait-window -- gnome-text-editor
  luft-look window launched
  luft-look click launched 120 40
  luft-look type launched 'Hello'
  luft-look key launched ctrl+s";

#[derive(Parser)]
#[command(name = "luft-look", version, about = ABOUT, after_help = DETAILS)]
struct Cli {
    #[command(subcommand)]
    command: Action,
}

#[derive(Subcommand)]
enum Action {
    /// List open windows, top-most first, with what you may do with each
    List {
        /// Print JSON instead of a table
        #[arg(long)]
        json: bool,
    },
    /// Save a picture of a window as PNG and print its path
    Window {
        /// The window: an id, focused, launched, app:ID or title:TEXT
        window: Target,
        /// Where to save it (default: a new file in the temporary folder)
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
    /// Save a picture of the whole screen as PNG and print its path
    Screen {
        /// Where to save it (default: a new file in the temporary folder)
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
    /// Start a program whose windows you can see and use without asking
    ///
    /// Returns as soon as the program has started. It keeps running after luft-look exits, and its output goes to a log file.
    Run {
        /// Wait until the program opens its first window, then print it
        #[arg(long)]
        wait_window: bool,
        /// How many seconds --wait-window waits
        #[arg(long, default_value_t = 30, value_name = "SECONDS")]
        timeout: u32,
        /// Where the program's output goes (default: a new file in the temporary folder)
        #[arg(long)]
        log: Option<PathBuf>,
        /// The program and its arguments
        #[arg(required = true, trailing_var_arg = true, allow_hyphen_values = true)]
        command: Vec<OsString>,
    },
    /// Click at a point of a window
    Click {
        /// The window: an id, focused, launched, app:ID or title:TEXT
        window: Target,
        /// Pixels from the left edge of the window's picture
        x: f64,
        /// Pixels from the top edge of the window's picture
        y: f64,
        #[arg(long, value_enum, default_value_t = Button::Left)]
        button: Button,
        /// Click twice
        #[arg(long)]
        double: bool,
    },
    /// Move the pointer to a point of a window
    Move {
        /// The window: an id, focused, launched, app:ID or title:TEXT
        window: Target,
        /// Pixels from the left edge of the window's picture
        x: f64,
        /// Pixels from the top edge of the window's picture
        y: f64,
    },
    /// Press at one point of a window, move to another and release there
    Drag {
        /// The window: an id, focused, launched, app:ID or title:TEXT
        window: Target,
        /// Pixels from the left edge of the window's picture
        x: f64,
        /// Pixels from the top edge of the window's picture
        y: f64,
        /// Where to release, from the left edge
        to_x: f64,
        /// Where to release, from the top edge
        to_y: f64,
        #[arg(long, value_enum, default_value_t = Button::Left)]
        button: Button,
    },
    /// Scroll at a point of a window
    Scroll {
        /// The window: an id, focused, launched, app:ID or title:TEXT
        window: Target,
        /// Pixels from the left edge of the window's picture
        x: f64,
        /// Pixels from the top edge of the window's picture
        y: f64,
        /// Steps down, or up when negative
        #[arg(long, default_value_t = 3, allow_negative_numbers = true)]
        dy: i32,
        /// Steps right, or left when negative
        #[arg(long, default_value_t = 0, allow_negative_numbers = true)]
        dx: i32,
    },
    /// Type text into a window
    Type {
        /// The window: an id, focused, launched, app:ID or title:TEXT
        window: Target,
        /// The text; a newline presses enter
        text: String,
    },
    /// Press a key or a combination in a window, such as enter, ctrl+s or ctrl+shift+t
    Key {
        /// The window: an id, focused, launched, app:ID or title:TEXT
        window: Target,
        /// Keys joined by +, such as enter, ctrl+s or ctrl+shift+t
        combo: String,
    },
}

#[derive(Clone, Copy, ValueEnum)]
enum Button {
    Left,
    Middle,
    Right,
}

impl Button {
    fn number(self) -> u32 {
        match self {
            Self::Left => 1,
            Self::Middle => 2,
            Self::Right => 3,
        }
    }
}

fn print_window(window: &Window) {
    let size = format!("{}x{}", window.width, window.height);
    let state = if window.focused { "focused" } else { "-" };
    let title = if window.access == "ask" {
        "(hidden until you may see it)"
    } else {
        &window.title
    };
    println!(
        "{:<8} {:<6} {:<11} {:<8} {:<36} {}",
        window.id, window.access, size, state, window.app, title
    );
}

fn list(look: &Look, json: bool) -> Result<(), Failure> {
    let windows = windows(look)?;
    if json {
        let entries: Vec<_> = windows
            .iter()
            .map(|window| {
                serde_json::json!({
                    "id": window.id, "app": window.app, "name": window.name, "title": window.title,
                    "width": window.width, "height": window.height, "scale": window.scale,
                    "focused": window.focused, "access": window.access, "launched": window.launched,
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
    windows.iter().for_each(print_window);
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

fn run(action: Action) -> Result<(), Failure> {
    let look = connect()?;
    match action {
        Action::List { json } => list(&look, json),
        Action::Window { window, output } => {
            let window = window.resolve(&look)?;
            capture(output, &format!("window-{}", window.id), |fd| {
                look.capture_window(window.id, fd)
            })
        }
        Action::Screen { output } => capture(output, "screen", |fd| look.capture_screen(fd)),
        Action::Run {
            wait_window,
            timeout,
            log,
            command,
        } => {
            let launched = launch(&look, &command, log, wait_window.then_some(timeout * 1000))?;
            println!("Started process {} in {}", launched.pid, launched.unit);
            println!("Output goes to {}", launched.log.display());
            if let Some(window) = launched.window {
                print_window(&window);
            }
            Ok(())
        }
        Action::Click {
            window,
            x,
            y,
            button,
            double,
        } => Ok(look.click(
            window.resolve(&look)?.id,
            x,
            y,
            button.number(),
            if double { 2 } else { 1 },
        )?),
        Action::Move { window, x, y } => Ok(look.move_to(window.resolve(&look)?.id, x, y)?),
        Action::Drag {
            window,
            x,
            y,
            to_x,
            to_y,
            button,
        } => Ok(look.drag(window.resolve(&look)?.id, x, y, to_x, to_y, button.number())?),
        Action::Scroll {
            window,
            x,
            y,
            dy,
            dx,
        } => Ok(look.scroll(window.resolve(&look)?.id, x, y, dx, dy)?),
        Action::Type { window, text } => Ok(look.type_text(window.resolve(&look)?.id, &text)?),
        Action::Key { window, combo } => Ok(look.key(window.resolve(&look)?.id, &combo)?),
    }
}

fn main() -> ExitCode {
    let arguments: Vec<OsString> = std::env::args_os().collect();
    if arguments.get(1).is_some_and(|argument| argument == STUB) {
        return start_program(&arguments[2..]);
    }
    match run(Cli::parse().command) {
        Ok(()) => ExitCode::SUCCESS,
        Err(Failure(message)) => {
            eprintln!("luft-look: {message}");
            ExitCode::FAILURE
        }
    }
}
