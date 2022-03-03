const Gio = imports.gi.Gio;

function getSettings(schemaDir) {
  if (!Gio.File.new_for_path(schemaDir).query_exists(null)) {
    throw new Error("DND schema dir " + schemaDir + " not found.");
  }

  let GioSSS = Gio.SettingsSchemaSource;
  let schemaSrc = GioSSS.new_from_directory(
    schemaDir,
    GioSSS.get_default(),
    false,
  );

  let schema = "org.gnome.shell.extensions.dmb-timer@lgoldware";
  let schemaObj = schemaSrc.lookup(schema, true);
  if (!schemaObj) throw new Error("Schema " + schema + " not found.");

  return new Gio.Settings({ settings_schema: schemaObj });
}

function main() {
  let schemaDir = "./schemas";

  imports.searchPath.unshift(".");
  const execCmd = imports.pactl.execCmd;

  execCmd("glib-compile-schemas " + schemaDir);

  let settings = getSettings(schemaDir);

  let startDate = settings.get_int("start-date");
  log(`start-date: ${startDate}`);
  log(settings.path);
  log(settings.schema);
  log(settings.backend);
}

if (
  new Error().stack.split(/\r\n|\r|\n/g).filter(line => line.length > 0)
    .length == 1
) {
  main();
}
