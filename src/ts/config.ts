// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import React from "react";
import { setLang } from "./i18n";

export interface ConfigSpec {
    [tabName: string]: {
        icon: string;

        items: {
            [settingName: string]: {
                type: "text" | "range" | "toggle" | "color" | "text_list" | "lang_list";
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
// default values
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
console.log("init'd config with default values", config);

export async function configSet(setting: string, value?: any) {
    config[setting] = value;

    // run hook
    const [tab, set] = setting.split(".");
    const hook = spec[tab].items[set].hook;
    if(hook) await hook(value);

    console.log("updated setting", setting, value);
}