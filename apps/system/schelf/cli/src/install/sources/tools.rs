use schelf_core::operations::Job;
use schelf_core::tools::{self, STABLE, Tool};

use super::{Candidate, Catalog, Kind};
use crate::install::Exit;
use crate::install::commands::confirm;
use crate::install::terminal::Ink;

fn found(name: &str) -> Result<Option<Tool>, String> {
    tools::find(name, STABLE)
}

pub fn find(name: &str) -> Result<Vec<Candidate>, String> {
    Ok(found(name)?
        .map(|tool| Candidate {
            catalog: Catalog::Tools,
            installed: tools::get(&tool.index.name)
                .is_some_and(|installed| installed.address == tool.index.address),
            kind: Kind::Command,
            name: tool.index.name.clone(),
            summary: format!("By {}", tool.publisher()),
            id: tool.index.address,
        })
        .into_iter()
        .collect())
}

/// Says who publishes the tool at `address` and that it runs with your
/// full access, and asks before it's installed.
pub fn install(address: &str, yes: bool) -> Result<(String, Job), Exit> {
    let tool = found(address)
        .map_err(|error| {
            eprintln!("{error}");
            Exit::Failed
        })?
        .ok_or(Exit::Missing)?;
    if let Some(refusal) = tools::refused(&tool) {
        eprintln!("{refusal}");
        return Err(Exit::Failed);
    }
    let ink = Ink::stderr();
    let name = ink.bold(&tool.index.name);
    if tool.index.publisher.verified {
        eprintln!(
            "{name} is published by {}, a verified publisher. It runs with everything you can do.",
            tool.publisher()
        );
    } else {
        eprintln!(
            "{name} is published by {}, a publisher schelf.store hasn't verified. It runs with everything you can do, so only install it if you trust them.",
            tool.publisher()
        );
    }
    confirm(&format!("Install {}?", tool.index.address), yes)?;
    Ok((
        format!("storetool/{}", tool.index.name),
        Job::InstallStoreTool {
            address: tool.index.address.clone(),
            channel: tool.channel.clone(),
        },
    ))
}
