use sushi::password::{PasswordRequests, Request, Secret};
use sushi::scene::Prompt;
use sushi::terminal::{Key, Terminal};

pub struct Unlock {
    request: Request,
    secret: Secret,
    pub prompt: Prompt,
}

pub enum Typed {
    Nothing,
    Changed,
    Answered,
}

fn title(message: &str) -> String {
    let disk = message
        .split_once("for disk ")
        .map(|(_, rest)| {
            rest.split(" (")
                .next()
                .unwrap_or(rest)
                .trim_end_matches(':')
                .trim()
        })
        .filter(|disk| !disk.is_empty() && !disk.starts_with("luks-"));
    match disk {
        Some(disk) => format!("Unlock {disk}"),
        None => "Unlock this computer".to_owned(),
    }
}

impl Unlock {
    pub fn next(
        requests: &PasswordRequests,
        last_answered: Option<&str>,
        now: f32,
    ) -> Option<Self> {
        let request = requests.pending().into_iter().next()?;
        let rejected = last_answered == Some(request.id.as_str());
        let prompt = Prompt {
            title: title(&request.message),
            rejected,
            shake_started: rejected.then_some(now),
            ..Prompt::default()
        };
        Some(Self {
            request,
            secret: Secret::default(),
            prompt,
        })
    }

    pub fn id(&self) -> &str {
        &self.request.id
    }

    pub fn is_live(&self) -> bool {
        self.request.is_live()
    }

    pub fn type_keys(&mut self, terminal: &mut Terminal) -> Typed {
        let keys = terminal.keys();
        if keys.is_empty() {
            return Typed::Nothing;
        }
        for key in keys {
            match key {
                Key::Text(character) => self.secret.push(character),
                Key::Erase => self.secret.pop(),
                Key::Clear => self.secret.clear(),
                Key::Enter => {
                    let _ = self.request.answer(&self.secret);
                    self.secret.clear();
                    return Typed::Answered;
                }
            }
        }
        self.prompt.typed = self.secret.characters();
        self.prompt.rejected &= self.prompt.typed == 0;
        Typed::Changed
    }
}

#[cfg(test)]
mod tests {
    use super::title;

    #[test]
    fn names_the_disk_being_unlocked() {
        assert_eq!(
            title("Please enter passphrase for disk Samsung SSD 980 (luks-2f9b):"),
            "Unlock Samsung SSD 980"
        );
        assert_eq!(title("Enter the recovery key"), "Unlock this computer");
        assert_eq!(
            title("Please enter passphrase for disk luks-77e43f8a:"),
            "Unlock this computer"
        );
    }
}
