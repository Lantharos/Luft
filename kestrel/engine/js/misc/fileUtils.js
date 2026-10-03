import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import * as Config from './config.js';

export {loadInterfaceXML} from './dbusUtils.js';

/**
 * @typedef {object} ChildInfo
 * @property {Gio.File} file the file object for the child
 * @property {Gio.FileInfo} info the file descriptor for the child
 */

/**
 * @param {string} subdir the subdirectory to search within the data directories
 * @param {boolean} includeUserDir whether the user's data directory should also be searched in addition
 *                                 to the system data directories
 * @returns {Generator<ChildInfo, void, void>} a generator which yields child infos for subdirectories named
 *                                              `subdir` within data directories
 */
export function* collectFromDatadirs(subdir, includeUserDir) {
    const dataDirs = GLib.get_system_data_dirs();
    if (includeUserDir)
        dataDirs.unshift(GLib.get_user_data_dir());

    for (let i = 0; i < dataDirs.length; i++) {
        const path = GLib.build_filenamev([dataDirs[i], Config.PACKAGE_NAME, subdir]);
        const dir = Gio.File.new_for_path(path);

        let fileEnum;
        try {
            fileEnum = dir.enumerate_children('standard::name,standard::type',
                Gio.FileQueryInfoFlags.NONE, null);
        } catch {
            fileEnum = null;
        }
        if (fileEnum != null) {
            let info;
            while ((info = fileEnum.next_file(null)))
                yield {file: fileEnum.get_child(info), info};
        }
    }
}
