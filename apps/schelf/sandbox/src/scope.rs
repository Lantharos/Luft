use std::os::unix::process::CommandExt;
use std::process::Command;

pub const SYSTEMD_RUN: &str = "systemd-run";

const TAKES_VALUE: [&str; 30] = [
    "-p",
    "--property",
    "-u",
    "--unit",
    "--description",
    "--slice",
    "--service-type",
    "--uid",
    "--gid",
    "--nice",
    "--working-directory",
    "-E",
    "--setenv",
    "-H",
    "--host",
    "-M",
    "--machine",
    "-C",
    "--capsule",
    "--path-property",
    "--socket-property",
    "--timer-property",
    "--on-active",
    "--on-boot",
    "--on-startup",
    "--on-unit-active",
    "--on-unit-inactive",
    "--on-calendar",
    "--on-timezone-change",
    "--on-clock-change",
];
const SETENV: [&str; 2] = ["-E", "--setenv"];

/// Stands in for systemd-run inside the sandbox, which can't reach your
/// service manager: starts the command right here, with the environment it
/// asked for.
pub fn run_here(arguments: &[String]) -> i32 {
    let mut command_start = arguments.len();
    let mut environment = Vec::new();
    let mut index = 0;
    while index < arguments.len() {
        let argument = arguments[index].as_str();
        if argument == "--" {
            command_start = index + 1;
            break;
        }
        if !argument.starts_with('-') {
            command_start = index;
            break;
        }
        let (name, value) = match argument.split_once('=') {
            Some((name, value)) => (name, Some(value.to_owned())),
            None if TAKES_VALUE.contains(&argument) => {
                index += 1;
                (argument, arguments.get(index).cloned())
            }
            None => (argument, None),
        };
        if SETENV.contains(&name)
            && let Some(assignment) = value
        {
            environment.push(assignment);
        }
        index += 1;
    }
    let Some((program, rest)) = arguments[command_start.min(arguments.len())..].split_first()
    else {
        eprintln!("systemd-run in a sandbox needs a command to run");
        return 1;
    };
    let mut command = Command::new(program);
    command.args(rest);
    for assignment in environment {
        if let Some((name, value)) = assignment.split_once('=') {
            command.env(name, value);
        }
    }
    eprintln!("{program} couldn't start: {}", command.exec());
    127
}
