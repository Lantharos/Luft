#!/usr/bin/env bash
set -euo pipefail

system="$1"
kernels="$2"
key="$3"
certificate="$4"
pcr_keys="$5"
out="$6"
shipped="$system/usr/lib/luft/pcr-keys"
kernel="$(ls "$system/usr/lib/modules")"
work="$(mktemp -d)"
rescue_drops=(quiet rhgb loglevel systemd.show_status sushi plymouth.enable)
unused_modules=(qemu lunmask i18n)
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

command_line() {
  ukify inspect "$1" --json=short | python3 -c 'import json, sys; print(json.load(sys.stdin)[".cmdline"]["text"].strip())'
}

startup_image() {
  bootc container ukify --rootfs "$system" --kernel-dir "$work/$kernel" -- "$@"
}

policy_signers() {
  local public key signer
  (umask 077 && csplit --quiet --elide-empty-files --prefix="$work/pcr-key-" "$pcr_keys" '/-----BEGIN/' '{*}')
  for public in "$shipped"/*.pem; do
    signer=""
    for key in "$work"/pcr-key-*; do
      ! cmp --silent "$public" <(openssl pkey -in "$key" -pubout) || signer="$key"
    done
    [[ -n "$signer" ]] || { echo "No key was given for the TPM policy generation ${public##*/} that $system ships" >&2; exit 1; }
    echo "--pcr-private-key=$signer"
    echo "--pcr-public-key=$public"
    echo "--phases=enter-initrd"
  done
}

mkdir -p "$work/$kernel"
ln -s "$kernels/$kernel/vmlinuz" "$work/$kernel/vmlinuz"
dracut --quiet --force --no-hostonly --omit "${unused_modules[*]}" --omit-drivers "${unused_drivers[*]}" \
  --kver "$kernel" "$work/$kernel/initramfs.img"
startup_image --output="$work/unsigned.efi"
main="$(command_line "$work/unsigned.efi")"
rescue="$(without "$main") systemd.unit=rescue.target systemd.setenv=SYSTEMD_SULOGIN_FORCE=1"
ukify build --profile=$'ID=rescue\nTITLE=Rescue' --cmdline="$rescue" --output="$work/rescue.efi"
mkdir -p "$out"
signers="$(policy_signers)"
mapfile -t signers <<<"$signers"
startup_image \
  --profile=ID=main \
  --join-profile="$work/rescue.efi" \
  --signtool=sbsign \
  --secureboot-private-key="$key" \
  --secureboot-certificate="$certificate" \
  "${signers[@]}" \
  --sign-initrd-pcrs \
  --pcr-banks=sha256 \
  --sign-profile=main \
  --output="$out/luft.efi"
python3 -I /usr/local/lib/luft-check-policy.py "$out/luft.efi" "$shipped"/*.pem
rm -rf "$work"
