use std::sync::Arc;

use tokio::sync::Mutex;
use zbus::object_server::{InterfaceRef, SignalEmitter};
use zbus::{Connection, fdo, interface};

use super::proxies::KbdBacklightProxy;

pub const NAME: &str = "com.lantharos.Settings.KeyboardLight";
pub const PATH: &str = "/com/lantharos/Settings/KeyboardLight";

pub enum IdleChange {
    Dim(i32),
    Off,
    Restore,
}

pub struct Backlight {
    proxy: KbdBacklightProxy<'static>,
    level: i32,
    max: i32,
    before_off: Option<i32>,
    before_dim: Option<i32>,
}

impl Backlight {
    pub async fn connect(system: &Connection) -> Option<Self> {
        let proxy = KbdBacklightProxy::new(system).await.ok()?;
        let level = proxy.get_brightness().await.ok()?;
        let max = proxy
            .get_max_brightness()
            .await
            .ok()
            .filter(|max| *max > 0)?;
        let mut backlight = Self {
            proxy,
            level,
            max,
            before_off: None,
            before_dim: None,
        };
        if level < 0 {
            backlight.set(max).await.ok()?;
        }
        Some(backlight)
    }

    pub fn proxy(&self) -> KbdBacklightProxy<'static> {
        self.proxy.clone()
    }

    pub fn percentage(&self) -> i32 {
        (f64::from(self.level) * 100.0 / f64::from(self.max)).round() as i32
    }

    fn level_for(&self, percentage: i32) -> i32 {
        (f64::from(percentage.clamp(0, 100)) * f64::from(self.max) / 100.0).round() as i32
    }

    fn step(&self) -> i32 {
        if self.max < 20 { 1 } else { self.max / 20 }
    }

    pub fn steps(&self) -> i32 {
        self.max / self.step() + 1
    }

    pub fn follow(&mut self, level: i32) {
        self.level = level;
    }

    async fn set(&mut self, level: i32) -> zbus::Result<()> {
        if level != self.level {
            self.proxy.set_brightness(level).await?;
            self.level = level;
        }
        Ok(())
    }

    pub async fn set_percentage(&mut self, percentage: i32) -> zbus::Result<()> {
        self.set(self.level_for(percentage)).await
    }

    pub async fn step_up(&mut self) -> zbus::Result<()> {
        self.set((self.level + self.step()).min(self.max)).await
    }

    pub async fn step_down(&mut self) -> zbus::Result<()> {
        self.set((self.level - self.step()).max(0)).await
    }

    pub async fn toggle(&mut self) -> zbus::Result<()> {
        match self.before_off.take() {
            Some(level) => self.set(level).await,
            None => {
                let level = self.level;
                self.set(0).await?;
                self.before_off = Some(level);
                Ok(())
            }
        }
    }

    pub async fn idle(&mut self, change: IdleChange) -> zbus::Result<()> {
        match change {
            IdleChange::Dim(percentage) => self.dim(percentage).await,
            IdleChange::Off => self.switch_off().await,
            IdleChange::Restore => self.restore().await,
        }
    }

    async fn dim(&mut self, percentage: i32) -> zbus::Result<()> {
        let dimmed = self.level_for(percentage);
        if dimmed > self.level {
            return Ok(());
        }
        let level = self.level;
        self.set(dimmed).await?;
        self.before_dim = Some(level);
        Ok(())
    }

    async fn switch_off(&mut self) -> zbus::Result<()> {
        if self.before_off.is_none() {
            self.toggle().await?;
        }
        Ok(())
    }

    async fn restore(&mut self) -> zbus::Result<()> {
        if self.before_off.is_some() {
            self.toggle().await?;
        }
        if let Some(level) = self.before_dim.take() {
            self.set(level).await?;
        }
        Ok(())
    }
}

pub struct Keyboard {
    pub backlight: Arc<Mutex<Backlight>>,
}

impl Keyboard {
    async fn changed(&self, emitter: &SignalEmitter<'_>, source: &str) -> fdo::Result<i32> {
        let percentage = self.backlight.lock().await.percentage();
        self.brightness_changed(emitter).await?;
        Self::announce(emitter, percentage, source).await?;
        Ok(percentage)
    }
}

#[interface(name = "com.lantharos.Settings.KeyboardLight")]
impl Keyboard {
    #[zbus(property)]
    async fn brightness(&self) -> i32 {
        self.backlight.lock().await.percentage()
    }

    #[zbus(property)]
    async fn set_brightness(&mut self, percentage: i32) -> fdo::Result<()> {
        Ok(self
            .backlight
            .lock()
            .await
            .set_percentage(percentage)
            .await?)
    }

    #[zbus(property)]
    async fn steps(&self) -> i32 {
        self.backlight.lock().await.steps()
    }

    async fn step_up(
        &self,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<i32> {
        self.backlight.lock().await.step_up().await?;
        self.changed(&emitter, "StepUp").await
    }

    async fn step_down(
        &self,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> fdo::Result<i32> {
        self.backlight.lock().await.step_down().await?;
        self.changed(&emitter, "StepDown").await
    }

    async fn toggle(&self, #[zbus(signal_emitter)] emitter: SignalEmitter<'_>) -> fdo::Result<i32> {
        self.backlight.lock().await.toggle().await?;
        self.changed(&emitter, "Toggle").await
    }

    #[zbus(signal, name = "BrightnessChanged")]
    async fn announce(
        emitter: &SignalEmitter<'_>,
        brightness: i32,
        source: &str,
    ) -> zbus::Result<()>;
}

pub async fn announce(keyboard: &InterfaceRef<Keyboard>, source: &str) {
    if let Err(error) = keyboard
        .get()
        .await
        .changed(keyboard.signal_emitter(), source)
        .await
    {
        eprintln!("Couldn't announce the keyboard brightness: {error}");
    }
}
