use std::sync::{Arc, Mutex, PoisonError};

use serde::{Deserialize, Serialize};
use xkbcommon::xkb;

use super::definition::Method;
use crate::engine::{Engine, Input, Learned, Response, Session};

#[derive(Default)]
struct Typing {
    engine: Option<Engine>,
    session: Session,
    learned: Learned,
}

#[derive(Clone, Default)]
pub struct Preview(Arc<Mutex<Typing>>);

#[derive(Deserialize)]
pub struct Pick {
    index: usize,
}

#[derive(Deserialize)]
pub struct Press {
    keysym: Option<String>,
    text: Option<String>,
    before: String,
}

#[derive(Serialize)]
pub struct Shown {
    handled: bool,
    commit: String,
    preedit: String,
    candidates: Vec<String>,
    selected: usize,
    first: usize,
    total: usize,
}

impl Preview {
    pub fn load(&self, method: &Method) {
        let mut typing = self.0.lock().unwrap_or_else(PoisonError::into_inner);
        typing.engine = Some(Engine::new(method));
        typing.session.reset();
    }

    pub fn press(
        &self,
        Press {
            keysym,
            text,
            before,
        }: Press,
    ) -> Result<Shown, String> {
        self.with(|engine, session, learned| {
            session.surrounding(&before);
            let input = match (text.and_then(|text| text.chars().next()), keysym) {
                (Some(character), _) => Input::from_text(character, engine.compose()),
                (None, Some(name)) => Input::from_keysym(
                    xkb::keysym_from_name(&name, xkb::KEYSYM_NO_FLAGS),
                    engine.compose(),
                ),
                (None, None) => Input::Other,
            };
            session.feed(engine, learned, input)
        })
    }

    pub fn pick(&self, Pick { index }: Pick) -> Result<Shown, String> {
        self.with(|engine, session, learned| {
            let first = session.cursor() - session.cursor() % engine.page();
            session.pick(engine, learned, first + index)
        })
    }

    fn with(
        &self,
        act: impl FnOnce(&Engine, &mut Session, &mut Learned) -> Response,
    ) -> Result<Shown, String> {
        let mut guard = self.0.lock().unwrap_or_else(PoisonError::into_inner);
        let Typing {
            engine,
            session,
            learned,
        } = &mut *guard;
        let engine = engine.as_ref().ok_or("Nothing to try yet")?;
        let response = act(engine, session, learned);
        let page = engine.page();
        let first = session.cursor() - session.cursor() % page;
        let candidates = session.candidates();
        Ok(Shown {
            handled: response.handled,
            commit: response.commit,
            preedit: session.preedit(engine),
            candidates: candidates
                .iter()
                .skip(first)
                .take(page)
                .map(|candidate| candidate.text.clone())
                .collect(),
            selected: session.cursor() - first,
            first,
            total: candidates.len(),
        })
    }
}
