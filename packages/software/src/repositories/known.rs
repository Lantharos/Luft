use std::collections::BTreeMap;

use super::Draft;
use crate::http;

enum Definition {
    Address(&'static str),
    Text(&'static str),
}

/// A vendor's repository Luft can add by name, from the address of its file or, for vendors
/// that only publish the file's contents, from those.
pub struct Known {
    pub name: &'static str,
    file: &'static str,
    definition: Definition,
}

impl Known {
    pub fn draft(&self) -> Result<Draft, String> {
        let text = match self.definition {
            Definition::Address(url) => http::text(url)?,
            Definition::Text(text) => text.to_owned(),
        };
        Ok(Draft {
            file: self.file.to_owned(),
            text,
            keys: BTreeMap::new(),
        })
    }
}

pub const KNOWN: [Known; 5] = [
    Known {
        name: "1password",
        file: "1password",
        definition: Definition::Text(
            "[1password]\nname=1Password Stable Channel\n\
             baseurl=https://downloads.1password.com/linux/rpm/stable/$basearch\n\
             enabled=1\ngpgcheck=1\nrepo_gpgcheck=1\n\
             gpgkey=https://downloads.1password.com/linux/keys/1password.asc\n",
        ),
    },
    Known {
        name: "docker",
        file: "docker-ce",
        definition: Definition::Address("https://download.docker.com/linux/fedora/docker-ce.repo"),
    },
    Known {
        name: "google-chrome",
        file: "google-chrome",
        definition: Definition::Text(
            "[google-chrome]\nname=google-chrome\n\
             baseurl=https://dl.google.com/linux/chrome/rpm/stable/x86_64\n\
             enabled=1\ngpgcheck=1\n\
             gpgkey=https://dl.google.com/linux/linux_signing_key.pub\n",
        ),
    },
    Known {
        name: "vscode",
        file: "vscode",
        definition: Definition::Text(
            "[code]\nname=Visual Studio Code\n\
             baseurl=https://packages.microsoft.com/yumrepos/vscode\n\
             enabled=1\ngpgcheck=1\n\
             gpgkey=https://packages.microsoft.com/keys/microsoft.asc\n",
        ),
    },
    Known {
        name: "claude-desktop",
        file: "claude-desktop-unofficial",
        definition: Definition::Address(
            "https://pkg.claude-desktop-debian.dev/rpm/claude-desktop-unofficial.repo",
        ),
    },
];
