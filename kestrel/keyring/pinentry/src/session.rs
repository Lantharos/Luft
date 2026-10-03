use std::io::{self, BufRead, Write};
use std::time::Duration;

use crate::assuan::{self, Assuan, unescape};
use crate::cache::Cache;
use crate::kestrel::{Choice, Entry, Kestrel, Request};

const VERSION: &str = env!("CARGO_PKG_VERSION");

#[derive(Default)]
struct Labels {
    ok: String,
    cancel: String,
    not_ok: String,
}

#[derive(Default)]
pub struct Session {
    title: String,
    description: String,
    prompt: String,
    error: String,
    labels: Labels,
    defaults: Labels,
    repeat: Option<String>,
    repeat_error: String,
    quality: bool,
    keyinfo: Option<String>,
    external_cache: bool,
    tried_cache: bool,
    timeout: Option<Duration>,
}

pub enum Next {
    Continue,
    Finish,
}

fn mnemonic_free(label: &str) -> String {
    let mut text = String::with_capacity(label.len());
    let mut characters = label.chars().peekable();
    while let Some(character) = characters.next() {
        if character != '_' {
            text.push(character);
        } else if characters.peek() == Some(&'_') {
            text.push(characters.next().unwrap_or('_'));
        }
    }
    text
}

fn paragraphs(text: &str) -> String {
    let mut joined = String::with_capacity(text.len());
    for line in text.trim().lines().map(str::trim) {
        let separator = match joined.chars().last() {
            None => "",
            Some(':' | '\n') => "\n",
            Some(_) if line.is_empty() => "\n",
            Some(_) => " ",
        };
        joined.push_str(separator);
        joined.push_str(line);
    }
    joined
}

fn sentence(text: &str) -> String {
    let mut characters = text.trim().chars();
    characters
        .next()
        .map(|first| first.to_uppercase().chain(characters).collect())
        .unwrap_or_default()
}

fn noun(prompt: &str) -> String {
    if prompt.chars().any(char::is_lowercase) {
        prompt.to_lowercase()
    } else {
        prompt.to_owned()
    }
}

fn pick<'a>(chosen: &'a str, default: &'a str) -> &'a str {
    if chosen.is_empty() { default } else { chosen }
}

impl Session {
    pub fn handle<R: BufRead, W: Write>(
        &mut self,
        kestrel: &Kestrel,
        assuan: &mut Assuan<R, W>,
        line: &[u8],
    ) -> io::Result<Next> {
        let (command, argument) = match line.iter().position(|&byte| byte == b' ') {
            Some(space) => (&line[..space], &line[space + 1..]),
            None => (line, &[][..]),
        };
        let text = || String::from_utf8_lossy(&unescape(argument)).into_owned();
        match command.to_ascii_uppercase().as_slice() {
            b"" => return Ok(Next::Continue),
            b"SETDESC" => self.description = paragraphs(&text()),
            b"SETPROMPT" => self.prompt = text(),
            b"SETTITLE" => self.title = text(),
            b"SETERROR" => self.error = text(),
            b"SETOK" => self.labels.ok = mnemonic_free(&text()),
            b"SETCANCEL" => self.labels.cancel = mnemonic_free(&text()),
            b"SETNOTOK" => self.labels.not_ok = mnemonic_free(&text()),
            b"SETREPEAT" => self.repeat = Some(text()),
            b"SETREPEATERROR" => self.repeat_error = sentence(&text()),
            b"SETQUALITYBAR" => self.quality = true,
            b"SETTIMEOUT" => {
                self.timeout = text()
                    .trim()
                    .parse()
                    .ok()
                    .filter(|&seconds| seconds > 0)
                    .map(Duration::from_secs)
            }
            b"SETKEYINFO" => {
                self.keyinfo = Some(text()).filter(|info| !info.is_empty() && info != "--clear")
            }
            b"CLEARPASSPHRASE" => {
                kestrel.block_on(Cache::new(kestrel.connection(), &text()).clear())
            }
            b"OPTION" => self.option(&text()),
            b"GETINFO" => return self.info(assuan, &text()).map(|()| Next::Continue),
            b"GETPIN" => return self.get_pin(kestrel, assuan).map(|()| Next::Continue),
            b"CONFIRM" => {
                return self
                    .confirm(kestrel, assuan, text().trim() == "--one-button")
                    .map(|()| Next::Continue);
            }
            b"MESSAGE" => return self.confirm(kestrel, assuan, true).map(|()| Next::Continue),
            b"RESET" => *self = Self::default(),
            b"BYE" => {
                assuan.ok()?;
                return Ok(Next::Finish);
            }
            command if command.starts_with(b"SET") || command == b"NOP" => {}
            _ => {
                assuan.err(assuan::UNKNOWN_COMMAND, "Unknown IPC command")?;
                return Ok(Next::Continue);
            }
        }
        assuan.ok()?;
        Ok(Next::Continue)
    }

    fn option(&mut self, option: &str) {
        let (name, value) = option.split_once(['=', ' ']).unwrap_or((option, ""));
        match name.trim_start_matches("--") {
            "allow-external-password-cache" => self.external_cache = true,
            "default-ok" => self.defaults.ok = mnemonic_free(value),
            "default-cancel" => self.defaults.cancel = mnemonic_free(value),
            "default-notok" => self.defaults.not_ok = mnemonic_free(value),
            _ => {}
        }
    }

    fn info<R: BufRead, W: Write>(&self, assuan: &mut Assuan<R, W>, what: &str) -> io::Result<()> {
        match what.trim() {
            "flavor" => assuan.data(b"kestrel")?,
            "version" => assuan.data(VERSION.as_bytes())?,
            "pid" => assuan.data(std::process::id().to_string().as_bytes())?,
            "ttyinfo" => assuan.data(b"- - - - 0/0 -")?,
            _ => return assuan.err(assuan::UNKNOWN_COMMAND, "Unknown IPC command"),
        }
        assuan.ok()
    }

    fn remembers(&self) -> Option<&str> {
        self.keyinfo.as_deref().filter(|_| self.external_cache)
    }

    fn get_pin<R: BufRead, W: Write>(
        &mut self,
        kestrel: &Kestrel,
        assuan: &mut Assuan<R, W>,
    ) -> io::Result<()> {
        if self.repeat.is_none()
            && self.error.is_empty()
            && !self.tried_cache
            && let Some(keygrip) = self.remembers().map(str::to_owned)
        {
            self.tried_cache = true;
            if let Some(secret) =
                kestrel.block_on(Cache::new(kestrel.connection(), &keygrip).lookup())
            {
                assuan.status("PASSWORD_FROM_CACHE")?;
                assuan.data(&secret)?;
                return assuan.ok();
            }
        }

        let prompt = self.prompt.trim().trim_end_matches(':').trim();
        let label = pick(prompt, "Passphrase");
        let title = if !self.title.is_empty() {
            self.title.clone()
        } else if self.repeat.is_some() {
            format!("Choose a {}", noun(label))
        } else {
            format!("Enter your {}", noun(label))
        };
        let mut request = Request::default();
        request.text("title", &title);
        request.text("body", self.description.trim());
        request.text("label", label);
        request.text("warning", &self.error);
        request.text("mismatch", &self.repeat_error);
        request.text("continue", pick(&self.labels.ok, &self.defaults.ok));
        request.text("cancel", pick(&self.labels.cancel, &self.defaults.cancel));
        request.flag("confirm", self.repeat.is_some());
        request.flag("remember", self.remembers().is_some());
        request.flag("quality", self.quality);
        self.error.clear();

        let quality = self.quality;
        let entry = kestrel.password(&request, self.timeout, |text| {
            if !quality {
                return Ok(0);
            }
            let answer = assuan.inquire("QUALITY", text)?;
            Ok(answer
                .and_then(|answer| String::from_utf8_lossy(&answer).trim().parse().ok())
                .unwrap_or(0))
        })?;
        match entry {
            Entry::Entered { secret, remember } => {
                if let Some(keygrip) = self.remembers().filter(|_| remember) {
                    kestrel.block_on(Cache::new(kestrel.connection(), keygrip).store(&secret));
                }
                if self.repeat.is_some() {
                    assuan.status("PIN_REPEATED")?;
                }
                assuan.data(&secret)?;
                assuan.ok()
            }
            Entry::Cancelled => assuan.err(assuan::CANCELLED, "Operation cancelled"),
            Entry::TimedOut => assuan.err(assuan::TIMEOUT, "Timeout"),
        }
    }

    fn confirm<R: BufRead, W: Write>(
        &mut self,
        kestrel: &Kestrel,
        assuan: &mut Assuan<R, W>,
        one_button: bool,
    ) -> io::Result<()> {
        let description = self.description.trim();
        let (heading, body) = match self.title.as_str() {
            "" => description.split_once('\n').unwrap_or((description, "")),
            title => (title, description),
        };
        let mut request = Request::default();
        request.text("title", heading.trim());
        request.text("body", body.trim());
        request.text(
            "allow",
            pick(&self.labels.ok, pick(&self.defaults.ok, "OK")),
        );
        if !one_button {
            request.text(
                "deny",
                pick(&self.labels.cancel, pick(&self.defaults.cancel, "Cancel")),
            );
            request.text("alternative", &self.labels.not_ok);
        }
        request.flag("single", one_button);
        match kestrel.confirm(&request, self.timeout) {
            Choice::Accepted => assuan.ok(),
            Choice::Alternative => assuan.err(assuan::NOT_CONFIRMED, "Not confirmed"),
            Choice::Declined if one_button => assuan.ok(),
            Choice::Declined => assuan.err(assuan::CANCELLED, "Operation cancelled"),
            Choice::TimedOut => assuan.err(assuan::TIMEOUT, "Timeout"),
        }
    }
}
