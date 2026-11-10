use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use zeroize::Zeroizing;

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Secret {
    Token {
        token: Zeroizing<String>,
    },
    Password {
        password: Zeroizing<String>,
    },
    #[serde(rename_all = "camelCase")]
    Apple {
        password: Zeroizing<String>,
        trust_token: Zeroizing<String>,
        cookies: Zeroizing<String>,
    },
}

impl Secret {
    pub fn parameters(&self) -> Map<String, Value> {
        let pairs: Vec<(&str, &Zeroizing<String>)> = match self {
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
            .map(|(key, value)| (key.to_owned(), Value::String(value.to_string())))
            .collect()
    }

    pub fn absorb(&mut self, live: &Map<String, Value>) -> bool {
        let take =
            |slot: &mut Zeroizing<String>, key: &str| match live.get(key).and_then(Value::as_str) {
                Some(value) if !value.is_empty() && value != slot.as_str() => {
                    *slot = Zeroizing::new(value.to_owned());
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

    use zeroize::Zeroizing;

    use super::Secret;

    #[test]
    fn refreshed_tokens_and_cookies_are_kept() {
        let mut token = Secret::Token {
            token: Zeroizing::new("old".into()),
        };
        let live = json!({"token": "new", "type": "onedrive"});
        assert!(token.absorb(live.as_object().unwrap()));
        assert!(
            token
                == Secret::Token {
                    token: Zeroizing::new("new".into())
                }
        );
        assert!(!token.absorb(live.as_object().unwrap()));

        let mut apple = Secret::Apple {
            password: Zeroizing::new("secret".into()),
            trust_token: Zeroizing::new("trust".into()),
            cookies: Zeroizing::new("a=1".into()),
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
