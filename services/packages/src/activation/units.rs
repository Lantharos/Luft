use std::collections::BTreeSet;
use std::process::Command;

use anyhow::Result;

use crate::command::{run, text};
use crate::state::manifest::Build;

/// The units that may be started or stopped by hand. Some, like iSCSI's start-up unit, only
/// ever run as something else's dependency.
fn by_hand(units: Vec<String>, refusing: &str) -> Result<Vec<String>> {
    let shown = text(
        Command::new("systemctl")
            .arg("show")
            .arg(format!("--property=Id,{refusing}"))
            .args(&units),
    )?;
    Ok(refused_by_hand(&shown, refusing, units))
}

fn refused_by_hand(shown: &str, refusing: &str, units: Vec<String>) -> Vec<String> {
    let refused: BTreeSet<&str> = shown
        .split("\n\n")
        .filter(|block| block.lines().any(|line| line == format!("{refusing}=yes")))
        .filter_map(|block| block.lines().find_map(|line| line.strip_prefix("Id=")))
        .collect();
    units
        .into_iter()
        .filter(|unit| !refused.contains(unit.as_str()))
        .collect()
}

/// Starts, stops or restarts units, leaving out templates, which only run as instances.
fn systemctl(verbs: &[&str], units: impl IntoIterator<Item = String>) -> Result<()> {
    let refusing = match verbs[0] {
        "stop" => "RefuseManualStop",
        _ => "RefuseManualStart",
    };
    let units: Vec<String> = units
        .into_iter()
        .filter(|unit| !unit.contains("@."))
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect();
    if units.is_empty() {
        return Ok(());
    }
    let units = by_hand(units, refusing)?;
    if units.is_empty() {
        return Ok(());
    }
    run(Command::new("systemctl").args(verbs).args(&units)).map(drop)
}

/// At startup the units are only merged once the boot's targets are queued, so their links
/// don't pull them in by themselves.
pub fn queue_enabled(build: &Build) -> Result<()> {
    systemctl(&["start", "--no-block"], build.enabled.iter().cloned())
}

fn enabled(build: Option<&Build>) -> BTreeSet<String> {
    build
        .map(|build| build.enabled.iter().cloned().collect())
        .unwrap_or_default()
}

pub fn stop_leaving(old: Option<&Build>, new: Option<&Build>) -> Result<()> {
    let leaving = &enabled(old) - &enabled(new);
    let gone_units = old.into_iter().flat_map(|old| {
        old.packages
            .iter()
            .filter(|package| new.is_none_or(|new| new.version_of(&package.name).is_none()))
            .flat_map(|package| package.units.iter().cloned())
            .collect::<Vec<_>>()
    });
    systemctl(&["stop"], leaving.into_iter().chain(gone_units))
}

pub fn start_arriving(old: Option<&Build>, new: &Build) -> Result<()> {
    let changed = new.packages.iter().filter(|package| {
        old.and_then(|old| old.version_of(&package.name))
            .is_some_and(|version| version != package.version)
    });
    systemctl(
        &["try-restart"],
        changed.flat_map(|package| package.units.iter().cloned()),
    )?;
    systemctl(&["start"], &enabled(Some(new)) - &enabled(old))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn leaves_out_units_that_only_run_as_dependencies() {
        let shown = "RefuseManualStart=no\nId=virtqemud.socket\n\nRefuseManualStart=yes\nId=iscsi-onboot.service\n";
        let units = vec![
            "virtqemud.socket".to_owned(),
            "iscsi-onboot.service".to_owned(),
        ];
        assert_eq!(
            refused_by_hand(shown, "RefuseManualStart", units),
            ["virtqemud.socket"]
        );
    }
}
