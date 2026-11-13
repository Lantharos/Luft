pub mod access;
pub mod account;
pub mod context;
pub mod files;
pub mod init;
pub mod listing;
pub mod people;
pub mod project;
pub mod publish;
pub mod status;

use crate::args::Args;
use crate::error::Result;

/// A command of the publisher side, with its usage and what it does.
pub struct Command {
    pub name: &'static str,
    pub usage: &'static str,
    pub about: &'static str,
    pub run: fn(&mut Args) -> Result<i32>,
    pub verbs: &'static [context::Verb],
}

const fn plain(
    name: &'static str,
    usage: &'static str,
    about: &'static str,
    run: fn(&mut Args) -> Result<i32>,
) -> Command {
    Command {
        name,
        usage,
        about,
        run,
        verbs: &[],
    }
}

const fn nouns(
    name: &'static str,
    usage: &'static str,
    about: &'static str,
    run: fn(&mut Args) -> Result<i32>,
    verbs: &'static [context::Verb],
) -> Command {
    Command {
        name,
        usage,
        about,
        run,
        verbs,
    }
}

pub const COMMANDS: [Command; 22] = [
    plain(
        "init",
        "init [--publisher <slug>] [--id <app id>]",
        "Set up this app, extension or project for Schelf",
        init::init,
    ),
    plain(
        "check",
        "check",
        "Check schelf.toml and the listing, and preview the store page",
        files::check,
    ),
    plain(
        "apply",
        "apply [--dry-run]",
        "Make the store match schelf.toml and the listing folder",
        files::apply,
    ),
    plain(
        "publish",
        "publish [files…] [--channel <name>] [--version <version>]",
        "Publish a release: from GitHub Actions, with a token, or signed in (goes to review)",
        publish::publish,
    ),
    plain(
        "status",
        "status [version]",
        "What's happening: releases in flight, what checks flagged, what waits on you",
        status::status,
    ),
    plain(
        "rollout",
        "rollout <version> <change>",
        "Set a percentage, pause, resume or release to all",
        status::rollout,
    ),
    nouns(
        "project",
        "project <list|show|domain|stats|rename|delete|restore>",
        "The project and its settings",
        project::settings::project,
        &project::settings::VERBS,
    ),
    nouns(
        "release",
        "release <list|show|promote|rollback|inside-luft>",
        "Releases",
        project::release::release,
        &project::release::VERBS,
    ),
    nouns(
        "channel",
        "channel <list|people|invite|uninvite|token|revoke>",
        "Channels, and who gets an invite-only one",
        project::channel::channel,
        &project::channel::VERBS,
    ),
    nouns(
        "tool",
        "tool <list|name>",
        "Command-line tools and their bare names",
        project::tool::tool,
        &project::tool::VERBS,
    ),
    nouns(
        "listing",
        "listing pull",
        "Bring the store page into listing.toml",
        listing::listing,
        &listing::VERBS,
    ),
    nouns(
        "trust",
        "trust <list|add|remove>",
        "Workflows trusted to publish",
        access::trust::trust,
        &access::trust::VERBS,
    ),
    nouns(
        "token",
        "token <list|create|revoke>",
        "Upload tokens",
        access::token::token,
        &access::token::VERBS,
    ),
    nouns(
        "publisher",
        "publisher <list|show|create|update|domain>",
        "Publishers and their profiles",
        people::publisher::publisher,
        &people::publisher::VERBS,
    ),
    nouns(
        "member",
        "member <list|invite|role|remove|transfer|leave>",
        "Organisation members",
        people::member::member,
        &people::member::VERBS,
    ),
    nouns(
        "invite",
        "invite <list|accept|decline|revoke>",
        "Invitations",
        people::invite::invite,
        &people::invite::VERBS,
    ),
    nouns(
        "namespace",
        "namespace <list|claim|verify|release>",
        "Namespaces app ids live under",
        people::namespace::namespace,
        &people::namespace::VERBS,
    ),
    nouns(
        "verification",
        "verification status",
        "The publisher's verified mark",
        people::verification::verification,
        &people::verification::VERBS,
    ),
    plain(
        "request",
        "request <status|cancel> <id>",
        "Check on, wait for or cancel something waiting for your approval",
        account::request_command,
    ),
    plain(
        "login",
        "login",
        "Sign in through the browser",
        account::login,
    ),
    plain(
        "whoami",
        "whoami",
        "The account you're signed in as and its publishers",
        account::whoami,
    ),
    plain(
        "logout",
        "logout",
        "Forget this computer's sign-in",
        account::logout,
    ),
];
