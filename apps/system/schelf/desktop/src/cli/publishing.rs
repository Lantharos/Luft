use std::os::unix::process::CommandExt;
use std::process::Command;

use super::Exit;

const COMMANDS: [&str; 8] = [
    "init", "check", "publish", "status", "rollout", "login", "whoami", "logout",
];
const RUNNERS: [(&str, &[&str]); 2] = [("bunx", &[]), ("npx", &["--yes"])];
const PACKAGE: &str = "schelf@latest";

pub fn recognised(first: &str) -> bool {
    COMMANDS.contains(&first)
}

/// Publishing lives in the `schelf` package on npm, so the same word works from any terminal.
pub fn run(arguments: &[String]) -> i32 {
    for (runner, options) in RUNNERS {
        let error = Command::new(runner)
            .args(options)
            .arg(PACKAGE)
            .args(arguments)
            .exec();
        if error.kind() != std::io::ErrorKind::NotFound {
            eprintln!("Couldn't start {runner}: {error}");
            return Exit::Failed as i32;
        }
    }
    eprintln!("Publishing with Schelf needs Bun or Node, from bun.sh or nodejs.org.");
    Exit::Missing as i32
}
