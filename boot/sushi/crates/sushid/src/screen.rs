use std::io;
use std::path::Path;

use rustix::fs::{XattrFlags, getxattr, setxattr};
use sushi::control;
use sushi::display::{Card, Display, ModeHints};
use sushi::render::Logo;
use sushi::scene::{FADE_SECONDS, Notice, Prompt, Rect, Scene, Status, Visuals, ease, is_shaking};

const SELINUX_LABEL: &str = "security.selinux";
const LOGIN_SCREEN_RUNTIME_TYPE: &str = "xdm_var_run_t";

#[derive(Clone, Copy, Debug)]
pub struct Fader {
    from: f32,
    to: f32,
    since: f32,
}

impl Fader {
    pub fn at(value: f32) -> Self {
        Self {
            from: value,
            to: value,
            since: f32::NEG_INFINITY,
        }
    }

    pub fn value(&self, now: f32) -> f32 {
        self.from + (self.to - self.from) * ease((now - self.since) / FADE_SECONDS)
    }

    pub fn fade_to(&mut self, to: f32, now: f32) {
        if to != self.to {
            *self = Self {
                from: self.value(now),
                to,
                since: now,
            };
        }
    }

    pub fn settled(&self, now: f32) -> bool {
        now - self.since >= FADE_SECONDS
    }
}

#[derive(Clone, Copy)]
pub struct Look {
    pub logo: Fader,
    pub loader: Fader,
    pub prompt: Fader,
    pub notice: Fader,
}

impl Look {
    pub fn settled(&self, now: f32) -> bool {
        self.logo.settled(now)
            && self.loader.settled(now)
            && self.prompt.settled(now)
            && self.notice.settled(now)
    }

    pub fn is_animating(&self, now: f32, prompt: Option<&Prompt>) -> bool {
        !self.settled(now)
            || self.loader.value(now) > 0.0
            || prompt.is_some_and(|prompt| is_shaking(prompt, now))
    }
}

#[derive(Clone, Default, PartialEq)]
struct Shown {
    logo: f32,
    loader: f32,
    prompt: f32,
    content: Option<Prompt>,
    status: Option<(Status, f32)>,
    notice: f32,
    notice_content: Option<Notice>,
}

pub struct Screen {
    display: Display,
    scenes: Vec<Scene>,
    shown: Option<Shown>,
}

impl Screen {
    pub fn new(display: Display, logo: Option<&Logo>, firmware_size: (u32, u32)) -> Self {
        let scenes = display
            .sizes()
            .into_iter()
            .map(|(width, height)| {
                Scene::new(
                    width,
                    height,
                    logo.map(|logo| logo.on_screen(firmware_size.0, firmware_size.1)),
                )
            })
            .collect();
        Self {
            display,
            scenes,
            shown: None,
        }
    }

    pub fn refresh(
        self,
        hints: &ModeHints,
        logo: Option<&Logo>,
        firmware_size: (u32, u32),
    ) -> io::Result<Self> {
        let (display, changed) = self.display.refresh(hints)?;
        Ok(if changed {
            Self::new(display, logo, firmware_size)
        } else {
            Self { display, ..self }
        })
    }

    pub fn invalidate(&mut self) {
        self.shown = None;
    }

    pub fn path(&self) -> &Path {
        self.display.path()
    }

    pub fn display(&self) -> &Display {
        &self.display
    }

    pub fn draw(
        &mut self,
        look: &Look,
        now: f32,
        prompt: Option<&Prompt>,
        status: Option<(Status, f32)>,
        notice: Option<&Notice>,
    ) -> io::Result<()> {
        let next = Shown {
            logo: look.logo.value(now),
            loader: look.loader.value(now),
            prompt: look.prompt.value(now),
            content: prompt.cloned(),
            status,
            notice: look.notice.value(now),
            notice_content: notice.cloned(),
        };
        let visuals = Visuals {
            seconds: now,
            logo: next.logo,
            loader: next.loader,
            prompt: prompt.map(|prompt| (prompt, next.prompt)),
            status: next.status.as_ref().map(|(status, alpha)| (status, *alpha)),
            notice: next
                .notice_content
                .as_ref()
                .map(|notice| (notice, next.notice)),
        };
        let first = self.shown.is_none();
        for (index, scene) in self.scenes.iter().enumerate() {
            let areas = match &self.shown {
                None => vec![scene.everything()],
                Some(shown) => damage(scene, shown, &next, now),
            };
            for area in areas {
                if let Some(pixmap) = scene.render(area, &visuals) {
                    self.display.blit(index, area, &pixmap);
                }
            }
        }
        self.shown = Some(next);
        if first {
            self.display.show()?;
        }
        Ok(())
    }

    pub fn share_logo_placement(&self) {
        let placement = self.scenes.first().and_then(|scene| scene.layout.logo);
        match placement {
            Some(logo) => {
                let _ = std::fs::write(
                    control::LOGO_PLACEMENT,
                    format!("{} {} {} {}\n", logo.x, logo.y, logo.width, logo.height),
                );
                let_login_screen_read(control::LOGO_PLACEMENT);
            }
            None => {
                let _ = std::fs::remove_file(control::LOGO_PLACEMENT);
            }
        }
    }

    pub fn release_master(&self) {
        self.display.release_master();
    }

    pub fn into_card(self) -> Card {
        self.display.into_card()
    }
}

fn let_login_screen_read(path: &str) {
    let mut label = [0u8; 256];
    let Ok(length) = getxattr(path, SELINUX_LABEL, &mut label[..]) else {
        return;
    };
    let label = String::from_utf8_lossy(&label[..length]);
    let mut fields: Vec<&str> = label.trim_end_matches('\0').splitn(4, ':').collect();
    if fields.len() < 3 {
        return;
    }
    fields[2] = LOGIN_SCREEN_RUNTIME_TYPE;
    let _ = setxattr(
        path,
        SELINUX_LABEL,
        fields.join(":").as_bytes(),
        XattrFlags::empty(),
    );
}

fn damage(scene: &Scene, shown: &Shown, next: &Shown, now: f32) -> Vec<Rect> {
    let mut areas = Vec::new();
    if shown.logo != next.logo
        && let Some(logo) = scene.layout.logo
    {
        areas.push(logo);
    }
    if shown.loader > 0.0 || next.loader > 0.0 {
        areas.push(scene.loader_area());
    }
    let shaking = next
        .content
        .as_ref()
        .is_some_and(|prompt| is_shaking(prompt, now));
    if shown.prompt != next.prompt || shown.content != next.content || shaking {
        areas.push(scene.prompt_area());
    }
    if shown.status != next.status {
        areas.push(scene.status_area());
    }
    if shown.notice != next.notice || shown.notice_content != next.notice_content {
        areas.push(scene.notice_area());
    }
    areas
}
