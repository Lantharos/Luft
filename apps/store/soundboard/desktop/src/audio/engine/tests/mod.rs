mod server;

use std::f32::consts::TAU;
use std::sync::mpsc::{Receiver, channel};
use std::sync::{Arc, LazyLock, Mutex, MutexGuard};
use std::time::{Duration, Instant};

use super::{Engine, Mix, Play, SOURCE_NAME, Status};
use crate::audio::pcm::{self, Pcm};
use crate::audio::{CHANNELS, RATE, SoundId};
use server::{Listener, SERVER, wait_until};

const WAIT: Duration = Duration::from_secs(10);
const TONE: f32 = 440.0;
const PRESS_LIMIT: Duration = Duration::from_millis(20);
const VOICE_LIMIT: Duration = Duration::from_millis(12);

/// One sound server serves the whole test binary, so tests take turns.
static TURN: LazyLock<Mutex<()>> = LazyLock::new(Mutex::default);

fn turn() -> MutexGuard<'static, ()> {
    LazyLock::force(&SERVER);
    TURN.lock().unwrap_or_else(|poisoned| poisoned.into_inner())
}

fn tone(seconds: f32, level: f32) -> Arc<Pcm> {
    let frames = (RATE as f32 * seconds) as usize;
    let samples: Vec<f32> = (0..frames)
        .flat_map(|frame| {
            let sample = (frame as f32 / RATE as f32 * TONE * TAU).sin() * level;
            [sample; CHANNELS]
        })
        .collect();
    let folder = tempfile::tempdir().unwrap();
    let path = folder.path().join("tone.pcm");
    pcm::write(&path, &samples).unwrap();
    Arc::new(Pcm::open(&path).unwrap())
}

fn play(sound: SoundId, pcm: &Arc<Pcm>) -> Play {
    Play {
        sound,
        pcm: pcm.clone(),
        range: 0..pcm.samples().len() / CHANNELS,
        gain: 1.0,
        looping: false,
        stop_others: false,
        preview: false,
    }
}

fn engine(mix: Mix) -> (Engine, Receiver<Status>) {
    let (sender, statuses) = channel();
    (
        Engine::start(mix, move |status| drop(sender.send(status.clone()))),
        statuses,
    )
}

fn status_until(statuses: &Receiver<Status>, wanted: impl Fn(&Status) -> bool) -> Status {
    let deadline = Instant::now() + WAIT;
    loop {
        let left = deadline.saturating_duration_since(Instant::now());
        let status = statuses.recv_timeout(left).expect("the status never came");
        if wanted(&status) {
            return status;
        }
    }
}

fn muted() -> Mix {
    Mix {
        microphone_muted: true,
        ..Mix::default()
    }
}

#[test]
fn the_virtual_microphone_lives_as_long_as_the_engine() {
    let _turn = turn();
    assert!(!SERVER.has_source(SOURCE_NAME));
    let (engine, statuses) = engine(muted());
    status_until(&statuses, |status| status.connected);
    wait_until("the source appears", || SERVER.has_source(SOURCE_NAME));
    drop(engine);
    wait_until("the source goes away", || !SERVER.has_source(SOURCE_NAME));
}

#[test]
fn the_virtual_microphone_goes_away_when_the_process_dies() {
    let _turn = turn();
    let mut survivor = SERVER.killable_engine();
    wait_until("the source appears", || SERVER.has_source(SOURCE_NAME));
    survivor.kill().unwrap();
    survivor.wait().unwrap();
    wait_until("the source goes away", || !SERVER.has_source(SOURCE_NAME));
}

#[test]
fn sounds_reach_whoever_records_the_virtual_microphone() {
    let _turn = turn();
    let (engine, statuses) = engine(muted());
    status_until(&statuses, |status| status.connected);
    let listener = Listener::on(SOURCE_NAME);
    status_until(&statuses, |status| status.listeners > 0);
    engine.play(play(1, &tone(0.3, 0.5)));
    let onset = listener.first_sound(WAIT);
    assert!(onset.is_some(), "no sound arrived");
    status_until(&statuses, |status| status.playing.is_empty());
    let recorded = listener.samples();
    let peak = recorded
        .iter()
        .fold(0f32, |peak, sample| peak.max(sample.abs()));
    assert!((peak - 0.5).abs() < 0.05, "the sound arrived at {peak}");
}

#[test]
fn the_voice_passes_through_while_someone_listens_and_mixes_with_sounds() {
    let _turn = turn();
    let voice = SERVER.speak(0.25);
    let (engine, statuses) = engine(Mix {
        microphone: Some(voice.name.clone()),
        ..Mix::default()
    });
    let idle = status_until(&statuses, |status| {
        status.connected && !status.microphones.is_empty()
    });
    assert_eq!(
        idle.passing, None,
        "the microphone stays closed until someone listens"
    );
    let listener = Listener::on(SOURCE_NAME);
    let status = status_until(&statuses, |status| status.passing.is_some());
    assert_eq!(status.passing.as_deref(), Some(voice.name.as_str()));
    wait_until("the voice arrives", || listener.peak() > 0.2);
    let voice_alone = listener.peak();
    engine.play(play(2, &tone(0.5, 0.25)));
    wait_until("the sound joins the voice", || {
        listener.peak() > voice_alone + 0.1
    });
}

#[test]
fn muting_closes_the_real_microphone() {
    let _turn = turn();
    let voice = SERVER.speak(0.25);
    let (engine, statuses) = engine(Mix {
        microphone: Some(voice.name.clone()),
        ..Mix::default()
    });
    let _listener = Listener::on(SOURCE_NAME);
    status_until(&statuses, |status| status.passing.is_some());
    engine.set_mix(Mix {
        microphone_muted: true,
        ..Mix::default()
    });
    status_until(&statuses, |status| status.passing.is_none());
}

#[test]
fn the_default_input_stays_where_it_was() {
    let _turn = turn();
    let voice = SERVER.speak(0.25);
    let before = SERVER.default_source();
    let (_engine, statuses) = engine(Mix::default());
    let status = status_until(&statuses, |status| status.connected);
    assert_eq!(
        status.default_input, before,
        "connecting means knowing the default"
    );
    wait_until("the source appears", || SERVER.has_source(SOURCE_NAME));
    assert_eq!(SERVER.default_source(), before);
    drop(voice);
}

#[test]
fn the_app_can_make_itself_the_default_input_without_passing_itself_through() {
    let _turn = turn();
    let voice = SERVER.speak(0.25);
    let (engine, statuses) = engine(Mix::default());
    status_until(&statuses, |status| status.connected);
    wait_until("the source appears", || SERVER.has_source(SOURCE_NAME));
    let before = SERVER.default_source();
    super::use_as_default(SOURCE_NAME).unwrap();
    wait_until("it becomes the default", || {
        SERVER.default_source().as_deref() == Some(SOURCE_NAME)
    });
    let _listener = Listener::on(SOURCE_NAME);
    let status = status_until(&statuses, |status| status.passing.is_some());
    assert_eq!(status.passing.as_deref(), Some(voice.name.as_str()));
    super::use_as_default(before.as_deref().unwrap()).unwrap();
    wait_until("the old default returns", || {
        SERVER.default_source() == before
    });
    drop(engine);
}

struct Latency {
    median: Duration,
    usual_worst: Duration,
    worst: Duration,
}

fn press_latency(engine: &Engine, statuses: &Receiver<Status>, listener: &Listener) -> Latency {
    let sound = tone(0.2, 0.5);
    let mut press = Vec::new();
    for round in 0..40 {
        // A prime step, so presses land all over the graph's 5.3 ms cycle instead of at one point in it.
        std::thread::sleep(Duration::from_micros(350_000 + u64::from(round) * 1_733));
        listener.rearm();
        let pressed = Instant::now();
        engine.play(play(round + 10, &sound));
        let heard = listener.first_sound(WAIT).expect("no sound arrived");
        press.push(heard.saturating_duration_since(pressed));
        status_until(statuses, |status| status.playing.is_empty());
    }
    press.sort();
    Latency {
        median: press[press.len() / 2],
        usual_worst: press[press.len() * 9 / 10],
        worst: press[press.len() - 1],
    }
}

#[test]
fn a_press_reaches_a_listener_quickly_from_silence() {
    let _turn = turn();
    let (engine, statuses) = engine(muted());
    status_until(&statuses, |status| status.connected);
    let listener = Listener::on(SOURCE_NAME);
    status_until(&statuses, |status| status.listeners > 0);
    let Latency {
        median,
        usual_worst,
        worst,
    } = press_latency(&engine, &statuses, &listener);
    println!("press to virtual microphone, nothing flowing: median {median:?}, worst {worst:?}");
    assert!(usual_worst < PRESS_LIMIT, "{usual_worst:?}");
}

#[test]
fn a_press_reaches_a_listener_quickly_while_the_voice_flows() {
    let _turn = turn();
    let voice = SERVER.speak(0.005);
    let (engine, statuses) = engine(Mix {
        microphone: Some(voice.name.clone()),
        ..Mix::default()
    });
    status_until(&statuses, |status| status.connected);
    let listener = Listener::on(SOURCE_NAME);
    status_until(&statuses, |status| status.passing.is_some());
    std::thread::sleep(Duration::from_millis(300));
    let Latency {
        median,
        usual_worst,
        worst,
    } = press_latency(&engine, &statuses, &listener);
    println!("press to virtual microphone, voice flowing: median {median:?}, worst {worst:?}");
    assert!(usual_worst < PRESS_LIMIT, "{usual_worst:?}");
}

#[test]
fn the_voice_arrives_about_a_cycle_later_at_most() {
    let _turn = turn();
    let voice = SERVER.click_track();
    let (_engine, statuses) = engine(Mix {
        microphone: Some(voice.name.clone()),
        ..Mix::default()
    });
    status_until(&statuses, |status| status.connected);
    let through = Listener::on(SOURCE_NAME);
    status_until(&statuses, |status| status.passing.is_some());
    let direct = Listener::on(&voice.name);
    wait_until("both hear clicks", || {
        through.peak() > 0.1 && direct.peak() > 0.1
    });
    let mut delays = Listener::delays(&direct, &through);
    delays.sort();
    assert!(
        delays.len() >= 5,
        "only {} clicks came through",
        delays.len()
    );
    let (median, worst) = (delays[delays.len() / 2], delays[delays.len() - 1]);
    println!(
        "voice through the virtual microphone adds: median {median:?}, worst {worst:?} over {} clicks",
        delays.len()
    );
    assert!(worst < VOICE_LIMIT, "{delays:?}");
}
