mod catalog;
mod commands;
mod container;
mod installed;
mod pull;
mod transaction;
mod updates;

use std::process::Command;

use crate::operand::operand;
use crate::progress::Stage;
use crate::task::Task;

pub use catalog::{Available, Repositories, available};
pub use container::name as container;
pub use installed::{Tool, installed};
pub use updates::{Update, updates};

const NOTHING_TO_REMOVE: &str = "No packages to remove";

fn dnf(arguments: &[&str]) -> Command {
    let mut program = vec!["sudo", "dnf", "--assumeyes"];
    program.extend_from_slice(arguments);
    container::run(&program)
}

fn ready(task: Task) -> Result<(), String> {
    if container::exists() {
        Ok(())
    } else {
        container::create(task)
    }
}

fn record(package: &str) -> Result<(), String> {
    let mut tools = installed::recorded();
    let owned: Vec<String> = tools
        .iter()
        .flat_map(|tool| tool.commands.iter().cloned())
        .collect();
    let programs = commands::programs(&container::query(&["rpm", "--query", "--list", package])?);
    let exported = commands::export(&container::name(), &programs, &owned);
    let tool = installed::describe(package, exported)?;
    if let Some(previous) = tools.iter().find(|existing| existing.package == package) {
        let dropped: Vec<String> = previous
            .commands
            .iter()
            .filter(|command| !tool.commands.contains(command))
            .cloned()
            .collect();
        commands::unexport(&dropped);
    }
    tools.retain(|existing| existing.package != package);
    tools.push(tool);
    tools.sort_by(|a, b| a.package.cmp(&b.package));
    installed::save(&tools)
}

pub fn install(package: &str, task: Task) -> Result<(), String> {
    ready(task)?;
    transaction::run(
        &mut dnf(&["install", "--", operand(package)?]),
        Stage::Installing,
        task,
    )?;
    record(package)
}

pub fn install_file(path: &str, task: Task) -> Result<(), String> {
    let package = String::from_utf8_lossy(
        &Command::new("rpm")
            .args([
                "--query",
                "--package",
                "--queryformat",
                "%{NAME}",
                "--",
                path,
            ])
            .output()
            .map_err(|error| error.to_string())?
            .stdout,
    )
    .into_owned();
    if package.is_empty() {
        return Err("This package file is damaged or isn't meant for this computer.".into());
    }
    ready(task)?;
    transaction::run(&mut dnf(&["install", "--", path]), Stage::Installing, task)?;
    record(&package)
}

pub fn update(packages: &[String], task: Task) -> Result<(), String> {
    let mut arguments = vec!["upgrade", "--"];
    for package in packages {
        arguments.push(operand(package)?);
    }
    transaction::run(&mut dnf(&arguments), Stage::Installing, task)?;
    packages.iter().try_for_each(|package| record(package))
}

pub fn retire_shadowed() -> Result<(), String> {
    let mut tools = installed::recorded();
    let mut retired = false;
    tools.retain_mut(|tool| {
        let (shadowed, kept): (Vec<String>, Vec<String>) = tool
            .commands
            .drain(..)
            .partition(|command| commands::on_system(command));
        tool.commands = kept;
        if shadowed.is_empty() {
            return true;
        }
        commands::unexport(&shadowed);
        retired = true;
        !tool.commands.is_empty()
    });
    if retired {
        installed::save(&tools)
    } else {
        Ok(())
    }
}

pub fn remove(package: &str, task: Task) -> Result<(), String> {
    let removed = transaction::run(
        &mut dnf(&["remove", "--", operand(package)?]),
        Stage::Removing,
        task,
    );
    if let Err(error) = removed
        && !error.contains(NOTHING_TO_REMOVE)
    {
        return Err(error);
    }
    let mut tools = installed::recorded();
    if let Some(tool) = tools.iter().find(|tool| tool.package == package) {
        commands::unexport(&tool.commands);
    }
    tools.retain(|tool| tool.package != package);
    installed::save(&tools)
}
