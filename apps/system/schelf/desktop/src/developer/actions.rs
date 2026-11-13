use luft_app::Commands;
use sabine::SabineWindow;
use schelf_publish::client::{approval_of, cancel_approval, request_approval};
use serde::{Deserialize, Serialize};
use specta::Type;

use super::answer::ask;
use super::reads::{ProjectOf, Publisher};
use super::shapes::{
    Approval, ChannelAccess, Members, Project, Promoted, PublisherDomain, Release,
};

/// What the app changes about a rollout by itself. Rolling back asks for
/// approval instead.
#[derive(Serialize, Deserialize, Type)]
#[serde(tag = "action", rename_all = "camelCase")]
enum Change {
    Pause,
    Resume,
    All,
    Set { percent: u8 },
}

#[derive(Deserialize, Type)]
struct Rollout {
    id: String,
    release: String,
    change: Change,
}

#[derive(Deserialize, Type)]
struct Promote {
    id: String,
    release: String,
    channel: String,
}

/// An invitation or a download token of an invite-only channel.
#[derive(Deserialize, Type)]
struct ChannelEntry {
    id: String,
    channel: String,
    entry: String,
}

#[derive(Deserialize, Type)]
struct MemberInvite {
    publisher: String,
    invite: String,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "lowercase")]
enum Role {
    Owner,
    Admin,
    Developer,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(untagged)]
enum Invitee {
    Email { email: String },
    Github { github: String },
}

/// What the app asks to be approved in the browser, as schelf.store names it.
#[derive(Serialize, Deserialize, Type)]
#[serde(tag = "type")]
enum ApprovalAction {
    #[serde(rename = "release.rollback")]
    ReleaseRollback { app: String, release: String },
    #[serde(rename = "release.inside-luft")]
    ReleaseInsideLuft { app: String, release: String },
    #[serde(rename = "channel.invite")]
    ChannelInvite {
        app: String,
        channel: String,
        email: String,
    },
    #[serde(rename = "member.invite")]
    MemberInvite {
        publisher: String,
        to: Invitee,
        role: Role,
    },
    #[serde(rename = "member.role")]
    MemberRole {
        publisher: String,
        user: String,
        role: Role,
    },
    #[serde(rename = "member.remove")]
    MemberRemove { publisher: String, user: String },
    #[serde(rename = "publisher.domain")]
    PublisherDomain {
        publisher: String,
        domain: Option<String>,
    },
}

#[derive(Deserialize, Type)]
struct Ask {
    actions: Vec<ApprovalAction>,
}

#[derive(Deserialize, Type)]
struct ApprovalOf {
    id: String,
}

fn approval_actions(actions: &[ApprovalAction]) -> Vec<serde_json::Value> {
    actions
        .iter()
        .map(|action| serde_json::to_value(action).expect("actions serialise"))
        .collect()
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command(
            "developer_rollout",
            |Rollout {
                 id,
                 release,
                 change,
             }| { ask::<Release>(|store| store.rollout(&id, &release, &change)) },
        )
        .command(
            "developer_promote",
            |Promote {
                 id,
                 release,
                 channel,
             }| { ask::<Promoted>(|store| store.promote(&id, &release, &channel)) },
        )
        .command(
            "developer_uninvite",
            |ChannelEntry { id, channel, entry }| {
                ask::<ChannelAccess>(|store| store.uninvite(&id, &channel, &entry))
            },
        )
        .command(
            "developer_revoke_download_token",
            |ChannelEntry { id, channel, entry }| {
                ask::<ChannelAccess>(|store| store.revoke_channel_token(&id, &channel, &entry))
            },
        )
        .command(
            "developer_revoke_member_invite",
            |MemberInvite { publisher, invite }| {
                ask::<Members>(|store| {
                    store.revoke_invite(&publisher, &invite)?;
                    store.members(&publisher)
                })
            },
        )
        .command("developer_check_domain", |Publisher { publisher }| {
            ask::<PublisherDomain>(|store| store.check_publisher_domain(&publisher))
        })
        .command("developer_check_project_domain", |ProjectOf { id }| {
            ask::<Project>(|store| store.check_domain(&id))
        })
        .command("developer_ask", |Ask { actions }| {
            ask::<Approval>(|store| {
                request_approval(&store.api, &store.token, &approval_actions(&actions))
            })
        })
        .command("developer_approval", |ApprovalOf { id }| {
            ask::<Approval>(|store| approval_of(&store.api, &store.token, &id))
        })
        .command("developer_cancel_approval", |ApprovalOf { id }| {
            ask::<Approval>(|store| cancel_approval(&store.api, &store.token, &id))
        })
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{ApprovalAction, Change, Invitee, Role};

    #[test]
    fn actions_carry_the_store_names() {
        let invite = ApprovalAction::MemberInvite {
            publisher: "pub_1".into(),
            to: Invitee::Github {
                github: "mara".into(),
            },
            role: Role::Developer,
        };
        assert_eq!(
            serde_json::to_value(invite).unwrap(),
            json!({ "type": "member.invite", "publisher": "pub_1", "to": { "github": "mara" }, "role": "developer" })
        );
        assert_eq!(
            serde_json::to_value(Change::Set { percent: 25 }).unwrap(),
            json!({ "action": "set", "percent": 25 })
        );
    }
}
