use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Secret {
    Token {
        token: String,
    },
    Password {
        password: String,
    },
    #[serde(rename_all = "camelCase")]
    Apple {
        password: String,
        trust_token: String,
        cookies: String,
    },
}

impl Secret {
    pub fn parameters(&self) -> Map<String, Value> {
        let pairs: Vec<(&str, &str)> = match self {
            Secret::Token { token } => vec![("token", token)],
            Secret::Password { password } => vec![("pass", password)],
            Secret::Apple {
                password,
                trust_token,
                cookies,
            } => vec![
                ("password", password),
                ("trust_token", trust_token),
                ("cookies", cookies),
            ],
        };
        pairs
            .into_iter()
            .map(|(key, value)| (key.to_owned(), Value::String(value.to_owned())))
            .collect()
    }

    pub fn absorb(&mut self, live: &Map<String, Value>) -> bool {
        let take = |slot: &mut String, key: &str| match live.get(key).and_then(Value::as_str) {
            Some(value) if !value.is_empty() && value != slot => {
                *slot = value.to_owned();
                true
            }
            _ => false,
        };
        match self {
            Secret::Token { token } => take(token, "token"),
            Secret::Password { .. } => false,
            Secret::Apple {
                trust_token,
                cookies,
                ..
            } => take(trust_token, "trust_token") | take(cookies, "cookies"),
        }
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::Secret;

    #[test]
    fn refreshed_tokens_and_cookies_are_kept() {
        let mut token = Secret::Token {
            token: "old".into(),
        };
        let live = json!({"token": "new", "type": "onedrive"});
        assert!(token.absorb(live.as_object().unwrap()));
        assert_eq!(
            token,
            Secret::Token {
                token: "new".into()
            }
        );
        assert!(!token.absorb(live.as_object().unwrap()));

        let mut apple = Secret::Apple {
            password: "secret".into(),
            trust_token: "trust".into(),
            cookies: "a=1".into(),
        };
        let live = json!({"password": "obscured", "trust_token": "trust", "cookies": "a=2"});
        assert!(apple.absorb(live.as_object().unwrap()));
        let Secret::Apple {
            password, cookies, ..
        } = apple
        else {
            unreachable!()
        };
        assert_eq!((password.as_str(), cookies.as_str()), ("secret", "a=2"));
    }
}
