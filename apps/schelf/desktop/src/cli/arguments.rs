use super::sources::Origin;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Command {
    Install,
    Remove,
    Search,
    Update,
    List,
    Info,
}

impl Command {
    const ALL: [Self; 6] = [
        Self::Install,
        Self::Remove,
        Self::Search,
        Self::Update,
        Self::List,
        Self::Info,
    ];

    pub fn word(self) -> &'static str {
        match self {
            Self::Install => "install",
            Self::Remove => "remove",
            Self::Search => "search",
            Self::Update => "update",
            Self::List => "list",
            Self::Info => "info",
        }
    }

    fn named(word: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|command| command.word() == word)
    }

    pub fn usage(self) -> &'static str {
        match self {
            Self::Install => {
                "install NAME|FILE...  [--flathub|--fedora] [-y]\n\n\
                 Installs apps from Flathub and command-line tools from Fedora into your\n\
                 account, or a .rpm, .AppImage, .flatpakref or .flatpakrepo file. A name\n\
                 found in both is a desktop app from Flathub or a command-line tool from\n\
                 Fedora; when that still leaves a choice, Schelf asks."
            }
            Self::Remove => {
                "remove NAME...  [--flathub|--fedora|--appimage] [-y]\n\n\
                 Removes apps, AppImages and command-line tools you installed."
            }
            Self::Search => {
                "search QUERY  [--flathub|--fedora]\n\n\
                 Looks for apps on Flathub and command-line tools from Fedora, and\n\
                 through the AppImages you have."
            }
            Self::Update => {
                "update [NAME...]  [--flathub|--fedora|--appimage]\n\n\
                 Updates apps, AppImages and command-line tools. Luft itself updates in\n\
                 Settings, under Updates."
            }
            Self::List => {
                "list  [--flathub|--fedora|--appimage]\n\n\
                 Shows what you installed, by where it came from."
            }
            Self::Info => {
                "info NAME  [--flathub|--fedora|--appimage]\n\n\
                 Shows the details of an app or command-line tool, from every source\n\
                 that has it."
            }
        }
    }
}

pub enum Request {
    Run(Arguments),
    Help(Option<Command>),
    Version,
}

pub struct Arguments {
    pub command: Command,
    pub words: Vec<String>,
    pub only: Option<Origin>,
    pub yes: bool,
}

pub fn recognised(first: &str) -> bool {
    Command::named(first).is_some() || matches!(first, "help" | "-h" | "--help" | "--version")
}

pub fn parse(arguments: &[String]) -> Result<Request, String> {
    let (first, rest) = arguments.split_first().ok_or("No command given.")?;
    let command = match first.as_str() {
        "--version" => return Ok(Request::Version),
        "help" | "-h" | "--help" => {
            return Ok(Request::Help(
                rest.first().and_then(|word| Command::named(word)),
            ));
        }
        word => Command::named(word).ok_or_else(|| format!("There's no command called {word}."))?,
    };
    let mut parsed = Arguments {
        command,
        words: Vec::new(),
        only: None,
        yes: false,
    };
    let mut options = true;
    for argument in rest {
        match argument.as_str() {
            "--" if options => options = false,
            "-h" | "--help" if options => return Ok(Request::Help(Some(command))),
            "-y" | "--yes" if options => parsed.yes = true,
            option if options && option.starts_with('-') && option.len() > 1 => {
                let origin = Origin::ALL
                    .into_iter()
                    .find(|origin| option.strip_prefix("--") == Some(origin.flag()))
                    .ok_or_else(|| format!("{} doesn't know {option}.", command.word()))?;
                if parsed.only.is_some_and(|only| only != origin) {
                    return Err("Choose one source at a time.".into());
                }
                parsed.only = Some(origin);
            }
            word => parsed.words.push(word.to_owned()),
        }
    }
    let needs_words = matches!(
        command,
        Command::Install | Command::Remove | Command::Search | Command::Info
    );
    if needs_words && parsed.words.is_empty() {
        return Err(format!("{} needs a name.", command.word()));
    }
    if command == Command::List && !parsed.words.is_empty() {
        return Err("list doesn't take names.".into());
    }
    Ok(Request::Run(parsed))
}

pub fn help(program: &str, command: Option<Command>) -> String {
    if let Some(command) = command {
        return format!("Usage: {program} {}\n", command.usage());
    }
    format!(
        "Schelf installs apps and command-line tools into your account.\n\n\
         Usage: {program} COMMAND [OPTIONS]\n\n\
         Commands:\n\
         \x20 install NAME|FILE...  Install apps, tools or a file\n\
         \x20 remove NAME...        Remove something you installed\n\
         \x20 search QUERY          Look for apps and tools everywhere\n\
         \x20 update [NAME...]      Update apps, AppImages and tools\n\
         \x20 list                  Show what you installed\n\
         \x20 info NAME             Show details\n\n\
         Options:\n\
         \x20 --flathub, --fedora, --appimage  Use only this source\n\
         \x20 -y, --yes             Go ahead without asking\n\
         \x20 -h, --help            Show help, also for a command\n\
         \x20 --version             Show the version\n\n\
         Luft itself updates in Settings, under Updates.\n"
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
        let parsed = run(&["install", "ripgrep", "--fedora", "-y", "fd-find"]).unwrap();
        assert_eq!(parsed.command, Command::Install);
        assert_eq!(parsed.words, ["ripgrep", "fd-find"]);
        assert_eq!(parsed.only, Some(Origin::Fedora));
        assert!(parsed.yes);
    }

    #[test]
    fn a_double_dash_ends_the_options() {
        let parsed = run(&["search", "--", "--weird"]).unwrap();
        assert_eq!(parsed.words, ["--weird"]);
    }

    #[test]
    fn one_source_at_a_time() {
        assert!(run(&["list", "--flathub", "--fedora"]).is_err());
        assert!(run(&["list", "--flathub", "--flathub"]).is_ok());
    }

    #[test]
    fn names_are_needed_where_they_matter() {
        assert!(run(&["install"]).is_err());
        assert!(run(&["list", "gimp"]).is_err());
        assert!(run(&["update"]).is_ok());
    }

    #[test]
    fn help_and_version_are_recognised() {
        assert!(recognised("--help") && recognised("--version") && recognised("info"));
        assert!(!recognised("/home/me/App.AppImage"));
        assert!(matches!(
            parse(&["remove".into(), "--help".into()]),
            Ok(Request::Help(Some(Command::Remove)))
        ));
    }
}
