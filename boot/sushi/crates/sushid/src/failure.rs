use std::os::fd::{AsFd, BorrowedFd};
use std::os::unix::net::UnixStream;

use rustix::net::{RecvFlags, recv};

use sushi::failure_file::{DETAILS, FailureFile};
use sushi::scene::Failure;
use sushi::scene::panels::failure;
use sushi::terminal::Key;

pub struct Shown {
    pub failure: Failure,
    ids: Vec<String>,
    waiting: Option<UnixStream>,
}

impl Shown {
    pub fn new(file: FailureFile, waiting: UnixStream) -> Self {
        let (ids, choices) = file
            .choices
            .into_iter()
            .map(|choice| (choice.id, choice.label))
            .unzip();
        Self {
            failure: Failure {
                title: file.title,
                reason: file.reason,
                choices,
                selected: 0,
                details: failure::wrap(file.details.iter().map(String::as_str)),
                reading: None,
            },
            ids,
            waiting: Some(waiting),
        }
    }

    pub fn press(&mut self, keys: &[Key], visible: usize) -> Option<String> {
        for key in keys {
            match self.failure.reading {
                Some(first) => self.scroll(key, first, visible),
                None => {
                    if let Some(id) = self.choose(key) {
                        return Some(id);
                    }
                }
            }
        }
        None
    }

    fn scroll(&mut self, key: &Key, first: usize, visible: usize) {
        let last = self.failure.details.len().saturating_sub(visible);
        let page = visible.saturating_sub(1).max(1);
        self.failure.reading = match key {
            Key::Up => Some(first.saturating_sub(1)),
            Key::Down => Some((first + 1).min(last)),
            Key::PageUp => Some(first.saturating_sub(page)),
            Key::PageDown | Key::Text(' ') => Some((first + page).min(last)),
            Key::Home => Some(0),
            Key::End => Some(last),
            Key::Escape | Key::Enter | Key::Erase => None,
            _ => Some(first),
        };
    }

    fn choose(&mut self, key: &Key) -> Option<String> {
        let last = self.ids.len().saturating_sub(1);
        let selected = &mut self.failure.selected;
        match key {
            Key::Up => *selected = selected.saturating_sub(1),
            Key::Down => *selected = (*selected + 1).min(last),
            Key::Home => *selected = 0,
            Key::End => *selected = last,
            Key::Enter if self.ids[*selected] == DETAILS => self.failure.reading = Some(0),
            Key::Enter => return Some(self.ids[*selected].clone()),
            _ => {}
        }
        None
    }

    pub fn waiting(&self) -> Option<BorrowedFd<'_>> {
        self.waiting.as_ref().map(AsFd::as_fd)
    }

    pub fn abandoned(&self) -> bool {
        let Some(stream) = &self.waiting else {
            return true;
        };
        let mut byte = [0u8; 1];
        matches!(
            recv(stream, &mut byte[..], RecvFlags::PEEK | RecvFlags::DONTWAIT),
            Ok((0, _))
        )
    }

    pub fn dismiss(&mut self) -> Option<UnixStream> {
        self.waiting.take()
    }
}
