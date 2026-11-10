import GLib from 'gi://GLib';

import type {Publish} from '../bus.js';

const GREETER = `<node><interface name="com.lantharos.Greeter1">
  <property name="SharedWallpaper" type="s" access="read"/>
  <property name="ShowUsers" type="b" access="read"/>
  <property name="HiddenUsers" type="as" access="read"/>
  <property name="DefaultSession" type="s" access="read"/>
  <property name="AutomaticLogin" type="s" access="read"/>
  <property name="DeveloperTools" type="b" access="read"/>
  <property name="Sessions" type="a(ss)" access="read"/>
  <method name="SetAppearance">
    <arg name="wallpaper" type="h" direction="in"/><arg name="focus" type="(dd)" direction="in"/>
    <arg name="dark_wallpaper" type="h" direction="in"/><arg name="dark_focus" type="(dd)" direction="in"/>
  </method>
  <method name="SetDisplays"><arg name="arrangement" type="h" direction="in"/></method>
  <method name="SetNumLock"><arg name="on" type="b" direction="in"/></method>
  <method name="SetSignInMethod"><arg name="method" type="s" direction="in"/></method>
  <method name="SetStyle">
    <arg name="style" type="s" direction="in"/><arg name="schedule" type="s" direction="in"/><arg name="window" type="(dd)" direction="in"/>
    <arg name="coordinates" type="(dd)" direction="in"/><arg name="rounded_corners" type="b" direction="in"/>
  </method>
  <method name="SetDeveloperTools"><arg name="on" type="b" direction="in"/></method>
</interface></node>`;

export const LOGIN_SCREEN_NAME = 'com.lantharos.Greeter1';

export function publishLoginScreen(publish: Publish, calls: string[]) {
  let developerTools = true;
  const greeter = publish(GREETER, {
    SharedWallpaper: '',
    ShowUsers: true,
    HiddenUsers: [],
    DefaultSession: 'kestrel',
    AutomaticLogin: '',
    get DeveloperTools() {
      return developerTools;
    },
    Sessions: [['kestrel', 'Luft']],
    SetAppearance() {},
    SetDisplays() {},
    SetNumLock() {},
    SetSignInMethod() {},
    SetStyle() {},
    SetDeveloperTools(on: boolean) {
      calls.push(`SetDeveloperTools ${on}`);
      developerTools = on;
      greeter.emit_property_changed('DeveloperTools', new GLib.Variant('b', on));
    },
  }, '/com/lantharos/Greeter1');
}
