use std::fmt::Write;
use std::fs;
use std::io;
use std::path::Path;

pub const DETAILS: &str = "details";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Choice {
    pub id: String,
    pub label: String,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct FailureFile {
    pub title: String,
    pub reason: Option<String>,
    pub choices: Vec<Choice>,
    pub details: Vec<String>,
}

fn one_line(text: &str) -> String {
    text.chars()
        .map(|character| {
            if character.is_control() {
                ' '
            } else {
                character
            }
        })
        .collect()
}

impl FailureFile {
    pub fn load(path: &Path) -> io::Result<Self> {
        Self::parse(&fs::read_to_string(path)?)
            .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "the failure isn't readable"))
    }

    fn parse(text: &str) -> Option<Self> {
        let mut file = Self::default();
        for line in text.lines() {
            let (field, value) = line.split_once(' ').unwrap_or((line, ""));
            match field {
                "title" => file.title = value.to_owned(),
                "reason" => file.reason = Some(value.to_owned()),
                "choice" => {
                    let (id, label) = value.split_once(' ')?;
                    file.choices.push(Choice {
                        id: id.to_owned(),
                        label: label.to_owned(),
                    });
                }
                "detail" => file.details.push(value.to_owned()),
                _ => return None,
            }
        }
        (!file.title.is_empty() && !file.choices.is_empty()).then_some(file)
    }

    pub fn encode(&self) -> String {
        let mut text = format!("title {}\n", one_line(&self.title));
        if let Some(reason) = &self.reason {
            let _ = writeln!(text, "reason {}", one_line(reason));
        }
        for choice in &self.choices {
            let _ = writeln!(text, "choice {} {}", choice.id, one_line(&choice.label));
        }
        for line in &self.details {
            let _ = writeln!(text, "detail {}", one_line(line));
        }
        text
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keeps_each_detail_on_its_own_line() {
        let file = FailureFile {
            title: "Luft couldn't start".into(),
            reason: Some("The disk couldn't be unlocked.".into()),
            choices: vec![Choice {
                id: "restart".into(),
                label: "Restart".into(),
            }],
            details: vec![
                "sysroot.mount failed\nchoice shell Open a shell".into(),
                String::new(),
            ],
        };
        let read = FailureFile::parse(&file.encode()).expect("the file reads back");
        assert_eq!(read.choices.len(), 1);
        assert_eq!(read.details.len(), 2);
        assert_eq!(read.reason, file.reason);
    }
}
