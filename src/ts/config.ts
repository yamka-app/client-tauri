// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { appDir, sep as pathSep, BaseDirectory } from "@tauri-apps/api/path";

import { setLang } from "./i18n";
import { setTheme } from "./theme";

export interface ConfigSpec {
    [tabName: string]: {
        icon: string;

        items: {
            [settingName: string]: {
                type: "text" | "range" | "toggle" | "theme" | "color" | "text_list" | "lang_list";
                default: any;
                danger?: boolean;
                hook?: (value: any) => void | Promise<void>;
            }
        }
    }
}

export const spec: ConfigSpec = {
    "window": {
        icon: "window",
        items: {
            "blurIfUnfocused": {
                type: "toggle",
                default: false
            },
            "theme": {
                type: "theme",
                default: "dark",
                hook: async (theme: string) => await setTheme(theme)
            }
        }
    },
    "language": {
        "icon": "lang",
        items: {
            "language": {
                type: "lang_list",
                default: navigator.language.toLowerCase().replace("-", "_"),
                hook: async (lang: string) => await setLang(lang)
            }
        }
    },
    "connection": {
        icon: "connection",
        items: {
            "realm": {
                type: "text",
                default: "api.yamka.app",
                danger: true
            },
            "user": {
                type: "text_list",
                default: []
            }
        }
    }
};

export var config: { [name: string]: any } = {};

export async function set(setting: string, value?: any) {
    config[setting] = value;

    // run hook
    const [tab, set] = setting.split(".");
    const hook = spec[tab].items[set].hook;
    if(hook) await hook(value);

    console.log("updated setting", setting, value);
    save();
}

export async function save() {
    writeFile({
        contents: JSON.stringify(config),
        path: "config.json"
    }, { dir: BaseDirectory.Config });
    console.log("saved config");
}

export async function load() {
    try {
        const json = await readTextFile("config.json", { dir: BaseDirectory.Config });
        config = JSON.parse(json);
        runHooks();
        console.log("loaded config");
    } catch(ex) {
        console.warn("failed to load config, using default values");
        // set default values
        for(const tab in spec) {
            for(const set in spec[tab].items) {
                const item = spec[tab].items[set];
                const defaultVal = item.default;
                if(defaultVal !== undefined) {
                    config[`${tab}.${set}`] = defaultVal;
                    const hook = item.hook;
                    if(hook) hook(defaultVal);
                }
            }
        }
    }
}

function runHooks() {
    for(const tab in spec) {
        for(const set in spec[tab].items) {
            const item = spec[tab].items[set];
            const hook = item.hook;
            const key = `${tab}.${set}`;
            if(config[key] !== undefined && hook)
                hook(config[key]);
        }
    }
}