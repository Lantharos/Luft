import GLib from 'gi://GLib';

import type {Publish} from '../bus.js';

const UPDATER = `<node><interface name="com.lantharos.Updater1">
  <property name="Downloading" type="b" access="read"/>
  <property name="Downloaded" type="t" access="read"/>
  <method name="Status"><arg type="s" direction="out"/></method>
  <method name="StableReleased"><arg type="s" direction="out"/></method>
  <method name="Space"><arg type="s" direction="out"/></method>
  <method name="SwitchChannel"><arg type="s" direction="in"/><arg type="b" direction="out"/></method>
  <method name="Apply"/>
  <method name="Download"/>
  <method name="Cancel"/>
  <signal name="Finished"><arg type="s"/></signal>
</interface></node>`;
const UPDATER_CONTROL = `<node><interface name="com.lantharos.KestrelChecks.Updater">
  <method name="Stage"><arg type="b" direction="in"/></method>
  <method name="UseChannel"><arg type="s" direction="in"/><arg type="s" direction="in"/></method>
</interface></node>`;

export const UPDATER_NAME = 'com.lantharos.Updater1';
export const DOWNLOAD_SIZE = 200_000_000;
const DOWNLOAD_STEP_MS = 250;
const DOWNLOAD_STEPS = 160;
const IMAGE = {image: 'ghcr.io/lantharos/luft:1-nightly', transport: 'registry'};
const CHANNEL_TAGS: Record<string, string> = {stable: '1', nightly: '1-nightly'};
const VERSION = '1.2-nightly.21';
const DIGEST = 'sha256:4c5f0f8a1b6e2d7c9a3e5b1f7d2c8a6e4b0f9d3c7a1e5b2f8d6c4a0e9b3f7d1c';
const NEXT_VERSION = '1.2-nightly.22';
const LUFT_SPACE = {version: VERSION, running: 9_400_000_000, downloaded: 0, older: 3_100_000_000};
const NEXT_DIGEST = 'sha256:9e1d3b7f5a2c8e4d6b0a9f3c7e1b5d2a8f4c6e0b9d3a7f1e5c2b8d4a6f0e9c3b';

const configOf = (created: string, version: string) => ({created, config: {Labels: {'org.opencontainers.image.version': version}}});

interface Channels {
  followed: string;
  waiting: string | null;
  stable: string;
}

const followedImage = (channel: string) =>
  channel ? {image: `ghcr.io/lantharos/luft:${CHANNEL_TAGS[channel]}`, transport: 'containers-storage'} : null;

const status = (staged: boolean, channels: Channels) => JSON.stringify({
  waiting: channels.waiting,
  host: {
    spec: {image: followedImage(channels.followed)},
    status: {
      booted: {image: {image: IMAGE, version: VERSION, imageDigest: DIGEST}},
      staged: staged ? {downloadOnly: false, image: {image: IMAGE, version: NEXT_VERSION, imageDigest: NEXT_DIGEST}} : null,
      rollback: null,
      rollbackQueued: false,
    },
  },
  configs: {
    [DIGEST]: configOf('2026-10-27T02:14:09Z', VERSION),
    ...staged && {[NEXT_DIGEST]: configOf('2026-10-28T02:11:40Z', NEXT_VERSION)},
  },
});

export function publishUpdater(publish: Publish, calls: string[]) {
  let downloading = false;
  let downloaded = 0;
  let step = 0;
  let staged = false;
  const channels: Channels = {followed: '', waiting: null, stable: 'no'};
  publish(UPDATER_CONTROL, {
    Stage: (scheduled: boolean) => {
      staged = scheduled;
    },
    UseChannel: (followed: string, stable: string) => {
      Object.assign(channels, {followed, waiting: null, stable});
    },
  }, '/com/lantharos/KestrelChecks/Updater');
  const updater = publish(UPDATER, {
    get Downloading() { return downloading; },
    get Downloaded() { return downloaded; },
    Status: () => status(staged, channels),
    StableReleased: () => channels.stable,
    Space: () => JSON.stringify(LUFT_SPACE),
    SwitchChannel: (channel: string) => {
      calls.push(`Updater SwitchChannel ${channel}`);
      channels.waiting = channel === channels.followed ? null : channel;
      return false;
    },
    Apply: () => calls.push('Updater Apply'),
    Download: () => {
      calls.push('Updater Download');
      downloading = true;
      downloaded = 0;
      updater.emit_property_changed('Downloading', new GLib.Variant('b', true));
      step = GLib.timeout_add(GLib.PRIORITY_DEFAULT, DOWNLOAD_STEP_MS, () => {
        downloaded = Math.min(DOWNLOAD_SIZE, downloaded + DOWNLOAD_SIZE / DOWNLOAD_STEPS);
        updater.emit_property_changed('Downloaded', new GLib.Variant('t', downloaded));
        if (downloaded < DOWNLOAD_SIZE) return GLib.SOURCE_CONTINUE;
        finish('');
        return GLib.SOURCE_REMOVE;
      });
    },
    Cancel: () => {
      calls.push('Updater Cancel');
      GLib.source_remove(step);
      finish('The download was stopped.');
    },
  }, '/com/lantharos/Updater1');

  function finish(error: string) {
    downloading = false;
    updater.emit_property_changed('Downloading', new GLib.Variant('b', false));
    updater.emit_signal('Finished', new GLib.Variant('(s)', [error]));
  }
}
