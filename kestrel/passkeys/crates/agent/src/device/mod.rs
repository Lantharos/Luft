mod relay;
pub mod requester;

use std::future::{Future, pending};
use std::pin::Pin;
use std::rc::Rc;
use std::time::Duration;

use ctap::hid::{CBOR, Inbound, Keepalive, Message, Transport};
use ctap::{Authenticator, Status};
use tokio::sync::Mutex;
use tokio::time::MissedTickBehavior;

use crate::platform::Agent;
use crate::service::Notifier;
use relay::{Frame, Relay};

const KEEPALIVE: Duration = Duration::from_millis(100);
const RECONNECT: Duration = Duration::from_secs(5);

type Work = Pin<Box<dyn Future<Output = Vec<u8>>>>;

struct Busy {
    channel: u32,
    work: Work,
}

async fn finish(busy: &mut Option<Busy>) -> Vec<u8> {
    match busy {
        Some(busy) => busy.work.as_mut().await,
        None => pending().await,
    }
}

pub async fn run(agent: Agent, notifier: Notifier) -> ! {
    loop {
        if let Ok(relay) = Relay::connect().await {
            serve(relay, &agent, &notifier).await;
        }
        agent.attach(None);
        notifier.ready(false).await;
        tokio::time::sleep(RECONNECT).await;
    }
}

async fn send(relay: &mut Relay, message: &Message) -> bool {
    for report in message.reports() {
        if relay.send(&report).await.is_err() {
            return false;
        }
    }
    true
}

async fn serve(mut relay: Relay, agent: &Agent, notifier: &Notifier) {
    let mut transport = Transport::default();
    let authenticator = Rc::new(Mutex::new(Authenticator::new(agent.clone())));
    let mut busy: Option<Busy> = None;
    let mut keepalive = tokio::time::interval(KEEPALIVE);
    keepalive.set_missed_tick_behavior(MissedTickBehavior::Delay);
    loop {
        let outgoing = tokio::select! {
            frame = relay.frames.recv() => {
                let Some(frame) = frame else { return };
                match frame {
                    Frame::Attached(uniq) => {
                        agent.attach(Some(uniq));
                        notifier.ready(true).await;
                        None
                    }
                    Frame::Closed => {
                        busy = None;
                        transport = Transport::default();
                        None
                    }
                    Frame::Detached => {
                        busy = None;
                        transport = Transport::default();
                        agent.attach(None);
                        notifier.ready(false).await;
                        None
                    }
                    Frame::Report(report) => match transport.receive(&report) {
                        Some(Inbound::Reply(message)) => Some(message),
                        Some(Inbound::Request(message)) => {
                            let authenticator = authenticator.clone();
                            let work = Box::pin(async move {
                                authenticator.lock().await.handle(&message.payload).await
                            });
                            busy = Some(Busy { channel: message.channel, work });
                            keepalive.reset();
                            None
                        }
                        Some(Inbound::Cancel(channel)) => {
                            busy = None;
                            transport.finish();
                            Some(Message { channel, command: CBOR, payload: vec![Status::KeepaliveCancel.code()] })
                        }
                        None => None,
                    },
                }
            }
            reply = finish(&mut busy) => {
                transport.finish();
                busy.take().map(|done| Message { channel: done.channel, command: CBOR, payload: reply })
            }
            _ = keepalive.tick(), if busy.is_some() => {
                let status = if agent.waiting() { Keepalive::UserNeeded } else { Keepalive::Processing };
                busy.as_ref().map(|busy| Message::keepalive(busy.channel, status))
            }
        };
        if let Some(message) = outgoing
            && !send(&mut relay, &message).await
        {
            return;
        }
    }
}
