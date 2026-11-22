use anyhow::Result;
use serde_json::Value;

const POLICY: &str = "/etc/containers/policy.json";
const SIGNED: [&str; 2] = ["sigstoreSigned", "signedBy"];

fn repository(image: &str) -> &str {
    let name = image.rfind('/').map_or(0, |slash| slash + 1);
    image[name..]
        .rfind(':')
        .map_or(image, |colon| &image[..name + colon])
}

/// The scopes of the containers policy that could apply to `repository`, most specific first:
/// the repository itself, each namespace above it, then the registry.
fn scopes(repository: &str) -> impl Iterator<Item = &str> {
    std::iter::once(repository).chain(
        repository
            .rmatch_indices('/')
            .map(move |(slash, _)| &repository[..slash]),
    )
}

fn signed(requirements: &Value) -> bool {
    requirements.as_array().is_some_and(|requirements| {
        !requirements.is_empty()
            && requirements.iter().all(|requirement| {
                requirement["type"]
                    .as_str()
                    .is_some_and(|kind| SIGNED.contains(&kind))
            })
    })
}

fn required_in(policy: &Value, image: &str) -> bool {
    let rules = &policy["transports"]["docker"];
    scopes(repository(image))
        .find_map(|scope| rules.get(scope))
        .is_some_and(signed)
}

/// Whether bootc only takes `image` with a signature, going by the containers policy.
pub fn required_for(image: &str) -> Result<bool> {
    let policy: Value = serde_json::from_slice(&std::fs::read(POLICY)?)?;
    Ok(required_in(&policy, image))
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::required_in;

    #[test]
    fn only_images_the_policy_requires_a_signature_for() {
        let policy = json!({
            "default": [{ "type": "insecureAcceptAnything" }],
            "transports": { "docker": {
                "ghcr.io/acme/luft": [{ "type": "sigstoreSigned", "keyPath": "/acme.pub" }],
                "ghcr.io/other": [{ "type": "insecureAcceptAnything" }],
            }}
        });
        assert!(required_in(&policy, "ghcr.io/acme/luft:1-pilot"));
        assert!(!required_in(&policy, "ghcr.io/acme/other:1"));
        assert!(!required_in(&policy, "ghcr.io/other/luft:1"));
        assert!(!required_in(&policy, "quay.io/acme/luft:1"));
    }
}
