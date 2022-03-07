const Gio = imports.gi.Gio;

function getSettings(schemaDir) {
  if (!Gio.File.new_for_path(schemaDir).query_exists(null)) {
    throw new Error("DMB Timer schema dir " + schemaDir + " not found.");
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