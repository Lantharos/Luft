use std::path::{PathBuf, absolute};

pub struct Options {
    pub unprivileged: bool,
    pub state_dir: PathBuf,
    pub write_greetd_config: Option<PathBuf>,
}

impl Options {
    pub fn parse(mut args: impl Iterator<Item = String>) -> Result<Self, String> {
        let mut options = Self {
            unprivileged: false,
            state_dir: PathBuf::from("/var/lib/kestrel-greeter"),
            write_greetd_config: None,
        };
        while let Some(arg) = args.next() {
            match arg.as_str() {
                "--unprivileged" => options.unprivileged = true,
                "--state-dir" => options.state_dir = path_after(&arg, args.next())?,
                "--write-greetd-config" => {
                    options.write_greetd_config = Some(path_after(&arg, args.next())?)
                }
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
