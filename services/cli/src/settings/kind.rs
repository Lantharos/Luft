//! What values a setting takes, and turning what someone typed into one.

use serde::Serialize;
use serde_json::Value as Json;

use super::catalogue::Unit;

#[derive(Serialize, Clone, Debug, PartialEq)]
pub struct Choice {
    pub value: Json,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub note: Option<String>,
}

#[derive(Serialize, Clone, Debug, PartialEq)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum Kind {
    Switch {
        #[serde(skip_serializing_if = "Vec::is_empty")]
        notes: Vec<Choice>,
    },
    Choice {
        choices: Vec<Choice>,
    },
    Number {
        integer: bool,
        min: f64,
        max: f64,
        #[serde(skip_serializing_if = "Option::is_none")]
        unit: Option<Unit>,
    },
    Text,
}

const ON: [&str; 4] = ["on", "true", "yes", "1"];
const OFF: [&str; 4] = ["off", "false", "no", "0"];

fn typed(given: &Json) -> String {
    match given {
        Json::String(text) => text.trim().to_owned(),
        other => other.to_string(),
    }
}

impl Kind {
    /// The value `given` stands for, from JSON or from what someone typed.
    pub fn parse(&self, given: &Json) -> Result<Json, String> {
        let text = typed(given);
        match self {
            Self::Switch { .. } => match given {
                Json::Bool(on) => Ok(Json::Bool(*on)),
                _ if ON.contains(&text.to_lowercase().as_str()) => Ok(Json::Bool(true)),
                _ if OFF.contains(&text.to_lowercase().as_str()) => Ok(Json::Bool(false)),
                _ => Err(format!("“{text}” isn't on or off.")),
            },
            Self::Choice { choices } => choices
                .iter()
                .find(|choice| {
                    typed(&choice.value) == text || choice.name.eq_ignore_ascii_case(&text)
                })
                .map(|choice| choice.value.clone())
                .ok_or_else(|| {
                    let names: Vec<String> =
                        choices.iter().map(|choice| typed(&choice.value)).collect();
                    format!("“{text}” isn't one of {}.", names.join(", "))
                }),
            Self::Number {
                integer, min, max, ..
            } => {
                let number: f64 = text
                    .parse()
                    .map_err(|_| format!("“{text}” isn't a number."))?;
                if *integer && number.fract() != 0.0 {
                    return Err(format!("“{text}” isn't a whole number."));
                }
                if number < *min || number > *max {
                    return Err(format!("{text} isn't between {min} and {max}."));
                }
                Ok(if *integer {
                    Json::from(number as i64)
                } else {
                    Json::from(number)
                })
            }
            Self::Text if text.is_empty() => Err("The value can't be empty.".to_owned()),
            Self::Text => Ok(Json::String(text)),
        }
    }

    /// A value in the words Settings uses for it.
    pub fn words(&self, value: &Json) -> String {
        match (self, value) {
            (_, Json::Null) => "unknown".to_owned(),
            (Self::Switch { .. }, Json::Bool(on)) => if *on { "On" } else { "Off" }.to_owned(),
            (Self::Choice { choices }, value) => choices
                .iter()
                .find(|choice| choice.value == *value)
                .map_or_else(|| typed(value), |choice| choice.name.clone()),
            (
                Self::Number {
                    unit: Some(Unit::Seconds),
                    ..
                },
                value,
            ) => format!("{} seconds", typed(value)),
            (
                Self::Number {
                    unit: Some(Unit::Milliseconds),
                    ..
                },
                value,
            ) => format!("{} ms", typed(value)),
            (_, value) => typed(value),
        }
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{Choice, Kind};

    fn choice(value: &str, name: &str) -> Choice {
        Choice {
            value: json!(value),
            name: name.to_owned(),
            note: None,
        }
    }

    #[test]
    fn reads_switches_as_people_type_them() {
        let switch = Kind::Switch { notes: Vec::new() };
        assert_eq!(switch.parse(&json!("on")), Ok(json!(true)));
        assert_eq!(switch.parse(&json!("Off")), Ok(json!(false)));
        assert_eq!(switch.parse(&json!(true)), Ok(json!(true)));
        assert!(switch.parse(&json!("maybe")).is_err());
    }

    #[test]
    fn takes_a_choice_by_its_value_or_the_name_settings_shows() {
        let size = Kind::Choice {
            choices: vec![choice("compact", "Small"), choice("large", "Large")],
        };
        assert_eq!(size.parse(&json!("compact")), Ok(json!("compact")));
        assert_eq!(size.parse(&json!("small")), Ok(json!("compact")));
        assert!(size.parse(&json!("huge")).is_err());
        assert_eq!(size.words(&json!("compact")), "Small");
    }

    #[test]
    fn keeps_numbers_in_their_range() {
        let delay = Kind::Number {
            integer: true,
            min: 100.0,
            max: 2000.0,
            unit: None,
        };
        assert_eq!(delay.parse(&json!("500")), Ok(json!(500)));
        assert!(delay.parse(&json!("50")).is_err());
        assert!(delay.parse(&json!("500.5")).is_err());
    }
}
