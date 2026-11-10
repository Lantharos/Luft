import type { Action, Icon } from './surfaces.js';
import type { Disposable } from '../types.js';

export interface Search {
  /** Adds results to Start's search, under the provider's title. */
  addProvider(provider: SearchProvider): Disposable;
}

export interface SearchProvider {
  title: string;
  /** Results for what someone typed, best first. Kestrel shows the first few and drops answers to older queries. */
  search(query: string): readonly SearchResult[] | Promise<readonly SearchResult[]>;
}

export interface SearchResult {
  title: string;
  description?: string;
  icon?: Icon;
  activate(): void;
}

export interface Notifications {
  send(notification: NotificationOptions): Notification;
  /**
   * Whether banners are held back right now: Do Not Disturb is on, or an extension such as Focus holds them. A
   * notification sent meanwhile goes straight to the notification center, so what should be seen when it's over can wait.
   */
  readonly heldBack: boolean;
  onHeldBackChanged(changed: () => void): Disposable;
}

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: Icon;
  /** Shows the notification even during Do Not Disturb. Keep it for what can't wait. */
  urgent?: boolean;
  onActivate?(): void;
  actions?: Action[];
}

/** Disposing a notification withdraws it. */
export type Notification = Disposable;

export interface DoNotDisturb {
  /**
   * Holds back other notifications' banners and sounds until the hold ends, the way Do Not Disturb does, such as during
   * a work session. Urgent notifications and apps people let through Do Not Disturb still show. Nothing is lost: what
   * comes in stays in the notification center. Notifications the extension sends itself aren't held.
   */
  hold(): NotificationHold;
  /** Whether notifications are held back: Do Not Disturb is on, or an extension holds them. */
  readonly holding: boolean;
  onChanged(changed: () => void): Disposable;
}

/** Notifications that came in from one app during a hold, and are still in the notification center. */
export interface HeldNotifications {
  /** The app's name. */
  readonly app: string;
  readonly count: number;
}

export interface NotificationHold extends Disposable {
  /** What came in so far, by app, most first. Only names and counts: the extension never sees what notifications say. */
  readonly held: readonly HeldNotifications[];
  /** Runs `changed` when another notification is held, or a held one is dismissed. */
  onHeld(changed: () => void): Disposable;
  /**
   * Ends the hold and returns what came in, for the extension to sum up itself. Disposing the hold, or the extension
   * being turned off, ends it too, and then Kestrel sums up what came in with a notification of its own.
   */
  release(): readonly HeldNotifications[];
}

/**
 * Connects to the hosts the manifest names under `[network]`, over HTTPS. Requests to any other host are refused, so
 * the store and Settings can show exactly where an extension connects.
 */
export interface Network {
  fetch(url: string, options?: RequestOptions): Promise<Response>;
}

export interface RequestOptions {
  /** `GET` without it. */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Readonly<Record<string, string>>;
  /** Sent as is; set `content-type` in `headers`, such as `application/json`. */
  body?: string;
  /** Seconds to wait before giving up; 20 without it. */
  timeout?: number;
}

/** A whole response, up to 4 MB. A request that can't reach the host rejects instead. */
export interface Response {
  readonly status: number;
  /** Whether the status is 200 to 299. */
  readonly ok: boolean;
  /** Header names in lowercase. */
  readonly headers: Readonly<Record<string, string>>;
  readonly text: string;
  /** The body read as JSON. It throws when it isn't. */
  json<Value = unknown>(): Value;
}

/**
 * Puts things on the clipboard, as if people copied them, so they can paste them anywhere. Clipboard history keeps
 * them like anything else that's copied.
 */
export interface Clipboard {
  setText(text: string): void;
  /** Copies a PNG, JPEG, WebP or GIF picture, by its full path. */
  setImage(path: string): Promise<void>;
  /** Copies files and folders, by their full paths, to paste in Rover and other apps. */
  setFiles(paths: readonly string[]): void;
}

/** Adds entries to the menu Rover opens on files and folders, drawn by Rover in its own style, and to the Send sheet. */
export interface FileActions {
  /** Adds an entry that shows for the files and folders its `on` describes, and gets their full paths when people choose it. */
  add(action: FileActionOptions): FileAction;
}

/** Which files and folders an action is for. Leave out a field to take every kind. */
export interface FileTargets {
  /** `files`, `folders`, or `any` for both. It's `any` when left out. */
  kind?: 'files' | 'folders' | 'any';
  /** MIME types the files need, such as `image/png`, or a whole group such as `image/*`. */
  types?: readonly string[];
  /** File name extensions the files need, without the dot, such as `pdf`. A file of a listed type or with a listed extension counts. */
  extensions?: readonly string[];
  /** Whether it shows while several are chosen. It does unless this is `false`. */
  multiple?: boolean;
}

/**
 * An entry in an action's own menu. `disabled` greys it out, for a placeholder such as "Nothing nearby".
 * `keepsMenuOpen` leaves the menu open when it's chosen, for an entry such as "Look again" whose results show up in
 * place once the action refreshes.
 */
export interface FileActionChoice {
  /** Tells the choices apart in `onActivate`. */
  key: string;
  label: string;
  icon?: Icon;
  disabled?: boolean;
  keepsMenuOpen?: boolean;
}

/** `separator` draws a line between choices. */
export type FileActionItem = FileActionChoice | 'separator';

export interface FileActionOptions {
  /** Names the action among the extension's actions, lowercase with dashes. */
  key: string;
  label: string;
  icon: Icon;
  /** Which files and folders it shows for. It shows for anything people choose when left out. */
  on?: FileTargets;
  /**
   * Gives the action a menu of its own, such as the devices to send to. Kestrel asks again after
   * {@link FileAction.refresh}, and Rover keeps what it got, so the menu opens without waiting.
   */
  items?(): FileActionItem[];
  /** Runs as people open the action's menu, such as to look for devices again. */
  onOpened?(): void;
  /** Runs when people choose the action, or one of its choices by `key`, with the full paths of what they chose. */
  onActivate(paths: string[], choice?: string): void;
  /** Whether it shows. It does unless this is `false`. */
  shown?: boolean;
}

export interface FileAction extends Disposable {
  update(changes: Partial<Omit<FileActionOptions, 'key'>>): void;
  /** Asks for `items` again, when what they show has changed. */
  refresh(): void;
}

export interface Helper {
  /**
   * Starts the native helper the manifest declares, in the extension's folder, with `LUFT_EXTENSION_DIR` set to it.
   * Kestrel stops it when the extension is turned off.
   */
  start(args?: string[]): HelperProcess;
}

export interface HelperProcess extends Disposable {
  readonly running: boolean;
  /** Writes a line to the helper's standard input. Lines are written in order. */
  write(line: string): Promise<void>;
  /** Runs `received` with each line the helper writes to its standard output. */
  onLine(received: (line: string) => void): Disposable;
  /** Runs `exited` when the helper stops, with its exit status. */
  onExit(exited: (status: number) => void): Disposable;
  /** Closes the helper's standard input, so it can finish by itself. Disposing stops it right away. */
  close(): void;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  /** How far off the position may be, in metres. */
  accuracy: number;
}

export interface Location {
  /** Roughly where the computer is, to the city, or `null` while location services are off or the position is unknown. */
  current(): Promise<Coordinates | null>;
  /** Runs `changed` when the computer has moved to another city, checked about every ten minutes. */
  onChanged(changed: (coordinates: Coordinates) => void): Disposable;
}

export type WeatherCondition = 'clear' | 'clouds' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';

/** The season where the computer is, by the date and which side of the equator it's on. */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface WeatherReport {
  condition: WeatherCondition;
  /** Degrees Celsius. */
  temperature: number;
  /** Millimetres an hour. */
  precipitation: number;
  /** Kilometres an hour. */
  wind: number;
  daytime: boolean;
  /** Today's sunrise and sunset there, in milliseconds since 1970. */
  sunrise: number;
  sunset: number;
  season: Season;
  /** When the report was made, in milliseconds since 1970. */
  time: number;
}

export interface Weather {
  /** The weather where the computer is, or `null` while location services are off or the weather can't be fetched. */
  current(): Promise<WeatherReport | null>;
  /** Runs `changed` with each new report, about every half hour. */
  onChanged(changed: (report: WeatherReport) => void): Disposable;
}

export interface MediaPlayer {
  /** Stays the same while the player runs, to tell players apart. */
  readonly id: string;
  /** The app that plays, as its desktop file id when known. */
  readonly app: string | null;
  /** The player's name as people know it, such as the app's name. */
  readonly appName: string;
  readonly title: string;
  readonly artist: string;
  readonly album: string;
  /**
   * A picture of what plays, as a file Kestrel keeps that views can show by its path, or `null` while there's none or
   * it's still being fetched. {@link Media.onChanged} runs once it's there.
   */
  readonly artwork: string | null;
  readonly playing: boolean;
  /** The track's length in seconds, or 0 when the player doesn't say. */
  readonly length: number;
  readonly canGoNext: boolean;
  readonly canGoPrevious: boolean;
  readonly canSeek: boolean;
  /** Where the track is, in seconds. Players don't announce it as it moves, so ask while showing it. */
  position(): Promise<number>;
  /** Jumps to `seconds` into the track, when {@link canSeek}. */
  seek(seconds: number): void;
  playPause(): void;
  next(): void;
  previous(): void;
  /** Brings the player's window to the front. */
  raise(): void;
}

export interface Media {
  /** The player people would control with their media keys, if anything plays or paused. */
  readonly player: MediaPlayer | null;
  /** Every player there is, such as a music app and a browser tab. */
  readonly players: readonly MediaPlayer[];
  /** Where sound goes. */
  readonly output: AudioOutput;
  /** Runs `changed` when a player comes or goes, what it plays changes, it jumps within a track, or artwork arrives. */
  onChanged(changed: () => void): Disposable;
}

export interface AudioOutput {
  /** The volume of the sound output, 0 to 1. */
  volume: number;
  muted: boolean;
  /** Speakers, headphones and other outputs people can choose. */
  readonly devices: readonly OutputDevice[];
  /** Sends sound to the device with this {@link OutputDevice.id}. */
  choose(id: string): void;
  onChanged(changed: () => void): Disposable;
}

export interface OutputDevice {
  readonly id: string;
  readonly name: string;
  /** Where it is, such as the card it belongs to, or `null`. */
  readonly detail: string | null;
  readonly active: boolean;
}
