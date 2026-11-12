use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use chrono::{DateTime, Utc};
use ed25519_dalek::{Signer, SigningKey};
use serde_json::json;

use super::{Key, Keys, Seal};

const NOW: &str = "2026-11-13T12:00:00Z";
const CATALOG: &[u8] = br#"{"path":"index/v1/catalog.json","serial":3}"#;

fn signer(seed: u8) -> SigningKey {
    SigningKey::from_bytes(&[seed; 32])
}

fn public(key: &SigningKey) -> String {
    STANDARD.encode(key.verifying_key().as_bytes())
}

fn id(key: &SigningKey) -> String {
    Key::read(&public(key)).unwrap().id
}

fn sealed(by: &SigningKey, bytes: &[u8]) -> Seal {
    Seal {
        key: id(by),
        sig: STANDARD.encode(by.sign(bytes).to_bytes()),
    }
}

fn listed(key: &SigningKey, not_before: &str, expires: &str) -> serde_json::Value {
    json!({ "id": id(key), "public_key": public(key), "not_before": not_before, "expires": expires })
}

fn now() -> DateTime<Utc> {
    NOW.parse().unwrap()
}

fn keys_signed_by(
    root: &SigningKey,
    signer: &SigningKey,
    list: &serde_json::Value,
) -> Result<Keys, String> {
    let document = serde_json::to_vec(list).unwrap();
    Keys::read_under(&public(root), &document, &sealed(signer, &document), now())
}

#[test]
fn only_a_key_list_the_root_signed_is_taken() {
    let (root, store, stranger) = (signer(1), signer(2), signer(3));
    let list = json!({ "keys": [listed(&store, "2026-01-01T00:00:00Z", "2027-01-01T00:00:00Z")] });
    let keys = keys_signed_by(&root, &root, &list).unwrap();
    assert!(keys.verify(CATALOG, &sealed(&store, CATALOG)).is_ok());

    assert!(keys_signed_by(&root, &stranger, &list).is_err());
    let document = serde_json::to_vec(&list).unwrap();
    let mut changed = document.clone();
    changed.extend_from_slice(b" ");
    assert!(Keys::read_under(&public(&root), &changed, &sealed(&root, &document), now()).is_err());
    let claimed = Seal {
        key: id(&root),
        ..sealed(&stranger, &document)
    };
    assert!(Keys::read_under(&public(&root), &document, &claimed, now()).is_err());
}

#[test]
fn a_document_counts_only_with_a_good_signature_by_a_listed_key() {
    let (root, store, stranger) = (signer(1), signer(2), signer(3));
    let list = json!({ "keys": [listed(&store, "2026-01-01T00:00:00Z", "2027-01-01T00:00:00Z")] });
    let keys = keys_signed_by(&root, &root, &list).unwrap();

    assert!(keys.verify(CATALOG, &sealed(&stranger, CATALOG)).is_err());
    assert!(keys.verify(CATALOG, &sealed(&root, CATALOG)).is_err());
    let forged = Seal {
        key: id(&store),
        ..sealed(&stranger, CATALOG)
    };
    assert!(keys.verify(CATALOG, &forged).is_err());
    let other = br#"{"path":"index/v1/catalog.json","serial":2}"#;
    assert!(keys.verify(other, &sealed(&store, CATALOG)).is_err());
}

#[test]
fn keys_that_expired_are_not_valid_yet_were_revoked_or_misnamed_sign_nothing() {
    let root = signer(1);
    let [expired, early, revoked, misnamed, current] = [2, 3, 4, 5, 6].map(signer);
    let mut wrong_id = listed(&misnamed, "2026-01-01T00:00:00Z", "2027-01-01T00:00:00Z");
    wrong_id["id"] = json!(id(&current));
    let list = json!({
        "keys": [
            listed(&expired, "2025-01-01T00:00:00Z", NOW),
            listed(&early, "2026-11-14T00:00:00Z", "2027-01-01T00:00:00Z"),
            listed(&revoked, "2026-01-01T00:00:00Z", "2027-01-01T00:00:00Z"),
            wrong_id,
            listed(&current, NOW, "2027-01-01T00:00:00Z"),
        ],
        "revoked": [id(&revoked)],
    });
    let keys = keys_signed_by(&root, &root, &list).unwrap();
    for key in [&expired, &early, &revoked] {
        assert!(keys.verify(CATALOG, &sealed(key, CATALOG)).is_err());
    }
    let passing_as_current = Seal {
        key: id(&current),
        ..sealed(&misnamed, CATALOG)
    };
    assert!(keys.verify(CATALOG, &passing_as_current).is_err());
    assert!(keys.verify(CATALOG, &sealed(&current, CATALOG)).is_ok());
}
