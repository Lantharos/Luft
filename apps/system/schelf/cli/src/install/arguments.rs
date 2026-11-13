use super::sources::Origin;

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
    Repo,
}

impl Command {
    const ALL: [Self; 9] = [
        Self::Install,
        Self::Remove,
        Self::Search,
        Self::Update,
        Self::List,
        Self::Info,
        Self::Trust,
        Self::Untrust,
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
            Self::Repo => "repo",
        }
    }

    pub fn named(word: &str) -> Option<Self> {
        match word {
            "add" => Some(Self::Install),
            word => Self::ALL.into_iter().find(|command| command.word() == word),
        }
    }

    pub fn usage(self) -> &'static str {
        match self {
            Self::Install => {
                "install NAME|FILE...  [--store|--flathub|--fedora|--system] [-y]\n\n\
                 Installs apps and extensions from schelf.store, apps from Flathub and\n\
                 Fedora, and command-line tools from Fedora into your account, or a .rpm,\n\
                 .AppImage, .flatpakref or .flatpakrepo file. A name schelf.store has comes\n\
                 from there, then from Flathub, then from Fedora; when that still leaves a\n\
                 choice, Schelf asks. Apps from schelf.store show what they can use first.\n\
                 You can write add instead of install.\n\n\
                 Fedora packages that bring a service or driver, such as Tailscale, Docker or\n\
                 libvirt, go into the system itself, where they start with the computer and\n\
                 are rebuilt with every update of Luft. --system puts any Fedora package\n\
                 there; --fedora keeps a command-line tool in your toolbox."
            }
            Self::Remove => {
                "remove NAME...  [--store|--flathub|--fedora|--appimage|--system] [-y]\n\n\
                 Removes apps, extensions, AppImages and command-line tools you installed, and system\n\
                 packages with everything they added."
            }
            Self::Search => {
                "search QUERY  [--store|--flathub|--fedora]\n\n\
                 Looks for apps and extensions on schelf.store, apps on Flathub and Fedora,\n\
                 command-line tools from Fedora, and through the AppImages you have."
            }
            Self::Update => {
                "update [NAME...]  [--store|--flathub|--fedora|--appimage]\n\n\
                 Updates apps, AppImages and command-line tools. Luft itself updates in\n\
                 Settings, under Updates."
            }
            Self::List => {
                "list  [--store|--flathub|--fedora|--appimage|--system]\n\n\
                 Shows what you installed, by where it came from, and the system packages."
            }
            Self::Info => {
                "info NAME  [--store|--flathub|--fedora|--appimage]\n\n\
                 Shows the details of an app or command-line tool, from every source\n\
                 that has it."
            }
            Self::Trust => {
                "trust NAME...  [-y]\n\n\
                 Gives Flatpak apps full access: they can see and change all your files,\n\
                 read the clipboard in the background, control other apps' windows and\n\
                 act like apps installed on the system. Only do this for apps you trust.\n\
                 It asks for an administrator's password and takes effect the next time\n\
                 the app opens."
            }
            Self::Untrust => {
                "untrust NAME...\n\n\
                 Takes full access away again and puts apps back in their sandbox."
            }
            Self::Repo => {
                "repo add SOURCE  [-y]\n\
                 \x20      repo remove NAME  [-y]\n\
                 \x20      repo list\n\n\
                 Adds a software source for system packages, such as a vendor's RPM\n\
                 repository: the address of its .repo file, a COPR project as\n\
                 copr:owner/project, or one Schelf knows by name: 1password, docker,\n\
                 google-chrome or vscode. Schelf shows the key its packages\n\
                 are signed with and asks before adding it. Packages from it then install\n\
                 with --system and update with Luft. Removing a source removes its packages."
            }
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
}

pub fn recognised(first: &str) -> bool {
    Command::named(first).is_some()
}

pub fn parse(arguments: &[String]) -> Result<Request, String> {
    let (first, rest) = arguments.split_first().ok_or("No command given.")?;
    let command =
        Command::named(first).ok_or_else(|| format!("There's no command called {first}."))?;
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
            "-h" | "--help" if options => return Ok(Request::Help(command)),
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
        Command::Install
            | Command::Remove
            | Command::Search
            | Command::Info
            | Command::Trust
            | Command::Untrust
            | Command::Repo
    );
    if needs_words && parsed.words.is_empty() {
        return Err(format!("{} needs a name.", command.word()));
    }
    if command == Command::List && !parsed.words.is_empty() {
        return Err("list doesn't take names.".into());
    }
    Ok(Request::Run(parsed))
}

pub fn usage(program: &str, command: Command) -> String {
    format!("Usage: {program} {}\n", command.usage())
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
    fn commands_and_their_help_are_recognised() {
        assert!(recognised("info") && recognised("add"));
        assert!(!recognised("/home/me/App.AppImage"));
        assert!(matches!(
            parse(&["remove".into(), "--help".into()]),
            Ok(Request::Help(Command::Remove))
        ));
    }
}
