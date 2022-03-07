const Gtk = imports.gi.Gtk;

const Gettext = imports.gettext.domain("dmb-timer@lgoldware");
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
imports.searchPath.unshift(Me.path);

function init() {}

function buildPrefsWidget() {
  let notebook = new Gtk.Notebook();

  let frame = new Gtk.VBox({ border_width: 10, spacing: 6 });
  notebook.append_page(
    frame,
    new Gtk.Label({
      label: _("Settings"),
      use_markup: true,
    }),
  );

  let r_settings_vbox = new Gtk.HBox({
    margin_left: 20,
    margin_top: 10,
    spacing: 6,
  });
  
  frame.pack_start(r_settings_vbox, false, true, 0);

  let settings = imports.configuration.getSettings(
    Me.dir.get_child("schemas").get_path(),
  );

  function appendDate(calendar, date, label) {

    calendar.year = date.getFullYear();
    calendar.month = date.getMonth();
    calendar.day = date.getDate()

    let settings_vbox = new Gtk.VBox();
    settings_vbox.pack_start(
      new Gtk.Label({
        label: label,
        use_markup: true,
      }),
      false,
      false,
      0,
    );
    settings_vbox.pack_end(calendar, true, true, 10);
    r_settings_vbox.pack_start(settings_vbox, true, true, 0);
  }

  // dates
  let startDate, endDate;

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

  let startCalendar = new Gtk.Calendar();
  let endCalendar = new Gtk.Calendar();

  appendDate(startCalendar, startDate, _("Date of conscription"));
  appendDate(endCalendar, endDate, _("Date of demob"));

  startCalendar.connect("day-selected", function(k) {
    let date = new Date(k.year, k.month, k.day);
    settings.set_string("start-date", date.toISOString());
  });
  endCalendar.connect("day-selected", function(k) {
    let date = new Date(k.year, k.month, k.day);
    settings.set_string("end-date", date.toISOString());
  });

  // About
  {
    let frame = new Gtk.VBox({ border_width: 10 });

    notebook.append_page(
      frame,
      new Gtk.Label({
        label: _("About"),
        use_markup: true,
      }),
    );

    frame.pack_start(
      new Gtk.Label({
        label: `<b>Demobilization Timer</b>`,
        use_markup: true,
      }),
      true,
      true,
      0,
    );

    function appendLabel(text, margin) {
      frame.pack_start(
        new Gtk.Label({
          label: text,
          use_markup: true,
        }),
        false,
        false,
        margin,
      );
    }

    appendLabel(
      'Created by <a href="mailto:lexagoldware@live.ru">Aliaksei Golovnya</a> 2022 ©',
      0
    );
    appendLabel(
      '<a href="https://github.com/LGoldware/dmb-timer">Webpage</a>', 
      12
    );
    appendLabel(
      `<small>This program comes with absolutely no warranty.</small>`, 
      0
    );
    appendLabel(
      `<small>See the <a href="https://www.gnu.org/licenses/gpl-3.0.html">GNU General Public License, version 3 or later</a> for details.</small>`, 
      0
    );
  }

  notebook.show_all();
  return notebook;
}