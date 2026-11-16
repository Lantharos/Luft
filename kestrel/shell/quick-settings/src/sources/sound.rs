use std::thread;
use std::time::Duration;

use kestrel_toolkit::app::Sender;
use libpulse_binding::callbacks::ListResult;
use libpulse_binding::context::subscribe::InterestMaskSet;
use libpulse_binding::context::{Context, FlagSet, State};
use libpulse_binding::mainloop::threaded::Mainloop;
use libpulse_binding::volume::{ChannelVolumes, Volume};

use crate::Message;

const DEFAULT_OUTPUT: &str = "@DEFAULT_SINK@";
const CONNECT_STEP: Duration = Duration::from_millis(2);
const CONNECT_STEPS: u32 = 250;

/// The volume of the default output.
pub struct Sound {
    mainloop: Mainloop,
    context: Context,
    messages: Sender<Message>,
}

impl Sound {
    pub fn connect(messages: Sender<Message>) -> Option<Self> {
        let mut mainloop = Mainloop::new()?;
        let mut context = Context::new(&mainloop, "kestrel-quick-settings")?;
        context.connect(None, FlagSet::NOFLAGS, None).ok()?;
        mainloop.start().ok()?;
        let mut steps = 0;
        loop {
            mainloop.lock();
            let state = context.get_state();
            mainloop.unlock();
            match state {
                State::Ready => break,
                State::Failed | State::Terminated => return None,
                _ if steps == CONNECT_STEPS => return None,
                _ => thread::sleep(CONNECT_STEP),
            }
            steps += 1;
        }
        mainloop.lock();
        let changed = messages.clone();
        context.set_subscribe_callback(Some(Box::new(move |_, _, _| {
            changed.send(Message::SoundChanged)
        })));
        context.subscribe(InterestMaskSet::SINK | InterestMaskSet::SERVER, |_| {});
        mainloop.unlock();
        let mut sound = Self {
            mainloop,
            context,
            messages,
        };
        sound.read();
        Some(sound)
    }

    pub fn read(&mut self) {
        let messages = self.messages.clone();
        self.mainloop.lock();
        self.context
            .introspect()
            .get_sink_info_by_name(DEFAULT_OUTPUT, move |sink| {
                if let ListResult::Item(sink) = sink {
                    let level = sink.volume.avg().0 as f32 / Volume::NORMAL.0 as f32;
                    messages.send(Message::Volume {
                        level: if sink.mute { 0.0 } else { level },
                        channels: sink.volume.len(),
                    });
                }
            });
        self.mainloop.unlock();
    }

    pub fn set(&mut self, level: f32, channels: u8) {
        let mut volumes = ChannelVolumes::default();
        volumes.set(channels, Volume((level * Volume::NORMAL.0 as f32) as u32));
        self.mainloop.lock();
        let mut introspect = self.context.introspect();
        introspect.set_sink_mute_by_name(DEFAULT_OUTPUT, false, None);
        introspect.set_sink_volume_by_name(DEFAULT_OUTPUT, &volumes, None);
        self.mainloop.unlock();
    }
}
