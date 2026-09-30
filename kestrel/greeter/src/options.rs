use std::path::{PathBuf, absolute};

pub struct Options {
    pub unprivileged: bool,
    pub state_dir: PathBuf,
    pub greetd_config: PathBuf,
}

impl Options {
    pub fn parse(mut args: impl Iterator<Item = String>) -> Result<Self, String> {
        let mut options = Self {
            unprivileged: false,
            state_dir: PathBuf::from("/var/lib/kestrel-greeter"),
            greetd_config: PathBuf::from("/etc/greetd/config.toml"),
        };
        while let Some(arg) = args.next() {
            match arg.as_str() {
                "--unprivileged" => options.unprivileged = true,
                "--state-dir" => options.state_dir = path_after(&arg, args.next())?,
                "--greetd-config" => options.greetd_config = path_after(&arg, args.next())?,
                _ => return Err(format!("Unknown argument {arg}")),
            }
        }
        Ok(options)
    }
}

fn path_after(flag: &str, value: Option<String>) -> Result<PathBuf, String> {
    let value = value.ok_or_else(|| format!("{flag} needs a path"))?;
    absolute(value).map_err(|error| format!("{flag}: {error}"))
}
