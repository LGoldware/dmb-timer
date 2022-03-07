const { St, GLib, Gio } = imports.gi;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const Lang = imports.lang;
const Mainloop = imports.mainloop;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
imports.searchPath.unshift(Me.path);

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

// ==================================================

const formats = [
    {
        title: "Classic",
        getResult: function () {
            if(endDate < new Date() || startDate > endDate)
                return "0 years 0 months 0 days 00:00:00";

            let timeDiff = Math.floor(endDate.getTime() - new Date().getTime());
            let seconds = Math.floor(timeDiff / 1000);

            let _seconds = seconds % 60;

            let minutes = Math.floor(seconds / 60);
            let _minutes = minutes % 60;

            let hours = Math.floor(minutes / 60);
            let _hours = hours % 24;

            let days = Math.floor(hours / 24);

            let monthsFromDays = Math.floor((days * 4800) / 146097);
            let months = monthsFromDays;
            days -= Math.ceil((months * 146097) / 4800);

            let years = Math.floor(months / 12);
            months %= 12;
            
            let _days = days;
            let _months = months;
            let _years = years;

            return `${_years} years ${_months} months ${_days} days ${("0" + _hours).slice(-2)}:${("0" + _minutes).slice(-2)}:${("0" + _seconds).slice(-2)}`;
        },
        getProcents: function() {
            if(endDate < new Date() || startDate > endDate)
                return "100%";

            let result = Math.floor(((Math.floor(new Date().getTime() - startDate.getTime())) * 100) / (endDate.getTime() - startDate.getTime()));
            return `${result}%`;
        },
        interval: 3600,
        suffix: "",
    },
    {
        title: "Weeks",
        getResult: function () {
            if(endDate < new Date() || startDate > endDate)
                return "0";

            let timeDiff = Math.floor(endDate.getTime() - new Date().getTime());
            let diff = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 7));
            return diff;
        },
        getProcents: function() {
          return this.getResult();
        },
        interval: 3600,
        suffix: "weeks",
    },
    {
        title: "Days",
        getResult: function () {
            if(endDate < new Date() || startDate > endDate)
                return "0";

            let timeDiff = Math.floor(endDate.getTime() - new Date().getTime());
            let diff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            return diff;
        },
        getProcents: function() {
            return this.getResult();
          },
        interval: 3600,
        suffix: "days",
    },
    {
        title: "Hours",
        getResult: function () {
            if(endDate < new Date() || startDate > endDate)
                return "0";

            let timeDiff = Math.floor(endDate.getTime() - new Date().getTime());
            let diff = Math.floor(timeDiff / (1000 * 60 * 60));
            return diff;
        },
        getProcents: function() {
            return this.getResult();
          },
        interval: 60,
        suffix: "hours",
    },
    {
        title: "Minutes",
        getResult: function () {
            if(endDate < new Date() || startDate > endDate)
                return "0";

            let timeDiff = Math.floor(endDate.getTime() - new Date().getTime());
            let diff = Math.floor(timeDiff / (1000 * 60));
            return diff;
        },
        getProcents: function() {
            return this.getResult();
          },
        interval: 60,
        suffix: "minutes",
    },
    {
        title: "Seconds",
        getResult: function () {
            if(endDate < new Date() || startDate > endDate)
                return "0";

            let timeDiff = Math.floor(endDate.getTime() - new Date().getTime());
            let diff = Math.floor(timeDiff / 1000);
            return diff;
        },
        getProcents: function() {
            return this.getResult();
          },
        interval: 1,
        suffix: "seconds",
    },
  ];

// ==================================================

let formatted_label;
let icon_label;
let settings_item; 

let ui_timer;
let icon_timer;

let settings;

let startDate;
let endDate;

let selectedIdStyle;
let arrayOfButtons;
let arrayOfButtonsSignals;
let settingsSignal;
let popupStateSignal;
let settingsUpdateStartDateSignal;
let settingsUpdateEndDateSignal;

// ==================================================
function refreshUI() {
    formatted_label.set_text(`${formats[selectedIdStyle].getResult().toString()} ${formats[selectedIdStyle].suffix}`);
    icon_label.set_text(formats[selectedIdStyle].getProcents().toString());
}
function _connectUiTimer(){
    if (ui_timer) {
        Mainloop.source_remove(ui_timer);
        ui_timer = null;
    }

    ui_timer = Mainloop.timeout_add_seconds(1, function () { 
        formatted_label.set_text(`${formats[selectedIdStyle].getResult().toString()} ${formats[selectedIdStyle].suffix}`);
        return true;
    });
}
// ==================================================

const DmbTimer = new Lang.Class({
	Name: 'DmbTimer',
	Extends: PanelMenu.Button,

	_init: function() {
		this.parent(1, null, false);

        this._loadSettings();
        
		this._buildIcon();		
		this._buildUI();
        this._connectRefreshIconLabelTimer(formats[selectedIdStyle].interval);

        refreshUI();
	},
    _buildIcon: function(){
        let box = new St.BoxLayout();
		let icon =  new St.Icon({ icon_name: 'non-starred-symbolic', style_class: 'system-status-icon'});
	
		icon_label = new St.Label({ text: '',
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER });

		box.add(icon);
		box.add(icon_label);

		this.actor.add_child(box);
    },
    _connectRefreshIconLabelTimer: function(interval){
        if (icon_timer) {
            Mainloop.source_remove(icon_timer);
            icon_timer = null;
        }

        icon_timer = Mainloop.timeout_add_seconds(interval, function () { 
            icon_label.set_text(formats[selectedIdStyle].getProcents().toString());
            return true;
        });
    },
    _buildUI: function(){
        // TOP SECTION (formatted text)
        formatted_label = new St.Label({
            text:'',
            style_class : 'formatted-text',
        });

        // MIDDLE SECTION (buttons)
        let styleMenuExpander = new PopupMenu.PopupSubMenuMenuItem('Format to view');

        arrayOfButtons = new Array();
        arrayOfButtonsSignals = new Array();
        for (var item of formats) {
            let subItem = new PopupMenu.PopupMenuItem(item.title);
            arrayOfButtons.push(subItem);

            let signal = subItem.connect("activate", (_item, _event) => {
                selectedIdStyle = arrayOfButtons.indexOf(_item);
                settings.set_int("current-style-id", selectedIdStyle);
                refreshUI();

                this._connectRefreshIconLabelTimer(formats[selectedIdStyle].interval);
            });
            arrayOfButtonsSignals.push(signal);

            styleMenuExpander.menu.addMenuItem(subItem);
        }
            
        // BOTTON SECTION
        settings_item = new PopupMenu.PopupMenuItem('Settings');
        settingsSignal = settings_item.connect('activate', Lang.bind(this, function(){                     
            let dbus = Gio.DBus.session;
            dbus.call(
                "org.gnome.Shell", 
                "/org/gnome/Shell",
                 "org.gnome.Shell.Extensions",
                 "LaunchExtensionPrefs",
                new GLib.Variant("(s)", [ "dmb-timer@lgoldware" ]),
                null,
                Gio.DBusCallFlags.NONE,
                -1,
                null, 
                null)
            })
        );
		
		// FILL MENU
		this.menu.box.add(formatted_label);
        this.menu.addMenuItem(styleMenuExpander);
        this.menu.addMenuItem(settings_item);

        // EVENTS MENU
        popupStateSignal = this.menu.connect("open-state-changed", function(menu, isOpen) {
            if (isOpen) {
                refreshUI();
                _connectUiTimer();
            }
            else
            {
                if (ui_timer) {
                    Mainloop.source_remove(ui_timer);
                    ui_timer = null;
                }
            }
          });
    },
    _loadSettings: function() {
        settings = imports.configuration.getSettings(
            Me.dir.get_child("schemas").get_path(),
        );
        
        selectedIdStyle = settings.get_int("current-style-id");

        // begin date
        let startDate_value = settings.get_string("start-date");
        if(startDate_value.length == 0){
            let date = new Date();
            startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            settings.set_string("start-date", startDate.toISOString());
        }
        else
            startDate = new Date(startDate_value);

        // end date
        let endDate_value = settings.get_string("end-date");
        if(endDate_value.length == 0){
            endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate() - 1)
            settings.set_string("end-date", endDate.toISOString());
        }
        else
            endDate = new Date(endDate_value);
        
        // reaction of changes
        settingsUpdateStartDateSignal = settings.connect("changed::start-date", function(k, b) {
            let value = settings.get_string("start-date");
            startDate = new Date(value);
            
            refreshUI();
        });
        settingsUpdateEndDateSignal = settings.connect("changed::end-date", function(k, b) {
            let value = settings.get_string("end-date");
            endDate = new Date(value);
            
            refreshUI();
        });
    },
	destroy: function() {
		this.parent();

        if(ui_timer) {
            Mainloop.source_remove(ui_timer);
            ui_timer = null;
        }
        if(icon_timer) {
            Mainloop.source_remove(icon_timer);
            icon_timer = null;
        }

        if(settingsSignal){
            settings_item.disconnect(settingsSignal);
            settingsSignal = null
        }
        
        if(popupStateSignal){
            this.menu.disconnect(popupStateSignal);
            popupStateSignal= null;
        }

        if(settingsUpdateStartDateSignal){
            settings.disconnect(settingsUpdateStartDateSignal);
            settingsUpdateStartDateSignal = null;
        }

        if(settingsUpdateEndDateSignal){
            settings.disconnect(settingsUpdateEndDateSignal);
            settingsUpdateEndDateSignal = null;
        }

        for (var i = 0; i < arrayOfButtons.length; i++) {
            arrayOfButtons[i].disconnect(arrayOfButtonsSignals[i]);
            arrayOfButtonsSignals[i] = null;
        }

        settings = null;
	}
});

// ==================================================

let _dmbTimer;

function init() {}
function enable() {
	_dmbTimer = new DmbTimer;
	Main.panel.addToStatusArea('DmbTimer', _dmbTimer, 0, 'right');
}
function disable() {
    if (_dmbTimer) {
        _dmbTimer.destroy();
        _dmbTimer = null;
    }
}