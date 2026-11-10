use std::collections::HashMap;
use std::ops::Range;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, OnceLock};
use std::time::Duration;

use luft_app::Events;
use luft_app::shortcuts::Event;
use parking_lot::{Mutex, RwLock};
use sabine::SabineProcessHandle;
use tokio::sync::OnceCell;

use super::events::{METERS, Meters, STATUS, TRIGGERS};
use super::settings::Settings;
use crate::audio::SoundId;
use crate::audio::engine::{Engine, Mix, Play, SOURCE_NAME, Status, use_as_default};
use crate::audio::pcm::Pcm;
use crate::hotkeys::{self, Action, Hotkey, Hotkeys, Router, shortcut_id};
use crate::library::{Store, Trigger};

const METER_PERIOD: Duration = Duration::from_millis(66);
const CLOSE_SETTLE: Duration = Duration::from_millis(500);
const DEFAULT_ATTEMPTS: u32 = 20;
const DEFAULT_RETRY: Duration = Duration::from_millis(100);

struct Playable {
    pcm: Arc<Pcm>,
    range: Range<usize>,
    gain: f32,
    looping: bool,
    stop_others: bool,
    trigger: Trigger,
}

struct Shared {
    events: Events,
    store: Mutex<Store>,
    playable: RwLock<HashMap<SoundId, Playable>>,
    engine: OnceLock<Engine>,
    settings: Mutex<Settings>,
    status: Mutex<Status>,
    triggers: Mutex<Vec<Hotkey>>,
    hotkeys: Hotkeys,
    hotkeys_opened: OnceCell<()>,
    router: Mutex<Router>,
    process: Mutex<Option<SabineProcessHandle>>,
    window_visible: AtomicBool,
    metering: AtomicBool,
    quitting: AtomicBool,
    engaging_default: AtomicBool,
}

#[derive(Clone)]
pub struct SoundboardState {
    shared: Arc<Shared>,
}

fn data_folder() -> PathBuf {
    dirs::data_dir()
        .expect("the system has a data folder")
        .join(crate::APP_ID)
}

impl SoundboardState {
    pub fn new() -> Result<Self, String> {
        Ok(Self {
            shared: Arc::new(Shared {
                events: Events::default(),
                store: Mutex::new(Store::open(data_folder())?),
                playable: RwLock::default(),
                engine: OnceLock::new(),
                settings: Mutex::new(Settings::load()),
                status: Mutex::default(),
                triggers: Mutex::default(),
                hotkeys: Hotkeys::default(),
                hotkeys_opened: OnceCell::new(),
                router: Mutex::default(),
                process: Mutex::new(None),
                window_visible: AtomicBool::new(false),
                metering: AtomicBool::new(false),
                quitting: AtomicBool::new(false),
                engaging_default: AtomicBool::new(false),
            }),
        })
    }

    pub fn start(&self) {
        let (statuses, status_receiver) = tokio::sync::mpsc::unbounded_channel();
        let engine = Engine::start(self.settings().mix, move |status: &Status| {
            let _ = statuses.send(status.clone());
        });
        let _ = self.shared.engine.set(engine);
        self.refresh_playable();
        self.follow_statuses(status_receiver);
        let hotkeys = self.clone();
        luft_app::spawn(async move { hotkeys.open_hotkeys_once().await });
    }

    fn engine(&self) -> Option<&Engine> {
        self.shared.engine.get()
    }

    pub fn events(&self) -> &Events {
        &self.shared.events
    }

    pub fn store(&self) -> &Mutex<Store> {
        &self.shared.store
    }

    pub fn settings(&self) -> Settings {
        self.shared.settings.lock().clone()
    }

    pub fn status(&self) -> Status {
        self.shared.status.lock().clone()
    }

    pub fn triggers(&self) -> Vec<Hotkey> {
        self.shared.triggers.lock().clone()
    }

    pub fn hotkeys_available(&self) -> bool {
        self.shared.hotkeys.available()
    }

    pub fn set_process(&self, process: SabineProcessHandle) {
        *self.shared.process.lock() = Some(process);
    }

    pub fn quit(&self) {
        self.shared.quitting.store(true, Ordering::Relaxed);
        let _ = self.give_default_back();
        if let Some(process) = &*self.shared.process.lock() {
            process.quit();
        }
    }

    pub fn refresh_playable(&self) {
        let store = self.shared.store.lock();
        let playable = store
            .library
            .sounds()
            .filter_map(|sound| {
                let entry = Playable {
                    pcm: store.pcm(sound.id)?,
                    range: sound.trim_start as usize..sound.trim_end as usize,
                    gain: sound.level,
                    looping: sound.looping,
                    stop_others: sound.stop_others,
                    trigger: sound.trigger,
                };
                Some((sound.id, entry))
            })
            .collect();
        *self.shared.playable.write() = playable;
    }

    pub fn play(&self, sound: SoundId, preview: bool) {
        let playable = self.shared.playable.read();
        let (Some(entry), Some(engine)) = (playable.get(&sound), self.engine()) else {
            return;
        };
        engine.play(Play {
            sound,
            pcm: entry.pcm.clone(),
            range: entry.range.clone(),
            gain: entry.gain,
            looping: entry.looping,
            stop_others: entry.stop_others,
            preview,
        });
    }

    pub fn stop(&self, sound: SoundId) {
        if let Some(engine) = self.engine() {
            engine.stop(sound);
        }
    }

    pub fn stop_all(&self) {
        if let Some(engine) = self.engine() {
            engine.stop_all();
        }
    }

    fn follow_statuses(&self, mut statuses: tokio::sync::mpsc::UnboundedReceiver<Status>) {
        let state = self.clone();
        luft_app::spawn(async move {
            while let Some(status) = statuses.recv().await {
                *state.shared.status.lock() = status.clone();
                state.keep_default_input(&status);
                state.shared.events.emit(STATUS, status);
                state.start_meters();
            }
        });
    }

    fn keep_default_input(&self, status: &Status) {
        let wanted = self.shared.settings.lock().use_as_default
            && !self.shared.quitting.load(Ordering::Relaxed);
        if !status.connected
            || !wanted
            || status.default_input.as_deref() == Some(SOURCE_NAME)
            || self.shared.engaging_default.swap(true, Ordering::Relaxed)
        {
            return;
        }
        let state = self.clone();
        let status = status.clone();
        luft_app::spawn(async move {
            let mut attempt = state.engage_default(&status);
            for _ in 1..DEFAULT_ATTEMPTS {
                if attempt.is_ok() {
                    break;
                }
                tokio::time::sleep(DEFAULT_RETRY).await;
                attempt = state.engage_default(&status);
            }
            if let Err(error) = attempt {
                eprintln!("Couldn't become the default input: {error}");
            }
            state
                .shared
                .engaging_default
                .store(false, Ordering::Relaxed);
        });
    }

    fn engage_default(&self, status: &Status) -> Result<(), String> {
        let mut settings = self.shared.settings.lock();
        if settings.default_before.is_none() {
            settings.default_before = status.default_input.clone();
            settings.save()?;
        }
        use_as_default(SOURCE_NAME)
    }

    pub fn set_use_as_default(&self, enabled: bool) -> Result<(), String> {
        self.shared.settings.lock().use_as_default = enabled;
        if enabled {
            let status = self.status();
            self.engage_default(&status)?;
        } else {
            self.give_default_back()?;
        }
        self.shared.settings.lock().save()
    }

    pub fn give_default_back(&self) -> Result<(), String> {
        let before = self.shared.settings.lock().default_before.take();
        if let Some(before) = before {
            use_as_default(&before)?;
        }
        self.shared.settings.lock().save()
    }

    pub fn set_mix(&self, mix: Mix) -> Result<(), String> {
        if let Some(engine) = self.engine() {
            engine.set_mix(mix.clone());
        }
        let mut settings = self.shared.settings.lock();
        settings.mix = mix;
        settings.save()
    }

    pub fn set_keep_running(&self, keep_running: bool) -> Result<(), String> {
        let mut settings = self.shared.settings.lock();
        settings.keep_running = keep_running;
        settings.save()
    }

    pub async fn open_hotkeys_once(&self) {
        self.shared
            .hotkeys_opened
            .get_or_init(|| async {
                let state = self.clone();
                let opened = self
                    .shared
                    .hotkeys
                    .open(move |event| state.on_hotkey(event))
                    .await;
                if opened.is_ok() {
                    let _ = self.bind_hotkeys().await;
                }
            })
            .await;
    }

    fn on_hotkey(&self, event: Event) {
        let action = {
            let playable = self.shared.playable.read();
            let trigger_of = |sound: SoundId| playable.get(&sound).map(|entry| entry.trigger);
            self.shared.router.lock().route(event, trigger_of)
        };
        match action {
            Some(Action::Play(sound)) => self.play(sound, false),
            Some(Action::Stop(sound)) => self.stop(sound),
            Some(Action::StopAll) => self.stop_all(),
            Some(Action::Rebound(bound)) => self.publish_triggers(hotkeys::changed(bound)),
            None => {}
        }
    }

    fn publish_triggers(&self, triggers: Vec<Hotkey>) {
        *self.shared.triggers.lock() = triggers.clone();
        self.shared.events.emit(TRIGGERS, triggers);
    }

    pub async fn bind_hotkeys(&self) -> Result<(), String> {
        let sounds: Vec<(String, String)> = {
            let store = self.shared.store.lock();
            store
                .library
                .sounds()
                .map(|sound| (shortcut_id(sound.id), sound.name.clone()))
                .collect()
        };
        let triggers = self.shared.hotkeys.bind(&sounds).await?;
        self.publish_triggers(triggers);
        Ok(())
    }

    pub async fn configure_hotkeys(&self) -> Result<(), String> {
        self.shared.hotkeys.configure().await
    }

    pub fn window_shown(&self, visible: bool) {
        self.shared.window_visible.store(visible, Ordering::Relaxed);
        if visible {
            self.start_meters();
            return;
        }
        let state = self.clone();
        luft_app::spawn(async move {
            tokio::time::sleep(CLOSE_SETTLE).await;
            let closed = !state.shared.events.emit(STATUS, state.status());
            if closed && !state.shared.settings.lock().keep_running {
                state.quit();
            }
        });
    }

    fn start_meters(&self) {
        if self.shared.metering.swap(true, Ordering::Relaxed) {
            return;
        }
        let state = self.clone();
        luft_app::spawn(async move {
            while state.wants_meters() {
                let (voice, output) = state.engine().map_or((0.0, 0.0), Engine::meters);
                state.shared.events.emit(METERS, Meters { voice, output });
                tokio::time::sleep(METER_PERIOD).await;
            }
            state.shared.metering.store(false, Ordering::Relaxed);
            state.shared.events.emit(
                METERS,
                Meters {
                    voice: 0.0,
                    output: 0.0,
                },
            );
        });
    }

    fn wants_meters(&self) -> bool {
        let status = self.shared.status.lock();
        self.shared.window_visible.load(Ordering::Relaxed)
            && (status.passing.is_some() || !status.playing.is_empty())
    }
}
