#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Manager {
    Dnf,
    Apt,
    Pacman,
    Zypper,
}

impl Manager {
    pub fn named(program: &str) -> Option<Self> {
        match program {
            "dnf" | "dnf5" | "yum" => Some(Self::Dnf),
            "apt" | "apt-get" => Some(Self::Apt),
            "pacman" => Some(Self::Pacman),
            "zypper" => Some(Self::Zypper),
            _ => None,
        }
    }
}

const YES: [&str; 8] = [
    "-y",
    "--assumeyes",
    "--yes",
    "--assume-yes",
    "--noconfirm",
    "-n",
    "--non-interactive",
    "--no-confirm",
];

const WITH_VALUE: [&str; 19] = [
    "--setopt",
    "--setvar",
    "--repo",
    "--repoid",
    "--enablerepo",
    "--disablerepo",
    "--enable-repo",
    "--disable-repo",
    "--from-repo",
    "-x",
    "--exclude",
    "--releasever",
    "-c",
    "--config",
    "--forcearch",
    "--destdir",
    "--comment",
    "-o",
    "-t",
];

#[derive(Debug, Default, PartialEq, Eq)]
pub struct Asked {
    pub action: Option<String>,
    pub words: Vec<String>,
    pub yes: bool,
    pub installroot: bool,
    pub repo_file: Option<String>,
}

pub fn read(manager: Manager, given: &[String]) -> Asked {
    let mut asked = Asked::default();
    let mut rest = given.iter();
    while let Some(word) = rest.next() {
        if let Some(file) = word.strip_prefix("--from-repofile=") {
            asked.repo_file = Some(file.to_owned());
        } else if word == "--from-repofile" {
            asked.repo_file = rest.next().cloned();
        } else if word.starts_with("--installroot") {
            asked.installroot = true;
        } else if word.starts_with('-') {
            asked.yes |= YES.contains(&word.as_str());
            let pacman_action = manager == Manager::Pacman
                && asked.action.is_none()
                && (word.starts_with("-S") || word.starts_with("-R"));
            if pacman_action {
                asked.action = Some(word.clone());
            }
            if WITH_VALUE.contains(&word.as_str()) {
                rest.next();
            }
        } else if asked.action.is_none() {
            asked.action = Some(word.clone());
        } else {
            asked.words.push(word.clone());
        }
    }
    asked
}

#[cfg(test)]
mod tests {
    use super::*;

    fn words(given: &[&str]) -> Vec<String> {
        given.iter().map(|word| word.to_string()).collect()
    }

    #[test]
    fn options_with_values_are_skipped() {
        let asked = read(
            Manager::Dnf,
            &words(&[
                "--setopt", "x=1", "install", "-y", "gcc", "--repo", "fedora", "gh",
            ]),
        );
        assert_eq!(asked.action.as_deref(), Some("install"));
        assert_eq!(asked.words, ["gcc", "gh"]);
        assert!(asked.yes);
    }

    #[test]
    fn pacman_takes_its_action_from_an_option() {
        let asked = read(Manager::Pacman, &words(&["-Syu", "--noconfirm", "htop"]));
        assert_eq!(asked.action.as_deref(), Some("-Syu"));
        assert_eq!(asked.words, ["htop"]);
        assert!(asked.yes);
    }

    #[test]
    fn a_repo_file_is_read_from_either_spelling() {
        let joined = read(
            Manager::Dnf,
            &words(&[
                "config-manager",
                "addrepo",
                "--from-repofile=https://a/b.repo",
            ]),
        );
        let apart = read(
            Manager::Dnf,
            &words(&[
                "config-manager",
                "addrepo",
                "--from-repofile",
                "https://a/b.repo",
            ]),
        );
        assert_eq!(joined.repo_file.as_deref(), Some("https://a/b.repo"));
        assert_eq!(apart.repo_file, joined.repo_file);
        assert_eq!(apart.words, ["addrepo"]);
    }
}
