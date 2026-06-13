.PHONY: build install dracut test vm-clean vm-build vm-build-luks vm-run vm-run-luks vm-run-luks-serial

build:
	./scripts/build.sh

install: build
	DESTDIR=$(DESTDIR) ./scripts/build.sh

dracut: install
	sudo dracut --force --omit plymouth --add sushi

test:
	cargo test --workspace --exclude sushiboot
	cargo build --workspace --exclude sushiboot

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

# Plain ext4 root on /dev/vda — no crypttab, no passphrase prompt.
vm-run: vm-build
	./scripts/vm/run-qemu.sh

vm-run-luks: vm-build-luks
	./scripts/vm/run-qemu.sh

vm-run-luks-serial: vm-build-luks
	SERIAL=stdio ./scripts/vm/run-qemu.sh