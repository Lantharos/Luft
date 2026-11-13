use std::collections::HashMap;

use crate::api::STORE_ORIGIN;

const VALUED: [&str; 23] = [
    "api",
    "token",
    "version",
    "notes",
    "config",
    "workflow",
    "id",
    "name",
    "publisher",
    "channel",
    "summary",
    "publisher-name",
    "namespace",
    "app",
    "role",
    "environment",
    "ref",
    "days",
    "description",
    "website",
    "slug",
    "logo",
    "method",
];

/// A flag's value: given after it, or there with nothing after it.
#[derive(Clone, Debug, PartialEq)]
pub enum Flag {
    Value(String),
    Set,
}

/// A command line as the npm CLI reads it.
#[derive(Debug, Default)]
pub struct Args {
    pub positionals: Vec<String>,
    pub flags: HashMap<String, Flag>,
}

impl Args {
    pub fn parse(argv: &[String]) -> Self {
        let mut args = Self::default();
        let mut index = 0;
        while index < argv.len() {
            let argument = &argv[index];
            index += 1;
            if argument == "--" {
                args.positionals.extend(argv[index..].iter().cloned());
                break;
            }
            if !argument.starts_with('-') || argument == "-" {
                args.positionals.push(argument.clone());
                continue;
            }
            let bare = argument
                .strip_prefix("--")
                .or_else(|| argument.strip_prefix('-'))
                .unwrap_or(argument);
            if let Some((name, inline)) = bare.split_once('=') {
                args.flags
                    .insert(name.to_owned(), Flag::Value(inline.to_owned()));
            } else if VALUED.contains(&bare)
                && argv.get(index).is_some_and(|next| !next.starts_with('-'))
            {
                args.flags
                    .insert(bare.to_owned(), Flag::Value(argv[index].clone()));
                index += 1;
            } else {
                args.flags.insert(bare.to_owned(), Flag::Set);
            }
        }
        args
    }

    pub fn has(&self, name: &str) -> bool {
        self.flags.contains_key(name)
    }

    pub fn flag(&self, name: &str) -> Option<&str> {
        match self.flags.get(name) {
            Some(Flag::Value(value)) => Some(value),
            _ => None,
        }
    }

    pub fn positional(&self, index: usize) -> Option<&str> {
        self.positionals.get(index).map(String::as_str)
    }

    pub fn shift(&mut self) -> Option<String> {
        (!self.positionals.is_empty()).then(|| self.positionals.remove(0))
    }

    /// The store to talk to: `--api`, `SCHELF_API` or schelf.store.
    pub fn api(&self) -> String {
        let origin = self
            .flag("api")
            .map(str::to_owned)
            .or_else(|| std::env::var("SCHELF_API").ok())
            .unwrap_or_else(|| STORE_ORIGIN.to_owned());
        origin.strip_suffix('/').unwrap_or(&origin).to_owned()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn flags_take_values_only_where_a_value_is_expected() {
        let argv: Vec<String> = [
            "publish",
            "--version",
            "1.0.0",
            "--verbose",
            "dist/a",
            "--api=http://localhost:8787",
            "dist/b",
        ]
        .map(String::from)
        .to_vec();
        let args = Args::parse(&argv);
        assert_eq!(args.positionals, ["publish", "dist/a", "dist/b"]);
        assert_eq!(args.flag("version"), Some("1.0.0"));
        assert_eq!(args.flag("api"), Some("http://localhost:8787"));
        assert_eq!(args.flags.get("verbose"), Some(&Flag::Set));
    }
}
