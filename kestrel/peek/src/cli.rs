use std::ffi::OsString;
use std::path::PathBuf;

use clap::{Parser, Subcommand, ValueEnum};

use crate::target::Target;

const ABOUT: &str = "See and use windows on Luft";

const DETAILS: &str = "\
How it works:
  h=$(peek run --wait-window -- cargo run)   start a program on its own hidden display
  peek window $h                             save a picture of it and print the PNG's path
  peek click $h 120 40                       click where the picture shows something
  peek type $h 'Hello'
  peek key $h ctrl+s
  peek stop $h                               close it, or it closes when the program quits

peek run prints a handle, the only thing it writes to standard output. The program runs on a
hidden display of its own, so nothing you do reaches the screen, pointer or keyboard of the person
at the computer, and nothing asks them first. Several programs can run at once, each with its own
handle. With --here the program opens on the person's screen instead; its windows can still be
used without asking.

WINDOW picks a window:
  HANDLE       the focused, or else the newest, window of a program started with peek run
  42           a window id that peek list shows; peek list HANDLE shows one program's windows
  focused      the focused window on the person's screen
  app:ID       the top-most window of an app, such as app:org.gnome.TextEditor
  title:TEXT   the top-most window whose title contains TEXT

Windows the person opened themselves need their permission: peek asks them once, or until your
program quits, and they can take it back from the privacy menu. If they decline, asking again
fails until your program quits. Nothing works while their screen is locked or a system prompt is
open.

X and Y are pixels of the window's picture, the PNG that peek window saves: 0 0 is its top left
corner. The picture includes the window's open menus and dialogs.";

#[derive(Parser)]
#[command(name = "peek", version, about = ABOUT, after_help = DETAILS)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Action,
}

#[derive(Subcommand)]
pub enum Action {
    /// List windows, top-most first, with what you may do with each
    List {
        /// Only the windows of the program started as HANDLE
        handle: Option<String>,
        /// Print JSON instead of a table
        #[arg(long)]
        json: bool,
    },
    /// Save a picture of a window as PNG and print its path
    Window {
        /// A handle from peek run, a window id, focused, app:ID or title:TEXT
        window: Target,
        /// Where to save it (default: a new file in the temporary folder)
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
    /// Save a picture of the whole screen, or of a hidden display, as PNG and print its path
    Screen {
        /// The hidden display of the program started as HANDLE
        handle: Option<String>,
        /// Where to save it (default: a new file in the temporary folder)
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
    /// Start a program on a hidden display and print its handle
    ///
    /// Returns once the program has started; with --wait-window, once its first window is open. The program keeps running after
    /// peek exits, and its output goes to a log file.
    Run {
        /// Open the program on the person's screen instead of a hidden display
        #[arg(long)]
        here: bool,
        /// Size of the hidden display
        #[arg(long, default_value = "1280x800", value_name = "WxH", value_parser = parse_size)]
        size: String,
        /// Wait until the program opens its first window
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
    /// Close a program started with peek run, and its hidden display
    Stop { handle: String },
    /// Click at a point of a window
    Click {
        #[command(flatten)]
        at: At,
        #[arg(long, value_enum, default_value_t = Button::Left)]
        button: Button,
        /// Click twice
        #[arg(long)]
        double: bool,
    },
    /// Move the pointer to a point of a window
    Move {
        #[command(flatten)]
        at: At,
    },
    /// Press at one point of a window, move to another and release there
    Drag {
        #[command(flatten)]
        at: At,
        /// Where to release, from the left edge
        to_x: f64,
        /// Where to release, from the top edge
        to_y: f64,
        #[arg(long, value_enum, default_value_t = Button::Left)]
        button: Button,
    },
    /// Scroll at a point of a window
    Scroll {
        #[command(flatten)]
        at: At,
        /// Steps down, or up when negative
        #[arg(long, default_value_t = 3, allow_negative_numbers = true)]
        dy: i32,
        /// Steps right, or left when negative
        #[arg(long, default_value_t = 0, allow_negative_numbers = true)]
        dx: i32,
    },
    /// Type text into a window
    Type {
        /// A handle from peek run, a window id, focused, app:ID or title:TEXT
        window: Target,
        /// The text; a newline presses enter
        text: String,
    },
    /// Press a key or a combination in a window, such as enter, ctrl+s or ctrl+shift+t
    Key {
        /// A handle from peek run, a window id, focused, app:ID or title:TEXT
        window: Target,
        /// Keys joined by +, such as enter, ctrl+s or ctrl+shift+t
        combo: String,
    },
}

#[derive(clap::Args)]
pub struct At {
    /// A handle from peek run, a window id, focused, app:ID or title:TEXT
    pub window: Target,
    /// Pixels from the left edge of the window's picture
    pub x: f64,
    /// Pixels from the top edge of the window's picture
    pub y: f64,
}

#[derive(Clone, Copy, ValueEnum)]
pub enum Button {
    Left,
    Middle,
    Right,
}

impl Button {
    pub fn number(self) -> u32 {
        match self {
            Self::Left => 1,
            Self::Middle => 2,
            Self::Right => 3,
        }
    }
}

fn parse_size(text: &str) -> Result<String, String> {
    match text
        .split_once('x')
        .map(|(width, height)| (width.parse::<u16>(), height.parse::<u16>()))
    {
        Some((Ok(width), Ok(height))) if width >= 320 && height >= 240 => Ok(text.into()),
        _ => Err("use WIDTHxHEIGHT, at least 320x240, such as 1280x800".into()),
    }
}
