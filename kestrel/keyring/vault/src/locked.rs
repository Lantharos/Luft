use std::ptr::NonNull;

use rustix::mm::{Advice, MapFlags, ProtFlags, madvise, mlock, mmap_anonymous, munmap};
use zeroize::Zeroize;

const PAGE: usize = 4096;

pub struct LockedBytes<const N: usize> {
    page: NonNull<[u8; N]>,
}

unsafe impl<const N: usize> Send for LockedBytes<N> {}
unsafe impl<const N: usize> Sync for LockedBytes<N> {}

impl<const N: usize> LockedBytes<N> {
    pub fn zeroed() -> rustix::io::Result<Self> {
        const { assert!(N <= PAGE) };
        let address = unsafe {
            mmap_anonymous(
                std::ptr::null_mut(),
                PAGE,
                ProtFlags::READ | ProtFlags::WRITE,
                MapFlags::PRIVATE,
            )?
        };
        let locked = unsafe {
            mlock(address, PAGE)
                .and_then(|()| madvise(address, PAGE, Advice::LinuxDontDump))
                .and_then(|()| madvise(address, PAGE, Advice::LinuxWipeOnFork))
        };
        if let Err(error) = locked {
            unsafe {
                let _ = munmap(address, PAGE);
            }
            return Err(error);
        }
        Ok(Self {
            page: NonNull::new(address.cast()).expect("mmap never returns null"),
        })
    }

    pub fn bytes(&self) -> &[u8; N] {
        unsafe { self.page.as_ref() }
    }

    pub fn bytes_mut(&mut self) -> &mut [u8; N] {
        unsafe { self.page.as_mut() }
    }
}

impl<const N: usize> Drop for LockedBytes<N> {
    fn drop(&mut self) {
        self.bytes_mut().zeroize();
        unsafe {
            let _ = munmap(self.page.as_ptr().cast(), PAGE);
        }
    }
}
