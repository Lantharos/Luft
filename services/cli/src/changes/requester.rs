//! The program luft acts for: whatever started it, past any shells in between.

use std::path::Path;

const SHELLS: [&str; 9] = [
    "bash", "sh", "zsh", "fish", "dash", "env", "nohup", "timeout", "sudo",
];
const FURTHEST: usize = 8;

fn parent_of(pid: u32) -> Option<u32> {
    let stat = std::fs::read_to_string(format!("/proc/{pid}/stat")).ok()?;
    stat.rsplit_once(") ")?.1.split(' ').nth(1)?.parse().ok()
}

fn program_of(pid: u32) -> Option<String> {
    let program = std::fs::read_link(format!("/proc/{pid}/exe")).ok()?;
    Path::new(&program)
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
}

pub fn name() -> String {
    let mut pid = std::process::id();
    for _ in 0..FURTHEST {
        let Some(parent) = parent_of(pid).filter(|parent| *parent > 1) else {
            break;
        };
        pid = parent;
        match program_of(pid) {
            Some(program) if !SHELLS.contains(&program.as_str()) => return program,
            _ => {}
        }
    }
    "a terminal".to_owned()
}
