use std::env;
use std::os::unix::fs::PermissionsExt;
use std::path::Path;

const DEFAULT_PATH: &str = "/usr/local/bin:/usr/bin:/bin";

pub fn exists(program: &str) -> bool {
    if program.contains('/') {
        return is_executable(Path::new(program));
    }
    let search = env::var_os("PATH").unwrap_or_else(|| DEFAULT_PATH.into());
    env::split_paths(&search).any(|directory| is_executable(&directory.join(program)))
}

fn is_executable(path: &Path) -> bool {
    path.metadata()
        .is_ok_and(|metadata| metadata.is_file() && metadata.permissions().mode() & 0o111 != 0)
}

pub fn without_field_codes(exec: &str) -> String {
    exec.split_whitespace()
        .filter(|argument| !is_field_code(argument))
        .map(|argument| argument.replace("%%", "%"))
        .collect::<Vec<_>>()
        .join(" ")
}

fn is_field_code(argument: &str) -> bool {
    let mut characters = argument.chars();
    characters.next() == Some('%')
        && characters
            .next()
            .is_some_and(|code| code.is_ascii_alphabetic())
        && characters.next().is_none()
}
