// BackgroundManager
//   The only object that other parts of the shell deal with; a
//   BackgroundManager creates background actors and adds them to
//   the specified container. When the background is changed by the
//   user it will fade out the old actor and fade in the new actor.
//
// BackgroundTextureCache
//   Shell-side cache from filename to CoglTexture. Handles image loading
//   using glycin, creates textures, and manages GL video memory purge events.
//
// BackgroundSource
//   An object that is created for each GSettings schema (separate
//   settings schemas are used for the lock screen and main background),
//   and holds a reference to a shared Background object.
//
// MetaBackground
//   Holds the specification of a background - a background color
//   or a texture.
//
// Background
//   JS delegate object that connects a MetaBackground to the GSettings
//   schema for the background. Loads images via BackgroundTextureCache
//   and provides textures to MetaBackground.
//
// MetaBackgroundActor
//   An actor that draws the background for a single monitor
//
// BackgroundCache
//   A cache of Settings schema => BackgroundSource. Also used to share
//   file monitors.
//
// The calling code creates a separate BackgroundManager for each monitor.
// Since they are created for the same GSettings schema, they will use the
// same BackgroundSource object, which provides a single Background and
// correspondingly a single MetaBackground object.
//
// BackgroundManager               BackgroundManager
//        |        \               /        |
//        |         BackgroundSource        |        looked up in BackgroundCache
//        |                |                |
//        |            Background           |
//        |                |                |
//   MetaBackgroundActor   |    MetaBackgroundActor
//         \               |               /
//          `------- MetaBackground ------'
//                         |
//                   CoglTexture                 looked up in BackgroundTextureCache

import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GDesktopEnums from 'gi://GDesktopEnums';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Glycin from 'gi://Gly';
import Meta from 'gi://Meta';
import * as Signals from '../misc/signals.js';

import * as BackgroundStore from './backgroundStore.js';
import * as Main from './main.js';
import * as KestrelUi from './kestrelUi.js';
import System from 'system';
import * as Params from '../misc/params.js';

Gio._promisify(Glycin.Loader.prototype, 'load_async');
Gio._promisify(Glycin.Image.prototype, 'next_frame_async');

const DEFAULT_BACKGROUND_COLOR = new Cogl.Color({red: 0, green: 0, blue: 0, alpha: 255});

const BACKGROUND_SCHEMA = 'org.gnome.desktop.background';
const BACKGROUND_STYLE_KEY = 'picture-options';
const PICTURE_URI_KEY = 'picture-uri';
const PICTURE_URI_DARK_KEY = 'picture-uri-dark';

const INTERFACE_SCHEMA = 'org.gnome.desktop.interface';
const COLOR_SCHEME_KEY = 'color-scheme';

export const FADE_ANIMATION_TIME = 1000;

let _backgroundCache = null;
let _backgroundTextureCache = null;

function _fileEqual0(file1, file2) {
    if (file1 === file2)
        return true;

    if (!file1 || !file2)
        return false;

    return file1.equal(file2);
}

class BackgroundCache extends Signals.EventEmitter {
    constructor() {
        super();

        this._fileMonitors = {};
        this._backgroundSources = {};
    }

    monitorFile(file) {
        const key = file.hash();
        if (this._fileMonitors[key])
            return;

        const monitor = file.monitor(Gio.FileMonitorFlags.NONE, null);
        monitor.connect('changed',
            (obj, theFile, otherFile, eventType) => {
                // Ignore CHANGED and CREATED events, since in both cases
                // we'll get a CHANGES_DONE_HINT event when done.
                if (eventType !== Gio.FileMonitorEvent.CHANGED &&
                    eventType !== Gio.FileMonitorEvent.CREATED)
                    this.emit('file-changed', file);
            });

        this._fileMonitors[key] = monitor;
    }

    getBackgroundSource(layoutManager, settingsSchema) {
        if (!(settingsSchema in this._backgroundSources)) {
            this._backgroundSources[settingsSchema] = new BackgroundSource(layoutManager, settingsSchema);
            this._backgroundSources[settingsSchema]._useCount = 1;
        } else {
            this._backgroundSources[settingsSchema]._useCount++;
        }

        return this._backgroundSources[settingsSchema];
    }

    releaseBackgroundSource(settingsSchema) {
        if (settingsSchema in this._backgroundSources) {
            const source = this._backgroundSources[settingsSchema];
            source._useCount--;
            if (source._useCount === 0) {
                delete this._backgroundSources[settingsSchema];
                source.destroy();
            }
        }
    }
}

/**
 * @returns {BackgroundCache}
 */
function getBackgroundCache() {
    if (!_backgroundCache)
        _backgroundCache = new BackgroundCache();
    return _backgroundCache;
}

const SAMPLE_GRID = 48;

const EIGHT_BIT_CHANNELS = new Map([
    [Glycin.MemoryFormat.B8G8R8A8_PREMULTIPLIED, [2, 1, 0, 4]],
    [Glycin.MemoryFormat.A8R8G8B8_PREMULTIPLIED, [1, 2, 3, 4]],
    [Glycin.MemoryFormat.R8G8B8A8_PREMULTIPLIED, [0, 1, 2, 4]],
    [Glycin.MemoryFormat.B8G8R8A8, [2, 1, 0, 4]],
    [Glycin.MemoryFormat.A8R8G8B8, [1, 2, 3, 4]],
    [Glycin.MemoryFormat.R8G8B8A8, [0, 1, 2, 4]],
    [Glycin.MemoryFormat.A8B8G8R8, [3, 2, 1, 4]],
    [Glycin.MemoryFormat.R8G8B8, [0, 1, 2, 3]],
    [Glycin.MemoryFormat.B8G8R8, [2, 1, 0, 3]],
]);

function sampleColors({width, height, stride, format}, data) {
    const channels = EIGHT_BIT_CHANNELS.get(format);
    if (!channels)
        return [];

    const [red, green, blue, bytesPerPixel] = channels;
    const samples = [];
    for (let row = 0; row < SAMPLE_GRID; row++) {
        const y = Math.floor((row + 0.5) * height / SAMPLE_GRID);
        for (let column = 0; column < SAMPLE_GRID; column++) {
            const offset = y * stride + Math.floor((column + 0.5) * width / SAMPLE_GRID) * bytesPerPixel;
            samples.push([data[offset + red], data[offset + green], data[offset + blue]]);
        }
    }
    return samples;
}

function displaySizes(monitors) {
    return monitors.map(({width, height, geometry_scale: scale}) =>
        ({width: Math.ceil(width * scale), height: Math.ceil(height * scale)}));
}

function displaySignature(monitors) {
    return displaySizes(monitors).map(({width, height}) => `${width}x${height}`).join(',');
}

async function storeKey(file, style, monitors, cancellable) {
    return `${await BackgroundStore.identify(file, cancellable)} ${style} ${displaySignature(monitors)}`;
}

function packSamples(samples) {
    return Uint8Array.from(samples.flat());
}

function unpackSamples(metadata) {
    const samples = [];
    for (let i = 0; i + 2 < metadata.length; i += 3)
        samples.push([metadata[i], metadata[i + 1], metadata[i + 2]]);
    return samples;
}

function fittedSize(width, height, style, monitors) {
    const {BackgroundStyle} = GDesktopEnums;
    const sizes = displaySizes(monitors);
    let scale;
    switch (style) {
    case BackgroundStyle.ZOOM:
    case BackgroundStyle.STRETCHED:
        scale = Math.max(...sizes.map(size => Math.max(size.width / width, size.height / height)));
        break;
    case BackgroundStyle.SCALED:
        scale = Math.max(...sizes.map(size => Math.min(size.width / width, size.height / height)));
        break;
    case BackgroundStyle.SPANNED: {
        const factor = Math.max(...monitors.map(monitor => monitor.geometry_scale));
        const spanWidth = Math.max(...monitors.map(monitor => monitor.x + monitor.width)) - Math.min(...monitors.map(monitor => monitor.x));
        const spanHeight = Math.max(...monitors.map(monitor => monitor.y + monitor.height)) - Math.min(...monitors.map(monitor => monitor.y));
        scale = Math.max(spanWidth * factor / width, spanHeight * factor / height);
        break;
    }
    default:
        return null;
    }

    if (scale >= 1)
        return null;
    return {width: Math.ceil(width * scale), height: Math.ceil(height * scale)};
}

function textureKey(file, style, monitors) {
    return `${file.get_uri()} ${style} ${displaySignature(monitors)}`;
}

function graphicsRecovery() {
    return global.stage.context.get_backend().get_graphics_recovery_context();
}

class BackgroundTextureCache {
    constructor() {
        this._textures = new Map();
        this._holders = new Map();
        this._monitors = [];
        this._settings = new Gio.Settings({schema_id: BACKGROUND_SCHEMA});
        graphicsRecovery().connect('graphics-restored', () => this._textures.clear());
    }

    async load(file, cancellable, style, monitors) {
        this._monitors = monitors;
        const key = textureKey(file, style, monitors);

        if (this._textures.has(key))
            return this._textures.get(key);

        const stored = await storeKey(file, style, monitors, cancellable);
        const entry = {
            key,
            ...await this._loadStored(stored, cancellable) ?? await this._decode(file, style, monitors, stored, cancellable),
        };
        this._textures.set(key, entry);
        return entry;
    }

    hold(holder, entries) {
        this._holders.set(holder, entries.map(entry => entry.key));
        this._dropUnused();
    }

    release(holder) {
        if (this._holders.delete(holder))
            this._dropUnused();
    }

    _dropUnused() {
        const style = this._settings.get_enum(BACKGROUND_STYLE_KEY);
        const wallpapers = [PICTURE_URI_KEY, PICTURE_URI_DARK_KEY].map(name =>
            textureKey(Gio.File.new_for_commandline_arg(this._settings.get_string(name)), style, this._monitors));
        const used = new Set([...wallpapers, ...[...this._holders.values()].flat()]);
        for (const key of this._textures.keys()) {
            if (!used.has(key))
                this._textures.delete(key);
        }
    }

    async _loadStored(key, cancellable) {
        const stored = await BackgroundStore.load(key, GLib.PRIORITY_LOW, cancellable);
        return stored && {texture: stored.texture, colorState: null, samples: unpackSamples(stored.metadata)};
    }

    async _decode(file, style, monitors, storedKey, cancellable) {
        const [frameData, colorState] = await this._loadGlycinFrame(file, cancellable);
        const data = frameData.bytes.get_data();
        const samples = sampleColors(frameData, data);
        const texture = this._fitTexture(this._createTexture(frameData, data),
            fittedSize(frameData.width, frameData.height, style, monitors));
        GLib.idle_add_once(GLib.PRIORITY_LOW, () => System.gc());

        if (!colorState && EIGHT_BIT_CHANNELS.has(frameData.format))
            BackgroundStore.store(storedKey, () => texture, packSamples(samples));
        return {texture, colorState, samples};
    }

    _fitTexture(texture, size) {
        if (!size)
            return texture;

        const ctx = global.stage.context.get_backend().get_cogl_context();
        const fitted = Cogl.Texture2D.new_with_size(ctx, size.width, size.height);
        fitted.set_components(texture.get_components());
        const framebuffer = Cogl.Offscreen.new_with_texture(fitted);
        framebuffer.allocate();
        framebuffer.orthographic(0, 0, size.width, size.height, -1, 1);
        framebuffer.clear4f(Cogl.BufferBit.COLOR, 0, 0, 0, 0);
        const pipeline = Cogl.Pipeline.new(ctx);
        pipeline.set_layer_texture(0, texture);
        pipeline.set_layer_filters(0, Cogl.PipelineFilter.LINEAR_MIPMAP_LINEAR, Cogl.PipelineFilter.LINEAR);
        pipeline.set_blend('RGBA = ADD (SRC_COLOR, 0)');
        framebuffer.draw_rectangle(pipeline, 0, 0, size.width, size.height);
        framebuffer.finish();
        return fitted;
    }

    async _loadGlycinFrame(file, cancellable) {
        const stream = await file.read_async(GLib.PRIORITY_DEFAULT, cancellable);
        const loader = Glycin.Loader.new_for_stream(stream);

        loader.set_accepted_memory_formats(
            Glycin.MemoryFormatSelection.B8G8R8A8_PREMULTIPLIED |
            Glycin.MemoryFormatSelection.A8R8G8B8_PREMULTIPLIED |
            Glycin.MemoryFormatSelection.R8G8B8A8_PREMULTIPLIED |
            Glycin.MemoryFormatSelection.B8G8R8A8 |
            Glycin.MemoryFormatSelection.A8R8G8B8 |
            Glycin.MemoryFormatSelection.R8G8B8A8 |
            Glycin.MemoryFormatSelection.A8B8G8R8 |
            Glycin.MemoryFormatSelection.R8G8B8 |
            Glycin.MemoryFormatSelection.B8G8R8 |
            Glycin.MemoryFormatSelection.R16G16B16A16_PREMULTIPLIED |
            Glycin.MemoryFormatSelection.R16G16B16A16 |
            Glycin.MemoryFormatSelection.R16G16B16A16_FLOAT |
            Glycin.MemoryFormatSelection.R32G32B32A32_FLOAT_PREMULTIPLIED |
            Glycin.MemoryFormatSelection.R32G32B32A32_FLOAT
        );

        const image = await loader.load_async(cancellable);
        const frame = await image.next_frame_async(cancellable);

        const width = frame.get_width();
        const height = frame.get_height();
        const stride = frame.get_stride();
        const bytes = frame.get_buf_bytes();
        const format = frame.get_memory_format();
        const cicp = frame.get_color_cicp();

        let colorState = null;
        if (cicp) {
            const clutterCicp = new Clutter.Cicp({
                primaries: cicp.color_primaries,
                transfer: cicp.transfer_characteristics,
                matrix_coefficients: cicp.matrix_coefficients,
                video_full_range_flag: cicp.video_full_range_flag,
            });

            try {
                const clutterContext = global.stage.context;
                colorState = Clutter.ColorStateParams.new_from_cicp(clutterContext, clutterCicp);
            } catch (e) {
                logError(e, 'Failed to create color state from CICP');
            }
        }

        return [{width, height, stride, bytes, format}, colorState];
    }

    _glyMemoryFormatToCogl(format) {
        switch (format) {
        case Glycin.MemoryFormat.B8G8R8A8_PREMULTIPLIED:
            return Cogl.PixelFormat.BGRA_8888_PRE;
        case Glycin.MemoryFormat.A8R8G8B8_PREMULTIPLIED:
            return Cogl.PixelFormat.ARGB_8888_PRE;
        case Glycin.MemoryFormat.R8G8B8A8_PREMULTIPLIED:
            return Cogl.PixelFormat.RGBA_8888_PRE;
        case Glycin.MemoryFormat.B8G8R8A8:
            return Cogl.PixelFormat.BGRA_8888;
        case Glycin.MemoryFormat.A8R8G8B8:
            return Cogl.PixelFormat.ARGB_8888;
        case Glycin.MemoryFormat.R8G8B8A8:
            return Cogl.PixelFormat.RGBA_8888;
        case Glycin.MemoryFormat.A8B8G8R8:
            return Cogl.PixelFormat.ABGR_8888;
        case Glycin.MemoryFormat.R8G8B8:
            return Cogl.PixelFormat.RGB_888;
        case Glycin.MemoryFormat.B8G8R8:
            return Cogl.PixelFormat.BGR_888;
        case Glycin.MemoryFormat.R16G16B16A16_PREMULTIPLIED:
            return Cogl.PixelFormat.RGBA_16161616_PRE;
        case Glycin.MemoryFormat.R16G16B16A16:
            return Cogl.PixelFormat.RGBA_16161616;
        case Glycin.MemoryFormat.R16G16B16A16_FLOAT:
            return Cogl.PixelFormat.RGBA_FP_16161616;
        case Glycin.MemoryFormat.R32G32B32A32_FLOAT_PREMULTIPLIED:
            return Cogl.PixelFormat.RGBA_FP_32323232_PRE;
        case Glycin.MemoryFormat.R32G32B32A32_FLOAT:
            return Cogl.PixelFormat.RGBA_FP_32323232;
        default:
            throw new Error(`Unsupported glycin memory format: ${format}`);
        }
    }

    _createTexture(frameData, data) {
        const {width, height, stride, format} = frameData;

        const coglFormat = this._glyMemoryFormatToCogl(format);
        const clutterContext = global.stage.context;
        const clutterBackend = clutterContext.get_backend();
        const ctx = clutterBackend.get_cogl_context();

        const hasAlpha = Glycin.memory_format_has_alpha(format);
        const components = hasAlpha
            ? Cogl.TextureComponents.RGBA
            : Cogl.TextureComponents.RGB;

        let texture = Cogl.Texture2D.new_with_size(ctx, width, height);
        texture.set_components(components);

        // Try to allocate
        // if it fails (texture too large), use sliced
        try {
            texture.allocate();
        } catch {
            texture = Cogl.Texture2DSliced.new_with_size(ctx, width, height, Cogl.TEXTURE_MAX_WASTE);
            texture.set_components(components);
        }

        if (!texture.set_data(coglFormat, stride, data, 0))
            throw new Error('Failed to set texture data');

        return texture;
    }

    purge(file) {
        const uri = file.get_uri();
        for (const key of this._textures.keys()) {
            if (key.startsWith(`${uri} `))
                this._textures.delete(key);
        }
    }
}

/**
 * @returns {BackgroundTextureCache}
 */
function getBackgroundTextureCache() {
    if (!_backgroundTextureCache)
        _backgroundTextureCache = new BackgroundTextureCache();
    return _backgroundTextureCache;
}

const Background = GObject.registerClass({
    Signals: {'loaded': {}, 'bg-changed': {}},
}, class Background extends Meta.Background {
    _init(params) {
        params = Params.parse(params, {
            layoutManager: null,
            settings: null,
            file: null,
            style: null,
        });

        super._init({meta_display: global.display});

        this._settings = params.settings;
        this._file = params.file;
        this._style = params.style;
        this._layoutManager = params.layoutManager;
        this._fileWatches = {};
        this._cancellable = new Gio.Cancellable();
        this.isLoaded = false;

        this._interfaceSettings = new Gio.Settings({schema_id: INTERFACE_SCHEMA});

        this._settings.connectObject('changed',
            this._emitChangedSignal.bind(this), this);

        this._interfaceSettings.connectObject(`changed::${COLOR_SCHEME_KEY}`,
            this._emitChangedSignal.bind(this), this);

        graphicsRecovery().connectObject('graphics-restored',
            this._emitChangedSignal.bind(this), this);

        this._load();
    }

    destroy() {
        this._cancellable.cancel();

        let i;
        const keys = Object.keys(this._fileWatches);
        for (i = 0; i < keys.length; i++)
            this._cache.disconnect(this._fileWatches[keys[i]]);

        this._fileWatches = null;

        this._settings.disconnectObject(this);
        this._interfaceSettings.disconnectObject(this);
        graphicsRecovery().disconnectObject(this);
        getBackgroundTextureCache().release(this);

        if (this._changedIdleId) {
            GLib.source_remove(this._changedIdleId);
            this._changedIdleId = 0;
        }
    }

    _emitChangedSignal() {
        if (this._changedIdleId)
            return;

        this._changedIdleId = GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
            this._changedIdleId = 0;
            this.emit('bg-changed');
        });
        GLib.Source.set_name_by_id(this._changedIdleId,
            '[gnome-shell] Background._emitChangedSignal');
    }

    updateResolution() {
        if (this._file && this._displaySignature !== displaySignature(this._layoutManager.monitors))
            this.emit('bg-changed');
    }

    storeKey(cancellable) {
        if (!this._file)
            return Promise.resolve(null);
        return storeKey(this._file, this._style, this._layoutManager.monitors, cancellable);
    }

    _setLoaded() {
        if (this.isLoaded)
            return;

        this.isLoaded = true;
        if (this._cancellable?.is_cancelled())
            return;

        const id = GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
            this.emit('loaded');
        });
        GLib.Source.set_name_by_id(id, '[gnome-shell] Background._setLoaded Idle');
    }

    _watchFile(file) {
        const key = file.hash();
        if (this._fileWatches[key])
            return;

        this._cache.monitorFile(file);
        const signalId = this._cache.connect('file-changed',
            (cache, changedFile) => {
                if (changedFile.equal(file)) {
                    const textureCache = getBackgroundTextureCache();
                    textureCache.purge(changedFile);
                    this._emitChangedSignal();
                }
            });
        this._fileWatches[key] = signalId;
    }

    async _loadImage(file) {
        this._watchFile(file);
        const {monitors} = this._layoutManager;
        this._displaySignature = displaySignature(monitors);

        const cache = getBackgroundTextureCache();

        try {
            const entry = await cache.load(file, this._cancellable, this._style, monitors);
            cache.hold(this, [entry]);
            const {texture, colorState, samples} = entry;
            this.set_texture(texture, this._style, colorState);
            if (this._settings.schema_id === BACKGROUND_SCHEMA)
                KestrelUi.wallpaperSampled(samples);
            this._setLoaded();
        } catch (err) {
            if (!err.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
                logError(err, 'Failed to load background');
            this._setLoaded();
        }
    }

    _load() {
        this._cache = getBackgroundCache();

        this.set_color(DEFAULT_BACKGROUND_COLOR);

        if (!this._file) {
            this._setLoaded();
            return;
        }

        this._loadImage(this._file).catch(logError);
    }
});

let _systemBackground;

export const SystemBackground = GObject.registerClass({
    Signals: {'loaded': {}},
}, class SystemBackground extends Meta.BackgroundActor {
    _init() {
        if (_systemBackground == null) {
            _systemBackground = new Meta.Background({meta_display: global.display});
            _systemBackground.set_color(DEFAULT_BACKGROUND_COLOR);
        }

        super._init({
            meta_display: global.display,
            monitor: 0,
        });
        this.content.background = _systemBackground;

        const id = GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
            this.emit('loaded');
        });
        GLib.Source.set_name_by_id(id, '[gnome-shell] SystemBackground.loaded');
    }
});

class BackgroundSource {
    constructor(layoutManager, settingsSchema) {
        // Allow override the background image setting for performance testing
        this._layoutManager = layoutManager;
        this._overrideImage = GLib.getenv('SHELL_BACKGROUND_IMAGE');
        this._settings = new Gio.Settings({schema_id: settingsSchema});
        this._background = null;

        const monitorManager = global.backend.get_monitor_manager();
        this._monitorsChangedId =
            monitorManager.connect('monitors-changed', () => this._background?.updateResolution());

        this._interfaceSettings = new Gio.Settings({schema_id: INTERFACE_SCHEMA});
    }

    getBackground() {
        if (this._background)
            return this._background;

        let file = null;
        let style;

        // We don't watch changes to settings here,
        // instead we rely on Background to watch those
        // and emit 'bg-changed' at the right time

        if (this._overrideImage != null) {
            file = Gio.File.new_for_path(this._overrideImage);
            style = GDesktopEnums.BackgroundStyle.ZOOM; // Hardcode
        } else {
            style = this._settings.get_enum(BACKGROUND_STYLE_KEY);
            if (style !== GDesktopEnums.BackgroundStyle.NONE) {
                const colorScheme = this._interfaceSettings.get_enum('color-scheme');
                const uri = this._settings.get_string(
                    colorScheme === GDesktopEnums.ColorScheme.PREFER_DARK
                        ? PICTURE_URI_DARK_KEY
                        : PICTURE_URI_KEY);

                file = Gio.File.new_for_commandline_arg(uri);
            }
        }

        const background = new Background({
            layoutManager: this._layoutManager,
            settings: this._settings,
            file,
            style,
        });
        background._changedId = background.connect('bg-changed', () => {
            background.disconnect(background._changedId);
            background.destroy();
            this._background = null;
        });
        this._background = background;
        return background;
    }

    destroy() {
        const monitorManager = global.backend.get_monitor_manager();
        monitorManager.disconnect(this._monitorsChangedId);

        if (this._background) {
            this._background.disconnect(this._background._changedId);
            this._background.destroy();
            this._background = null;
        }
    }
}

export class BackgroundManager extends Signals.EventEmitter {
    constructor(params) {
        super();
        params = Params.parse(params, {
            container: null,
            layoutManager: Main.layoutManager,
            monitorIndex: null,
            vignette: false,
            controlPosition: true,
            settingsSchema: BACKGROUND_SCHEMA,
            useContentSize: true,
        });

        const cache = getBackgroundCache();
        this._settingsSchema = params.settingsSchema;
        this._backgroundSource = cache.getBackgroundSource(params.layoutManager, params.settingsSchema);

        this._container = params.container;
        this._layoutManager = params.layoutManager;
        this._vignette = params.vignette;
        this._monitorIndex = params.monitorIndex;
        this._controlPosition = params.controlPosition;
        this._useContentSize = params.useContentSize;

        this.backgroundActor = this._createBackgroundActor();
        this._newBackgroundActor = null;
    }

    destroy() {
        const cache = getBackgroundCache();
        cache.releaseBackgroundSource(this._settingsSchema);
        this._backgroundSource = null;

        if (this._newBackgroundActor) {
            this._newBackgroundActor.destroy();
            this._newBackgroundActor = null;
        }

        if (this.backgroundActor) {
            this.backgroundActor.destroy();
            this.backgroundActor = null;
        }
    }

    _swapBackgroundActor() {
        const oldBackgroundActor = this.backgroundActor;
        this.backgroundActor = this._newBackgroundActor;
        this._newBackgroundActor = null;
        this.emit('changed');

        if (Main.layoutManager.screenTransition.visible) {
            oldBackgroundActor.destroy();
            return;
        }

        oldBackgroundActor.ease({
            opacity: 0,
            duration: FADE_ANIMATION_TIME,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => oldBackgroundActor.destroy(),
        });
    }

    _updateBackgroundActor() {
        if (this._newBackgroundActor) {
            /* Skip displaying existing background queued for load */
            this._newBackgroundActor.destroy();
            this._newBackgroundActor = null;
        }

        const newBackgroundActor = this._createBackgroundActor();

        const oldContent = this.backgroundActor.content;
        const newContent = newBackgroundActor.content;

        newContent.vignette_sharpness = oldContent.vignette_sharpness;
        newContent.brightness = oldContent.brightness;

        newBackgroundActor.visible = this.backgroundActor.visible;

        this._newBackgroundActor = newBackgroundActor;

        const {background} = newBackgroundActor.content;

        if (background.isLoaded) {
            this._swapBackgroundActor();
        } else {
            newBackgroundActor.loadedSignalId = background.connect('loaded',
                () => {
                    background.disconnect(newBackgroundActor.loadedSignalId);
                    newBackgroundActor.loadedSignalId = 0;

                    this._swapBackgroundActor();
                });
        }
    }

    _createBackgroundActor() {
        const background = this._backgroundSource.getBackground();
        const backgroundActor = new Meta.BackgroundActor({
            meta_display: global.display,
            monitor: this._monitorIndex,
            request_mode: this._useContentSize
                ? Clutter.RequestMode.CONTENT_SIZE
                : Clutter.RequestMode.HEIGHT_FOR_WIDTH,
            x_expand: !this._useContentSize,
            y_expand: !this._useContentSize,
        });
        backgroundActor.content.set({
            background,
            vignette: this._vignette,
            vignette_sharpness: 0.5,
            brightness: 0.5,
        });

        this._container.add_child(backgroundActor);
        this._container.set_child_below_sibling(backgroundActor, null);

        if (this._controlPosition) {
            const monitor = this._layoutManager.monitors[this._monitorIndex];
            backgroundActor.set_position(monitor.x, monitor.y);
        }

        let changeSignalId = background.connect('bg-changed', () => {
            background.disconnect(changeSignalId);
            changeSignalId = null;
            this._updateBackgroundActor();
        });

        let loadedSignalId;
        if (background.isLoaded) {
            GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => {
                this.emit('loaded');
            });
        } else {
            loadedSignalId = background.connect('loaded', () => {
                background.disconnect(loadedSignalId);
                loadedSignalId = null;
                this.emit('loaded');
            });
        }

        backgroundActor.connect('destroy', () => {
            if (changeSignalId)
                background.disconnect(changeSignalId);

            if (loadedSignalId)
                background.disconnect(loadedSignalId);

            if (backgroundActor.loadedSignalId)
                background.disconnect(backgroundActor.loadedSignalId);
        });

        return backgroundActor;
    }
}
