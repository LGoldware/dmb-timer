# Demobilization Timer

Demobilization Timer is Gnome Shell Extension.

Simple timer until the day of the demobilisation.

![Demobilization Timer](https://github.com/LGoldware/dmb-timer/blob/master/screenshot.png?raw=true)

## Installation

1.  Install GNOME Shell integration for Chrome browser, https://wiki.gnome.org/Projects/GnomeShellIntegrationForChrome/Installation
2.  Open https://extensions.gnome.org/ in Chrome browser and search "Demobilization Timer"
3.  Install it, enable/disable at https://extensions.gnome.org/local/

## Install from scratch

To install, clone this repo, and enable it https://extensions.gnome.org/local/.

```shell
$ mkdir -p ~/.local/share/gnome-shell/extensions/dmb-timer
$ cd ~/.local/share/gnome-shell/extensions/dmb-timer
$ git clone https://github.com/LGoldware/dmb-timer.git .
```
To restart GNOME Shell, use "Alt+F2, r, Enter".

## Development

```shell
# compile gsettings' schema
$ glib-compile-schemas ./schemas/

# see gnome-shell logs
$ journalctl -f -o cat /usr/bin/gnome-shell

# see gnome-shell-extension-prefs logs
$ gnome-shell-extension-prefs

# package it
git archive --format=zip HEAD > ../dmb-timer.zip

# see commit id, written as "zip comment"
unzip -z ../dmb-timer.zip
```
