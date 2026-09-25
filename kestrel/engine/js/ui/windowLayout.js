import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import * as Main from './main.js';
import * as Params from '../misc/params.js';
import * as Util from '../misc/util.js';

const WINDOW_PREVIEW_MAXIMUM_SCALE = 0.95;

// When calculating a layout, we calculate the scale of windows and the percent
// of the available area the new layout uses. If the values for the new layout,
// when weighted with the values as below, are worse than the previous layout's,
// we stop looking for a new layout and use the previous layout.
// Otherwise, we keep looking for a new layout.
const LAYOUT_SCALE_WEIGHT = 1;
const LAYOUT_SPACE_WEIGHT = 0.1;

// Window Thumbnail Layout Algorithm
// =================================
//
// General overview
// ----------------
//
// The window thumbnail layout algorithm calculates some optimal layout
// by computing layouts with some number of rows, calculating how good
// each layout is, and stopping iterating when it finds one that is worse
// than the previous layout. A layout consists of which windows are in
// which rows, row sizes and other general state tracking that would make
// calculating window positions from this information fairly easy.
//
// After a layout is computed that's considered the best layout, we
// compute the layout scale to fit it in the area, and then compute
// slots (sizes and positions) for each thumbnail.
//
// Layout generation
// -----------------
//
// Layout generation is naive and simple: we simply add windows to a row
// until we've added too many windows to a row, and then make a new row,
// until we have our required N rows. The potential issue with this strategy
// is that we may have too many windows at the bottom in some pathological
// cases, which tends to make the thumbnails have the shape of a pile of
// sand with a peak, with one window at the top.
//
// Scaling factors
// ---------------
//
// Thumbnail position is mostly straightforward -- the main issue is
// computing an optimal scale for each window that fits the constraints,
// and doesn't make the thumbnail too small to see. There are two factors
// involved in thumbnail scale to make sure that these two goals are met:
// the window scale (calculated by _computeWindowScale) and the layout
// scale (calculated by computeSizeAndScale).
//
// The calculation logic becomes slightly more complicated because row
// and column spacing are not scaled, they're constant, so we can't
// simply generate a bunch of window positions and then scale it. In
// practice, it's not too bad -- we can simply try to fit the layout
// in the input area minus whatever spacing we have, and then add
// it back afterwards.
//
// The window scale is constant for the window's size regardless of the
// input area or the layout scale or rows or anything else, and right
// now just enlarges the window if it's too small. The fact that this
// factor is stable makes it easy to calculate, so there's no sense
// in not applying it in most calculations.
//
// The layout scale depends on the input area, the rows, etc, but is the
// same for the entire layout, rather than being per-window. After
// generating the rows of windows, we basically do some basic math to
// fit the full, unscaled layout to the input area, as described above.
//
// With these two factors combined, the final scale of each thumbnail is
// simply windowScale * layoutScale... almost.
//
// There's one additional constraint: the thumbnail scale must never be
// larger than WINDOW_PREVIEW_MAXIMUM_SCALE, which means that the inequality:
//
//   windowScale * layoutScale <= WINDOW_PREVIEW_MAXIMUM_SCALE
//
// must always be true. This is for each individual window -- while we
// could adjust layoutScale to make the largest thumbnail smaller than
// WINDOW_PREVIEW_MAXIMUM_SCALE, it would shrink windows which are already
// under the inequality. To solve this, we simply cheat: we simply keep
// each window's "cell" area to be the same, but we shrink the thumbnail
// and center it horizontally, and align it to the bottom vertically.

class LayoutStrategy {
    constructor(params) {
        params = Params.parse(params, {
            monitor: null,
            rowSpacing: 0,
            columnSpacing: 0,
        });

        if (!params.monitor)
            throw new Error(`No monitor param passed to ${this.constructor.name}`);

        this._monitor = params.monitor;
        this._rowSpacing = params.rowSpacing;
        this._columnSpacing = params.columnSpacing;
    }

    // Compute a strategy-specific overall layout given a list of WindowPreviews
    // @windows and the strategy-specific @layoutParams.
    //
    // Returns a strategy-specific layout object that is opaque to the user.
    computeLayout(_windows, _layoutParams) {
        throw new GObject.NotImplementedError(`computeLayout in ${this.constructor.name}`);
    }

    // Given @layout and @area, compute the overall scale of the layout and
    // space occupied by the layout.
    //
    // This method returns an array where the first element is the scale and
    // the second element is the space.
    //
    // This method must be called before calling computeWindowSlots(), as it
    // sets the fixed overall scale of the layout.
    computeScaleAndSpace(_layout, _area) {
        throw new GObject.NotImplementedError(`computeScaleAndSpace in ${this.constructor.name}`);
    }

    // Returns an array with final position and size information for each
    // window of the layout, given a bounding area that it will be inside of.
    computeWindowSlots(_layout, _area) {
        throw new GObject.NotImplementedError(`computeWindowSlots in ${this.constructor.name}`);
    }
}

class UnalignedLayoutStrategy extends LayoutStrategy {
    _newRow() {
        // Row properties:
        //
        // * x, y are the position of row, relative to area
        //
        // * width, height are the scaled versions of fullWidth, fullHeight
        //
        // * width also has the spacing in between windows. It's not in
        //   fullWidth, as the spacing is constant, whereas fullWidth is
        //   meant to be scaled
        //
        // * neither height/fullHeight have any sort of spacing or padding
        return {
            x: 0, y: 0,
            width: 0, height: 0,
            fullWidth: 0, fullHeight: 0,
            windows: [],
        };
    }

    // Computes and returns an individual scaling factor for @window,
    // to be applied in addition to the overall layout scale.
    _computeWindowScale(window) {
        // Since we align windows next to each other, the height of the
        // thumbnails is much more important to preserve than the width of
        // them, so two windows with equal height, but maybe differering
        // widths line up.
        const ratio = window.boundingBox.height / this._monitor.height;

        // The purpose of this manipulation here is to prevent windows
        // from getting too small. For something like a calculator window,
        // we need to bump up the size just a bit to make sure it looks
        // good. We'll use a multiplier of 1.5 for this.

        // Map from [0, 1] to [1.5, 1]
        return Util.lerp(1.5, 1, ratio);
    }

    _computeRowSizes(layout) {
        const {rows, scale} = layout;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            row.width = row.fullWidth * scale + (row.windows.length - 1) * this._columnSpacing;
            row.height = row.fullHeight * scale;
        }
    }

    _keepSameRow(row, window, width, idealRowWidth) {
        if (row.fullWidth + width <= idealRowWidth)
            return true;

        const oldRatio = row.fullWidth / idealRowWidth;
        const newRatio = (row.fullWidth + width) / idealRowWidth;

        if (Math.abs(1 - newRatio) < Math.abs(1 - oldRatio))
            return true;

        return false;
    }

    _sortRow(row) {
        // Sort windows horizontally to minimize travel distance.
        // This affects in what order the windows end up in a row.
        row.windows.sort((a, b) => a.windowCenter.x - b.windowCenter.x);
    }

    computeLayout(windows, layoutParams) {
        layoutParams = Params.parse(layoutParams, {
            numRows: 0,
        });

        if (layoutParams.numRows === 0)
            throw new Error(`${this.constructor.name}: No numRows given in layout params`);

        const numRows = layoutParams.numRows;

        const rows = [];
        let totalWidth = 0;
        for (let i = 0; i < windows.length; i++) {
            const window = windows[i];
            const s = this._computeWindowScale(window);
            totalWidth += window.boundingBox.width * s;
        }

        const idealRowWidth = totalWidth / numRows;

        // Sort windows vertically to minimize travel distance.
        // This affects what rows the windows get placed in.
        const sortedWindows = windows.slice();
        sortedWindows.sort((a, b) => a.windowCenter.y - b.windowCenter.y);

        let windowIdx = 0;
        for (let i = 0; i < numRows; i++) {
            const row = this._newRow();
            rows.push(row);

            for (; windowIdx < sortedWindows.length; windowIdx++) {
                const window = sortedWindows[windowIdx];
                const s = this._computeWindowScale(window);
                const width = window.boundingBox.width * s;
                const height = window.boundingBox.height * s;
                row.fullHeight = Math.max(row.fullHeight, height);

                // either new width is < idealWidth or new width is nearer from idealWidth then oldWidth
                if (this._keepSameRow(row, window, width, idealRowWidth) || (i === numRows - 1)) {
                    row.windows.push(window);
                    row.fullWidth += width;
                } else {
                    break;
                }
            }
        }

        let gridHeight = 0;
        let maxRow;
        for (let i = 0; i < numRows; i++) {
            const row = rows[i];
            this._sortRow(row);

            if (!maxRow || row.fullWidth > maxRow.fullWidth)
                maxRow = row;
            gridHeight += row.fullHeight;
        }

        return {
            numRows,
            rows,
            maxColumns: maxRow.windows.length,
            gridWidth: maxRow.fullWidth,
            gridHeight,
        };
    }

    computeScaleAndSpace(layout, area) {
        const hspacing = (layout.maxColumns - 1) * this._columnSpacing;
        const vspacing = (layout.numRows - 1) * this._rowSpacing;

        const spacedWidth = area.width - hspacing;
        const spacedHeight = area.height - vspacing;

        const horizontalScale = spacedWidth / layout.gridWidth;
        const verticalScale = spacedHeight / layout.gridHeight;

        // Thumbnails should be less than 70% of the original size
        const scale = Math.min(
            horizontalScale, verticalScale, WINDOW_PREVIEW_MAXIMUM_SCALE);

        const scaledLayoutWidth = layout.gridWidth * scale + hspacing;
        const scaledLayoutHeight = layout.gridHeight * scale + vspacing;
        const space = (scaledLayoutWidth * scaledLayoutHeight) / (area.width * area.height);

        layout.scale = scale;

        return [scale, space];
    }

    computeWindowSlots(layout, area) {
        this._computeRowSizes(layout);

        const {rows, scale} = layout;

        const slots = [];

        // Do this in three parts.
        let heightWithoutSpacing = 0;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            heightWithoutSpacing += row.height;
        }

        const verticalSpacing = (rows.length - 1) * this._rowSpacing;
        const additionalVerticalScale = Math.min(1, (area.height - verticalSpacing) / heightWithoutSpacing);

        // keep track how much smaller the grid becomes due to scaling
        // so it can be centered again
        let compensation = 0;
        let y = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // If this window layout row doesn't fit in the actual
            // geometry, then apply an additional scale to it.
            const horizontalSpacing = (row.windows.length - 1) * this._columnSpacing;
            const widthWithoutSpacing = row.width - horizontalSpacing;
            const additionalHorizontalScale = Math.min(1, (area.width - horizontalSpacing) / widthWithoutSpacing);

            if (additionalHorizontalScale < additionalVerticalScale) {
                row.additionalScale = additionalHorizontalScale;
                // Only consider the scaling in addition to the vertical scaling for centering.
                compensation += (additionalVerticalScale - additionalHorizontalScale) * row.height;
            } else {
                row.additionalScale = additionalVerticalScale;
                // No compensation when scaling vertically since centering based on a too large
                // height would undo what vertical scaling is trying to achieve.
            }

            row.x = area.x + (Math.max(area.width - (widthWithoutSpacing * row.additionalScale + horizontalSpacing), 0) / 2);
            row.y = area.y + (Math.max(area.height - (heightWithoutSpacing + verticalSpacing), 0) / 2) + y;
            y += row.height * row.additionalScale + this._rowSpacing;
        }

        compensation /= 2;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowY = row.y + compensation;
            const rowHeight = row.height * row.additionalScale;

            let x = row.x;
            for (let j = 0; j < row.windows.length; j++) {
                const window = row.windows[j];

                let s = scale * this._computeWindowScale(window) * row.additionalScale;
                const cellWidth = window.boundingBox.width * s;
                const cellHeight = window.boundingBox.height * s;

                s = Math.min(s, WINDOW_PREVIEW_MAXIMUM_SCALE);
                const cloneWidth = window.boundingBox.width * s;
                const cloneHeight = window.boundingBox.height * s;

                let cloneX = x + (cellWidth - cloneWidth) / 2;
                let cloneY;

                // If there's only one row, align windows vertically centered inside the row
                if (rows.length === 1)
                    cloneY = rowY + (rowHeight - cloneHeight) / 2;
                // If there are multiple rows, align windows to the bottom edge of the row
                else
                    cloneY = rowY + rowHeight - cellHeight;

                // Align with the pixel grid to prevent blurry windows at scale = 1
                cloneX = Math.floor(cloneX);
                cloneY = Math.floor(cloneY);

                slots.push([cloneX, cloneY, cloneWidth, cloneHeight, window]);
                x += cellWidth + this._columnSpacing;
            }
        }
        return slots;
    }
}


function isBetterScaleAndSpace(oldScale, oldSpace, scale, space) {
    const spacePower = (space - oldSpace) * LAYOUT_SPACE_WEIGHT;
    const scalePower = (scale - oldScale) * LAYOUT_SCALE_WEIGHT;

    if (scale > oldScale && space > oldSpace)
        return true;
    if (scale > oldScale && space <= oldSpace)
        return scalePower > spacePower;
    if (scale <= oldScale && space > oldSpace)
        return spacePower > scalePower;
    return false;
}

export const WindowGridLayout = GObject.registerClass(
class WindowGridLayout extends Clutter.LayoutManager {
    constructor(monitorIndex, spacing = 20) {
        super();

        this._monitorIndex = monitorIndex;
        this._spacing = spacing;
        this._container = null;
        this._sortedWindows = [];
        this._windowSlots = [];
        this._layout = null;
        this._layoutStrategy = null;
        this._lastBox = null;
        this._workarea = null;
        this._workareasChangedId = 0;
    }

    get windows() {
        return this._sortedWindows;
    }

    addWindow(window) {
        if (this._sortedWindows.includes(window))
            return;

        this._sortedWindows.push(window);
        this._container.add_child(window);
        this._layout = null;
        this.layout_changed();
    }

    reset() {
        for (const window of this._sortedWindows)
            window.destroy();

        this._sortedWindows = [];
        this._windowSlots = [];
        this._layout = null;
    }

    _createBestLayout(area) {
        this._layoutStrategy = new UnalignedLayoutStrategy({
            monitor: Main.layoutManager.monitors[this._monitorIndex],
            rowSpacing: this._spacing,
            columnSpacing: this._spacing,
        });

        let lastLayout = null;
        let lastNumColumns = -1;
        let lastScale = 0;
        let lastSpace = 0;

        for (let numRows = 1; ; numRows++) {
            const numColumns = Math.ceil(this._sortedWindows.length / numRows);
            if (numColumns === lastNumColumns)
                break;

            const layout = this._layoutStrategy.computeLayout(this._sortedWindows, {numRows});
            const [scale, space] = this._layoutStrategy.computeScaleAndSpace(layout, area);
            if (lastLayout && !isBetterScaleAndSpace(lastScale, lastSpace, scale, space))
                break;

            lastLayout = layout;
            lastNumColumns = numColumns;
            lastScale = scale;
            lastSpace = space;
        }

        return lastLayout;
    }

    _syncWorkareaTracking() {
        if (this._container) {
            if (this._workareasChangedId)
                return;
            this._workarea = Main.layoutManager.getWorkAreaForMonitor(this._monitorIndex);
            this._workareasChangedId = global.display.connect('workareas-changed', () => {
                this._workarea = Main.layoutManager.getWorkAreaForMonitor(this._monitorIndex);
                this.layout_changed();
            });
        } else if (this._workareasChangedId) {
            global.display.disconnect(this._workareasChangedId);
            this._workareasChangedId = 0;
        }
    }

    vfunc_set_container(container) {
        this._container = container;
        this._syncWorkareaTracking();
    }

    vfunc_get_preferred_width(_container, forHeight) {
        if (forHeight === -1)
            return [0, this._workarea.width];
        return [0, forHeight * this._workarea.width / this._workarea.height];
    }

    vfunc_get_preferred_height(_container, forWidth) {
        if (forWidth === -1)
            return [0, this._workarea.height];
        return [0, forWidth * this._workarea.height / this._workarea.width];
    }

    vfunc_allocate(container, box) {
        const containerBox = container.allocation;
        const containerAllocationChanged =
            this._lastBox === null || !this._lastBox.equal(containerBox);
        this._lastBox = containerBox.copy();

        let layoutChanged = false;
        if (this._layout === null) {
            this._layout = this._createBestLayout(this._workarea);
            layoutChanged = true;
        }

        if (layoutChanged || containerAllocationChanged) {
            this._windowSlots = this._layoutStrategy.computeWindowSlots(this._layout, {
                x: parseInt(box.x1),
                y: parseInt(box.y1),
                width: parseInt(box.get_width()),
                height: parseInt(box.get_height()),
            });
        }

        const childBox = new Clutter.ActorBox();
        for (const [x, y, width, height, child] of this._windowSlots) {
            childBox.set_origin(x, y);
            childBox.set_size(width, height);
            child.allocate(childBox);
        }
    }
});
