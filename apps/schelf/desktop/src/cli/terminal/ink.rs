use std::fmt::Display;

const BOLD: &str = "1";
const DIM: &str = "2";
const RED: &str = "31";
const GREEN: &str = "32";

#[derive(Clone, Copy)]
pub struct Ink {
    color: bool,
}

fn wanted(terminal: bool) -> bool {
    terminal
        && std::env::var_os("NO_COLOR").is_none_or(|value| value.is_empty())
        && std::env::var("TERM").is_ok_and(|term| term != "dumb")
}

impl Ink {
    pub fn stdout() -> Self {
        Self {
            color: wanted(super::stdout_is_terminal()),
        }
    }

    pub fn stderr() -> Self {
        Self {
            color: wanted(super::stderr_is_terminal()),
        }
    }

    fn paint(self, code: &str, text: impl Display) -> String {
        if self.color {
            format!("\x1b[{code}m{text}\x1b[0m")
        } else {
            text.to_string()
        }
    }

    pub fn bold(self, text: impl Display) -> String {
        self.paint(BOLD, text)
    }

    pub fn dim(self, text: impl Display) -> String {
        self.paint(DIM, text)
    }

    pub fn done(self, text: impl Display) -> String {
        self.paint(&format!("{BOLD};{GREEN}"), text)
    }

    pub fn failed(self, text: impl Display) -> String {
        self.paint(&format!("{BOLD};{RED}"), text)
    }
}
