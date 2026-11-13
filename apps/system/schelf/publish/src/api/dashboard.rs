use serde::Serialize;
use serde_json::Value;

use super::http::{Body, request};
use super::{API_BASE, Reply, encode};
use crate::error::Result;

pub type Json = Reply<Value>;

/// The parts of the store's dashboard the CLI uses, as the signed-in person.
#[derive(Clone)]
pub struct Dashboard {
    pub api: String,
    pub token: String,
}

fn json(body: &impl Serialize) -> Body {
    Body::Json(serde_json::to_string(body).expect("requests serialise"))
}

fn app(id: &str) -> String {
    format!("/apps/{}", encode(id))
}

fn publisher(id: &str) -> String {
    format!("/publishers/{}", encode(id))
}

impl Dashboard {
    pub fn new(api: &str, token: &str) -> Self {
        Self {
            api: api.to_owned(),
            token: token.to_owned(),
        }
    }

    fn call(&self, method: &str, path: &str, body: Body) -> Result<Json> {
        request(
            method,
            &format!("{}{API_BASE}/dev{path}", self.api),
            Some(&self.token),
            body,
        )
    }

    fn get(&self, path: &str) -> Result<Json> {
        self.call("GET", path, Body::Empty)
    }

    pub fn account(&self) -> Result<Json> {
        self.get("/account")
    }

    pub fn decline_invite(&self, id: &str) -> Result<Json> {
        self.call("POST", &format!("/invites/{id}/decline"), Body::Empty)
    }

    pub fn approvals(&self) -> Result<Json> {
        self.get("/requests")
    }

    pub fn publisher(&self, id: &str) -> Result<Json> {
        self.get(&publisher(id))
    }

    pub fn update_publisher(&self, id: &str, body: &impl Serialize) -> Result<Json> {
        self.call("PATCH", &publisher(id), json(body))
    }

    pub fn put_logo(&self, id: &str, bytes: Vec<u8>) -> Result<Json> {
        self.call(
            "PUT",
            &format!("{}/logo", publisher(id)),
            Body::Bytes(bytes),
        )
    }

    pub fn publisher_domain(&self, id: &str) -> Result<Json> {
        self.get(&format!("{}/domain", publisher(id)))
    }

    pub fn check_publisher_domain(&self, id: &str) -> Result<Json> {
        self.call(
            "POST",
            &format!("{}/domain/check", publisher(id)),
            Body::Empty,
        )
    }

    pub fn members(&self, id: &str) -> Result<Json> {
        self.get(&format!("{}/members", publisher(id)))
    }

    pub fn revoke_invite(&self, id: &str, invite: &str) -> Result<Json> {
        self.call(
            "DELETE",
            &format!("{}/invites/{invite}", publisher(id)),
            Body::Empty,
        )
    }

    pub fn tools(&self, owner: &str) -> Result<Json> {
        self.get(&format!("{}/tools", publisher(owner)))
    }

    pub fn namespaces(&self, owner: &str) -> Result<Json> {
        self.get(&format!("{}/namespaces", publisher(owner)))
    }

    pub fn verify_namespace(&self, owner: &str, prefix: &str, method: &str) -> Result<Json> {
        self.call(
            "POST",
            &format!("{}/namespaces/{}/verify", publisher(owner), encode(prefix)),
            json(&serde_json::json!({ "method": method })),
        )
    }

    pub fn verification(&self, owner: &str) -> Result<Json> {
        self.get(&format!("{}/verification", publisher(owner)))
    }

    pub fn apps(&self, owner: &str) -> Result<Json> {
        self.get(&format!("{}/apps", publisher(owner)))
    }

    pub fn deleted_apps(&self, owner: &str) -> Result<Json> {
        self.get(&format!("{}/apps/deleted", publisher(owner)))
    }

    pub fn app(&self, id: &str) -> Result<Json> {
        self.get(&app(id))
    }

    pub fn revoke_token(&self, id: &str, token: &str) -> Result<Json> {
        self.call(
            "DELETE",
            &format!("{}/tokens/{token}", app(id)),
            Body::Empty,
        )
    }

    pub fn check_domain(&self, id: &str) -> Result<Json> {
        self.call("POST", &format!("{}/domain/check", app(id)), Body::Empty)
    }

    pub fn channel_access(&self, id: &str, channel: &str) -> Result<Json> {
        self.get(&format!("{}/channels/{channel}/access", app(id)))
    }

    pub fn uninvite(&self, id: &str, channel: &str, invite: &str) -> Result<Json> {
        self.call(
            "DELETE",
            &format!("{}/channels/{channel}/invites/{invite}", app(id)),
            Body::Empty,
        )
    }

    pub fn revoke_channel_token(&self, id: &str, channel: &str, token: &str) -> Result<Json> {
        self.call(
            "DELETE",
            &format!("{}/channels/{channel}/tokens/{token}", app(id)),
            Body::Empty,
        )
    }

    pub fn releases(&self, id: &str) -> Result<Json> {
        self.get(&format!("{}/releases", app(id)))
    }

    pub fn release(&self, id: &str, release: &str) -> Result<Json> {
        self.get(&format!("{}/releases/{release}", app(id)))
    }

    pub fn rollout(&self, id: &str, release: &str, body: &impl Serialize) -> Result<Json> {
        self.call(
            "POST",
            &format!("{}/releases/{release}/rollout", app(id)),
            json(body),
        )
    }

    pub fn promote(&self, id: &str, release: &str, channel: &str) -> Result<Json> {
        self.call(
            "POST",
            &format!("{}/releases/{release}/promote", app(id)),
            json(&serde_json::json!({ "channel": channel })),
        )
    }

    pub fn upload(
        &self,
        id: &str,
        body: &impl Serialize,
    ) -> Result<Reply<crate::artifacts::release::PublishResponse>> {
        request(
            "POST",
            &format!("{}{API_BASE}/dev{}/uploads", self.api, app(id)),
            Some(&self.token),
            json(body),
        )
    }

    pub fn stats(&self, id: &str, days: &str) -> Result<Json> {
        self.get(&format!("{}/stats?days={days}", app(id)))
    }
}

/// The text at `key` of a JSON value, or nothing.
pub fn text<'a>(value: &'a Value, key: &str) -> &'a str {
    value[key].as_str().unwrap_or_default()
}

/// The items of a JSON list, or none.
pub fn items(value: &Value) -> &[Value] {
    value.as_array().map(Vec::as_slice).unwrap_or_default()
}
