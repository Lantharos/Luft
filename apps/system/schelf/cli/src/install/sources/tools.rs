use luft_i18n::t;
use schelf_core::operations::Job;
use schelf_core::tools::{self, STABLE, Tool};

use super::{Candidate, Catalog, Kind};
use crate::install::Exit;
use crate::install::terminal::Ink;
use crate::l10n::L10N;

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
            summary: t!(L10N, "cli-tool-by", publisher = tool.publisher()),
            id: tool.index.address,
        })
        .into_iter()
        .collect())
}

/// Says who publishes the tool at `address` and that it runs with your
/// full access. Installing it waits for your yes.
pub fn install(address: &str) -> Result<(String, Job), Exit> {
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
            "{}",
            t!(
                L10N,
                "cli-tool-verified",
                name = name,
                publisher = tool.publisher()
            )
        );
    } else {
        eprintln!(
            "{}",
            t!(
                L10N,
                "cli-tool-unverified",
                name = name,
                publisher = tool.publisher()
            )
        );
    }
    Ok((
        format!("storetool/{}", tool.index.name),
        Job::InstallStoreTool {
            address: tool.index.address.clone(),
            channel: tool.channel.clone(),
        },
    ))
}
