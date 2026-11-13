use crate::error::{Error, Result};
use crate::project::Project;
use crate::schema::listing::SUMMARY_LIMIT;
use crate::schema::platforms::{APP_ID_MESSAGE, valid_app_id};
use crate::ui::USAGE;
use crate::ui::prompt::ask;
use crate::ui::style::interactive;

/// The id, name and summary an app is published with.
pub struct Identity {
    pub id: String,
    pub name: String,
    pub summary: String,
}

/// What the command line gave for the identity.
#[derive(Default)]
pub struct Given {
    pub id: Option<String>,
    pub name: Option<String>,
    pub summary: Option<String>,
}

fn settle(
    current: Option<String>,
    question: &str,
    suggestion: Option<&str>,
    missing: &str,
    option: &str,
) -> Result<String> {
    if let Some(current) = current.filter(|current| !current.is_empty()) {
        return Ok(current);
    }
    if !interactive() {
        return Err(Error::hinted(
            missing,
            format!("Pass --{option}, or add it to your AppStream file or Sabine.toml."),
            USAGE,
        ));
    }
    let answer = ask(question, suggestion);
    if answer.is_empty() {
        return Err(Error::failure(missing));
    }
    Ok(answer)
}

pub fn settle_identity(project: &Project, given: Given) -> Result<Identity> {
    let repository = project
        .repository
        .as_ref()
        .expect("init checked the remote");
    let name: String = repository
        .name
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || character == '_' || character == '-' {
                character
            } else {
                '_'
            }
        })
        .collect();
    let suggested = format!("io.github.{}.{name}", repository.owner);
    let id = settle(
        given.id.or_else(|| project.id.clone()),
        "App id",
        Some(&suggested),
        "The app has no id",
        "id",
    )?;
    if !valid_app_id(&id) {
        return Err(Error::failure(APP_ID_MESSAGE));
    }
    let name = settle(
        given.name.or_else(|| project.name.clone()),
        "Name people will see",
        Some(&repository.name),
        "The app has no name",
        "name",
    )?;
    let summary = settle(
        given.summary.or_else(|| project.summary.clone()),
        "One line that says what it does",
        None,
        "The app has no summary",
        "summary",
    )?;
    let length = summary.encode_utf16().count();
    if length > SUMMARY_LIMIT {
        return Err(Error::hinted(
            format!("The summary is {length} characters"),
            format!("Keep it to {SUMMARY_LIMIT} or fewer."),
            crate::ui::FAILED,
        ));
    }
    Ok(Identity { id, name, summary })
}
