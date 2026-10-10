use std::str::FromStr;

use crate::service::{Failure, Look, Window, windows};

#[derive(Debug, Clone)]
pub enum Target {
    Id(u64),
    Focused,
    Launched,
    App(String),
    Title(String),
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
            _ if text == "launched" => Ok(Self::Launched),
            _ => Err("use an id, focused, launched, app:ID or title:TEXT".into()),
        }
    }
}

impl Target {
    fn matches(&self, window: &Window) -> bool {
        match self {
            Self::Id(id) => window.id == *id,
            Self::Focused => window.focused,
            Self::Launched => window.launched,
            Self::App(id) => {
                window.app.eq_ignore_ascii_case(id)
                    || window
                        .app
                        .rsplit('.')
                        .next()
                        .is_some_and(|last| last.eq_ignore_ascii_case(id))
            }
            Self::Title(text) => window.title.to_lowercase().contains(&text.to_lowercase()),
        }
    }

    fn describe(&self) -> String {
        match self {
            Self::Id(id) => format!("No window has the id {id}"),
            Self::Focused => "No window is focused".into(),
            Self::Launched => "No program started with luft-look run has a window open".into(),
            Self::App(id) => format!("No window belongs to {id}"),
            Self::Title(text) => format!("No window you can see has a title containing {text}"),
        }
    }

    pub fn resolve(&self, look: &Look) -> Result<Window, Failure> {
        windows(look)?
            .into_iter()
            .find(|window| self.matches(window))
            .ok_or_else(|| {
                Failure(format!(
                    "{}. luft-look list shows the open windows.",
                    self.describe()
                ))
            })
    }
}
