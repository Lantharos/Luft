.PHONY: build install dracut test vm-clean vm-build vm-build-luks vm-build-fedora vm-run vm-run-luks vm-run-luks-serial vm-run-fedora

build:
	./scripts/build.sh

install: build
	DESTDIR=$(DESTDIR) ./scripts/build.sh

dracut: install
	sudo dracut --force --omit plymouth --add sushi

test:
	cargo test --workspace --exclude sushiboot
	cargo build --workspace --exclude sushiboot

bootctl-install:
	cargo build -p sushi-bootctl --release
	sudo ./target/release/sushi-bootctl install --sign --efi-entry

vm-clean:
	@rm -rf vm/rootfs-tree vm/initramfs-root 2>/dev/null || true
	@if [ -e vm/rootfs-tree ]; then \
		echo "vm/rootfs-tree is root-owned — run: sudo rm -rf vm/rootfs-tree"; \
		exit 1; \
	fi

vm-build:
	./scripts/vm/build-esp.sh

vm-build-luks:
	LUKS=1 ./scripts/vm/build-esp.sh

# Fedora root (systemd + LightDM greeter + Openbox). First build needs sudo + network.
vm-build-fedora:
	VM_PROFILE=fedora ./scripts/vm/build-esp.sh

# Plain ext4 root on /dev/vda — no crypttab, no passphrase prompt.
vm-run: vm-build
	./scripts/vm/run-qemu.sh

vm-run-luks: vm-build-luks
	./scripts/vm/run-qemu.sh

vm-run-luks-serial: vm-build-luks
	SERIAL=stdio ./scripts/vm/run-qemu.sh

vm-run-fedora: vm-build-fedora
	VM_PROFILE=fedora ./scripts/vm/run-qemu.sh