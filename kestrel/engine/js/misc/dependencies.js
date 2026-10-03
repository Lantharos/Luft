import gi from 'gi';

/**
 * Required dependencies
 */

import 'gi://AccountsService?version=1.0';
import 'gi://Atk?version=1.0';
import 'gi://Atspi?version=2.0';
import 'gi://Gdk?version=4.0';
import 'gi://Gio?version=2.0';
import 'gi://GioUnix?version=2.0';
import 'gi://GDesktopEnums?version=3.0';
import 'gi://GdkPixbuf?version=2.0';
import 'gi://Graphene?version=1.0';
import 'gi://IBus?version=1.0';
import 'gi://NM?version=1.0';
import 'gi://Pango?version=1.0';
import 'gi://Polkit?version=1.0';
import 'gi://PolkitAgent?version=1.0';
import 'gi://UPowerGlib?version=1.0';

import * as Config from './config.js';

// Meta-related dependencies use a shared version
// from the compile-time config.
gi.require('Meta', Config.LIBMUTTER_API_VERSION);
gi.require('Clutter', Config.LIBMUTTER_API_VERSION);
gi.require('Cogl', Config.LIBMUTTER_API_VERSION);
gi.require('Shell', Config.LIBMUTTER_API_VERSION);
gi.require('St', Config.LIBMUTTER_API_VERSION);
