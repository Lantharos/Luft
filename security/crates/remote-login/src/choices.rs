use std::collections::BTreeSet;
use std::io;

const PATH: &str = "/etc/ssh/sshd_config.d/10-luft-remote-login.conf";
const HEADER: &str = "# Kept by Settings, under Security → Remote login\n";
const ALLOW: &str = "AllowUsers";
const NOBODY: &str = "DenyUsers *";
const PASSWORDS: &str = "PasswordAuthentication yes";

#[derive(Default, PartialEq, Eq)]
pub struct Choices {
    pub accounts: BTreeSet<String>,
    pub password_login: bool,
}

impl Choices {
    pub fn load() -> io::Result<Self> {
        let text = match std::fs::read_to_string(PATH) {
            Err(error) if error.kind() == io::ErrorKind::NotFound => return Ok(Self::default()),
            read => read?,
        };
        let mut choices = Self::default();
        for line in text.lines() {
            if let Some(accounts) = line.strip_prefix(ALLOW) {
                choices
                    .accounts
                    .extend(accounts.split_whitespace().map(str::to_owned));
            } else if line == PASSWORDS {
                choices.password_login = true;
            }
        }
        Ok(choices)
    }

    pub fn save(&self) -> io::Result<()> {
        let mut text = String::from(HEADER);
        if self.accounts.is_empty() {
            text.push_str(NOBODY);
        } else {
            text.push_str(ALLOW);
            for account in &self.accounts {
                text.push(' ');
                text.push_str(account);
            }
        }
        text.push('\n');
        if self.password_login {
            text.push_str(PASSWORDS);
            text.push('\n');
        }
        let staged = format!("{PATH}.new");
        std::fs::write(&staged, text)?;
        std::fs::rename(staged, PATH)
    }
}
