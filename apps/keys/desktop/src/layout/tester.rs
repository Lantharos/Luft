use std::ffi::OsString;
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;

use xkbcommon::xkb;

use super::compile;

enum Request {
    Load(String, Sender<Result<(), String>>),
    Key(String, bool, Sender<String>),
}

#[derive(Clone)]
pub struct Tester(Sender<Request>);

struct Typing {
    keymap: xkb::Keymap,
    state: xkb::State,
    compose: Option<xkb::compose::State>,
}

fn locale() -> OsString {
    ["LC_ALL", "LC_CTYPE", "LANG"]
        .iter()
        .filter_map(std::env::var_os)
        .find(|value| !value.is_empty() && value != "C" && value != "POSIX")
        .unwrap_or_else(|| "en_US.UTF-8".into())
}

fn compose_state() -> Option<xkb::compose::State> {
    let context = xkb::Context::new(xkb::CONTEXT_NO_FLAGS);
    let table =
        xkb::compose::Table::new_from_locale(&context, &locale(), xkb::compose::COMPILE_NO_FLAGS)
            .ok()?;
    Some(xkb::compose::State::new(
        &table,
        xkb::compose::STATE_NO_FLAGS,
    ))
}

impl Typing {
    fn press(&mut self, name: &str, down: bool) -> String {
        let Some(key) = self.keymap.key_by_name(name) else {
            return String::new();
        };
        if !down {
            self.state.update_key(key, xkb::KeyDirection::Up);
            return String::new();
        }
        let keysym = self.state.key_get_one_sym(key);
        let typed = self.state.key_get_utf8(key);
        self.state.update_key(key, xkb::KeyDirection::Down);
        let Some(compose) = self.compose.as_mut() else {
            return typed;
        };
        if compose.feed(keysym) == xkb::compose::FeedResult::Ignored {
            return typed;
        }
        match compose.status() {
            xkb::compose::Status::Composed => {
                let text = compose.utf8().unwrap_or_default();
                compose.reset();
                text
            }
            xkb::compose::Status::Nothing => typed,
            _ => String::new(),
        }
    }
}

fn serve(requests: Receiver<Request>) {
    let mut typing: Option<Typing> = None;
    for request in requests {
        match request {
            Request::Load(symbols, reply) => {
                let loaded = compile::symbols(&symbols).map(|compiled| Typing {
                    state: xkb::State::new(&compiled.keymap),
                    keymap: compiled.keymap,
                    compose: compose_state(),
                });
                let _ = reply.send(loaded.as_ref().map(|_| ()).map_err(Clone::clone));
                if let Ok(loaded) = loaded {
                    typing = Some(loaded);
                }
            }
            Request::Key(name, down, reply) => {
                let typed = typing
                    .as_mut()
                    .map(|typing| typing.press(&name, down))
                    .unwrap_or_default();
                let _ = reply.send(typed);
            }
        }
    }
}

impl Tester {
    pub fn start() -> Self {
        let (sender, requests) = mpsc::channel();
        thread::Builder::new()
            .name("keys-tester".into())
            .spawn(move || serve(requests))
            .expect("the typing tester thread starts");
        Self(sender)
    }

    pub fn load(&self, symbols: String) -> Result<(), String> {
        let (reply, answer) = mpsc::channel();
        self.0
            .send(Request::Load(symbols, reply))
            .map_err(|error| error.to_string())?;
        answer.recv().map_err(|error| error.to_string())?
    }

    pub fn key(&self, name: String, down: bool) -> Result<String, String> {
        let (reply, answer) = mpsc::channel();
        self.0
            .send(Request::Key(name, down, reply))
            .map_err(|error| error.to_string())?;
        answer.recv().map_err(|error| error.to_string())
    }
}
