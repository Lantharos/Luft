use std::cell::RefCell;
use std::collections::{HashMap, VecDeque};
use std::rc::Rc;
use std::sync::Arc;
use std::time::Duration;

use pipewire as pw;
use pw::metadata::{Metadata, MetadataListener};
use pw::registry::{GlobalObject, RegistryRc};
use pw::spa::support::system::IoFlags;
use pw::spa::utils::dict::DictRef;
use pw::spa::utils::result::AsyncSeq;
use pw::types::ObjectType;
use rustix::event::{EventfdFlags, eventfd};
use rustix::fd::OwnedFd;
use serde::Deserialize;

use super::super::SoundId;
use super::super::mixer::{Mixer, MixerControl, Order, Output, Voice, VoiceSpec};
use super::streams::{self, Handle, Levels, Shared, VoiceRing, VoiceWriter};
use super::{Command, Microphone, Mix, Play, SOURCE_NAME, Status};

/// One round for the registry to name everything, one for what binding the default metadata then told us.
const SYNC_ROUNDS: u32 = 2;
const RECONNECT: Duration = Duration::from_secs(2);
const DEFAULT_METADATA: &str = "default";
const DEFAULT_SOURCE: &str = "default.audio.source";
const SOURCE_CLASSES: [&str; 3] = ["Audio/Source", "Audio/Source/Virtual", "Audio/Duplex"];

struct Node {
    name: String,
    description: String,
    class: String,
    priority: i32,
}

/// What the sound server said since the graph last looked. Callbacks only write here, so the graph can follow it from
/// one place.
#[derive(Default)]
struct Facts {
    nodes: HashMap<u32, Node>,
    links: HashMap<u32, (u32, u32)>,
    default_input: Option<String>,
    lost: bool,
    finished_sync: Option<AsyncSeq>,
}

impl Facts {
    fn links_from(&self, node: u32) -> usize {
        self.links
            .values()
            .filter(|(output, _)| *output == node)
            .count()
    }

    fn sources(&self) -> impl Iterator<Item = &Node> {
        self.nodes.values().filter(|node| {
            node.name != SOURCE_NAME && SOURCE_CLASSES.contains(&node.class.as_str())
        })
    }

    fn microphones(&self) -> Vec<Microphone> {
        let mut microphones: Vec<_> = self
            .sources()
            .map(|node| Microphone {
                name: node.name.clone(),
                description: node.description.clone(),
            })
            .collect();
        microphones.sort_by(|a, b| a.description.cmp(&b.description));
        microphones
    }

    /// The real microphone to pass through: never the virtual one, even while that's the system's default input.
    fn microphone(&self, chosen: Option<&str>) -> Option<String> {
        let exists = |name: &&str| self.sources().any(|node| node.name == *name);
        chosen
            .filter(exists)
            .or(self.default_input.as_deref().filter(exists))
            .map(str::to_owned)
            .or_else(|| {
                self.sources()
                    .max_by_key(|node| node.priority)
                    .map(|node| node.name.clone())
            })
    }
}

#[derive(Deserialize)]
struct NamedDefault {
    name: String,
}

fn text(props: &DictRef, key: &str) -> Option<String> {
    props.get(key).map(str::to_owned)
}

fn number<T: std::str::FromStr>(props: &DictRef, key: &str) -> Option<T> {
    props.get(key)?.parse().ok()
}

fn learn(facts: &RefCell<Facts>, global: &GlobalObject<&DictRef>) {
    let Some(props) = global.props else {
        return;
    };
    match global.type_ {
        ObjectType::Node => {
            let Some(name) = text(props, *pw::keys::NODE_NAME) else {
                return;
            };
            let description =
                text(props, *pw::keys::NODE_DESCRIPTION).unwrap_or_else(|| name.clone());
            let node = Node {
                name,
                description,
                class: text(props, *pw::keys::MEDIA_CLASS).unwrap_or_default(),
                priority: number(props, *pw::keys::PRIORITY_SESSION).unwrap_or(0),
            };
            facts.borrow_mut().nodes.insert(global.id, node);
        }
        ObjectType::Link => {
            let ends = number(props, *pw::keys::LINK_OUTPUT_NODE)
                .zip(number(props, *pw::keys::LINK_INPUT_NODE));
            if let Some(ends) = ends {
                facts.borrow_mut().links.insert(global.id, ends);
            }
        }
        _ => {}
    }
}

/// Keeps the metadata proxy alive and copies the default input into the facts.
struct DefaultInput {
    _metadata: Metadata,
    _listener: MetadataListener,
}

fn follow_default_input(
    registry: &RegistryRc,
    global: &GlobalObject<&DictRef>,
    facts: &Rc<RefCell<Facts>>,
) -> Option<DefaultInput> {
    let metadata: Metadata = registry.bind(global).ok()?;
    let facts = facts.clone();
    let listener = metadata
        .add_listener_local()
        .property(move |_, key, _, value| {
            if key == Some(DEFAULT_SOURCE) {
                facts.borrow_mut().default_input = value
                    .and_then(|value| serde_json::from_str::<NamedDefault>(value).ok())
                    .map(|default| default.name);
            }
            0
        })
        .register();
    Some(DefaultInput {
        _metadata: metadata,
        _listener: listener,
    })
}

struct Playing {
    sound: SoundId,
    outputs: [bool; 2],
}

type Capture<'c> = Handle<'c, (VoiceWriter, Arc<Levels>)>;

struct Graph<'c> {
    core: &'c pw::core::Core,
    facts: Rc<RefCell<Facts>>,
    shared: Arc<Shared>,
    control: MixerControl,
    source: Handle<'c, (Arc<Shared>, VoiceRing)>,
    monitor: Handle<'c, Arc<Shared>>,
    voice_writer: VoiceWriter,
    capture: Option<(String, Capture<'c>)>,
    playing: Vec<Playing>,
    mix: Mix,
}

impl<'c> Graph<'c> {
    fn new(
        core: &'c pw::core::Core,
        facts: Rc<RefCell<Facts>>,
        mix: Mix,
        levels: Arc<Levels>,
        wake: OwnedFd,
    ) -> Result<Self, pw::Error> {
        let (mixer, control) = Mixer::new();
        let shared = Arc::new(Shared::new(mixer, levels, wake));
        let voice = VoiceRing::new();
        let voice_writer = voice.writer();
        Ok(Self {
            source: streams::virtual_microphone(core, shared.clone(), voice)?,
            monitor: streams::monitor(core, shared.clone())?,
            core,
            facts,
            shared,
            control,
            voice_writer,
            capture: None,
            playing: Vec::new(),
            mix,
        })
    }

    fn links(&self, output: Output) -> usize {
        let stream = match output {
            Output::Microphone => &self.source.stream,
            Output::Monitor => &self.monitor.stream,
        };
        self.facts.borrow().links_from(stream.node_id())
    }

    fn take(&mut self, commands: &mut VecDeque<Command>) -> bool {
        while let Some(command) = commands.pop_front() {
            match command {
                Command::Play(play) => self.play(*play),
                Command::Stop(sound) => self.order(Order::Stop(sound)),
                Command::StopAll => self.order(Order::StopAll),
                Command::Mix(mix) => {
                    self.shared.levels.apply(&mix);
                    self.mix = mix;
                }
                Command::Quit => return false,
            }
        }
        true
    }

    fn play(&mut self, play: Play) {
        let is_playing = self
            .playing
            .iter()
            .any(|playing| playing.sound == play.sound);
        if play.looping && is_playing {
            self.order(Order::Stop(play.sound));
            return;
        }
        let outputs = [
            !play.preview && self.links(Output::Microphone) > 0,
            (play.preview || self.mix.monitor_on) && self.links(Output::Monitor) > 0,
        ];
        if outputs == [false, false] {
            return;
        }
        if play.stop_others {
            self.order(Order::StopAll);
        } else if is_playing {
            self.order(Order::Stop(play.sound));
        }
        play.pcm.prefault(play.range.clone());
        self.playing.push(Playing {
            sound: play.sound,
            outputs,
        });
        self.set_activity();
        let spec = VoiceSpec {
            sound: play.sound,
            pcm: play.pcm,
            range: play.range,
            gain: play.gain,
            looping: play.looping,
        };
        self.order(Order::Start(Voice::new(spec, outputs)));
    }

    fn order(&mut self, order: Order) {
        let _ = self.control.orders.push(order);
        if !streams::streaming(&self.source.stream) && !streams::streaming(&self.monitor.stream) {
            self.shared.mixer.lock().take_orders();
        }
    }

    fn collect_finished(&mut self) {
        while let Ok(voice) = self.control.retired.pop() {
            if let Some(index) = self
                .playing
                .iter()
                .position(|playing| playing.sound == voice.sound())
            {
                self.playing.remove(index);
            }
        }
    }

    fn follow_listeners(&mut self) {
        for output in Output::ALL {
            let heard = self
                .playing
                .iter()
                .any(|playing| playing.outputs[output as usize]);
            if heard && self.links(output) == 0 {
                self.order(Order::Abandon(output));
                self.shared.mixer.lock().take_orders();
                self.playing
                    .iter_mut()
                    .for_each(|playing| playing.outputs[output as usize] = false);
            }
        }
        self.collect_finished();
    }

    fn follow_microphone(&mut self) {
        let wanted = (self.links(Output::Microphone) > 0 && !self.mix.microphone_muted)
            .then(|| {
                self.facts
                    .borrow()
                    .microphone(self.mix.microphone.as_deref())
            })
            .flatten();
        if self.capture.as_ref().map(|(target, _)| target) == wanted.as_ref() {
            return;
        }
        self.capture = None;
        if let Some(target) = wanted {
            let writer = self.voice_writer.clone();
            if let Ok(handle) =
                streams::capture(self.core, &target, writer, self.shared.levels.clone())
            {
                self.capture = Some((target, handle));
            }
        }
    }

    fn set_activity(&self) {
        let heard = |output: Output| {
            self.playing
                .iter()
                .any(|playing| playing.outputs[output as usize])
        };
        let _ = self
            .source
            .stream
            .set_active(self.capture.is_some() || heard(Output::Microphone));
        let _ = self.monitor.stream.set_active(heard(Output::Monitor));
    }

    fn sync(&mut self) {
        self.collect_finished();
        self.follow_listeners();
        self.follow_microphone();
        self.set_activity();
    }

    fn status(&self) -> Status {
        let facts = self.facts.borrow();
        let mut playing: Vec<_> = self.playing.iter().map(|playing| playing.sound).collect();
        playing.dedup();
        Status {
            connected: false,
            listeners: self.links(Output::Microphone) as u32,
            microphones: facts.microphones(),
            passing: self.capture.as_ref().map(|(target, _)| target.clone()),
            default_input: facts.default_input.clone(),
            playing,
        }
    }
}

enum Ended {
    Quit,
    Lost,
}

fn run_connected(
    mainloop: &pw::main_loop::MainLoopRc,
    commands: &Rc<RefCell<VecDeque<Command>>>,
    mix: &mut Mix,
    levels: &Arc<Levels>,
    report: &mut impl FnMut(&Status),
) -> Result<Ended, pw::Error> {
    let context = pw::context::ContextRc::new(mainloop, None)?;
    let core = context.connect_rc(None)?;
    let registry = core.get_registry_rc()?;
    let facts = Rc::new(RefCell::new(Facts::default()));

    let wake = eventfd(0, EventfdFlags::CLOEXEC | EventfdFlags::NONBLOCK)
        .map_err(|_| pw::Error::CreationFailed)?;
    let waker = wake.try_clone().map_err(|_| pw::Error::CreationFailed)?;
    let _wake = mainloop.loop_().add_io(wake, IoFlags::IN, |wake| {
        let mut count = [0; 8];
        let _ = rustix::io::read(&*wake, &mut count);
    });

    let default_input: Rc<RefCell<Option<DefaultInput>>> = Rc::default();
    let _registry = registry
        .add_listener_local()
        .global({
            let facts = facts.clone();
            let registry = registry.clone();
            let default_input = default_input.clone();
            move |global| {
                let named = global.props.and_then(|props| props.get("metadata.name"));
                if global.type_ == ObjectType::Metadata && named == Some(DEFAULT_METADATA) {
                    *default_input.borrow_mut() = follow_default_input(&registry, global, &facts);
                }
                learn(&facts, global);
            }
        })
        .global_remove({
            let facts = facts.clone();
            move |id| {
                let mut facts = facts.borrow_mut();
                facts.nodes.remove(&id);
                facts.links.remove(&id);
            }
        })
        .register();
    let _core = core
        .add_listener_local()
        .done({
            let facts = facts.clone();
            move |id, seq| {
                if id == pw::core::PW_ID_CORE {
                    facts.borrow_mut().finished_sync = Some(seq);
                }
            }
        })
        .error({
            let facts = facts.clone();
            move |id, _, _, _| {
                if id == pw::core::PW_ID_CORE {
                    facts.borrow_mut().lost = true;
                }
            }
        })
        .register();

    let mut graph = Graph::new(&core, facts.clone(), mix.clone(), levels.clone(), waker)?;
    let mut reported = Status::default();
    let mut sync = core.sync(0)?;
    let mut rounds = 0;
    loop {
        let keep_going = graph.take(&mut commands.borrow_mut());
        *mix = graph.mix.clone();
        if !keep_going {
            return Ok(Ended::Quit);
        }
        if rounds < SYNC_ROUNDS && facts.borrow_mut().finished_sync.take() == Some(sync) {
            rounds += 1;
            if rounds < SYNC_ROUNDS {
                sync = core.sync(0)?;
            }
        }
        graph.sync();
        let status = Status {
            connected: rounds == SYNC_ROUNDS,
            ..graph.status()
        };
        if status != reported {
            report(&status);
            reported = status;
        }
        if facts.borrow().lost {
            return Ok(Ended::Lost);
        }
        mainloop.loop_().iterate(pw::loop_::Timeout::Infinite);
    }
}

pub fn run(
    receiver: pw::channel::Receiver<Command>,
    mut mix: Mix,
    levels: Arc<Levels>,
    mut report: impl FnMut(&Status),
) {
    pw::init();
    let Ok(mainloop) = pw::main_loop::MainLoopRc::new(None) else {
        return;
    };
    let commands: Rc<RefCell<VecDeque<Command>>> = Rc::default();
    let incoming = commands.clone();
    let _commands = receiver.attach(mainloop.loop_(), move |command| {
        incoming.borrow_mut().push_back(command)
    });
    loop {
        match run_connected(&mainloop, &commands, &mut mix, &levels, &mut report) {
            Ok(Ended::Quit) => return,
            Ok(Ended::Lost) | Err(_) => report(&Status::default()),
        }
        mainloop
            .loop_()
            .iterate(pw::loop_::Timeout::Finite(RECONNECT));
        for command in commands.borrow_mut().drain(..) {
            match command {
                Command::Quit => return,
                Command::Mix(change) => {
                    levels.apply(&change);
                    mix = change;
                }
                Command::Play(_) | Command::Stop(_) | Command::StopAll => {}
            }
        }
    }
}
