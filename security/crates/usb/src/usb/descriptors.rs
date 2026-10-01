const INTERFACE: u8 = 4;
const INTERFACE_LENGTH: usize = 9;
const CLASS_OFFSET: usize = 5;

pub fn interface_classes(descriptors: &[u8]) -> impl Iterator<Item = u8> + '_ {
    let mut rest = descriptors;
    std::iter::from_fn(move || {
        loop {
            let length = usize::from(*rest.first()?);
            let (descriptor, next) = rest.split_at_checked(length).filter(|_| length >= 2)?;
            rest = next;
            if descriptor[1] == INTERFACE && length >= INTERFACE_LENGTH {
                return Some(descriptor[CLASS_OFFSET]);
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
        assert_eq!(
            interface_classes(&descriptors).collect::<Vec<_>>(),
            [0x08, 0x03]
        );
    }

    #[test]
    fn stops_at_a_truncated_descriptor() {
        let descriptors = [9, 4, 0, 0, 1, 0x03, 0, 0, 0, 9, 4, 1];
        assert_eq!(interface_classes(&descriptors).collect::<Vec<_>>(), [0x03]);
    }
}
