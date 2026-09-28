use std::cell::{Cell, RefCell};
use std::collections::BTreeMap;
use std::rc::Rc;

use libpulse_binding::callbacks::ListResult;
use libpulse_binding::context::Context;
use libpulse_binding::context::ext_stream_restore::{self, StreamRestore};
use libpulse_binding::context::introspect::Introspector;
use libpulse_binding::context::subscribe::{Facility, InterestMaskSet, Operation};
use libpulse_binding::proplist::UpdateMode;
use libpulse_binding::volume::ChannelVolumes;
use luft_app::Events;

use super::card::Card;
use super::meter::Meter;
use super::model::{ALERT_STREAM, Alert, App, Device, State, scaled};
use super::service::Command;
use super::{Direction, Target};

const SOUND_CHANGED: &str = "sound.changed";
const INITIAL_QUERIES: usize = 6;

type Done = Box<dyn FnOnce(&Pulse)>;

#[derive(Clone)]
pub struct Pulse {
    context: Rc<RefCell<Context>>,
    restore: Rc<RefCell<Option<StreamRestore>>>,
    state: Rc<RefCell<State>>,
    meter: Rc<RefCell<Option<Meter>>>,
    metering: Rc<Cell<bool>>,
    events: Events,
}

fn once(done: Done) -> impl FnMut(&Pulse) {
    let mut done = Some(done);
    move |pulse| {
        if let Some(done) = done.take() {
            done(pulse);
        }
    }
}

impl Pulse {
    pub fn new(context: Rc<RefCell<Context>>, events: Events) -> Self {
        Self {
            context,
            restore: Rc::default(),
            state: Rc::default(),
            meter: Rc::default(),
            metering: Rc::default(),
            events,
        }
    }

    fn introspect(&self) -> Introspector {
        self.context.borrow().introspect()
    }

    pub fn start(&self) {
        let mut context = self.context.borrow_mut();
        let pulse = self.clone();
        context.set_subscribe_callback(Some(Box::new(move |facility, operation, index| {
            if let (Some(facility), Some(operation)) = (facility, operation) {
                pulse.changed(facility, operation, index);
            }
        })));
        context.subscribe(
            InterestMaskSet::SINK
                | InterestMaskSet::SOURCE
                | InterestMaskSet::SINK_INPUT
                | InterestMaskSet::CARD
                | InterestMaskSet::SERVER,
            |_| {},
        );
        let mut restore = context.stream_restore();
        let pulse = self.clone();
        restore.set_subscribe_cb(move || pulse.load_alert(Box::new(Pulse::publish)));
        restore.subscribe(true, |_| {});
        drop(context);
        *self.restore.borrow_mut() = Some(restore);
        self.load_all();
    }

    fn load_all(&self) {
        let pending = Rc::new(Cell::new(INITIAL_QUERIES));
        let finish = move || -> Done {
            let pending = Rc::clone(&pending);
            Box::new(move |pulse: &Pulse| {
                pending.set(pending.get() - 1);
                if pending.get() == 0 {
                    pulse.state.borrow_mut().ready = true;
                    pulse.publish();
                    pulse.sync_meter();
                }
            })
        };
        self.load_server(finish());
        self.load_outputs(finish());
        self.load_inputs(finish());
        self.load_apps(finish());
        self.load_cards(finish());
        self.load_alert(finish());
    }

    fn publish(&self) {
        let state = self.state.borrow();
        if state.ready {
            self.events.emit(SOUND_CHANGED, state.snapshot());
        }
    }

    fn changed(&self, facility: Facility, operation: Operation, index: u32) {
        if operation == Operation::Removed {
            let mut state = self.state.borrow_mut();
            match facility {
                Facility::Sink => drop(state.outputs.remove(&index)),
                Facility::Source => drop(state.inputs.remove(&index)),
                Facility::SinkInput => drop(state.apps.remove(&index)),
                Facility::Card => drop(state.cards.remove(&index)),
                _ => return,
            }
            drop(state);
            return self.publish();
        }
        match facility {
            Facility::Sink => self.update_output(index),
            Facility::Source => self.update_input(index),
            Facility::SinkInput => self.update_app(index),
            Facility::Card => self.update_card(index),
            Facility::Server => self.load_server(Box::new(|pulse| {
                pulse.publish();
                pulse.sync_meter();
            })),
            _ => {}
        }
    }

    fn load_server(&self, done: Done) {
        let pulse = self.clone();
        let mut done = once(done);
        self.introspect().get_server_info(move |info| {
            let mut state = pulse.state.borrow_mut();
            state.default_output = info
                .default_sink_name
                .as_deref()
                .unwrap_or_default()
                .to_owned();
            state.default_input = info
                .default_source_name
                .as_deref()
                .unwrap_or_default()
                .to_owned();
            drop(state);
            done(&pulse);
        });
    }

    fn load_outputs(&self, done: Done) {
        let pulse = self.clone();
        let mut done = once(done);
        let mut found = BTreeMap::new();
        self.introspect()
            .get_sink_info_list(move |result| match result {
                ListResult::Item(info) => drop(found.insert(info.index, Device::from_sink(info))),
                ListResult::End | ListResult::Error => {
                    pulse.state.borrow_mut().outputs = std::mem::take(&mut found);
                    done(&pulse);
                }
            });
    }

    fn load_inputs(&self, done: Done) {
        let pulse = self.clone();
        let mut done = once(done);
        let mut found = BTreeMap::new();
        self.introspect()
            .get_source_info_list(move |result| match result {
                ListResult::Item(info) => {
                    if let Some(device) = Device::from_source(info) {
                        found.insert(info.index, device);
                    }
                }
                ListResult::End | ListResult::Error => {
                    pulse.state.borrow_mut().inputs = std::mem::take(&mut found);
                    done(&pulse);
                }
            });
    }

    fn load_apps(&self, done: Done) {
        let pulse = self.clone();
        let mut done = once(done);
        let mut found = BTreeMap::new();
        self.introspect()
            .get_sink_input_info_list(move |result| match result {
                ListResult::Item(info) => {
                    if let Some(app) = App::from_sink_input(info) {
                        found.insert(info.index, app);
                    }
                }
                ListResult::End | ListResult::Error => {
                    pulse.state.borrow_mut().apps = std::mem::take(&mut found);
                    done(&pulse);
                }
            });
    }

    fn load_cards(&self, done: Done) {
        let pulse = self.clone();
        let mut done = once(done);
        let mut found = BTreeMap::new();
        self.introspect()
            .get_card_info_list(move |result| match result {
                ListResult::Item(info) => drop(found.insert(info.index, Card::from_info(info))),
                ListResult::End | ListResult::Error => {
                    pulse.state.borrow_mut().cards = std::mem::take(&mut found);
                    done(&pulse);
                }
            });
    }

    fn load_alert(&self, done: Done) {
        let mut restore = self.restore.borrow_mut();
        let Some(restore) = restore.as_mut() else {
            return done(self);
        };
        let pulse = self.clone();
        let mut done = once(done);
        let mut alert = None;
        restore.read(move |result| match result {
            ListResult::Item(info) if info.name.as_deref() == Some(ALERT_STREAM) => {
                alert = Some(Alert::from_restore(info));
            }
            ListResult::Item(_) => {}
            ListResult::End => {
                pulse.state.borrow_mut().alert = Some(alert.take().unwrap_or_else(Alert::fallback));
                done(&pulse);
            }
            ListResult::Error => done(&pulse),
        });
    }

    fn update_output(&self, index: u32) {
        let pulse = self.clone();
        self.introspect()
            .get_sink_info_by_index(index, move |result| match result {
                ListResult::Item(info) => {
                    let device = Device::from_sink(info);
                    pulse.state.borrow_mut().outputs.insert(info.index, device);
                }
                ListResult::End | ListResult::Error => pulse.publish(),
            });
    }

    fn update_input(&self, index: u32) {
        let pulse = self.clone();
        self.introspect()
            .get_source_info_by_index(index, move |result| match result {
                ListResult::Item(info) => {
                    if let Some(device) = Device::from_source(info) {
                        pulse.state.borrow_mut().inputs.insert(info.index, device);
                    }
                }
                ListResult::End | ListResult::Error => pulse.publish(),
            });
    }

    fn update_app(&self, index: u32) {
        let pulse = self.clone();
        self.introspect()
            .get_sink_input_info(index, move |result| match result {
                ListResult::Item(info) => {
                    let mut state = pulse.state.borrow_mut();
                    match App::from_sink_input(info) {
                        Some(app) => drop(state.apps.insert(info.index, app)),
                        None => drop(state.apps.remove(&info.index)),
                    }
                }
                ListResult::End | ListResult::Error => pulse.publish(),
            });
    }

    fn update_card(&self, index: u32) {
        let pulse = self.clone();
        self.introspect()
            .get_card_info_by_index(index, move |result| match result {
                ListResult::Item(info) => {
                    let card = Card::from_info(info);
                    pulse.state.borrow_mut().cards.insert(info.index, card);
                }
                ListResult::End | ListResult::Error => pulse.publish(),
            });
    }

    fn sync_meter(&self) {
        let source = self.state.borrow().default_input.clone();
        let mut meter = self.meter.borrow_mut();
        if !self.metering.get() || source.is_empty() {
            *meter = None;
        } else if meter.as_ref().is_none_or(|meter| meter.source() != source) {
            *meter = None;
            *meter = Meter::start(&mut self.context.borrow_mut(), source, self.events.clone());
        }
    }

    fn current_volume(&self, target: Target, index: u32) -> Option<ChannelVolumes> {
        let state = self.state.borrow();
        match target {
            Target::Output => state.outputs.get(&index).map(|device| device.volume),
            Target::Input => state.inputs.get(&index).map(|device| device.volume),
            Target::App => state.apps.get(&index).map(|app| app.volume),
        }
    }

    fn set_volume(&self, target: Target, index: u32, volume: &ChannelVolumes) {
        let mut introspect = self.introspect();
        match target {
            Target::Output => introspect.set_sink_volume_by_index(index, volume, None),
            Target::Input => introspect.set_source_volume_by_index(index, volume, None),
            Target::App => introspect.set_sink_input_volume(index, volume, None),
        };
    }

    fn set_mute(&self, target: Target, index: u32, muted: bool) {
        let mut introspect = self.introspect();
        match target {
            Target::Output => introspect.set_sink_mute_by_index(index, muted, None),
            Target::Input => introspect.set_source_mute_by_index(index, muted, None),
            Target::App => introspect.set_sink_input_mute(index, muted, None),
        };
    }

    fn set_default(&self, direction: Direction, name: &str) {
        let mut context = self.context.borrow_mut();
        match direction {
            Direction::Output => context.set_default_sink(name, |_| {}),
            Direction::Input => context.set_default_source(name, |_| {}),
        };
    }

    fn set_port(&self, direction: Direction, index: u32, port: &str) {
        let mut introspect = self.introspect();
        match direction {
            Direction::Output => introspect.set_sink_port_by_index(index, port, None),
            Direction::Input => introspect.set_source_port_by_index(index, port, None),
        };
    }

    fn set_balance(&self, index: u32, balance: f32) {
        let volume = self.state.borrow().outputs.get(&index).map(|device| {
            let mut volume = device.volume;
            volume.set_balance(&device.map, balance);
            volume
        });
        if let Some(volume) = volume {
            self.set_volume(Target::Output, index, &volume);
        }
    }

    fn set_alert_volume(&self, fraction: f64) {
        let state = self.state.borrow();
        let Some(alert) = &state.alert else {
            return;
        };
        let info = ext_stream_restore::Info {
            name: Some(ALERT_STREAM.into()),
            channel_map: alert.map,
            volume: scaled(&alert.volume, fraction),
            device: alert.device.clone().map(Into::into),
            mute: alert.muted,
        };
        drop(state);
        if let Some(restore) = self.restore.borrow_mut().as_mut() {
            restore.write(UpdateMode::Replace, &[&info], true, |_| {});
        }
    }

    pub fn handle(&self, command: Command) {
        match command {
            Command::Publish => self.publish(),
            Command::SetDefault(request) => self.set_default(request.direction, &request.name),
            Command::SetVolume(request) => {
                if let Some(current) = self.current_volume(request.target, request.index) {
                    self.set_volume(
                        request.target,
                        request.index,
                        &scaled(&current, request.volume),
                    );
                }
            }
            Command::SetMute(request) => {
                self.set_mute(request.target, request.index, request.muted)
            }
            Command::SetBalance(request) => self.set_balance(request.index, request.balance),
            Command::SetPort(request) => {
                self.set_port(request.direction, request.index, &request.port)
            }
            Command::SetProfile(request) => {
                self.introspect()
                    .set_card_profile_by_index(request.card, &request.profile, None);
            }
            Command::MoveApp(request) => {
                self.introspect()
                    .move_sink_input_by_index(request.index, request.output, None);
            }
            Command::SetAlertVolume(request) => self.set_alert_volume(request.volume),
            Command::Meter(request) => {
                self.metering.set(request.enabled);
                self.sync_meter();
            }
        }
    }
}
