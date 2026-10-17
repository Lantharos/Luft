use std::cmp::Ordering;

use memchr::memmem;

const DAY: i64 = 86_400;
const DEPTH_COST: f32 = 0.08;
const DEEPEST_COUNTED: u16 = 12;
const LENGTH_COST: f32 = 0.003;
const ONLY_IN_FOLDER_COST: f32 = 0.4;

pub struct Candidate<'a> {
    pub name: &'a [u8],
    pub query: &'a [u8],
    pub last: &'a [u8],
    pub others: &'a [&'a str],
    pub depth: u16,
    pub age: i64,
}

pub struct Scored {
    pub points: f32,
    pub index: usize,
}

impl PartialEq for Scored {
    fn eq(&self, other: &Self) -> bool {
        self.cmp(other) == Ordering::Equal
    }
}

impl Eq for Scored {}

impl PartialOrd for Scored {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Scored {
    fn cmp(&self, other: &Self) -> Ordering {
        self.points
            .total_cmp(&other.points)
            .then(self.index.cmp(&other.index))
    }
}

fn is_boundary(byte: u8) -> bool {
    matches!(byte, b' ' | b'-' | b'_' | b'.' | b'(' | b'[' | b',')
}

fn stem(name: &[u8]) -> &[u8] {
    match name.iter().rposition(|&byte| byte == b'.') {
        Some(dot) if dot > 0 => &name[..dot],
        _ => name,
    }
}

fn tier(name: &[u8], token: &[u8]) -> Option<f32> {
    let at = memmem::find(name, token)?;
    Some(if at == 0 {
        if name == token || stem(name) == token {
            0.0
        } else {
            1.0
        }
    } else if is_boundary(name[at - 1]) {
        2.0
    } else {
        3.0
    })
}

fn recency(age: i64) -> f32 {
    if age < 7 * DAY {
        0.5
    } else if age < 30 * DAY {
        0.25
    } else {
        0.0
    }
}

pub fn score(candidate: &Candidate, in_folders: impl Fn(&[u8]) -> bool) -> Option<f32> {
    let base = match tier(candidate.name, candidate.query) {
        Some(tier) => tier,
        None => {
            let mut points = tier(candidate.name, candidate.last)?;
            for token in candidate.others {
                if memmem::find(candidate.name, token.as_bytes()).is_some() {
                    continue;
                }
                if !in_folders(token.as_bytes()) {
                    return None;
                }
                points += ONLY_IN_FOLDER_COST;
            }
            points
        }
    };
    Some(
        base + DEPTH_COST * f32::from(candidate.depth.min(DEEPEST_COUNTED))
            + LENGTH_COST * candidate.name.len() as f32
            - recency(candidate.age),
    )
}
