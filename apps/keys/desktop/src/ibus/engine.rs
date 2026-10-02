use std::fs;
use std::time::SystemTime;

use xkbcommon::xkb::Keysym;
use zbus::object_server::SignalEmitter;
use zbus::zvariant::Value;
use zbus::{fdo, interface};

use super::wire;
use crate::engine::{Engine, Input, Learned, Session};
use crate::method::definition::{self, Method};

const RELEASED: u32 = 1 << 30;
const SHORTCUT_MODIFIERS: u32 = (1 << 2) | (1 << 3) | (1 << 6) | (1 << 26) | (1 << 28);
const PREEDIT_COMMIT: u32 = 1;

pub struct InputMethod {
    id: String,
    engine: Engine,
    session: Session,
    learned: Learned,
    modified: Option<SystemTime>,
    showing: bool,
}

fn modified(id: &str) -> Option<SystemTime> {
    fs::metadata(definition::file(id))
        .and_then(|metadata| metadata.modified())
        .ok()
}

impl InputMethod {
    pub fn load(id: &str) -> Result<Self, String> {
        let method: Method = definition::load(id)?;
        Ok(Self {
            id: id.to_owned(),
            engine: Engine::new(&method),
            session: Session::default(),
            learned: Learned::load(id),
            modified: modified(id),
            showing: false,
        })
    }

    fn refresh(&mut self) {
        let current = modified(&self.id);
        if current == self.modified {
            return;
        }
        if let Ok(method) = definition::load(&self.id) {
            self.engine = Engine::new(&method);
            self.session.reset();
            self.modified = current;
        }
    }

    async fn show(&mut self, emitter: &SignalEmitter<'_>, commit: String) -> fdo::Result<()> {
        if !commit.is_empty() {
            Self::commit_text(emitter, &wire::text(&commit)).await?;
        }
        let active = self.session.is_active();
        if !active && !self.showing {
            return Ok(());
        }
        self.showing = active;
        let preedit = self.session.preedit(&self.engine);
        let cursor = preedit.chars().count() as u32;
        Self::update_preedit_text(
            emitter,
            &wire::underlined(&preedit),
            cursor,
            active,
            PREEDIT_COMMIT,
        )
        .await?;
        let candidates: Vec<String> = self
            .session
            .candidates()
            .iter()
            .map(|candidate| candidate.text.clone())
            .collect();
        let table = wire::lookup_table(
            &candidates,
            self.engine.page() as u32,
            self.session.cursor() as u32,
        );
        Self::update_lookup_table(emitter, &table, !candidates.is_empty()).await?;
        Ok(())
    }

    async fn feed(&mut self, emitter: &SignalEmitter<'_>, input: Input) -> fdo::Result<bool> {
        let response = self.session.feed(&self.engine, &mut self.learned, input);
        self.show(emitter, response.commit).await?;
        Ok(response.handled)
    }

    async fn clear(&mut self, emitter: &SignalEmitter<'_>) -> fdo::Result<()> {
        self.session.reset();
        self.learned.save();
        self.show(emitter, String::new()).await
    }
}

#[interface(name = "org.freedesktop.IBus.Engine")]
impl InputMethod {
    async fn process_key_event(
        &mut self,
        keyval: u32,
        _keycode: u32,
        state: u32,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<bool> {
        if state & RELEASED != 0 {
            return Ok(false);
        }
        if state & SHORTCUT_MODIFIERS != 0 {
            if self.session.is_active() {
                self.feed(&emitter, Input::Other).await?;
            }
            return Ok(false);
        }
        let input = Input::from_keysym(Keysym::new(keyval), self.engine.compose());
        self.feed(&emitter, input).await
    }

    async fn candidate_clicked(
        &mut self,
        index: u32,
        _button: u32,
        _state: u32,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        let page = self.engine.page();
        let first = self.session.cursor() - self.session.cursor() % page;
        let response = self
            .session
            .pick(&self.engine, &mut self.learned, first + index as usize);
        self.show(&emitter, response.commit).await
    }

    async fn focus_in(
        &mut self,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.refresh();
        self.session.forget();
        self.show(&emitter, String::new()).await
    }

    async fn focus_in_id(
        &mut self,
        _object_path: String,
        _client: String,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.focus_in(emitter).await
    }

    async fn focus_out(
        &mut self,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.clear(&emitter).await
    }

    async fn focus_out_id(
        &mut self,
        _object_path: String,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.clear(&emitter).await
    }

    async fn reset(
        &mut self,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.clear(&emitter).await
    }

    async fn enable(&mut self) {
        self.refresh();
    }

    async fn disable(
        &mut self,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.clear(&emitter).await
    }

    async fn page_up(
        &mut self,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.feed(&emitter, Input::PageUp).await.map(drop)
    }

    async fn page_down(
        &mut self,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.feed(&emitter, Input::PageDown).await.map(drop)
    }

    async fn cursor_up(
        &mut self,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.feed(&emitter, Input::Up).await.map(drop)
    }

    async fn cursor_down(
        &mut self,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<()> {
        self.feed(&emitter, Input::Down).await.map(drop)
    }

    async fn set_surrounding_text(&mut self, text: Value<'_>, cursor_pos: u32, _anchor_pos: u32) {
        if let Some(text) = wire::plain(&text) {
            let before: String = text.chars().take(cursor_pos as usize).collect();
            self.session.surrounding(&before);
        }
    }

    async fn set_cursor_location(&self, _x: i32, _y: i32, _w: i32, _h: i32) {}

    async fn set_capabilities(&self, _caps: u32) {}

    async fn property_activate(&self, _name: String, _state: u32) {}

    async fn property_show(&self, _name: String) {}

    async fn property_hide(&self, _name: String) {}

    async fn process_hand_writing_event(&self, _coordinates: Vec<f64>) {}

    async fn cancel_hand_writing(&self, _n_strokes: u32) {}

    async fn panel_extension_received(&self, _event: Value<'_>) {}

    async fn panel_extension_register_keys(&self, _data: Value<'_>) {}

    #[zbus(property)]
    fn focus_id(&self) -> bool {
        false
    }

    #[zbus(property)]
    fn active_surrounding_text(&self) -> bool {
        self.engine.is_contextual()
    }

    #[zbus(signal)]
    async fn commit_text(emitter: &SignalEmitter<'_>, text: &Value<'_>) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn update_preedit_text(
        emitter: &SignalEmitter<'_>,
        text: &Value<'_>,
        cursor_pos: u32,
        visible: bool,
        mode: u32,
    ) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn update_lookup_table(
        emitter: &SignalEmitter<'_>,
        table: &Value<'_>,
        visible: bool,
    ) -> zbus::Result<()>;
}
