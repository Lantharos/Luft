use std::path::PathBuf;

use anyhow::{Context, Result, bail};
use luft_i18n::t;

use super::deployment::Deployment;
use crate::L10N;
use crate::system::command::Tool;

const HOMES: &str = "/var/home";

pub struct Account {
    pub name: String,
    pub full_name: String,
    pub password: String,
}

impl Account {
    pub fn check(&self) -> Result<()> {
        let mut letters = self.name.chars();
        let valid_name = self.name.len() <= 32
            && letters
                .next()
                .is_some_and(|first| first.is_ascii_lowercase() || first == '_')
            && letters
                .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '_' || c == '-');
        if !valid_name {
            bail!(t!(L10N, "installer-user-name-invalid"));
        }
        if self.full_name.contains([':', '\n', ',']) {
            bail!(t!(L10N, "installer-full-name-invalid"));
        }
        if self.password.is_empty() || self.password.contains('\n') {
            bail!(t!(L10N, "installer-password-missing"));
        }
        Ok(())
    }

    pub fn ids(&self, deployment: &Deployment) -> Result<String> {
        let passwd = std::fs::read_to_string(deployment.etc("passwd"))?;
        passwd
            .lines()
            .map(|line| line.split(':').collect::<Vec<_>>())
            .find(|fields| fields.first() == Some(&self.name.as_str()))
            .and_then(|fields| Some(format!("{}:{}", fields.get(2)?, fields.get(3)?)))
            .with_context(|| t!(L10N, "installer-account-not-saved"))
    }

    pub fn create(&self, deployment: &Deployment) -> Result<()> {
        self.check()?;
        let home = format!("{HOMES}/{}", self.name);
        Tool::new("useradd")
            .arg("--root")
            .arg(&deployment.root)
            .args(["--groups", "wheel", "--no-create-home", "--home-dir", &home])
            .args(["--comment", &self.full_name, &self.name])
            .run()?;
        Tool::new("chpasswd")
            .arg("--root")
            .arg(&deployment.root)
            .args(["--crypt-method", "YESCRYPT"])
            .input(format!("{}:{}\n", self.name, self.password).as_bytes())
            .run()?;
        let folder = deployment.var(home.trim_start_matches("/var/"));
        std::fs::create_dir_all(&folder)?;
        Tool::new("cp")
            .args(["--archive", "--no-target-directory"])
            .arg(deployment.etc("skel"))
            .arg(&folder)
            .run()?;
        Tool::new("chown")
            .args(["--recursive", &self.ids(deployment)?])
            .arg(&folder)
            .run()?;
        Tool::new("chmod").arg("0700").arg(&folder).run()?;
        deployment
            .relabel(&["passwd", "shadow", "group", "gshadow"].map(|name| deployment.etc(name)))?;
        deployment.relabel(&[PathBuf::from(&folder)])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn account(name: &str, full_name: &str) -> Account {
        Account {
            name: name.to_owned(),
            full_name: full_name.to_owned(),
            password: "correct horse".to_owned(),
        }
    }

    #[test]
    fn names_must_be_safe_for_passwd() {
        assert!(account("ada", "Ada Lovelace").check().is_ok());
        assert!(account("Ada", "Ada").check().is_err());
        assert!(account("ada:0", "Ada").check().is_err());
        assert!(account("-ada", "Ada").check().is_err());
        assert!(account("ada", "Ada:0:0").check().is_err());
    }
}
