use std::env;
use std::path::PathBuf;

use anyhow::{Context, Result};

pub struct Paths {
    pub runtime: PathBuf,
    pub accounts: PathBuf,
    pub data: PathBuf,
    pub cache: PathBuf,
    pub cloud: PathBuf,
}

impl Paths {
    pub fn from_environment() -> Result<Self> {
        let home = PathBuf::from(env::var_os("HOME").context("There's no home folder")?);
        let xdg = |variable: &str, fallback: &str| {
            env::var_os(variable)
                .map(PathBuf::from)
                .unwrap_or_else(|| home.join(fallback))
        };
        let runtime = env::var_os("XDG_RUNTIME_DIR").context("There's no runtime folder")?;
        Ok(Self {
            runtime: PathBuf::from(runtime).join("luft-accounts"),
            accounts: xdg("XDG_CONFIG_HOME", ".config").join("luft/accounts.json"),
            data: xdg("XDG_DATA_HOME", ".local/share").join("luft-accounts"),
            cache: xdg("XDG_CACHE_HOME", ".cache").join("luft-accounts"),
            cloud: home.join("Cloud"),
        })
    }

    pub fn socket(&self) -> PathBuf {
        self.runtime.join("rclone.sock")
    }

    pub fn kept(&self, account: &str) -> PathBuf {
        self.data.join("kept").join(account)
    }

    pub fn filters(&self, account: &str) -> PathBuf {
        self.data.join("filters").join(format!("{account}.txt"))
    }

    pub fn bisync(&self, account: &str) -> PathBuf {
        self.data.join("bisync").join(account)
    }
}
