use std::io::{BufRead, BufReader, Write};
use std::os::unix::net::UnixStream;
use std::path::Path;
use std::time::Duration;

use sushi::config::Config;
use sushi::control::{Command, Mode};
use sushi::notice_file::NoticeFile;
use sushi::plymouth::{Client, Request, Response};

use crate::notice::{self, Shown};

use super::{Daemon, Pending, Phase, hints, listen_for_plymouth_clients};

impl Daemon {
    pub(super) fn handle_commands(&mut self) {
        while let Ok((stream, _)) = self.listener.accept() {
            let _ = stream.set_nonblocking(false);
            let _ = stream.set_read_timeout(Some(Duration::from_secs(1)));
            let mut line = String::new();
            if BufReader::new(&stream).read_line(&mut line).is_err() {
                continue;
            }
            match Command::parse(&line) {
                Some(command) => self.handle(command, stream),
                None => reply(stream, "unknown command"),
            }
        }
    }

    fn handle(&mut self, command: Command, stream: UnixStream) {
        match command {
            Command::Deactivate => self.deactivate(Pending::Control(stream)),
            Command::Quit => {
                self.leave_to_text();
                reply(stream, "ok");
            }
            Command::UpdateRoot(root) => self.enter_root_after_loading(root, stream),
            Command::LoadDrivers => self.load_drivers(stream),
            Command::Show(mode) => {
                self.activity.set_mode(mode, self.now());
                self.settle_loader(self.now());
                self.reclaim();
                match self
                    .key_enrollment
                    .take()
                    .filter(|_| mode == Mode::Shutdown)
                {
                    Some(enrollment) => {
                        eprintln!("Explaining the key enrollment screen before restarting");
                        self.show_notice(Shown::new(notice::key_enrollment(&enrollment), stream))
                    }
                    None => reply(stream, "ok"),
                }
            }
            Command::Status => reply(stream, self.status()),
            Command::KeyEnrollmentNotice(enrollment) => {
                self.key_enrollment = enrollment;
                reply(stream, "ok");
            }
            Command::ShowNotice(path) if matches!(self.phase, Phase::Splash) => {
                match NoticeFile::load(&path) {
                    Ok(file) => {
                        eprintln!("Showing the notice in {}", path.display());
                        self.show_notice(Shown::counting_down(file, stream));
                    }
                    Err(error) => reply(
                        stream,
                        &format!("Couldn't read {}: {error}", path.display()),
                    ),
                }
            }
            Command::ShowNotice(_) => reply(stream, "The splash isn't on screen"),
        }
    }

    pub(super) fn handle_plymouth(&mut self) {
        let Some(server) = &mut self.plymouth else {
            return;
        };
        for (client, request) in server.receive() {
            self.answer(client, request);
        }
    }

    fn answer(&mut self, client: Client, request: Request) {
        let now = self.now();
        let response = match request {
            Request::Ping | Request::Notice => Response::Ack,
            Request::ChangeMode(name) => {
                if let Ok(mode) = name.parse::<Mode>() {
                    self.activity.set_mode(mode, now);
                    self.settle_loader(now);
                }
                Response::Ack
            }
            Request::SystemUpdate(percent) => {
                self.activity.set_progress(percent, now);
                Response::Ack
            }
            Request::ShowMessage(message) => {
                self.activity.show_message(&message);
                Response::Ack
            }
            Request::HideMessage(message) => {
                self.activity.hide_message(&message);
                Response::Ack
            }
            Request::ShowSplash | Request::Reactivate => {
                self.reclaim();
                Response::Ack
            }
            Request::HideSplash
            | Request::Quit {
                retain_splash: false,
            } => {
                self.respond(client, Response::Ack);
                self.leave_to_text();
                return;
            }
            Request::Deactivate
            | Request::Quit {
                retain_splash: true,
            } => {
                self.deactivate(Pending::Plymouth(client));
                return;
            }
            Request::NewRoot(root) => {
                if let Err(error) = self.enter_root(&root) {
                    eprintln!("Couldn't move into {}: {error}", root.display());
                }
                Response::Ack
            }
            Request::HasActiveVt
                if matches!(self.phase, Phase::Splash) && self.terminal.is_some() =>
            {
                Response::Ack
            }
            Request::CachedPassword => Response::NoAnswer,
            Request::HasActiveVt | Request::Interactive | Request::Unknown => Response::Nak,
        };
        self.respond(client, response);
    }

    fn respond(&mut self, client: Client, response: Response) {
        if let Some(server) = &mut self.plymouth {
            server.reply(client, response);
        }
    }

    pub(super) fn finish(&mut self, pending: Pending) {
        match pending {
            Pending::Control(stream) => reply(stream, "ok"),
            Pending::Plymouth(client) => self.respond(client, Response::Ack),
        }
    }

    fn show_notice(&mut self, shown: Shown) {
        let now = self.now();
        self.take_terminal();
        if let Some(terminal) = &self.terminal {
            let _ = terminal.listen();
        }
        self.look.loader.fade_to(0.0, now);
        self.look.notice.fade_to(1.0, now);
        self.notice = Some(shown);
    }

    pub(super) fn dismiss_notice(&mut self, answer: &str) {
        let Some(mut shown) = self.notice.take() else {
            return;
        };
        let now = self.now();
        if let Some(terminal) = &self.terminal {
            terminal.stop_listening();
        }
        self.look.notice.fade_to(0.0, now);
        self.settle_loader(now);
        self.fading_notice = Some(shown.notice.clone());
        if let Some(stream) = shown.dismiss() {
            reply(stream, answer);
        }
    }

    fn status(&self) -> &'static str {
        match self.phase {
            Phase::Splash => "showing",
            Phase::Leaving(_) => "leaving",
            Phase::Waiting(_) => "waiting",
            Phase::Holding => "holding",
        }
    }

    fn deactivate(&mut self, pending: Pending) {
        match &mut self.phase {
            Phase::Splash => {
                eprintln!("Handing the display over");
                let now = self.now();
                self.unlock = None;
                self.look.loader.fade_to(0.0, now);
                self.look.prompt.fade_to(0.0, now);
                self.phase = Phase::Leaving(vec![pending]);
            }
            Phase::Leaving(waiting) => waiting.push(pending),
            Phase::Waiting(_) | Phase::Holding => self.finish(pending),
        }
    }

    fn reclaim(&mut self) {
        match std::mem::replace(&mut self.phase, Phase::Splash) {
            Phase::Splash => return,
            Phase::Leaving(pending) => pending.into_iter().for_each(|waiter| self.finish(waiter)),
            Phase::Waiting(_) | Phase::Holding => {
                eprintln!("Taking the display back");
                self.previous = None;
                if let Some(screen) = self.screen.take() {
                    self.held = Some(screen.into_card());
                }
                if self.held.is_none() {
                    self.find_display();
                }
                self.retake();
            }
        }
        self.settle_loader(self.now());
        if self.plymouth.is_none() {
            self.plymouth = listen_for_plymouth_clients();
        }
    }

    pub(super) fn enter_root(&mut self, root: &Path) -> std::io::Result<()> {
        if self.root.as_deref() == Some(root) {
            return Ok(());
        }
        rustix::process::chroot(root)?;
        std::env::set_current_dir("/")?;
        self.root = Some(root.to_owned());
        self.config = Config::load();
        self.hints = hints(&self.config);
        eprintln!("Moved into {}", root.display());
        Ok(())
    }
}

pub(super) fn reply(mut stream: UnixStream, message: &str) {
    let _ = stream.write_all(format!("{message}\n").as_bytes());
}
