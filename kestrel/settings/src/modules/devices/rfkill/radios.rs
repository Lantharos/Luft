use std::collections::HashMap;

use tokio::sync::mpsc;
use zbus::interface;

use super::device::{BLUETOOTH, Block, Switch, WWAN};

pub const NAME: &str = "com.lantharos.Settings.Rfkill";
pub const PATH: &str = "/com/lantharos/Settings/Rfkill";
const FIXED_CHASSIS: [&str; 4] = ["desktop", "server", "vm", "container"];

pub enum Request {
    Airplane(bool),
    Bluetooth(bool),
    Wwan(bool),
}

#[derive(Clone, Copy, PartialEq, Default)]
pub struct State {
    pub airplane: bool,
    pub hardware: bool,
    pub has_airplane: bool,
    pub should_show: bool,
    pub bluetooth: bool,
    pub bluetooth_hardware: bool,
    pub has_bluetooth: bool,
    pub wwan: bool,
    pub wwan_hardware: bool,
    pub has_wwan: bool,
}

pub struct Modems {
    pub present: bool,
    pub enabled: bool,
}

impl State {
    pub fn of(switches: &HashMap<u32, Switch>, modems: &Modems, chassis: &str) -> Self {
        let all: Vec<Block> = switches.values().map(|switch| switch.block).collect();
        let of_kind = |kind| -> Vec<Block> {
            switches
                .values()
                .filter(|switch| switch.kind == kind)
                .map(|switch| switch.block)
                .collect()
        };
        let (bluetooth, wwan) = (of_kind(BLUETOOTH), of_kind(WWAN));
        let modems_off = modems.present && !modems.enabled;
        let mut wwan_airplane = blocked(&wwan);
        if modems.present && (wwan.is_empty() || wwan_airplane) {
            wwan_airplane = modems_off;
        }
        Self {
            airplane: blocked(&all) && (!modems.present || modems_off),
            hardware: hard_blocked(&all),
            has_airplane: !all.is_empty() || modems.present,
            should_show: !FIXED_CHASSIS.contains(&chassis),
            bluetooth: blocked(&bluetooth),
            bluetooth_hardware: hard_blocked(&bluetooth),
            has_bluetooth: !bluetooth.is_empty(),
            wwan: wwan_airplane,
            wwan_hardware: hard_blocked(&wwan),
            has_wwan: !wwan.is_empty() || modems.present,
        }
    }
}

fn blocked(switches: &[Block]) -> bool {
    !switches.is_empty() && switches.iter().all(|block| *block != Block::None)
}

fn hard_blocked(switches: &[Block]) -> bool {
    !switches.is_empty() && switches.iter().all(|block| *block == Block::Hard)
}

pub struct Radios {
    pub state: State,
    pub requests: mpsc::UnboundedSender<Request>,
}

#[interface(name = "com.lantharos.Settings.Rfkill")]
impl Radios {
    #[zbus(property)]
    fn airplane_mode(&self) -> bool {
        self.state.airplane
    }

    #[zbus(property)]
    fn set_airplane_mode(&mut self, enabled: bool) {
        let _ = self.requests.send(Request::Airplane(enabled));
    }

    #[zbus(property)]
    fn hardware_airplane_mode(&self) -> bool {
        self.state.hardware
    }

    #[zbus(property)]
    fn has_airplane_mode(&self) -> bool {
        self.state.has_airplane
    }

    #[zbus(property)]
    fn should_show_airplane_mode(&self) -> bool {
        self.state.should_show
    }

    #[zbus(property)]
    fn bluetooth_airplane_mode(&self) -> bool {
        self.state.bluetooth
    }

    #[zbus(property)]
    fn set_bluetooth_airplane_mode(&mut self, enabled: bool) {
        let _ = self.requests.send(Request::Bluetooth(enabled));
    }

    #[zbus(property)]
    fn bluetooth_hardware_airplane_mode(&self) -> bool {
        self.state.bluetooth_hardware
    }

    #[zbus(property)]
    fn bluetooth_has_airplane_mode(&self) -> bool {
        self.state.has_bluetooth
    }

    #[zbus(property)]
    fn wwan_airplane_mode(&self) -> bool {
        self.state.wwan
    }

    #[zbus(property)]
    fn set_wwan_airplane_mode(&mut self, enabled: bool) {
        let _ = self.requests.send(Request::Wwan(enabled));
    }

    #[zbus(property)]
    fn wwan_hardware_airplane_mode(&self) -> bool {
        self.state.wwan_hardware
    }

    #[zbus(property)]
    fn wwan_has_airplane_mode(&self) -> bool {
        self.state.has_wwan
    }
}
