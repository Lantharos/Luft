mod catalog;
mod commands;
mod container;
mod installed;
mod transaction;

use std::process::Command;

use crate::progress::Stage;
use crate::task::Task;

pub use catalog::{Available, available};
pub use container::name as container;
pub use installed::{Tool, installed};

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
    tools.retain(|existing| existing.package != package);
    tools.push(tool);
    tools.sort_by(|a, b| a.package.cmp(&b.package));
    installed::save(&tools)
}

pub fn install(package: &str, task: Task) -> Result<(), String> {
    ready(task)?;
    transaction::run(&mut dnf(&["install", package]), Stage::Installing, task)?;
    record(package)
}

pub fn install_file(path: &str, task: Task) -> Result<(), String> {
    let package = String::from_utf8_lossy(
        &Command::new("rpm")
            .args(["--query", "--package", "--queryformat", "%{NAME}", path])
            .output()
            .map_err(|error| error.to_string())?
            .stdout,
    )
    .into_owned();
    if package.is_empty() {
        return Err("This package file is damaged or isn't meant for this computer.".into());
    }
    ready(task)?;
    transaction::run(&mut dnf(&["install", path]), Stage::Installing, task)?;
    record(&package)
}

pub fn remove(package: &str, task: Task) -> Result<(), String> {
    let removed = transaction::run(&mut dnf(&["remove", package]), Stage::Removing, task);
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
