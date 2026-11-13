use super::check::{Checker, at};
use super::platforms::{format_fits, platforms_for};
use super::schelf::SchelfToml;
use super::versions::STABLE;
use crate::tools;

/// The rules across schelf.toml's keys, checked once each key reads well.
pub fn refine(checker: &mut Checker, manifest: &SchelfToml) {
    let path = |keys: &[&str]| keys.iter().map(|key| (*key).to_owned()).collect::<Vec<_>>();
    if manifest.id.is_none() == manifest.project.is_none() {
        checker.issue(
            &path(&["project"]),
            "Name it with either id = \"io.github.alice.Notes\" or project = \"alice/notes\"",
        );
    }
    let extension = manifest.kind == "extension";
    if extension && manifest.id.is_none() {
        checker.issue(&path(&["id"]), "An extension has a reverse-DNS id");
    }
    if !format_fits(&manifest.kind, &manifest.format) {
        checker.issue(
            &path(&["format"]),
            if extension {
                "An extension's format is \"luft-extension\""
            } else {
                "\"luft-extension\" is only for extensions"
            },
        );
    }
    if extension && manifest.extension_api.is_none() {
        checker.issue(
            &path(&["requires", "extension_api"]),
            "An extension names the extension API version it was built for",
        );
    }
    if manifest.updater.is_some() && manifest.format != "files" {
        let through = if manifest.format == "sabine" {
            "Sabine"
        } else {
            "Schelf"
        };
        checker.issue(
            &path(&["updater"]),
            format!(
                "A {} app updates through {through}; updater is for format = \"files\"",
                manifest.format
            ),
        );
    }
    if manifest.distribution == "proprietary" && manifest.licence.is_some() {
        checker.issue(
            &path(&["licence"]),
            "A licence is for open source; remove it or set distribution = \"open\"",
        );
    }
    for (name, part) in &manifest.parts {
        if part.format() == "sabine" && part.id.is_none() {
            checker.issue(
                &path(&["parts", name, "id"]),
                "A Sabine part has its own app id, the one in its Sabine.toml",
            );
        }
        if part.updater.is_some() && part.format() != "files" {
            checker.issue(
                &path(&["parts", name, "updater"]),
                "A Sabine part updates through Sabine; updater is for a part of files",
            );
        }
        for (index, each) in part.platforms.iter().enumerate() {
            if !platforms_for(part.format()).contains(&each.as_str()) {
                checker.issue(
                    &at(&path(&["parts", name, "platforms"]), index),
                    format!("A {} part isn't built for {each}", part.format()),
                );
            }
        }
    }
    tool_issues(checker, manifest);
    for (index, each) in manifest.platforms.iter().flatten().enumerate() {
        if !platforms_for(&manifest.format).contains(&each.as_str()) {
            checker.issue(
                &at(&path(&["platforms"]), index),
                format!("A {} app isn't built for {each}", manifest.format),
            );
        }
    }
    if !manifest.parts.is_empty() && extension {
        checker.issue(&path(&["parts"]), "An extension is one part");
    }
    if !manifest.parts.is_empty() && manifest.platforms.is_none() && manifest.listing.is_some() {
        checker.issue(
            &path(&["listing"]),
            "A project of only named parts has no store page; add platforms for the app or remove listing",
        );
    }
    for (name, settings) in &manifest.channels {
        let channel = |keys: &[&str]| {
            let mut full = path(&["channels", name]);
            full.extend(keys.iter().map(|key| (*key).to_owned()));
            full
        };
        if name == STABLE && (settings.ended_into.is_some() || settings.keep.is_some()) {
            checker.issue(
                &channel(&[]),
                "stable keeps every release and can't be ended",
            );
        }
        if name == STABLE && settings.invite_only == Some(true) {
            checker.issue(
                &channel(&["invite_only"]),
                "stable is for everyone; make another channel invite-only",
            );
        }
        let into = settings
            .ended_into
            .as_ref()
            .and_then(|into| manifest.channels.get(into).map(|settings| (into, settings)));
        if let Some((into, target)) = into
            && target.invite_only == Some(true)
        {
            checker.issue(
                &channel(&["ended_into"]),
                format!(
                    "{into} is invite-only, so its people couldn't follow; end into an open channel"
                ),
            );
        }
        if settings.ended_into.as_deref() == Some(name.as_str()) {
            checker.issue(&channel(&["ended_into"]), "A channel can't end into itself");
        }
        if let Some((into, target)) = into
            && target.ended_into.is_some()
        {
            checker.issue(
                &channel(&["ended_into"]),
                format!("{into} has ended too; end into a channel that's still open"),
            );
        }
    }
}

fn tool_platform_issues(checker: &mut Checker, platforms: &[String], path: &[String]) {
    for (index, each) in platforms.iter().enumerate() {
        if !tools::PLATFORMS.contains(&each.as_str()) {
            checker.issue(
                &at(path, index),
                format!("A tool is one program for Linux, macOS or Windows, not for {each}"),
            );
        }
    }
}

fn tool_issues(checker: &mut Checker, manifest: &SchelfToml) {
    let path = |keys: &[&str]| keys.iter().map(|key| (*key).to_owned()).collect::<Vec<_>>();
    if manifest.tool.is_some() {
        if manifest.format != "files" {
            checker.issue(&path(&["tool"]), "A tool is format = \"files\"");
        }
        if manifest.updater.is_some() {
            checker.issue(
                &path(&["updater"]),
                "A tool updates through Schelf; remove updater",
            );
        }
        if manifest.listing.is_some() {
            checker.issue(
                &path(&["listing"]),
                "A tool has no store page; remove listing",
            );
        }
        if manifest.platforms.is_none() {
            checker.issue(
                &path(&["platforms"]),
                "A tool names the systems every release carries it for",
            );
        }
        tool_platform_issues(
            checker,
            manifest.platforms.as_deref().unwrap_or_default(),
            &path(&["platforms"]),
        );
    }
    for (name, part) in manifest
        .parts
        .iter()
        .filter(|(_, part)| part.tool.is_some())
    {
        if part.format() != "files" {
            checker.issue(&path(&["parts", name, "tool"]), "A tool is a part of files");
        }
        if part.updater.is_some() {
            checker.issue(
                &path(&["parts", name, "updater"]),
                "A tool updates through Schelf; remove updater",
            );
        }
        tool_platform_issues(
            checker,
            &part.platforms,
            &path(&["parts", name, "platforms"]),
        );
    }
    let entries = manifest
        .tool
        .iter()
        .map(|tool| (tool, path(&["tool"])))
        .chain(manifest.parts.iter().filter_map(|(name, part)| {
            Some((part.tool.as_ref()?, path(&["parts", name, "tool"])))
        }));
    let mut seen = Vec::new();
    for (tool, place) in entries {
        if seen.contains(&tool) {
            checker.issue(&place, format!("Two tools install {tool}"));
        }
        seen.push(tool);
    }
}
