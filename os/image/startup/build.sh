#!/usr/bin/env bash
set -euo pipefail

digest="$1"
key="$2"
certificate="$3"
pcr_key="$4"
out="$5"
kernel="$(ls /usr/lib/modules)"
work="$(mktemp -d)"
rescue_drops=(quiet rhgb loglevel systemd.show_status sushi plymouth.enable)
unused_modules=(
  network-manager network nfs iscsi nvmf fcoe plymouth ostree lvm mdraid dmraid multipath nvdimm resume
  memstrack walinuxagent qemu qemu-net clevis clevis-pin-file clevis-pin-null clevis-pin-sss clevis-pin-tang clevis-pin-tpm2
  fips fips-crypto-policies virtiofs virtfs lunmask i18n
)
unused_drivers=(
  nouveau
  xfs f2fs jfs jffs2 ceph libceph kafs rxrpc cifs cifs_md4 smb_compress netfs cachefiles grace nfs_acl nfs_localio sunrpc
  orangefs ecryptfs hfs hfsplus minix romfs udf zonefs ntfs ntfs3 isofs exfat squashfs fuse virtiofs vboxsf 9p 9pnet
  9pnet_virtio msdos
  3w-.* a100u2w aacraid advansys aic7.xx am53c974 arcmsr atp870u bfa bnx2fc BusLogic csiostor dc395x dmx3191d efct
  esas2r esp_scsi fdomain fnic hpsa hptiop initio ipr ips isci libfc libfcoe fcoe iscsi_boot_sysfs libiscsi
  scsi_transport_iscsi scsi_transport_fc scsi_transport_srp libsas lpfc megaraid.* mpi3mr mpt3sas mvsas mvumi myrb myrs
  pm80xx pmcraid qedf qla1280 qla2xxx qla4xxx raid_class scsi_debug smartpqi snic stex sym53c8xx wd719x scsi_dh_.*
  qed cxgb4 cnic ib_.* iw_cm rdma_cm rtrs-.* target_core_mod tcm_loop nvme-fc nvmet nvmet-fc
  aoe brd drbd nbd null_blk rnull_mod rbd rnbd-client ublk_drv zloop zram
  bcache dm-cache dm-cache-smq dm-clone dm-era dm-thin-pool dm-persistent-data dm-bio-prison dm-vdo dm-writecache
  dm-zoned dm-raid raid0 raid1 raid10 raid456 linear dm-multipath dm-round-robin dm-queue-length dm-service-time
  dm-historical-service-time dm-io-affinity dm-log-userspace dm-log-writes dm-delay dm-dust dm-ebs dm-flakey dm-switch
  dm-unstripe
  qat_.* intel_qat chcr n5pf atmel-.* iaa_crypto
  mt76.* mt79.* mt792x-lib mac80211 cfg80211
)

kernel_arguments() {
  bootc container inspect --json | python3 -c 'import json, sys; print(" ".join(json.load(sys.stdin)["kargs"]))'
}

without() {
  local argument dropped kept=()
  for argument in $1; do
    for dropped in "${rescue_drops[@]}"; do
      [[ "${argument%%=*}" == "$dropped" ]] && continue 2
    done
    kept+=("$argument")
  done
  echo "${kept[*]}"
}

main="$(kernel_arguments) composefs=$digest"
rescue="$(without "$main") systemd.unit=rescue.target systemd.setenv=SYSTEMD_SULOGIN_FORCE=1"

dracut --quiet --force --no-hostonly --omit "${unused_modules[*]}" --omit-drivers "${unused_drivers[*]}" \
  --kver "$kernel" "$work/initramfs.img"
ukify build --profile=$'ID=rescue\nTITLE=Rescue' --cmdline="$rescue" --output="$work/rescue.efi"
mkdir -p "$out"
ukify build \
  --linux="/usr/lib/modules/$kernel/vmlinuz" \
  --initrd="$work/initramfs.img" \
  --uname="$kernel" \
  --os-release=@/usr/lib/os-release \
  --cmdline="$main" \
  --profile=ID=main \
  --join-profile="$work/rescue.efi" \
  --signtool=sbsign \
  --secureboot-private-key="$key" \
  --secureboot-certificate="$certificate" \
  --pcr-private-key="$pcr_key" \
  --phases=enter-initrd \
  --sign-initrd-pcrs \
  --pcr-banks=sha256 \
  --sign-profile=main \
  --output="$out/luft.efi"
python3 -I /usr/local/lib/luft-check-policy.py "$out/luft.efi" /usr/share/luft/secure-boot/pcr-policy.pem
rm -rf "$work"
