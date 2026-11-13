//! Publishing apps, extensions and projects on schelf.store from the terminal:
//! the publisher side of the `schelf` command.

mod api;
mod args;
mod artifacts;
mod check;
mod commands;
mod error;
mod project;
mod schema;
mod setup;
pub mod tools;
mod ui;

use serde::Serialize;

use args::Args;
use commands::COMMANDS;
use error::{Error, config_message};
use schema::describe_issue;
use ui::output::{blank, emit, failure, field_in, line, note, print_json, title};
use ui::style::without_prompts;
use ui::{FAILED, SIGN_IN, USAGE};

const TRUSTING: [&str; 3] = ["list", "add", "remove"];

/// Whether `arguments`, without the program's name, are a publishing command.
pub fn recognised(arguments: &[String]) -> bool {
    let positionals = Args::parse(arguments).positionals;
    match positionals.first().map(String::as_str) {
        Some("trust") => positionals
            .get(1)
            .is_some_and(|verb| TRUSTING.contains(&verb.as_str())),
        Some(name) => COMMANDS.iter().any(|command| command.name == name),
        None => false,
    }
}

/// The publishing commands' usage and what each does, for the help.
pub fn commands() -> Vec<(&'static str, &'static str)> {
    COMMANDS
        .iter()
        .map(|command| (command.usage, command.about))
        .collect()
}

#[derive(Serialize)]
struct Explained<'a> {
    error: &'a str,
    hint: Option<&'a str>,
}

#[derive(Serialize)]
struct Refused<'a> {
    error: &'a str,
    issues: &'a [schema::ConfigIssue],
}

#[derive(Serialize)]
struct Failed<'a> {
    error: &'a str,
}

fn report(error: Error) -> i32 {
    match error {
        Error::Failure {
            message,
            hint,
            code,
        } => {
            failure(&message);
            if let Some(hint) = &hint {
                note(hint);
            }
            emit(&Explained {
                error: &message,
                hint: hint.as_deref(),
            });
            code
        }
        Error::Config(issues) => refused(&config_message(issues.len()), &issues),
        Error::Api(failure_) if !failure_.config.is_empty() => {
            refused(&failure_.message, &failure_.config)
        }
        Error::Api(api) => {
            let detail = api.detail();
            emit(&Failed { error: &detail });
            failure(&detail);
            if api.status == 401 { SIGN_IN } else { FAILED }
        }
        Error::Schema(issues) => {
            let message = issues
                .iter()
                .map(|(key, message)| format!("{key}: {message}"))
                .collect::<Vec<_>>()
                .join("\n");
            emit(&Failed { error: &message });
            for (key, message) in &issues {
                let place = if key.is_empty() { "schelf.toml" } else { key };
                failure(&format!("{place}: {message}"));
            }
            FAILED
        }
        Error::Other(message) => {
            emit(&Failed { error: &message });
            failure(&message);
            FAILED
        }
    }
}

fn refused(message: &str, issues: &[schema::ConfigIssue]) -> i32 {
    for issue in issues {
        failure(&describe_issue(issue));
    }
    emit(&Refused {
        error: message,
        issues,
    });
    FAILED
}

fn command_help(command: &commands::Command) -> i32 {
    let name = command.name;
    title(&format!("schelf {}", command.name));
    if command.verbs.is_empty() {
        line(&format!("schelf {}", command.usage));
        note(command.about);
    } else {
        let width = command
            .verbs
            .iter()
            .map(|verb| verb.usage.chars().count())
            .max()
            .unwrap_or(0)
            + 4
            + name.chars().count();
        for verb in command.verbs {
            field_in(&format!("{name} {}", verb.usage), verb.about, width);
        }
    }
    blank();
    0
}

/// Runs a publishing command, as the npm package's CLI does, and gives its exit code.
pub fn run(arguments: &[String]) -> i32 {
    let mut args = Args::parse(arguments);
    if args.has("json") {
        print_json();
        without_prompts();
    }
    if args.has("yes") {
        without_prompts();
    }
    let Some(name) = args.shift() else {
        return USAGE;
    };
    let Some(command) = COMMANDS.iter().find(|command| command.name == name) else {
        failure(&format!("There's no {name} command"));
        return USAGE;
    };
    if args.has("help") || args.has("h") {
        return command_help(command);
    }
    match (command.run)(&mut args) {
        Ok(code) => code,
        Err(error) => {
            let code = report(error);
            blank();
            code
        }
    }
}
