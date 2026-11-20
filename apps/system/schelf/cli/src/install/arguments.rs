use luft_i18n::t;

use super::sources::Origin;
use crate::l10n::L10N;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Command {
    Install,
    Remove,
    Search,
    Update,
    List,
    Info,
    Trust,
    Untrust,
    Give,
    Take,
    Repo,
}

impl Command {
    const ALL: [Self; 11] = [
        Self::Install,
        Self::Remove,
        Self::Search,
        Self::Update,
        Self::List,
        Self::Info,
        Self::Trust,
        Self::Untrust,
        Self::Give,
        Self::Take,
        Self::Repo,
    ];

    pub fn word(self) -> &'static str {
        match self {
            Self::Install => "install",
            Self::Remove => "remove",
            Self::Search => "search",
            Self::Update => "update",
            Self::List => "list",
            Self::Info => "info",
            Self::Trust => "trust",
            Self::Untrust => "untrust",
            Self::Give => "give",
            Self::Take => "take",
            Self::Repo => "repo",
        }
    }

    pub fn named(word: &str) -> Option<Self> {
        match word {
            "add" => Some(Self::Install),
            word => Self::ALL.into_iter().find(|command| command.word() == word),
        }
    }

    pub fn syntax(self) -> &'static str {
        match self {
            Self::Install => "install NAME|FILE...  [--store|--flathub] [-y]",
            Self::Remove => "remove NAME...  [--store|--flathub|--appimage] [-y]",
            Self::Search => "search QUERY  [--store|--flathub]",
            Self::Update => "update [NAME...]  [--store|--flathub|--appimage]",
            Self::List => "list  [--store|--flathub|--appimage]",
            Self::Info => "info NAME  [--store|--flathub|--appimage]",
            Self::Trust => "trust NAME...  [-y]",
            Self::Untrust => "untrust NAME...",
            Self::Give => "give NAME [DRIVE|FOLDER]  [--read-only]",
            Self::Take => "take NAME DRIVE|FOLDER",
            Self::Repo => "repo add SOURCE  [-y]\n       repo remove NAME  [-y]\n       repo list",
        }
    }

    pub fn about(self) -> String {
        match self {
            Self::Install => t!(L10N, "cli-usage-install"),
            Self::Remove => t!(L10N, "cli-usage-remove"),
            Self::Search => t!(L10N, "cli-usage-search"),
            Self::Update => t!(L10N, "cli-usage-update"),
            Self::List => t!(L10N, "cli-usage-list"),
            Self::Info => t!(L10N, "cli-usage-info"),
            Self::Trust => t!(L10N, "cli-usage-trust"),
            Self::Untrust => t!(L10N, "cli-usage-untrust"),
            Self::Give => t!(L10N, "cli-usage-give"),
            Self::Take => t!(L10N, "cli-usage-take"),
            Self::Repo => t!(L10N, "cli-usage-repo"),
        }
    }
}

pub enum Request {
    Run(Arguments),
    Help(Command),
}

pub struct Arguments {
    pub command: Command,
    pub words: Vec<String>,
    pub only: Option<Origin>,
    pub yes: bool,
    pub read_only: bool,
}

pub fn recognised(first: &str) -> bool {
    Command::named(first).is_some()
}

pub fn parse(arguments: &[String]) -> Result<Request, String> {
    let (first, rest) = arguments
        .split_first()
        .ok_or_else(|| t!(L10N, "cli-usage-no-command"))?;
    let command = Command::named(first)
        .ok_or_else(|| t!(L10N, "cli-usage-unknown-command", command = first.as_str()))?;
    let mut parsed = Arguments {
        command,
        words: Vec::new(),
        only: None,
        yes: false,
        read_only: false,
    };
    let mut options = true;
    for argument in rest {
        match argument.as_str() {
            "--" if options => options = false,
            "-h" | "--help" if options => return Ok(Request::Help(command)),
            "-y" | "--yes" if options => parsed.yes = true,
            "--read-only" if options && command == Command::Give => parsed.read_only = true,
            option if options && option.starts_with('-') && option.len() > 1 => {
                let origin = Origin::ALL
                    .into_iter()
                    .filter(|origin| *origin != Origin::System)
                    .find(|origin| option.strip_prefix("--") == Some(origin.flag()))
                    .ok_or_else(|| {
                        t!(
                            L10N,
                            "cli-usage-unknown-option",
                            command = command.word(),
                            option = option
                        )
                    })?;
                if parsed.only.is_some_and(|only| only != origin) {
                    return Err(t!(L10N, "cli-usage-one-source"));
                }
                parsed.only = Some(origin);
            }
            word => parsed.words.push(word.to_owned()),
        }
    }
    let needs_words = matches!(
        command,
        Command::Install
            | Command::Remove
            | Command::Search
            | Command::Info
            | Command::Trust
            | Command::Untrust
            | Command::Give
            | Command::Take
            | Command::Repo
    );
    if needs_words && parsed.words.is_empty() {
        return Err(t!(L10N, "cli-usage-needs-name", command = command.word()));
    }
    if command == Command::Take && parsed.words.len() < 2 {
        return Err(t!(L10N, "cli-usage-take-needs-place"));
    }
    if command == Command::List && !parsed.words.is_empty() {
        return Err(t!(L10N, "cli-usage-list-takes-no-names"));
    }
    Ok(Request::Run(parsed))
}

pub fn usage(program: &str, command: Command) -> String {
    let usage = format!("{program} {}", command.syntax());
    format!(
        "{}\n\n{}\n",
        t!(L10N, "cli-usage", usage = usage),
        command.about()
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    fn run(arguments: &[&str]) -> Result<Arguments, String> {
        let arguments: Vec<String> = arguments.iter().map(|word| word.to_string()).collect();
        match parse(&arguments)? {
            Request::Run(arguments) => Ok(arguments),
            _ => Err("not a command".into()),
        }
    }

    #[test]
    fn options_go_anywhere_after_the_command() {
        let parsed = run(&["install", "ripgrep", "--flathub", "-y", "fd-find"]).unwrap();
        assert_eq!(parsed.command, Command::Install);
        assert_eq!(parsed.words, ["ripgrep", "fd-find"]);
        assert_eq!(parsed.only, Some(Origin::Flathub));
        assert!(parsed.yes);
    }

    #[test]
    fn a_double_dash_ends_the_options() {
        let parsed = run(&["search", "--", "--weird"]).unwrap();
        assert_eq!(parsed.words, ["--weird"]);
    }

    #[test]
    fn one_source_at_a_time() {
        assert!(run(&["list", "--flathub", "--store"]).is_err());
        assert!(run(&["list", "--flathub", "--flathub"]).is_ok());
    }

    #[test]
    fn names_are_needed_where_they_matter() {
        assert!(run(&["install"]).is_err());
        assert!(run(&["list", "gimp"]).is_err());
        assert!(run(&["update"]).is_ok());
    }

    #[test]
    fn commands_and_their_help_are_recognised() {
        assert!(recognised("info") && recognised("add"));
        assert!(!recognised("/home/me/App.AppImage"));
        assert!(matches!(
            parse(&["remove".into(), "--help".into()]),
            Ok(Request::Help(Command::Remove))
        ));
    }
}
