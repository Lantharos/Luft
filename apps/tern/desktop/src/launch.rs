use std::path::Path;

use serde::Serialize;

const DIRECTORY_FLAG: &str = "--working-directory";
const COMMAND_FLAGS: [&str; 3] = ["-e", "-x", "--"];

#[derive(Clone, Default, Serialize)]
pub struct LaunchRequest {
    pub directory: Option<String>,
    pub command: Option<Vec<String>>,
}

impl LaunchRequest {
    pub fn current_process() -> Self {
        let args: Vec<String> = std::env::args().skip(1).collect();
        let cwd = std::env::current_dir().unwrap_or_else(|_| "/".into());
        Self::parse(&args, &cwd)
    }

    pub fn parse(args: &[String], cwd: &Path) -> Self {
        let mut request = Self::default();
        let mut remaining = args.iter();
        while let Some(arg) = remaining.next() {
            if COMMAND_FLAGS.contains(&arg.as_str()) {
                let command: Vec<String> = remaining.cloned().collect();
                request.command = (!command.is_empty()).then_some(command);
                break;
            }
            let directory = match arg.strip_prefix(DIRECTORY_FLAG) {
                Some("") => remaining.next().map(String::as_str),
                Some(value) => value.strip_prefix('='),
                None => None,
            };
            if let Some(directory) = directory {
                let path = cwd.join(directory);
                request.directory = Some(path.to_string_lossy().into_owned());
            }
        }
        request
    }
}
