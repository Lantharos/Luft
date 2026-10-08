use std::cell::RefCell;
use std::rc::Rc;

use libpulse_binding::context::Context;
use libpulse_binding::def::BufferAttr;
use libpulse_binding::sample::{Format, Spec};
use libpulse_binding::stream::{FlagSet, PeekResult, Stream};
use luft_app::Events;

const SOUND_LEVEL: &str = "sound.level";
const UPDATES_PER_SECOND: u32 = 25;

pub struct Meter {
    source: String,
    stream: Rc<RefCell<Stream>>,
}

impl Meter {
    pub fn start(context: &mut Context, source: String, events: Events) -> Option<Self> {
        let spec = Spec {
            format: Format::FLOAT32NE,
            channels: 1,
            rate: UPDATES_PER_SECOND,
        };
        let stream = Rc::new(RefCell::new(Stream::new(
            context,
            "Input level",
            &spec,
            None,
        )?));
        let reader = Rc::downgrade(&stream);
        let mut connecting = stream.borrow_mut();
        connecting.set_read_callback(Some(Box::new(move |_| {
            if let Some(stream) = reader.upgrade() {
                read(&mut stream.borrow_mut(), &events);
            }
        })));
        let buffer = BufferAttr {
            maxlength: u32::MAX,
            tlength: u32::MAX,
            prebuf: u32::MAX,
            minreq: u32::MAX,
            fragsize: size_of::<f32>() as u32,
        };
        connecting
            .connect_record(
                Some(&source),
                Some(&buffer),
                FlagSet::PEAK_DETECT | FlagSet::ADJUST_LATENCY | FlagSet::DONT_MOVE,
            )
            .ok()?;
        drop(connecting);
        Some(Self { source, stream })
    }

    pub fn source(&self) -> &str {
        &self.source
    }
}

fn read(stream: &mut Stream, events: &Events) {
    let level = match stream.peek() {
        Ok(PeekResult::Data(bytes)) => bytes.last_chunk().map(|chunk| f32::from_ne_bytes(*chunk)),
        Ok(PeekResult::Hole(_)) => None,
        Ok(PeekResult::Empty) | Err(_) => return,
    };
    let _ = stream.discard();
    if let Some(level) = level {
        events.emit(SOUND_LEVEL, level.clamp(0.0, 1.0));
    }
}

impl Drop for Meter {
    fn drop(&mut self) {
        let mut stream = self.stream.borrow_mut();
        stream.set_read_callback(None);
        let _ = stream.disconnect();
    }
}
