use serde::Serialize;

use crate::schema::{ConfigIssue, describe_issue};

#[derive(Serialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Level {
    Error,
    Warning,
}

/// Something `schelf check` found, and what to do about it.
#[derive(Serialize, Clone, Debug)]
pub struct Issue {
    pub level: Level,
    #[serde(flatten)]
    pub issue: ConfigIssue,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hint: Option<String>,
}

impl Issue {
    pub fn new(level: Level, file: &str, key: Option<&str>, message: impl Into<String>) -> Self {
        Self {
            level,
            issue: ConfigIssue {
                file: file.to_owned(),
                key: key.map(str::to_owned),
                message: message.into(),
                allowed: None,
            },
            hint: None,
        }
    }

    pub fn hinted(mut self, hint: impl Into<String>) -> Self {
        self.hint = Some(hint.into());
        self
    }

    pub fn text(&self) -> String {
        describe_issue(&self.issue)
    }
}

pub fn errors_from(issues: Vec<ConfigIssue>) -> Vec<Issue> {
    issues
        .into_iter()
        .map(|issue| Issue {
            level: Level::Error,
            issue,
            hint: None,
        })
        .collect()
}
