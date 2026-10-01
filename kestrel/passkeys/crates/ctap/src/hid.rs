use std::time::{Duration, Instant};

pub const REPORT: usize = 64;
const INIT_DATA: usize = REPORT - 7;
const CONT_DATA: usize = REPORT - 5;
const MAX_MESSAGE: usize = INIT_DATA + 128 * CONT_DATA;
const BROADCAST: u32 = 0xFFFF_FFFF;
const STALE_MESSAGE: Duration = Duration::from_secs(3);
const PROTOCOL_VERSION: u8 = 2;
const CAPABILITIES: u8 = 0x01 | 0x04 | 0x08;

const PING: u8 = 0x01;
const INIT: u8 = 0x06;
const WINK: u8 = 0x08;
pub const CBOR: u8 = 0x10;
const CANCEL: u8 = 0x11;
const KEEPALIVE: u8 = 0x3B;
const ERROR: u8 = 0x3F;

const ERR_INVALID_CMD: u8 = 0x01;
const ERR_INVALID_LEN: u8 = 0x03;
const ERR_INVALID_SEQ: u8 = 0x04;
const ERR_CHANNEL_BUSY: u8 = 0x06;
const ERR_INVALID_CHANNEL: u8 = 0x0B;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum Keepalive {
    Processing = 1,
    UserNeeded = 2,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Message {
    pub channel: u32,
    pub command: u8,
    pub payload: Vec<u8>,
}

impl Message {
    pub fn keepalive(channel: u32, status: Keepalive) -> Self {
        Self {
            channel,
            command: KEEPALIVE,
            payload: vec![status as u8],
        }
    }

    pub fn reply(&self, payload: Vec<u8>) -> Self {
        Self {
            channel: self.channel,
            command: self.command,
            payload,
        }
    }

    fn error(channel: u32, code: u8) -> Self {
        Self {
            channel,
            command: ERROR,
            payload: vec![code],
        }
    }

    pub fn reports(&self) -> Vec<[u8; REPORT]> {
        let length = u16::try_from(self.payload.len()).expect("CTAPHID messages fit in 16 bits");
        let (first, rest) = self.payload.split_at(self.payload.len().min(INIT_DATA));
        let mut init = [0; REPORT];
        init[..4].copy_from_slice(&self.channel.to_be_bytes());
        init[4] = self.command | 0x80;
        init[5..7].copy_from_slice(&length.to_be_bytes());
        init[7..7 + first.len()].copy_from_slice(first);
        let continuations = rest.chunks(CONT_DATA).zip(0u8..).map(|(chunk, sequence)| {
            let mut report = [0; REPORT];
            report[..4].copy_from_slice(&self.channel.to_be_bytes());
            report[4] = sequence;
            report[5..5 + chunk.len()].copy_from_slice(chunk);
            report
        });
        std::iter::once(init).chain(continuations).collect()
    }
}

#[derive(Debug, PartialEq, Eq)]
pub enum Inbound {
    Reply(Message),
    Request(Message),
    Cancel(u32),
}

struct Partial {
    message: Message,
    length: usize,
    sequence: u8,
    started: Instant,
}

pub struct Transport {
    partial: Option<Partial>,
    next_channel: u32,
    busy: Option<u32>,
}

impl Default for Transport {
    fn default() -> Self {
        Self {
            partial: None,
            next_channel: 1,
            busy: None,
        }
    }
}

impl Transport {
    pub fn finish(&mut self) {
        self.busy = None;
    }

    pub fn receive(&mut self, report: &[u8; REPORT]) -> Option<Inbound> {
        let channel = u32::from_be_bytes(report[..4].try_into().expect("four bytes"));
        if self
            .partial
            .as_ref()
            .is_some_and(|partial| partial.started.elapsed() > STALE_MESSAGE)
        {
            self.partial = None;
        }
        if report[4] & 0x80 == 0 {
            return self.continuation(channel, report[4], &report[5..]);
        }
        let command = report[4] & 0x7F;
        let length = usize::from(u16::from_be_bytes([report[5], report[6]]));
        if channel == 0 {
            return Some(Inbound::Reply(Message::error(channel, ERR_INVALID_CHANNEL)));
        }
        if command == CANCEL {
            return (self.busy == Some(channel)).then_some(Inbound::Cancel(channel));
        }
        if let Some(partial) = &self.partial {
            if partial.message.channel != channel && command != INIT {
                return Some(Inbound::Reply(Message::error(channel, ERR_CHANNEL_BUSY)));
            }
            if partial.message.channel == channel && command != INIT {
                self.partial = None;
                return Some(Inbound::Reply(Message::error(channel, ERR_INVALID_SEQ)));
            }
        }
        if length > MAX_MESSAGE {
            return Some(Inbound::Reply(Message::error(channel, ERR_INVALID_LEN)));
        }
        let data = &report[7..7 + length.min(INIT_DATA)];
        let partial = Partial {
            message: Message {
                channel,
                command,
                payload: data.to_vec(),
            },
            length,
            sequence: 0,
            started: Instant::now(),
        };
        self.complete(partial)
    }

    fn continuation(&mut self, channel: u32, sequence: u8, data: &[u8]) -> Option<Inbound> {
        let mut partial = self
            .partial
            .take()
            .filter(|partial| partial.message.channel == channel)?;
        if sequence != partial.sequence {
            return Some(Inbound::Reply(Message::error(channel, ERR_INVALID_SEQ)));
        }
        let needed = partial.length - partial.message.payload.len();
        partial
            .message
            .payload
            .extend_from_slice(&data[..needed.min(CONT_DATA)]);
        partial.sequence += 1;
        self.complete(partial)
    }

    fn complete(&mut self, partial: Partial) -> Option<Inbound> {
        if partial.message.payload.len() < partial.length {
            self.partial = Some(partial);
            return None;
        }
        self.partial = None;
        Some(self.dispatch(partial.message))
    }

    fn dispatch(&mut self, message: Message) -> Inbound {
        let channel = message.channel;
        if message.command == INIT {
            return Inbound::Reply(self.init(message));
        }
        if channel == BROADCAST || channel >= self.next_channel {
            return Inbound::Reply(Message::error(channel, ERR_INVALID_CHANNEL));
        }
        if self.busy.is_some_and(|busy| busy != channel) {
            return Inbound::Reply(Message::error(channel, ERR_CHANNEL_BUSY));
        }
        match message.command {
            PING => Inbound::Reply(message),
            WINK => Inbound::Reply(message.reply(Vec::new())),
            CBOR if message.payload.is_empty() => {
                Inbound::Reply(Message::error(channel, ERR_INVALID_LEN))
            }
            CBOR => {
                self.busy = Some(channel);
                Inbound::Request(message)
            }
            _ => Inbound::Reply(Message::error(channel, ERR_INVALID_CMD)),
        }
    }

    fn init(&mut self, message: Message) -> Message {
        if message.payload.len() != 8 {
            return Message::error(message.channel, ERR_INVALID_LEN);
        }
        let assigned = if message.channel == BROADCAST {
            let channel = self.next_channel;
            self.next_channel = if channel == BROADCAST - 1 {
                1
            } else {
                channel + 1
            };
            channel
        } else {
            message.channel
        };
        let version = env!("CARGO_PKG_VERSION_MAJOR").parse().unwrap_or(0);
        let mut payload = message.payload.clone();
        payload.extend_from_slice(&assigned.to_be_bytes());
        payload.extend_from_slice(&[PROTOCOL_VERSION, version, 0, 0, CAPABILITIES]);
        message.reply(payload)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn report(bytes: &[u8]) -> [u8; REPORT] {
        let mut report = [0; REPORT];
        report[..bytes.len()].copy_from_slice(bytes);
        report
    }

    fn channel(transport: &mut Transport) -> u32 {
        let init = report(&[0xFF, 0xFF, 0xFF, 0xFF, 0x86, 0, 8, 1, 2, 3, 4, 5, 6, 7, 8]);
        let Some(Inbound::Reply(reply)) = transport.receive(&init) else {
            panic!()
        };
        assert_eq!(reply.channel, BROADCAST);
        assert_eq!(&reply.payload[..8], &[1, 2, 3, 4, 5, 6, 7, 8]);
        assert_eq!(reply.payload[12], PROTOCOL_VERSION);
        assert_eq!(reply.payload[16], CAPABILITIES);
        u32::from_be_bytes(reply.payload[8..12].try_into().unwrap())
    }

    #[test]
    fn reassembles_a_fragmented_cbor_request() {
        let mut transport = Transport::default();
        let channel = channel(&mut transport);
        let payload: Vec<u8> = (0..200u8).collect();
        let message = Message {
            channel,
            command: CBOR,
            payload: payload.clone(),
        };
        let reports = message.reports();
        assert_eq!(reports.len(), 4);
        for report in &reports[..3] {
            assert_eq!(transport.receive(report), None);
        }
        assert_eq!(
            transport.receive(&reports[3]),
            Some(Inbound::Request(message))
        );
    }

    #[test]
    fn rejects_other_channels_while_busy_and_accepts_cancel() {
        let mut transport = Transport::default();
        let first = channel(&mut transport);
        let second = channel(&mut transport);
        let request = Message {
            channel: first,
            command: CBOR,
            payload: vec![0x04],
        };
        assert!(matches!(
            transport.receive(&request.reports()[0]),
            Some(Inbound::Request(_))
        ));
        let other = Message {
            channel: second,
            command: CBOR,
            payload: vec![0x04],
        };
        assert_eq!(
            transport.receive(&other.reports()[0]),
            Some(Inbound::Reply(Message::error(second, ERR_CHANNEL_BUSY)))
        );
        let cancel = Message {
            channel: first,
            command: CANCEL,
            payload: Vec::new(),
        };
        assert_eq!(
            transport.receive(&cancel.reports()[0]),
            Some(Inbound::Cancel(first))
        );
        transport.finish();
        assert!(matches!(
            transport.receive(&other.reports()[0]),
            Some(Inbound::Request(_))
        ));
    }

    #[test]
    fn reports_out_of_order_continuations() {
        let mut transport = Transport::default();
        let channel = channel(&mut transport);
        let reports = Message {
            channel,
            command: CBOR,
            payload: vec![0; 100],
        }
        .reports();
        assert_eq!(transport.receive(&reports[0]), None);
        let mut skipped = reports[1];
        skipped[4] = 3;
        assert_eq!(
            transport.receive(&skipped),
            Some(Inbound::Reply(Message::error(channel, ERR_INVALID_SEQ)))
        );
    }

    #[test]
    fn refuses_unallocated_channels() {
        let mut transport = Transport::default();
        let ping = Message {
            channel: 0x1234,
            command: PING,
            payload: vec![1],
        };
        assert_eq!(
            transport.receive(&ping.reports()[0]),
            Some(Inbound::Reply(Message::error(0x1234, ERR_INVALID_CHANNEL)))
        );
    }
}
