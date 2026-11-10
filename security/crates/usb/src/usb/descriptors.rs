const INTERFACE: u8 = 4;
const INTERFACE_LENGTH: usize = 9;
const CLASS_OFFSET: usize = 5;
const HUB: u8 = 0x09;
const HID: u8 = 0x03;
const BOOT: u8 = 0x01;
const KEYBOARD: u8 = 0x01;
const MOUSE: u8 = 0x02;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Function {
    pub class: u8,
    pub subclass: u8,
    pub protocol: u8,
}

impl Function {
    pub fn usable_while_locked(self) -> bool {
        match self.class {
            HUB => true,
            HID => self.subclass == BOOT && matches!(self.protocol, KEYBOARD | MOUSE),
            _ => false,
        }
    }
}

pub fn functions(descriptors: &[u8]) -> impl Iterator<Item = Function> + '_ {
    let mut rest = descriptors;
    std::iter::from_fn(move || {
        loop {
            let length = usize::from(*rest.first()?);
            let (descriptor, next) = rest.split_at_checked(length).filter(|_| length >= 2)?;
            rest = next;
            if descriptor[1] == INTERFACE && length >= INTERFACE_LENGTH {
                return Some(Function {
                    class: descriptor[CLASS_OFFSET],
                    subclass: descriptor[CLASS_OFFSET + 1],
                    protocol: descriptor[CLASS_OFFSET + 2],
                });
            }
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_every_interface_class_of_a_composite_device() {
        let device = [
            18, 1, 0, 2, 0, 0, 0, 64, 0x81, 0x07, 0x81, 0x55, 0, 1, 1, 2, 3, 1,
        ];
        let configuration = [9, 2, 57, 0, 2, 1, 0, 0x80, 50];
        let storage = [9, 4, 0, 0, 2, 0x08, 0x06, 0x50, 0];
        let endpoint = [7, 5, 0x81, 2, 0, 2, 0];
        let keyboard = [9, 4, 1, 0, 1, 0x03, 0x01, 0x01, 0];
        let hid = [9, 0x21, 0x11, 0x01, 0, 1, 0x22, 63, 0];
        let descriptors = [
            &device[..],
            &configuration,
            &storage,
            &endpoint,
            &endpoint,
            &keyboard,
            &hid,
            &endpoint,
        ]
        .concat();
        let found: Vec<Function> = functions(&descriptors).collect();
        assert_eq!(
            found.iter().map(|found| found.class).collect::<Vec<_>>(),
            [0x08, 0x03]
        );
        assert_eq!(
            found
                .iter()
                .map(|found| found.usable_while_locked())
                .collect::<Vec<_>>(),
            [false, true]
        );
    }

    #[test]
    fn holds_back_input_devices_that_are_more_than_a_keyboard_or_mouse() {
        let function = |class, subclass, protocol| Function {
            class,
            subclass,
            protocol,
        };
        assert!(function(HID, BOOT, MOUSE).usable_while_locked());
        assert!(function(HUB, 0, 0).usable_while_locked());
        assert!(!function(HID, 0, 0).usable_while_locked());
        assert!(!function(HID, BOOT, 0).usable_while_locked());
        assert!(!function(0xff, BOOT, KEYBOARD).usable_while_locked());
    }

    #[test]
    fn stops_at_a_truncated_descriptor() {
        let descriptors = [9, 4, 0, 0, 1, 0x03, 0, 0, 0, 9, 4, 1];
        assert_eq!(
            functions(&descriptors)
                .map(|found| found.class)
                .collect::<Vec<_>>(),
            [0x03]
        );
    }
}
