use std::str::FromStr;

use crate::service::{Failure, Peek, Window, windows};

const HANDLE_LENGTH: usize = 10;

#[derive(Debug, Clone)]
pub enum Target {
    Id(u64),
    Focused,
    Handle(String),
    App(String),
    Title(String),
}

pub fn is_handle(text: &str) -> bool {
    text.len() == HANDLE_LENGTH
        && text.starts_with(|character: char| character.is_ascii_lowercase())
        && text
            .chars()
            .all(|character| character.is_ascii_lowercase() || character.is_ascii_digit())
}

impl FromStr for Target {
    type Err = String;

    fn from_str(text: &str) -> Result<Self, String> {
        if let Ok(id) = text.parse() {
            return Ok(Self::Id(id));
        }
        match text.split_once(':') {
            Some(("app", id)) if !id.is_empty() => Ok(Self::App(id.into())),
            Some(("title", title)) if !title.is_empty() => Ok(Self::Title(title.into())),
            _ if text == "focused" => Ok(Self::Focused),
            _ if is_handle(text) => Ok(Self::Handle(text.into())),
            _ => {
                Err("use a handle from peek run, a window id, focused, app:ID or title:TEXT".into())
            }
        }
    }
}

fn find(peek: &Peek, missing: &str, accept: impl Fn(&Window) -> bool) -> Result<Window, Failure> {
    windows(peek, "")?
        .into_iter()
        .find(accept)
        .ok_or_else(|| Failure(format!("{missing}. peek list shows the open windows.")))
}

fn same_app(window: &Window, id: &str) -> bool {
    window.app.eq_ignore_ascii_case(id)
        || window
            .app
            .rsplit('.')
            .next()
            .is_some_and(|last| last.eq_ignore_ascii_case(id))
}

impl Target {
    pub fn handle(&self) -> Option<&str> {
        match self {
            Self::Handle(handle) => Some(handle),
            _ => None,
        }
    }

    pub fn resolve(&self, peek: &Peek) -> Result<Window, Failure> {
        match self {
            Self::Handle(handle) => Window::try_from(peek.handle_window(handle)?),
            Self::Id(id) => find(peek, &format!("No window has the id {id}"), |window| {
                window.id == *id
            }),
            Self::Focused => find(peek, "No window is focused", |window| window.focused),
            Self::App(id) => find(peek, &format!("No window belongs to {id}"), |window| {
                same_app(window, id)
            }),
            Self::Title(text) => find(
                peek,
                &format!("No window you can see has a title containing {text}"),
                |window| window.title.to_lowercase().contains(&text.to_lowercase()),
            ),
        }
    }
}
