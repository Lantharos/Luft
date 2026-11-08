use std::collections::BTreeSet;
use std::io;

const STORE: &str = "/var/lib/luft-remote-login/choices";
const SSHD_CONFIG: &str = "/run/luft-remote-login/sshd.conf";
const ENABLED: &str = "enabled";
const PASSWORDS: &str = "password-login";
const ACCOUNT: &str = "account ";

#[derive(Default, PartialEq, Eq)]
pub struct Choices {
    pub enabled: bool,
    pub accounts: BTreeSet<String>,
    pub password_login: bool,
}

fn replace(path: &str, text: &str) -> io::Result<()> {
    let staged = format!("{path}.new");
    std::fs::write(&staged, text)?;
    std::fs::rename(staged, path)
}

impl Choices {
    pub fn load() -> io::Result<Self> {
        let text = match std::fs::read_to_string(STORE) {
            Err(error) if error.kind() == io::ErrorKind::NotFound => return Ok(Self::default()),
            read => read?,
        };
        let mut choices = Self::default();
        for line in text.lines() {
            match line {
                ENABLED => choices.enabled = true,
                PASSWORDS => choices.password_login = true,
                _ => {
                    if let Some(account) = line.strip_prefix(ACCOUNT) {
                        choices.accounts.insert(account.to_owned());
                    }
                }
            }
        }
        Ok(choices)
    }

    pub fn save(&self) -> io::Result<()> {
        let mut text = String::new();
        for (chosen, line) in [(self.enabled, ENABLED), (self.password_login, PASSWORDS)] {
            if chosen {
                text.push_str(line);
                text.push('\n');
            }
        }
        for account in &self.accounts {
            text.push_str(ACCOUNT);
            text.push_str(account);
            text.push('\n');
        }
        replace(STORE, &text)
    }

    fn sshd_config(&self) -> String {
        let mut text = if self.accounts.is_empty() {
            String::from("DenyUsers *")
        } else {
            String::from("AllowUsers")
        };
        for account in &self.accounts {
            text.push(' ');
            text.push_str(account);
        }
        text.push('\n');
        if self.password_login {
            text.push_str("PasswordAuthentication yes\n");
        }
        text
    }

    pub fn write_sshd_config(&self) -> io::Result<()> {
        replace(SSHD_CONFIG, &self.sshd_config())
    }
}
